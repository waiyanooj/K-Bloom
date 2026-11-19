export const runtime = "nodejs";

const MAX_BYTES = 3 * 1024 * 1024;

function fail(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();

  if (!cloudName) {
    return fail("Image service is not configured.", 503);
  }

  const source = new URL(request.url).searchParams.get("url");

  if (!source || source.length > 2048) {
    return fail("Invalid image URL.", 400);
  }

  let imageUrl: URL;

  try {
    imageUrl = new URL(source);
  } catch {
    return fail("Invalid image URL.", 400);
  }

  // Only allow original, versioned images from our own cloud.
  const prefix = `/${cloudName}/image/upload/`;
  const assetPath = imageUrl.pathname.slice(prefix.length);

  if (
    imageUrl.protocol !== "https:" ||
    imageUrl.hostname !== "res.cloudinary.com" ||
    imageUrl.port ||
    imageUrl.username ||
    imageUrl.password ||
    imageUrl.search ||
    imageUrl.hash ||
    !imageUrl.pathname.startsWith(prefix) ||
    !/^v\d+\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp|gif)$/i.test(
      assetPath,
    )
  ) {
    return fail("Image URL is not allowed.", 400);
  }

  try {
    const upstream = await fetch(imageUrl.href, {
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (!upstream.ok || !upstream.body) {
      await upstream.body?.cancel();
      return fail("Image is unavailable.", 502);
    }

    const type = (upstream.headers.get("content-type") ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase();

    if (
      !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(type)
    ) {
      await upstream.body.cancel();
      return fail("Unsupported image type.", 415);
    }

    const declaredSize = Number(
      upstream.headers.get("content-length") ?? 0,
    );

    if (declaredSize > MAX_BYTES) {
      await upstream.body.cancel();
      return fail("Image is too large.", 413);
    }

    // Enforce the limit even when Content-Length is absent.
    const reader = upstream.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        size += value.byteLength;

        if (size > MAX_BYTES) {
          await reader.cancel();
          return fail("Image is too large.", 413);
        }

        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const bytes = new Uint8Array(size);
    let offset = 0;

    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return new Response(bytes, {
      headers: {
        "Content-Type": type,
        "Content-Length": String(size),
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return fail("Image service is temporarily unavailable.", 502);
  }
}