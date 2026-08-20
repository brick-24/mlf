import { useMemo, useRef, useState } from "react";
import { geoCentroid, geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import {
  marketsByCountry,
  normaliseId,
  outflowLabel,
} from "../data/fundingGeography";

const BASE = import.meta.env.BASE_URL;
const WIDTH = 1000;
const HEIGHT = 440;

/* Ramp darkened at the light end so all four steps survive a projector. */
const RAMP = ["#cbb0c4", "#a87c9e", "#7c4c72", "#5c2c54"];
const IN_STUDY = "#e3d8e0";
const DELIVERY = "#c2d9df";
const NO_DATA = "#e0ddd6";
const HOVER = "#2f1430";
const PAPER = "#edebe5";

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
const ANTARCTICA = 10;
const countries = feature(
  worldAtlas,
  worldAtlas.objects.countries,
).features.filter((f) => normaliseId(f.id) !== ANTARCTICA);

/* fit to the remaining land rather than the whole sphere, so dropping
   Antarctica actually reclaims the vertical space */
const projection = geoEqualEarth().fitExtent(
  [
    [10, 10],
    [WIDTH - 10, HEIGHT - 10],
  ],
  { type: "FeatureCollection", features: countries },
);
const toPath = geoPath(projection);

const shapes = countries.map((f, index) => {
  const id = normaliseId(f.id);
  const market = marketsByCountry[id];
  return {
    key: Number.isNaN(id) ? `shape-${index}` : String(id),
    id,
    d: toPath(f),
    market,
    fill: shadeFor(market),
  };
});

const shapeById = new Map(shapes.filter((s) => s.market).map((s) => [s.id, s]));

/* anchor for the annotation that ties the headline figure to the map */
const usFeature = countries.find((f) => normaliseId(f.id) === 840);
const usPoint = usFeature ? projection(geoCentroid(usFeature)) : null;

const RAMP_TICKS = ["<$0.3bn", "$0.3–1bn", "$1–10bn", "$10bn+"];

function FundingMap() {
  const frameRef = useRef(null);
  const tipRef = useRef(null);
  const currentId = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);

  /* The country paths never change, so they are built once and stay out of
     the hover render path — that is what keeps the map smooth. */
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
      className="relative flex min-h-[100svh] flex-col justify-center border-t border-rule bg-paper-deep py-12"
    >
      <div className="shell">
        <h3 className="font-display display-lg max-w-[20ch] font-semibold tracking-[-0.02em] text-ink">
          $59.8bn leaves the US in cross-border giving each year
        </h3>
        <p className="measure mt-4 text-lg leading-relaxed text-ink/70">
          Almost none of it reaches Malawi.
        </p>
      </div>

      {/* the map is the centrepiece, so it runs wider than the prose */}
      <div className="shell-wide mt-6">
        <div className="mx-auto max-w-[1400px]">
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
                fill={HOVER}
                stroke={PAPER}
                strokeWidth={0.6}
                pointerEvents="none"
              />
            ) : null}

            {/* ties the headline figure to the country it describes */}
            {usPoint ? (
              <g pointerEvents="none">
                <line
                  x1={usPoint[0] - 6}
                  y1={usPoint[1] - 6}
                  x2={usPoint[0] - 70}
                  y2={usPoint[1] - 54}
                  stroke="#2f1430"
                  strokeWidth={0.8}
                />
                <circle
                  cx={usPoint[0] - 6}
                  cy={usPoint[1] - 6}
                  r={2}
                  fill="#2f1430"
                />
                <text
                  x={usPoint[0] - 74}
                  y={usPoint[1] - 58}
                  textAnchor="end"
                  fontSize="19"
                  fontWeight="600"
                  fill="#2f1430"
                >
                  $59.8bn
                </text>
                <text
                  x={usPoint[0] - 74}
                  y={usPoint[1] - 44}
                  textAnchor="end"
                  fontSize="10"
                  fill="#1a1418"
                  fillOpacity="0.6"
                >
                  United States, 0.22% of GNI
                </text>
              </g>
            ) : null}
          </svg>

          <div
            ref={tipRef}
            className="pointer-events-none absolute left-0 top-0 z-10 will-change-transform"
            style={{ opacity: hoveredShape ? 1 : 0 }}
          >
            <span className="inline-block translate-y-2 rounded bg-brand-deep px-2 py-1 text-xs font-bold tabular-nums text-white">
              {hoveredShape ? outflowLabel(hoveredShape.market) : ""}
            </span>
          </div>
        </div>

        {/* the legend carries the explanation; there is no separate rail */}
        <div className="mt-2 border-t border-ink/15 pt-4">
          <p className="text-[11px] text-ink/70">
            Twenty donor markets shaded by cross-border philanthropic outflow
            <span className="text-ink/40"> · </span>USD, 2023
          </p>

          <div className="mt-3 flex flex-wrap items-end gap-x-10 gap-y-4">
            <div>
              <div className="flex">
                {RAMP.map((c) => (
                  <span
                    key={c}
                    className="h-2.5 w-16"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex">
                {RAMP_TICKS.map((t) => (
                  <span
                    key={t}
                    className="w-16 text-[10px] tabular-nums text-ink/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-ink/15 text-[11px] text-ink/70 md:border-l md:pl-10">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 border border-ink/15"
                  style={{ background: IN_STUDY }}
                />
                Not reported
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 border border-ink/15"
                  style={{ background: DELIVERY }}
                />
                MLF delivery country
              </span>
            </div>

            <p className="text-[11px] italic text-ink/50">
              Hover for the figure, select a country for its prospects.
            </p>

            <a
              href={`${BASE}mlf-partners.html`}
              className="ml-auto text-sm font-bold text-brand hover:underline"
            >
              All twenty markets &rarr;
            </a>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-ink/50">
            Outflow and share of GNI: Global Philanthropy Tracker, 2023
            reference year. Giving rates: CAF World Giving Report. Several
            markets do not publish a cross-border figure.
          </p>
        </div>
        </div>
      </div>
    </section>
  );
}

export default FundingMap;
