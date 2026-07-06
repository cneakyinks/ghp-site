/* ============================================================
   Scroll effects — flowy scroll-reveal + parallax
   ------------------------------------------------------------
   - .reveal elements fade/slide in as they enter the viewport
     (add data-stagger on a parent to cascade its children).
   - [data-parallax="<speed>"] elements drift relative to the
     viewport centre — used for the floating .bake-orb photos,
     the hero card and the "G" watermark.
   Fully disabled under prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");

  // ---- Scroll reveal ----
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    // cascade delays for grouped children (steps, cards, posts)
    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      var i = 0;
      Array.prototype.forEach.call(group.children, function (child) {
        if (child.classList.contains("reveal")) {
          child.style.transitionDelay = (i * 0.09).toFixed(2) + "s";
          i++;
        }
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // ---- Parallax ----
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  if (!reduce && items.length) {
    var ticking = false;

    function update() {
      var mid = window.innerHeight / 2;
      items.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
        var rect = el.getBoundingClientRect();
        var centre = rect.top + rect.height / 2;
        var offset = (centre - mid) * -speed;
        el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
      ticking = false;
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }
})();
