export type CanonicalShopCategory = "sweets" | "grocery" | "pharmacy" | "general";

export interface ShopCategoryOption {
  id: string;
  label: string;
  canonical: CanonicalShopCategory;
  aliases?: string[];
}

export interface CategorySeedProduct {
  name: string;
  price: number;
  unit: string;
}

export interface CategorySeedData {
  specialties: string[];
  suggestedProducts: CategorySeedProduct[];
  fallbackDescription: string;
  fallbackTagline: string;
}

export const SHOP_CATEGORY_OPTIONS: ShopCategoryOption[] = [
  { id: "general", label: "General Store", canonical: "general", aliases: ["general", "store"] },
  { id: "sweets", label: "Sweets / Mithai", canonical: "sweets", aliases: ["mithai", "halwai"] },
  { id: "namkeen", label: "Namkeen / Snacks", canonical: "sweets", aliases: ["snacks", "chips"] },
  { id: "bakery", label: "Bakery", canonical: "sweets", aliases: ["cake", "bread"] },
  { id: "dairy", label: "Dairy", canonical: "grocery", aliases: ["milk", "paneer"] },
  { id: "grocery", label: "Grocery / Kirana", canonical: "grocery", aliases: ["kirana", "supermarket"] },
  { id: "fruits-vegetables", label: "Fruits & Vegetables", canonical: "grocery", aliases: ["fruits", "vegetables"] },
  { id: "dry-fruits", label: "Dry Fruits", canonical: "grocery", aliases: ["nuts", "dry fruits"] },
  { id: "spices", label: "Spices / Masala", canonical: "grocery", aliases: ["masala", "spice"] },
  { id: "tea-coffee", label: "Tea / Coffee", canonical: "grocery", aliases: ["tea", "coffee"] },
  { id: "pharmacy", label: "Pharmacy / Medical", canonical: "pharmacy", aliases: ["medical", "chemist"] },
  { id: "cosmetics", label: "Cosmetics & Personal Care", canonical: "general", aliases: ["beauty", "personal care"] },
  { id: "stationery", label: "Stationery", canonical: "general", aliases: ["books", "school supplies"] },
  { id: "electronics", label: "Electronics", canonical: "general", aliases: ["mobile", "gadgets"] },
  { id: "fashion", label: "Fashion / Clothing", canonical: "general", aliases: ["clothes", "apparel"] },
  { id: "home-kitchen", label: "Home & Kitchen", canonical: "general", aliases: ["home", "kitchen"] },
  { id: "puja", label: "Puja Samagri", canonical: "general", aliases: ["pooja", "religious"] },
  { id: "restaurant", label: "Restaurant / Cafe", canonical: "general", aliases: ["cafe", "food"] },
];

