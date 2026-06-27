"use client";

import { FormEvent, useEffect, useState } from "react";
import { cafeConfig } from "../lib/cafeConfig";
import { useDemoEditingLock } from "../lib/demoEditingLock";
import { menuExperiences, staffRoute, type MenuExperienceId } from "../lib/menu";

const modes: MenuExperienceId[] = ["restaurant", "cafe", "drinks"];
const sessionKey = "cafeAdminUnlocked";
const primaryButton = "inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-950/20 disabled:bg-slate-300 disabled:shadow-none";
const secondaryButton = "inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-slate-700 ring-1 ring-slate-200";

export default function AdminDemoLockPage() {
  const { locked, loading, error, setLocked } = useDemoEditingLock();
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      setAuthenticated(window.sessionStorage.getItem(sessionKey) === "true");
    } catch {
      setAuthenticated(false);
    }
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");

    const response = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    const data = await response.json().catch(() => ({})) as { ok?: boolean; message?: string };

    if (!response.ok || !data.ok) {
      setAuthError(data.message || "Could not unlock the admin page.");
      return;
    }

    try {
      window.sessionStorage.setItem(sessionKey, "true");
    } catch {
      // The page still works for this render even if session storage is blocked.
    }

    setAuthenticated(true);
    setPin("");
  }

  async function toggleLock() {
    setSaving(true);
    await setLocked(!locked);
    setSaving(false);
  }

  function logOut() {
    try {
      window.sessionStorage.removeItem(sessionKey);
    } catch {
      // Ignore storage errors.
    }
    setAuthenticated(false);
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <section className="mx-auto flex min-h-[80vh] max-w-md items-center">
          <form onSubmit={handleLogin} className="w-full rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl shadow-black/30">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">Admin access - {cafeConfig.id}</p>
            <h1 className="mt-2 text-3xl font-black">Demo Editing Lock</h1>
            <p className="mt-3 text-sm font-bold leading-6 text-slate-500">
              Enter the admin PIN to control whether demo businesses can edit customer-facing menu settings.
            </p>
            <label className="mt-6 block">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Admin PIN</span>
              <input
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                className="mt-2 w-full rounded-2xl bg-slate-50 p-4 text-lg font-black outline-none ring-1 ring-slate-200 focus:ring-slate-950"
                autoComplete="current-password"
              />
            </label>
            {authError ? <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-black text-red-700 ring-1 ring-red-100">{authError}</p> : null}
            <button type="submit" className={`${primaryButton} mt-5 w-full`}>Unlock admin page</button>
            <p className="mt-4 text-xs font-bold leading-5 text-slate-400">Set the PIN with the ADMIN_PIN environment variable in deployment settings.</p>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/20 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200">Admin page - {cafeConfig.id}</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Demo Editing Lock</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/75">
                Control whether kitchen and business demo pages can edit anything that changes the live customer ordering interface.
              </p>
            </div>
            <button type="button" onClick={logOut} className="rounded-2xl bg-white/10 px-4 py-3 text-xs font-black text-white ring-1 ring-white/20">Lock admin page</button>
          </div>
        </header>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Current status</p>
            <h2 className="mt-2 text-2xl font-black">{locked ? "Editing Disabled / Demo Mode" : "Editing Enabled"}</h2>
            <p className="mt-3 text-sm font-bold leading-6 text-slate-500">
              {locked
                ? "Businesses can view the kitchen and business pages, but customer-facing menu edit controls are hidden and locked."
                : "Kitchen and business pages work normally, including menu edits, availability changes, product changes, and reset controls."}
            </p>
            {error ? <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-black text-amber-800 ring-1 ring-amber-100">{error}</p> : null}
            <button type="button" onClick={toggleLock} disabled={loading || saving} className={`${primaryButton} mt-6 w-full sm:w-auto`}>
              {saving ? "Saving..." : locked ? "Enable editing" : "Disable editing for demos"}
            </button>
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">What gets locked</p>
            <ul className="mt-4 space-y-3 text-sm font-bold leading-6 text-slate-500">
              <li>Menu item edits, prices, descriptions, images and categories</li>
              <li>Allergens, dietary tags, prep times and popular labels</li>
              <li>Product availability, active/inactive items and reset buttons</li>
              <li>Adding new customer-facing products</li>
            </ul>
            <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-black text-emerald-800 ring-1 ring-emerald-100">
              Kitchen order status buttons and business analytics stay usable.
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Demo links</p>
              <h2 className="mt-1 text-xl font-black">Check the staff pages</h2>
            </div>
            <a href="/" className={secondaryButton}>Customer page</a>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modes.map((mode) => (
              <article key={mode} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <h3 className="font-black">{menuExperiences[mode].label}</h3>
                <div className="mt-4 grid gap-2">
                  <a href={staffRoute("business", mode)} className={secondaryButton}>Business view</a>
                  <a href={staffRoute("kitchen", mode)} className={secondaryButton}>Kitchen view</a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
