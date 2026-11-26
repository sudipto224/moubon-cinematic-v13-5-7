# Moubon V13 — Empty Owner Configuration Template

Copy the values into `config.js` only after replacing each blank with verified information. This template intentionally contains no example business data, prices, phone numbers or product claims.

```js
export const SITE_URL = '';

export const MOUBON_CONFIG = Object.freeze({
  brand: 'মৌবন',
  siteDescription: '',
  heroTagline: '',
  claimsVerified: false,
  claimWatchlist: [],
  demoMode: false,
  whatsappNumber: '',
  messengerPageUrl: '',
  currency: '৳',
  useBengaliDigits: true,
  business: {
    name: '',
    address: '',
    phone: '',
    email: '',
    returnPolicy: '',
    deliveryPolicy: ''
  },
  delivery: {
    description: '',
    areas: '',
    charge: ''
  },
  payments: {
    bkash: '',
    nagad: '',
    cashOnDelivery: false
  },
  trustItems: [],
  socialLinks: [],
  faq: [],
  products: [
    // Add one object per real product only after its name, description, price and photo are verified.
    // {
    //   id: '',
    //   name: '',
    //   description: '',
    //   size: '',
    //   price: null,
    //   image: '',
    //   available: true,
    //   published: false,
    //   variants: []
    // }
  ]
});
```

`SITE_URL` is exported separately from `MOUBON_CONFIG` in the live `config.js`. Keep it as one canonical source of truth.
