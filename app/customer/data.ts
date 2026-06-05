export type Screen = "menu" | "detail" | "cart" | "allergens" | "tables" | "done";
export type Cat = "All" | "Breakfast" | "Lunch" | "Bakery" | "Drinks";
export type Item = { id:number; name:string; cat:Exclude<Cat,"All">; desc:string; price:number; allergens:string[]; imageClass:string; };
export const cats: Cat[] = ["All", "Breakfast", "Lunch", "Bakery", "Drinks"];
export const screens: Screen[] = ["menu", "detail", "cart", "allergens", "tables", "done"];
export const tables = [1,2,3,4,5,6,7,8,9,10,11,12];
export const money = (n:number) => `£${n.toFixed(2)}`;
export const isScreen = (x:unknown): x is Screen => typeof x === "string" && screens.includes(x as Screen);
export const items: Item[] = [
 { id:1, name:"Smashed Avocado Toast", cat:"Breakfast", desc:"Sourdough, avocado, lemon and chilli.", price:6.9, allergens:["Gluten"], imageClass:"from-lime-200 to-green-500" },
 { id:2, name:"Turkish Eggs", cat:"Breakfast", desc:"Garlic yoghurt, paprika butter and flatbread.", price:8.4, allergens:["Egg","Milk","Gluten"], imageClass:"from-yellow-100 to-orange-400" },
 { id:3, name:"Roast Chicken Ciabatta", cat:"Lunch", desc:"Chicken, leaves, tomato and house aioli.", price:7.8, allergens:["Gluten","Egg","Mustard"], imageClass:"from-amber-200 to-orange-600" },
 { id:4, name:"Dark Chocolate Gateau", cat:"Bakery", desc:"Chocolate sponge, ganache and cream.", price:5.2, allergens:["Gluten","Milk","Egg"], imageClass:"from-stone-500 to-zinc-950" },
 { id:5, name:"Flat White", cat:"Drinks", desc:"Double espresso and steamed milk.", price:3.4, allergens:["Milk"], imageClass:"from-stone-100 to-amber-700" },
 { id:6, name:"Iced Latte", cat:"Drinks", desc:"Espresso, milk and ice.", price:4.1, allergens:["Milk"], imageClass:"from-cyan-100 to-blue-300" },
];
