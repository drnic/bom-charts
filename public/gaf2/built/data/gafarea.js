"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
function init() {
    $.get("/api/gafarea/NSW-E/current.json", function (forecastData) {
        console.log(forecastData.page_code);
        console.log(forecastData.areas[0].sub_areas[0]);
    });
}
exports.init = init;
