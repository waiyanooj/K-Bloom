import type { Product } from "./products";

export const productSizes = ["50ml", "30ml", "10ml", "5ml", "full"] as const;
export type ProductSize = (typeof productSizes)[number];

// Transcribed from public/img/product-details. Columns: 5ml, 10ml, 30ml, 50ml.
const decantPrices: Record<string, readonly [number, number, number, number]> = {
  "8321": [35000, 62000, 175000, 300000],
  "8322": [30000, 59000, 172000, 290000],
  "8323": [22000, 40000, 110000, 170000],
  "8324": [18500, 30000, 75000, 120000],
  "8325": [35000, 62000, 179000, 285000],
  "8326": [22000, 40000, 110000, 170000],
  "8327": [11000, 22000, 59000, 80000],
  "8328": [12000, 23000, 60000, 81000],
  "8329": [25000, 42000, 115000, 200000],
  "8330": [18500, 32000, 90000, 145000],
  "8331": [18000, 35000, 95000, 165000],
  "8332": [17500, 31000, 88000, 140000],
  "8333": [12000, 22000, 58000, 100000],
  "8334": [10000, 17000, 48000, 79000],
  "8335": [25000, 42000, 115000, 200000],
  "8336": [21000, 38000, 105000, 180000],
  "8337": [40000, 65000, 185000, 315000],
  "8338": [35000, 55000, 155000, 250000],
  "8339": [17000, 30000, 82000, 130000],
  "8340": [10000, 17000, 48000, 79000],
  "8341": [16000, 29000, 86000, 135000],
  "8342": [18000, 30000, 87000, 140000],
  "8343": [18500, 33000, 91000, 145000],
  "8344": [17500, 30000, 89000, 140000],
  "8345": [10000, 17000, 45000, 79000],
  "8346": [20000, 38000, 108000, 175000],
  "8347": [23000, 40000, 115000, 189000],
  "8348": [18500, 36000, 99000, 170000],
  "8349": [35000, 60000, 170000, 290000],
  "8350": [32000, 50000, 140000, 235000],
  "8351": [38000, 62000, 177000, 290000],
  "8352": [35000, 60000, 170000, 290000],
};

export function isProductSize(value: string): value is ProductSize {
  return productSizes.some((size) => size === value);
}

export function sizeLabel(product: Product, size: ProductSize): string {
  return size === "full" ? product.priceLabel ?? "Full size" : size;
}

export function sizePrice(product: Product, size: ProductSize): number {
  if (size === "full") return product.price;
  if (product.sizePrices) return product.sizePrices[size];
  const column = { "5ml": 0, "10ml": 1, "30ml": 2, "50ml": 3 } as const;
  return decantPrices[product.id][column[size]];
}
