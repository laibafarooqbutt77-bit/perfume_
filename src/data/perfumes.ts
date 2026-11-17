import { PerfumeProduct, CollectionItem, CustomerReview } from '../types/perfume';

// Image assets generated for the boutique
export const IMAGES = {
  hero: '/src/assets/images/hero_perfume_bottle_1792414164003.jpg',
  atelier: '/src/assets/images/perfume_brand_atelier_1792414167694.jpg',
  oudRoyale: '/src/assets/images/perfume_oud_royale_1792414164830.jpg',
  velvetRose: '/src/assets/images/perfume_velvet_rose_1792414166131.jpg',
  midnightNoir: '/src/assets/images/perfume_midnight_noir_1792414167423.jpg',
  amberEssence: '/src/assets/images/perfume_amber_essence_1792414166528.jpg',
  whiteMusk: '/src/assets/images/perfume_white_musk_1792414192762.jpg',
  goldenOud: '/src/assets/images/perfume_golden_oud_1792414194060.jpg',
  roseElegance: '/src/assets/images/perfume_rose_elegance_1792414195175.jpg',
  oceanBreeze: '/src/assets/images/perfume_ocean_breeze_1792414195318.jpg',
  imperialWoods: '/src/assets/images/perfume_imperial_woods_1792414196471.jpg',
  vanillaBloom: '/src/assets/images/perfume_vanilla_bloom_1792414195955.jpg',
};

