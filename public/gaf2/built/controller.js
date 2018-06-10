import * as url from './helpers/url';
import * as menu from './menu';
import * as mapui from './mapui';
import * as gafarea from './data/gafarea';
export var VFR;
(function (VFR) {
    VFR["day"] = "day";
    VFR["night"] = "night";
})(VFR || (VFR = {}));
export var Period;
(function (Period) {
    Period["current"] = "current";
    Period["next"] = "next";
})(Period || (Period = {}));
export var vfr = url.getUrlParameter("vfr") == "night" ? VFR.night : VFR.day;
export var period = url.getUrlParameter("period") == "next" ? Period.next : Period.current;
export var vfrPrevious;
export var periodPrevious;
export var vfrChanged = true;
export var periodChanged = true;
var map;
export function init(_map) {
    map = _map;
    menu.update();
    gafarea.update();
}
export function setVFR(_vfr) {
    vfrPrevious = vfr;
    vfr = _vfr;
    vfrChanged = (vfrPrevious != vfr);
    periodChanged = false;
    mapui.updateStyle();
    menu.update();
    gafarea.update();
}
export function setPeriod(_period) {
    periodPrevious = period;
    period = _period;
    periodChanged = (periodPrevious == period);
    vfrChanged = false;
    menu.update();
    gafarea.update();
}
