"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("./helpers/url");
const menu = require("./menu");
const mapui = require("./mapui");
const gafarea = require("./data/gafarea");
var VFR;
(function (VFR) {
    VFR["day"] = "day";
    VFR["night"] = "night";
})(VFR = exports.VFR || (exports.VFR = {}));
var Period;
(function (Period) {
    Period["current"] = "current";
    Period["next"] = "next";
})(Period = exports.Period || (exports.Period = {}));
exports.vfr = url.getUrlParameter("vfr") == "night" ? VFR.night : VFR.day;
exports.period = url.getUrlParameter("period") == "next" ? Period.next : Period.current;
exports.vfrChanged = true;
exports.periodChanged = true;
var map;
function init(_map) {
    map = _map;
    menu.update();
    gafarea.update();
}
exports.init = init;
function setVFR(_vfr) {
    exports.vfrPrevious = exports.vfr;
    exports.vfr = _vfr;
    exports.vfrChanged = (exports.vfrPrevious != exports.vfr);
    exports.periodChanged = false;
    menu.update();
    if (exports.vfrChanged) {
        mapui.updateStyle();
        gafarea.update();
    }
}
exports.setVFR = setVFR;
function setPeriod(_period) {
    exports.periodPrevious = exports.period;
    exports.period = _period;
    exports.periodChanged = (exports.periodPrevious == exports.period);
    exports.vfrChanged = false;
    menu.update();
    // Style not changing, so do not need to re-do:
    // * mapui.updateStyle();
    // * gafarea.update();
}
exports.setPeriod = setPeriod;
