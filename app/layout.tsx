import type { Metadata, Viewport } from "next";
import "./globals.css";

const APP_VERSION = "v3.0.0";

export const metadata: Metadata = {
  title: "Cafe Table Ordering",
  description: "A mobile-first cafe table ordering experience.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        <div className="fixed bottom-2 left-2 z-[120] rounded-full bg-[#263238] px-3 py-1 text-[11px] font-black text-white shadow-lg backdrop-blur">
          {APP_VERSION}
        </div>
      </body>
    </html>
  );
}
