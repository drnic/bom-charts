import * as theme from "./theme";
import * as mapboxgl from "mapbox-gl";
import * as $ from 'jquery';

interface GeoPointAPI {
  Longitude: number;
  Latitude: number;
  ICAO: string;
}

export function init(map: mapboxgl.Map) {
  $.get("/json/openflights-airports-au.json", function (data) {
    var airportsCollection = data.reduce((result: GeoJSON.Feature<mapboxgl.GeoJSONGeometry>[], airport: GeoPointAPI) => {
      var feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [airport.Longitude, airport.Latitude]
        },
        "properties": {
            "title": airport.ICAO
        }
      } as GeoJSON.Feature<mapboxgl.GeoJSONGeometry>;
      result.push(feature);
      return result;
    }, []) as GeoJSON.Feature<mapboxgl.GeoJSONGeometry>[];

    var airportsGeoJSON = {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": airportsCollection
      }
    } as mapboxgl.GeoJSONSourceRaw;

    map.addLayer({
      "id": "airports",
      "type": "symbol",
      "source": airportsGeoJSON,
      "layout": {
        "text-field": "{title}",
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-offset": [0, 0],
        "text-anchor": "top"
      },
      "paint": {
        "text-color": theme.current().textColor
      }
    });
  });
}
