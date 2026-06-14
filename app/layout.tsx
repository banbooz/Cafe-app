import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APP_NAME, APP_VERSION } from "./lib/appMeta";

export const metadata: Metadata = {
  title: APP_NAME,
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
        <style>{`
          html {
            overflow-y: scroll;
            scrollbar-gutter: stable;
          }

          body {
            overflow-x: hidden;
          }

          .page-enter {
            padding-bottom: 11rem !important;
          }

          .food-card-motion {
            border-radius: 2rem !important;
          }

          .food-card-motion > div:first-child {
            min-height: 220px;
          }

          .food-card-motion > div:first-child > button.add-burst {
            top: auto !important;
            left: auto !important;
            right: 16px !important;
            bottom: 16px !important;
            z-index: 20 !important;
            width: auto !important;
            min-width: 76px !important;
            height: 42px !important;
            padding: 0 16px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 5px !important;
            border-radius: 999px !important;
            background: #263238 !important;
            color: #ffffff !important;
            font-size: 12px !important;
            box-shadow: 0 14px 30px rgb(29 37 40 / 0.28) !important;
          }

          .food-card-motion > div:first-child > button.add-burst::before {
            content: "Add";
            font-weight: 900;
          }

          .food-card-motion > div:first-child > button.add-burst:disabled {
            background: rgba(255,255,255,.82) !important;
            color: #94a3b8 !important;
          }

          .food-card-motion > div:first-child > button.add-burst:disabled::before {
            content: "Off";
          }

          .basket-dock {
            min-height: 68px !important;
          }

          @media (min-width: 768px) {
            .food-card-motion > div:first-child {
              min-height: 245px;
            }
          }
        `}</style>
        <div className="fixed bottom-2 left-2 z-[120] rounded-full bg-[#263238] px-3 py-1 text-[11px] font-black text-white shadow-lg backdrop-blur">
          {APP_VERSION}
        </div>
      </body>
    </html>
  );
}
