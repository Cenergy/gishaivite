
import { turf } from "swpdmap";

export function geoFeatureList(geoList) {
  return turf.featureCollection(geoList);
}
export function dataToGeo(data, options = { lat: "lat", lon: "lon" }) {
  const { lat, lon } = options;
  const geoList = data.map((item) =>turf.point([item[lon],item[lat]], item));
  return turf.featureCollection(geoList);
}
