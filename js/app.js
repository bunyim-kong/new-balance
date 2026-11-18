const DATA_URL = "data/products.json";
const CART_KEY = "nb-static-cart";
const WISHLIST_KEY = "nb-static-wishlist";

let productCache = null;

async function fetchProducts() {
  if (productCache) return productCache;

  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Could not load products (${response.status})`);
  }

  const data = await response.json();
  if (!Array.isArray(data.products)) {
    throw new Error("The product data is not in the expected format.");
  }

  productCache = data.products;
  return productCache;
}

function getStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function getCart() {
  return getStoredArray(CART_KEY);
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function getWishlist() {
  return getStoredArray(WISHLIST_KEY);
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function imageErrorAction(product) {
  return ["running", "lifestyle"].includes(product.category)
    ? "this.onerror=null;this.src='assets/shoe-placeholder.svg'"
    : "this.remove()";
}

function addToCart(product, size, quantity = 1) {
  const cart = getCart();
  const chosenSize = size || product.sizes[0];
  const existing = cart.find((item) => item.id === product.id && item.size === chosenSize);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: product.id, size: chosenSize, quantity });
  }

  saveCart(cart);
  showToast(`${product.name} was added to your cart.`);
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((badge) => {
    badge.textContent = count;
    badge.hidden = count === 0;
  });
}

function showToast(message) {
  const region = document.querySelector("#toast-region");
  if (!region) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  region.append(toast);

  window.setTimeout(() => {
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 260);
  }, 2800);
}

function renderChrome() {
  const header = document.querySelector("#site-header");
  const footer = document.querySelector("#site-footer");

  if (header) {
    header.innerHTML = `
      <div class="promo-bar">Members get free shipping on every order. <u>Join now</u></div>
      <header class="site-header">
        <div class="header-main">
          <button class="icon-button menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
          </button>
          <a class="brand" href="index.html" aria-label="New Balance home">
            <img src="assets/nb-mark.svg" alt=""><span>new<br>balance</span>
          </a>
          <nav class="main-nav" aria-label="Main navigation">
            <a href="shop.html?sort=newest">New</a>
            <a href="shop.html?filter=men">Men</a>
            <a href="shop.html?filter=women">Women</a>
            <a href="shop.html?filter=kids">Kids</a>
            <a href="shop.html?filter=apparel">Apparel</a>
          </nav>
          <div class="header-actions">
            <a class="icon-button account-button" href="#footer-newsletter" aria-label="Account">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"></path></svg>
            </a>
            <a class="icon-button" href="cart.html" aria-label="Shopping cart">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"></path><path d="M9 9V6a3 3 0 0 1 6 0v3"></path></svg>
              <span class="cart-count" data-cart-count hidden>0</span>
            </a>
          </div>
        </div>
      </header>`;

    const toggle = header.querySelector(".menu-toggle");
    const nav = header.querySelector(".main-nav");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer">
        <section class="newsletter section-shell" id="footer-newsletter">
          <div><h2>Stay one step ahead.</h2><p>New releases, member exclusives, and stories from the field.</p></div>
          <form class="newsletter-form" data-newsletter-form>
            <label class="sr-only" for="newsletter-email">Email address</label>
            <input id="newsletter-email" type="email" required placeholder="Email address">
            <button type="submit">Join us →</button>
          </form>
        </section>
        <div class="footer-main section-shell">
          <div class="footer-brand">
            <a class="brand" href="index.html"><img src="assets/nb-mark.svg" alt=""><span>new<br>balance</span></a>
            <p>Fearlessly independent since 1906. Built at the intersection of sport, craft, and culture.</p>
          </div>
          <div class="footer-column"><h3>Help</h3><a href="#">Contact us</a><a href="#">Track an order</a><a href="#">Returns</a><a href="#">Size guide</a></div>
          <div class="footer-column"><h3>Shop</h3><a href="shop.html?sort=newest">New arrivals</a><a href="shop.html?filter=shoes">Shoes</a><a href="shop.html?filter=apparel">Apparel</a><a href="shop.html?filter=accessories">Accessories</a></div>
          <div class="footer-column"><h3>About</h3><a href="#">Our purpose</a><a href="#">Responsible leadership</a><a href="#">Careers</a><a href="#">Find a store</a></div>
        </div>
        <div class="footer-bottom section-shell"><span>© ${new Date().getFullYear()} New Balance concept store.</span><span>Educational static project · No real purchases are processed.</span></div>
      </footer>`;

    footer.querySelector("[data-newsletter-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      event.currentTarget.reset();
      showToast("Thanks — you're on the list.");
    });
  }

  updateCartCount();
}

