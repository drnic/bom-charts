function updateGAFTableFromVisibleAreas() {
  console.log(mapAreasInCurrentView());
  // addAreaToGAFTable(mapArea);

}

function addAreaToGAFTable(majorMapArea) {
  if ($("#gaf-table table").length === 0) {
    var table = $(`
    <table border="1">
      <thead>
        <tr><th>Area</th><th>Surface, Vis & Wx</th><th>Cloud, Icing, & Turbulance</th><th>Freezing level</th></tr>
      </thead>
      <tbody></tbody>
    </table>`);
    table.appendTo($("#gaf-table"));
  }
  var wxCondsCount = majorMapArea.wxConds().length;

  majorMapArea.wxConds().forEach((wxCond, index) => {
    var row = `<tr>`;
    if (index === 0) {
      row += `<td rowspan=${wxCondsCount}>
        ${majorMapArea.gafAreaCode()} - ${majorMapArea.mapLabel()}
      </td>`;
    }

    var surfaceVis = wxCond["surface-vis-wx"];
    row += `<td>${surfaceVis["text"]}</td>`;
    row += `<td>`;
    wxCond["cloud-ice-turb"].forEach(cloudIce => {
      row += `<div>${cloudIce["text"]}</div>`
    });
    row += `</td>`;

    if (index === 0) {
      row += `<td rowspan=${wxCondsCount}>
        ${majorMapArea.freezingLevel()}
      </td>`;
    }
    row += `</tr>`;
    $(row).appendTo($("#gaf-table table tbody"));
  });
}

// TODO: only show rows for visible GAF areas

// https://github.com/mapbox/mapbox-gl-js/issues/3888#issuecomment-270560065
// get airpots in current map view
function airportsInCurrentView() {
  var mapBounds = map.getBounds();
  var view = [map.project(mapBounds.getSouthWest()), map.project(mapBounds.getNorthEast())];
  return map.queryRenderedFeatures(view, {layers: ["airports"]});
}

// airportsInCurrentView().forEach(airport => {
//   console.log(airport.properties.title);
// })