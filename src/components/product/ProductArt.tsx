import { useId } from "react";
import type { PlaceholderArt } from "@/lib/catalog/types";

/**
 * Neutral, unbranded vector illustrations used until real product photography
 * is supplied. Driven entirely by `product.placeholder`, so e.g. a plug renders
 * the correct number of USB-A / USB-C ports.
 */
export function ProductArt({ art, className }: { art: PlaceholderArt; className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-hidden="true">
      <Defs id={uid} />
      <ellipse cx="200" cy="352" rx="120" ry="12" fill={`url(#${uid}-shadow)`} />
      <Art art={art} id={uid} />
    </svg>
  );
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <radialGradient id={`${id}-shadow`}>
        <stop offset="0%" stopColor="#000" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-white`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="55%" stopColor="#eeeff2" />
        <stop offset="100%" stopColor="#d4d6dc" />
      </linearGradient>
      <linearGradient id={`${id}-black`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3a3a40" />
        <stop offset="50%" stopColor="#1b1b1f" />
        <stop offset="100%" stopColor="#0b0b0d" />
      </linearGradient>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#8d9097" />
        <stop offset="45%" stopColor="#e7e9ed" />
        <stop offset="100%" stopColor="#7c7f86" />
      </linearGradient>
      <linearGradient id={`${id}-graphite`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5b5d63" />
        <stop offset="40%" stopColor="#2c2d31" />
        <stop offset="100%" stopColor="#141416" />
      </linearGradient>
      <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="40%" stopColor="#dfe8f5" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#bcc9dc" stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id={`${id}-privacy`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4a4f59" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#14161a" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#30343b" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#fff" stopOpacity="0" />
        <stop offset="50%" stopColor="#fff" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${id}-clearcase`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#e8eef7" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#c9d3e2" stopOpacity="0.7" />
      </linearGradient>
    </defs>
  );
}

function Art({ art, id }: { art: PlaceholderArt; id: string }) {
  switch (art.kind) {
    case "plug":
      return <Plug usbA={art.usbA} usbC={art.usbC} id={id} />;
    case "cable":
      return <Cable from={art.from} to={art.to} braided={art.braided} id={id} />;
    case "protector":
      return <Protector variant={art.variant} id={id} />;
    case "case":
      return <Case finish={art.finish} id={id} />;
    case "earbuds":
      return <Earbuds colour={art.colour} id={id} />;
    case "overear":
      return <OverEar colour={art.colour} id={id} />;
    case "adapter":
      return <Adapter variant={art.variant} id={id} />;
    case "bundle":
      return <Bundle items={art.items} id={id} />;
  }
}

/* ── UK three-pin plug (compact charger, three-quarter view) ─────────────
   Faces are rounded rects projected with affine matrices, so ports and
   corners foreshorten with the body. u = along the port face, v = depth,
   w = down. */
const PU = [0.94, -0.41];
const PV = [-0.46, -0.56];
const PLUG = { L: 200, D: 180, T: 78, taper: 46, x: 150, y: 226 };

function plane(a: number[], b: number[], ox: number, oy: number) {
  return `matrix(${a[0]} ${a[1]} ${b[0]} ${b[1]} ${ox} ${oy})`;
}
function at(u: number, v: number, w: number): [number, number] {
  return [PLUG.x + PU[0] * u + PV[0] * v, PLUG.y + PU[1] * u + PV[1] * v + w];
}

