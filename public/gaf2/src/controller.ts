import * as url from './helpers/url';
import * as menu from './menu';
import * as mapui from './mapui';
import * as gafarea from './data/gafarea';
// import * as maparea from './data/maparea';
import * as mapboxgl from "mapbox-gl";

export enum VFR {
  day = "day",
  night = "night",
}

export enum Period {
  current = "current",
  next = "next",
}

export var vfr = url.getUrlParameter("vfr") == "night" ? VFR.night : VFR.day;
export var period = url.getUrlParameter("period") == "next" ? Period.next : Period.current;
export var vfrPrevious : VFR;
export var periodPrevious : Period;
export var vfrChanged = true;
export var periodChanged = true;

var map: mapboxgl.Map;
export function init(_map: mapboxgl.Map) {
  map = _map;
  menu.update();
  gafarea.update();
}

export function setVFR(_vfr: VFR) {
  vfrPrevious = vfr;
  vfr = _vfr;
  vfrChanged = (vfrPrevious != vfr);
  periodChanged = false;
  menu.update();
  if (vfrChanged) {
    mapui.updateStyle();
    gafarea.update();
  }
}

export function setPeriod(_period: Period) {
  periodPrevious = period;
  period = _period;
  periodChanged = (periodPrevious == period);
  vfrChanged = false;
  menu.update();
  gafarea.update();

  // Style not changing, so do not need to re-do:
  // * mapui.updateStyle();
}

