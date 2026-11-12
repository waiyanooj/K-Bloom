import { NextResponse } from "next/server";
import { getProducts } from "../../../lib/product-source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ products: await getProducts() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Product updates are temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
