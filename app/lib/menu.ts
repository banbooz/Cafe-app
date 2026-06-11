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
};

export const categories = ["All", "Starter", "Main", "Pudding", "Drinks"];

export const menuItems: MenuItem[] = [
  { id: 1, name: "Smashed Avocado Toast", category: "Main", description: "Sourdough, chilli, lemon", price: 6.9, prep: "7 min", allergens: ["Gluten"], image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=900&q=80", popular: true, vegetarian: true },
  { id: 2, name: "Turkish Eggs", category: "Main", description: "Garlic yoghurt, paprika butter", price: 8.4, prep: "10 min", allergens: ["Egg", "Milk", "Gluten"], image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80", vegetarian: true },
  { id: 3, name: "Roast Chicken Ciabatta", category: "Main", description: "Leaves, tomato, house aioli", price: 7.8, prep: "8 min", allergens: ["Gluten", "Egg"], image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80", popular: true },
  { id: 4, name: "Tomato Basil Spaghetti", category: "Main", description: "Parmesan, garlic, basil", price: 9.5, prep: "12 min", allergens: ["Gluten", "Milk"], image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80", popular: true, vegetarian: true },
  { id: 5, name: "Dark Chocolate Gateau", category: "Pudding", description: "Ganache, cocoa, cream", price: 5.2, prep: "4 min", allergens: ["Gluten", "Milk", "Egg"], image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80", popular: true, vegetarian: true },
  { id: 6, name: "Almond Croissant", category: "Pudding", description: "Baked daily, almond cream", price: 3.9, prep: "5 min", allergens: ["Gluten", "Milk", "Nuts"], image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=900&q=80", vegetarian: true },
  { id: 7, name: "Flat White", category: "Drinks", description: "Double espresso, steamed milk", price: 3.4, prep: "3 min", allergens: ["Milk"], image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80", popular: true },
  { id: 8, name: "Iced Latte", category: "Drinks", description: "Espresso, milk, ice", price: 4.1, prep: "3 min", allergens: ["Milk"], image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80", popular: true },
  { id: 9, name: "Garlic Dough Bites", category: "Starter", description: "Garlic butter, parmesan", price: 4.8, prep: "6 min", allergens: ["Gluten", "Milk"], image: "https://www.bbcgoodfoodme.com/assets/legacy/recipe/recipe-image/2019/02/dough%2Dballs-with-garlic-butter.jpg", vegetarian: true },
  { id: 10, name: "Rosemary Fries", category: "Starter", description: "Sea salt, rosemary", price: 4.2, prep: "6 min", allergens: ["None listed"], image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80", vegetarian: true }
];

export function money(value: number) {
  return `£${value.toFixed(2)}`;
}
