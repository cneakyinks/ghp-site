/* ============================================================
   ManyChat Webchat Widget — guided pre-order flow
   ------------------------------------------------------------
   Replaces the previous floating WhatsApp "Need Help? Chat with us"
   bubble (same bottom-right position, same bubble style).

   This is a WORKING PROTOTYPE of the ManyChat guided flow so the
   client can see/feel the sub-2-minute pre-order experience:
     greet → size → flavour → date/time & branch → confirm → handoff

   >>> GOING LIVE: replace the mock flow below with your real
       ManyChat "Embeddable Webchat" snippet. See README.md.
       The launcher bubble + window.openManyChat() hook stay the same,
       so every "Reserve via ManyChat" CTA keeps working unchanged.
   ============================================================ */
(function () {
  "use strict";

  // --- Flow data: mirrors the product-page selectors ---
  var SIZES   = ["0.5 kg (serves 4–6)", "1 kg (serves 8–10)", "1.5 kg (serves 12–15)", "2 kg (serves 18–20)"];
  var FLAVOURS = ["Verte No.66 (pistachio)", "Chocolate Indulgence", "Strawberry Shortcake", "Lychee Rose", "Salted Gula Melaka"];
  var TIMES   = ["10am–12pm", "12pm–2pm", "2pm–4pm", "4pm–6pm"];
  var BRANCHES = ["Mount Austin", "Bukit Indah", "Sutera Utama", "Delivery across JB"];

  var order = { size: null, flavour: null, date: null, time: null, branch: null };
  var step = 0;

  // --- Icons ---
  var CHAT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#241610" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 20l1.4-4.2A8.5 8.5 0 1 1 21 11.5z"/></svg>';
  var CAKE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#241610" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="M5 20v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6"/><path d="M4 14c1.5 1.2 2.5 1.2 4 0s2.5-1.2 4 0 2.5 1.2 4 0 2.5-1.2 4 0"/><path d="M12 8V5"/><circle cx="12" cy="3.5" r="1"/></svg>';

  // --- Build DOM ---
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }

  var launcher = el(
    '<div class="mc-launcher" aria-label="Reserve via ManyChat">' +
      '<div class="mc-bubble" role="button" tabindex="0">' +
        '<span class="mc-bubble__pulse"></span>' +
        '<span class="mc-bubble__icon">' + CHAT_ICON + '</span>' +
        '<span class="mc-bubble__label">Reserve via ManyChat</span>' +
      '</div>' +
    '</div>'
  );

  var panel = el(
    '<div class="mc-panel" role="dialog" aria-label="ManyChat pre-order">' +
      '<div class="mc-head">' +
        '<div class="mc-head__avatar">' + CAKE_ICON + '</div>' +
        '<div><h4>Good Husband Patisserie</h4><div class="status">Typically replies in under 2 min</div></div>' +
        '<button class="mc-head__close" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="mc-brandbar">Powered by ManyChat</div>' +
      '<div class="mc-body"></div>' +
      '<div class="mc-quick"></div>' +
    '</div>'
  );

  var bubble = launcher.querySelector(".mc-bubble");
  var body   = panel.querySelector(".mc-body");
  var quick  = panel.querySelector(".mc-quick");

  // --- Rendering helpers ---
  function scroll() { body.scrollTop = body.scrollHeight; }

  function botSay(html, cb) {
    var t = el('<div class="mc-typing"><span></span><span></span><span></span></div>');
    body.appendChild(t); scroll();
    setTimeout(function () {
      body.removeChild(t);
      var m = el('<div class="mc-msg mc-msg--bot"></div>'); m.innerHTML = html;
      body.appendChild(m); scroll();
      if (cb) cb();
    }, 620);
  }

  function userSay(text) {
    var m = el('<div class="mc-msg mc-msg--user"></div>'); m.textContent = text;
    body.appendChild(m); scroll();
  }

  function setQuick(nodes) {
    quick.innerHTML = "";
    nodes.forEach(function (n) { quick.appendChild(n); });
  }

  function chip(label, onClick) {
    var b = document.createElement("button"); b.type = "button"; b.textContent = label;
    b.addEventListener("click", onClick); return b;
  }

  // --- Flow steps ---
  function start() {
    body.innerHTML = ""; quick.innerHTML = "";
    order = { size: null, flavour: null, date: null, time: null, branch: null }; step = 0;
    botSay("Hi! 👋 Welcome to <b>Good Husband Patisserie</b>.", function () {
      botSay("Let's reserve your celebration cake in under 2 minutes. First — what <b>size</b> would you like?", askSize);
    });
  }

  function askSize() {
    setQuick(SIZES.map(function (s) {
      return chip(s, function () { order.size = s; userSay(s); askFlavour(); });
    }));
  }

  function askFlavour() {
    botSay("Lovely choice. Which <b>flavour</b> are you dreaming of?", function () {
      setQuick(FLAVOURS.map(function (f) {
        return chip(f, function () { order.flavour = f; userSay(f); askDate(); });
      }));
    });
  }

  function askDate() {
    botSay("When do you need it? Pick your <b>delivery / pickup date</b>. 🎂", function () {
      var input = document.createElement("input");
      input.type = "date";
      input.addEventListener("change", function () {
        if (!input.value) return;
        order.date = input.value; userSay(order.date); askTime();
      });
      setQuick([input]);
    });
  }

  function askTime() {
    botSay("Great — which <b>time slot</b> works best?", function () {
      setQuick(TIMES.map(function (t) {
        return chip(t, function () { order.time = t; userSay(t); askBranch(); });
      }));
    });
  }

  function askBranch() {
    botSay("Last one — which <b>branch</b> (or delivery)?", function () {
      setQuick(BRANCHES.map(function (b) {
        return chip(b, function () { order.branch = b; userSay(b); confirm(); });
      }));
    });
  }

  function confirm() {
    var summary =
      '<div class="mc-msg mc-msg--summary">' +
        '<b>Your reservation</b>' +
        row("Size", order.size) + row("Flavour", order.flavour) +
        row("Date", order.date) + row("Time", order.time) + row("Branch", order.branch) +
      '</div>';
    botSay("Here's your order summary — does everything look right?", function () {
      body.appendChild(el(summary)); scroll();
      setQuick([
        chip("✅ Confirm & reserve", handoff),
        chip("↺ Start over", start)
      ].map(function (b) { return b; }));
    });
  }

  function row(k, v) {
    return '<div class="mc-summary-row"><span>' + k + '</span><span>' + (v || "—") + '</span></div>';
  }

  function handoff() {
    userSay("Confirm & reserve");
    botSay("🎉 Your celebration is reserved! A team member will confirm availability and payment details <b>within 2 minutes</b> right here in chat.", function () {
      botSay("Prefer to finish another way?", function () {
        setQuick([
          chip("💬 Chat with staff now", function () { userSay("Chat with staff now"); botSay("Connecting you to a team member… they'll pick up this thread shortly. 💛"); quick.innerHTML = ""; }),
          chip("↺ New reservation", start)
        ]);
      });
    });
  }

  // --- Open / close ---
  var opened = false;
  function open() {
    panel.classList.add("open");
    bubble.setAttribute("aria-expanded", "true");
    if (!opened) { opened = true; start(); }
  }
  function close() { panel.classList.remove("open"); bubble.setAttribute("aria-expanded", "false"); }

  bubble.addEventListener("click", open);
  bubble.addEventListener("keypress", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  panel.querySelector(".mc-head__close").addEventListener("click", close);

  // Global hook used by every "Reserve via ManyChat" / "Reserve on ManyChat" CTA
  window.openManyChat = function () { open(); scroll(); };

  // --- Mount ---
  function mount() { document.body.appendChild(launcher); document.body.appendChild(panel); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
