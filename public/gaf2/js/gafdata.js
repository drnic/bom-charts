var gafData = {}

// prioritize loading of currently selected modes
var gafVFROptions = ["day", "night"];
if (vfr == "night") {
  gafVFROptions = ["night", "day"];
}

var gafPeriods = ["current", "next"];
if (period == "next") {
  gafPeriods = ["next", "current"];
}

$(document).ready(function () {
  map.on("load", function() {
    gafData[vfr] = {}
    gafData[vfr][period] = {}
    gafAreaCodes.forEach(gafAreaCode => {
      $.getJSON(`/api/gafarea/${gafAreaCode}/${period}/${vfr}.json`, function(data) {
        gafData[vfr][period][gafAreaCode] = data;
          setupMapForGAFArea(gafAreaCode, data);
        });
    });
  });
  // For future:
  // map.on("load", function() {
  //   gafVFROptions.forEach(_vfr => {
  //     gafData[_vfr] = {}

  //     gafPeriods.forEach(_period => {
  //       gafData[_vfr][_period] = {}

  //       gafAreaCodes.forEach(gafAreaCode => {
  //         $.getJSON(`/api/gafarea/${gafAreaCode}/${_period}/${_vfr}.json`, function(data) {
  //           gafData[_vfr][_period][gafAreaCode] = data;
  //           if (_vfr == vfr && _period == period) {
  //                 setupMapForGAFArea(gafAreaCode, data);
  //               }
  //           });
  //       });
  //     });
  //   });
  // });
});
