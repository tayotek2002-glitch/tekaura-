import { DEMO_MODE } from "@/data/demo";

export function DemoBanner() {
  if (!DEMO_MODE) return null;
  return (
    <div
      role="note"
      className="pointer-events-none fixed bottom-3 left-1/2 z-[90] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 rounded-full bg-amber-400 px-4 py-2 text-center text-[11px] font-medium leading-tight text-black shadow-lg"
    >
      DEMO MODE — sample prices, stock &amp; compatibility for testing only. Nothing here is real or for sale.
    </div>
  );
}
