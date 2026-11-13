import "server-only";
import { sheets } from "googleapis/build/src/apis/sheets";
import { JWT } from "google-auth-library";
import { parseProductSheet } from "./product-sheet";
import type { Product } from "./products";

let cached: { products: Product[]; checkedAt: number } | undefined;
let pending: Promise<Product[]> | undefined;

export async function getProducts(fresh = false): Promise<Product[]> {
  if (!fresh && cached && Date.now() - cached.checkedAt < 30_000)
    return cached.products;
  if (!fresh && pending) return pending;
  const read = async () => {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const email = process.env.GOOGLE_CLIENT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY;
    if (!spreadsheetId || !email || !key)
      throw new Error("Missing Sheets configuration");
    const auth = new JWT({
      email,
      key: key.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const api = sheets({ version: "v4", auth });
    const response = await api.spreadsheets.values.get(
      {
        spreadsheetId,
        range: "'Products'!A:P",
        valueRenderOption: "UNFORMATTED_VALUE",
      },
      { timeout: 15000, retry: false },
    );
    const products = parseProductSheet(response.data.values ?? []);
    cached = { products, checkedAt: Date.now() };
    return products;
  };
  if (fresh) return read();
  pending = read();
  try {
    return await pending;
  } finally {
    pending = undefined;
  }
}
