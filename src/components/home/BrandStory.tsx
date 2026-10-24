import { Reveal } from "@/components/ui/Reveal";

const pillars = [
  { n: "01", title: "Made to fit.", body: "Cases and screen protectors are matched to specific models — never one-size-fits-most." },
  { n: "02", title: "Simple by design.", body: "Clear choices. No jargon. Just the accessories your phone actually needs." },
  { n: "03", title: "Built for the UK.", body: "UK three-pin plugs, travel adapters for everywhere else, and prices in pounds." },
];

export function BrandStory() {
  return (
    <section className="relative overflow-hidden bg-charcoal py-28 text-white md:py-44">
      <div aria-hidden className="absolute -right-[20vw] top-0 h-[60vw] w-[60vw] rounded-full bg-[radial-gradient(circle,rgba(198,200,206,0.08),transparent_60%)]" />
      <div className="container-x relative">
        <Reveal>
          <p className="eyebrow mb-8 text-white/40">The TEKAURA experience</p>
          <p className="display max-w-[18ch] text-[clamp(2.25rem,5.5vw,5.25rem)] !leading-[1.02]">
            Technology should feel <span className="text-white/40">effortless.</span> The things around it should too.
          </p>
        </Reveal>
        <div className="mt-20 grid gap-10 border-t border-white/10 pt-12 md:grid-cols-3 md:gap-12">
          {pillars.map((p, i) => (
            <Reveal key={p.n} delay={i * 120}>
              <p className="font-mono text-[12px] text-volt-bright">{p.n}</p>
              <h3 className="mt-4 text-[24px] font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-3 max-w-[32ch] text-[15px] leading-relaxed text-white/55">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
