import * as $ from 'jquery';
import * as gafarearender from "../render/gafarea";
import * as controller from '../controller';
export var gafAreaCodes = ["WA-N", "WA-S", "NT", "QLD-N", "QLD-S", "SA", "NSW-W", "NSW-E", "VIC", "TAS"];
export var gafData = {};
export function update() {
    fetchAndRender(controller.period);
}
// Just an idea for loading data into gafData structure
export function fetchAndRender(period) {
    gafAreaCodes.forEach((gafAreaCode) => {
        if (gafData[gafAreaCode] === undefined || gafData[gafAreaCode][period] === undefined) {
            $.get(`/api/gafarea/${gafAreaCode}/${period}.json`, function (forecastData) {
                console.log(`loaded /api/gafarea/${gafAreaCode}/${period}.json`);
                gafData[gafAreaCode] = gafData[gafAreaCode] || { current: undefined, next: undefined };
                if (period == controller.Period.current) {
                    gafData[gafAreaCode].current = forecastData;
                }
                else {
                    gafData[gafAreaCode].next = forecastData;
                }
                render(forecastData);
            });
        }
        else {
            let forecastData = gafData[gafAreaCode].current;
            if (period == controller.Period.next) {
                forecastData = gafData[gafAreaCode].next;
            }
            render(forecastData);
        }
    });
}
function render(areaForecast) {
    gafarearender.setupGAFBoundary(areaForecast.gaf_area_id, areaForecast.boundary);
}
