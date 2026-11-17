"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";
import { login } from "./actions";

function LoginCard() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="w-full max-w-[400px]">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-[12px] grid place-items-center font-semibold text-white text-lg" style={{ background: "var(--accent)" }}>
          DG
        </div>
        <div className="leading-tight">
          <div className="font-semibold tracking-tight text-[1.05rem]">DG·ALLEN</div>
          <div className="text-[0.76rem] text-muted">Recruiting Admin</div>
        </div>
      </div>

      <div className="card p-7">
        <h1 className="text-[1.3rem] font-semibold tracking-tight">Sign in</h1>
        <p className="text-[0.86rem] text-muted mt-1">Staff access to the recruiting dashboard.</p>

        <form action={formAction} className="flex flex-col gap-4 mt-6">
          <input type="hidden" name="next" value={next} />

          <label className="block">
            <span className="label">Email</span>
            <input className="input" type="email" name="email" autoComplete="email" placeholder="you@dgallen.com" required autoFocus />
          </label>

          <label className="block">
            <span className="label">Password</span>
            <input className="input" type="password" name="password" autoComplete="current-password" placeholder="••••••••" required />
          </label>

          {state?.error && (
            <div className="flex items-center gap-2 text-[0.82rem] rounded-[10px] px-3 py-2.5"
              style={{ background: "var(--accent-soft)", color: "var(--accent-ink)", border: "1px solid #f1c9c9" }}>
              <Icon name="x" size={15} strokeWidth={2.4} />
              {state.error}
            </div>
          )}

          <button className="btn btn-primary w-full mt-1" type="submit" disabled={pending}>
            {pending ? "Signing in…" : (<><Icon name="arrowRight" size={17} />Sign in</>)}
          </button>
        </form>
      </div>

      <p className="text-[0.76rem] text-faint text-center mt-5">
        Access is managed by your admin. Trouble signing in? Ask them to check your account.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center px-4 py-10" style={{ background: "var(--bg)" }}>
      <Suspense fallback={<div className="h-40" aria-hidden />}>
        <LoginCard />
      </Suspense>
    </main>
  );
}
