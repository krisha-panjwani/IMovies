// Cinemas in Indore, Madhya Pradesh.
//
// VERIFIED (District, district.in, checked 25 October 2026): each venue's
// name, address, locality and amenities, and which films it was listing that
// week (`lineup`, including Hindi / English versions).
//
// DEMO VALUES (not official): screen names, seat layouts and ticket prices.
// IMovies has no connection to PVR INOX or any cinema's real booking system.

const standardScreen = (name) => ({
  name,
  rows: [
    ...['A', 'B', 'C', 'D'].map((label) => ({ label, seats: 12, tier: 'classic' })),
    ...['E', 'F', 'G', 'H'].map((label) => ({ label, seats: 14, tier: 'prime' })),
    ...['I', 'J'].map((label) => ({ label, seats: 8, tier: 'recliner' })),
  ],
});

const compactScreen = (name) => ({
  name,
  rows: [
    ...['A', 'B', 'C'].map((label) => ({ label, seats: 10, tier: 'classic' })),
    ...['D', 'E', 'F'].map((label) => ({ label, seats: 12, tier: 'prime' })),
    { label: 'G', seats: 6, tier: 'recliner' },
  ],
});

const DISTRICT = 'https://www.district.in/movies/';
const COMMON = { city: 'Indore', state: 'Madhya Pradesh' };

module.exports = [
  {
    ...COMMON,
    name: 'PVR Treasure Island Mall',
    brand: 'PVR',
    locality: 'South Tukoganj',
    address: '4th Floor, Treasure Island Mall, 11 M.G. Road, South Tukoganj, Indore, Madhya Pradesh 452001',
    amenities: ['Recliners', 'Food & Beverages', 'Parking', 'Wheelchair Friendly'],
    sourceUrl: `${DISTRICT}pvr-treasure-island-mall-south-tukoganj-indore-CD1024420`,
    screens: [standardScreen('Audi 1'), standardScreen('Audi 2'), compactScreen('Audi 3')],
    prices: { classic: 230, prime: 280, recliner: 600 },
    lineup: [
      { title: 'Drishyam: The Conclusion' },
      { title: 'Udta Teer' },
      { title: 'Prahaar: The Untold Story of Ujjwal Nikam' },
      { title: 'Nayyi Navelli' },
      { title: 'Clayface', languages: ['English', 'Hindi'] },
      { title: 'Street Fighter', languages: ['Hindi'] },
      { title: 'Hanuman Ansh' },
    ],
  },
  {
    ...COMMON,
    name: 'INOX C-21 Mall',
    brand: 'INOX',
    locality: 'Sheetal Nagar',
    address: 'C-21 Mall, PU-4, Scheme No. 54, AB Road, Indore, Madhya Pradesh 452010',
    amenities: ['Recliners', 'Food & Beverages', 'Parking', 'Wheelchair Friendly'],
    sourceUrl: `${DISTRICT}inox-c-21-mall-sheetal-nagar-indore-CD1024421`,
    screens: [standardScreen('Screen 1'), standardScreen('Screen 2'), compactScreen('Screen 3')],
    prices: { classic: 200, prime: 250, recliner: 550 },
    lineup: [
      { title: 'Drishyam: The Conclusion' },
      { title: 'Udta Teer' },
      { title: 'Prahaar: The Untold Story of Ujjwal Nikam' },
      { title: 'Nayyi Navelli' },
      { title: 'Clayface', languages: ['English', 'Hindi'] },
      { title: 'Street Fighter', languages: ['English'] },
    ],
  },
  {
    ...COMMON,
    name: 'INOX Nexus Indore Central',
    brand: 'INOX',
    locality: 'Regal Square',
    address: '4th Floor, Indore Central, 170 R.N.T. Marg, Regal Square, Indore, Madhya Pradesh 452001',
    amenities: ['Food & Beverages', 'Parking'],
    sourceUrl: `${DISTRICT}inox-nexus-indore-central-regal-square-indore-in-indore-CD1024422`,
    screens: [standardScreen('Screen 1'), compactScreen('Screen 2')],
    prices: { classic: 180, prime: 230, recliner: 500 },
    lineup: [
      { title: 'Drishyam: The Conclusion' },
      { title: 'Udta Teer' },
      { title: 'Prahaar: The Untold Story of Ujjwal Nikam' },
      { title: 'Nayyi Navelli' },
      { title: 'Clayface', languages: ['English', 'Hindi'] },
    ],
  },
  {
    ...COMMON,
    name: 'INOX Phoenix Pride of India',
    brand: 'INOX',
    locality: 'Phoenix Citadel Mall',
    address: '1st Floor, Phoenix Citadel Mall, next to Mumbai-Agra Bypass, Indore, Madhya Pradesh 452016',
    amenities: ['Recliners', 'Food & Beverages', 'Parking', 'Wheelchair Friendly'],
    sourceUrl: `${DISTRICT}inox-phoenix-pride-of-india-indore-in-indore-CD1024424`,
    screens: [standardScreen('Screen 1'), standardScreen('Screen 2'), compactScreen('Screen 3')],
    prices: { classic: 220, prime: 270, recliner: 600 },
    lineup: [
      { title: 'Drishyam: The Conclusion' },
      { title: 'Udta Teer' },
      { title: 'Prahaar: The Untold Story of Ujjwal Nikam' },
      { title: 'Nayyi Navelli' },
      { title: 'Clayface', languages: ['English', 'Hindi'] },
    ],
  },
  {
    ...COMMON,
    name: 'Sapna Sangeeta Lumiere',
    brand: 'Lumiere',
    locality: 'Old Agrawal Nagar',
    address: 'Sapna Sangeeta Road, Old Agrawal Nagar, Indore, Madhya Pradesh 452001',
    amenities: ['Recliners', 'Dolby 7.1'],
    sourceUrl: `${DISTRICT}sapna-sangeeta-lumiere-indore-in-indore-CD1040248`,
    screens: [standardScreen('Screen 1'), compactScreen('Screen 2')],
    prices: { classic: 150, prime: 200, recliner: 350 },
    lineup: [
      { title: 'Drishyam: The Conclusion' },
      { title: 'Udta Teer' },
      { title: 'Jailer 2', languages: ['Hindi'] },
      { title: 'Hanuman Ansh' },
    ],
  },
];
