/* ============================================================
   Cart — header dropdown, not a page.
   ------------------------------------------------------------
   Injects a cart icon (with live count badge) into .nav__right on
   every page, and a dropdown that "hangs" under it. The cart is
   stored in localStorage so it survives navigation between the
   multi-page site (Shop → Product → …).

   Public API (used by main.js on the product page):
     window.Cart.add(item)   -> add/merge a line, open the drawer
     window.Cart.open()      -> open the dropdown
     window.Cart.count()     -> total quantity

   "Checkout" hands off to the existing ManyChat reserve flow — the
   site has no standalone checkout page. Delivery address & payment
   are collected there.
   ============================================================ */
(function () {
  "use strict";

  var KEY = "ghp_cart";
  var money = function (n) { return "RM " + Number(n).toFixed(2); };
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }

  // --- Store -------------------------------------------------
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function write(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    render();
  }
  // A line's identity — same cake spec merges into one line (qty++)
  function sig(i) {
    return [i.name, i.size, i.flavour, i.fulfilment, i.outlet, i.date, i.time].join("|");
  }

  function add(item) {
    var items = read();
    item.qty = item.qty || 1;
    var found = items.filter(function (i) { return sig(i) === sig(item); })[0];
    if (found) found.qty += item.qty;
    else items.push(item);
    write(items);
    open();
  }
  function setQty(index, qty) {
    var items = read();
    if (!items[index]) return;
    if (qty <= 0) items.splice(index, 1);
    else items[index].qty = qty;
    write(items);
  }
  function count() {
    return read().reduce(function (n, i) { return n + i.qty; }, 0);
  }
  function subtotal() {
    return read().reduce(function (n, i) { return n + i.price * i.qty; }, 0);
  }

  // --- DOM: header button + dropdown -------------------------
  var CART_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>' +
    '<path d="M2.5 3h2.2l2.1 12.2a1.6 1.6 0 0 0 1.6 1.3h8.9a1.6 1.6 0 0 0 1.6-1.3L21.5 7H6"/></svg>';

  var wrap = el(
    '<div class="cart">' +
      '<button class="cart__btn" type="button" aria-label="Open cart" aria-expanded="false">' +
        CART_ICON +
        '<span class="cart__badge" hidden>0</span>' +
      '</button>' +
      '<div class="cart__drawer" role="dialog" aria-label="Your cart">' +
        '<div class="cart__head"><h4>Your Cart</h4>' +
          '<button class="cart__close" type="button" aria-label="Close cart">&times;</button></div>' +
        '<div class="cart__body"></div>' +
        '<div class="cart__foot">' +
          '<div class="cart__totals"><span>Subtotal</span><span class="cart__subtotal">RM 0.00</span></div>' +
          '<p class="cart__hint">Delivery address &amp; payment are confirmed at checkout.</p>' +
          '<button class="btn btn-gold cart__checkout" type="button">Checkout</button>' +
        '</div>' +
      '</div>' +
    '</div>'
  );

  var btn     = wrap.querySelector(".cart__btn");
  var drawer  = wrap.querySelector(".cart__drawer");
  var badge   = wrap.querySelector(".cart__badge");
  var body    = wrap.querySelector(".cart__body");
  var subEl   = wrap.querySelector(".cart__subtotal");
  var footEl  = wrap.querySelector(".cart__foot");

  function lineHtml(i, idx) {
    var meta = [i.size, i.flavour].filter(Boolean).join(" · ");
    var fulfil = i.fulfilment === "pickup"
      ? "Pickup · " + (i.outlet || "outlet")
      : "Delivery across JB";
    var when = [i.date, i.time].filter(Boolean).join(" · ");
    return '' +
      '<div class="cart-line" data-idx="' + idx + '">' +
        '<div class="cart-line__info">' +
          '<p class="cart-line__name">' + i.name + '</p>' +
          '<p class="cart-line__meta">' + meta + '</p>' +
          '<p class="cart-line__meta">' + fulfil + (when ? " · " + when : "") + '</p>' +
        '</div>' +
        '<div class="cart-line__right">' +
          '<button class="cart-line__rm" type="button" aria-label="Remove">&times;</button>' +
          '<div class="qty">' +
            '<button class="qty__btn" type="button" data-act="dec" aria-label="Decrease">&minus;</button>' +
            '<span class="qty__n">' + i.qty + '</span>' +
            '<button class="qty__btn" type="button" data-act="inc" aria-label="Increase">+</button>' +
          '</div>' +
          '<p class="cart-line__price">' + money(i.price * i.qty) + '</p>' +
        '</div>' +
      '</div>';
  }

  function render() {
    var items = read();
    var n = count();
    badge.textContent = n;
    badge.hidden = n === 0;
    btn.classList.toggle("cart__btn--filled", n > 0);

    if (!items.length) {
      body.innerHTML = '<p class="cart__empty">Your cart is empty.<br><a href="shop.html">Browse the shop →</a></p>';
      footEl.style.display = "none";
      return;
    }
    footEl.style.display = "";
    body.innerHTML = items.map(lineHtml).join("");
    subEl.textContent = money(subtotal());
  }

  // --- Open / close ------------------------------------------
  function open() { wrap.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
  function close() { wrap.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
  function toggle() { wrap.classList.contains("open") ? close() : open(); }

  btn.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });
  wrap.querySelector(".cart__close").addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  document.addEventListener("click", function (e) {
    if (wrap.contains(e.target)) return;
    // Add-to-Cart buttons open the drawer — their click must not also close it
    if (e.target.closest("[data-add-cart], [data-add]")) return;
    close();
  });
  drawer.addEventListener("click", function (e) { e.stopPropagation(); });

  // Line actions (qty steppers + remove) via delegation
  body.addEventListener("click", function (e) {
    var line = e.target.closest(".cart-line");
    if (!line) return;
    var idx = Number(line.getAttribute("data-idx"));
    var items = read();
    if (e.target.classList.contains("cart-line__rm")) { setQty(idx, 0); return; }
    var act = e.target.getAttribute("data-act");
    if (act === "inc") setQty(idx, items[idx].qty + 1);
    if (act === "dec") setQty(idx, items[idx].qty - 1);
  });

  // Checkout → its own checkout page (page itself not built yet)
  wrap.querySelector(".cart__checkout").addEventListener("click", function () {
    window.location.href = "checkout.html";
  });

  // --- Mount: drop the button into the header ----------------
  function mount() {
    var right = document.querySelector(".nav__right");
    if (!right) { document.body.appendChild(wrap); render(); return; }
    var toggleBtn = right.querySelector(".nav__toggle");
    if (toggleBtn) right.insertBefore(wrap, toggleBtn);
    else right.appendChild(wrap);
    render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();

  // Keep multiple tabs / the same tab in sync
  window.addEventListener("storage", function (e) { if (e.key === KEY) render(); });

  window.Cart = { add: add, open: open, close: close, count: count };
})();
