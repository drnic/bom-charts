import * as url from './helpers/url';
import * as gafarea from './gafarea';
import * as lsalt from './lsalt';
import * as mapui from './mapui';
import * as menu from './menu';
import * as wait from './helpers/wait';
import * as addtohomescreen from "./addtohomescreen";

import { GeoJSONSource, GeoJSONGeometry } from 'mapbox-gl';
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
export var currentMapAreaFeature : GeoJSON.Feature<GeoJSONGeometry>;

export function init() {
  menu.update();
}

export function isNightVFR() : boolean {
  return vfr == VFR.night;
}

export function setCurrentLocation(lat: number, long: number) {
  currentLocation = [long, lat];

  // TODO: need a better way to run #selectFeature after gafarea/lsalt ready
  wait.until(() => {
    return !!mapui.map.queryRenderedFeatures(currentLocation, { layers: ["gafareas"] })[0];
  }, () => {
    currentMapAreaFeature = mapui.map.queryRenderedFeatures(currentLocation, { layers: ["gafareas"] })[0];
    gafarea.selectFeature(currentMapAreaFeature);

    addtohomescreen.update();
  });

  wait.until(() => {
    return !!mapui.map.queryRenderedFeatures(currentLocation, { layers: ["lsalt"] })[0];
  }, () => {
    var feature = mapui.map.queryRenderedFeatures(currentLocation, { layers: ["lsalt"] })[0];
    lsalt.selectFeature(feature);
  });
}

export function zoomToCurrentLocation() {
  mapui.map.jumpTo({zoom: zoom, center: currentLocation});
}