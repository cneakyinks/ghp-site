/* Shared UI behaviour: FAQ accordion, product selectors, mobile nav */
(function () {
  "use strict";

  // FAQ accordion
  document.querySelectorAll(".qa__q").forEach(function (q) {
    q.addEventListener("click", function () {
      q.parentElement.classList.toggle("open");
    });
  });

  // Product: delivery time-slot picker
  var slots = document.querySelectorAll(".slot");
  slots.forEach(function (s) {
    s.addEventListener("click", function () {
      slots.forEach(function (x) { x.classList.remove("active"); });
      s.classList.add("active");
    });
  });

  // Product detail: gallery thumbnails (swap main image)
  var thumbs = document.querySelectorAll(".gallery__thumbs img");
  var mainImg = document.querySelector(".gallery__main img");
  thumbs.forEach(function (t) {
    t.addEventListener("click", function () {
      thumbs.forEach(function (x) { x.classList.remove("active"); });
      t.classList.add("active");
      if (mainImg) mainImg.src = t.src;
    });
  });

  // Shop: filter pills
  var pills = document.querySelectorAll(".pill");
  var shopCards = document.querySelectorAll(".shop-grid .card");
  pills.forEach(function (p) {
    p.addEventListener("click", function () {
      pills.forEach(function (x) { x.classList.remove("active"); });
      p.classList.add("active");
      var f = p.getAttribute("data-filter");
      shopCards.forEach(function (c) {
        var cats = c.getAttribute("data-cat") || "";
        var show = f === "all" || cats.split(" ").indexOf(f) !== -1;
        c.classList.toggle("is-hidden", !show);
      });
    });
  });

  // Blog: category filter pills (featured post always stays visible)
  var blogCats = document.querySelectorAll(".blog-cats a[data-filter]");
  var posts = document.querySelectorAll(".blog-grid .post");
  blogCats.forEach(function (c) {
    c.addEventListener("click", function (e) {
      e.preventDefault();
      blogCats.forEach(function (x) { x.classList.remove("active"); });
      c.classList.add("active");
      var f = c.getAttribute("data-filter");
      posts.forEach(function (p) {
        var show = f === "all" || p.getAttribute("data-cat") === f;
        p.classList.toggle("is-hidden", !show);
      });
    });
  });

  // Add to Cart (prototype feedback only)
  var addBtn = document.querySelector("[data-add-cart]");
  if (addBtn) {
    addBtn.addEventListener("click", function () {
      addBtn.textContent = "✓ Added to Cart";
      setTimeout(function () { addBtn.textContent = "Add to Cart"; }, 1600);
    });
  }

  // Mobile / tablet nav toggle (class-based; styling lives in CSS)
  var toggle = document.querySelector(".nav__toggle");
  var links = document.querySelector(".nav__links");
  if (toggle && links) {
    var setOpen = function (open) {
      links.classList.toggle("open", open);
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!links.classList.contains("open"));
    });
    // Close when a link is tapped, or when tapping outside the menu
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setOpen(false);
    });
    document.addEventListener("click", function (e) {
      if (!links.contains(e.target) && e.target !== toggle) setOpen(false);
    });
  }
})();
