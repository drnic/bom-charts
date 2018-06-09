"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var theme = require("./theme");
var controller = require("./controller");
var $ = require("jquery");
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
function updateMapTheme() {
    if (controller.vfrPrevious !== undefined) {
        $('body').removeClass("vfr-" + controller.vfrPrevious);
    }
    if (controller.periodPrevious !== undefined) {
        $('body').removeClass("period-" + controller.periodPrevious);
    }
    $('body').addClass("vfr-" + controller.vfr);
    $('body').addClass("period-" + controller.period);
    if (controller.vfrChanged) {
        if (controller.vfr == "night") {
            map.setStyle('mapbox://styles/mapbox/dark-v9');
            theme.theme.textColor = "#eee";
        }
        else {
            map.setStyle('mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g');
            theme.theme.textColor = "#000";
        }
    }
}
function updateMenuLinks() {
    var menu = $("p#menu");
    menu.find("a#day-vfr").attr("href", "?vfr=day&period=" + controller.period).click(function () {
        controller.setVFR("day");
        update();
        return false;
    });
    menu.find("a#night-vfr").attr("href", "?vfr=night&period=" + controller.period).click(function () {
        controller.setVFR("night");
        update();
        return false;
    });
    menu.find("a#period-current").attr("href", "?vfr=" + controller.vfr + "&period=current").click(function () {
        controller.setPeriod("current");
        update();
        return false;
    });
    menu.find("a#period-next").attr("href", "?vfr=" + controller.vfr + "&period=next").click(function () {
        controller.setPeriod("next");
        update();
        return false;
    });
}
function updateURL() {
    var query = "?vfr=" + controller.vfr + "&period=" + controller.period;
    history.pushState(null, null, window.location.pathname + query);
}
