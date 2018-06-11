import * as $ from 'jquery';
import * as maparea from "./maparea";
import * as gafarearender from "../render/gafarea";
import * as gaftablerender from "../render/gaftable";
import * as maparearender from "../render/maparea";
import * as controller from '../controller';

export var gafAreaCodes = ["WA-N", "WA-S", "NT", "QLD-N", "QLD-S", "SA", "NSW-W", "NSW-E", "VIC", "TAS"];

export var gafData: { [gafAreaCode: string]: GAFPeriods} = {};
export var combinedMapArea : { [s: string] : maparea.MapArea[] } = {};

export function update() {
  fetchAndRender(controller.period);
}

// Just an idea for loading data into gafData structure
export function fetchAndRender(period: controller.Period) {
  maparearender.removeAllLayers();

  gafAreaCodes.forEach((gafAreaCode: string) => {
    if (gafData[gafAreaCode] === undefined || gafData[gafAreaCode][period] === undefined) {
      $.get(`/api/gafarea/${gafAreaCode}/${period}.json`, function(forecastData: GAFAreaForecast) {
        gafData[gafAreaCode] = gafData[gafAreaCode] || {current: undefined, next: undefined};
        if (period == controller.Period.current) {
          gafData[gafAreaCode].current = forecastData;
        } else {
          gafData[gafAreaCode].next = forecastData;
        }
        render(forecastData);
      })
    } else {
      let forecastData = gafData[gafAreaCode].current;
      if (period == controller.Period.next) {
        forecastData = gafData[gafAreaCode].next;
      }
      render(forecastData);
    }
  });
}

function render(areaForecast: GAFAreaForecast) {
  gafarearender.setupGAFBoundary(areaForecast.gaf_area_id, areaForecast.boundary);

  areaForecast.areas.forEach((gafarea: Area) => {
    let majorArea = new maparea.MajorArea(areaForecast.gaf_area_id, gafarea);
    combinedMapArea[majorArea.gafAreaCodeAndGroup()] = [majorArea];

    gaftablerender.addGAFArea(majorArea);
    maparearender.setupMapFill(majorArea);

    majorArea.gafMajorArea.sub_areas.forEach((subarea: SubArea) => {
      let mapSubArea = new maparea.SubArea(majorArea, subarea);
      combinedMapArea[majorArea.gafAreaCodeAndGroup()].push(mapSubArea);

      maparearender.setupMapFill(mapSubArea);
    });
  });
}

export interface GAFPeriods {
  current: GAFAreaForecast;
  next: GAFAreaForecast;
}

export interface GAFAreaForecast {
  page_code: string;
  gaf_area_id: string;
  from: Date;
  till: Date;
  issued_at: Date;
  standard_inclusion: string;
  areas: Area[];
  boundary: Boundary;
}

export interface Boundary {
  points: number[][];
}

export interface CloudLayer {
    amount: string;
    type: string;
    base: number;
    top: number;
    night_only_base: number;
    night_only_top: number;
    cumulus: boolean;
}

export interface SurfaceVisWx {
    text: string;
    surface_vis: number;
    sub_areas_mentioned: string[];
}

export interface CloudIceTurb {
    text: string;
    parsed: ParsedCloudLayer;
    sub_areas_mentioned: string[];
}

export interface ParsedCloudLayer {
  cloud: CloudLayer;
}

export interface WxCond {
    surface_vis_wx: SurfaceVisWx;
    cloud_ice_turb: CloudIceTurb[];
}

export interface Area {
    area_id: string;
    wx_cond: WxCond[];
    freezing_level: string;
    boundary: Boundary;
    day_cloud_base: number;
    day_cloud_top: number;
    night_cloud_base: number;
    night_cloud_top: number;
    sub_areas: SubArea[];
}

export interface SubArea {
  area_id: string;
  sub_area_id: string;
  boundary: Boundary;
  day_cloud_base: number;
  day_cloud_top: number;
  night_cloud_base: number;
  night_cloud_top: number;
}

export interface CommonArea {
  area_id: string;
  boundary: Boundary;
  day_cloud_base: number;
  day_cloud_top: number;
  night_cloud_base: number;
  night_cloud_top: number;
}