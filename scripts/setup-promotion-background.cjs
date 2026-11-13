require("@next/env").loadEnvConfig(process.cwd());
const { google } = require("googleapis");
const api = google.sheets({ version: "v4", auth: new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
}) });
const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const options = { timeout: 20000, retry: false };
async function read() {
  return (await api.spreadsheets.get({ spreadsheetId, ranges: ["'Order'!J:L"],
    fields: "sheets(properties,conditionalFormats,data(startRow,startColumn,rowData(values(userEnteredFormat,effectiveFormat))))",
  }, options)).data.sheets[0];
}
async function main() {
  const headers = (await api.spreadsheets.values.get({ spreadsheetId, range: "'Order'!J1:M1" }, options)).data.values?.[0];
  if (JSON.stringify(headers) !== JSON.stringify(["Quantity", "Promotion", "Total", "Status"])) throw new Error("Unexpected column layout");
  const before = await read();
  const sheetId = before.properties.sheetId;
  const rows = before.data[0].rowData ?? [];
  const background = cell => cell?.userEnteredFormat?.backgroundColorStyle
    ? { backgroundColorStyle: cell.userEnteredFormat.backgroundColorStyle }
    : cell?.userEnteredFormat?.backgroundColor ? { backgroundColor: cell.userEnteredFormat.backgroundColor } : {};
  const requests = [{ updateCells: {
    range: { sheetId, startRowIndex: 0, endRowIndex: before.properties.gridProperties.rowCount, startColumnIndex: 10, endColumnIndex: 11 },
    rows: rows.map(row => ({ values: [{ userEnteredFormat: background(row.values?.[0]) }] })),
    fields: "userEnteredFormat.backgroundColor,userEnteredFormat.backgroundColorStyle",
  } }];
  let updatedRules = 0;
  (before.conditionalFormats ?? []).forEach((rule, index) => {
    const formula = rule.booleanRule?.condition?.values?.[0]?.userEnteredValue ?? "";
    if (!formula.includes('$M3=') || !/Pending|Accept/.test(formula)) return;
    // Include the inserted promotion column in the existing status color rules.
    requests.push({ updateConditionalFormatRule: { sheetId, index, rule: {
      ...rule, ranges: [{ sheetId, startRowIndex: 2, startColumnIndex: 0, endColumnIndex: 13 }],
    } } });
    updatedRules++;
  });
  console.log(JSON.stringify({ statusRules: updatedRules, headerBackground: background(rows[0]?.values?.[0]), apply: process.argv.includes("--apply") }));
  if (!process.argv.includes("--apply")) return;
  await api.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } }, options);
  const after = await read();
  for (const [index, row] of (after.data[0].rowData ?? []).entries()) {
    const colors = [0, 1].map(i => row.values?.[i]?.effectiveFormat?.backgroundColor ?? { red: 1, green: 1, blue: 1 });
    for (const channel of ["red", "green", "blue"])
      if (Math.abs((colors[0][channel] ?? 0) - (colors[1][channel] ?? 0)) > 0.001) throw new Error(`Background verification failed at row ${index + 1}: ${JSON.stringify(colors)}`);
  }
  console.log("Verified: Promotion header and row backgrounds match Quantity, including status colors. Values and number formats unchanged.");
}
main().catch(error => { console.error("Background setup failed:", error.response?.status || error.code || error.message); process.exitCode = 1; });
