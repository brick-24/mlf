import { useEffect, useMemo, useState } from "react";
import LocatorMap from "./LocatorMap";
import {
  marketsByCountry,
  normaliseId,
  outflowLabel,
  outflowRanking,
  partnerLogo,
  prospectDomain,
} from "../data/fundingGeography";

const BASE = import.meta.env.BASE_URL;

const card = "rounded-lg border border-rule bg-white";
const control =
  "rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink hover:border-ink/30";

/* High / Medium / Low mapped onto a five-block scale; the mapping is stated
   in the footnote rather than implied. */
const MIX_SCORE = { High: 5, Medium: 3, Low: 1 };

const { order: RANK_ORDER, total: RANK_TOTAL } = outflowRanking();

function Wordmark() {
  return (
    <a href={BASE} className="flex items-baseline gap-2">
      <span className="font-display text-lg font-bold tracking-[-0.01em] text-brand">
        MicroLoan Foundation
      </span>
      <span className="hidden text-xs text-ink/50 sm:inline">
        Donor market research
      </span>
    </a>
  );
}

function ProspectLogo({ name }) {
  const domain = prospectDomain(name);
  if (domain)
    return (
      <img
        src={partnerLogo(domain)}
        alt=""
        loading="lazy"
        className="h-6 w-6 flex-none rounded-sm border border-ink/10 bg-white object-contain p-0.5"
      />
    );
  return (
    <span className="grid h-6 w-6 flex-none place-items-center rounded-sm bg-paper-deep text-[9px] font-bold text-ink/50">
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

/** where this market sits against the other nineteen */
function RankStrip({ id }) {
  const index = RANK_ORDER.indexOf(Number(id));
  if (index === -1) return null;
  return (
    <div className="mt-2">
      <p className="text-[11px] text-ink/60">
        <span className="font-bold text-ink">#{index + 1}</span> of {RANK_TOTAL}{" "}
        markets that report an outflow
      </p>
      <div className="mt-1.5 flex gap-[3px]" aria-hidden="true">
        {RANK_ORDER.map((mid, i) => (
          <span
            key={mid}
            className="h-3 w-1.5"
            style={{
              background: i === index ? "#5c2c54" : "rgba(26,20,24,0.12)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, note, muted, small }) {
  return (
    <div className="min-w-[9rem] flex-1 border-ink/10 px-5 first:pl-0 sm:border-l">
      <p className="text-[11px] text-ink/60">{label}</p>
      <p
        className={`font-display mt-1.5 font-semibold leading-none tabular-nums tracking-[-0.02em] ${
          small ? "text-[22px] text-brand" : "text-[32px]"
        } ${muted ? "text-ink/35" : small ? "" : "text-ink"}`}
      >
        {value}
      </p>
      {note ? <p className="mt-1.5 text-[11px] text-ink/55">{note}</p> : null}
    </div>
  );
}

function MixBar({ label, level }) {
  const filled = MIX_SCORE[level] || 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-ink/70">{label}</span>
      <span className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="h-3 w-4"
            style={{
              background: i <= filled ? "#5c2c54" : "rgba(26,20,24,0.10)",
            }}
          />
        ))}
      </span>
      <span className="text-xs tabular-nums text-ink/60">
        {filled} · {level}
      </span>
    </div>
  );
}

function ProspectList({ title, items, note, empty }) {
  return (
    <div className={`${card} p-5`}>
      <h3 className="text-[11px] font-bold text-ink/55">{title}</h3>
      {items && items.length ? (
        <ul className="mt-3">
          {items.map((name) => (
            <li
              key={name}
              className="flex items-center gap-3 border-b border-ink/[0.07] py-2.5 text-sm leading-snug text-ink last:border-b-0 last:pb-0"
            >
              <ProspectLogo name={name} />
              {name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-ink/55">
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
    <p className="mt-8 border-t border-rule pt-4 text-[11px] leading-relaxed text-ink/50">
      <span className="font-bold text-ink/70">Sources and method.</span>{" "}
      Cross-border outflow and share of GNI: Global Philanthropy Tracker, 2023
      reference year. Giving as a share of income and participation rates: CAF
      World Giving Report. Africa and gender allocations: OECD Private
      Philanthropy for Development. Fit is the research team&rsquo;s
      qualitative score from 1 to 5, not a computed index. Channel mix is
      scored High (5), Medium (3) or Low (1) on the same qualitative basis.
      Markets shown as not reported do not publish a cross-border figure.
    </p>
  );

  /* ---------------- all markets ---------------- */
  if (isGlobal) {
    return (
      <main className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 lg:px-16">
        {Chrome}
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-semibold tracking-[-0.02em] text-ink">
            Twenty donor markets, ranked by outflow
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            Cross-border giving, generosity, fit and named prospects for each
            market. Select a row for the full profile.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-ink/70">
            <span className="font-bold text-ink">{visible.length}</span> of{" "}
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
                      className={`cursor-pointer select-none whitespace-nowrap border-b border-rule px-5 py-3 text-left text-[11px] font-bold hover:text-ink ${
                        sort.key === key ? "text-ink" : "text-ink/55"
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
                    className="cursor-pointer border-b border-ink/[0.07] last:border-b-0 hover:bg-paper"
                  >
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="text-sm font-bold text-ink">{m.name}</span>
                      <span className="ml-2 text-[11px] text-ink/50">
                        {m.region}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm tabular-nums text-ink/80">
                      {outflowLabel(m)}
                      {m.gni ? (
                        <span className="ml-1 text-ink/40">{m.gni}</span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm tabular-nums text-ink/70">
                      {m.cafIncome ? `${m.cafIncome}%` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm font-bold tabular-nums text-brand">
                      {m.fit}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      {m.mix ? (
                        <span className="flex items-center gap-1.5">
                          {[m.mix.inst, m.mix.corp, m.mix.rec].map((lvl, i) => (
                            <span
                              key={i}
                              title={`${["Institutional", "Corporate", "Recurring"][i]}: ${lvl}`}
                              className="flex gap-px"
                            >
                              {[1, 2, 3, 4, 5].map((n) => (
                                <span
                                  key={n}
                                  className="h-3 w-[3px]"
                                  style={{
                                    background:
                                      n <= (MIX_SCORE[lvl] || 0)
                                        ? "#5c2c54"
                                        : "rgba(26,20,24,0.12)",
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
                    <td className="px-5 py-3 text-[12px] text-ink/65">
                      {m.institutional?.length ? m.institutional.join(", ") : "—"}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-ink/65">
                      {m.corporate?.length ? m.corporate.join(", ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {Sources}
      </main>
    );
  }

  /* ---------------- one market ---------------- */
  const inStudy = market.fit !== null && market.fit !== undefined;

  const rankIndex = RANK_ORDER.indexOf(Number(countryId));
  const neighbours = RANK_ORDER;
  const prevId = rankIndex > 0 ? neighbours[rankIndex - 1] : null;
  const nextId =
    rankIndex > -1 && rankIndex < neighbours.length - 1
      ? neighbours[rankIndex + 1]
      : null;

  const leadChannel = inStudy
    ? [
        ["Institutional", MIX_SCORE[market.mix.inst]],
        ["Corporate", MIX_SCORE[market.mix.corp]],
        ["Recurring and diaspora", MIX_SCORE[market.mix.rec]],
      ].sort((a, b) => b[1] - a[1])[0][0]
    : null;

  const nextAction = market.partners?.length
    ? `Warm introduction through ${market.partners[0].name}, already funding MLF here.`
    : market.institutional?.length
      ? `No existing relationship. Open with ${market.institutional[0]}.`
      : "No named prospects yet — commission prospect research before approaching.";

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 lg:px-16">
      {Chrome}

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-[11px] text-ink/55">{market.region}</p>
          <h1 className="font-display mt-1 text-4xl font-semibold tracking-[-0.02em] text-ink">
            {market.name}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
            {inStudy
              ? market.rationale
              : market.outflowNote ||
                "Not part of the twenty-market donor study."}
          </p>
        </div>
        <LocatorMap id={countryId} name={market.name} />
      </div>

      {inStudy ? (
        <>
          <div className="mt-8 flex flex-wrap gap-y-6 border-y border-rule py-6">
            <div className="min-w-[13rem] flex-1 pr-5">
              <p className="text-[11px] text-ink/60">Cross-border outflow</p>
              <p className="font-display mt-1.5 text-[32px] font-semibold leading-none tabular-nums tracking-[-0.02em] text-ink">
                {outflowLabel(market)}
              </p>
              <p className="mt-1.5 text-[11px] text-ink/55">
                {market.gni ? `${market.gni} of GNI` : "Share of GNI not reported"}
              </p>
              <RankStrip id={countryId} />
            </div>
            <Metric
              label="Given as share of income"
              value={market.cafIncome ? `${market.cafIncome}%` : "—"}
              note={market.cafPopulation || "Not reported"}
              muted={!market.cafIncome}
            />
            <Metric
              small
              label="Fit for MLF, 1–5"
              value={market.fit}
              note="Qualitative analyst score, not measured data"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
            <div>
              <h2 className="text-[11px] font-bold text-ink/55">
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

          {/* the page should end on a decision, not on evidence */}
          <div className="mt-8 border-l-4 border-brand bg-paper-deep p-6">
            <h2 className="text-[11px] font-bold text-ink/55">Recommendation</h2>
            <p className="font-display mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">
              Priority tier {market.fit >= 5 ? 1 : market.fit >= 4 ? 2 : 3} · lead
              with {leadChannel.toLowerCase()}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
              {nextAction}
            </p>
          </div>
        </>
      ) : null}

      {market.partners?.length ? (
        <div className="mt-10">
          <h2 className="text-[11px] font-bold text-ink/55">
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
                        className="whitespace-nowrap border-b border-rule px-5 py-3 text-left text-[11px] font-bold text-ink/55"
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
                      className="border-b border-ink/[0.07] last:border-b-0"
                    >
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-3">
                          {p.domain ? (
                            <img
                              src={partnerLogo(p.domain)}
                              alt=""
                              loading="lazy"
                              className="h-6 w-6 flex-none rounded-sm border border-ink/10 bg-white object-contain p-0.5"
                            />
                          ) : null}
                          <span className="whitespace-nowrap text-sm font-bold text-ink">
                            {p.name}
                          </span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[12px] text-ink/65">
                        {p.kind}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[12px] text-ink/65">
                        {p.channel}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[12px] text-ink/65">
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

      {/* the filing reference is the most checkable thing here, so it is
          stated rather than buried in the footnote */}
      <div className="mt-8 flex items-start gap-3 border-t border-rule pt-4">
        <span className="mt-0.5 text-[11px] font-bold text-ink/55">
          Evidence
        </span>
        <p className="text-[13px] leading-relaxed text-ink/80">{market.source}</p>
      </div>

      <nav className="mt-8 flex items-center justify-between gap-4 border-t border-rule pt-5 text-sm">
        {prevId ? (
          <a
            href={`${BASE}mlf-partners.html?c=${prevId}`}
            className="text-ink/70 hover:text-brand"
          >
            &larr; {marketsByCountry[prevId].name}
            <span className="ml-2 text-[11px] text-ink/45">
              higher outflow
            </span>
          </a>
        ) : (
          <span />
        )}
        {nextId ? (
          <a
            href={`${BASE}mlf-partners.html?c=${nextId}`}
            className="text-right text-ink/70 hover:text-brand"
          >
            <span className="mr-2 text-[11px] text-ink/45">lower outflow</span>
            {marketsByCountry[nextId].name} &rarr;
          </a>
        ) : (
          <span />
        )}
      </nav>

      {Sources}
    </main>
  );
}

export default MarketDashboard;