export const PERFUMES_DATA: PerfumeProduct[] = [
  {
    id: 'oud-royale',
    name: 'Oud Royale',
    subtitle: 'Extrait de Parfum',
    brand: 'Maison d’Or',
    category: 'oud',
    fragranceFamily: 'Oud',
    price: 28500,
    originalPrice: 32000,
    rating: 4.9,
    reviewCount: 168,
    isBestSeller: true,
    isNewArrival: false,
    image: IMAGES.oudRoyale,
    description: 'An opulent symphony of pure Cambodian aged agarwood, smoky frankincense tears, and precious golden saffron bathed in royal amber.',
    story: 'Conceived in the quiet stillness of dusk, Oud Royale captures the timeless mystery of ancient palaces. Sourced from sustainable wild agarwood forests and distilled in small copper alembics, it lingers on the skin like liquid silk.',
    sizes: [
      { size: '30 ml', price: 16500 },
      { size: '50 ml', price: 21500 },
      { size: '100 ml', price: 28500 }
    ],
    notes: {
      top: ['Wild Saffron', 'Nutmeg', 'Davana Bloom'],
      heart: ['Cambodian Agarwood', 'Taif Rose Petals', 'Smoked Incense'],
      base: ['Black Leather', 'Ambergris', 'Pure Atlas Cedarwood']
    },
    longevity: '14+ Hours',
    sillage: 'Magnificent & Radiant',
    season: 'Autumn & Winter / Black Tie',
    inStock: true
  },
  {
    id: 'velvet-rose',
    name: 'Velvet Rose',
    subtitle: 'Eau de Parfum',
    brand: 'Maison d’Or',
    category: 'women',
    fragranceFamily: 'Floral',
    price: 22000,
    originalPrice: 25000,
    rating: 4.8,
    reviewCount: 134,
    isBestSeller: true,
    isNewArrival: false,
    image: IMAGES.velvetRose,
    description: 'A decadent bouquet of hand-harvested Damask roses draped over creamy Madagascar bourbon vanilla and warm white cedar.',
    story: 'Inspired by early dawn in the rose valleys of Grasse when petals are still cloaked in morning dew. Velvet Rose is intoxicatingly romantic, tactile, and effortlessly feminine.',
    sizes: [
      { size: '30 ml', price: 12500 },
      { size: '50 ml', price: 16800 },
      { size: '100 ml', price: 22000 }
    ],
    notes: {
      top: ['Bergamot of Calabria', 'Pink Peppercorn', 'Dewy Lychee'],
      heart: ['Centifolia Rose', 'Bulgarian Rose Absolue', 'White Peony'],
      base: ['Bourbon Vanilla', 'Cashmere Woods', 'Powdery Musk']
    },
    longevity: '10-12 Hours',
    sillage: 'Graceful & Enveloping',
    season: 'Spring & Autumn',
    inStock: true
  },
  {
    id: 'midnight-noir',
    name: 'Midnight Noir',
    subtitle: 'Eau de Parfum Intense',
    brand: 'Maison d’Or',
    category: 'men',
    fragranceFamily: 'Woody',
    price: 24000,
    originalPrice: 27500,
    rating: 4.9,
    reviewCount: 192,
    isBestSeller: true,
    isNewArrival: false,
    image: IMAGES.midnightNoir,
    description: 'A magnetic nocturnal creation pairing crisp Italian bergamot, dark smoky vetiver, roasted coffee bean, and aged Tuscan leather.',
    story: 'Midnight Noir evokes an enigmatic metropolitan night. Strong, deliberate, and undeniably sophisticated, it leaves an indelible trace of confidence and refined charisma.',
    sizes: [
      { size: '30 ml', price: 13500 },
      { size: '50 ml', price: 18500 },
      { size: '100 ml', price: 24000 }
    ],
    notes: {
      top: ['Cardamom Pod', 'Italian Bergamot', 'Black Pepper'],
      heart: ['Dark Roasted Coffee', 'Smoked Vetiver', 'Iris Root'],
      base: ['Tuscan Leather', 'Indonesian Patchouli', 'Warm Tonka Bean']
    },
    longevity: '12-14 Hours',
    sillage: 'Profound & Magnetic',
    season: 'Evening & All Seasons',
    inStock: true
  },
  {
    id: 'amber-essence',
    name: 'Amber Essence',
    subtitle: 'Eau de Parfum',
    brand: 'Maison d’Or',
    category: 'unisex',
    fragranceFamily: 'Woody',
    price: 19500,
    rating: 4.7,
    reviewCount: 98,
    isBestSeller: false,
    isNewArrival: false,
    image: IMAGES.amberEssence,
    description: 'A radiant golden warmth infused with balsamic benzoin, sunlit amber resin, toasted almond, and creamy sandalwood.',
    story: 'Amber Essence pays homage to the luminous golden hour of Provence. A comforting sanctuary of glowing resins that melds intimately with natural skin chemistry.',
    sizes: [
      { size: '30 ml', price: 11000 },
      { size: '50 ml', price: 15000 },
      { size: '100 ml', price: 19500 }
    ],
    notes: {
      top: ['Cinnamon Bark', 'Bitter Almond', 'Coriander Seed'],
      heart: ['Golden Amber Resin', 'Benzoin Tears', 'Heliotrope'],
      base: ['Australian Sandalwood', 'Labdanum', 'White Vanilla']
    },
    longevity: '11-13 Hours',
    sillage: 'Subtle & Sophisticated',
    season: 'Autumn & Winter',
    inStock: true
  },
  {
    id: 'white-musk',
    name: 'White Musk',
    subtitle: 'Eau de Parfum',
    brand: 'Maison d’Or',
    category: 'unisex',
    fragranceFamily: 'Fresh',
    price: 18000,
    rating: 4.8,
    reviewCount: 115,
    isBestSeller: false,
    isNewArrival: false,
    image: IMAGES.whiteMusk,
    description: 'An impeccably pure, second-skin fragrance blending clean cotton blossom, white lily, velvety ambrette seed, and sheer iris.',
    story: 'Pure minimalism in olfactory form. White Musk mirrors sun-dried fine linen on a breezy terrace—crisp, intimate, and eternally elegant.',
    sizes: [
      { size: '30 ml', price: 10500 },
      { size: '50 ml', price: 14000 },
      { size: '100 ml', price: 18000 }
    ],
    notes: {
      top: ['Aldehydes', 'Cotton Blossom', 'Neroli Water'],
      heart: ['White Iris', 'Lily of the Valley', 'Ambrette Seed'],
      base: ['Clean White Musk', 'Sheer Amber', 'Blonde Cedar']
    },
    longevity: '9-11 Hours',
    sillage: 'Intimate & Tactile',
    season: 'Spring & Summer Daily',
    inStock: true
  },
  {
    id: 'golden-oud',
    name: 'Golden Oud',
    subtitle: 'Extrait de Parfum',
    brand: 'Maison d’Or',
    category: 'oud',
    fragranceFamily: 'Oud',
    price: 34000,
    originalPrice: 38000,
    rating: 5.0,
    reviewCount: 86,
    isBestSeller: true,
    isNewArrival: false,
    image: IMAGES.goldenOud,
    description: 'The pinnacle of oriental haute perfumery. Infused with precious aged Hindi agarwood, Kashmiri saffron, and golden honeycomb.',
    story: 'A collector’s treasure crafted in micro-batches of strictly 300 flacons. Golden Oud features wild-harvested vintage oud macerated for over twenty-four months in dark cellars.',
    sizes: [
      { size: '50 ml', price: 24500 },
      { size: '100 ml', price: 34000 }
    ],
    notes: {
      top: ['Kashmiri Saffron', 'Wild Thyme', 'Bergamot Peel'],
      heart: ['20-Year Hindi Oud', 'Honeycomb Absolue', 'Moroccan Rose'],
      base: ['Dark Labdanum', 'Smoked Civet (Vegan)', 'Siam Benzoin']
    },
    longevity: '18+ Hours',
    sillage: 'Monumental & Majestic',
    season: 'Winter & Celebrations',
    inStock: true
  },
  {
    id: 'rose-elegance',
    name: 'Rose Élégance',
    subtitle: 'Eau de Parfum',
    brand: 'Maison d’Or',
    category: 'floral',
    fragranceFamily: 'Floral',
    price: 21500,
    rating: 4.8,
    reviewCount: 77,
    isBestSeller: false,
    isNewArrival: true,
    image: IMAGES.roseElegance,
    description: 'An airy, ethereal French rose kissed with sparkling mandarin, sweet white pear, and silky crystal musk.',
    story: 'Designed as the daytime counterpart to Velvet Rose, Rose Élégance captures the freshness of dew glistening upon delicate rosebuds under the Parisian morning sun.',
    sizes: [
      { size: '30 ml', price: 12000 },
      { size: '50 ml', price: 16500 },
      { size: '100 ml', price: 21500 }
    ],
    notes: {
      top: ['Sparkling Mandarin', 'Crisp Green Pear', 'Pink Freesia'],
      heart: ['Rose de Mai', 'Magnolia Bloom', 'Sheer Jasmine'],
      base: ['Silk Musk', 'Driftwood', 'Soft Amber']
    },
    longevity: '8-10 Hours',
    sillage: 'Soft & Airy',
    season: 'Spring & Summer',
    inStock: true
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    subtitle: 'Eau de Parfum',
    brand: 'Maison d’Or',
    category: 'men',
    fragranceFamily: 'Fresh',
    price: 17500,
    rating: 4.7,
    reviewCount: 104,
    isBestSeller: false,
    isNewArrival: false,
    image: IMAGES.oceanBreeze,
    description: 'An invigorating plunge into Mediterranean sea spray, crushed juniper berries, salty driftwood, and sun-drenched Amalfi lemon.',
    story: 'Capturing the sensation of standing atop high coastal cliffs overlooking azure waters. Crisp, revitalizing, and infused with mineral sea salts.',
    sizes: [
      { size: '30 ml', price: 9800 },
      { size: '50 ml', price: 13500 },
      { size: '100 ml', price: 17500 }
    ],
    notes: {
      top: ['Amalfi Lemon', 'Crushed Juniper', 'Marine Salt Accord'],
      heart: ['Mediterranean Rosemary', 'Sea Moss', 'Clary Sage'],
      base: ['Weathered Driftwood', 'Grey Amber', 'Vetiver Mineral']
    },
    longevity: '8-10 Hours',
    sillage: 'Fresh & Crisp',
    season: 'Summer & Warm Climates',
    inStock: true
  },
  {
    id: 'imperial-woods',
    name: 'Imperial Woods',
    subtitle: 'Eau de Parfum',
    brand: 'Maison d’Or',
    category: 'men',
    fragranceFamily: 'Woody',
    price: 26000,
    originalPrice: 29000,
    rating: 4.9,
    reviewCount: 141,
    isBestSeller: true,
    isNewArrival: false,
    image: IMAGES.imperialWoods,
    description: 'A sovereign woody composition celebrating smoked oak barrels, Virginia cedar, smoky birch tar, and rich bourbon tobacco.',
    story: 'Honoring the time-honored artisanal woodworking ateliers of Europe. A commanding fragrance of depth, texture, and refined masculinity.',
    sizes: [
      { size: '30 ml', price: 14500 },
      { size: '50 ml', price: 19800 },
      { size: '100 ml', price: 26000 }
    ],
    notes: {
      top: ['Bourbon Accord', 'Pink Pepper', 'Cypress Leaves'],
      heart: ['Smoked Oakwood', 'Virginia Cedar', 'Cured Tobacco Leaf'],
      base: ['Birch Tar', 'Haitian Vetiver', 'Dark Guaiac Wood']
    },
    longevity: '14 Hours',
    sillage: 'Rich & Sovereign',
    season: 'Autumn & Winter',
    inStock: true
  },
  {
    id: 'vanilla-bloom',
    name: 'Vanilla Bloom',
    subtitle: 'Eau de Parfum',
    brand: 'Maison d’Or',
    category: 'women',
    fragranceFamily: 'Sweet & Vanilla',
    price: 23500,
    rating: 4.9,
    reviewCount: 153,
    isBestSeller: true,
    isNewArrival: true,
    image: IMAGES.vanillaBloom,
    description: 'An exquisite gourmand masterpiece blending rare Tahitian vanilla caviar, toasted tonka bean, caramel orchid, and creamy benzoin.',
    story: 'Far from sugary sweet, Vanilla Bloom is dark, smoky, and deeply sensual. It highlights the natural complexity of cured black vanilla beans.',
    sizes: [
      { size: '30 ml', price: 13000 },
      { size: '50 ml', price: 18000 },
      { size: '100 ml', price: 23500 }
    ],
    notes: {
      top: ['Star Anise', 'Caramel Orchid', 'Bitter Orange'],
      heart: ['Tahitian Vanilla Caviar', 'Roasted Tonka Bean', 'Heliotrope'],
      base: ['Smoked Benzoin', 'White Sandalwood', 'Dark Amber']
    },
    longevity: '12-14 Hours',
    sillage: 'Alluring & Addictive',
    season: 'All Year / Signature Gourmand',
    inStock: true
  },
  {
    id: 'crystal-amber',
    name: 'Crystal Amber',
    subtitle: 'Extrait de Parfum',
    brand: 'Maison d’Or',
    category: 'signature',
    fragranceFamily: 'Spicy',
    price: 29000,
    originalPrice: 33000,
    rating: 4.9,
    reviewCount: 64,
    isBestSeller: false,
    isNewArrival: true,
    image: IMAGES.amberEssence,
    description: 'An architectural union of crystalline frankincense, sparkling pink peppercorn, and sacred dry labdanum.',
    story: 'A bespoke creation from our signature reserve. Crystal Amber reflects the interplay of transparent glass and radiant warmth.',
    sizes: [
      { size: '50 ml', price: 21000 },
      { size: '100 ml', price: 29000 }
    ],
    notes: {
      top: ['Sparkling Pink Peppercorn', 'Ginger Essence', 'Omani Frankincense'],
      heart: ['Crystalline Amber', 'Dry Labdanum', 'Clary Sage'],
      base: ['Sandalwood Mysore', 'Cedar Atlas', 'Golden Musk']
    },
    longevity: '13-15 Hours',
    sillage: 'Architectural & Radiant',
    season: 'All Seasons',
    inStock: true
  },
  {
    id: 'noir-intense',
    name: 'Noir Intense',
    subtitle: 'Parfum Concentré',
    brand: 'Maison d’Or',
    category: 'men',
    fragranceFamily: 'Spicy',
    price: 27000,
    rating: 4.8,
    reviewCount: 88,
    isBestSeller: false,
    isNewArrival: false,
    image: IMAGES.midnightNoir,
    description: 'Concentrated nightfall. Dark cacao nibs, Indonesian patchouli, smoked black pepper, and aged Russian leather.',
    story: 'A deeper, nocturnal exploration of the shadows. Richly concentrated at 32% fragrance oil for an unmistakable signature presence.',
    sizes: [
      { size: '50 ml', price: 19500 },
      { size: '100 ml', price: 27000 }
    ],
    notes: {
      top: ['Black Pepper', 'Nutmeg', 'Elemi Resin'],
      heart: ['Dark Cacao Nibs', 'Indonesian Patchouli', 'Castoreum Accord (Vegan)'],
      base: ['Smoked Leather', 'Black Birch', 'Amber Gris']
    },
    longevity: '16 Hours',
    sillage: 'Heavy & Hypnotic',
    season: 'Winter & Evening',
    inStock: true
  },
  {
    id: 'fleur-sauvage',
    name: 'Fleur Sauvage',
    subtitle: 'Eau de Parfum',
    brand: 'Maison d’Or',
    category: 'floral',
    fragranceFamily: 'Citrus',
    price: 20500,
    rating: 4.7,
    reviewCount: 72,
    isBestSeller: false,
    isNewArrival: false,
    image: IMAGES.roseElegance,
    description: 'Sun-drenched Mediterranean neroli, wild orange blossom, green mandarin leaves, and honeyed white musk.',
    story: 'Transporting you to the citrus groves of Seville when springtime orange trees erupt into delicate, intoxicating white blossoms.',
    sizes: [
      { size: '30 ml', price: 11500 },
      { size: '50 ml', price: 15500 },
      { size: '100 ml', price: 20500 }
    ],
    notes: {
      top: ['Green Mandarin Leaf', 'Petitgrain', 'Sicilian Lemon'],
      heart: ['Tunisian Neroli', 'Orange Blossom Absolue', 'Jasmine Sambac'],
      base: ['White Cedarwood', 'Honey Accord', 'Clean Musk']
    },
    longevity: '9-11 Hours',
    sillage: 'Radiant & Uplifting',
    season: 'Spring & Summer',
    inStock: true
  },
  {
    id: 'santal-majestueux',
    name: 'Santal Majestueux',
    subtitle: 'Eau de Parfum',
    brand: 'Maison d’Or',
    category: 'signature',
    fragranceFamily: 'Woody',
    price: 25500,
    rating: 4.9,
    reviewCount: 91,
    isBestSeller: false,
    isNewArrival: true,
    image: IMAGES.imperialWoods,
    description: 'Creamy sustainable Australian sandalwood enveloped in warm green cardamom, papyrus, and velvety violet leaf.',
    story: 'A serene meditation on wood. Smooth, creamy, and impeccably refined, Santal Majestueux lingers like second nature.',
    sizes: [
      { size: '30 ml', price: 14000 },
      { size: '50 ml', price: 19000 },
      { size: '100 ml', price: 25500 }
    ],
    notes: {
      top: ['Green Cardamom', 'Violet Leaf', 'Iris Concrete'],
      heart: ['Creamy Sandalwood', 'Egyptian Papyrus', 'Cedarwood'],
      base: ['Cashmere Woods', 'Ambergris', 'White Leather']
    },
    longevity: '12-14 Hours',
    sillage: 'Warm & Contemplative',
    season: 'All Seasons',
    inStock: true
  }
];

