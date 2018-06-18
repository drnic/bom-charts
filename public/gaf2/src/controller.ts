import * as url from './helpers/url';
import * as menu from './menu';
import * as currentlocation from './currentlocation';
import * as mapboxgl from 'mapbox-gl';
import * as turf from '@turf/helpers';

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

export var currentLocation : turf.Position;

var map: mapboxgl.Map;
export function init(_map: mapboxgl.Map) {
  map = _map;
  menu.update();
}

export function isNightVFR() : boolean {
  return vfr == VFR.night;
}

export function setCurrentLocation(lat: number, long: number) {
  currentLocation = [long, lat];

  currentlocation.update();
}

export function zoomToCurrentLocation() {
  map.jumpTo({zoom: zoom, center: currentLocation});
}