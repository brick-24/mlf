import { useEffect, useMemo, useState } from "react";
import {
  marketsByCountry,
  normaliseId,
  outflowLabel,
  partnerLogo,
} from "../data/fundingGeography";

const BASE = import.meta.env.BASE_URL;

/* containers and interactive controls are deliberately different things */
const card = "rounded-lg border border-rule bg-white";
const control =
  "rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 hover:border-slate-400";

const MIX_LEVEL = { High: 3, Medium: 2, Low: 1 };

function Wordmark() {
  return (
    <a href={BASE} className="flex items-baseline gap-2">
      <span className="font-display text-lg font-bold tracking-[-0.01em] text-brand">
        MicroLoan Foundation
      </span>
      <span className="hidden text-xs text-slate-500 sm:inline">
        Donor market research
      </span>
    </a>
  );
}

/** headline metric: bare type on the page, divided by a rule */
function Metric({ label, value, note, muted }) {
  return (
    <div className="min-w-[8.5rem] flex-1 border-slate-200 px-5 first:pl-0 sm:border-l">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p
        className={`font-display mt-1.5 text-[32px] font-semibold leading-none tabular-nums tracking-[-0.02em] ${
          muted ? "text-slate-400" : "text-slate-900"
        }`}
      >
        {value}
      </p>
      {note ? <p className="mt-1.5 text-[11px] text-slate-500">{note}</p> : null}
    </div>
  );
}

/** three-segment scale — replaces the High / High / High label triplet */
function MixBar({ label, level }) {
  const filled = MIX_LEVEL[level] || 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-slate-600">{label}</span>
      <span className="flex gap-1" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1.5 w-8"
            style={{ background: i <= filled ? "#563061" : "#e4e4e0" }}
          />
        ))}
      </span>
      <span className="text-xs text-slate-500">{level}</span>
    </div>
  );
}

