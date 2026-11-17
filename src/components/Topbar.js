"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import { activeNav } from "@/components/nav";

const SUBTITLES = {
  "/": "A snapshot of postings and applicant activity.",
  "/jobs": "Create, publish, pause and remove job postings.",
  "/applicants": "Everyone who applied — by job, date and status.",
  "/categories": "Manage the categories jobs can be filed under.",
  "/team": "Who can access this dashboard.",
};

export default function Topbar({ onOpenMobile }) {
  const pathname = usePathname();
  const active = activeNav(pathname);
  const [today, setToday] = useState("");

  // Deferred to the client — current time isn't allowed during prerender.
  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }));
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="h-16 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button className="btn btn-ghost btn-icon lg:hidden" onClick={onOpenMobile} aria-label="Open menu">
            <Icon name="grip" />
          </button>
          <div className="min-w-0">
            <h1 className="text-[1.15rem] font-semibold tracking-tight truncate">{active.label}</h1>
            <p className="text-[0.8rem] text-muted truncate hidden sm:block">{SUBTITLES[active.href]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {today && (
            <span className="hidden md:flex items-center gap-1.5 text-[0.8rem] text-muted mr-1">
              <Icon name="clock" size={15} />
              {today}
            </span>
          )}
          <button className="btn btn-ghost btn-icon" aria-label="Notifications">
            <Icon name="bell" />
          </button>
        </div>
      </div>
    </header>
  );
}
