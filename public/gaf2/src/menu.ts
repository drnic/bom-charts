import * as controller from './controller';
import * as $ from 'jquery';

export function init() {
  update();
}

export function update() {
  updateMapTheme();
  updateController();
  updateURL();
}

function updateMapTheme() {
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

  menu.find("#timenow").text(`${new Date().getUTCHours()}Z`);

  $.get(`/api2/gafareas-dates`, (dates) => {
    let dateRanges : DateRange[] = dates;

    let currentFrom = new Date(dateRanges[0].from).getUTCHours();
    let nextFrom = new Date(dateRanges[1].from).getUTCHours();
    menu.find("a#period-current")
      .text(`current`)
      .data({"from": dateRanges[0].from, "till": dateRanges[0].until})
      .attr("href", `?vfr=${controller.vfr}&period=current&zoom=${controller.zoom}`);
    menu.find("a#period-next")
    .text(`next`)
    .data({"from": dateRanges[1].from, "till": dateRanges[1].until})
      .attr("href", `?vfr=${controller.vfr}&period=next&zoom=${controller.zoom}`);
  })
}

function updateURL() {
  var query = buildURLQuery();
  history.pushState(null, null, window.location.pathname + query)
}

function buildURLQuery() {
  return `?vfr=${controller.vfr}&period=${controller.period}&zoom=${controller.zoom}`;
}