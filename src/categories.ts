export interface Category { key: string; label: string; emoji: string }

export const CATEGORIES: Category[] = [
  {
    "key": "vegetables",
    "label": "Vegetables",
    "emoji": "🥬"
  },
  {
    "key": "fruits",
    "label": "Fruits",
    "emoji": "🥭"
  },
  {
    "key": "grains",
    "label": "Grains",
    "emoji": "🌾"
  },
  {
    "key": "livestock",
    "label": "Livestock",
    "emoji": "🐄"
  },
  {
    "key": "meat",
    "label": "Meat",
    "emoji": "🥩"
  },
  {
    "key": "milk",
    "label": "Milk & Dairy",
    "emoji": "🥛"
  },
  {
    "key": "eggs",
    "label": "Eggs",
    "emoji": "🥚"
  },
  {
    "key": "poultry",
    "label": "Poultry",
    "emoji": "🐓"
  },
  {
    "key": "seeds",
    "label": "Seeds",
    "emoji": "🌱"
  },
  {
    "key": "fertilizer",
    "label": "Fertilizer",
    "emoji": "🧪"
  }
];

export const CROP_PRESETS: string[] = [
  "Maize",
  "Rice",
  "Beans",
  "Tomatoes",
  "Onions",
  "Cassava",
  "Bananas",
  "Coffee",
  "Avocado",
  "Spinach",
  "Potatoes",
  "Mangoes"
];

export const ANIMAL_PRESETS: string[] = [
  "Cattle",
  "Goats",
  "Sheep",
  "Chickens",
  "Pigs",
  "Ducks",
  "Dairy cows",
  "Rabbits"
];

export const SEED_PRESETS: string[] = [
  "Maize seed",
  "Rice seed",
  "Bean seed",
  "Tomato seed",
  "Onion seed",
  "Sunflower seed",
  "Vegetable seed",
  "Cabbage seed",
  "Watermelon seed"
];

export const FERTILIZER_PRESETS: string[] = [
  "Urea",
  "DAP",
  "NPK",
  "CAN",
  "Compost",
  "Manure",
  "Foliar feed",
  "Lime"
];

export interface SellerCard { key: string; emoji: string; titleKey: string; descKey: string }

export const SELLER_CARDS: SellerCard[] = [
  {
    "key": "farmer",
    "emoji": "🌱",
    "titleKey": "farmer",
    "descKey": "farmerDesc"
  },
  {
    "key": "livestock",
    "emoji": "🐄",
    "titleKey": "livestock",
    "descKey": "livestockDesc"
  },
  {
    "key": "seed",
    "emoji": "🌾",
    "titleKey": "seedSeller",
    "descKey": "seedDesc"
  },
  {
    "key": "fertilizer",
    "emoji": "🧪",
    "titleKey": "fertilizerSeller",
    "descKey": "fertilizerDesc"
  }
];
