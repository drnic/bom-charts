"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller = require("./controller");
const $ = require("jquery");
var map;
function init(_map) {
    map = _map;
    update();
}
exports.init = init;
function update() {
    updateMapTheme();
    updateMenuLinks();
    updateURL();
}
exports.update = update;
function updateMapTheme() {
    if (controller.vfrPrevious !== undefined) {
        $('body').removeClass(`vfr-${controller.vfrPrevious}`);
    }
    if (controller.periodPrevious !== undefined) {
        $('body').removeClass(`period-${controller.periodPrevious}`);
    }
    $('body').addClass(`vfr-${controller.vfr}`);
    $('body').addClass(`period-${controller.period}`);
}
function updateMenuLinks() {
    var menu = $("p#menu");
    menu.find("a#day-vfr").attr("href", `?vfr=day&period=${controller.period}`).click(function () {
        controller.setVFR(controller.VFR.day);
        return false;
    });
    menu.find("a#night-vfr").attr("href", `?vfr=night&period=${controller.period}`).click(function () {
        controller.setVFR(controller.VFR.night);
        return false;
    });
    menu.find("a#period-current").attr("href", `?vfr=${controller.vfr}&period=current`).click(function () {
        controller.setPeriod(controller.Period.current);
        return false;
    });
    menu.find("a#period-next").attr("href", `?vfr=${controller.vfr}&period=next`).click(function () {
        controller.setPeriod(controller.Period.next);
        return false;
    });
}
function updateURL() {
    var query = `?vfr=${controller.vfr}&period=${controller.period}`;
    history.pushState(null, null, window.location.pathname + query);
}
