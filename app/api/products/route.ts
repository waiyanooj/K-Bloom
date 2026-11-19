import { NextResponse } from "next/server";
import { getProducts } from "../../../lib/product-source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function websiteImageUrl(source: string): string {
  // Existing images inside public/ keep their local paths.
  if (source.startsWith("/") && !source.startsWith("//")) {
    return source;
  }

  try {
    const url = new URL(source);

    if (url.hostname === "res.cloudinary.com") {
      return `/api/product-image?url=${encodeURIComponent(source)}`;
    }
  } catch {
    // Sheet validation normally rejects malformed URLs first.
  }

  return source;
}

export async function GET() {
  try {
    const products = await getProducts();

    const websiteProducts = products.map((product) => ({
      ...product,
      image: websiteImageUrl(product.image),
      detailImages: product.detailImages?.map(websiteImageUrl),
    }));

    return NextResponse.json(
      { products: websiteProducts },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Product updates are temporarily unavailable." },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}