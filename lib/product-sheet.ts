import type { Product } from "./products";

export const productHeaders = ["ID", "Name", "Category", "Notes", "Full Price (MMK)", "5ml (MMK)", "10ml (MMK)", "30ml (MMK)", "50ml (MMK)", "Price Label", "Image URL", "Tint", "Popular", "Active"];

// Reject the entire snapshot on invalid input; never publish a partial catalog.
export function parseProductSheet(rows: unknown[][]): Product[] {
  const headers = (rows[0] ?? []).map((value) => String(value).trim());
  if (productHeaders.some((header) => headers.filter((v) => v === header).length !== 1))
    throw new Error("Products headers are missing or duplicated.");
  const seen = new Set<string>();
  return rows.slice(1).flatMap((row, index) => {
    // Google creates FALSE cells when checkbox validation is applied to empty rows.
    if (row.every((value, column) => value === "" || value == null ||
      (["Popular", "Active"].includes(headers[column]) && value === false))) return [];
    const field = (name: string) => String(row[headers.indexOf(name)] ?? "").trim();
    const invalid = (name: string): never => { throw new Error(`Products row ${index + 2}: invalid ${name}.`); };
    const flag = (name: string) => {
      const value = field(name).toLowerCase();
      if (value !== "true" && value !== "false") return invalid(name);
      return value === "true";
    };
    const id = field("ID");
    if (!/^[a-zA-Z0-9_-]+$/.test(id) || seen.has(id)) invalid("ID (must be unique)");
    seen.add(id);
    if (!flag("Active")) return [];
    const price = (name: string) => {
      const value = field(name);
      const number = Number(value);
      if (!value || !Number.isSafeInteger(number) || number <= 0 || number > 1_000_000_000) return invalid(name);
      return number;
    };
    const family = field("Category");
    if (family !== "Men's" && family !== "Women's" && family !== "Unisex") return invalid("Category");
    const name = field("Name");
    if (!name) invalid("Name");
    const image = field("Image URL");
    const checkImage = (url: string, column: string) => {
      if (/^\/(?![\/\\])/.test(url)) return;
      try { if (new URL(url).protocol !== "https:") invalid(column); }
      catch { invalid(column); }
    };
    checkImage(image, "Image URL");
    if (headers.filter((header) => header === "Detail Image URLs").length > 1) invalid("Detail Image URLs header");
    const detailImages = field("Detail Image URLs").split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
    detailImages.forEach((url) => checkImage(url, "Detail Image URLs"));
    const tint = field("Tint") || "#eee5f1";
    if (!/^#[0-9a-f]{6}$/i.test(tint)) invalid("Tint");
    return [{ id, name, family, notes: field("Notes"), price: price("Full Price (MMK)"),
      sizePrices: { "5ml": price("5ml (MMK)"), "10ml": price("10ml (MMK)"), "30ml": price("30ml (MMK)"), "50ml": price("50ml (MMK)") },
      priceLabel: field("Price Label") || undefined, image, detailImages, tint, popular: flag("Popular") }];
  });
}
