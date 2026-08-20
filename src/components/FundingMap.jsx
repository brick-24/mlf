import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import {
  marketsByCountry,
  normaliseId,
  outflowLabel,
} from "../data/fundingGeography";

const BASE = import.meta.env.BASE_URL;
const WIDTH = 960;
const HEIGHT = 500;

const NO_DATA = "rgba(15, 21, 34, 0.06)";
const DELIVERY = "#c3d2e3";
const DELIVERY_HOT = "#2f4a6b";
const IN_STUDY = "#d6ecea";
const HOT = "#00a8a3";

/** outflow (USD billions) → choropleth step */
const shadeFor = (market) => {
  if (!market) return NO_DATA;
  if (market.role === "delivery") return DELIVERY;
  if (market.outflow === null || market.outflow === undefined) return IN_STUDY;
  if (market.outflow >= 10) return "#0b6f6b";
  if (market.outflow >= 1) return "#199a92";
  if (market.outflow >= 0.3) return "#5cc0b7";
  return "#9ad9d2";
};

/* ---- computed once, at module load ---- */
const countries = feature(worldAtlas, worldAtlas.objects.countries).features;

const projection = geoEqualEarth().fitExtent(
  [
    [12, 14],
    [WIDTH - 12, HEIGHT - 14],
  ],
  { type: "Sphere" },
);
const toPath = geoPath(projection);

const shapes = countries.map((f, index) => {
  const id = normaliseId(f.id);
  const market = marketsByCountry[id];
  return {
    // a handful of world-atlas features carry no id, so fall back to the index
    key: Number.isNaN(id) ? `shape-${index}` : String(id),
    id,
    d: toPath(f),
    market,
    fill: shadeFor(market),
  };
});

const shapeById = new Map(shapes.filter((s) => s.market).map((s) => [s.id, s]));

const LEGEND = [
  { fill: "#0b6f6b", label: "$10B+" },
  { fill: "#199a92", label: "$1–10B" },
  { fill: "#5cc0b7", label: "$0.3–1B" },
  { fill: "#9ad9d2", label: "under $0.3B" },
  { fill: IN_STUDY, label: "Unspecified" },
  { fill: DELIVERY, label: "Delivery country" },
];

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
};

function FundingMap() {
  const frameRef = useRef(null);
  const tipRef = useRef(null);
  const currentId = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);

  /* The 177 country paths never change, so they are built once and stay out of
     the hover render path — that is what keeps the map smooth. */
  const staticPaths = useMemo(
    () =>
      shapes.map((shape) => (
        <path
          key={shape.key}
          d={shape.d}
          fill={shape.fill}
          stroke="#ffffff"
          strokeWidth={0.55}
          data-mid={shape.market ? shape.id : undefined}
          style={{ cursor: shape.market ? "pointer" : "default" }}
        />
      )),
    [],
  );

  const hoveredShape = hoveredId === null ? null : shapeById.get(hoveredId);

  /* One delegated handler for the whole map. It moves the tooltip by writing
     to the DOM directly, and only calls setState when the country changes. */
  const handleMove = (event) => {
    const frame = frameRef.current;
    const tip = tipRef.current;
    if (!frame) return;

    const raw = event.target.getAttribute?.("data-mid");
    const id = raw ? Number(raw) : null;

    if (tip && id !== null) {
      const rect = frame.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const flip = x > rect.width - 120;
      tip.style.transform = `translate(${x}px, ${y}px)`;
      tip.style.marginLeft = flip ? "-104px" : "14px";
    }

    if (id !== currentId.current) {
      currentId.current = id;
      setHoveredId(id);
    }
  };

  const handleLeave = () => {
    currentId.current = null;
    setHoveredId(null);
  };

  const handleClick = (event) => {
    const raw = event.target.getAttribute?.("data-mid");
    if (raw) window.location.href = `${BASE}mlf-partners.html?c=${raw}`;
  };

  return (
    <section
      id="funding-geography"
      className="relative mx-auto w-full max-w-7xl px-6 py-20 md:px-10 lg:px-16 lg:py-24"
    >
      <motion.p
        {...fadeUp}
        className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500"
      >
        Funding Geography
      </motion.p>
      <motion.h3
        {...fadeUp}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
        className="font-display text-3xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-4xl lg:text-5xl"
      >
        Where the money can come from.
      </motion.h3>
      <motion.p
        {...fadeUp}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
        className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600"
      >
        Shaded by cross-border philanthropic outflow. Hover for the figure, click
        for the market dashboard.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.85, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 rounded-3xl border border-white/50 bg-white/60 p-4 shadow-glass backdrop-blur-xl md:p-6"
      >
        <div ref={frameRef} className="relative">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="World map shaded by cross-border philanthropic outflow"
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            onClick={handleClick}
          >
            <g>{staticPaths}</g>
            {hoveredShape ? (
              <path
                d={hoveredShape.d}
                fill={
                  hoveredShape.market.role === "delivery" ? DELIVERY_HOT : HOT
                }
                stroke="#ffffff"
                strokeWidth={0.8}
                pointerEvents="none"
              />
            ) : null}
          </svg>

          {/* always mounted; only the text inside changes on hover */}
          <div
            ref={tipRef}
            className="pointer-events-none absolute left-0 top-0 z-10 will-change-transform"
            style={{ opacity: hoveredShape ? 1 : 0 }}
          >
            <span className="inline-block translate-y-3 rounded-lg bg-slate-900 px-2.5 py-1.5 font-mono text-xs font-semibold tabular-nums text-white shadow-lg">
              {hoveredShape ? outflowLabel(hoveredShape.market) : ""}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200/70 pt-4 text-[11px] text-slate-600">
          {LEGEND.map((step) => (
            <span key={step.label} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: step.fill }}
              />
              {step.label}
            </span>
          ))}
          <a
            href={`${BASE}mlf-partners.html`}
            className="ml-auto text-xs font-semibold text-[color:var(--accent-strong)] hover:underline"
          >
            All markets &rarr;
          </a>
        </div>
      </motion.div>
    </section>
  );
}

export default FundingMap;
