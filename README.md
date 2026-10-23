# Absolute Cooked Store

Static, data-driven store (plain HTML, CSS, JS). Search, category filters, sorting, saved items, quick view and click tracking, all in the browser. Hosts free on GitHub Pages.

## Deploy at store.ascyst.com
1. Create a new GitHub repo (for example `ascyst-store`) and upload every file and folder.
2. **Settings > Pages**: Deploy from a branch, `main`, `/ (root)`, Save.
3. Still in Pages, set Custom domain to `store.ascyst.com` (the `CNAME` file already contains it) and enable Enforce HTTPS.
4. At your DNS provider add a **CNAME** record: name `store`, value `<your-github-username>.github.io`.

## Add or edit products
Open `products.js`, copy one product line, paste it below the last one, and edit. Put images in `img/products/` and set `image: "img/products/name.webp"`; without one a clean placeholder is shown. Set `featured: true` to pin a product first and mark it as a pick.

## Affiliate links
- Easiest: set `market` and `tag` in `products.js`. Each product gets a search link for its `query` with your tag attached.
- Best: paste the exact tagged product link into a product's `url` (it overrides the search link).
- Keep the disclosure text visible, and use your program's required wording (for Amazon, its exact Associates statement). Prices are intentionally not shown; check current program rules before adding any.

## Click tracking (optional, free)
Sign up at goatcounter.com and add its one-line script tag before `app.js` in `index.html`. Every "Check price" click is then counted per product.

## Colours
Change `--accent` in `style.css` (`:root` for dark, `[data-theme=light]` for light). Social preview: `img/og.png` is included; change `og:image` in `index.html` to its full URL (`https://store.ascyst.com/img/og.png`).
