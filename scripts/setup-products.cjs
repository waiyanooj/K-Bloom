// Create and seed Products once. Existing populated tabs are never overwritten.
require("@next/env").loadEnvConfig(process.cwd());
const fs = require("node:fs");
const { stripTypeScriptTypes } = require("node:module");
const { sheets } = require("googleapis/build/src/apis/sheets");
const { JWT } = require("google-auth-library");
function loadTs(file) {
  const compiled = stripTypeScriptTypes(fs.readFileSync(file, "utf8"));
  return import("data:text/javascript;base64," + Buffer.from(compiled).toString("base64"));
}
const auth = new JWT({ email: process.env.GOOGLE_CLIENT_EMAIL, key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"), scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
const api = sheets({ version: "v4", auth });
const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const options = { timeout: 20000, retry: false };
async function main() {
  const { products } = await loadTs("lib/products.ts");
  const { sizePrice } = await loadTs("lib/product-sizes.ts");
  const { productDetails } = await loadTs("lib/product-details.ts");
  const { productHeaders, parseProductSheet } = await loadTs("lib/product-sheet.ts");
  const metadata = await api.spreadsheets.get({ spreadsheetId, fields: "sheets.properties" }, options);
  let sheet = metadata.data.sheets.find((s) => s.properties.title === "Products");
  if (!sheet) {
    if (process.argv.includes("--verify")) throw new Error("Products tab missing");
    const created = await api.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: [{ addSheet: { properties: { title: "Products", gridProperties: { rowCount: 1000, columnCount: 15, frozenRowCount: 1, frozenColumnCount: 2 } } } }] } }, options);
    sheet = created.data.replies[0].addSheet;
  }
  const sheetId = sheet.properties.sheetId;
  if (sheet.properties.gridProperties.columnCount < 15 && !process.argv.includes("--verify") && !process.argv.includes("--inspect")) {
    await api.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: [{ appendDimension: { sheetId, dimension: "COLUMNS", length: 15 - sheet.properties.gridProperties.columnCount } }] } }, options);
  }
  const range = "'Products'!A:O";
  const existing = await api.spreadsheets.values.get({ spreadsheetId, range, valueRenderOption: "UNFORMATTED_VALUE" }, options);
  const values = existing.data.values ?? [];
  if (process.argv.includes("--inspect")) {
    console.log(JSON.stringify({ detailColumnSample: values.slice(0, 5).map((row) => row[14]), detailColumnValues: [...new Set(values.slice(1).map((row) => row[14]))].slice(0, 8) }));
    console.log(JSON.stringify({ headers: values[0], rows: values.slice(1).map((row, i) => ({ row: i + 2, id: row[0], name: row[1], active: row[13] })).filter((row) => row.id || row.name) }));
    return;
  }
  if (!values.length && !process.argv.includes("--verify")) {
    const rows = [[...productHeaders, "Detail Image URLs"], ...products.map((p) => [p.id, p.name.trim(), p.family, p.notes.trim(), p.price, ...["5ml", "10ml", "30ml", "50ml"].map((size) => sizePrice(p, size)), p.priceLabel ?? "", p.image, p.tint, p.popular, true, (productDetails[p.id] ?? []).join("\n")])];
    parseProductSheet(rows);
    // RAW preserves IDs and treats descriptions as text, never as formulas.
    await api.spreadsheets.values.update({ spreadsheetId, range: "'Products'!A1:O" + rows.length, valueInputOption: "RAW", requestBody: { values: rows } }, options);
  }
  if (values.length && !process.argv.includes("--verify") && values[0][14] !== "Detail Image URLs") {
    // Appending after Active inherits unchecked checkbox cells from Google Sheets.
    if (values.some((row) => row[14] != null && row[14] !== "" && row[14] !== false)) throw new Error("Column O is already in use; no data was overwritten.");
    const idColumn = values[0].indexOf("ID");
    if (idColumn < 0) throw new Error("ID column missing");
    await api.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: [{ setDataValidation: { range: { sheetId, startColumnIndex: 14, endColumnIndex: 15 } } }] } }, options);
    await api.spreadsheets.values.update({ spreadsheetId, range: "'Products'!O1:O" + values.length, valueInputOption: "RAW", requestBody: { values: [["Detail Image URLs"], ...values.slice(1).map((row) => [(productDetails[String(row[idColumn]).trim()] ?? []).join("\n")])] } }, options);
  }
  if (!process.argv.includes("--verify")) {
    const dataRange = { sheetId, startRowIndex: 1, endRowIndex: 1000 };
    await api.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: [
      { updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1, frozenColumnCount: 2 } }, fields: "gridProperties.frozenRowCount,gridProperties.frozenColumnCount" } },
      { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1 }, cell: { userEnteredFormat: { backgroundColor: { red: 0.28, green: 0.16, blue: 0.23 }, textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }, wrapStrategy: "WRAP" } }, fields: "userEnteredFormat" } },
      { repeatCell: { range: { ...dataRange, startColumnIndex: 4, endColumnIndex: 9 }, cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "#,##0" } } }, fields: "userEnteredFormat.numberFormat" } },
      { repeatCell: { range: { ...dataRange, startColumnIndex: 0, endColumnIndex: 1 }, cell: { userEnteredFormat: { numberFormat: { type: "TEXT" } } }, fields: "userEnteredFormat.numberFormat" } },
      { setBasicFilter: { filter: { range: { sheetId, startRowIndex: 0, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 15 } } } },
      { setDataValidation: { range: { ...dataRange, startColumnIndex: 2, endColumnIndex: 3 }, rule: { condition: { type: "ONE_OF_LIST", values: ["Men's", "Women's", "Unisex"].map((userEnteredValue) => ({ userEnteredValue })) }, strict: true, showCustomUi: true } } },
      { setDataValidation: { range: { ...dataRange, startColumnIndex: 12, endColumnIndex: 14 }, rule: { condition: { type: "BOOLEAN" }, strict: true, showCustomUi: true } } },
      { setDataValidation: { range: { ...dataRange, startColumnIndex: 4, endColumnIndex: 9 }, rule: { condition: { type: "NUMBER_GREATER", values: [{ userEnteredValue: "0" }] }, strict: true } } },
      ...[[0, 1, 90], [1, 2, 340], [2, 3, 120], [3, 4, 500], [4, 9, 155], [9, 10, 230], [10, 11, 380], [11, 14, 110], [14, 15, 500]].map(([startIndex, endIndex, pixelSize]) => ({ updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex, endIndex }, properties: { pixelSize }, fields: "pixelSize" } })),
      { repeatCell: { range: { ...dataRange, startColumnIndex: 0, endColumnIndex: 15 }, cell: { userEnteredFormat: { wrapStrategy: "WRAP", verticalAlignment: "MIDDLE" } }, fields: "userEnteredFormat.wrapStrategy,userEnteredFormat.verticalAlignment" } },
    ] } }, options);
  }
  const verified = await api.spreadsheets.values.get({ spreadsheetId, range, valueRenderOption: "UNFORMATTED_VALUE" }, options);
  const catalog = parseProductSheet(verified.data.values ?? []);
  console.log(JSON.stringify({ activeProducts: catalog.length, detailImages: catalog.reduce((sum, p) => sum + (p.detailImages?.length ?? 0), 0), firstProduct: catalog[0]?.name, lastProduct: catalog.at(-1)?.name, url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}` }));
}
main().catch((error) => { console.error("Products setup failed:", error.code ?? "", error.response?.status ?? "", error.message?.split("\n")[0]); process.exitCode = 1; });
