import type { Metadata, Viewport } from "next";
import "./globals.css";

const APP_VERSION = "v0.2.4";

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
      <body className="min-h-full flex flex-col">
        {children}
        <style>{`
          :root {
            --background: #ffffff;
            --foreground: #2a0b0b;
          }

          html,
          body {
            background: #ffffff !important;
            color: #2a0b0b !important;
          }

          .bg-\[\#dfe4e7\],
          .bg-\[\#e6e1d8\],
          .bg-\[\#f6f1ea\],
          .bg-\[\#eef1f3\],
          .bg-\[\#fff5f5\],
          .bg-\[\#fee2e2\],
          .bg-\[\#fff1f2\] {
            background-color: #f7f7f7 !important;
          }

          .bg-\[\#f3f5f6\],
          .bg-\[\#f8fafb\],
          .bg-\[\#f4f1ea\],
          .bg-\[\#fbfaf7\],
          .bg-white {
            background-color: #ffffff !important;
          }

          .bg-slate-50,
          .bg-slate-100,
          .bg-stone-50,
          .bg-stone-100,
          .bg-red-50,
          .bg-red-100,
          .bg-amber-50,
          .bg-yellow-50,
          .bg-green-50,
          .bg-emerald-100 {
            background-color: #f7f7f7 !important;
          }

          .bg-slate-900,
          .bg-\[\#111827\],
          .bg-\[\#20160f\],
          .bg-red-700,
          .bg-emerald-700,
          .cat-on,
          .toggle-on,
          .table-on,
          .qty-accent,
          .add {
            background-color: #991b1b !important;
            border-color: #991b1b !important;
            color: #ffffff !important;
          }

          .primary,
          .bg-orange-500 {
            background-color: #dc2626 !important;
            color: #ffffff !important;
          }

          .secondary,
          .cat,
          .toggle,
          .table,
          .pill,
          .small {
            background-color: #ffffff !important;
            border-color: #d1d5db !important;
            color: #7f1d1d !important;
          }

          .text-orange-600,
          .text-red-700,
          .text-emerald-700,
          .text-green-800,
          .text-amber-800,
          .text-yellow-900 {
            color: #b91c1c !important;
          }

          .text-orange-300 {
            color: #ffffff !important;
          }

          .text-slate-950,
          .text-slate-900,
          .text-stone-800,
          .text-\[\#20160f\] {
            color: #2a0b0b !important;
          }

          .text-slate-600,
          .text-slate-500,
          .text-stone-500 {
            color: #6b1d1d !important;
          }

          .ring-slate-200,
          .border-slate-200,
          .ring-stone-200,
          .border-stone-200,
          .ring-red-100,
          .ring-red-200,
          .ring-amber-200,
          .ring-yellow-100,
          .ring-green-200 {
            --tw-ring-color: #d1d5db !important;
            border-color: #d1d5db !important;
          }

          header.rounded-\[2rem\],
          header.bg-slate-900,
          header.bg-\[\#111827\],
          header.bg-\[\#20160f\],
          section.bg-slate-900,
          section.bg-\[\#111827\],
          section.bg-\[\#20160f\],
          .rounded-\[2rem\].bg-slate-900,
          .rounded-\[2rem\].bg-\[\#111827\],
          .rounded-\[2rem\].bg-\[\#20160f\] {
            background-color: #b91c1c !important;
            background-image:
              linear-gradient(45deg, rgba(255,255,255,0.96) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.96) 75%),
              linear-gradient(45deg, rgba(255,255,255,0.96) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.96) 75%) !important;
            background-position: 0 0, 14px 14px !important;
            background-size: 28px 28px !important;
            color: #ffffff !important;
            box-shadow: 0 18px 38px rgb(153 27 27 / 0.20) !important;
          }

          header.rounded-\[2rem\]::before,
          header.bg-slate-900::before,
          header.bg-\[\#111827\]::before,
          header.bg-\[\#20160f\]::before,
          section.bg-slate-900::before,
          section.bg-\[\#111827\]::before,
          section.bg-\[\#20160f\]::before,
          .rounded-\[2rem\].bg-slate-900::before,
          .rounded-\[2rem\].bg-\[\#111827\]::before,
          .rounded-\[2rem\].bg-\[\#20160f\]::before {
            content: "";
            display: block;
            height: 12px;
            margin: -1.25rem -1.25rem 1rem -1.25rem;
            border-radius: 2rem 2rem 0 0;
            background-color: #ffffff;
            background-image:
              linear-gradient(45deg, #b91c1c 25%, transparent 25%, transparent 75%, #b91c1c 75%),
              linear-gradient(45deg, #b91c1c 25%, transparent 25%, transparent 75%, #b91c1c 75%);
            background-position: 0 0, 8px 8px;
            background-size: 16px 16px;
          }

          header.rounded-\[2rem\] h1,
          header.rounded-\[2rem\] p,
          header.bg-\[\#111827\] h1,
          header.bg-\[\#111827\] p,
          header.bg-slate-900 h1,
          header.bg-slate-900 p,
          section.bg-slate-900 h1,
          section.bg-slate-900 h2,
          section.bg-slate-900 p {
            color: #ffffff !important;
          }

          header.rounded-\[2rem\] label,
          header.rounded-\[2rem\] input {
            background-color: #ffffff !important;
            color: #2a0b0b !important;
          }

          .shadow-sm,
          .shadow-2xl {
            box-shadow: 0 16px 38px rgb(127 29 29 / 0.08) !important;
          }
        `}</style>
        <div className="fixed bottom-2 left-2 z-[120] rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-black text-white shadow-lg backdrop-blur">
          {APP_VERSION}
        </div>
      </body>
    </html>
  );
}
