function updateGAFTableFromVisibleAreas() {
  var visibleMajorAreas = majorAreas(mapAreasInCurrentView());
  var visibleAreaGroupClasses = {};
  visibleMajorAreas.forEach(mapMajorArea => {
    visibleAreaGroupClasses[`gaf-${mapMajorArea.gafAreaCodeAndGroup()}`] = true;
  });

  $("#gaf-table table tr").each(function() {
    var classes = $(this).attr("class");
    if (classes !== undefined) {
      classes.split(/\s+/).forEach(className => {
        if (className.startsWith(`gaf-`)) {
          if (visibleAreaGroupClasses[className]) {
            $(this).show();
          } else {
            $(this).hide();
          }
        }
      });
    }
  });
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
    var row = `<tr class="gaf-${majorMapArea.gafAreaCodeAndGroup()}">`;
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
