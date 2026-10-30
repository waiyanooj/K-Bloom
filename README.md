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
