import { Produce, SubscriptionBox, TraceabilityBatch } from '../types';

export const INITIAL_PRODUCE: Produce[] = [
  {
    id: 'prod-1',
    name: 'Tomatoes',
    category: 'Vegetables',
    price: 35,
    unit: 'kg',
    farmer: 'Green Valley Farm',
    farmLocation: 'Organic Valley Farm (18 km)',
    harvestDate: 'Today 06:00 AM',
    availableQty: 120,
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85',
    description: 'Fresh field-ripened tomatoes sourced directly from local beds.',
    batchId: 'F2S-TM-20260920-01',
    organic: true,
    rating: 4.9,
  },
  {
    id: 'prod-2',
    name: 'Carrots',
    category: 'Root',
    price: 50,
    unit: 'kg',
    farmer: 'Sunrise Fields',
    farmLocation: 'Highland Root Farm (25 km)',
    harvestDate: 'Yesterday 04:00 PM',
    availableQty: 200,
    image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=900&q=85',
    description: 'Crisp sweet clay-grown carrots washed with pure well water.',
    batchId: 'F2S-CR-20260919-02',
    organic: true,
    rating: 4.9,
  },
  {
    id: 'prod-3',
    name: 'Green Beans',
    category: 'Vegetables',
    price: 60,
    unit: 'kg',
    farmer: 'Meadow Roots',
    farmLocation: 'Riverbank Agro Beds (22 km)',
    harvestDate: 'Today 06:15 AM',
    availableQty: 90,
    image: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=900&q=85',
    description: 'Crisp hand-picked tender beans with sweet snap.',
    batchId: 'F2S-GB-20260920-03',
    organic: true,
    rating: 4.7,
  },
  {
    id: 'prod-4',
    name: 'Spinach',
    category: 'Greens',
    price: 25,
    unit: 'bunch',
    farmer: 'Local Farm',
    farmLocation: 'Greenfield Harvest Cluster (12 km)',
    harvestDate: 'Today 05:30 AM',
    availableQty: 85,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=85',
    description: 'Lush morning-harvested green leaves packed with natural minerals.',
    batchId: 'F2S-SP-20260920-04',
    organic: true,
    rating: 4.8,
  },
  {
    id: 'prod-5',
    name: 'Wild Mushrooms',
    category: 'Exotic',
    price: 110,
    unit: '200g pack',
    farmer: 'ShroomCraft BioFarm',
    farmLocation: 'Forest Shade BioFarm (30 km)',
    harvestDate: 'Today 07:00 AM',
    availableQty: 45,
    image: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&w=800&q=80',
    description: 'Cultivated on organic straw. Velvety texture and savory woodsy flavor.',
    batchId: 'F2S-MR-20260920-08',
    organic: true,
    rating: 5.0,
  },
  {
    id: 'prod-6',
    name: 'Bell Peppers',
    category: 'Vegetables',
    price: 80,
    unit: 'kg',
    farmer: 'Green Valley Farm',
    farmLocation: 'Aerated Polyhouse Hub (16 km)',
    harvestDate: 'Today 06:30 AM',
    availableQty: 60,
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80',
    description: 'Greenhouse grown bell peppers with thick juicy flesh.',
    batchId: 'F2S-BP-20260920-05',
    organic: true,
    rating: 4.8,
  }
];