function Plug({ usbA, usbC, id }: { usbA: number; usbC: number; id: string }) {
  const { L, D, T } = PLUG;
  const ports: ("A" | "C")[] = [...Array(usbC).fill("C"), ...Array(usbA).fill("A")];
  const rows = ports.length > 3 ? [ports.slice(0, Math.ceil(ports.length / 2)), ports.slice(Math.ceil(ports.length / 2))] : [ports];
  const front = plane(PU, [0, 1], PLUG.x, PLUG.y);
  const top = plane(PU, PV, PLUG.x, PLUG.y);
  // the left side follows the tapered edge from the front-left to the back-left corner
  const sideLen = Math.hypot(PLUG.taper, D);
  const side = [(PU[0] * PLUG.taper + PV[0] * D) / sideLen, (PU[1] * PLUG.taper + PV[1] * D) / sideLen];
  const left = plane(side, [0, 1], PLUG.x, PLUG.y);
  const r = 34; // corner radius of the top face
  const k = PLUG.taper * (r / D);
  const topOutline = `${r},${r} ${L - r},${r} ${L - PLUG.taper - r + k},${D - r} ${PLUG.taper + r - k},${D - r}`;

  const pin = (u: number, v: number, len: number, wide: number) => {
    const [bx, by] = at(u, v, T - 6);
    return (
      <g>
        <g transform={plane(PV, [0, 1], bx, by)}>
          <rect x="0" y="0" width="7" height={len} fill="#8d9097" />
        </g>
        <g transform={plane(PU, [0, 1], bx, by)}>
          <rect x="0" y="0" width={wide} height={len} rx="1.5" fill={`url(#${id}-metal)`} />
        </g>
      </g>
    );
  };

  return (
    <g transform="translate(200 200) scale(1.16) translate(-200 -196)">
      {/* pins on the underside: earth (back), live and neutral (front) */}
      {pin(L * 0.46, D * 0.78, 52, 22)}
      {pin(L * 0.16, D * 0.3, 60, 26)}
      {pin(L * 0.7, D * 0.3, 60, 26)}

      {/* body */}
      <g transform={left}>
        <rect x="-4" y="0" width={sideLen + 4} height={T} rx="26" fill="#cfd2d8" />
      </g>
      <g transform={front}>
        <defs>
          <linearGradient id={`${id}-plugfront`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f7f8fa" />
            <stop offset="100%" stopColor="#d7dae0" />
          </linearGradient>
        </defs>
        <rect x="0" y="-4" width={L} height={T + 4} rx="24" fill={`url(#${id}-plugfront)`} />
        {rows.map((row, r) => {
          const wy = rows.length === 1 ? T * 0.52 : T * (r === 0 ? 0.34 : 0.72);
          const spacing = Math.min(70, (L * 0.78) / row.length);
          const x0 = L / 2 - ((row.length - 1) * spacing) / 2;
          return row.map((p, i) => {
            const cx = x0 + i * spacing;
            return p === "A" ? (
              <g key={`${r}-${i}`}>
                <rect x={cx - 27} y={wy - 11} width="54" height="22" rx="2.5" fill="#c4c7cd" />
                <rect x={cx - 24} y={wy - 8} width="48" height="16" rx="1.5" fill="#1b1c20" />
                <rect x={cx - 19} y={wy - 6} width="38" height="6" rx="1" fill="#f1f2f4" />
              </g>
            ) : (
              <g key={`${r}-${i}`}>
                <rect x={cx - 17} y={wy - 7.5} width="34" height="15" rx="7.5" fill="#c4c7cd" />
                <rect x={cx - 14.5} y={wy - 5} width="29" height="10" rx="5" fill="#1b1c20" />
                <rect x={cx - 9} y={wy - 1.5} width="18" height="3" rx="1.5" fill="#6b6e75" />
              </g>
            );
          });
        })}
      </g>
      <g transform={top}>
        <defs>
          <linearGradient id={`${id}-plugtop`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e4e6ea" />
          </linearGradient>
        </defs>
        {/* rounded tapered face: an inset outline stroked with round joins */}
        <polygon points={topOutline} fill={`url(#${id}-plugtop)`} stroke={`url(#${id}-plugtop)`} strokeWidth={r * 2} strokeLinejoin="round" />
        <radialGradient id={`${id}-plugsheen`} cx="0.35" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <polygon points={topOutline} fill={`url(#${id}-plugsheen)`} />
      </g>
    </g>
  );
}

/* ── Cable ──────────────────────────────────────────────────────────────── */
function Connector({ type, x, y, rot, id }: { type: string; x: number; y: number; rot: number; id: string }) {
  const tip =
    type === "USB-A" ? (
      <rect x="-20" y="-58" width="40" height="30" rx="2" fill={`url(#${id}-metal)`} />
    ) : type === "USB-C" ? (
      <rect x="-13" y="-46" width="26" height="18" rx="9" fill={`url(#${id}-metal)`} />
    ) : (
      <rect x="-9" y="-50" width="18" height="22" rx="4" fill="#d9dade" stroke="#b4b6bc" />
    );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {tip}
      <rect x="-22" y="-30" width="44" height="58" rx="12" fill={`url(#${id}-white)`} stroke="#d3d5da" />
      <rect x="-9" y="26" width="18" height="18" rx="5" fill="#e6e7ea" />
    </g>
  );
}

function Cable({ from, to, braided, id }: { from: string; to: string; braided?: boolean; id: string }) {
  const path = "M120 300 C 60 220, 150 150, 210 190 S 330 250, 290 120";
  return (
    <g>
      <path d={path} fill="none" stroke="#c9cbd1" strokeWidth="15" strokeLinecap="round" transform="translate(4 5)" />
      <path d={path} fill="none" stroke="#f4f4f6" strokeWidth="14" strokeLinecap="round" />
      {braided && <path d={path} fill="none" stroke="#c2c5cc" strokeWidth="14" strokeDasharray="3 4" strokeLinecap="butt" />}
      <path d={path} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" transform="translate(-2 -3)" />
      <Connector type={from} x={120} y={312} rot={180} id={id} />
      <Connector type={to} x={290} y={108} rot={10} id={id} />
    </g>
  );
}

/* ── Phone silhouette helper ───────────────────────────────────────────── */
function PhoneFront({ x, y, w, h, id }: { x: number; y: number; w: number; h: number; id: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={w * 0.17} fill={`url(#${id}-graphite)`} />
      <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} rx={w * 0.15} fill="#0b0c10" />
      <rect x={x + w / 2 - w * 0.14} y={y + 14} width={w * 0.28} height="11" rx="5.5" fill="#000" />
    </g>
  );
}

