import { useEffect, useMemo, useState } from "react";
import {
  marketsByCountry,
  normaliseId,
  outflowLabel,
  partnerLogo,
} from "../data/fundingGeography";

const BASE = import.meta.env.BASE_URL;

const MIX_TONE = {
  High: "text-[color:var(--accent-strong)]",
  Medium: "text-amber-700",
  Low: "text-slate-400",
};

const card =
  "rounded-2xl border border-white/50 bg-white/60 shadow-glass backdrop-blur-xl";

function Stat({ label, value, sub, tone }) {
  return (
    <div className={`${card} p-5`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p
        className={`font-display mt-3 text-3xl font-semibold tracking-[-0.03em] ${
          tone || "text-slate-900"
        }`}
      >
        {value}
      </p>
      {sub ? <p className="mt-2 text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}

/** Top 3 Institutional / Top 3 Corporate — one engine per column */
function Engine({ title, items, empty, note }) {
  return (
    <div className={`${card} p-5`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>
      {items && items.length ? (
        <ol className="mt-4 space-y-0">
          {items.map((name, i) => (
            <li
              key={name}
              className="flex items-baseline gap-3 border-b border-slate-200/60 py-3 last:border-b-0"
            >
              <span className="font-mono text-[11px] tabular-nums text-slate-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-medium leading-snug text-slate-900">
                {name}
              </span>
            </li>
          ))}
        </ol>
      ) : note ? (
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{note}</p>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-slate-400">{empty}</p>
      )}
    </div>
  );
}

function MarketDashboard() {
  const countryId = useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get("c");
    return raw ? normaliseId(raw) : null;
  }, []);

  const market = countryId ? marketsByCountry[countryId] : null;
  const isGlobal = !market;

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: null, dir: 1 });

  useEffect(() => {
    document.title = `${market ? market.name : "Donor markets"} — MicroLoan Foundation`;
  }, [market]);

  /* ---------------- all markets ---------------- */
  const allRows = useMemo(
    () =>
      Object.entries(marketsByCountry)
        .map(([id, m]) => ({ id, ...m }))
        .filter((m) => m.fit !== null && m.fit !== undefined),
    [],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q
      ? allRows.filter((m) =>
          [m.name, m.region, m.rationale, ...(m.institutional || []), ...(m.corporate || [])]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : allRows;
    if (sort.key) {
      list = [...list].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        if (typeof av === "number" || typeof bv === "number")
          return ((av ?? -1) - (bv ?? -1)) * sort.dir;
        return String(av).localeCompare(String(bv)) * sort.dir;
      });
    } else {
      list = [...list].sort((a, b) => (b.outflow ?? -1) - (a.outflow ?? -1));
    }
    return list;
  }, [allRows, query, sort]);

  const onSort = (key) => () =>
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir * -1 } : { key, dir: 1 },
    );

  const columns = [
    ["name", "Country"],
    ["outflow", "Outflow"],
    ["cafIncome", "CAF (% income)"],
    ["fit", "MLF fit"],
    ["mix", "Channel mix"],
    ["institutional", "Top institutional"],
    ["corporate", "Top corporate"],
  ];

  if (isGlobal) {
    return (
      <main className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10 lg:px-16">
        <TopBar countryId={null} />
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Donor Market Matrix
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.035em] text-slate-900 sm:text-5xl">
          Twenty markets, ranked.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
          Cross-border outflow, giving propensity, MLF fit and named prospects
          for each market. Sorted by outflow; click any row for the full
          dashboard.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Markets
            <span className="ml-2 font-semibold text-slate-900">
              {visible.length} / {allRows.length}
            </span>
          </h2>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="FILTER…"
            className={`${card} px-4 py-2 font-mono text-xs text-slate-800 placeholder:tracking-[0.1em] placeholder:text-slate-400`}
          />
        </div>

        <div className={`mt-3 overflow-hidden ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse font-mono">
              <thead>
                <tr>
                  {columns.map(([key, label]) => (
                    <th
                      key={key}
                      onClick={onSort(key)}
                      className={`cursor-pointer select-none whitespace-nowrap border-b border-slate-200/70 px-5 py-4 text-left text-[10px] font-medium uppercase tracking-[0.16em] hover:text-slate-900 ${
                        sort.key === key ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {label}
                      {sort.key === key ? (
                        <span className="pl-1 text-[8px]">
                          {sort.dir > 0 ? "▲" : "▼"}
                        </span>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => {
                      window.location.href = `${BASE}mlf-partners.html?c=${m.id}`;
                    }}
                    className="group cursor-pointer border-b border-slate-200/50 transition-colors last:border-b-0 hover:bg-white/70"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="text-[13px] font-semibold tracking-tight text-slate-900">
                        {m.name}
                      </span>
                      <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-slate-400">
                        {m.region}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs tabular-nums text-slate-700">
                      {outflowLabel(m)}
                      {m.gni ? (
                        <span className="ml-1 text-slate-400">({m.gni})</span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs tabular-nums text-slate-600">
                      {m.cafIncome ? `${m.cafIncome}%` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs font-semibold tabular-nums text-slate-900">
                      {m.fit}/5
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-[11px] uppercase tracking-[0.06em]">
                      {m.mix ? (
                        <>
                          <span className={MIX_TONE[m.mix.inst]}>
                            {m.mix.inst[0]}
                          </span>
                          <span className="text-slate-300"> / </span>
                          <span className={MIX_TONE[m.mix.corp]}>
                            {m.mix.corp[0]}
                          </span>
                          <span className="text-slate-300"> / </span>
                          <span className={MIX_TONE[m.mix.rec]}>
                            {m.mix.rec[0]}
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4 text-[11px] text-slate-500">
                      {m.institutional?.length
                        ? m.institutional.join(", ")
                        : "Not researched"}
                    </td>
                    <td className="px-5 py-4 text-[11px] text-slate-500">
                      {m.corporate?.length
                        ? m.corporate.join(", ")
                        : "Not researched"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Channel mix reads Institutional / Corporate / Recurring. Sources:
          Global Philanthropy Tracker 2026, OECD Private Philanthropy for
          Development 2026, CAF World Giving Report.
        </p>
      </main>
    );
  }

  /* ---------------- single market ---------------- */
  const inStudy = market.fit !== null && market.fit !== undefined;

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10 lg:px-16">
      <TopBar countryId={countryId} />

      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {market.region}
      </p>
      <h1 className="font-display text-4xl font-semibold tracking-[-0.035em] text-slate-900 sm:text-5xl">
        {market.name}
      </h1>
      {inStudy ? (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
          {market.rationale}
        </p>
      ) : (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
          {market.outflowNote || "Not part of the 20-market donor study."}
        </p>
      )}

      {inStudy ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              label="Cash outflow"
              value={outflowLabel(market)}
              sub={market.gni ? `${market.gni} of GNI` : "Share of GNI unspecified"}
            />
            <Stat
              label="CAF giving (% income)"
              value={market.cafIncome ? `${market.cafIncome}%` : "—"}
              sub={market.cafPopulation || "Not reported for this market"}
              tone={market.cafIncome ? "text-amber-700" : "text-slate-400"}
            />
            <Stat
              label="MLF fit"
              value={`${market.fit}/5`}
              sub={`Channel mix ${market.mix.inst} / ${market.mix.corp} / ${market.mix.rec}`}
            />
          </div>

          <div className={`mt-4 ${card} p-5`}>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Channel mix
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                ["Institutional", market.mix.inst],
                ["Corporate", market.mix.corp],
                ["Recurring", market.mix.rec],
              ].map(([label, level]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-3 border-b border-slate-200/60 pb-3 sm:border-b-0 sm:pb-0"
                >
                  <span className="text-sm text-slate-600">{label}</span>
                  <span
                    className={`font-mono text-sm font-semibold uppercase tracking-[0.1em] ${MIX_TONE[level]}`}
                  >
                    {level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Engine
              title="Top 3 institutional prospects"
              items={market.institutional}
              empty="Not yet researched for this market."
            />
            <Engine
              title="Top 3 corporate prospects"
              items={market.corporate}
              empty="Not yet researched for this market."
            />
            <Engine
              title="Recurring / diaspora"
              note={market.diaspora}
              empty="No diaspora note recorded."
            />
          </div>
        </>
      ) : null}

      {market.partners?.length ? (
        <div className="mt-10">
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Already funding MLF
            <span className="ml-2 font-semibold text-slate-900">
              {market.partners.length}
            </span>
          </h2>
          <div className={`mt-3 overflow-hidden ${card}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse font-mono">
                <thead>
                  <tr>
                    {["#", "Partner", "Type", "Channel", "Basis"].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap border-b border-slate-200/70 px-5 py-4 text-left text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {market.partners.map((p, i) => (
                    <tr
                      key={p.name}
                      className="border-b border-slate-200/50 last:border-b-0 hover:bg-white/70"
                    >
                      <td className="px-5 py-4 text-xs tabular-nums text-slate-400">
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-3">
                          {p.domain ? (
                            <img
                              src={partnerLogo(p.domain)}
                              alt=""
                              loading="lazy"
                              className="h-7 w-7 flex-none rounded-md border border-slate-200/70 bg-white object-contain p-1"
                            />
                          ) : (
                            <span className="grid h-7 w-7 flex-none place-items-center rounded-md bg-slate-100 text-[8.5px] font-bold text-slate-500">
                              {p.tag || p.name.slice(0, 3).toUpperCase()}
                            </span>
                          )}
                          <span className="whitespace-nowrap text-[13px] font-medium text-slate-900">
                            {p.name}
                          </span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-[11px] uppercase tracking-[0.06em] text-slate-600">
                        {p.kind}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-[11px] uppercase tracking-[0.06em] text-slate-600">
                        {p.channel}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="border-b border-current pb-0.5 text-[11px] uppercase tracking-[0.1em] text-[color:var(--accent-strong)]">
                          {p.basis}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      <p className="mt-6 text-xs leading-relaxed text-slate-500">{market.source}</p>
    </main>
  );
}

function TopBar({ countryId }) {
  return (
    <div className="mb-10 flex flex-wrap items-center gap-3">
      <a
        href={`${BASE}#funding-geography`}
        className={`${card} px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white`}
      >
        &larr; Back to the map
      </a>
      <div className="flex-1" />
      <select
        value={countryId ?? ""}
        onChange={(e) => {
          window.location.search = e.target.value ? `?c=${e.target.value}` : "";
        }}
        className={`${card} px-4 py-2 text-sm font-semibold text-slate-800`}
      >
        <option value="">All markets</option>
        {Object.entries(marketsByCountry)
          .sort(([, a], [, b]) => a.name.localeCompare(b.name))
          .map(([id, m]) => (
            <option key={id} value={id}>
              {m.name}
            </option>
          ))}
      </select>
    </div>
  );
}

export default MarketDashboard;
