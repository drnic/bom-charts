$(function () {
  map.on('load', function () {
    map.addSource('dem', {
      "type": "raster-dem",
      "url": "mapbox://mapbox.terrain-rgb"
    });
    map.addLayer({
        "id": "hillshading",
        "source": "dem",
        "type": "hillshade"
      // insert below waterway-river-canal-shadow;
      // where hillshading sits in the Mapbox Outdoors style
    }, 'waterway-river-canal-shadow');

    if (document.gafPageCode) {
      $.get("/api/gaf/" + document.gafPageCode + ".json", function(data) {
        var gafBoundary = data["boundary"]["points"];

        var geojson = {
          "type": "Feature",
          "properties": {},
          "geometry": {
              "type": "LineString",
              "coordinates": gafBoundary
          }
        }

        map.addLayer({
          "id": "route",
          "type": "line",
          "source": {
              "type": "geojson",
              "data": geojson
          },
          "layout": {
              "line-join": "round",
              "line-cap": "round"
          },
          "paint": {
              "line-color": "#888",
              "line-width": 8
          }
        });

        // Geographic coordinates of the LineString
        var coordinates = geojson.geometry.coordinates;

        // Pass the first coordinates in the LineString to `lngLatBounds` &
        // wrap each coordinate pair in `extend` to include them in the bounds
        // result. A variation of this technique could be applied to zooming
        // to the bounds of multiple Points or Polygon geomteries - it just
        // requires wrapping all the coordinates with the extend method.
        var bounds = coordinates.reduce(function(bounds, coord) {
            return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    
        map.fitBounds(bounds, {
            padding: 20
        });
      });
    }

  });

});