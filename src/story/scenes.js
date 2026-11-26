/**
 * Responsive route and single source of truth for six owner-supplied 5-second story films.
 * Video is loaded only for the active stop; poster frames are extracted from those same clips.
 */
export const RIVER_ROUTE = Object.freeze({
  startProgress: 0,
  endProgress: 1,
  viewportAnchor: 0.64,
  mobileViewportAnchor: 0.76,
  sceneFadeSpan: 0.12,
  boatFadeSpan: 0.055,
  stopSlowdown: 0.18,
  desktopWaterHalfWidth: 0.14,
  tabletWaterHalfWidth: 0.16,
  mobileWaterHalfWidth: 0.20,
  boatImage: '/assets/boat.webp',
  boatImageSmall: '/assets/boat-800.webp',
  boatBaseRotation: -30,
  boatRotationSample: 0.014
});

export const STORY_SCENES = Object.freeze([
  Object.freeze({
    id: 'footprints', number: '01', phase: 'ভোরের সতর্কতা', showPhase: false, label: 'STAY ALERT',
    title: 'সতর্ক পা',
    copy: 'বনের পথে বাঘের ছাপ দেখে এগোয় সতর্ক মৌয়াল।',
    copyLines: Object.freeze(['বনের পথে বাঘের ছাপ দেখে', 'এগোয় সতর্ক মৌয়াল।']),
    alt: 'সুন্দরবনের কাদামাটিতে বাঘের পায়ের ছাপ পরীক্ষা করছেন এক মৌয়াল',
    side: 'left', at: 0.20, motion: 'footprints',
    video: '/assets/story-video/scene-01-footprints.mp4',
    poster: '/assets/story-posters/scene-01-footprints.webp',
    duration: 5,
    imageSize: Object.freeze({ width: 1280, height: 720 })
  }),
  Object.freeze({
    id: 'tiger', number: '02', phase: 'বনের নীরবতা', label: 'THE WILD',
    title: 'বনের নীরব প্রহরী',
    copy: 'ঝোপের আড়ালে গর্জন। মৌয়ালরা সতর্ক হয়।',
    copyLines: Object.freeze(['ঝোপের আড়ালে গর্জন।', 'মৌয়ালরা সতর্ক হয়।']),
    alt: 'সুন্দরবনের ম্যানগ্রোভ বনের পাশে দাঁড়িয়ে থাকা একটি রয়েল বেঙ্গল টাইগার',
    side: 'right', at: 0.33, motion: 'tiger',
    video: '/assets/story-video/scene-02-tiger.mp4',
    poster: '/assets/story-posters/scene-02-tiger.webp',
    duration: 5,
    imageSize: Object.freeze({ width: 1280, height: 720 }),
    audio: true
  }),
  Object.freeze({
    id: 'honeycomb', number: '03', phase: 'মৌচাকের দেখা', label: 'THE DISCOVERY',
    title: 'মৌচাকের সন্ধান',
    copy: 'ডালের ফাঁকে মেলে বনজ মৌচাকের দেখা।',
    copyLines: Object.freeze(['ডালের ফাঁকে মেলে', 'বনজ মৌচাকের দেখা।']),
    alt: 'সুন্দরবনের গাছে ঝুলে থাকা বড় মৌচাকের দিকে তাকিয়ে আছেন এক মৌয়াল',
    side: 'left', at: 0.45, motion: 'discovery',
    video: '/assets/story-video/scene-03-discovery.mp4',
    poster: '/assets/story-posters/scene-03-discovery.webp',
    duration: 5,
    imageSize: Object.freeze({ width: 1280, height: 720 })
  }),
  Object.freeze({
    id: 'smoke', number: '04', phase: 'প্রস্তুতির ক্ষণ', label: 'THE PREPARATION',
    title: 'ধোঁয়ার আড়ালে',
    copy: 'ধোঁয়ার কুণ্ডলীতে শুরু হয় সাবধানী প্রস্তুতি।',
    copyLines: Object.freeze(['ধোঁয়ার কুণ্ডলীতে শুরু হয়', 'সাবধানী প্রস্তুতি।']),
    alt: 'মৌচাকের নিচে ধোঁয়া দিচ্ছেন একজন সুন্দরবনের মৌয়াল',
    side: 'right', at: 0.58, motion: 'smoke',
    video: '/assets/story-video/scene-04-smoke.mp4',
    poster: '/assets/story-posters/scene-04-smoke.webp',
    duration: 5,
    imageSize: Object.freeze({ width: 1280, height: 720 })
  }),
  Object.freeze({
    id: 'harvest', number: '05', phase: 'সোনালি সংগ্রহ', label: 'THE HARVEST',
    title: 'মধু সংগ্রহ',
    copy: 'অভিজ্ঞ হাতে সংগ্রহ হয় প্রকৃতির মধুর দান।',
    copyLines: Object.freeze(['অভিজ্ঞ হাতে সংগ্রহ হয়', 'প্রকৃতির মধুর দান।']),
    alt: 'মৌচাক থেকে পাত্রে সোনালি মধু সংগ্রহ করছেন একজন মৌয়াল',
    side: 'left', at: 0.70, motion: 'harvest',
    video: '/assets/story-video/scene-05-harvest.mp4',
    poster: '/assets/story-posters/scene-05-harvest.webp',
    duration: 5,
    imageSize: Object.freeze({ width: 1280, height: 720 })
  }),
  Object.freeze({
    id: 'gift', number: '06', phase: 'সোনালি উপহার', label: 'NATURE’S GIFT',
    title: 'প্রকৃতির সোনালি দান',
    copy: 'নদীপথের শেষে মধুর মিষ্টি উপহার।',
    copyLines: Object.freeze(['নদীপথের শেষে', 'মধুর মিষ্টি উপহার।']),
    alt: 'সুন্দরবনের মৌয়াল কাঠের পাটাতনে সোনালি মধুর কাচের জার সাজাচ্ছেন',
    side: 'right', at: 0.83, motion: 'gift',
    video: '/assets/story-video/scene-06-golden-gift.mp4',
    poster: '/assets/story-posters/scene-06-golden-gift.webp',
    duration: 5,
    imageSize: Object.freeze({ width: 1280, height: 720 })
  })
]);
