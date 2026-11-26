# Moubon V13 — Owner Prelaunch Checklist

Complete only with real, approved information. Leave fields empty until verified. The prelaunch gate will intentionally remain FAIL until the required inputs are supplied.

## 1. Domain and claims

- [ ] Set `SITE_URL` in `config.js` to the final HTTPS domain.
- [ ] Review `heroTagline` and every line in `docs/BENGALI_TEXT_REVIEW.md`.
- [ ] Verify the phrase **“নির্মল ও খাঁটি”** with evidence before setting `claimsVerified: true`.
- [ ] Review `claimWatchlist` for any other claim that appears in visible text.
- [ ] Do not claim purity, organic status, laboratory testing, certification, health benefits, harvest dates or awards without evidence and permission to publish.

## 2. Business identity and contact

Fill `business` in `config.js`:

- [ ] `name` — official business name.
- [ ] `address` — real business address, if intended for publication.
- [ ] `phone` — official business phone.
- [ ] `email` — monitored business email.
- [ ] `returnPolicy` — approved return/refund wording.
- [ ] `deliveryPolicy` — approved delivery policy wording.
- [ ] `socialLinks` — official HTTPS pages only.
- [ ] `messengerPageUrl` — official Messenger page URL, if used.

## 3. WhatsApp ordering

- [ ] Set `whatsappNumber` to the official WhatsApp Business number, digits only, with country code (10–15 digits).
- [ ] Test a complete order handoff on a real phone.
- [ ] Confirm the message includes each item, variant, quantity, total, customer name, Bangladeshi mobile number and address.
- [ ] Confirm delivery charges and payment are clearly marked for owner confirmation when not configured.

## 4. Products and photography

For each real product:

- [ ] Add a unique `id`.
- [ ] Add the exact approved `name` and factual `description`.
- [ ] Add the exact package `size` or `variants`.
- [ ] Add verified `price` and variant prices.
- [ ] Add a real local product photo under `public/assets/` (WebP, AVIF, JPEG or PNG).
- [ ] Set `available` accurately.
- [ ] Set `published: true` only after all information is approved.
- [ ] Keep unpublished products out of the public storefront.

## 5. Delivery, payments and support

- [ ] Fill `delivery.description`, `delivery.areas` and `delivery.charge` only with confirmed terms.
- [ ] Fill `payments.bkash` and/or `payments.nagad` only with verified merchant details.
- [ ] Set `payments.cashOnDelivery: true` only if it is actually offered.
- [ ] Add `trustItems` only when evidence is current and publishable.
- [ ] Add FAQ entries only when answers are confirmed.
- [ ] Add social links only for official accounts.

## 6. Audio and licences

- [ ] Replace `public/assets/tiger-growl-demo.wav` with audio you own or have licensed, or confirm its commercial-use licence in writing.
- [ ] Do not add ambient sound unless the file is owned/licensed and supplied locally under `public/assets/`.
- [ ] Confirm rights for the supplied artwork and all future product photography.

## 7. Final checks

- [ ] Run `npm install`.
- [ ] Run `npx playwright install chromium`.
- [ ] Run `npm run dev` and inspect the site at 390, 768, 1440 and 1920 CSS pixels.
- [ ] Run `npm run shots` and review every screenshot and `qa-screenshots/QA_CONSOLE_REPORT.md`.
- [ ] Run `npm run lighthouse` and review both HTML reports.
- [ ] Run `npm run qa` and resolve every code, screenshot and prelaunch failure.
- [ ] Confirm there are no placeholder claims, fake business details, missing assets or broken order links.
- [ ] Deploy only after `PRELAUNCH_REPORT.md` shows PASS.