export const SUBSCRIPTION_BOXES: SubscriptionBox[] = [
  {
    id: 'box-0',
    name: 'Farm Fresh Trial Box',
    tagline: 'Experience zero-middleman harvest with a curated trial crate',
    pricePerWeek: 0,
    weightApprox: '1.5 - 2.0 kg',
    suitableFor: 'New Households',
    tierCategory: 'personal',
    itemsIncluded: [
      'Morning Heirloom Tomatoes (500 g)',
      'Crisp Spinach Bunch (1 bunch)',
      'Farm Carrot Trio (250 g)',
      'Herbal Tea & Fresh Mint Sprig',
      'Field-to-Door Quality Guarantee'
    ],
    features: [
      'Zero delivery charge on introductory trial drop',
      'Immutable batch QR provenance tag on crate',
      'No commitment — pause, skip, or cancel anytime'
    ],
  },
  {
    id: 'box-1',
    name: 'Starter Green Box',
    tagline: 'Ideal for singles and couples seeking daily crisp greens & morning essentials',
    pricePerWeek: 299,
    weightApprox: '3.5 - 4.0 kg',
    suitableFor: '1-2 People',
    tierCategory: 'personal',
    itemsIncluded: [
      'Vine Tomatoes (1 kg)',
      'Crisp Spinach (2 bunches)',
      'Farm Carrots (500 g)',
      'Fresh Coriander & Green Chillies',
      'Seasonal Surprise Veggie (500 g)'
    ],
    features: [
      'Full harvest-to-door transit in < 6 hours',
      'Temperature monitored electric cargo transit',
      'Weekly automated doorstep drop'
    ],
  },
  {
    id: 'box-2',
    name: 'Family Seasonal Harvest',
    tagline: 'Comprehensive weekly basket nourishing full families with regional diversity',
    pricePerWeek: 499,
    weightApprox: '6.5 - 7.5 kg',
    suitableFor: '3-5 People',
    popular: true,
    badgeText: 'MOST POPULAR',
    tierCategory: 'personal',
    itemsIncluded: [
      'Heirloom Tomatoes (1.5 kg)',
      'Fresh Green Beans (1 kg)',
      'Crisp Carrots & Beetroot (1 kg)',
      'Spinach & Fenugreek (3 bunches)',
      'Farm Potatoes & Red Onions (2 kg)'
    ],
    features: [
      'Priority morning harvest routing (6 - 8 AM)',
      'Custom box ingredient substitution toggle',
      'Cryptographic provenance certificate included'
    ],
  },
  {
    id: 'box-3',
    name: "Connoisseur's Culinary Box",
    tagline: 'Curated for home chefs with gourmet greens, wild mushrooms, and heirloom picks',
    pricePerWeek: 799,
    weightApprox: '5.0 - 6.0 kg',
    suitableFor: 'Gourmet Kitchens',
    tierCategory: 'personal',
    badgeText: 'CHEF CHOICE',
    itemsIncluded: [
      'Wild Oyster Mushrooms (400 g)',
      'Sweet Bell Peppers (1 kg)',
      'Baby Cucumbers & Rocket Leaves',
      'Sweet Cherry Tomatoes (500 g)',
      'Hydroponic Basil & Sage Herb'
    ],
    features: [
      'NPOP certified organic rare cultivars',
      'Exclusive hydroponic herbs & microgreens',
      'Guaranteed < 4 hour field transit window'
    ],
  },
];

export const TRACEABILITY_MOCK: Record<string, TraceabilityBatch> = {
  'F2S-TM-20260920-01': {
    batchId: 'F2S-TM-20260920-01',
    produceName: 'Tomatoes',
    farmName: 'Green Valley Organic Farms',
    farmerName: 'Ramesh Patel',
    location: 'Sector 4, Certified Organic Agro-Belt',
    fieldId: 'Field-North-03 (Certified Organic)',
    harvestDate: '2026-09-20 06:00 AM',
    packingDate: '2026-09-20 08:30 AM',
    qualityGrade: 'A+ (Export Grade)',
    pesticideFree: true,
    soilHealthIndex: 'Optimal (Organic Carbon 0.82%)',
    temperatureAtTransit: '18°C (Aerated Crates)',
    timeline: [
      {
        stage: 'Harvested',
        timestamp: '2026-09-20 06:00 AM',
        location: 'Green Valley Organic Beds',
        details: 'Hand-picked at peak vine-ripeness under morning dew.'
      },
      {
        stage: 'Quality Checked',
        timestamp: '2026-09-20 07:15 AM',
        location: 'On-farm Packhouse',
        details: 'Sorted by brix index (5.4°Bx) & skin integrity checked. Zero wax coating.'
      },
      {
        stage: 'Packed',
        timestamp: '2026-09-20 08:30 AM',
        location: 'Farm2Street Micro-Hub #2',
        details: 'Cushioned in biodegradable sugarcane pulp trays.'
      },
      {
        stage: 'Dispatched',
        timestamp: '2026-09-20 09:45 AM',
        location: 'Transit to Hub',
        details: 'Assigned to Electric Delivery Van #EV-14.'
      },
      {
        stage: 'Delivered',
        timestamp: '2026-09-20 12:30 PM',
        location: 'Customer Doorstep',
        details: 'Direct transfer within 6 hours of morning harvest.'
      }
    ]
  }
};
