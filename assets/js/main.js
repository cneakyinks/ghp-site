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

  // Product detail: Details / Reviews tab swap
  var ptabs = document.querySelectorAll(".ptab");
  if (ptabs.length) {
    ptabs.forEach(function (t) {
      t.addEventListener("click", function () {
        var name = t.getAttribute("data-tab");
        ptabs.forEach(function (x) { x.classList.remove("active"); });
        t.classList.add("active");
        document.querySelectorAll(".ptabs__panel").forEach(function (p) {
          var on = p.id === "tab-" + name;
          p.classList.toggle("active", on);
          p.hidden = !on;
        });
      });
    });
  }

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

  // Shop: search box + tag-filter pills (combined)
  var pills = document.querySelectorAll(".shop-toolbar .pill");
  var shopCards = document.querySelectorAll(".shop-grid .card");
  var shopSearch = document.getElementById("shop-search");
  var shopEmpty = document.getElementById("shop-empty");
  if (pills.length || shopSearch) {
    var applyShopFilter = function () {
      var active = document.querySelector(".pill.active");
      var f = active ? active.getAttribute("data-filter") : "all";
      var q = shopSearch ? shopSearch.value.trim().toLowerCase() : "";
      var shown = 0;
      shopCards.forEach(function (c) {
        var cats = c.getAttribute("data-cat") || "";
        var inCat = f === "all" || cats.split(" ").indexOf(f) !== -1;
        var matches = q === "" || (c.textContent + " " + cats).toLowerCase().indexOf(q) !== -1;
        var show = inCat && matches;
        c.classList.toggle("is-hidden", !show);
        if (show) shown++;
      });
      if (shopEmpty) {
        shopEmpty.hidden = shown !== 0;
        var term = shopEmpty.querySelector("span");
        if (term) term.textContent = q;
      }
    };
    pills.forEach(function (p) {
      p.addEventListener("click", function () {
        pills.forEach(function (x) { x.classList.remove("active"); });
        p.classList.add("active");
        applyShopFilter();
      });
    });
    if (shopSearch) shopSearch.addEventListener("input", applyShopFilter);
  }

  // Masterpieces: filter tags + carousel nav + add-to-cart
  var mpFilters = document.querySelectorAll(".mp-filters .pill");
  var mpTrack = document.querySelector(".mp-track");
  var mpCards = document.querySelectorAll(".mp-card");
  if (mpFilters.length) {
    mpFilters.forEach(function (p) {
      p.addEventListener("click", function () {
        mpFilters.forEach(function (x) { x.classList.remove("active"); });
        p.classList.add("active");
        var f = p.getAttribute("data-filter");
        mpCards.forEach(function (c) {
          var cats = c.getAttribute("data-cat") || "";
          var show = f === "all" || cats.split(" ").indexOf(f) !== -1;
          c.classList.toggle("is-hidden", !show);
        });
        if (mpTrack) mpTrack.scrollTo({ left: 0, behavior: "smooth" });
      });
    });
  }
  if (mpTrack) {
    var mpStep = function () { return Math.min(mpTrack.clientWidth * 0.85, 340); };
    var mpPrev = document.querySelector(".mp-nav--prev");
    var mpNext = document.querySelector(".mp-nav--next");
    if (mpPrev) mpPrev.addEventListener("click", function () { mpTrack.scrollBy({ left: -mpStep(), behavior: "smooth" }); });
    if (mpNext) mpNext.addEventListener("click", function () { mpTrack.scrollBy({ left: mpStep(), behavior: "smooth" }); });
  }
  document.querySelectorAll(".masterpieces [data-add]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (window.Cart) window.Cart.add({
        name: b.getAttribute("data-name"),
        size: "", flavour: b.getAttribute("data-name"),
        fulfilment: "delivery", outlet: "", date: "", time: "",
        price: parseFloat(b.getAttribute("data-price")) || 0, qty: 1
      });
      var t = b.textContent;
      b.textContent = "✓ Added";
      setTimeout(function () { b.textContent = t; }, 1400);
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

  // Product detail: fulfilment method (Delivery ↔ Self-Pickup)
  // Pickup reveals an outlet picker; Delivery notes the address is
  // taken at checkout. Labels flip so the copy always reads right.
  var OUTLETS = [
    { name: "Eco Galleria", addr: "B0115 Blok B, Eko Galleria, Jalan Eko Botani 3, 79100 Iskandar Puteri", hours: "Daily · 12:00 PM – 9:00 PM" },
    { name: "Mount Austin", addr: "31, Jalan Austin Heights 8/8, 81100 Johor Bahru", hours: "Daily · 12:30 PM – 9:30 PM" },
    { name: "Kulai",        addr: "47, Lorong Ismail, Taman Kulai, 81000 Kulai", hours: "Daily · 11:00 AM – 7:30 PM" }
  ];

  var fulfilment  = document.getElementById("fulfilment");
  var method      = "delivery";
  var outletField = document.getElementById("outlet-field");
  var outletSel   = document.getElementById("outlet");
  var outletHint  = document.getElementById("outlet-hint");
  var deliveryHint = document.getElementById("delivery-hint");
  var dateLabel   = document.getElementById("date-label");
  var slotLabel   = document.getElementById("slot-label");

  if (fulfilment && outletSel) {
    // Populate outlets once
    outletSel.innerHTML = OUTLETS.map(function (o) {
      return '<option value="' + o.name + '">' + o.name + '</option>';
    }).join("");

    var showOutletHint = function () {
      var o = OUTLETS[outletSel.selectedIndex] || OUTLETS[0];
      outletHint.textContent = o.addr + " · " + o.hours;
    };
    outletSel.addEventListener("change", showOutletHint);
    showOutletHint();

    var setMethod = function (m) {
      method = m;
      fulfilment.querySelectorAll(".seg").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-method") === m);
      });
      var pickup = m === "pickup";
      outletField.classList.toggle("is-collapsed", !pickup);
      if (deliveryHint) deliveryHint.style.display = pickup ? "none" : "";
      if (dateLabel) dateLabel.textContent = pickup ? "Pickup date" : "Delivery date";
      if (slotLabel) slotLabel.textContent = pickup ? "Pickup time slot" : "Delivery time slot";
    };
    fulfilment.querySelectorAll(".seg").forEach(function (b) {
      b.addEventListener("click", function () { setMethod(b.getAttribute("data-method")); });
    });
  }

  // Add to Cart — reads the current selections and adds a real line
  var addBtn = document.querySelector("[data-add-cart]");
  if (addBtn) {
    addBtn.addEventListener("click", function () {
      var sizeSel = document.getElementById("size");
      var flavSel = document.getElementById("flavour");
      var dateInput = document.getElementById("date");
      var activeSlot = document.querySelector(".slot.active");
      var sizeText = sizeSel ? sizeSel.value : "";
      var priceMatch = sizeText.match(/RM\s?(\d+(?:\.\d+)?)/);

      var item = {
        name: document.querySelector(".pd h1") ? document.querySelector(".pd h1").textContent.trim() : "Cake",
        size: sizeText.replace(/\s*\(RM.*\)\s*/, "").trim(),
        flavour: flavSel ? flavSel.value : "",
        fulfilment: method,
        outlet: method === "pickup" && outletSel ? outletSel.value : "",
        date: dateInput ? dateInput.value : "",
        time: activeSlot ? activeSlot.textContent.trim() : "",
        price: priceMatch ? parseFloat(priceMatch[1]) : 0,
        qty: 1
      };

      if (window.Cart) window.Cart.add(item);
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
