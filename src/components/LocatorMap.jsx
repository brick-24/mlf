import { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import { normaliseId } from "../data/fundingGeography";

/* The atlas is already in the bundle for the choropleth, so drawing a single
   country outline costs one extra projection and nothing else. */
const features = feature(worldAtlas, worldAtlas.objects.countries).features;
const byId = new Map(features.map((f) => [normaliseId(f.id), f]));

function LocatorMap({ id, name, width = 176, height = 120 }) {
  const d = useMemo(() => {
    const f = byId.get(Number(id));
    if (!f) return null;
    const projection = geoMercator().fitExtent(
      [
        [8, 8],
        [width - 8, height - 8],
      ],
      f,
    );
    return geoPath(projection)(f);
  }, [id, width, height]);

  if (!d) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Outline map of ${name}`}
      className="block"
    >
      <path d={d} fill="#5c2c54" stroke="#f6f5f2" strokeWidth={0.5} />
    </svg>
  );
}

export default LocatorMap;
