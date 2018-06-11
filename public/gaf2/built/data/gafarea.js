"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $ = require("jquery");
const gafarearender = require("../render/gafarea");
const controller = require("../controller");
exports.gafAreaCodes = ["WA-N", "WA-S", "NT", "QLD-N", "QLD-S", "SA", "NSW-W", "NSW-E", "VIC", "TAS"];
exports.gafData = {};
function update() {
    fetchAndRender(controller.period);
}
exports.update = update;
// Just an idea for loading data into gafData structure
function fetchAndRender(period) {
    exports.gafAreaCodes.forEach((gafAreaCode) => {
        if (exports.gafData[gafAreaCode] === undefined || exports.gafData[gafAreaCode][period] === undefined) {
            $.get(`/api/gafarea/${gafAreaCode}/${period}.json`, function (forecastData) {
                exports.gafData[gafAreaCode] = exports.gafData[gafAreaCode] || { current: undefined, next: undefined };
                if (period == controller.Period.current) {
                    exports.gafData[gafAreaCode].current = forecastData;
                }
                else {
                    exports.gafData[gafAreaCode].next = forecastData;
                }
                render(forecastData);
            });
        }
        else {
            let forecastData = exports.gafData[gafAreaCode].current;
            if (period == controller.Period.next) {
                forecastData = exports.gafData[gafAreaCode].next;
            }
            render(forecastData);
        }
    });
}
exports.fetchAndRender = fetchAndRender;
function render(areaForecast) {
    gafarearender.setupGAFBoundary(areaForecast.gaf_area_id, areaForecast.boundary);
}