function productCard(product) {
  const saved = getWishlist().includes(product.id);
  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-card-media">
        <a class="product-image-link" href="product.html?id=${encodeURIComponent(product.id)}">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
          <img src="${product.images[0]}" alt="${product.color} New Balance ${product.name}" loading="lazy" onerror="${imageErrorAction(product)}">
        </a>
        <button class="wishlist-button${saved ? " is-saved" : ""}" type="button" data-wishlist="${product.id}" aria-label="${saved ? "Remove from" : "Add to"} wishlist">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.8a5.4 5.4 0 0 0-7.6 0L12 6l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z"></path></svg>
        </button>
        <button class="quick-add" type="button" data-quick-add="${product.id}" aria-label="Quick add ${product.name} to cart">+</button>
      </div>
      <div class="product-info">
        <div class="product-info-top">
          <div><h3><a href="product.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3><p class="product-subtitle">${product.subtitle}</p></div>
          <p class="product-price">${money(product.price)}</p>
        </div>
        <p class="product-color">${product.color}</p>
      </div>
    </article>`;
}

function bindProductActions(container, products) {
  container.addEventListener("click", (event) => {
    const quickAdd = event.target.closest("[data-quick-add]");
    const wishlistButton = event.target.closest("[data-wishlist]");

    if (quickAdd) {
      const product = products.find((item) => item.id === quickAdd.dataset.quickAdd);
      if (product) addToCart(product, product.sizes[0]);
    }

    if (wishlistButton) {
      const id = wishlistButton.dataset.wishlist;
      const wishlist = getWishlist();
      const isSaved = wishlist.includes(id);
      const updated = isSaved ? wishlist.filter((item) => item !== id) : [...wishlist, id];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
      wishlistButton.classList.toggle("is-saved", !isSaved);
      wishlistButton.setAttribute("aria-label", `${isSaved ? "Add to" : "Remove from"} wishlist`);
      showToast(isSaved ? "Removed from your wishlist." : "Saved to your wishlist.");
    }
  });
}

function productSlide(product) {
  return `<div class="swiper-slide">${productCard(product)}</div>`;
}

async function initHome() {
  const swiperElement = document.querySelector("#home-product-swiper");
  const wrapper = document.querySelector("#home-swiper-wrapper");
  const tabs = [...document.querySelectorAll("[data-home-tab]")];
  const count = document.querySelector("#home-tab-count");
  const viewAll = document.querySelector("#home-view-all");
  let products = [];
  let swiper = null;
  let activeAudience = "men";

  function getAudienceProducts() {
    return products.filter((product) => product.audience.includes(activeAudience));
  }

  function updateMeta(filtered) {
    const label = activeAudience === "kids" ? "kids'" : `${activeAudience}'s`;
    count.textContent = `${filtered.length} ${label} styles`;
    viewAll.href = `shop.html?filter=${activeAudience}`;
    viewAll.innerHTML = `View all ${label} products <span>→</span>`;
  }

  function renderSlides(useSwiperApi = false) {
    const filtered = getAudienceProducts();
    const slides = filtered.map(productSlide);
    updateMeta(filtered);

    if (useSwiperApi && swiper) {
      swiper.removeAllSlides();
      swiper.appendSlide(slides);
      swiper.update();
      swiper.slideTo(0, 0);
    } else {
      wrapper.innerHTML = slides.join("");
    }
  }

  function selectTab(tab, useSwiperApi) {
    activeAudience = tab.dataset.homeTab;
    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
    });
    renderSlides(useSwiperApi);
  }

  try {
    const [loadedProducts, swiperModule] = await Promise.all([
      fetchProducts(),
      import("https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.mjs")
    ]);
    products = loadedProducts;
    renderSlides();
    bindProductActions(swiperElement, products);

    swiper = new swiperModule.default("#home-product-swiper", {
      slidesPerView: 1.18,
      spaceBetween: 12,
      grabCursor: true,
      watchOverflow: true,
      navigation: {
        nextEl: ".home-swiper-next",
        prevEl: ".home-swiper-prev"
      },
      scrollbar: {
        el: ".product-swiper .swiper-scrollbar",
        draggable: true
      },
      breakpoints: {
        540: { slidesPerView: 2.08, spaceBetween: 12 },
        800: { slidesPerView: 3, spaceBetween: 14 },
        1080: { slidesPerView: 4, spaceBetween: 15 }
      }
    });

    tabs.forEach((tab) => tab.addEventListener("click", () => selectTab(tab, true)));
  } catch (error) {
    if (!products.length) {
      try {
        products = await fetchProducts();
        swiperElement.classList.add("swiper-fallback");
        renderSlides();
        bindProductActions(swiperElement, products);
        tabs.forEach((tab) => tab.addEventListener("click", () => selectTab(tab, false)));
      } catch {
        wrapper.innerHTML = `<div class="empty-state"><h3>We couldn't load these styles.</h3><p>${error.message}</p></div>`;
        count.textContent = "Products unavailable";
      }
    }
  }
}

