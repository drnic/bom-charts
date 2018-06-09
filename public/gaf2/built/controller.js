"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url = require("./helpers/url");
exports.vfr = url.getUrlParameter("vfr") || "day";
exports.period = url.getUrlParameter("period") || "current";
exports.vfrChanged = true;
exports.periodChanged = true;
var map;
function init(_map) {
    map = _map;
}
exports.init = init;
function setVFR(_vfr) {
    exports.vfrPrevious = exports.vfr;
    exports.vfr = _vfr;
    exports.vfrChanged = (exports.vfrPrevious != exports.vfr);
    exports.periodChanged = false;
}
exports.setVFR = setVFR;
function setPeriod(_period) {
    exports.periodPrevious = exports.period;
    exports.period = _period;
    exports.periodChanged = (exports.periodPrevious == exports.period);
    exports.vfrChanged = false;
}
exports.setPeriod = setPeriod;
