/** মৌবন সাইট কনফিগারেশন — প্রকাশের আগে নিজের যাচাইকৃত তথ্য যোগ করুন। */
export const SITE_URL = 'https://your-domain.example';

export const MOUBON_CONFIG = Object.freeze({
  brand: 'মৌবন',
  siteDescription: 'মৌবন: সুন্দরবনের মৌয়ালদের মধু সংগ্রহের গল্প, নদীপথ ও প্রকৃতির সোনালি উপহার।',
  heroTagline: 'সুন্দরবনের অরণ্য থেকে\nনির্মল ও খাঁটি মধুর গল্প',
  claimsVerified: false,
  claimWatchlist: Object.freeze(['নির্মল ও খাঁটি', 'খাঁটি', 'নির্মল', '১০০%', 'অর্গানিক']),
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
  products: Object.freeze([
    Object.freeze({
      id: 'moubon-honey-250g',
      name: 'মৌবন মধু · ২৫০ গ্রাম',
      description: 'ছোট পরিবারের জন্য উপযোগী ২৫০ গ্রাম প্রিমিয়াম মধুর কাচের বয়াম। প্রতিদিনের ব্যবহারের জন্য সুবিধাজনক।',
      image: '/assets/honey-jar-250g.svg',
      badge: '২৫০ গ্রাম',
      size: '২৫০ গ্রাম',
      price: 450,
      published: true,
      available: true
    }),
    Object.freeze({
      id: 'moubon-honey-500g',
      name: 'মৌবন মধু · ৫০০ গ্রাম',
      description: 'পরিবারের নিয়মিত ব্যবহারের জন্য ৫০০ গ্রাম সিলেক্টেড প্রিমিয়াম মধু। উপহার বা ঘরোয়া ব্যবহারে দারুণ মানানসই।',
      image: '/assets/honey-jar-500g.svg',
      badge: '৫০০ গ্রাম',
      size: '৫০০ গ্রাম',
      price: 850,
      published: true,
      available: true
    }),
    Object.freeze({
      id: 'moubon-honey-1kg',
      name: 'মৌবন মধু · ১ কেজি',
      description: 'বড় পরিবারের জন্য ১ কেজি সমৃদ্ধ প্রিমিয়াম মধু। দীর্ঘদিন সংরক্ষণ ও নিয়মিত ব্যবহারের জন্য উপযুক্ত।',
      image: '/assets/honey-jar-1kg.svg',
      badge: '১ কেজি',
      size: '১ কেজি',
      price: 1600,
      published: true,
      available: true
    })
  ])
});

if (typeof window !== 'undefined') window.MOUBON_CONFIG = MOUBON_CONFIG;