async function initShop() {
  const grid = document.querySelector("#product-grid");
  const count = document.querySelector("#product-count");
  const search = document.querySelector("#product-search");
  const sort = document.querySelector("#product-sort");
  const filters = [...document.querySelectorAll("[data-filter]")];
  const heading = document.querySelector("#shop-heading");
  const params = new URLSearchParams(window.location.search);
  const requestedFilter = params.get("filter") || params.get("category") || "all";
  const allowedFilters = filters.map((button) => button.dataset.filter);
  const filterHeadings = {
    men: "Men's products.",
    women: "Women's products.",
    kids: "Kids' products.",
    shoes: "Shoes.",
    apparel: "Apparel.",
    accessories: "Accessories.",
    running: "Running shoes.",
    lifestyle: "Lifestyle shoes."
  };
  let products = [];
  let activeFilter = allowedFilters.includes(requestedFilter) ? requestedFilter : "all";

  if (["newest", "price-low", "price-high"].includes(params.get("sort"))) {
    sort.value = params.get("sort");
  }
  filters.forEach((button) => button.classList.toggle("is-active", button.dataset.filter === activeFilter));

  function render() {
    const term = search.value.trim().toLowerCase();
    let filtered = products.filter((product) => {
      const inFilter = activeFilter === "all"
        || product.category === activeFilter
        || (activeFilter === "shoes" && ["running", "lifestyle"].includes(product.category))
        || product.audience.includes(activeFilter)
        || (activeFilter === "newest" && product.new);
      const inSearch = !term || `${product.name} ${product.subtitle} ${product.color} ${product.style} ${product.category}`.toLowerCase().includes(term);
      return inFilter && inSearch;
    });

    if (sort.value === "newest") filtered.sort((a, b) => Number(b.new) - Number(a.new));
    if (sort.value === "price-low") filtered.sort((a, b) => a.price - b.price);
    if (sort.value === "price-high") filtered.sort((a, b) => b.price - a.price);

    count.textContent = `${filtered.length} ${filtered.length === 1 ? "style" : "styles"}`;
    heading.textContent = activeFilter === "all"
      ? "All products."
      : filterHeadings[activeFilter];
    grid.innerHTML = filtered.length
      ? filtered.map(productCard).join("")
      : `<div class="empty-state"><h3>No styles found.</h3><p>Try a different search or clear the active filter.</p><button class="button button-dark" type="button" data-clear-filters>Show all products</button></div>`;
  }

  try {
    products = await fetchProducts();
    render();
    bindProductActions(grid, products);

    filters.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        filters.forEach((item) => item.classList.toggle("is-active", item === button));
        const nextUrl = activeFilter === "all" ? "shop.html" : `shop.html?filter=${activeFilter}`;
        window.history.replaceState({}, "", nextUrl);
        render();
      });
    });

    search.addEventListener("input", render);
    sort.addEventListener("change", render);

    grid.addEventListener("click", (event) => {
      if (event.target.closest("[data-clear-filters]")) {
        activeFilter = "all";
        search.value = "";
        sort.value = "featured";
        window.history.replaceState({}, "", "shop.html");
        filters.forEach((button) => button.classList.toggle("is-active", button.dataset.filter === "all"));
        render();
      }
    });

  } catch (error) {
    count.textContent = "Catalog unavailable";
    grid.innerHTML = `<div class="empty-state"><h3>We couldn't load the collection.</h3><p>${error.message} Run this project through a local web server and try again.</p></div>`;
  }
}

