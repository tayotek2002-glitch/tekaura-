"use client";

import { useState } from "react";
import { faq } from "@/data/faq";
import { PlusIcon } from "@/components/ui/icons";
import { cn } from "@/lib/format";

export function Faq() {
  const [open, setOpen] = useState<string | null>(`${faq[0].group}-0`);
  return (
    <section id="faq" className="scroll-mt-[var(--header-h)] bg-mist py-24 md:py-36">
      <div className="container-x grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow mb-4 text-slate">FAQ</p>
          <h2 className="display text-[clamp(2.5rem,5vw,4.5rem)]">Good questions.</h2>
          <p className="mt-5 max-w-[34ch] text-slate">Compatibility, delivery, returns and installation — answered simply.</p>
        </div>
        <div className="space-y-10">
          {faq.map((g) => (
            <div key={g.group}>
              <h3 className="eyebrow mb-2 text-slate">{g.group}</h3>
              <ul className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
                {g.items.map((item, i) => {
                  const id = `${g.group}-${i}`;
                  const isOpen = open === id;
                  return (
                    <li key={id}>
                      <h4>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`faq-${id}`}
                          onClick={() => setOpen(isOpen ? null : id)}
                          className="flex w-full items-center justify-between gap-6 py-5 text-left text-[17px] font-medium tracking-tight"
                        >
                          {item.q}
                          <PlusIcon className={cn("shrink-0 transition-transform duration-500", isOpen && "rotate-45")} />
                        </button>
                      </h4>
                      <div
                        id={`faq-${id}`}
                        role="region"
                        className={cn("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                      >
                        <div className="overflow-hidden">
                          <p className="max-w-[62ch] pb-6 text-[15px] leading-relaxed text-slate">{item.a}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
