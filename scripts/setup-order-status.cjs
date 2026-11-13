// Run once to configure the existing Order sheet; safe to rerun.
require("@next/env").loadEnvConfig(process.cwd());
const { google } = require("googleapis");
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const api = google.sheets({ version: "v4", auth });
const spreadsheetId = process.env.GOOGLE_SHEET_ID;
async function main() {
  const response = await api.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties,merges,conditionalFormats)",
  });
  const sheet = response.data.sheets.find(
    (s) => s.properties.title === "Order",
  );
  if (!sheet) throw new Error("Order tab missing");
  const sheetId = sheet.properties.sheetId;
  if (process.argv.includes("--inspect"))
    console.log(JSON.stringify(sheet.conditionalFormats));
  const values =
    (
      await api.spreadsheets.values.get({
        spreadsheetId,
        range: "'Order'!A1:M",
      })
    ).data.values || [];
  if (values[0]?.[12] && values[0][12] !== "Status")
    throw new Error("Column M is already in use");
  if (values[1]?.[12]) throw new Error("M2 is already in use");
  const unknownStatus = values
    .slice(2)
    .some((row) => row[12] && !["Pending", "Accept"].includes(row[12]));
  if (unknownStatus) throw new Error("Existing status values need review");
  console.log(
    JSON.stringify({
      tab: "Order",
      header: values[0],
      existingOrders: values.slice(2).filter((r) => r[0]).length,
      statusRules: (sheet.conditionalFormats || []).length,
      apply: process.argv.includes("--apply"),
    }),
  );
  if (!process.argv.includes("--apply")) return;
  const range = {
    sheetId,
    startRowIndex: 2,
    startColumnIndex: 0,
    endColumnIndex: 13,
  };
  const formulas = [
    '=AND($A3<>"",$M3="Pending")',
    '=AND($A3<>"",$M3="Accept")',
  ];
  const requests = [];
  const statusHeader = {
    sheetId,
    startRowIndex: 0,
    endRowIndex: 2,
    startColumnIndex: 12,
    endColumnIndex: 13,
  };
  const overlapping = (sheet.merges || []).filter(
    (m) =>
      (m.startRowIndex || 0) < 2 &&
      m.endRowIndex > 0 &&
      (m.startColumnIndex || 0) < 13 &&
      m.endColumnIndex > 12,
  );
  if (
    overlapping.some(
      (m) =>
        JSON.stringify(m) !== JSON.stringify(statusHeader) &&
        !(
          m.startRowIndex === 0 &&
          m.endRowIndex === 2 &&
          m.startColumnIndex === 12 &&
          m.endColumnIndex === 13
        ),
    )
  )
    throw new Error("Status header overlaps an existing merge");
  requests.push({
    copyPaste: {
      source: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 2,
        startColumnIndex: 11,
        endColumnIndex: 12,
      },
      destination: statusHeader,
      pasteType: "PASTE_FORMAT",
    },
  });
  if (!overlapping.length)
    requests.push({
      mergeCells: { range: statusHeader, mergeType: "MERGE_ALL" },
    });
  requests.push({
    updateCells: {
      start: { sheetId, rowIndex: 0, columnIndex: 12 },
      rows: [{ values: [{ userEnteredValue: { stringValue: "Status" } }] }],
      fields: "userEnteredValue",
    },
  });
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: 12, endIndex: 13 },
      properties: { pixelSize: 130 },
      fields: "pixelSize",
    },
  });
  requests.push({
    setDataValidation: { range: { ...range, startColumnIndex: 12 } },
  });
  values.slice(2).forEach((row, index) => {
    if (row[0])
      requests.push({
        setDataValidation: {
          range: {
            ...range,
            startRowIndex: index + 2,
            endRowIndex: index + 3,
            startColumnIndex: 12,
          },
          rule: {
            condition: {
              type: "ONE_OF_LIST",
              values: [
                { userEnteredValue: "Pending" },
                { userEnteredValue: "Accept" },
              ],
            },
            strict: true,
            showCustomUi: true,
          },
        },
      });
  });
  // Replace only rules owned by this setup; preserve all unrelated formatting.
  (sheet.conditionalFormats || [])
    .map((rule, index) => ({ rule, index }))
    .reverse()
    .forEach(({ rule, index }) => {
      if (
        formulas.includes(
          rule.booleanRule?.condition?.values?.[0]?.userEnteredValue,
        )
      )
        requests.push({ deleteConditionalFormatRule: { sheetId, index } });
    });
  const colors = [
    { red: 1, green: 0.8, blue: 0.6 },
    { red: 175 / 255, green: 209 / 255, blue: 1 },
  ];
  formulas.forEach((formula, index) =>
    requests.push({
      addConditionalFormatRule: {
        index,
        rule: {
          ranges: [range],
          booleanRule: {
            condition: {
              type: "CUSTOM_FORMULA",
              values: [{ userEnteredValue: formula }],
            },
            format: {
              backgroundColor: colors[index],
              textFormat: { foregroundColor: { red: 0, green: 0, blue: 0 } },
            },
          },
        },
      },
    }),
  );
  values.slice(2).forEach((row, index) => {
    if (row[0] && !row[12])
      requests.push({
        updateCells: {
          start: { sheetId, rowIndex: index + 2, columnIndex: 12 },
          rows: [
            { values: [{ userEnteredValue: { stringValue: "Pending" } }] },
          ],
          fields: "userEnteredValue",
        },
      });
  });
  await api.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });
  const check = (
    await api.spreadsheets.get({
      spreadsheetId,
      ranges: ["'Order'!M1:M"],
      fields:
        "sheets(conditionalFormats,data(rowData(values(userEnteredValue,dataValidation))))",
    })
  ).data;
  const rules = check.sheets[0].conditionalFormats || [];
  if (
    !formulas.every((f, i) =>
      rules.some(
        (r) =>
          r.booleanRule?.condition?.values?.[0]?.userEnteredValue === f &&
          r.booleanRule.format.textFormat?.foregroundColor != null &&
          ["red", "green", "blue"].every(
            (channel) =>
              (r.booleanRule.format.textFormat.foregroundColor[channel] ??
                0) === 0,
          ) &&
          Object.entries(colors[i]).every(
            ([key, value]) =>
              Math.abs(r.booleanRule.format.backgroundColor[key] - value) <
              0.001,
          ),
      ),
    )
  )
    throw new Error("Formatting verification failed");
  const cells = check.sheets[0].data[0].rowData;
  if (cells[0].values[0].userEnteredValue.stringValue !== "Status")
    throw new Error("Header verification failed");
  for (
    let index = 2;
    index < sheet.properties.gridProperties.rowCount;
    index++
  ) {
    const validation = cells[index]?.values?.[0]?.dataValidation;
    if (
      values[index]?.[0]
        ? validation?.condition?.values?.length !== 2
        : !!validation
    )
      throw new Error("Dropdown verification failed");
  }
  console.log(
    "Verified: dropdowns only on populated rows, Pending orange, Accept blue.",
  );
}
main().catch((error) => {
  console.error(
    "Status setup failed:",
    error.response?.status || error.code || error.message,
  );
  process.exitCode = 1;
});
