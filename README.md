# K-Bloom

Next.js App Router migration of the original K-Bloom HTML, CSS and JavaScript site.

## Run locally

Requires Node.js 20.9 or newer and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

## Production

```sh
npm run typecheck
npm run build
npm start
```

## Project structure

- `app/page.tsx`: home page (`/`).
- `app/products/page.tsx`: full catalog (`/products`).
- `app/layout.tsx`: shared metadata, global CSS and icon script.
- `app/globals.css`: preserved responsive styles.
- `components/ProductCollection.tsx`: category filters, carousel, cart and rating dialog.
- `components/HomeEffects.tsx`: scroll navigation and reveal effects with cleanup.
- `lib/products.ts`: shared product data.
- `public/`: images and videos served from root-relative URLs.
- `legacy/`: original source files retained for reference.

Old `/index.html` and `/products.html` URLs redirect to the new routes. Cart and ratings retain the original localStorage keys (`kbloom-cart`, `kbloom-ratings`). They are device-local; checkout, accounts and a backend are not implemented. Existing social/profile links remain placeholders. Google Fonts and Iconify require an internet connection.

The original media files also remain at the project root as backups; edit the copies in `public/` for the Next.js app.

## Google Sheets product sync

### Promotions

Run `node scripts/setup-promotions.cjs --apply` once to add `Products!P`
(`Promotion`) and place `Order!K` (`Promotion`) between Quantity and Total.
This also removes the previous `Promotion Price (MMK)` column when present.
Enter `10%` in Products Promotion for ten percent off every size. Blank or 0%
means no discount; values from 0% through 100% are supported. Keep the existing
price cells as normal prices. The website calculates the payable unit price as
`ROUND(normal price * (1 - promotion))` in whole MMK and displays both prices.
Changes use the existing catalog refresh (normally within one minute).
Orders preserve the normal unit price in I, quantity in J, discounted line total
in L, promotion rate in K, and status in M. Historical normal prices, quantities,
promotion rates, totals and statuses are preserved. Checkout verifies the latest discounted price against
Sheets before saving. Deploy the changed app to enable promotion checkout on a
hosted website.

The `Products` tab in the same spreadsheet used by Orders is the live catalog source.
Use the existing server-only `GOOGLE_SHEET_ID`, `GOOGLE_CLIENT_EMAIL`, and
`GOOGLE_PRIVATE_KEY` environment variables. The service account must have access
to the spreadsheet. Never expose these variables with a `NEXT_PUBLIC_` prefix.

`node scripts/setup-products.cjs` creates the tab and seeds the 32 existing products
only when the tab is empty. It preserves populated rows on subsequent runs.
This setup/test script requires Node 22.13+; the app retains its existing Node requirement.
`node scripts/setup-products.cjs --verify` reads and validates the live catalog.

Keep row 1 headers unchanged. Each product needs a unique, stable ID, Name,
Category (`Men's`, `Women's`, or `Unisex`), five positive whole-MMK prices, an
Image URL (a `/img/...` path or public HTTPS image URL), and checked Active.
Popular controls the home page's popular selection. Uncheck Active to hide a
product. Price Label, Notes, and Tint are optional; Tint defaults to `#eee5f1`.
New products must include all four decant prices as well as the full-size price.
Add rows below the existing products and check Active when ready. Stock quantities
and image-file uploads are not managed by this integration.

The browser checks `/api/products` every 30 seconds while visible and on focus.
The server caches validated reads for at most 30 seconds, so edits normally appear
within about one minute without rebuilding or importing. No background job is
needed when no one has the site open. An invalid active row or failed Google read
retains the browser's last successful catalog and displays a warning; checkout is
disabled until updates recover. A fresh browser cannot load products during an outage.

Checkout reads Sheets afresh and rejects changed prices or inactive products
before writing an order. Existing bag entries are retained locally when products
are hidden, but only currently active products appear in the bag and checkout.
Column O, `Detail Image URLs`, controls the detail gallery. Enter one image URL per
line in the cell (Ctrl+Enter on Windows to add a line inside the Google Sheets cell).
Use a public HTTPS image URL or an existing `/img/...` path. Leave it blank to show
the main product image. Existing detail image paths are seeded on the first column
migration only; later edits and deliberately cleared cells are preserved. Image
links sync automatically, but any prices printed inside the images must be updated
in the images themselves.

Validation: `node scripts/test-product-sync.cjs`, `npm run typecheck`, and
`npm run build`. Deploy the updated app with the same three environment variables
to enable this behavior on a hosted site.