/* ── Screen protector ──────────────────────────────────────────────────── */
function Protector({ variant, id }: { variant: string; id: string }) {
  const privacy = variant.includes("privacy");
  const magic = variant.startsWith("magic");
  const tempered = variant === "tempered";
  return (
    <g>
      <PhoneFront x={150} y={86} w={140} h={270} id={id} />
      <g transform="translate(-36 -26) rotate(-8 200 200)">
        {magic && (
          <rect x="118" y="58" width="164" height="300" rx="30" fill="none" stroke="#9aa0aa" strokeWidth="6" strokeDasharray="1 0" opacity="0.5" />
        )}
        {tempered && <rect x="134" y="76" width="140" height="270" rx="24" fill="#a7b4c6" opacity="0.6" />}
        <rect x="130" y="72" width="140" height="270" rx="24" fill={`url(#${id}-${privacy ? "privacy" : "glass"})`} stroke="#ffffff" strokeOpacity="0.9" strokeWidth="1.5" />
        <rect x="130" y="72" width="140" height="270" rx="24" fill={`url(#${id}-sheen)`} opacity="0.45" transform="skewX(-18) translate(60 0)" />
        <rect x="183" y="86" width="34" height="9" rx="4.5" fill="none" stroke="#fff" strokeOpacity="0.8" />
      </g>
    </g>
  );
}

