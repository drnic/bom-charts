import * as url from './helpers/url';
import * as mapboxgl from "mapbox-gl";

export var vfr = url.getUrlParameter("vfr") || "day";
export var period = url.getUrlParameter("period") || "current";
export var vfrPrevious : string;
export var periodPrevious : string;
export var vfrChanged = true;
export var periodChanged = true;

var map: mapboxgl.Map;
export function init(_map: mapboxgl.Map) {
  map = _map;
}

export function setVFR(_vfr: string) {
  vfrPrevious = vfr;
  vfr = _vfr;
  vfrChanged = (vfrPrevious != vfr);
  periodChanged = false;
}

export function setPeriod(_period: string) {
  periodPrevious = period;
  period = _period;
  periodChanged = (periodPrevious == period);
  vfrChanged = false;
}

