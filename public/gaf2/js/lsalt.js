document.lsaltData = {};

function updateLSALT(gafAreaCode) {
  var lsaltData = document.lsaltData;

  if (gafAreaCode != "QLD-S") {
    return;
  }

  $.get("/json/lsalt-" + gafAreaCode + ".json?" + new Date().getTime(), function (data) {
    lsaltData[gafAreaCode] = data;
  });
};

// map.on('load', function () {
//     var gafAreaCode = "QLD-S";
//     $.get("/json/lsalt-" + gafAreaCode + ".json?" + new Date().getTime(), function (data) {
//       // TODO: better way to wait for area sources to be defined
//       while (areaSources[areaCode] === undefined) {
//         sleep(100);
//       }

//       var gafAreaSource = map.getSource("gaf-" + gafAreaCode);
//       while (gafAreaSource === undefined) {
//         sleep(100);
//         var gafAreaSource = map.getSource("gaf-" + gafAreaCode);
//       }
//       var gafAreaPolygon = turf.polygon([gafAreaSource._data.geometry.coordinates]);

//       data.forEach(lsaltGrid => {
//         var grid = lsaltGrid["grid"]
//         var lsalt = lsaltGrid["lsalt-100ft"];
//         var baseID = randomID();

//         var lsaltPolygon = turf.polygon([grid]);

//         var lsaltIntersection = turf.intersect(gafAreaPolygon, lsaltPolygon)
//         if (lsaltIntersection == undefined) {
//           console.log("lsalt grid outside area: ", lsaltGrid);
//           return;
//         }

//         map.addLayer({
//           "id": "lsalt-" + baseID,
//           "type": "line",
//           "source": {
//             "type": "geojson", "data": {
//               "type": "Feature",
//               "properties": {},
//               "geometry": {
//                 "type": "LineString",
//                 "coordinates": grid
//               }
//             }
//           },
//           "layout": {
//             "line-join": "round", "line-cap": "round"
//           },
//           "paint": {
//             "line-color": "#888", "line-width": 1
//           }
//         });
//       });
//     });
//   });
// });