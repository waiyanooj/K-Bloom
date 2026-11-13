// Add promotion fields without rewriting product prices or historical orders.
require("@next/env").loadEnvConfig(process.cwd());
const { google } = require("googleapis");
const api = google.sheets({ version: "v4", auth: new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
}) });
const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const options = { timeout: 20000, retry: false };
async function main() {
  const metadata = (await api.spreadsheets.get({ spreadsheetId, fields: "sheets.properties" }, options)).data;
  const requests = [];
  const orderSheet = metadata.sheets.find(s => s.properties.title === "Order")?.properties;
  if (!orderSheet) throw new Error("Order tab missing");
  const orderValues = (await api.spreadsheets.values.get({ spreadsheetId, range: "'Order'", valueRenderOption: "UNFORMATTED_VALUE" }, options)).data.values ?? [];
  const headers = orderValues[0] ?? [];
  const sheetId = orderSheet.sheetId;
  let migrated = false;
  if (headers[9] === "Quantity" && headers[10] === "Promotion" && headers[11] === "Total" && headers[12] === "Status") {
    // Already migrated. Never recreate the removed Promotion Price column.
  } else if (headers[9] === "Quantity" && headers[10] === "Total" && headers[11] === "Status" && headers[12] === "Promotion" && headers[13] === "Promotion Price (MMK)") {
    requests.push({ deleteDimension: { range: { sheetId, dimension: "COLUMNS", startIndex: 13, endIndex: 14 } } });
    requests.push({ moveDimension: { source: { sheetId, dimension: "COLUMNS", startIndex: 12, endIndex: 13 }, destinationIndex: 10 } });
    migrated = true;
  } else {
    throw new Error("Unexpected Order columns; refusing to move or delete unrelated data");
  }
  for (const [title, start, labels, headerRows] of [
    ["Products", 15, ["Promotion"], 1],
  ]) {
    const sheet = metadata.sheets.find(s => s.properties.title === title)?.properties;
    if (!sheet) throw new Error(`${title} tab missing`);
    const values = (await api.spreadsheets.values.get({ spreadsheetId, range: `'${title}'`, valueRenderOption: "UNFORMATTED_VALUE" }, options)).data.values ?? [];
    if (title === "Order") console.log(JSON.stringify({ orderPriceHeaders: values.slice(0, 2).map(r => r.slice(8, 12)) }));
    for (let i = 0; i < labels.length; i++) {
      const column = start + i;
      if (values[0]?.[column] !== labels[i] && values.some(r => r[column] !== undefined && r[column] !== ""))
        throw new Error(`${title} target column ${column + 1} is already in use`);
    }
    if (sheet.gridProperties.columnCount < start + labels.length)
      requests.push({ appendDimension: { sheetId: sheet.sheetId, dimension: "COLUMNS", length: start + labels.length - sheet.gridProperties.columnCount } });
    const range = { sheetId: sheet.sheetId, startColumnIndex: start, endColumnIndex: start + labels.length };
    requests.push({ updateCells: { start: { sheetId: sheet.sheetId, rowIndex: 0, columnIndex: start }, rows: [{ values: labels.map(stringValue => ({ userEnteredValue: { stringValue } })) }], fields: "userEnteredValue" } });
    requests.push({ copyPaste: { source: { sheetId: sheet.sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: title === "Products" ? 4 : 8, endColumnIndex: title === "Products" ? 5 : 9 }, destination: { ...range, startRowIndex: 0, endRowIndex: headerRows }, pasteType: "PASTE_FORMAT" } });
    requests.push({ updateDimensionProperties: { range: { sheetId: sheet.sheetId, dimension: "COLUMNS", startIndex: start, endIndex: start + labels.length }, properties: { pixelSize: 190 }, fields: "pixelSize" } });
    requests.push({ repeatCell: { range: { ...range, startRowIndex: headerRows, endColumnIndex: start + 1 }, cell: { userEnteredFormat: { numberFormat: { type: "PERCENT", pattern: "0.##%" } } }, fields: "userEnteredFormat.numberFormat" } });
    if (title === "Products") {
      requests.push({ setDataValidation: { range: { ...range, startRowIndex: 1 }, rule: { condition: { type: "NUMBER_BETWEEN", values: [{ userEnteredValue: "0" }, { userEnteredValue: "1" }] }, strict: true, inputMessage: "Enter 10% for ten percent off. Blank or 0% means no promotion." } } });
    } else {
      requests.push({ repeatCell: { range: { ...range, startRowIndex: 2, startColumnIndex: 13 }, cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "#,##0" } } }, fields: "userEnteredFormat.numberFormat" } });
    }
  }
  if (!process.argv.includes("--apply")) { console.log("Inspection passed. Use --apply to add promotion columns."); return; }
  await api.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } }, options);
  const check = (await api.spreadsheets.values.batchGet({ spreadsheetId, ranges: ["'Products'!P1", "'Order'"], valueRenderOption: "UNFORMATTED_VALUE" }, options)).data.valueRanges;
  const actual = check[1].values ?? [];
  if (check[0].values?.[0]?.[0] !== "Promotion" || JSON.stringify(actual[0]?.slice(9, 13)) !== JSON.stringify(["Quantity", "Promotion", "Total", "Status"])) throw new Error("Header verification failed");
  // Compare every retained cell without printing customer information.
  const expected = orderValues.map(row => {
    const cells = [...row];
    if (migrated) { cells.splice(13, 1); const promotion = cells.splice(12, 1)[0] ?? ""; cells.splice(10, 0, promotion); }
    return cells;
  });
  for (let r = 2; r < Math.max(expected.length, actual.length); r++)
    for (let c = 0; c < Math.max(expected[r]?.length ?? 0, actual[r]?.length ?? 0); c++)
      if ((expected[r]?.[c] ?? "") !== (actual[r]?.[c] ?? "")) throw new Error(`Retained value verification failed at row ${r + 1}, column ${c + 1}`);
  console.log("Verified: Quantity (J), Promotion (K), Total (L), Status (M). Promotion Price removed; all retained order values preserved.");
}
main().catch(error => { console.error("Promotion setup failed:", error.response?.status || error.code || error.message); process.exitCode = 1; });
