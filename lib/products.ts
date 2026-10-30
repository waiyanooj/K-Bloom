export interface Product {
  id: string;
  name: string;
  family: "Floral" | "Citrus" | "Woody" | "Fresh" | "Amber";
  notes: string;
  price: number;
  tint: string;
  popular: boolean;
}

export const products: Product[] = [
  {
    id: "rose",
    name: "Rose Reverie",
    family: "Floral",
    notes: "Rose · Peony · Soft musk",
    price: 45000,
    tint: "#f5e3e7",
    popular: true,
  },
  {
    id: "citrus",
    name: "Citrus Muse",
    family: "Citrus",
    notes: "Bergamot · Neroli · Lemon",
    price: 39000,
    tint: "#f7efd9",
    popular: true,
  },
  {
    id: "woody",
    name: "Velvet Woods",
    family: "Woody",
    notes: "Sandalwood · Cedar · Vetiver",
    price: 58000,
    tint: "#eee5dc",
    popular: false,
  },
  {
    id: "fresh",
    name: "Morning Dew",
    family: "Fresh",
    notes: "Green tea · Aqua · White musk",
    price: 42000,
    tint: "#e4efeb",
    popular: true,
  },
  {
    id: "amber",
    name: "Amber Hours",
    family: "Amber",
    notes: "Amber · Vanilla · Warm spice",
    price: 52000,
    tint: "#f5e8d8",
    popular: true,
  },
  {
    id: "floral",
    name: "Violet Bloom",
    family: "Floral",
    notes: "Violet · Iris · Jasmine",
    price: 48000,
    tint: "#eee5f1",
    popular: false,
  },
];
export const categories = [
  "Popular Products",
  "Floral",
  "Citrus",
  "Woody",
  "Fresh",
  "Amber",
];
