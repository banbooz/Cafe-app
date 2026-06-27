"use client";

import StaffMenuControls from "./StaffMenuControls";
import { useDemoEditingLock } from "../lib/demoEditingLock";
import { menuExperiences, staffRoute, type MenuExperienceId } from "../lib/menu";

type Props = { section: "Kitchen" | "Business"; compact?: boolean; experienceMode?: MenuExperienceId };

const staffSecondaryButton = "rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-700 ring-1 ring-slate-200";

export default function AvailabilityControls(props: Props) {
  const { locked, loading } = useDemoEditingLock();
  const experienceMode = props.experienceMode ?? "restaurant";
  const experience = menuExperiences[experienceMode];
  const otherHref = staffRoute(props.section === "Kitchen" ? "business" : "kitchen", experienceMode);
  const otherLabel = props.section === "Kitchen" ? "Business app" : "Kitchen app";

  if (loading) {
    return (
      <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Checking admin lock</p>
        <h2 className="mt-1 text-xl font-black text-slate-950">Loading editing permissions</h2>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-500">Checking whether this demo page is editable or view-only.</p>
      </section>
    );
  }

  if (!locked) return <StaffMenuControls {...props} />;

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">{experience.label} controls locked</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Demo mode is active</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
            Editing is locked by the admin, so this {props.section.toLowerCase()} page is view-only for customer-facing menu settings.
          </p>
        </div>
        <a href={otherHref} className={staffSecondaryButton}>{otherLabel}</a>
      </div>
      <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <p className="text-sm font-black text-slate-900">Blocked while locked</p>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
          Adding products, editing names, prices, descriptions, images, categories, prep times, allergens, dietary tags, availability, active/inactive items, and reset controls are disabled so demos cannot change the customer ordering page.
        </p>
      </div>
    </section>
  );
}
