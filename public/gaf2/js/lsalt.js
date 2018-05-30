function updateLSALT(gafAreaCode, nightVFR) {
  var cssHeightColors = {
    0: "#BB0EC9",
    1: "#BB0EC9",
    2: "#E30A35",
    3: "#590AE3",
    4: "#0ABCE3",
    5: "#99DAAA",
    6: "#99DAAA",
    7: "#99DAAA",
    8: "#99DAAA",
    9: "#99DAAA",
    10: "#99DAAA",
  }

  $.get("/json/lsalt-" + gafAreaCode + ".json?" + new Date().getTime(), function (data) {

    var mapAreas = document.mapAreas[gafAreaCode];

    data.forEach(lsaltGrid => {
      var grid = lsaltGrid["grid"]

      var lsalt = lsaltGrid["lsalt-100ft"];
      // assume pilot can see highest object; and that LSALT is 1300' higher than highest object
      if (!nightVFR) {
        lsalt -= 13;
      }

      var lsaltPolygon = turf.polygon([grid]);

      mapAreas.forEach(mapArea => {
        var mapAreaPolygon = mapArea.turfPolygon();

        var lsaltIntersection = turf.intersect(mapAreaPolygon, lsaltPolygon)
        if (lsaltIntersection === undefined) {
          return;
        }

        var layerID = "lsalt" + randomID();

        var areaCloudLayerBase = mapArea.cloudBase() === undefined ? 10000 : mapArea.cloudBase();
        var cloudBaseLSALTDelta = areaCloudLayerBase - (lsalt * 100);
        var layerColourIndex = Math.round(cloudBaseLSALTDelta / 1000);
        layerColourIndex = Math.min(10, Math.max(0, layerColourIndex));
        var layerColour = cssHeightColors[layerColourIndex];

        map.addLayer({
          "id": layerID,
          "type": "fill",
          "source": {
            "type": "geojson", "data": lsaltIntersection
          },
          "paint": {
            "fill-color": layerColour,
            "fill-antialias": false,
            "fill-opacity": 0.5
          }
        });

        map.on("mouseover", layerID, function(e) {
          map.setPaintProperty(layerID, "fill-opacity", 0.8);
          var text = "LSALT: " + lsaltGrid["lsalt-100ft"];
          $('#mouseover-summary-lsalt-grid').text(text);
        });

        map.on("mouseleave", layerID, function(e) {
          map.setPaintProperty(layerID, "fill-opacity", 0.5);
        });
      });
    });
  });
};