async function initProduct() {
  const detail = document.querySelector("#product-detail");
  const info = document.querySelector("#detail-info");
  const relatedGrid = document.querySelector("#related-products");
  const id = new URLSearchParams(window.location.search).get("id") || "9060-black";

  try {
    const products = await fetchProducts();
    const product = products.find((item) => item.id === id);
    if (!product) throw new Error("That product could not be found.");

    document.title = `${product.name} — New Balance`;
    document.querySelector("#breadcrumb-name").textContent = product.name;
    const saved = getWishlist().includes(product.id);

    detail.innerHTML = `
      <div class="detail-layout">
        <div class="product-gallery">
          ${product.images.map((image, index) => `<div class="gallery-image"><img src="${image}" alt="${product.name} ${index + 1} view" ${index ? "loading=\"lazy\"" : ""} onerror="${imageErrorAction(product)}"></div>`).join("")}
        </div>
        <div class="product-panel">
          <span class="detail-badge">${product.badge}</span>
          <h1>${product.name}</h1>
          <p class="detail-subtitle">${product.subtitle}</p>
          <p class="detail-price">${money(product.price)}</p>
          <div class="rating-row"><span class="stars" aria-label="${product.rating} out of 5 stars">★★★★★</span><span>${product.rating} (${product.reviewCount} reviews)</span></div>
          <p class="detail-description">${product.description}</p>
          <div class="detail-meta"><p><strong>Color</strong><span>${product.color}</span></p><p><strong>Style</strong><span>${product.style}</span></p></div>
          <div class="picker-heading"><span>Select size</span><button type="button" data-size-help>Size guide</button></div>
          <div class="size-grid" role="group" aria-label="Select product size">
            ${product.sizes.map((size) => `<button class="size-option" type="button" data-size="${size}">${size}</button>`).join("")}
          </div>
          <div class="purchase-row">
            <div class="quantity-control" aria-label="Quantity"><button type="button" data-detail-quantity="minus" aria-label="Decrease quantity">−</button><span data-detail-quantity-value>1</span><button type="button" data-detail-quantity="plus" aria-label="Increase quantity">+</button></div>
            <button class="button button-dark" type="button" data-detail-add>Add to cart</button>
            <button class="detail-wishlist${saved ? " is-saved" : ""}" type="button" data-detail-wishlist aria-label="${saved ? "Remove from" : "Add to"} wishlist"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.8a5.4 5.4 0 0 0-7.6 0L12 6l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z"></path></svg></button>
          </div>
          <p class="shipping-note">Free shipping for members · 30-day returns</p>
        </div>
      </div>`;

    info.hidden = false;
    info.innerHTML = `
      <div><p class="eyebrow">Behind the design</p><h2>A modern classic, built with purpose.</h2><p>${product.story}</p></div>
      <div><p class="eyebrow">Product details</p><ul class="feature-list">${product.features.map((feature) => `<li>${feature}</li>`).join("")}</ul></div>`;

    const related = products
      .filter((item) => item.id !== product.id)
      .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
      .slice(0, 4);
    relatedGrid.innerHTML = related.map(productCard).join("");
    bindProductActions(relatedGrid, products);

    let selectedSize = "";
    let quantity = 1;
    const quantityValue = detail.querySelector("[data-detail-quantity-value]");
    detail.querySelectorAll("[data-size]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedSize = button.dataset.size;
        detail.querySelectorAll("[data-size]").forEach((item) => item.classList.toggle("is-selected", item === button));
      });
    });

    detail.addEventListener("click", (event) => {
      const quantityButton = event.target.closest("[data-detail-quantity]");
      if (quantityButton) {
        quantity = quantityButton.dataset.detailQuantity === "plus" ? Math.min(10, quantity + 1) : Math.max(1, quantity - 1);
        quantityValue.textContent = quantity;
      }

      if (event.target.closest("[data-detail-add]")) {
        if (!selectedSize) {
          showToast("Please choose a size first.");
          detail.querySelector(".size-grid").scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        addToCart(product, selectedSize, quantity);
      }

      if (event.target.closest("[data-size-help]")) {
        const sizeTip = product.category === "apparel"
          ? "Use your usual clothing size; choose the larger size for a roomier fit."
          : product.category === "accessories"
            ? "Accessory sizing is shown in the available size options."
            : "Measure heel to toe and choose the matching US shoe size.";
        showToast(sizeTip);
      }

      const wishlistButton = event.target.closest("[data-detail-wishlist]");
      if (wishlistButton) {
        const wishlist = getWishlist();
        const isSaved = wishlist.includes(product.id);
        const updated = isSaved ? wishlist.filter((item) => item !== product.id) : [...wishlist, product.id];
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
        wishlistButton.classList.toggle("is-saved", !isSaved);
        showToast(isSaved ? "Removed from your wishlist." : "Saved to your wishlist.");
      }
    });
  } catch (error) {
    detail.innerHTML = `<div class="empty-state"><h3>Product unavailable.</h3><p>${error.message}</p><a class="button button-dark" href="shop.html">Back to the collection</a></div>`;
  }
}

