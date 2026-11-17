# New Balance Static Store

A responsive, multi-page New Balance storefront for shoes, apparel, and accessories, built with plain HTML, CSS, and JavaScript.

## Run locally

The product catalog is loaded with `fetch()` from `dist/data/products.json`, so serve the folder through a local web server instead of opening the files directly:

```bash
cd dist
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Pages and features

- `index.html` — editorial home page with Men, Women, and Kids tabs powered by Swiper.js
- `shop.html` — dedicated searchable, filterable, and sortable product listing for shoes, apparel, and accessories
- `product.html?id=9060-black` — data-driven product detail page with gallery, size picker, quantity, and related items
- `cart.html` — persistent cart, quantity controls, shipping progress, order summary, and demo checkout
- JSON catalog loaded with `async`/`await`
- New JSON entries automatically appear in the relevant listing filters and Men, Women, or Kids home Swiper tabs
- Responsive Swiper.js product carousel with arrow, drag, touch, and scrollbar controls
- Cart and wishlist state stored in `localStorage`
- Responsive navigation, loading/error states, toast messages, and accessible controls

This is a front-end demonstration. Checkout does not process a real payment.
