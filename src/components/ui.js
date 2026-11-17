"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

/* ---------- portal that is SSR-safe ---------- */
function Portal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

function useEscape(active, onEscape) {
  useEffect(() => {
    if (!active) return;
    const h = (e) => e.key === "Escape" && onEscape();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [active, onEscape]);
}

/* ---------- Right-side slide-over drawer ---------- */
export function Drawer({ open, onClose, title, subtitle, children, footer, width = 520 }) {
  useEscape(open, onClose);
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div
          onClick={onClose}
          className="absolute inset-0 bg-[#0b1120]/40 backdrop-blur-[1px]"
          style={{ animation: "overlay-in .18s ease" }}
        />
        <div
          role="dialog"
          aria-modal="true"
          className="relative h-full bg-card border-l border-border shadow-[var(--shadow-lg)] flex flex-col w-full"
          style={{ maxWidth: width, animation: "drawer-in .22s cubic-bezier(.2,.8,.2,1)" }}
        >
          <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border">
            <div className="min-w-0">
              <h2 className="text-[1.05rem] font-semibold truncate">{title}</h2>
              {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
            </div>
            <button className="btn btn-ghost btn-icon shrink-0" onClick={onClose} aria-label="Close">
              <Icon name="x" />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && <footer className="px-6 py-4 border-t border-border bg-card-2">{footer}</footer>}
        </div>
      </div>
    </Portal>
  );
}

/* ---------- Confirm dialog ---------- */
export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", tone = "danger", onConfirm, onClose }) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div onClick={onClose} className="absolute inset-0 bg-[#0b1120]/45" style={{ animation: "overlay-in .16s ease" }} />
        <div
          role="alertdialog"
          className="relative card w-full max-w-sm p-6"
          style={{ animation: "pop-in .18s cubic-bezier(.2,.8,.2,1)" }}
        >
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-muted mt-2 leading-relaxed">{message}</p>
          <div className="flex justify-end gap-2 mt-6">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button
              className={`btn btn-sm ${tone === "danger" ? "btn-primary" : "btn-primary"}`}
              onClick={() => { onConfirm(); onClose(); }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ---------- Toggle switch ---------- */
export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center shrink-0 rounded-full transition-colors"
      style={{ width: 40, height: 22, background: checked ? "var(--green)" : "#cbd2db" }}
    >
      <span
        className="absolute rounded-full bg-white shadow-sm transition-transform"
        style={{ width: 16, height: 16, top: 3, left: 3, transform: checked ? "translateX(18px)" : "none" }}
      />
    </button>
  );
}

/* ---------- Field wrapper ---------- */
export function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="label">{label}</span>}
      {children}
      {hint && <span className="hint mt-1 block">{hint}</span>}
    </label>
  );
}

