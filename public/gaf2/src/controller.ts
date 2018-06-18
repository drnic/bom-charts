import * as url from './helpers/url';
import * as gafarea from './gafarea';
import * as lsalt from './lsalt';
import * as mapui from './mapui';
import * as menu from './menu';
import * as wait from './helpers/wait';
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

export function init() {
  menu.update();
}

export function isNightVFR() : boolean {
  return vfr == VFR.night;
}

export function setCurrentLocation(lat: number, long: number) {
  currentLocation = [long, lat];

  // TODO: need a better way to run #selectFeature after gafarea/lsalt ready
  wait.delay(1000).then(() => {
    var gafareaFeature = mapui.map.queryRenderedFeatures(currentLocation, { layers: ["gafareas"] })[0];
    console.log(gafareaFeature)
    gafarea.selectFeature(gafareaFeature);

    var lsaltFeature = mapui.map.queryRenderedFeatures(currentLocation, { layers: ["lsalt"] })[0];
    lsalt.selectFeature(lsaltFeature);
  })
}

export function zoomToCurrentLocation() {
  mapui.map.jumpTo({zoom: zoom, center: currentLocation});
}