function ProspectList({ title, items, note, empty }) {
  return (
    <div className={`${card} p-5`}>
      <h3 className="text-[11px] font-bold text-slate-500">
        {title}
      </h3>
      {items && items.length ? (
        <ul className="mt-3">
          {items.map((name) => (
            <li
              key={name}
              className="border-b border-slate-100 py-2.5 text-sm leading-snug text-slate-900 last:border-b-0 last:pb-0"
            >
              {name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          {note || empty}
        </p>
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
    document.title = market
      ? `${market.name} — donor market profile | MicroLoan Foundation`
      : "Donor market matrix | MicroLoan Foundation";
  }, [market]);

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
    ["cafIncome", "Giving, % income"],
    ["fit", "Fit"],
    ["mix", "Channel mix"],
    ["institutional", "Institutional prospects"],
    ["corporate", "Corporate prospects"],
  ];

  const Chrome = (
    <header className="mb-10 flex flex-wrap items-center gap-4 border-b border-rule pb-5">
      <Wordmark />
      <div className="flex-1" />
      <a href={`${BASE}#funding-geography`} className={control}>
        &larr; Map
      </a>
      <select
        value={countryId ?? ""}
        onChange={(e) => {
          window.location.search = e.target.value ? `?c=${e.target.value}` : "";
        }}
        className={control}
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
    </header>
  );

  const Sources = (
    <p className="mt-8 border-t border-rule pt-4 text-[11px] leading-relaxed text-slate-500">
      <span className="font-bold text-slate-600">Sources.</span> Cross-border
      outflow and share of GNI: Global Philanthropy Tracker, 2023 reference
      year. Giving as a share of income and participation rates: CAF World
      Giving Report. Africa and gender allocations: OECD Private Philanthropy
      for Development. Fit score and channel mix are the research team&rsquo;s
      qualitative assessment, not a computed index. Markets marked as not
      reported do not publish a cross-border figure.
    </p>
  );

  /* ---------------- all markets ---------------- */
  if (isGlobal) {
    return (
      <main className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 lg:px-16">
        {Chrome}
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-semibold tracking-[-0.02em] text-slate-900">
            Twenty donor markets, ranked by outflow
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Cross-border giving, generosity, fit and named prospects for each
            market. Select a row for the full profile.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            <span className="font-bold text-slate-900">{visible.length}</span> of{" "}
            {allRows.length} markets
          </p>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search markets"
            className={`${control} w-56`}
          />
        </div>

        <div className={`mt-3 overflow-hidden ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr>
                  {columns.map(([key, label]) => (
                    <th
                      key={key}
                      onClick={onSort(key)}
                      className={`cursor-pointer select-none whitespace-nowrap border-b border-rule px-5 py-3 text-left text-[11px] font-bold hover:text-slate-900 ${
                        sort.key === key ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {label}
                      {sort.key === key ? (
                        <span className="pl-1">{sort.dir > 0 ? "▲" : "▼"}</span>
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
                    className="cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="text-sm font-bold text-slate-900">
                        {m.name}
                      </span>
                      <span className="ml-2 text-[11px] text-slate-500">
                        {m.region}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm tabular-nums text-slate-800">
                      {outflowLabel(m)}
                      {m.gni ? (
                        <span className="ml-1 text-slate-400">{m.gni}</span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm tabular-nums text-slate-700">
                      {m.cafIncome ? `${m.cafIncome}%` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm font-bold tabular-nums text-slate-900">
                      {m.fit}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      {m.mix ? (
                        <span className="flex items-center gap-1">
                          {[m.mix.inst, m.mix.corp, m.mix.rec].map((lvl, i) => (
                            <span
                              key={i}
                              title={
                                ["Institutional", "Corporate", "Recurring"][i] +
                                ": " +
                                lvl
                              }
                              className="flex gap-px"
                            >
                              {[1, 2, 3].map((n) => (
                                <span
                                  key={n}
                                  className="h-3 w-1"
                                  style={{
                                    background:
                                      n <= (MIX_LEVEL[lvl] || 0)
                                        ? "#563061"
                                        : "#e4e4e0",
                                  }}
                                />
                              ))}
                            </span>
                          ))}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-slate-600">
                      {m.institutional?.length ? m.institutional.join(", ") : "—"}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-slate-600">
                      {m.corporate?.length ? m.corporate.join(", ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-500">
          Channel mix bars read Institutional / Corporate / Recurring, one to
          three segments.
        </p>
        {Sources}
      </main>
    );
  }

  /* ---------------- one market ---------------- */
  const inStudy = market.fit !== null && market.fit !== undefined;

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 lg:px-16">
      {Chrome}

      <p className="text-[11px] text-slate-500">{market.region}</p>
      <h1 className="font-display mt-1 text-4xl font-semibold tracking-[-0.02em] text-slate-900">
        {market.name}
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
        {inStudy
          ? market.rationale
          : market.outflowNote || "Not part of the twenty-market donor study."}
      </p>

      {inStudy ? (
        <>
          <div className="mt-8 flex flex-wrap gap-y-6 border-y border-rule py-6">
            <Metric
              label="Cross-border outflow"
              value={outflowLabel(market)}
              note={market.gni ? `${market.gni} of GNI` : "Share of GNI not reported"}
              muted={market.outflow === null}
            />
            <Metric
              label="Given as share of income"
              value={market.cafIncome ? `${market.cafIncome}%` : "—"}
              note={market.cafPopulation || "Not reported"}
              muted={!market.cafIncome}
            />
            <Metric
              label="Fit for MLF, 1–5"
              value={market.fit}
              note="Qualitative analyst score"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
            <div>
              <h2 className="text-[11px] font-bold text-slate-500">
                Recommended channel mix
              </h2>
              <div className="mt-4 space-y-3">
                <MixBar label="Institutional" level={market.mix.inst} />
                <MixBar label="Corporate" level={market.mix.corp} />
                <MixBar label="Recurring" level={market.mix.rec} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ProspectList
                title="Institutional prospects"
                items={market.institutional}
                empty="Not yet researched for this market."
              />
              <ProspectList
                title="Corporate prospects"
                items={market.corporate}
                empty="Not yet researched for this market."
              />
              <ProspectList
                title="Recurring and diaspora"
                note={market.diaspora}
                empty="No diaspora note recorded."
              />
            </div>
          </div>
        </>
      ) : null}

      {market.partners?.length ? (
        <div className="mt-10">
          <h2 className="text-[11px] font-bold text-slate-500">
            Already funding MLF
          </h2>
          <div className={`mt-3 overflow-hidden ${card}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr>
                    {["Partner", "Type", "Channel", "Basis"].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap border-b border-rule px-5 py-3 text-left text-[11px] font-bold text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {market.partners.map((p) => (
                    <tr
                      key={p.name}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-3">
                          {p.domain ? (
                            <img
                              src={partnerLogo(p.domain)}
                              alt=""
                              loading="lazy"
                              className="h-6 w-6 flex-none rounded-sm border border-slate-200 bg-white object-contain p-0.5"
                            />
                          ) : null}
                          <span className="whitespace-nowrap text-sm font-bold text-slate-900">
                            {p.name}
                          </span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[12px] text-slate-600">
                        {p.kind}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[12px] text-slate-600">
                        {p.channel}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[12px] text-slate-600">
                        {p.basis}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      <p className="mt-6 text-[12px] leading-relaxed text-slate-500">
        {market.source}
      </p>
      {Sources}
    </main>
  );
}

export default MarketDashboard;
