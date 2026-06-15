export type MenuItem = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  prep: string;
  allergens: string[];
  popular?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  available?: boolean;
};

export type MenuExperienceId = "restaurant" | "cafe" | "drinks";

export type MenuExperience = {
  id: MenuExperienceId;
  label: string;
  name: string;
  eyebrow: string;
  tagline: string;
  menuLabel: string;
  menuTitle: string;
  searchPlaceholder: string;
  featuredLabel: string;
  featuredCta: string;
  emptyText: string;
  categories: readonly string[];
  categoryIcons: Record<string, string>;
  theme: {
    background: string;
    panel: string;
    soft: string;
    ink: string;
    muted: string;
    accent: string;
    deep: string;
  };
  items: MenuItem[];
};

export const productCategories = ["Starter", "Main", "Pudding", "Drinks"] as const;
export type ProductCategory = (typeof productCategories)[number];

export const categories = ["All", ...productCategories] as const;

const restaurantItems: MenuItem[] = [
  { id: 1, name: "Smashed Avocado Toast", category: "Main", description: "Sourdough, chilli, lemon", price: 6.9, prep: "7 min", allergens: ["Gluten"], image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=900&q=80", popular: true, vegetarian: true, vegan: true },
  { id: 2, name: "Turkish Eggs", category: "Main", description: "Garlic yoghurt, paprika butter", price: 8.4, prep: "10 min", allergens: ["Egg", "Milk", "Gluten"], image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80", vegetarian: true },
  { id: 3, name: "Roast Chicken Ciabatta", category: "Main", description: "Leaves, tomato, house aioli", price: 7.8, prep: "8 min", allergens: ["Gluten", "Egg"], image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80", popular: true },
  { id: 4, name: "Tomato Basil Spaghetti", category: "Main", description: "Parmesan, garlic, basil", price: 9.5, prep: "12 min", allergens: ["Gluten", "Milk"], image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80", popular: true, vegetarian: true },
  { id: 5, name: "Dark Chocolate Gateau", category: "Pudding", description: "Ganache, cocoa, cream", price: 5.2, prep: "4 min", allergens: ["Gluten", "Milk", "Egg"], image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80", popular: true, vegetarian: true },
  { id: 6, name: "Almond Croissant", category: "Pudding", description: "Baked daily, almond cream", price: 3.9, prep: "5 min", allergens: ["Gluten", "Milk", "Nuts"], image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=900&q=80", vegetarian: true },
  { id: 7, name: "Flat White", category: "Drinks", description: "Double espresso, steamed milk", price: 3.4, prep: "3 min", allergens: ["Milk"], image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80", popular: true, vegetarian: true },
  { id: 8, name: "Iced Latte", category: "Drinks", description: "Espresso, milk, ice", price: 4.1, prep: "3 min", allergens: ["Milk"], image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80", popular: true, vegetarian: true },
  { id: 9, name: "Garlic Dough Bites", category: "Starter", description: "Garlic butter, parmesan", price: 4.8, prep: "6 min", allergens: ["Gluten", "Milk"], image: "https://www.bbcgoodfoodme.com/assets/legacy/recipe/recipe-image/2019/02/dough%2Dballs-with-garlic-butter.jpg", vegetarian: true },
  { id: 10, name: "Rosemary Fries", category: "Starter", description: "Sea salt, rosemary", price: 4.2, prep: "6 min", allergens: ["None listed"], image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80", vegetarian: true, vegan: true }
];

const cafeCategories = ["All", "Coffee", "Tea", "Pastries", "Breakfast", "Cold Drinks"] as const;

const cafeItems: MenuItem[] = [
  { id: 101, name: "House Flat White", category: "Coffee", description: "Double espresso, silky steamed milk", price: 3.6, prep: "3 min", allergens: ["Milk"], image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80", popular: true, vegetarian: true },
  { id: 102, name: "Caramel Oat Latte", category: "Coffee", description: "Espresso, oat milk, caramel drizzle", price: 4.25, prep: "4 min", allergens: ["Oats"], image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=900&q=80", popular: true, vegetarian: true, vegan: true },
  { id: 103, name: "Iced Vanilla Latte", category: "Cold Drinks", description: "Espresso, vanilla, cold milk, ice", price: 4.45, prep: "3 min", allergens: ["Milk"], image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80", popular: true, vegetarian: true },
  { id: 104, name: "English Breakfast Tea", category: "Tea", description: "Classic black tea with milk option", price: 2.7, prep: "3 min", allergens: ["Milk optional"], image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80", vegetarian: true, vegan: true },
  { id: 105, name: "Iced Matcha", category: "Cold Drinks", description: "Matcha, milk, ice, light vanilla", price: 4.8, prep: "4 min", allergens: ["Milk"], image: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=900&q=80", vegetarian: true },
  { id: 106, name: "Almond Croissant", category: "Pastries", description: "Baked daily with almond cream", price: 3.9, prep: "2 min", allergens: ["Gluten", "Milk", "Nuts"], image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=900&q=80", popular: true, vegetarian: true },
  { id: 107, name: "Cinnamon Bun", category: "Pastries", description: "Soft roll, cinnamon sugar, glaze", price: 3.5, prep: "2 min", allergens: ["Gluten", "Milk"], image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=900&q=80", vegetarian: true },
  { id: 108, name: "Blueberry Muffin", category: "Pastries", description: "Buttery muffin, blueberry compote", price: 3.2, prep: "2 min", allergens: ["Gluten", "Milk", "Egg"], image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=900&q=80", vegetarian: true },
  { id: 109, name: "Breakfast Brioche", category: "Breakfast", description: "Egg, cheese, tomato relish", price: 5.9, prep: "7 min", allergens: ["Gluten", "Egg", "Milk"], image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80", popular: true, vegetarian: true },
  { id: 110, name: "Granola Pot", category: "Breakfast", description: "Greek yoghurt, berries, honey", price: 4.6, prep: "2 min", allergens: ["Milk", "Nuts"], image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=900&q=80", vegetarian: true }
];

const drinkCategories = ["All", "Beer", "Wine", "Cocktails", "Spirits", "Cider", "Soft Drinks"] as const;

const drinkItems: MenuItem[] = [
  { id: 201, name: "House Lager", category: "Beer", description: "Cold draught lager, crisp finish", price: 5.1, prep: "2 min", allergens: ["Gluten"], image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=900&q=80", popular: true, vegan: true },
  { id: 202, name: "Craft Pale Ale", category: "Beer", description: "Citrus hops, smooth malt", price: 5.6, prep: "2 min", allergens: ["Gluten"], image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=900&q=80", popular: true, vegan: true },
  { id: 203, name: "Pinot Grigio", category: "Wine", description: "Dry white wine, light citrus", price: 6.2, prep: "2 min", allergens: ["Sulphites"], image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80", popular: true },
  { id: 204, name: "Malbec Red", category: "Wine", description: "Soft red wine, dark fruit", price: 6.4, prep: "2 min", allergens: ["Sulphites"], image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=80" },
  { id: 205, name: "Espresso Martini", category: "Cocktails", description: "Vodka, coffee, vanilla, foam", price: 8.9, prep: "5 min", allergens: ["None listed"], image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=900&q=80", popular: true },
  { id: 206, name: "Berry Mojito", category: "Cocktails", description: "Rum, lime, mint, berries", price: 8.4, prep: "5 min", allergens: ["None listed"], image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80" },
  { id: 207, name: "Single Gin & Tonic", category: "Spirits", description: "House gin, tonic, fresh lime", price: 6.8, prep: "3 min", allergens: ["None listed"], image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80", popular: true },
  { id: 208, name: "Whisky Serve", category: "Spirits", description: "House whisky over ice", price: 7.2, prep: "2 min", allergens: ["None listed"], image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=900&q=80" },
  { id: 209, name: "Apple Cider", category: "Cider", description: "Chilled apple cider, medium dry", price: 5.3, prep: "2 min", allergens: ["Sulphites"], image: "https://images.unsplash.com/photo-1575596510825-f748919a2bf7?auto=format&fit=crop&w=900&q=80" },
  { id: 210, name: "Cloudy Lemonade", category: "Soft Drinks", description: "Fresh lemon, sugar, sparkling water", price: 3.6, prep: "2 min", allergens: ["None listed"], image: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&w=900&q=80", vegan: true }
];

export const menuItems = restaurantItems;

export const defaultExperienceId: MenuExperienceId = "restaurant";

export const menuExperiences: Record<MenuExperienceId, MenuExperience> = {
  restaurant: {
    id: "restaurant",
    label: "Restaurant Demo",
    name: "The Corner Cafe",
    eyebrow: "Restaurant demo",
    tagline: "Full table ordering for cafes, restaurants, drinks venues and lunch spots.",
    menuLabel: "Menu",
    menuTitle: "Explore menu",
    searchPlaceholder: "Search dishes, drinks, allergens...",
    featuredLabel: "Featured today",
    featuredCta: "View popular",
    emptyText: "No matching items. Try another search or category.",
    categories,
    categoryIcons: { All: "⌂", Starter: "✦", Main: "◉", Pudding: "◆", Drinks: "◌" },
    theme: { background: "#f7f7f5", panel: "#ffffff", soft: "#f1f4f4", ink: "#111517", muted: "#617174", accent: "#ff385c", deep: "#263238" },
    items: restaurantItems
  },
  cafe: {
    id: "cafe",
    label: "Cafe",
    name: "Bean & Table",
    eyebrow: "Cafe mode",
    tagline: "Fast coffee, pastry and breakfast ordering with a warmer cafe feel.",
    menuLabel: "Cafe menu",
    menuTitle: "Order coffee",
    searchPlaceholder: "Search coffee, pastries, breakfast...",
    featuredLabel: "Cafe favourite",
    featuredCta: "Order favourite",
    emptyText: "No cafe items found. Try coffee, pastries or breakfast.",
    categories: cafeCategories,
    categoryIcons: { All: "⌂", Coffee: "☕", Tea: "◌", Pastries: "◇", Breakfast: "☀", "Cold Drinks": "❄" },
    theme: { background: "#f6efe7", panel: "#fffaf3", soft: "#eee0d0", ink: "#2c1c12", muted: "#80624b", accent: "#b66a2c", deep: "#4d2f1e" },
    items: cafeItems
  },
  drinks: {
    id: "drinks",
    label: "Drinks",
    name: "After Hours Drinks",
    eyebrow: "Drinks mode",
    tagline: "Simple drinks-first ordering for bars, venues and evening service.",
    menuLabel: "Drinks menu",
    menuTitle: "Choose a drink",
    searchPlaceholder: "Search beer, wine, cocktails...",
    featuredLabel: "Choose a drink",
    featuredCta: "Open drinks menu",
    emptyText: "No drinks found. Try another type.",
    categories: drinkCategories,
    categoryIcons: { All: "⌂", Beer: "🍺", Wine: "🍷", Cocktails: "🍸", Spirits: "🥃", Cider: "●", "Soft Drinks": "◌" },
    theme: { background: "#171312", panel: "#241c1a", soft: "#322623", ink: "#fff8f0", muted: "#c9b2a2", accent: "#d7a048", deep: "#0f0b0a" },
    items: drinkItems
  }
};

export const experienceOptions = Object.values(menuExperiences);

export function money(value: number) {
  return `£${value.toFixed(2)}`;
}