/* ── Phone case (back view) ────────────────────────────────────────────── */
function Case({ finish, id }: { finish: "clear" | "black"; id: string }) {
  const clear = finish === "clear";
  return (
    <g>
      {clear && <rect x="138" y="62" width="128" height="268" rx="26" fill={`url(#${id}-graphite)`} transform="translate(8 6)" />}
      <rect
        x="130"
        y="56"
        width="144"
        height="284"
        rx="30"
        fill={clear ? `url(#${id}-clearcase)` : `url(#${id}-black)`}
        stroke={clear ? "#fff" : "#2b2b30"}
        strokeWidth="2"
      />
      {/* camera cut-out */}
      <rect x="146" y="72" width="66" height="66" rx="18" fill={clear ? "#121316" : "#060607"} opacity={clear ? 0.85 : 1} />
      <circle cx="166" cy="92" r="11" fill="#2a2c33" stroke="#4a4d55" strokeWidth="2" />
      <circle cx="192" cy="118" r="11" fill="#2a2c33" stroke="#4a4d55" strokeWidth="2" />
      <circle cx="192" cy="92" r="4" fill="#d9d9d9" opacity="0.5" />
      {/* side buttons */}
      <rect x="272" y="130" width="5" height="44" rx="2.5" fill={clear ? "#d7dbe3" : "#1e1e22"} />
      {clear ? (
        <rect x="130" y="56" width="144" height="284" rx="30" fill={`url(#${id}-sheen)`} opacity="0.35" transform="skewX(-14) translate(46 0)" />
      ) : (
        <rect x="134" y="60" width="60" height="276" rx="26" fill="#fff" opacity="0.04" />
      )}
    </g>
  );
}

/* ── Earbuds ───────────────────────────────────────────────────────────── */
function Earbuds({ colour, id }: { colour: "white" | "black"; id: string }) {
  const fill = colour === "white" ? `url(#${id}-white)` : `url(#${id}-black)`;
  const edge = colour === "white" ? "#d0d2d8" : "#000";
  return (
    <g>
      {/* charging case */}
      <rect x="112" y="210" width="176" height="128" rx="48" fill={fill} stroke={edge} />
      <path d="M112 252 H288" stroke={colour === "white" ? "#d7d9de" : "#2e2e33"} strokeWidth="2" />
      <circle cx="200" cy="290" r="3" fill="#2f7bff" opacity="0.8" />
      {/* buds */}
      <g transform="translate(150 96) rotate(-14)">
        <ellipse cx="0" cy="0" rx="30" ry="34" fill={fill} stroke={edge} />
        <rect x="-10" y="20" width="20" height="74" rx="10" fill={fill} stroke={edge} />
        <ellipse cx="-10" cy="-6" rx="12" ry="14" fill={colour === "white" ? "#cdd0d6" : "#08080a"} />
      </g>
      <g transform="translate(252 92) rotate(14)">
        <ellipse cx="0" cy="0" rx="30" ry="34" fill={fill} stroke={edge} />
        <rect x="-10" y="20" width="20" height="74" rx="10" fill={fill} stroke={edge} />
        <ellipse cx="10" cy="-6" rx="12" ry="14" fill={colour === "white" ? "#cdd0d6" : "#08080a"} />
      </g>
    </g>
  );
}

/* ── Over-ear headphones ───────────────────────────────────────────────── */
function OverEar({ colour, id }: { colour: "white" | "black"; id: string }) {
  const fill = colour === "white" ? `url(#${id}-white)` : `url(#${id}-black)`;
  const pad = colour === "white" ? "#e3e4e8" : "#141417";
  const edge = colour === "white" ? "#cfd1d6" : "#000";
  return (
    <g>
      <path d="M110 230 C 110 100, 290 100, 290 230" fill="none" stroke={colour === "white" ? "#dcdee3" : "#1b1b1f"} strokeWidth="22" strokeLinecap="round" />
      <path d="M118 228 C 118 112, 282 112, 282 228" fill="none" stroke={pad} strokeWidth="8" strokeLinecap="round" opacity="0.6" />
      <rect x="102" y="200" width="18" height="50" rx="9" fill={`url(#${id}-metal)`} />
      <rect x="280" y="200" width="18" height="50" rx="9" fill={`url(#${id}-metal)`} />
      <rect x="66" y="226" width="80" height="112" rx="40" fill={fill} stroke={edge} />
      <rect x="254" y="226" width="80" height="112" rx="40" fill={fill} stroke={edge} />
      <rect x="128" y="236" width="22" height="92" rx="11" fill={pad} />
      <rect x="250" y="236" width="22" height="92" rx="11" fill={pad} />
    </g>
  );
}

