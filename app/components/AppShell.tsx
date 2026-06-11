export function Phone({ children }: { children: React.ReactNode }) {
  return <main className="min-h-[100svh] bg-[#e6e1d8]"><div className="mx-auto min-h-[100svh] w-full max-w-[430px] overflow-x-hidden bg-[#f4f1ea] text-slate-900 shadow-2xl shadow-slate-950/10 sm:my-6 sm:rounded-[2rem]">{children}</div></main>;
}

export function Top({ title, back, right, onRight }: { title: string; back: () => void; right: string; onRight: () => void }) {
  return <header className="sticky top-0 z-40 border-b border-slate-200 bg-[#f4f1ea]/95 px-3 py-3 backdrop-blur"><div className="grid grid-cols-[auto_1fr_auto] items-center gap-2"><button onClick={back} className="h-11 w-11 rounded-full bg-white text-xs font-black shadow-sm ring-1 ring-slate-200">Back</button><h1 className="truncate text-center text-sm font-black">{title}</h1><button onClick={onRight} className="min-h-11 rounded-full bg-white px-3 text-xs font-black shadow-sm ring-1 ring-slate-200">{right}</button></div></header>;
}

export function Footer({ children }: { children: React.ReactNode }) {
  return <section className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 bg-[#f4f1ea]/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:bottom-6 sm:rounded-b-[2rem]">{children}</section>;
}

export function Center({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-[100svh] flex-col justify-center px-6 text-center">{children}</main>;
}
