export function Phone({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100svh] bg-[#f2f2ef]">
      <div className="mx-auto min-h-[100svh] w-full max-w-[480px] overflow-x-hidden bg-[#f7f7f5] text-[#1d2528] shadow-[0_24px_80px_rgba(29,37,40,0.14)] sm:my-6 sm:rounded-[2.25rem]">
        {children}
      </div>
    </main>
  );
}

export function Top({ title, back, right, onRight }: { title: string; back: () => void; right: string; onRight: () => void }) {
  return (
    <header className="sticky top-0 z-40 bg-[#f7f7f5]/85 px-4 py-3 backdrop-blur-xl">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <button onClick={back} className="h-11 w-11 rounded-full bg-white text-xs font-black shadow-[0_12px_30px_rgba(29,37,40,0.12)] ring-1 ring-black/5">Back</button>
        <h1 className="truncate text-center text-sm font-black">{title}</h1>
        <button onClick={onRight} className="min-h-11 rounded-full bg-white px-4 text-xs font-black shadow-[0_12px_30px_rgba(29,37,40,0.12)] ring-1 ring-black/5">{right}</button>
      </div>
    </header>
  );
}

export function Footer({ children }: { children: React.ReactNode }) {
  return <section className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 px-4 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-3 sm:bottom-5">{children}</section>;
}

export function Center({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-[100svh] flex-col justify-center bg-[#f7f7f5] px-6 text-center text-[#1d2528]">{children}</main>;
}
