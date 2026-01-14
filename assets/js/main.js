/* =========================================================
   RSK Digital - main.js
   - Theme toggle (system + saved preference)
   - Mobile nav toggle
   - Year + Back to top
   - Products page rendering + filtering (if present)
   ========================================================= */

(function () {
  // ----- Theme -----
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  function getPreferredTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;

    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    return prefersLight ? "light" : "dark";
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Update button icon
    if (themeToggle) {
      const icon = themeToggle.querySelector(".btn-icon");
      if (icon) icon.textContent = theme === "light" ? "☀" : "☾";
    }
  }

  setTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "dark";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  // ----- Mobile Nav -----
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu on link click (mobile)
    navMenu.querySelectorAll("a.nav-link").forEach((a) => {
      a.addEventListener("click", () => {
        navMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ----- Footer year -----
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ----- Back to top -----
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ----- Products page logic (only runs if elements exist) -----
  const grid = document.getElementById("productsGrid");
  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categorySelect");
  const emptyState = document.getElementById("emptyState");
  const resetBtn = document.getElementById("resetFilters");

  // PRODUCTS is provided by assets/data/products.js on products.html
  const hasProductsData = typeof window.PRODUCTS !== "undefined" && Array.isArray(window.PRODUCTS);

  if (grid && hasProductsData) {
    const allProducts = window.PRODUCTS.slice();

    function uniqueCategories(items) {
      const set = new Set(items.map(p => (p.category || "").trim()).filter(Boolean));
      return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }

    function populateCategories() {
      const cats = uniqueCategories(allProducts);
      if (!categorySelect) return;

      categorySelect.innerHTML = "";
      cats.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c === "all" ? "All categories" : c;
        categorySelect.appendChild(opt);
      });
    }

    function matches(product, q, cat) {
      const query = (q || "").trim().toLowerCase();
      const inCat = !cat || cat === "all" || (product.category || "").toLowerCase() === cat.toLowerCase();
      if (!inCat) return false;
      if (!query) return true;

      const hay = [
        product.name,
        product.category,
        product.description,
        (product.tags || []).join(" ")
      ].join(" ").toLowerCase();

      return hay.includes(query);
    }

    function createCard(p) {
      const card = document.createElement("article");
      card.className = "product-card";

      const badgeText = p.category || "Product";

      card.innerHTML = `
        <div class="product-top">
          <span class="badge">${escapeHtml(badgeText)}</span>
          ${p.popular ? `<span class="badge">Popular</span>` : ``}
        </div>

        <div>
          <h3 class="product-title">${escapeHtml(p.name)}</h3>
          <p class="product-desc">${escapeHtml(p.description || "High-quality digital product with fast support.")}</p>
        </div>

        <div class="product-bottom">
          <div>
            <div class="price">$${escapeHtml(String(p.price))}</div>
            <div class="small-muted">${escapeHtml(p.note || "Message to buy")}</div>
          </div>
          <a class="btn btn-primary" href="contact.html" aria-label="Contact to buy ${escapeHtml(p.name)}">
            Buy
            <span aria-hidden="true">→</span>
          </a>
        </div>
      `;

      return card;
    }

    function escapeHtml(str) {
      return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function render(items) {
      grid.innerHTML = "";
      items.forEach(p => grid.appendChild(createCard(p)));

      const isEmpty = items.length === 0;
      if (emptyState) emptyState.classList.toggle("hidden", !isEmpty);
    }

    function applyFilters() {
      const q = searchInput ? searchInput.value : "";
      const cat = categorySelect ? categorySelect.value : "all";
      const filtered = allProducts.filter(p => matches(p, q, cat));
      render(filtered);
    }

    populateCategories();
    applyFilters();

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (categorySelect) categorySelect.addEventListener("change", applyFilters);

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (categorySelect) categorySelect.value = "all";
        applyFilters();
      });
    }
  }
})();
