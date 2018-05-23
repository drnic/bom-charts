$(function () {

  function setupGAFBoundary(map, data) {
    var gafBoundary = data["boundary"]["points"];

    var areaGeoJSON = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": gafBoundary
      }
    }

    map.addLayer({
      "id": "gaf",
      "type": "line",
      "source": {
        "type": "geojson", "data": areaGeoJSON
      },
      "layout": {
        "line-join": "round", "line-cap": "round"
      },
      "paint": {
        "line-color": "#888", "line-width": 4
      }
    });

    // Pass the first coordinates in the LineString to `lngLatBounds` &
    // wrap each coordinate pair in `extend` to include them in the bounds
    // result. A variation of this technique could be applied to zooming
    // to the bounds of multiple Points or Polygon geomteries - it just
    // requires wrapping all the coordinates with the extend method.
    var bounds = gafBoundary.reduce(function(bounds, coord) {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(gafBoundary[0], gafBoundary[0]));

    map.fitBounds(bounds, {
      padding: 20
    });
  }

  function setupAreaBoundary(map, area, fillColor) {
    var gafBoundary = area["boundary"]["points"];

    var colours = {
      "A":  "#22569A",
      "A1": "#4974AC",
      "A2": "#224572",
      "B":  "#7588A1",
      "B1": "#0C4289",
      "B2": "#689FE8",
      "C":  "#93B3DC",
      "C1": "#1D7AF4"
    };

    var id = area["sub-area-id"] || area["area-id"];
    var layerID = "area-fills-" + id;
    var fillColor = fillColor || colours[id] || "#627BC1";

    var areaGeoJSON = {
      "type": "Feature",
      "properties": area,
      "geometry": {
        "type": "Polygon",
        "coordinates": [gafBoundary]
      }
    }

    map.addLayer({
      "id": layerID,
      "type": "fill",
      "source": {"type": "geojson", "data": areaGeoJSON},
      "paint": {
        "fill-color": fillColor,
        "fill-opacity": 0.5
      }
    });

    areaCenter = turf.center(areaGeoJSON, 1);
    areaCenter.properties = {"title": id}
    map.addLayer({
      "id": "label-" + id,
      "type": "symbol",
      "source": {
          "type": "geojson",
          "data": areaCenter
      },
      "layout": {
          "text-field": "{title}",
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-anchor": "top"
      }
    });


    var gafPageCode = document.gafPageCode
    var areaID = area["area-id"];
    var subAreaID = area["sub-area-id"]; // only if this is a sub-area zone

    map.on("mousemove", layerID, function(e) {
      table = $('#gaf-' + gafPageCode);
      table.find('.area-' + gafPageCode + '-' + areaID).addClass("area-selected");
      if (subAreaID) {
        table.find('.sub-area-mentioned-' + subAreaID).addClass("sub-area-selected");
      }
    });

    map.on("mouseleave", layerID, function() {
      table = $('#gaf-' + gafPageCode);
      table.find('.area-' + gafPageCode + '-' + areaID).removeClass("area-selected");
      if (subAreaID) {
        table.find('.sub-area-mentioned-' + subAreaID).removeClass("sub-area-selected");
      }
    });
  }

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
        setupGAFBoundary(map, data);
        data["areas"].forEach(area => {
          setupAreaBoundary(map, area);

          area["sub-areas"].forEach(subArea => {
            setupAreaBoundary(map, subArea);
          });
        });
      });
    }
  });
});