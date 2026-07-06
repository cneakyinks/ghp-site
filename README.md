# Good Husband Patisserie — "Reserve Your Celebration" prototype

A static, front-end prototype refining goodhusbandpatisserie.com to support the
**Reserve Your Celebration** custom-cake campaign — the landing destination for
Meta Ads traffic, built to convert visitors into pre-orders while keeping response
time under 2 minutes via ManyChat.

The brand's **pastel side** leads the visual language: soft cream/blush/sage/butter
blends behind each section (dark brown is retired as a background and kept only as
text ink), a warm terracotta accent alongside the maroon, seamless wave dividers
between sections, and flowy scroll-reveal + parallax motion with drifting bake
photos. The maroon footer/topbar and elegant serif wordmark are kept.

## Preview

Open `index.html` in a browser, or serve the folder:

```bash
cd /Users/cneaky/MYN/GHP
python3 -m http.server 8000
# → http://localhost:8000
```

## Files

| File | What it is |
|------|------------|
| `index.html` | Home — campaign hero ("Reserve Your Celebration"), how-it-works, "Our Masterpieces" (real photos, elevated centre), pinned nav CTA |
| `shop.html` | Shop **list** — filter pills (All / Best Sellers / Whole Cakes / Slices / Viennoiseries) over a grid of real products; each links to the detail page |
| `product.html` | Product **detail** — gallery, size/flavour dropdowns, price, delivery slot picker (kept as-is) + new **Reserve on ManyChat** button next to Add to Cart |
| `blog.html` | Blog / **The Journal** — the live site's blog re-themed to the prototype: chocolate hero, category filter pills, a featured latest post, then a grid of real post titles/dates/categories |
| `faq.html` | FAQ — all original categories preserved, plus the new Ordering entry about ManyChat |
| `assets/css/styles.css` | Design system — real brand palette/fonts as CSS variables |
| `assets/js/manychat-widget.js` | Floating ManyChat webchat widget + guided flow (replaces the old WhatsApp bubble) |
| `assets/js/contact-modal.js` | **Contact** pop-up — opens over any page (no separate contact page) with the three real JB branches, hours, phone, email and a Reserve-via-ManyChat handoff |
| `assets/js/scroll-fx.js` | Flowy motion — scroll-reveal (IntersectionObserver) + parallax drift for the floating `.bake-orb` photos and hero card; disabled under `prefers-reduced-motion` |
| `assets/js/main.js` | FAQ accordion, product selectors, shop filter pills, mobile nav |
| `assets/img/` | Real logo + product photography pulled from the live site |

## Brand alignment (matched to the live site)

Extracted from goodhusbandpatisserie.com (WordPress/WooCommerce, Qode theme):
- **Colours:** chocolate `#241C10`, maroon `#691C32`, body text `#63605A`, cream/white
  dominant. Maroon is the primary accent (buttons, footer, logo); gold is used sparingly.
- **Type:** Heebo (body/UI) + an elegant serif for display, echoing the maroon serif logo.
- **Imagery:** the real logo (`logo-dark.png` / `logo-white.png`) and product photos
  (Pistachio, Classic Chocolate, Praline Noisette, Black Forest, etc.) on clean white.
- **Layout:** one dark chocolate campaign hero (echoing the real "Verte No.66 /
  Pre-Order Now" banner), then bright cream sections, maroon footer.

## What changed vs. the live site

- **Home hero** → campaign-specific: headline *Reserve Your Celebration*, subhead
  *Custom Cakes, Delivered Fresh Across Johor Bahru*, custom-cake product shot,
  persistent **Reserve via ManyChat** CTA. A second pinned CTA sits in the nav bar
  **alongside** the existing Shop link (it does not replace it).
- **Product page** → adds one **Reserve on ManyChat** button next to Add to Cart.
  Gallery, dropdowns, price and delivery slot picker are untouched.
- **Nav** → *Blog* now points to the real `blog.html` (was an on-page anchor);
  *Contact* opens a modal pop-up (`window.openContact()`) instead of scrolling to a
  section, so it works identically from every page and the footer "Contact Us" link.
- **FAQ** → one new entry under *Ordering*:
  *"Can I order through ManyChat? … tap 'Reserve via ManyChat' … for a guided,
  minute-fast pre-order chat."* All existing categories are preserved verbatim.
- **Floating widget** → the WhatsApp "Need Help? Chat with us" bubble is replaced by
  a ManyChat webchat bubble in the **same bottom-right position and bubble style**.
  It runs the guided flow: greet → size → flavour → date/time & branch → confirm →
  handoff to staff.

**Untouched by design:** colour palette, fonts, logo, footer links, page structure.

## The ManyChat widget

`assets/js/manychat-widget.js` is a **working mock** of the ManyChat guided flow so
stakeholders can feel the sub-2-minute pre-order experience. Every CTA calls the
global `window.openManyChat()` hook.

### Going live — swap in the real ManyChat webchat

1. In ManyChat: **Settings → Growth Tools → Widgets → Customer Chat / Embeddable
   Webchat**, build the flow (size → flavour → date/time → branch → confirm →
   Live Chat handoff), and copy the embed snippet.
2. In each HTML page, replace the line
   `<script src="assets/js/manychat-widget.js"></script>` with ManyChat's snippet.
3. Point the CTA buttons at ManyChat by making `window.openManyChat` open the real
   widget (ManyChat exposes a JS API to open the webchat), so the buttons keep
   working with no markup changes.

Because all CTAs already funnel through `window.openManyChat()`, the buttons, hero,
nav pin, product page and footer need **zero changes** when the real widget goes in.

## Notes / placeholders

- Product imagery is rendered as styled dark-studio SVG placeholders labelled
  "Product photography" — drop in the real photos (same dark-background, gold-accent
  style) by replacing the `.photo` blocks.
- Branch names (Mount Austin, Bukit Indah, Sutera Utama) and prices are plausible
  placeholders — confirm against live data before launch.
- Links like Privacy Policy, Blog, My Account point to `#` — wire to real URLs when
  merging into the production site.
- The product description keeps a soft WhatsApp mention ("ask us to check
  availability") and adds a ManyChat reserve link; redirect that fully to ManyChat
  if you prefer a single channel.
