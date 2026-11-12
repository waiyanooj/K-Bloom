// Add borders to existing order rows without changing status colors or values.
require('@next/env').loadEnvConfig(process.cwd());
const { google } = require('googleapis');
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const api = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEET_ID;
async function main() {
  const metadata = await api.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties' });
  const sheetId = metadata.data.sheets.find(s => s.properties.title === 'Order')?.properties.sheetId;
  if (sheetId == null) throw new Error('Order tab missing');
  const rows = (await api.spreadsheets.values.get({ spreadsheetId, range: "'Order'!A3:A" })).data.values || [];
  const border = { style: 'SOLID', color: { red: 0.65, green: 0.6, blue: 0.63 } };
  const ranges = [{ sheetId, startRowIndex: 0, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: 12 }];
  rows.forEach((row, index) => { if (row[0]) ranges.push({ sheetId, startRowIndex: index + 2, endRowIndex: index + 3, startColumnIndex: 0, endColumnIndex: 12 }); });
  await api.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: ranges.map(range => ({
    updateBorders: { range, top: border, bottom: border, left: border, right: border, innerVertical: border },
  })) } });
  const checks = (await api.spreadsheets.get({ spreadsheetId,
    ranges: ranges.slice(1).map(r => `'Order'!A${r.startRowIndex + 1}:L${r.endRowIndex}`),
    fields: 'sheets(data(rowData(values(userEnteredFormat(borders)))))',
  })).data;
  for (const block of checks.sheets[0].data || []) for (const row of block.rowData || []) for (const cell of row.values || []) {
    for (const side of ['top', 'bottom', 'left', 'right']) {
      if (cell.userEnteredFormat?.borders?.[side]?.style !== 'SOLID') throw new Error('Border verification failed');
    }
  }
  console.log(`Verified borders on header and ${ranges.length - 1} populated order rows.`);
}
main().catch(error => { console.error('Border setup failed:', error.response?.status || error.code || error.message); process.exitCode = 1; });
