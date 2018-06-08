"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// From https://stackoverflow.com/a/21903119/36170
function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)), sURLVariables = sPageURL.split('&'), sParameterName, i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? "" : sParameterName[1];
        }
    }
}
exports.getUrlParameter = getUrlParameter;
;
