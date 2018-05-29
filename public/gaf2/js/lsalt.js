function updateLSALT(gafAreaCode) {
  if (gafAreaCode != "QLD-S") {
    return;
  }

  $.get("/json/lsalt-" + gafAreaCode + ".json?" + new Date().getTime(), function (data) {

    var mapAreas = document.mapAreas[gafAreaCode];

    data.forEach(lsaltGrid => {
      var grid = lsaltGrid["grid"]
      var lsalt = lsaltGrid["lsalt-100ft"];

      var lsaltPolygon = turf.polygon([grid]);

      mapAreas.forEach(mapArea => {
        var mapAreaPolygon = mapArea.turfPolygon();

        var lsaltIntersection = turf.intersect(mapAreaPolygon, lsaltPolygon)
        if (lsaltIntersection === undefined) {
          return;
        }

        var layerID = "lsalt" + randomID();

        map.addLayer({
          "id": layerID,
          "type": "line",
          "source": {
            "type": "geojson", "data": lsaltIntersection
          },
          "layout": {
            "line-join": "round", "line-cap": "round"
          },
          "paint": {
            "line-color": "#888", "line-width": 1
          }
        });

        map.on("mouseover", layerID, function(e) {
          map.setPaintProperty(layerID, "line-color", "#222");
          map.setPaintProperty(layerID, "line-width", 2);
        });

        map.on("mouseleave", layerID, function(e) {
          map.setPaintProperty(layerID, "line-color", "#888");
          map.setPaintProperty(layerID, "line-width", 1);
        });
      });
    });
  });
};
