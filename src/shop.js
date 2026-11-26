/** Config-driven storefront with client-side cart, checkout confirmation, and optional WhatsApp handoff. */
const $ = (selector, scope=document) => scope.querySelector(selector);
const isPrice = value => Number.isFinite(Number(value)) && Number(value) > 0;

function formatPrice(value, settings) {
  if (!isPrice(value)) return 'দাম নিশ্চিত করুন';
  const locale = settings.useBengaliDigits === false ? 'en-US' : 'bn-BD';
  const amount = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Number(value));
  return `${settings.currency || '৳'}${amount}`;
}

function focusableWithin(container) {
  return [...container.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex]:not([tabindex="-1"])')]
    .filter(element => !element.hidden && element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length);
}

function createImageSlot(product, className='product-image') {
  const slot = document.createElement('div');
  slot.className = className;
  if (product.image) {
    const image = document.createElement('img');
    image.src = product.image;
    image.alt = `${product.name || 'মৌবন'} — পণ্যের ছবি`;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      image.remove();
      slot.classList.add('is-placeholder');
      const label = document.createElement('span');
      label.textContent = 'পণ্যের ছবি যোগ করা হয়নি।';
      slot.append(label);
    }, { once: true });
    slot.append(image);
  } else {
    slot.classList.add('is-placeholder');
    const label = document.createElement('span');
    label.textContent = 'পণ্যের ছবি যোগ করা হয়নি।';
    slot.append(label);
  }
  return slot;
}

