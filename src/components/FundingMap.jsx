import { useMemo, useRef, useState } from "react";
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

/* Sequential ramp built from the MLF plum (#563061). Categorical keys sit
   outside the ramp so the two scales are never read as one. */
const RAMP = ["#ddd0da", "#b99cb3", "#8a5c80", "#5c2c54"];
const IN_STUDY = "#eae2e8";
const DELIVERY = "#cfe1e6";
const NO_DATA = "#e6e3dd";
const HOVER = "#2f1430";
const PAPER = "#f6f5f2";

const shadeFor = (market) => {
  if (!market) return NO_DATA;
  if (market.role === "delivery") return DELIVERY;
  if (market.outflow === null || market.outflow === undefined) return IN_STUDY;
  if (market.outflow >= 10) return RAMP[3];
  if (market.outflow >= 1) return RAMP[2];
  if (market.outflow >= 0.3) return RAMP[1];
  return RAMP[0];
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

const RAMP_TICKS = ["<$0.3bn", "$0.3–1bn", "$1–10bn", "$10bn+"];

function FundingMap() {
  const frameRef = useRef(null);
  const tipRef = useRef(null);
  const currentId = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);

  /* The 177 country paths never change, so they are built once and stay out
     of the hover render path — that is what keeps the map smooth. */
  const staticPaths = useMemo(
    () =>
      shapes.map((shape) => (
        <path
          key={shape.key}
          d={shape.d}
          fill={shape.fill}
          stroke={PAPER}
          strokeWidth={0.4}
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
      tip.style.marginLeft = flip ? "-104px" : "12px";
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
      className="relative border-t border-rule bg-paper-deep py-24"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 md:px-10 lg:grid-cols-[14rem_1fr] lg:gap-14 lg:px-16">
        {/* sticky label rail — this section deliberately breaks the
            single-column skeleton the rest of the page shares */}
        <div className="lg:sticky lg:top-10 lg:self-start">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
            Funding geography
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">
            Twenty markets, shaded by how much crosses their border each year.
          </p>
        </div>

        <div>
      <div className="max-w-2xl">
        <h3 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
          $59.8bn leaves the US in cross-border giving each year
        </h3>
        <p className="mt-4 text-base leading-relaxed text-ink/70">
          Almost none of it reaches Malawi. This map shades the twenty donor
          markets by philanthropic outflow — hover for the figure, select a
          country for its prospects and channel mix.
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-rule bg-white">
        <div ref={frameRef} className="relative p-3 md:p-5">
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
                fill={HOVER}
                stroke={PAPER}
                strokeWidth={0.6}
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
            <span className="inline-block translate-y-2 rounded border border-rule bg-white px-2 py-1 text-xs font-bold tabular-nums text-ink shadow-card">
              {hoveredShape ? outflowLabel(hoveredShape.market) : ""}
            </span>
          </div>
        </div>

        {/* continuous ramp and categorical keys are separate scales */}
        <div className="flex flex-wrap items-end gap-x-10 gap-y-5 border-t border-rule px-4 py-4 md:px-6">
          <div>
            <p className="mb-2 text-[11px] text-ink/60">
              Cross-border philanthropic outflow, USD, 2023
            </p>
            <div className="flex">
              {RAMP.map((c) => (
                <span key={c} className="h-2 w-14" style={{ background: c }} />
              ))}
            </div>
            <div className="mt-1.5 flex">
              {RAMP_TICKS.map((t) => (
                <span
                  key={t}
                  className="w-14 text-[10px] tabular-nums text-ink/50"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-slate-200 text-[11px] text-ink/60 md:border-l md:pl-10">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 border border-slate-300"
                style={{ background: IN_STUDY }}
              />
              Outflow not reported
            </span>
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 border border-slate-300"
                style={{ background: DELIVERY }}
              />
              MLF delivery country
            </span>
          </div>

          <a
            href={`${BASE}mlf-partners.html`}
            className="ml-auto text-sm font-bold text-brand hover:underline"
          >
            All twenty markets &rarr;
          </a>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-ink/50">
        Outflow and share of GNI: Global Philanthropy Tracker, 2023 reference
        year. Giving rates: CAF World Giving Report. Figures shown as reported;
        several markets do not publish a cross-border figure.
      </p>
        </div>
      </div>
    </section>
  );
}

export default FundingMap;
