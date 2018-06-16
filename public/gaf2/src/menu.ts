import * as controller from './controller';
import * as $ from 'jquery';
import * as mapboxgl from "mapbox-gl";
import * as dateformat from "dateformat";

var map: mapboxgl.Map;

export function init(_map: mapboxgl.Map) {
  map = _map;

  update();
}

export function update() {
  updateMapTheme();
  updateController();
  updateURL();
}

function updateMapTheme() {
  if (controller.periodPrevious !== undefined) {
    $('body').removeClass(`period-${controller.periodPrevious}`);
  }
  $('body').addClass(`vfr-${controller.vfr}`);
  $('body').addClass(`period-${controller.period}`);
}

export interface DateRange {
  from: string | Date;
  until: string | Date;
}
export let dateRanges : DateRange[];

function updateController() {
  var menu = $("p#menu")
  menu.find("a#day-vfr").attr("href", `?vfr=day&period=${controller.period}y&zoom=${controller.zoom}`);
  menu.find("a#night-vfr").attr("href", `?vfr=night&period=${controller.period}&zoom=${controller.zoom}`);

  menu.find("#timenow")
    .text(dateformat(new Date(), "HH'Z'"));
  $.get(`/api2/gafareas-dates`, (dates) => {
    let dateRanges : DateRange[] = dates;

    let currentFrom = new Date(dateRanges[0].from);
    let nextFrom = new Date(dateRanges[1].from);
    menu.find("a#period-current")
      .text(dateformat(currentFrom, "HH'Z'"))
      .attr("href", `?vfr=${controller.vfr}&period=current`);
    menu.find("a#period-next")
      .text(dateformat(nextFrom, "HH'Z'"))
      .attr("href", `?vfr=${controller.vfr}&period=next`);
  })
}

function updateURL() {
  var query = `?vfr=${controller.vfr}&period=${controller.period}&zoom=${controller.zoom}`
  history.pushState(null, null, window.location.pathname + query)
}