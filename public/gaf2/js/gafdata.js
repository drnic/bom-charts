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

gafVFROptions.forEach(_vfr => {
  gafData[_vfr] = {}

  gafPeriods.forEach(_period => {
    gafData[_vfr][_period] = {}

    gafAreaCodes.forEach(gafAreaCode => {
      $.getJSON(`/api/gafarea/${gafAreaCode}/${_period}/${_vfr}.json`, function(data) {
        gafData[_vfr][_period][gafAreaCode] = data;
        if (_vfr == vfr && _period == period) {
          $(document).ready(function () {
            map.on("load", function() {
              setupMapForGAFArea(gafAreaCode, data);
            })
          });
        }
      });
    });
  });
});