const CATEGORY_SEEDS: Record<string, CategorySeedData> = {
  general: {
    specialties: ["Trusted Local Service", "Daily Essentials", "Value Pricing", "Friendly Support", "Quick Delivery"],
    suggestedProducts: [
      { name: "Daily Essentials Combo", price: 249, unit: "pack" },
      { name: "Household Utility Item", price: 99, unit: "piece" },
      { name: "Seasonal Bestseller", price: 199, unit: "piece" },
      { name: "Local Favorite Product", price: 149, unit: "piece" },
      { name: "Family Saver Pack", price: 299, unit: "pack" },
    ],
    fallbackDescription: "A trusted neighborhood shop serving quality products with fair pricing and reliable customer support.",
    fallbackTagline: "Trusted by local families",
  },
  sweets: {
    specialties: ["Traditional Recipes", "Pure Desi Ghee", "Festival Specials", "Fresh Daily", "Family Run"],
    suggestedProducts: [
      { name: "Desi Ghee Jalebi", price: 220, unit: "kg" },
      { name: "Kaju Katli", price: 880, unit: "kg" },
      { name: "Besan Laddu", price: 380, unit: "kg" },
      { name: "Gulab Jamun", price: 420, unit: "kg" },
      { name: "Namkeen Mix", price: 240, unit: "kg" },
    ],
    fallbackDescription: "An authentic sweets shop known for fresh mithai, rich flavors, and trusted quality for every celebration.",
    fallbackTagline: "Authentic mithai, every day",
  },
  namkeen: {
    specialties: ["Fresh and Crispy", "Traditional Taste", "Bulk Orders", "Festival Packs", "No Artificial Colors"],
    suggestedProducts: [
      { name: "Aloo Bhujia", price: 180, unit: "kg" },
      { name: "Moong Dal Namkeen", price: 210, unit: "kg" },
      { name: "Khasta Mixture", price: 190, unit: "kg" },
      { name: "Mathri", price: 170, unit: "kg" },
      { name: "Sev", price: 160, unit: "kg" },
    ],
    fallbackDescription: "Known for crunchy and flavorful namkeen made with quality ingredients and consistent taste.",
    fallbackTagline: "Crispy snacks, classic taste",
  },
  bakery: {
    specialties: ["Freshly Baked", "Custom Orders", "Everyday Fresh Bread", "Celebration Cakes", "Premium Ingredients"],
    suggestedProducts: [
      { name: "Milk Bread", price: 45, unit: "loaf" },
      { name: "Butter Cookies", price: 140, unit: "box" },
      { name: "Chocolate Cake", price: 550, unit: "kg" },
      { name: "Cream Roll", price: 30, unit: "piece" },
      { name: "Veg Puff", price: 35, unit: "piece" },
    ],
    fallbackDescription: "A neighborhood bakery serving fresh breads, cakes, and snacks prepared daily with care.",
    fallbackTagline: "Freshly baked, always",
  },
  dairy: {
    specialties: ["Fresh Daily Supply", "Pure Quality", "No Preservatives", "Local Sourcing", "Home Delivery"],
    suggestedProducts: [
      { name: "Fresh Milk", price: 68, unit: "liter" },
      { name: "Paneer", price: 360, unit: "kg" },
      { name: "Curd", price: 95, unit: "kg" },
      { name: "Desi Ghee", price: 780, unit: "kg" },
      { name: "Butter", price: 520, unit: "kg" },
    ],
    fallbackDescription: "A reliable dairy shop offering fresh milk products with a focus on purity and consistency.",
    fallbackTagline: "Pure dairy, every day",
  },
  grocery: {
    specialties: ["Daily Essentials", "Bulk Orders", "Home Delivery", "Best Price", "Quality Assured"],
    suggestedProducts: [
      { name: "Basmati Rice", price: 135, unit: "kg" },
      { name: "Wheat Flour", price: 52, unit: "kg" },
      { name: "Cooking Oil", price: 185, unit: "liter" },
      { name: "Toor Dal", price: 145, unit: "kg" },
      { name: "Sugar", price: 48, unit: "kg" },
    ],
    fallbackDescription: "A complete grocery store for households, offering fresh stock, fair prices, and dependable service.",
    fallbackTagline: "Your daily essentials partner",
  },
  "fruits-vegetables": {
    specialties: ["Farm Fresh", "Same Day Stock", "Seasonal Picks", "Handpicked Quality", "Bulk Supply"],
    suggestedProducts: [
      { name: "Fresh Apple", price: 140, unit: "kg" },
      { name: "Banana", price: 55, unit: "dozen" },
      { name: "Tomato", price: 45, unit: "kg" },
      { name: "Potato", price: 35, unit: "kg" },
      { name: "Seasonal Fruit Basket", price: 299, unit: "basket" },
    ],
    fallbackDescription: "Fresh fruit and vegetable store focused on daily stock quality and value for local families.",
    fallbackTagline: "Fresh from farm to home",
  },
  "dry-fruits": {
    specialties: ["Premium Quality", "Fresh Packing", "Gift Packs", "Festival Specials", "Bulk Deals"],
    suggestedProducts: [
      { name: "Almonds", price: 980, unit: "kg" },
      { name: "Cashews", price: 1050, unit: "kg" },
      { name: "Pistachios", price: 1600, unit: "kg" },
      { name: "Raisins", price: 340, unit: "kg" },
      { name: "Dry Fruit Mix", price: 1150, unit: "kg" },
    ],
    fallbackDescription: "A trusted dry fruit store offering premium quality nuts, seeds, and festive gift packs.",
    fallbackTagline: "Premium dry fruits, trusted quality",
  },
  spices: {
    specialties: ["Aromatic Spices", "Traditional Blends", "Pure and Fresh", "Custom Mixes", "Wholesale Options"],
    suggestedProducts: [
      { name: "Turmeric Powder", price: 210, unit: "kg" },
      { name: "Red Chili Powder", price: 320, unit: "kg" },
      { name: "Coriander Powder", price: 190, unit: "kg" },
      { name: "Garam Masala", price: 380, unit: "kg" },
      { name: "Cumin Seeds", price: 360, unit: "kg" },
    ],
    fallbackDescription: "A spice shop known for fresh grinding, rich aroma, and reliable quality in every batch.",
    fallbackTagline: "Pure spices, rich aroma",
  },
  "tea-coffee": {
    specialties: ["Fresh Blends", "Premium Aroma", "Local Favorites", "Custom Mix", "Cafe Supply"],
    suggestedProducts: [
      { name: "Assam Tea", price: 420, unit: "kg" },
      { name: "Masala Tea Blend", price: 490, unit: "kg" },
      { name: "Filter Coffee", price: 620, unit: "kg" },
      { name: "Green Tea", price: 280, unit: "box" },
      { name: "Instant Coffee", price: 350, unit: "jar" },
    ],
    fallbackDescription: "Tea and coffee store serving flavorful blends for homes, offices, and cafe customers.",
    fallbackTagline: "Fresh brews, every cup",
  },
  pharmacy: {
    specialties: ["Licensed Store", "Genuine Medicines", "Health Essentials", "Fast Service", "Home Delivery"],
    suggestedProducts: [
      { name: "Paracetamol", price: 32, unit: "strip" },
      { name: "Vitamin D3", price: 145, unit: "bottle" },
      { name: "Digital Thermometer", price: 220, unit: "piece" },
      { name: "First Aid Kit", price: 299, unit: "kit" },
      { name: "Blood Pressure Monitor", price: 1499, unit: "piece" },
    ],
    fallbackDescription: "A dependable medical store with genuine medicines, healthcare essentials, and quick support.",
    fallbackTagline: "Trusted healthcare, nearby",
  },
  cosmetics: {
    specialties: ["Branded Products", "Skin Care", "Hair Care", "Personal Care", "Affordable Range"],
    suggestedProducts: [
      { name: "Face Wash", price: 149, unit: "piece" },
      { name: "Moisturizer", price: 249, unit: "piece" },
      { name: "Shampoo", price: 199, unit: "bottle" },
      { name: "Sunscreen", price: 299, unit: "piece" },
      { name: "Body Lotion", price: 229, unit: "piece" },
    ],
    fallbackDescription: "A personal care and cosmetics shop offering trusted brands and everyday beauty essentials.",
    fallbackTagline: "Daily care, trusted brands",
  },
  stationery: {
    specialties: ["School Supplies", "Office Supplies", "Print and Copy", "Bulk Orders", "Affordable Pricing"],
    suggestedProducts: [
      { name: "Notebook Pack", price: 199, unit: "pack" },
      { name: "Pen Set", price: 99, unit: "set" },
      { name: "A4 Paper", price: 320, unit: "ream" },
      { name: "School Geometry Box", price: 120, unit: "piece" },
      { name: "Marker Pack", price: 140, unit: "pack" },
    ],
    fallbackDescription: "A complete stationery store for students and offices with quality supplies at fair prices.",
    fallbackTagline: "Everything for school and office",
  },
  electronics: {
    specialties: ["Latest Gadgets", "Original Accessories", "Repair Support", "Warranty Backed", "Competitive Pricing"],
    suggestedProducts: [
      { name: "Fast Charger", price: 499, unit: "piece" },
      { name: "Bluetooth Earbuds", price: 1499, unit: "piece" },
      { name: "USB Cable", price: 199, unit: "piece" },
      { name: "Power Bank", price: 1299, unit: "piece" },
      { name: "Smart LED Bulb", price: 399, unit: "piece" },
    ],
    fallbackDescription: "An electronics store offering genuine gadgets, accessories, and practical support for daily tech needs.",
    fallbackTagline: "Smart gadgets, trusted service",
  },
  fashion: {
    specialties: ["Latest Styles", "Quality Fabrics", "Seasonal Collection", "Affordable Pricing", "Custom Fitting"],
    suggestedProducts: [
      { name: "Cotton Kurta", price: 699, unit: "piece" },
      { name: "Denim Jeans", price: 1299, unit: "piece" },
      { name: "Kids Wear Set", price: 899, unit: "set" },
      { name: "Casual Shirt", price: 799, unit: "piece" },
      { name: "Ethnic Dupatta", price: 499, unit: "piece" },
    ],
    fallbackDescription: "A clothing store with quality fashion for everyday wear, festive occasions, and family shopping.",
    fallbackTagline: "Style for every occasion",
  },
  "home-kitchen": {
    specialties: ["Kitchen Essentials", "Home Utility", "Durable Products", "Modern Designs", "Budget Friendly"],
    suggestedProducts: [
      { name: "Steel Container Set", price: 899, unit: "set" },
      { name: "Non-stick Pan", price: 799, unit: "piece" },
      { name: "Water Bottle", price: 249, unit: "piece" },
      { name: "Storage Basket", price: 199, unit: "piece" },
      { name: "Dinner Set", price: 1599, unit: "set" },
    ],
    fallbackDescription: "A home and kitchen store with practical utility products designed for everyday family needs.",
    fallbackTagline: "Better essentials for your home",
  },
  puja: {
    specialties: ["Authentic Samagri", "Festival Kits", "Temple Supplies", "Pure Ingredients", "Complete Puja Sets"],
    suggestedProducts: [
      { name: "Agarbatti Pack", price: 60, unit: "pack" },
      { name: "Puja Thali Set", price: 249, unit: "set" },
      { name: "Camphor", price: 45, unit: "pack" },
      { name: "Diya Pack", price: 99, unit: "pack" },
      { name: "Kumkum and Chandan", price: 79, unit: "set" },
    ],
    fallbackDescription: "A trusted puja samagri store with authentic items for daily rituals and festive occasions.",
    fallbackTagline: "Everything for your puja needs",
  },
  restaurant: {
    specialties: ["Freshly Prepared", "Hygienic Kitchen", "Quick Service", "Family Friendly", "Takeaway and Delivery"],
    suggestedProducts: [
      { name: "Veg Thali", price: 180, unit: "plate" },
      { name: "Paneer Butter Masala", price: 260, unit: "portion" },
      { name: "Tandoori Roti", price: 20, unit: "piece" },
      { name: "Masala Chai", price: 25, unit: "cup" },
      { name: "Cold Coffee", price: 110, unit: "glass" },
    ],
    fallbackDescription: "A local food destination known for fresh taste, hygienic preparation, and friendly service.",
    fallbackTagline: "Fresh taste, every visit",
  },
};

