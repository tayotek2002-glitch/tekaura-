"use client";

import { useState } from "react";
import { subscribe } from "@/lib/commerce/newsletter";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white md:py-36">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(50%_70%_at_50%_120%,rgba(47,123,255,0.35),transparent_70%)]" />
      <div className="container-x relative text-center">
        <p className="eyebrow mb-5 text-white/45">Stay in the loop</p>
        <h2 className="display mx-auto max-w-[16ch] text-[clamp(2.5rem,6vw,5.5rem)]">Be first to know.</h2>
        <p className="mx-auto mt-5 max-w-[42ch] text-white/60">New arrivals and launch news from TEKAURA.</p>
        <form
          noValidate
          className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row"
          onSubmit={async (e) => {
            e.preventDefault();
            setStatus(null);
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address.");
            setError(null);
            setStatus(await subscribe(email));
          }}
        >
          <label htmlFor="signup-email" className="sr-only">Email address</label>
          <input
            id="signup-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error}
            aria-describedby="signup-msg"
            placeholder="you@example.co.uk"
            className="h-14 flex-1 rounded-full border border-white/15 bg-white/[0.06] px-6 text-[16px] outline-none backdrop-blur transition placeholder:text-white/35 focus:border-white/50"
          />
          <button className="btn btn-light h-14">Sign up</button>
        </form>
        <p id="signup-msg" role="status" className="mt-4 min-h-6 text-[13px] text-white/55">
          {error ?? status?.message ?? ""}
        </p>
      </div>
    </section>
  );
}
