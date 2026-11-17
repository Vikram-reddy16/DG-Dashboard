"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Toast } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function Shell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useStore();

  // The dashboard is a live, client-rendered tool (and reads the current time for
  // "x ago" labels), so content renders after mount rather than being prerendered.
  useEffect(() => setMounted(true), []);

  return (
    <div>
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[35] bg-[#0b1120]/40 lg:hidden"
          style={{ animation: "overlay-in .18s ease" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="min-h-screen pl-0 lg:pl-[76px]">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-7 max-w-[1600px] mx-auto">
          {mounted ? children : <div className="h-[60vh]" aria-hidden />}
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
