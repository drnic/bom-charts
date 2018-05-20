$(function() {
  // from https://stackoverflow.com/a/21903119/36170
  var getUrlParameter = function getUrlParameter(sParam) {
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
  if (gafArea === undefined) {
    console.log("Show map to allow selection of GAF")
  } else {
    var gafImage = $('<img>');
    gafImage.attr("src", "http://www.bom.gov.au/fwo/aviation/IDY42081.png");
    gafImage.appendTo($('#contents'));
  }
});