async function initCart() {
  const layout = document.querySelector("#cart-layout");
  const modal = document.querySelector("#checkout-modal");

  try {
    const products = await fetchProducts();

    function render() {
      const cart = getCart();
      const rows = cart.map((item) => {
        const product = products.find((candidate) => candidate.id === item.id);
        return product ? { ...item, product } : null;
      }).filter(Boolean);

      if (!rows.length) {
        layout.innerHTML = `<div class="empty-cart"><h2>Your cart is ready for something new.</h2><p>Explore footwear, apparel, and everyday accessories.</p><a class="button button-dark" href="shop.html">Shop products</a></div>`;
        return;
      }

      const subtotal = rows.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const shippingTarget = 125;
      const shipping = subtotal >= shippingTarget ? 0 : 9.95;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;
      const remaining = Math.max(0, shippingTarget - subtotal);
      const progress = Math.min(100, subtotal / shippingTarget * 100);

      layout.innerHTML = `
        <section class="cart-list" aria-label="Cart items">
          ${rows.map(({ product, size, quantity }) => `
            <article class="cart-item">
              <a class="cart-item-image" href="product.html?id=${encodeURIComponent(product.id)}"><img src="${product.images[0]}" alt="${product.name}" onerror="${imageErrorAction(product)}"></a>
              <div class="cart-item-copy"><h2><a href="product.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h2><p>${product.subtitle}</p><p>${product.color}</p><p>Size: ${size}</p><div class="quantity-control" aria-label="Quantity"><button type="button" data-cart-action="minus" data-id="${product.id}" data-size="${size}" aria-label="Decrease quantity">−</button><span>${quantity}</span><button type="button" data-cart-action="plus" data-id="${product.id}" data-size="${size}" aria-label="Increase quantity">+</button></div></div>
              <div class="cart-item-price"><span>${money(product.price * quantity)}</span><button class="remove-item" type="button" data-cart-action="remove" data-id="${product.id}" data-size="${size}">Remove</button></div>
            </article>`).join("")}
        </section>
        <aside class="order-summary">
          <h2>Order summary</h2>
          <div class="shipping-progress"><p><span>${remaining > 0 ? `${money(remaining)} away from free shipping` : "You've unlocked free shipping"}</span><strong>${Math.round(progress)}%</strong></p><div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div></div>
          <div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
          <div class="summary-row"><span>Estimated shipping</span><span>${shipping ? money(shipping) : "Free"}</span></div>
          <div class="summary-row"><span>Estimated tax</span><span>${money(tax)}</span></div>
          <div class="summary-row summary-total"><span>Total</span><span>${money(total)}</span></div>
          <button class="button button-dark button-block" type="button" data-open-checkout>Checkout</button>
          <p class="summary-note">Secure demo checkout · No payment will be processed</p>
          <form class="promo-form" data-promo-form><label class="sr-only" for="promo-code">Promo code</label><input id="promo-code" placeholder="Promo code"><button type="submit">Apply</button></form>
        </aside>`;
    }

    layout.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-cart-action]");
      if (actionButton) {
        const cart = getCart();
        const index = cart.findIndex((item) => item.id === actionButton.dataset.id && item.size === actionButton.dataset.size);
        if (index < 0) return;

        if (actionButton.dataset.cartAction === "plus") cart[index].quantity = Math.min(10, cart[index].quantity + 1);
        if (actionButton.dataset.cartAction === "minus") cart[index].quantity -= 1;
        if (actionButton.dataset.cartAction === "remove" || cart[index].quantity < 1) cart.splice(index, 1);
        saveCart(cart);
        render();
      }

      if (event.target.closest("[data-open-checkout]")) {
        modal.hidden = false;
        document.body.classList.add("modal-open");
        modal.querySelector("input").focus();
      }
    });

    layout.addEventListener("submit", (event) => {
      if (event.target.matches("[data-promo-form]")) {
        event.preventDefault();
        event.target.reset();
        showToast("Demo code checked — no promotion was applied.");
      }
    });

    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-modal]")) closeCheckout();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) closeCheckout();
    });

    modal.querySelector("#checkout-form").addEventListener("submit", (event) => {
      event.preventDefault();
      saveCart([]);
      closeCheckout();
      render();
      showToast("Demo order placed. Thanks for trying the store!");
    });

    function closeCheckout() {
      modal.hidden = true;
      document.body.classList.remove("modal-open");
    }

    render();
  } catch (error) {
    layout.innerHTML = `<div class="empty-state"><h3>We couldn't load your cart.</h3><p>${error.message}</p></div>`;
  }
}

renderChrome();

const page = document.body.dataset.page;
if (page === "home") initHome();
if (page === "shop") initShop();
if (page === "product") initProduct();
if (page === "cart") initCart();