export function setupShop(settings={}) {
  const demoMode = settings.demoMode === true;
  const products = (Array.isArray(settings.products) ? settings.products : []).filter(product => product?.published === true);
  const byId = new Map(products.map(product => [String(product.id), product]));
  const cart = new Map();
  const selectedVariants = new Map();
  const grid = $('#products'), count = $('#cartCount'), drawer = $('#cartDrawer');
  const headerCount = $('#headerCartCount');
  const items = $('#cartItems'), total = $('#cartTotal'), toast = $('#toast');
  const checkout = $('#checkoutForm'), dialog = $('#productDialog');
  const dialogContent = $('#productDialogContent');
  const confirmation = $('#orderConfirmation');
  const businessPhone = String(settings.whatsappNumber || '');
  const whatsappReady = /^\d{10,15}$/.test(businessPhone);
  let timeoutId, lastFocus, dialogLastFocus;

  function notice(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => toast.classList.remove('visible'), 4200);
  }
  function getVariant(product, variantId) {
    return (product.variants || []).find(variant => String(variant.id) === String(variantId)) || null;
  }
  function getSelectedVariant(product) {
    const id = selectedVariants.get(String(product.id));
    return id ? getVariant(product, id) : null;
  }
  function priceOf(product, variant=null) {
    return isPrice(variant?.price) ? Number(variant.price) : isPrice(product.price) ? Number(product.price) : null;
  }
  function productAvailable(product) {
    return product.available !== false && (!(product.variants || []).length || product.variants.some(variant => variant.available !== false));
  }
  function cartTotals() {
    let totalPrice = 0;
    let allPricesKnown = true;
    let quantity = 0;
    for (const entry of cart.values()) {
      const product = byId.get(entry.productId);
      if (!product) continue;
      const variant = getVariant(product, entry.variantId);
      const unitPrice = priceOf(product, variant);
      quantity += entry.quantity;
      if (unitPrice === null) allPricesKnown = false;
      else totalPrice += unitPrice * entry.quantity;
    }
    return { totalPrice, allPricesKnown, quantity };
  }
  const CART_STORAGE_KEY = 'moubon-cart-v1';
  function cartKey(productId, variantId='') { return `${productId}::${variantId || 'default'}`; }
  function restoreCart() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]');
      if (!Array.isArray(stored)) return;
      for (const item of stored) {
        const productId = String(item?.productId || '');
        const product = byId.get(productId);
        const quantity = Math.max(0, Math.min(99, Math.trunc(Number(item?.quantity) || 0)));
        const variantId = String(item?.variantId || '');
        if (!product || !productAvailable(product) || !quantity) continue;
        if (variantId && !getVariant(product, variantId)) continue;
        const entry = { productId, variantId, quantity };
        cart.set(cartKey(productId, variantId), entry);
        if (variantId) selectedVariants.set(productId, variantId);
      }
    } catch { /* Storage may be unavailable in private browsing; cart still works in memory. */ }
  }
  function add(product, variant=null) {
    if (!productAvailable(product)) { notice('পণ্যটি এই মুহূর্তে পাওয়া যাচ্ছে না।'); return; }
    const variantId = variant ? String(variant.id) : '';
    const key = cartKey(product.id, variantId);
    const entry = cart.get(key) || { productId: String(product.id), variantId, quantity: 0 };
    entry.quantity = Math.min(99, entry.quantity + 1);
    cart.set(key, entry);
    updateCart();
  }
  function change(key, delta) {
    const entry = cart.get(key);
    if (!entry) return;
    entry.quantity = Math.max(0, Math.min(99, entry.quantity + delta));
    if (!entry.quantity) cart.delete(key); else cart.set(key, entry);
    updateCart();
  }
  function createVariantSelect(product, className='product-variant') {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    if (!variants.length) {
      const note = document.createElement('p');
      note.className = 'variant-pending';
      note.textContent = product.size || 'পরিমাণ নিশ্চিত করুন';
      return note;
    }
    const select = document.createElement('select');
    select.className = className;
    select.setAttribute('aria-label', `${product.name} — পরিমাণ বেছে নাও`);
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'পরিমাণ বেছে নাও';
    placeholder.disabled = true;
    placeholder.selected = !selectedVariants.has(String(product.id));
    select.append(placeholder);
    variants.forEach(variant => {
      const option = document.createElement('option');
      option.value = String(variant.id);
      option.textContent = `${variant.label}${isPrice(variant.price) ? ` · ${formatPrice(variant.price, settings)}` : ''}`;
      option.disabled = variant.available === false;
      option.selected = String(selectedVariants.get(String(product.id)) || '') === String(variant.id);
      select.append(option);
    });
    select.addEventListener('change', () => selectedVariants.set(String(product.id), select.value));
    return select;
  }
  function updateCart() {
    const { totalPrice, allPricesKnown, quantity } = cartTotals();
    count.textContent = String(quantity);
    if (headerCount) headerCount.textContent = String(quantity);
    items.replaceChildren();
    if (!quantity) {
      const empty = document.createElement('p');
      empty.className = 'cart-empty';
      empty.textContent = 'এখনো কোনো পণ্য কার্টে যোগ করোনি।';
      items.append(empty);
    }
    for (const [key, entry] of cart) {
      const product = byId.get(entry.productId);
      if (!product) continue;
      const variant = getVariant(product, entry.variantId);
      const unitPrice = priceOf(product, variant);
      const line = document.createElement('div');
      line.className = 'cart-line';
      const details = document.createElement('div');
      details.className = 'cart-line-details';
      const title = document.createElement('strong');
      title.textContent = product.name;
      const small = document.createElement('small');
      small.textContent = `${variant?.label || product.size || 'পরিমাণ নিশ্চিত করুন'} · ${unitPrice === null ? 'দাম নিশ্চিত করুন' : formatPrice(unitPrice, settings)}`;
      details.append(title, small);
      const controls = document.createElement('div');
      controls.className = 'qty-controls';
      const minus = document.createElement('button');
      minus.type = 'button'; minus.textContent = '−'; minus.setAttribute('aria-label', `${product.name} কমাও`);
      minus.addEventListener('click', () => change(key, -1));
      const value = document.createElement('span');
      value.textContent = String(entry.quantity); value.setAttribute('aria-label', 'পরিমাণ');
      const plus = document.createElement('button');
      plus.type = 'button'; plus.textContent = '+'; plus.setAttribute('aria-label', `${product.name} বাড়াও`);
      plus.addEventListener('click', () => change(key, 1));
      controls.append(minus, value, plus);
      line.append(details, controls);
      items.append(line);
    }
    total.textContent = quantity && allPricesKnown ? formatPrice(totalPrice, settings) : 'দাম নিশ্চিত করুন';
    $('#cartSend').disabled = !quantity;
    try { window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([...cart.values()])); } catch { /* Keep the in-memory cart usable if storage is blocked. */ }
  }

  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    document.body.classList.add('cart-opened');
    $('#cartClose').focus();
  }
  function closeDrawer(restore=true) {
    drawer.hidden = true;
    document.body.classList.remove('cart-opened');
    if (restore && lastFocus?.isConnected) lastFocus.focus();
  }
  $('#cartOpen').addEventListener('click', openDrawer);
  $('#headerCartOpen')?.addEventListener('click', openDrawer);
  $('#cartClose').addEventListener('click', () => closeDrawer());
  $('#cartBackdrop').addEventListener('click', () => closeDrawer());
  $('#cartClear').addEventListener('click', () => { cart.clear(); if (confirmation) confirmation.hidden = true; checkout.reset(); updateCart(); notice('কার্ট খালি করা হয়েছে।'); });

  document.addEventListener('keydown', event => {
    if (drawer.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeDrawer(); return; }
    if (event.key === 'Tab') {
      const focusable = focusableWithin(drawer);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  function closeProduct() {
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else {
      dialog.removeAttribute('open');
      if (dialogLastFocus?.isConnected) dialogLastFocus.focus();
    }
  }
  function openProduct(product) {
    dialogLastFocus = document.activeElement;
    dialogContent.replaceChildren();
    const wrap = document.createElement('div'); wrap.className = 'product-detail';
    const image = createImageSlot(product, 'product-detail-image');
    const body = document.createElement('div'); body.className = 'product-detail-copy';
    const eyebrow = document.createElement('p'); eyebrow.className = 'kicker'; eyebrow.textContent = 'MOUBON / PRODUCT DETAILS';
    const title = document.createElement('h2'); title.id = 'productDialogTitle'; title.textContent = product.name;
    const description = document.createElement('p'); description.textContent = product.description || 'পণ্যের যাচাইকৃত বিবরণ যোগ করা হয়নি।';
    const variant = createVariantSelect(product, 'product-variant detail-variant');
    const price = document.createElement('strong'); price.className = 'product-detail-price';
    const updatePrice = () => { price.textContent = formatPrice(priceOf(product, getSelectedVariant(product)), settings); };
    variant.addEventListener?.('change', updatePrice);
    updatePrice();
    body.append(eyebrow, title, description, variant, price);
    if (!productAvailable(product)) {
      const unavailable = document.createElement('p');
      unavailable.className = 'unavailable-label';
      unavailable.textContent = 'পণ্যটি এই মুহূর্তে পাওয়া যাচ্ছে না।';
      body.append(unavailable);
    } else {
      const addButton = document.createElement('button');
      addButton.type = 'button'; addButton.className = 'order-btn'; addButton.textContent = 'কার্টে যোগ করুন';
      addButton.addEventListener('click', () => {
        const selected = getSelectedVariant(product);
        if ((product.variants || []).length && (!selected || selected.available === false)) { notice('আগে পণ্যের পরিমাণ বেছে নাও।'); return; }
        add(product, selected); closeProduct(); notice(`${product.name} কার্টে যোগ হয়েছে।`);
      });
      body.append(addButton);
    }
    wrap.append(image, body);
    dialogContent.append(wrap);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    $('.dialog-close', dialog)?.focus();
  }
  $('.dialog-close', dialog)?.addEventListener('click', event => { event.preventDefault(); closeProduct(); });
  dialog.addEventListener('close', () => {
    if (dialogLastFocus?.isConnected) dialogLastFocus.focus();
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) closeProduct(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape' && typeof dialog.showModal !== 'function') { event.preventDefault(); closeProduct(); return; }
    if (event.key !== 'Tab') return;
    const focusable = focusableWithin(dialog);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  if (!products.length) {
    const empty = document.createElement('p');
    empty.className = 'product-empty';
    empty.textContent = 'পণ্য প্রকাশের তথ্য এখনো যোগ করা হয়নি।';
    grid.append(empty);
  }
  for (const product of products) {
    const card = document.createElement('article'); card.className = 'product-card';
    const imageBox = createImageSlot(product, 'product-image');
    const badgeText = demoMode ? 'নমুনা পণ্য' : String(product.badge || '');
    if (badgeText) {
      const badge = document.createElement('span'); badge.className = 'product-badge'; badge.textContent = badgeText; imageBox.append(badge);
    }
    const body = document.createElement('div'); body.className = 'product-content';
    const title = document.createElement('h3'); title.textContent = product.name || 'মৌবন মধু';
    const description = document.createElement('p'); description.textContent = product.description || 'পণ্যের বিবরণ যোগ করা হয়নি।';
    const variant = createVariantSelect(product);
    const bottom = document.createElement('div'); bottom.className = 'product-bottom';
    const price = document.createElement('span'); price.className = 'product-price';
    const updatePrice = () => { price.textContent = formatPrice(priceOf(product, getSelectedVariant(product)), settings); };
    variant.addEventListener?.('change', updatePrice);
    updatePrice();
    const actions = document.createElement('div'); actions.className = 'product-actions';
    const detail = document.createElement('button'); detail.type = 'button'; detail.className = 'product-detail-btn'; detail.textContent = 'বিস্তারিত';
    detail.addEventListener('click', () => openProduct(product));
    const addButton = document.createElement('button'); addButton.type = 'button'; addButton.className = 'order-btn'; addButton.textContent = 'কার্টে যোগ +';
    addButton.disabled = !productAvailable(product);
    if (!productAvailable(product)) {
      card.classList.add('is-unavailable');
      const unavailable = document.createElement('span'); unavailable.className = 'unavailable-label'; unavailable.textContent = 'পণ্যটি এই মুহূর্তে পাওয়া যাচ্ছে না।';
      body.append(unavailable);
    }
    addButton.addEventListener('click', () => {
      const selected = getSelectedVariant(product);
      if ((product.variants || []).length && (!selected || selected.available === false)) { notice('আগে পণ্যের পরিমাণ বেছে নাও।'); return; }
      add(product, selected); notice(`${product.name} কার্টে যোগ হয়েছে।`); openDrawer();
    });
    actions.append(detail, addButton);
    bottom.append(price, actions);
    body.append(title, description, variant, bottom);
    card.append(imageBox, body);
    grid.append(card);
  }

  const trust = $('#shopTrust');
  const verifiedTrustItems = Array.isArray(settings.trustItems) ? settings.trustItems.filter(item => item?.label && item?.value) : [];
  if (verifiedTrustItems.length) {
    trust.hidden = false;
    for (const item of verifiedTrustItems) {
      const block = document.createElement('div'); block.className = 'trust-item';
      const label = document.createElement('span'); label.textContent = item.label;
      const value = document.createElement('strong'); value.textContent = item.value;
      block.append(label, value); trust.append(block);
    }
  }

  $('#shopIntro').textContent = demoMode
    ? 'পণ্যের তথ্য যাচাই করে নিজের সংগ্রহ প্রকাশ করুন।'
    : products.length ? 'মৌবনের সংগ্রহ থেকে পছন্দের পণ্য বেছে নাও। কার্টে যোগ করে অর্ডার কনফার্ম করো।' : 'পণ্য প্রকাশের তথ্য এখনো যোগ করা হয়নি।';
  $('#shopToolbarNote').textContent = demoMode ? 'পণ্যের তথ্য যাচাই করুন' : 'মৌবনের নির্বাচিত সংগ্রহ';
  const demoNotice = $('#demoNotice');
  if (demoMode && demoNotice) { demoNotice.hidden = false; demoNotice.textContent = 'এখানে পণ্যের তথ্য যাচাই করে প্রকাশ করুন।'; }
  $('#cartInstruction').textContent = whatsappReady
    ? 'যোগাযোগের তথ্য পূরণ করে অর্ডার কনফার্ম করো। চাইলে পরে WhatsApp-এ সারাংশ পাঠানো যাবে।'
    : 'যোগাযোগের তথ্য পূরণ করে অর্ডার কনফার্ম করো।';

  const orderSetupNotice = $('#orderSetupNotice');
  const shopOrderSetupNotice = $('#shopOrderSetupNotice');
  if (orderSetupNotice) orderSetupNotice.hidden = true;
  if (shopOrderSetupNotice) shopOrderSetupNotice.hidden = true;

  const delivery = settings.delivery || {};
  const hasDelivery = Boolean(delivery.description || delivery.areas || delivery.charge);
  const paymentOptions = $('#paymentOptions');
  const paymentItems = [];
  for (const [label, key] of [['bKash', 'bkash'], ['Nagad', 'nagad'], ['Cash on Delivery', 'cashOnDelivery']]) {
    const configured = key === 'cashOnDelivery' ? settings.payments?.cashOnDelivery === true : Boolean(settings.payments?.[key]);
    if (configured) paymentItems.push({ label, value: key === 'cashOnDelivery' ? 'উপলভ্য' : String(settings.payments[key]) });
  }
  const hasPayments = paymentItems.length > 0;
  $('#shopInfo').hidden = !hasDelivery && !hasPayments;
  $('#deliveryCopy').hidden = !hasDelivery;
  if (hasDelivery) {
    $('#deliveryCopy').textContent = [delivery.description, delivery.areas ? `ডেলিভারি এলাকা: ${delivery.areas}` : '', delivery.charge ? `ডেলিভারি চার্জ: ${delivery.charge}` : ''].filter(Boolean).join(' · ');
  }
  paymentOptions.hidden = !hasPayments;
  for (const item of paymentItems) {
    const block = document.createElement('div'); block.className = 'payment-item';
    const label = document.createElement('span'); label.textContent = item.label;
    const value = document.createElement('strong'); value.textContent = item.value;
    block.append(label, value); paymentOptions.append(block);
  }

  const faqItems = Array.isArray(settings.faq) ? settings.faq.filter(item => item?.question && item?.answer) : [];
  const faqList = $('#faqList');
  $('#shopFaqSection').hidden = !faqItems.length;
  faqItems.forEach(item => {
    const details = document.createElement('details'); details.className = 'faq-item';
    const summary = document.createElement('summary'); summary.textContent = item.question;
    const answer = document.createElement('p'); answer.textContent = item.answer;
    details.append(summary, answer); faqList.append(details);
  });

  const business = settings.business || {};
  const footerBusiness = $('#footerBusiness');
  const hasBusiness = Boolean(business.name || business.address || business.phone || business.email || business.returnPolicy || business.deliveryPolicy || (settings.socialLinks || []).length);
  footerBusiness.hidden = !hasBusiness;
  function addFooterText(label, value, href='') {
    if (!value) return;
    const line = document.createElement('p');
    if (href) {
      const link = document.createElement('a'); link.href = href; link.textContent = `${label}: ${value}`; line.append(link);
    } else line.textContent = `${label}: ${value}`;
    footerBusiness.append(line);
  }
  addFooterText('ব্যবসা', business.name);
  addFooterText('ঠিকানা', business.address);
  addFooterText('ফোন', business.phone, business.phone ? `tel:${business.phone.replace(/[^+\d]/g, '')}` : '');
  addFooterText('ইমেইল', business.email, business.email ? `mailto:${business.email}` : '');
  addFooterText('ফেরত নীতি', business.returnPolicy);
  addFooterText('ডেলিভারি নীতি', business.deliveryPolicy);
  for (const social of (settings.socialLinks || [])) {
    const url = typeof social === 'string' ? social : social?.url;
    const label = typeof social === 'object' ? social.label : '';
    if (!url || !/^https:\/\//i.test(url)) continue;
    const link = document.createElement('a'); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = label || new URL(url).hostname.replace(/^www\./, '');
    footerBusiness.append(link);
  }

  const messenger = $('#messengerHandoff');
  if (settings.messengerPageUrl && /^https:\/\//i.test(settings.messengerPageUrl)) {
    messenger.href = settings.messengerPageUrl;
    messenger.hidden = false;
  }

  checkout.addEventListener('submit', event => {
    event.preventDefault();
    const entries = [...cart.values()].filter(entry => entry.quantity > 0);
    if (!entries.length) { notice('প্রথমে একটি পণ্য নির্বাচন করো।'); return; }
    const formData = new FormData(checkout);
    const customer = {
      name: String(formData.get('customerName') || '').trim(),
      email: String(formData.get('customerEmail') || '').trim(),
      phone: String(formData.get('customerPhone') || '').trim(),
      address: String(formData.get('customerAddress') || '').trim(),
      note: String(formData.get('customerNote') || '').trim()
    };
    if (!customer.name || !customer.email || !customer.phone || !customer.address) { notice('নাম, ইমেইল, মোবাইল নম্বর ও ঠিকানা পূরণ করো।'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) { notice('সঠিক ইমেইল ঠিকানা লিখুন।'); return; }
    const normalizedCustomerPhone = customer.phone.replace(/\D/g, '');
    if (!/^01[3-9]\d{8}$/.test(normalizedCustomerPhone)) { notice('বাংলাদেশি মোবাইল নম্বর 01XXXXXXXXX আকারে লিখুন।'); return; }
    const orderLines = entries.map(entry => {
      const product = byId.get(entry.productId);
      const variant = getVariant(product, entry.variantId);
      const price = priceOf(product, variant);
      return {
        name: product.name,
        quantity: entry.quantity,
        label: variant?.label || product.size || 'পরিমাণ নিশ্চিত করুন',
        lineTotal: price === null ? null : price * entry.quantity
      };
    });
    const { totalPrice, allPricesKnown } = cartTotals();
    const orderId = `MB-${String(Date.now()).slice(-8)}`;
    const order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customer,
      items: orderLines,
      totalPrice: allPricesKnown ? totalPrice : null
    };
    try {
      const existing = JSON.parse(window.localStorage.getItem('moubon-orders-v1') || '[]');
      const next = Array.isArray(existing) ? existing : [];
      next.unshift(order);
      window.localStorage.setItem('moubon-orders-v1', JSON.stringify(next.slice(0, 20)));
    } catch {}

    if (confirmation) {
      const itemSummary = orderLines.map(item => `${item.name} (${item.label}) × ${item.quantity}`).join(' · ');
      confirmation.hidden = false;
      confirmation.innerHTML = `<strong>অর্ডার কনফার্ম হয়েছে</strong><span>অর্ডার আইডি: <b>${orderId}</b></span><small>${itemSummary}</small><small>নাম: ${customer.name} · ইমেইল: ${customer.email} · মোবাইল: ${normalizedCustomerPhone}</small><small>ঠিকানা: ${customer.address}</small>${customer.note ? `<small>নোট: ${customer.note}</small>` : ''}<small>মোট: ${allPricesKnown ? formatPrice(totalPrice, settings) : 'মূল্য পরে নিশ্চিত হবে'}</small>`;
    }

    cart.clear();
    updateCart();
    checkout.reset();
    notice('তোমার অর্ডার সফলভাবে কনফার্ম হয়েছে।');
  });

  restoreCart();
  updateCart();
}
