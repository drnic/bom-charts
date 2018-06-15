import * as url from './helpers/url';
import * as menu from './menu';
import * as mapui from './mapui';
import * as gafarea from './gafarea';
import * as mapboxgl from "mapbox-gl";

export enum VFR {
  day = "day",
  night = "night",
}

export enum Period {
  current = "current",
  next = "next",
}

export var zoom = parseInt(url.getUrlParameter("zoom") || "6", 10);
export var vfr = url.getUrlParameter("vfr") == "night" ? VFR.night : VFR.day;
export var period = url.getUrlParameter("period") == "next" ? Period.next : Period.current;
export var periodPrevious : Period;
export var periodChanged = true;

var map: mapboxgl.Map;
export function init(_map: mapboxgl.Map) {
  map = _map;
  menu.update();
}

export function setPeriod(_period: Period) {
  periodPrevious = period;
  period = _period;
  periodChanged = (periodPrevious == period);
  menu.update();

  // Style not changing, so do not need to re-do:
  // * mapui.updateStyle();
}

export function isNightVFR() : boolean {
  return vfr == VFR.night;
}