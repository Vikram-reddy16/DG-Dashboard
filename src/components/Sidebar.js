"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import { NAV, activeNav } from "@/components/nav";
import { useStore } from "@/lib/store";
import { initials } from "@/lib/format";
import { logout } from "@/app/login/actions";

// Desktop: a slim icon rail that expands over the content on hover (no layout shift).
export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const [hovered, setHovered] = useState(false);
  const collapsed = !hovered;
  const pathname = usePathname();
  const active = activeNav(pathname);
  const { user } = useStore();
  const name = user?.fullName || "";
  const role = user?.role || "";

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen flex flex-col border-r border-[var(--sidebar-line)] text-[var(--sidebar-ink)] transition-[transform,width] duration-200 ease-out w-[248px] ${hovered ? "lg:w-[248px] lg:shadow-[var(--shadow-lg)]" : "lg:w-[76px]"} lg:translate-x-0 overflow-hidden ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ background: "var(--sidebar)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-4 shrink-0 border-b border-[var(--sidebar-line)]">
        <div
          className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0 font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          DG
        </div>
        <div className={`min-w-0 leading-tight ${collapsed ? "lg:hidden" : ""}`}>
          <div className="text-white font-semibold tracking-tight truncate">DG·ALLEN</div>
          <div className="text-[0.72rem] text-[var(--sidebar-faint)] truncate">Recruiting Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        <p className={`px-2.5 pb-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--sidebar-faint)] ${collapsed ? "lg:hidden" : ""}`}>
          Menu
        </p>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onCloseMobile}
            className={`nav-item ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
            data-active={active.href === item.href}
            title={collapsed ? item.label : undefined}
          >
            <Icon name={item.icon} size={19} className="shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-[var(--sidebar-line)] shrink-0">
        <div className={`flex items-center gap-2.5 px-1.5 py-1.5 ${collapsed ? "lg:justify-center" : ""}`}>
          <div
            className="w-8 h-8 rounded-full grid place-items-center text-[0.74rem] font-semibold text-white shrink-0"
            style={{ background: "var(--sidebar-2)", border: "1px solid var(--sidebar-line)" }}
          >
            {initials(name) || <Icon name="team" size={15} />}
          </div>
          <div className={`min-w-0 leading-tight ${collapsed ? "lg:hidden" : ""}`}>
            <div className="text-[0.82rem] text-white font-medium truncate">{name || "Signing in…"}</div>
            <div className="text-[0.7rem] text-[var(--sidebar-faint)] capitalize truncate">{role}</div>
          </div>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="nav-item w-full mt-1"
            title="Sign out"
          >
            <Icon name="logout" size={18} className="shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
