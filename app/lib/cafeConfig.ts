export const cafeConfig = {
  id: process.env.NEXT_PUBLIC_FIREBASE_CAFE_ID || "corner-cafe-demo",
  name: process.env.NEXT_PUBLIC_CAFE_NAME || "The Corner Cafe",
  tableNumber: Number(process.env.NEXT_PUBLIC_DEMO_TABLE_NUMBER || "3"),
};

export function getCafeStorageKey(baseKey: string) {
  return `${baseKey}:${cafeConfig.id}`;
}
