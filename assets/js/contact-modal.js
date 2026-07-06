/* ============================================================
   Contact modal — pops over any page instead of a Contact page.
   ------------------------------------------------------------
   Every "Contact" nav link / footer "Contact Us" link calls the
   global window.openContact() hook. Branch details, hours and
   numbers mirror the live goodhusbandpatisserie.com contact page.
   ============================================================ */
(function () {
  "use strict";

  // --- Real branch data (from the live contact page) ---
  var BRANCHES = [
    {
      name: "Eco Galleria", tag: "Dine-in",
      addr: "B0115 Blok B, Eko Galleria, Jalan Eko Botani 3, Taman Eko Botani, 79100 Iskandar Puteri, Johor",
      hours: "Open daily · 12:00 PM – 9:00 PM",
      tel: "+60187880686"
    },
    {
      name: "Mount Austin", tag: "Dine-in",
      addr: "31, Jalan Austin Heights 8/8, Taman Mount Austin, 81100 Johor Bahru, Johor",
      hours: "Open daily · 12:30 PM – 9:30 PM",
      tel: "+60187886432"
    },
    {
      name: "Kulai", tag: "Takeaway",
      addr: "47, Lorong Ismail, Taman Kulai, 81000 Kulai, Johor",
      hours: "Open daily · 11:00 AM – 7:30 PM",
      tel: "+60187888962"
    }
  ];

  var EMAIL = "hello@goodhusbandpatisserie.com";
  var SOCIAL = [
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
    { label: "TikTok", href: "#" },
    { label: "Xiaohongshu", href: "#" }
  ];

  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }
  function telDisplay(t) { return t.replace(/^\+60/, "+60 ").replace(/(\d{3})(\d{4})$/, "$1 $2"); }

  var branchesHtml = BRANCHES.map(function (b) {
    return '' +
      '<div class="branch">' +
        '<div>' +
          '<p class="branch__name">' + b.name + '<span class="branch__tag">' + b.tag + '</span></p>' +
          '<p class="branch__addr">' + b.addr + '</p>' +
          '<p class="branch__hours">' + b.hours + '</p>' +
        '</div>' +
        '<a class="branch__call" href="tel:' + b.tel + '">Call ' + telDisplay(b.tel) + '</a>' +
      '</div>';
  }).join("");

  var socialHtml = SOCIAL.map(function (s) {
    return '<a href="' + s.href + '">' + s.label + '</a>';
  }).join("");

  var overlay = el(
    '<div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Contact Good Husband Patisserie">' +
      '<div class="contact-modal">' +
        '<div class="contact-modal__head">' +
          '<button class="contact-modal__close" aria-label="Close">&times;</button>' +
          '<p class="eyebrow">We’d love to hear from you</p>' +
          '<h2>Visit or Reach Us</h2>' +
          '<p>Three homes across Johor Bahru · replies in under 2 minutes on chat</p>' +
        '</div>' +
        '<div class="contact-modal__body">' +
          branchesHtml +
          '<div class="contact-meta">' +
            '<div><span class="contact-meta__label">Email</span>' +
              '<a href="mailto:' + EMAIL + '">' + EMAIL + '</a></div>' +
          '</div>' +
          '<div class="contact-social">' + socialHtml + '</div>' +
          '<div class="contact-modal__cta">' +
            '<button class="btn btn-gold" type="button" data-mc-open>Reserve via ManyChat</button>' +
            '<small>Custom cakes, delivered fresh across Johor Bahru.</small>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );

  function open() { overlay.classList.add("open"); document.body.style.overflow = "hidden"; }
  function close() { overlay.classList.remove("open"); document.body.style.overflow = ""; }

  overlay.querySelector(".contact-modal__close").addEventListener("click", close);
  // Click outside the card closes
  overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
  // Esc closes
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  // Reserve CTA inside the modal hands off to ManyChat
  overlay.querySelector("[data-mc-open]").addEventListener("click", function () {
    close();
    if (window.openManyChat) window.openManyChat();
  });

  // Global hook used by every Contact link
  window.openContact = function () { open(); };

  function mount() { document.body.appendChild(overlay); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
