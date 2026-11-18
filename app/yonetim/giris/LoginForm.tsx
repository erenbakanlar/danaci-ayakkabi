"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/app/yonetim/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});

  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Şifre</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-1.5 h-12 w-full border border-border bg-background px-3 outline-none focus:border-foreground"
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full cursor-pointer bg-accent text-sm font-medium uppercase tracking-label text-white hover:bg-accent-soft disabled:opacity-60"
      >
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