/* ---------- Multi-select chip group ---------- */
export function ChipGroup({ options, value = [], onChange }) {
  const toggle = (opt) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const on = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className="px-2.5 py-1 rounded-lg text-[0.8rem] font-medium border transition-colors"
            style={
              on
                ? { background: "var(--accent-soft)", color: "var(--accent-ink)", borderColor: "#f1c9c9" }
                : { background: "var(--card)", color: "var(--muted)", borderColor: "var(--border-strong)" }
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Tag / skills input ---------- */
export function TagInput({ value = [], onChange, placeholder = "Type and press Enter" }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  };
  return (
    <div className="input flex flex-wrap gap-1.5 items-center min-h-[42px] h-auto py-2">
      {value.map((t) => (
        <span key={t} className="badge badge-slate">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
            <Icon name="x" size={12} strokeWidth={2.4} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); add(); }
          if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder={value.length ? "" : placeholder}
        className="flex-1 min-w-[80px] bg-transparent outline-none text-sm"
      />
    </div>
  );
}

/* ---------- Row action menu ----------
   The dropdown is rendered in a portal with fixed positioning so it is never
   clipped by a scrolling table body. It closes on outside click, scroll or resize. */
export function Menu({ items, align = "right", width = 180 }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const place = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = align === "right" ? r.right - width : r.left;
    setPos({ top: r.bottom + 6, left: Math.max(8, Math.min(left, window.innerWidth - width - 8)) });
  };

  useEffect(() => {
    if (!open) return;
    place();
    const close = () => setOpen(false);
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button ref={btnRef} className="btn btn-ghost btn-icon" onClick={() => setOpen((o) => !o)} aria-label="Actions">
        <Icon name="more" />
      </button>
      {open && pos && (
        <Portal>
          <div
            ref={menuRef}
            className="fixed z-[80] card p-1.5"
            style={{ top: pos.top, left: pos.left, width, animation: "pop-in .14s ease", boxShadow: "var(--shadow-md)" }}
          >
            {items.map((it, i) =>
              it.divider ? (
                <div key={i} className="h-px bg-border my-1.5" />
              ) : (
                <button
                  key={i}
                  onClick={() => { setOpen(false); it.onClick(); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm text-left hover:bg-card-2 transition-colors"
                  style={it.danger ? { color: "var(--accent-ink)" } : { color: "var(--ink)" }}
                >
                  {it.icon && <Icon name={it.icon} size={16} />}
                  {it.label}
                </button>
              ),
            )}
          </div>
        </Portal>
      )}
    </>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon = "search", title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-12 h-12 rounded-xl grid place-items-center bg-card-2 border border-border text-faint mb-4">
        <Icon name={icon} size={22} />
      </div>
      <h3 className="text-[0.95rem] font-semibold">{title}</h3>
      {message && <p className="text-sm text-muted mt-1 max-w-xs">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- Status pill ---------- */
export function Pill({ meta }) {
  return (
    <span className={`badge ${meta.badge}`}>
      <span className="dot" />
      {meta.label}
    </span>
  );
}

/* ---------- Toast ---------- */
export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <Portal>
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70]" style={{ animation: "pop-in .2s ease" }}>
        <div className="card px-4 py-2.5 flex items-center gap-2.5 text-sm" style={{ boxShadow: "var(--shadow-md)" }}>
          <span
            className="grid place-items-center w-5 h-5 rounded-full text-white"
            style={{ background: toast.tone === "danger" ? "var(--accent)" : "var(--green)" }}
          >
            <Icon name={toast.tone === "danger" ? "x" : "check"} size={13} strokeWidth={2.6} />
          </span>
          <span className="font-medium">{toast.message}</span>
        </div>
      </div>
    </Portal>
  );
}

/* ---------- metric cards ---------- */
export function StatCard({ icon, label, value, sub, accent, onClick, active }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-pressed={onClick ? Boolean(active) : undefined}
      className={`card p-4 sm:p-5 text-left w-full ${onClick ? "cursor-pointer transition-shadow hover:shadow-[var(--shadow-md)]" : ""}`}
      style={active ? { borderColor: "var(--accent)", boxShadow: "0 0 0 1px var(--accent), var(--shadow-sm)" } : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="text-[0.82rem] font-medium text-muted">{label}</span>
        <span
          className="w-8 h-8 rounded-lg grid place-items-center"
          style={{ background: accent ? "var(--accent-soft)" : "var(--card-2)", color: accent ? "var(--accent-ink)" : "var(--muted)", border: "1px solid var(--border)" }}
        >
          <Icon name={icon} size={17} />
        </span>
      </div>
      <div className="mt-3 text-[1.7rem] font-semibold tracking-tight tabular-nums leading-none">{value}</div>
      {sub && <div className="mt-2 text-[0.78rem] text-faint">{sub}</div>}
    </Tag>
  );
}

export function StatRow({ children, cols = 4 }) {
  return <div className={`grid grid-cols-2 ${cols === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-3 sm:gap-4`}>{children}</div>;
}
