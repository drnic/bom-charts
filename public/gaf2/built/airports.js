import * as theme from "./theme";
import * as $ from 'jquery';
export function init(map) {
    $.get("/json/openflights-airports-au.json", function (data) {
        var airportsCollection = data.reduce((result, airport) => {
            var feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [airport.Longitude, airport.Latitude]
                },
                "properties": {
                    "title": airport.ICAO
                }
            };
            result.push(feature);
            return result;
        }, []);
        var airportsGeoJSON = {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": airportsCollection
            }
        };
        $(function () {
            map.on('load', function () {
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
        });
    });
}
