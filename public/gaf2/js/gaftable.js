function gafTable() {
  return $("#gaf-table");
}

function updateGAFTableFromVisibleAreas() {
  var visibleMajorAreas = majorAreas(mapAreasInCurrentView());
  var visibleAreaGroupClasses = {};
  visibleMajorAreas.forEach(mapMajorArea => {
    visibleAreaGroupClasses[`gaf-${mapMajorArea.gafAreaCodeAndGroup()}`] = true;
  });

  gafTable().find("table tr").each(function() {
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

  var tbody = $("#gaf-table table tbody");
  majorMapArea.wxConds().forEach((wxCond, index) => {
    var row = $(`<tr>`);
    row.addClass(`gaf-${majorMapArea.gafAreaCodeAndGroup()}`);

    if (index === 0) {
      var areaCol = $(`<td>`);
      areaCol.attr("rowspan", wxCondsCount);
      areaCol.text(`${majorMapArea.gafAreaCode()} - ${majorMapArea.mapLabel()}`);
      areaCol.appendTo(row);
    }

    var surfaceVisCol = $(`<td>`);
    surfaceVisCol.text(wxCond["surface-vis-wx"]["text"]);
    surfaceVisCol.appendTo(row);

    var cloudIceCol = $(`<td>`);
    wxCond["cloud-ice-turb"].forEach(cloudIce => {
      var cloudIcePart = $(`<div>`);
      if (cloudIce["sub-areas-mentioned"] !== undefined) {
        cloudIce["sub-areas-mentioned"].forEach(subareaLabel => {
          cloudIcePart.addClass(`subarea-mentioned-${subareaLabel}`);
        })
      }
      cloudIcePart.text(cloudIce["text"]);
      cloudIcePart.appendTo(cloudIceCol);
    });
    cloudIceCol.appendTo(row);

    if (index === 0) {
      var freezingLevelCol = $(`<td>`);
      freezingLevelCol.attr("rowspan", wxCondsCount);
      freezingLevelCol.text(majorMapArea.freezingLevel());
      freezingLevelCol.appendTo(row);
    }

    row.appendTo(tbody);
  });
}
