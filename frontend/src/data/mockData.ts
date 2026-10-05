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
    produceName: 'Heirloom Tomatoes',
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
  },
  'F2S-BP-20260920-05': {
    batchId: 'F2S-BP-20260920-05',
    produceName: 'Bell Peppers',
    farmName: 'Green Valley Farm',
    farmerName: 'Ramesh Patel',
    location: 'Aerated Polyhouse Hub (16 km)',
    fieldId: 'Polyhouse-B2 (Controlled Climate)',
    harvestDate: '2026-09-20 06:30 AM',
    packingDate: '2026-09-20 08:45 AM',
    qualityGrade: 'Grade A Crisp',
    pesticideFree: true,
    soilHealthIndex: 'Nutrient Rich (pH 6.5, Carbon 0.79%)',
    temperatureAtTransit: '14°C (Chilled Electric Transit)',
    timeline: [
      {
        stage: 'Harvested',
        timestamp: '2026-09-20 06:30 AM',
        location: 'Green Valley Polyhouse',
        details: 'Hand-clipped with stems intact to retain maximum juiciness and crispness.'
      },
      {
        stage: 'Quality Checked',
        timestamp: '2026-09-20 07:30 AM',
        location: 'On-farm Sorting Bay',
        details: 'Wall thickness measured (>6mm), skin blemish scan passed with zero residue.'
      },
      {
        stage: 'Packed',
        timestamp: '2026-09-20 08:45 AM',
        location: 'Farm2Street Micro-Hub #2',
        details: 'Packed in breathable micro-perforated vegetable cartons.'
      },
      {
        stage: 'Dispatched',
        timestamp: '2026-09-20 10:00 AM',
        location: 'Transit to Hub',
        details: 'Loaded in climate-controlled EV Cargo Van #EV-18.'
      },
      {
        stage: 'Delivered',
        timestamp: '2026-09-20 01:15 PM',
        location: 'Customer Doorstep',
        details: 'Delivered crisp and farm-fresh within hours of morning clip.'
      }
    ]
  },
  'F2S-CR-20260919-02': {
    batchId: 'F2S-CR-20260919-02',
    produceName: 'Organic Carrots',
    farmName: 'Sunrise Fields',
    farmerName: 'Anandi Devi',
    location: 'Highland Root Farm (25 km)',
    fieldId: 'Highland-Root-Plot-07',
    harvestDate: '2026-09-19 04:00 PM',
    packingDate: '2026-09-19 06:15 PM',
    qualityGrade: 'Select Sweet Grade',
    pesticideFree: true,
    soilHealthIndex: 'Deep Loam (Organic Carbon 0.88%)',
    temperatureAtTransit: '16°C (Ventilated Crates)',
    timeline: [
      {
        stage: 'Harvested',
        timestamp: '2026-09-19 04:00 PM',
        location: 'Sunrise Highland Terraces',
        details: 'Gentle root lifting from loose sandy-loam soil during cool twilight.'
      },
      {
        stage: 'Washed & Checked',
        timestamp: '2026-09-19 05:00 PM',
        location: 'Farm Springhouse',
        details: 'Triple-washed in chemical-free filtered natural spring water.'
      },
      {
        stage: 'Packed',
        timestamp: '2026-09-19 06:15 PM',
        location: 'Highland Dispatch Center',
        details: 'Bundled with intact micro-greens in damp jute wraps.'
      },
      {
        stage: 'Dispatched',
        timestamp: '2026-09-20 05:30 AM',
        location: 'Early Express Line',
        details: 'Direct morning sprint via Electric Cargo Transit #EV-09.'
      },
      {
        stage: 'Delivered',
        timestamp: '2026-09-20 09:00 AM',
        location: 'Customer Doorstep',
        details: 'Unmatched crunch and natural sweetness preserved straight from Highland soils.'
      }
    ]
  },
  'F2S-SP-20260920-04': {
    batchId: 'F2S-SP-20260920-04',
    produceName: 'Malabar Spinach',
    farmName: 'Greenfield Harvest Cluster',
    farmerName: 'Kavitha Murugan',
    location: 'Greenfield Harvest Cluster (12 km)',
    fieldId: 'Wetland-Beds-East-01',
    harvestDate: '2026-09-20 05:30 AM',
    packingDate: '2026-09-20 07:00 AM',
    qualityGrade: 'Tender Leaf A+',
    pesticideFree: true,
    soilHealthIndex: 'Bio-compost Active (Nitrogen Optimal)',
    temperatureAtTransit: '12°C (Humidified Chilled Crates)',
    timeline: [
      {
        stage: 'Harvested',
        timestamp: '2026-09-20 05:30 AM',
        location: 'Greenfield Canopy Beds',
        details: 'Delicate morning dew harvesting of succulent broad leaves.'
      },
      {
        stage: 'Quality Checked',
        timestamp: '2026-09-20 06:15 AM',
        location: 'Cold Wash Station',
        details: 'Hydro-cooled with chilled mist to seal nutrients and lock crispness.'
      },
      {
        stage: 'Packed',
        timestamp: '2026-09-20 07:00 AM',
        location: 'Cluster Packhouse',
        details: 'Tied with natural plant fiber twine in eco-friendly protective sleeves.'
      },
      {
        stage: 'Dispatched',
        timestamp: '2026-09-20 08:00 AM',
        location: 'Priority Greens Route',
        details: 'Rapid transit via chilled electric cargo bike fleet.'
      },
      {
        stage: 'Delivered',
        timestamp: '2026-09-20 10:45 AM',
        location: 'Customer Doorstep',
        details: 'Arrived crisp and vibrant, zero wilting guaranteed.'
      }
    ]
  },
  'F2S-GB-20260920-03': {
    batchId: 'F2S-GB-20260920-03',
    produceName: 'Green Beans',
    farmName: 'Meadow Roots',
    farmerName: 'Balwinder Singh',
    location: 'Riverbank Agro Beds (22 km)',
    fieldId: 'Meadow-East-12',
    harvestDate: '2026-09-20 06:15 AM',
    packingDate: '2026-09-20 08:00 AM',
    qualityGrade: 'A Grade Tender',
    pesticideFree: true,
    soilHealthIndex: 'Loam Alluvial (High Potassium)',
    temperatureAtTransit: '15°C (Chilled Crates)',
    timeline: [
      {
        stage: 'Harvested',
        timestamp: '2026-09-20 06:15 AM',
        location: 'Riverbank Agro Beds',
        details: 'Hand-picked crisp morning bean pods without bruising.'
      },
      {
        stage: 'Quality Checked',
        timestamp: '2026-09-20 07:15 AM',
        location: 'Field Pack Station',
        details: 'Snapped test for tenderness; zero fiber strings.'
      },
      {
        stage: 'Packed',
        timestamp: '2026-09-20 08:00 AM',
        location: 'Farm2Street Micro-Hub #1',
        details: 'Packed in breathable cotton mesh pouches.'
      },
      {
        stage: 'Dispatched',
        timestamp: '2026-09-20 09:15 AM',
        location: 'Transit Line',
        details: 'Transferred via solar-assisted express courier.'
      },
      {
        stage: 'Delivered',
        timestamp: '2026-09-20 11:50 AM',
        location: 'Customer Doorstep',
        details: 'Delivered ready to cook with garden snap.'
      }
    ]
  },
  'F2S-MR-20260920-08': {
    batchId: 'F2S-MR-20260920-08',
    produceName: 'Wild Mushrooms',
    farmName: 'ShroomCraft BioFarm',
    farmerName: 'Dr. Priya Sen',
    location: 'Forest Shade BioFarm (30 km)',
    fieldId: 'Climate-Vault-04',
    harvestDate: '2026-09-20 07:00 AM',
    packingDate: '2026-09-20 08:15 AM',
    qualityGrade: 'Gourmet Organic',
    pesticideFree: true,
    soilHealthIndex: 'Sterilized Organic Straw Substrate',
    temperatureAtTransit: '8°C (Refrigerated Transit)',
    timeline: [
      {
        stage: 'Harvested',
        timestamp: '2026-09-20 07:00 AM',
        location: 'Mushroom Bio-Chambers',
        details: 'Carefully trimmed clusters at prime cap bloom.'
      },
      {
        stage: 'Quality Checked',
        timestamp: '2026-09-20 07:45 AM',
        location: 'Cleanroom Sorting',
        details: 'Spore density & cap firmness verified under UV inspection.'
      },
      {
        stage: 'Packed',
        timestamp: '2026-09-20 08:15 AM',
        location: 'Clean-Pack Pod',
        details: 'Vented compostable paper-punnet packaging.'
      },
      {
        stage: 'Dispatched',
        timestamp: '2026-09-20 09:00 AM',
        location: 'Cold Chain Route',
        details: 'Dispatched inside 8°C chilled carrier box.'
      },
      {
        stage: 'Delivered',
        timestamp: '2026-09-20 11:30 AM',
        location: 'Customer Doorstep',
        details: 'Arrived firm and fragrant with woodsy aroma.'
      }
    ]
  }
};