/* ── Travel adapter ────────────────────────────────────────────────────── */
function Adapter({ variant, id }: { variant: string; id: string }) {
  return (
    <g>
      <rect x="112" y="128" width="176" height="200" rx="28" fill="#c9cbd1" transform="translate(10 8)" />
      <rect x="112" y="128" width="176" height="200" rx="28" fill={`url(#${id}-white)`} />
      {/* pins: UK + EU + US styles hinted */}
      <rect x="150" y="84" width="14" height="48" rx="3" fill={`url(#${id}-metal)`} />
      <rect x="236" y="84" width="14" height="48" rx="3" fill={`url(#${id}-metal)`} />
      <rect x="190" y="70" width="20" height="60" rx="3" fill={`url(#${id}-metal)`} />
      <circle cx="132" cy="210" r="0" />
      {variant === "universal" && (
        <>
          <rect x="150" y="170" width="100" height="70" rx="14" fill="#1a1b1f" />
          <circle cx="178" cy="205" r="7" fill="#3a3b41" />
          <circle cx="222" cy="205" r="7" fill="#3a3b41" />
          <rect x="196" y="180" width="8" height="18" rx="2" fill="#3a3b41" />
          <rect x="140" y="262" width="120" height="14" rx="7" fill="#d4d6db" />
          <rect x="140" y="262" width="44" height="14" rx="7" fill="#2f7bff" opacity="0.85" />
        </>
      )}
      {variant !== "universal" && (
        <g>
          {(variant === "usb" ? ["A", "A"] : variant === "usb-c" ? ["C", "C"] : ["C", "C", "A", "A"]).map((p, i, arr) => {
            const cy = 228 - ((arr.length - 1) * 34) / 2 + i * 34;
            return p === "C" ? (
              <rect key={i} x="176" y={cy - 8} width="48" height="16" rx="8" fill="#1a1b1f" />
            ) : (
              <rect key={i} x="166" y={cy - 11} width="68" height="22" rx="3" fill="#1a1b1f" />
            );
          })}
        </g>
      )}
    </g>
  );
}

/* ── Bundle (composition of mini illustrations) ────────────────────────── */
function Bundle({ items, id }: { items: PlaceholderArt["kind"][]; id: string }) {
  const n = items.length;
  const size = n <= 2 ? 230 : n === 3 ? 200 : 170;
  const span = 400 - size + (n > 2 ? 40 : 0);
  return (
    <g>
      {items.map((k, i) => {
        const x = n === 1 ? (400 - size) / 2 : -20 + (i * span) / Math.max(1, n - 1);
        const y = 70 + (i % 2) * 40;
        return (
          <svg key={i} x={x} y={y} width={size} height={size} viewBox="0 0 400 400">
            <Art art={miniArt(k)} id={id} />
          </svg>
        );
      })}
    </g>
  );
}

function miniArt(kind: PlaceholderArt["kind"]): PlaceholderArt {
  switch (kind) {
    case "plug":
      return { kind: "plug", usbA: 0, usbC: 1 };
    case "cable":
      return { kind: "cable", from: "USB-C", to: "USB-C" };
    case "protector":
      return { kind: "protector", variant: "clear" };
    case "case":
      return { kind: "case", finish: "clear" };
    case "earbuds":
      return { kind: "earbuds", colour: "white" };
    case "overear":
      return { kind: "overear", colour: "black" };
    case "adapter":
      return { kind: "adapter", variant: "universal" };
    default:
      return { kind: "plug", usbA: 1, usbC: 1 };
  }
}
