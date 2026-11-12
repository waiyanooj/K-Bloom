import { NextResponse } from "next/server";
import { sheets } from "googleapis/build/src/apis/sheets";
import { JWT } from "google-auth-library";
import { InvalidOrder, orderRows, parseOrder } from "../../../lib/orders";
import { getProducts } from "../../../lib/product-source";

export const runtime = "nodejs";
const pending = new Map<string, Promise<void>>();

async function saveOrder(order: ReturnType<typeof parseOrder>) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  if (!spreadsheetId || !email || !key)
    throw new Error("Missing Sheets configuration");
  const auth = new JWT({
    email,
    key: key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const api = sheets({ version: "v4", auth });
  const range = "'Order'!A3:L";
  // Reuse the customer's reference when retrying after an interrupted response.
  const existing = await api.spreadsheets.values.get(
    { spreadsheetId, range: "'Order'!A3:A" },
    { timeout: 15000 },
  );
  const metadata = await api.spreadsheets.get({ spreadsheetId, fields: "sheets.properties" }, { timeout: 15000 });
  const sheetId = metadata.data.sheets?.find((sheet) => sheet.properties?.title === "Order")?.properties?.sheetId;
  if (sheetId == null) throw new Error("Order sheet missing");
  async function addDropdowns(rowIndexes: number[]) {
    const border = { style: "SOLID", color: { red: 0.65, green: 0.6, blue: 0.63 } };
    await api.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: [...rowIndexes.map((rowIndex) => ({
      setDataValidation: {
        range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 11, endColumnIndex: 12 },
        rule: { condition: { type: "ONE_OF_LIST", values: [{ userEnteredValue: "Pending" }, { userEnteredValue: "Accept" }] }, strict: true, showCustomUi: true },
      },
    })), ...rowIndexes.map((rowIndex) => ({
      updateBorders: {
        range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 0, endColumnIndex: 12 },
        top: border, bottom: border, left: border, right: border, innerVertical: border,
      },
    }))] } }, { timeout: 15000 });
  }
  const savedRows = (existing.data.values ?? []).flatMap((row, index) => row[0] === order.orderId ? [index + 2] : []);
  if (savedRows.length) {
    // Repair dropdowns if a previous append succeeded but formatting was interrupted.
    await addDropdowns(savedRows);
    return;
  }
  const appended = await api.spreadsheets.values.append(
    {
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: orderRows(order) },
    },
    { timeout: 20000, retry: false },
  );
  const writtenRange = appended.data.updates?.updatedRange?.match(/!A(\d+):L(\d+)$/);
  if (!writtenRange) throw new Error("Missing appended row range");
  const firstRow = Number(writtenRange[1]) - 1;
  const endRow = Number(writtenRange[2]);
  await addDropdowns(Array.from({ length: endRow - firstRow }, (_, index) => firstRow + index));
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  try {
    const text = await request.text();
    if (text.length > 32000)
      return NextResponse.json(
        { error: "Order is too large." },
        { status: 413 },
      );
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      throw new InvalidOrder("Invalid order data.");
    }
    const order = parseOrder(value, await getProducts(true));
    let operation = pending.get(order.orderId);
    if (!operation) {
      operation = saveOrder(order);
      pending.set(order.orderId, operation);
    }
    try {
      await operation;
    } finally {
      pending.delete(order.orderId);
    }
    return NextResponse.json({ orderId: order.orderId });
  } catch (error) {
    if (error instanceof InvalidOrder)
      return NextResponse.json({ error: error.message }, { status: 400 });
    // Do not send credentials, Google responses or customer details to the browser/logs.
    return NextResponse.json(
      {
        error:
          "We could not confirm your order. Please retry with the same details.",
      },
      { status: 503 },
    );
  }
}
