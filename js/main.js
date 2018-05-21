$(function() {
  $("#area-map").maphilight({strokeColor: '297dd3', fade: false});

  // Based off http://www.bom.gov.au/scripts/aviation/forecasts/gaf-pub.js
  function getGAFforArea(area) {
    var nowUTCHours = new Date().getUTCHours();

    WAN    = ['IDY42054', 'IDY42055', 'IDY42056', 'IDY42057']; //area id #0 (WA - North)
    WAS    = ['IDY42050', 'IDY42051', 'IDY42052', 'IDY42053']; //area id #1 (WA - South)
    NT     = ['IDY42058', 'IDY42059', 'IDY42060', 'IDY42061']; //area id #2 (NT)
    QLDN   = ['IDY42074', 'IDY42075', 'IDY42076', 'IDY42077']; //area id #3 (QLD - North)
    QLDS   = ['IDY42078', 'IDY42079', 'IDY42080', 'IDY42081']; //area id #4 (QLD - South
    SA     = ['IDY42062', 'IDY42063', 'IDY42064', 'IDY42065']; //area id #5 (SA)
    NSWW   = ['IDY42086', 'IDY42087', 'IDY42088', 'IDY42089']; //area id #6 (NSW - West)
    NSWE   = ['IDY42082', 'IDY42083', 'IDY42084', 'IDY42085']; //area id #7 (NSW - East)
    VIC    = ['IDY42066', 'IDY42067', 'IDY42068', 'IDY42069']; //area id #8 (VIC)
    TAS    = ['IDY42070', 'IDY42071', 'IDY42072', 'IDY42073']; //area id #9 (TAS)
    areaMapping = {
      'WA-N':  WAN,
      'WA-S':  WAS,
      'NT':   NT,
      'QLD-N': QLDN,
      'QLD-S': QLDS,
      'SA':   SA,
      'NSW-W': NSWW,
      'NSW-E': NSWE,
      'VIC':  VIC,
      'TAS':  TAS,
    }
    if (areaMapping[area] === undefined) {
      return undefined;
    }

    // algorithm from assign_products function in gaf-pub.js
    if (nowUTCHours => 5 && nowUTCHours < 11) {
      return areaMapping[area][0];
    } else if (nowUTCHours => 11 && nowUTCHours < 17) {
      return areaMapping[area][1];
    } else if (nowUTCHours => 17 && nowUTCHours < 23) {
      return areaMapping[area][2];
    } else {
      return areaMapping[area][3];
    }
  }

  function addStatusBar() {
    var statusBar = $("<p/>");
    statusBar.addClass("status-bar");
    statusBar.html('Forecast valid for <span id="forecast-valid" /> | UTC <span id="utc-now" /></p>');
    statusBar.appendTo($("#contents"));

    var now = new Date();
    $("#utc-now").text(now.getUTCHours() + ":" + now.getUTCMinutes());

    var forecastEndTimes = [5, 11, 17, 23];
    var hoursRemaining = now.getUTCHours() % 6;
    if (hoursRemaining === 0) {
      var timeRemaining = 60 - now.getUTCMinutes();
      $("#forecast-valid").text(timeRemaining + " mins");
      statusBar.addClass("forecast-almost-expired");
    } else if (hoursRemaining === 1) {
      var timeRemaining = 120 - now.getUTCMinutes();
      $("#forecast-valid").text(timeRemaining + " mins");
      statusBar.addClass("forecast-expiring");
    } else {
      $("#forecast-valid").text(hoursRemaining + "+ hr");
    }
  }

  function addAreaMobileIcon(area) {
    $('<link rel="icon" sizes="128x128" href="../images/icons/' + area + '.png">').appendTo("head");
    $('<link rel="apple-touch-icon" href="../images/icons/' + area + '.png" />').appendTo("head");
  }

  function updateTitleForGAF(area) {
    $("title").text("BOM GAF " + area);
  }

  // From https://stackoverflow.com/a/21903119/36170
  function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
  };


  var gafArea = getUrlParameter('area');
  var gafImageCode = getGAFforArea(gafArea);
  if (gafImageCode === undefined) {
    $("#area-map").show();
  } else {
    $("#contents").html("");
    updateTitleForGAF(gafArea);
    addStatusBar();

    var gafImage = $("<img>");
    gafImage.addClass("fullscreen");
    gafImage.attr("src", "http://www.bom.gov.au/fwo/aviation/" + gafImageCode + ".png");
    gafImage.appendTo($("#contents"));

    $("html,body").css("margin", 0);
    $("html,body").css("height", "100%");
  }
});