function normalizeCategoryKey(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function resolveShopCategory(input: string | null | undefined): ShopCategoryOption {
  const raw = String(input ?? "").trim();
  if (!raw) {
    return SHOP_CATEGORY_OPTIONS.find((item) => item.id === "general") as ShopCategoryOption;
  }

  const normalized = normalizeCategoryKey(raw);

  const directMatch = SHOP_CATEGORY_OPTIONS.find((item) => item.id === normalized);
  if (directMatch) return directMatch;

  const aliasMatch = SHOP_CATEGORY_OPTIONS.find((item) => {
    if (!Array.isArray(item.aliases)) return false;
    return item.aliases.some((alias) => normalizeCategoryKey(alias) === normalized);
  });
  if (aliasMatch) return aliasMatch;

  const labelMatch = SHOP_CATEGORY_OPTIONS.find((item) => normalizeCategoryKey(item.label) === normalized);
  if (labelMatch) return labelMatch;

  return {
    id: normalized || "general",
    label: raw,
    canonical: "general",
  };
}

export function toCanonicalShopCategory(input: string | null | undefined): CanonicalShopCategory {
  return resolveShopCategory(input).canonical;
}

export function getCategorySeedData(input: string | null | undefined): CategorySeedData {
  const resolved = resolveShopCategory(input);
  const exact = CATEGORY_SEEDS[resolved.id];
  if (exact) return exact;

  return {
    specialties: ["Quality Products", "Trusted Service", "Fair Pricing", "Local Favorite", "Quick Support"],
    suggestedProducts: [
      { name: `${resolved.label} Bestseller`, price: 199, unit: "piece" },
      { name: `${resolved.label} Popular Item`, price: 149, unit: "piece" },
      { name: `${resolved.label} Premium Item`, price: 299, unit: "piece" },
      { name: `${resolved.label} Value Pack`, price: 249, unit: "pack" },
      { name: `${resolved.label} New Arrival`, price: 179, unit: "piece" },
    ],
    fallbackDescription: `A trusted ${resolved.label.toLowerCase()} shop serving quality products with dependable local service.`,
    fallbackTagline: `Trusted ${resolved.label.toLowerCase()} destination`,
  };
}

export function getShopCategoryChoices() {
  return SHOP_CATEGORY_OPTIONS.map((category) => ({
    id: category.id,
    label: category.label,
  }));
}
