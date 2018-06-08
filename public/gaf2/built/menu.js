"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url = require("./helpers/url");
var $ = require("jquery");
var theme = {
    textColor: "#eee",
};
$(function () {
    var vfr = url.getUrlParameter("vfr") || "day";
    var period = url.getUrlParameter("period") || "current";
    $('body').addClass("vfr-" + vfr);
    $('body').addClass("period-" + period);
    if (vfr == "night") {
        map.setStyle('mapbox://styles/mapbox/dark-v9');
        theme.textColor = "#eee";
    }
    else {
        theme.textColor = "#000";
    }
    var menu = $("p#menu");
    if (vfr == "night") {
        menu.find("a#day-vfr").attr("href", "?vfr=day&period=" + period);
    }
    else {
        menu.find("a#night-vfr").attr("href", "?vfr=night&period=" + period);
    }
    if (period == "next") {
        menu.find("a#period-current").attr("href", "?vfr=" + vfr + "&period=current");
    }
    else {
        menu.find("a#period-next").attr("href", "?vfr=" + vfr + "&period=next");
    }
});