export const COLLECTIONS_DATA: CollectionItem[] = [
  {
    id: 'men',
    name: 'Men’s Fragrances',
    tagline: 'Bold, Magnetic & Uncompromising',
    description: 'Deep smoked woods, crisp Italian citrus, and dark aged leathers crafted for distinction.',
    image: IMAGES.midnightNoir,
    itemCount: 4
  },
  {
    id: 'women',
    name: 'Women’s Fragrances',
    tagline: 'Luminous Florals & Sensual Silks',
    description: 'Centifolia roses from Grasse, Tahitian vanilla caviar, and rare white florals.',
    image: IMAGES.velvetRose,
    itemCount: 4
  },
  {
    id: 'unisex',
    name: 'Unisex Collection',
    tagline: 'Transcendent Olfactory Art',
    description: 'Gender-fluid harmonies of raw mineral accords, clean second-skin musks, and warm resins.',
    image: IMAGES.amberEssence,
    itemCount: 4
  },
  {
    id: 'oud',
    name: 'Luxury Oud',
    tagline: 'The Liquid Gold of the Orient',
    description: 'Rare wild-harvested agarwood macerated with golden saffron, frankincense, and Taif rose.',
    image: IMAGES.oudRoyale,
    itemCount: 3
  },
  {
    id: 'floral',
    name: 'Fresh & Floral',
    tagline: 'Sun-Drenched Garden Petals',
    description: 'Morning dew on Damask petals, Spanish neroli blossoms, and dewy green leaves.',
    image: IMAGES.roseElegance,
    itemCount: 3
  },
  {
    id: 'signature',
    name: 'Signature Collection',
    tagline: 'Master Perfumer Reserve',
    description: 'High-concentration extraits de parfum distilled with rare botanical extracts.',
    image: IMAGES.hero,
    itemCount: 3
  }
];

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Hamza Al-Rashid',
    city: 'Lahore, Pakistan',
    rating: 5,
    title: 'The best authentic oud experience in Pakistan',
    comment: 'Oud Royale is hands down one of the most masterfully balanced fragrances I have ever smelled. The Cambodian oud is velvety and deep without being sharp. Lasted through a 12-hour wedding reception with constant compliments.',
    date: 'March 14, 2026',
    perfumeName: 'Oud Royale'
  },
  {
    id: 'rev-2',
    author: 'Ayesha Tariq',
    city: 'Karachi, Pakistan',
    rating: 5,
    title: 'Velvet Rose is pure French poetry',
    comment: 'I usually find rose perfumes either too heavy or synthetic. Velvet Rose is in a class of its own. It smells like stepping into a cold room filled with fresh Damask roses and gentle bourbon vanilla. The bottle weight and packaging are pure luxury.',
    date: 'February 28, 2026',
    perfumeName: 'Velvet Rose'
  },
  {
    id: 'rev-3',
    author: 'Zainab Qureshi',
    city: 'Islamabad, Pakistan',
    rating: 5,
    title: 'Vanilla Bloom is dark, sultry, and addictive',
    comment: 'Not an overly sweet bakery scent—this is rich, smoky, adult bourbon vanilla with tonka and orchid. The 50ml arrived in immaculate velvet packaging in Islamabad within 48 hours.',
    date: 'March 2, 2026',
    perfumeName: 'Vanilla Bloom'
  },
  {
    id: 'rev-4',
    author: 'Bilal Farooqi',
    city: 'Rawalpindi, Pakistan',
    rating: 5,
    title: 'Midnight Noir is my new daily signature',
    comment: 'The opening cardamom and bergamot settling into smoky vetiver and dark roasted coffee is unmatched. It feels effortlessly expensive and masculine. Already ordering my second flacon.',
    date: 'January 19, 2026',
    perfumeName: 'Midnight Noir'
  }
];

export const FRAGRANCE_NOTES_CATEGORIES = [
  { key: 'All', label: 'All Families', description: 'Explore our complete fragrance library' },
  { key: 'Woody', label: 'Woody', description: 'Smoked oak, vetiver roots & cedarwood' },
  { key: 'Floral', label: 'Floral', description: 'Centifolia rose, peony & white jasmine' },
  { key: 'Fresh', label: 'Fresh', description: 'Mineral sea salt, aldehydes & crisp linen' },
  { key: 'Spicy', label: 'Spicy', description: 'Cardamom, pink pepper & wild saffron' },
  { key: 'Citrus', label: 'Citrus', description: 'Calabrian bergamot, neroli & Amalfi lemon' },
  { key: 'Oud', label: 'Oud', description: 'Rare agarwood, frankincense & ambergris' },
  { key: 'Sweet & Vanilla', label: 'Sweet & Vanilla', description: 'Tahitian vanilla caviar & roasted tonka' },
];
