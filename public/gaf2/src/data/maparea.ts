import * as gafarea from './oldgafarea';
import * as mapui from '../mapui';
import * as theme from '../theme';
import * as maparearender from '../render/maparea';
import * as turf from "@turf/helpers";

export type MapArea = MajorArea | SubArea;

abstract class MapAreaBase {
  // QLD-S, NSW-E
  gafAreaCode: string;
  gafArea: gafarea.CommonArea;
  _uuid: string;
  _turfPolygon: turf.Feature<turf.Polygon, turf.Properties>;

  constructor(gafAreaCode: string, gafArea: gafarea.CommonArea) {
    this.gafAreaCode = gafAreaCode;
    this.gafArea = gafArea;
  }

  uuid(): string {
    if (this._uuid === undefined) {
      this._uuid = '_' + Math.random().toString(36).substr(2, 9);
    }
    return this._uuid;
  }

  boundaryPoints() { return this.gafArea["boundary"]["points"]; }
  turfPolygon() : turf.Feature<turf.Polygon, turf.Properties> {
    if (this._turfPolygon === undefined) {
      this._turfPolygon = turf.polygon([this.boundaryPoints()]);
    }
    return this._turfPolygon;
  }

  asFeature() : turf.Feature<turf.Polygon, turf.Properties> {
    return {
      "type": "Feature",
      "properties": {
        "mapLayerID": this.mapLayerID()
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [this.boundaryPoints()]
      }
    };
  }

  cloudBaseColor() : string {
    var areaCloudLayerBase = this.cloudBase() === undefined ? 10000 : this.cloudBase();
    var areaCloudLayerBaseCode = Math.round(areaCloudLayerBase / 1000);
    var colorIndex = Math.min(3, Math.max(0, areaCloudLayerBaseCode));
    return theme.current().cssHeightColors[colorIndex];
  }

  cloudBase() { return this.gafArea.day_cloud_base; }

  abstract areaGroup() : string;
  abstract gafAreaCodeAndGroup() : string;
  abstract majorArea() : MajorArea;
  abstract isSubArea() : boolean;
  abstract freezingLevel() : string;
  abstract mapLabel() : string;
  abstract mapLayerID() : string;

}

export class MajorArea extends MapAreaBase {
  gafMajorArea: gafarea.Area;

  // gafAreaCode - "QLD-S"
  // gafArea - "{"area-id":"A","wx-cond":[{"surface-vis-wx":{"text":">10KM NIL","surface-vis":10000},"cloud-ice-turb":[{"text":"BKN ST 1500/2500FT LAND A1 ONLY TL 02Z","sub-areas-mentioned":["A1"],"parsed":{"cloud":{"amount":"BKN","type":"ST","base":1500,"top":2500}}},{"text":"SCT CU/SC 3000/10000FT, BKN A1 TL 02Z","sub-areas-mentioned":["A1"],"parsed":{"cloud":{"amount":"SCT","type":"CU/SC","base":3000,"top":10000}}}]},{"surface-vis-wx":{"text":"5000M ISOL FU BLW 8000FT LAND","surface-vis":5000},"cloud-ice-turb":[]},{"surface-vis-wx":{"text":"3000M ISOL SHRA, SCT SEA","surface-vis":3000},"cloud-ice-turb":[{"text":"ISOL TCU 2500/ABV10000FT SEA","parsed":{"cumulus":{"amount":"ISOL","type":"TCU","base":2500,"top":10000}}},{"text":"BKN ST 0800/2500FT","parsed":{"cloud":{"amount":"BKN","type":"ST","base":800,"top":2500}}},{"text":"BKN CU/SC 2500/10000FT","parsed":{"cloud":{"amount":"BKN","type":"CU/SC","base":2500,"top":10000}}}]},{"surface-vis-wx":{"text":"2000M SCT DZ LAND S OF YMIM TL 02Z","surface-vis":2000},"cloud-ice-turb":[{"text":"SCT ST 1000/3000FT","parsed":{"cloud":{"amount":"SCT","type":"ST","base":1000,"top":3000}}},{"text":"OVC SC 2000/9000FT","parsed":{"cloud":{"amount":"OVC","type":"SC","base":2000,"top":9000}}}]}],"freezing-level":"10000FT","boundary":{"points":[[152.4,-23.16],...,[152.87,-23.16]]},"cloud-base":1500,"cloud-top":10000,"sub-areas":[{"area-id":"A","sub-area-id":"A1","boundary":{"points":[[153.27,-24.28],...,[153.31,-24.38]]},"cloud-base":1500,"cloud-top":10000}]}"
  constructor(gafAreaCode: string, gafArea: gafarea.Area) {
    super(gafAreaCode, gafArea);
    this.gafMajorArea = gafArea;
  }

  // A, B, C
  areaGroup() { return this.gafArea.area_id; }

  // QLD-S-A, NSW-E-C, TAS-B
  gafAreaCodeAndGroup() { return `${this.gafAreaCode}-${this.areaGroup()}`; }

  majorArea() : MajorArea { return this; }
  isSubArea() { return false; }

  freezingLevel() { return this.gafMajorArea.freezing_level; }
  mapLabel() { return this.gafArea.area_id; }

  mapLayerID() {
    return "maparea" + "_" + this.gafAreaCode + "_" + this.mapLabel() + this.uuid();
  }

  // returns "QLD-S-A", "TAS-B"
  groupLabel() { return this.gafAreaCode + "-" + this.mapLabel(); }

  // Specific to MapMajorArea
  wxConds() { return this.gafMajorArea.wx_cond; }
}

export class SubArea extends MapAreaBase {
  mapArea: MajorArea;
  gafSubArea: gafarea.SubArea;

  // mapArea - instance of MapMajorArea
  // gafSubArea - {"area-id":"A","sub-area-id":"A1","boundary":{"points":[[153.27,-24.28],...,[153.31,-24.38]]},"cloud-base":1500,"cloud-top":10000}"
  constructor(mapArea: MajorArea, gafSubArea: gafarea.SubArea) {
    super(mapArea.gafAreaCode, gafSubArea);
    this.mapArea = mapArea;
    this.gafSubArea = gafSubArea;
  }

  majorArea() { return this.mapArea; }
  gafAreaCodeAndGroup() { return this.mapArea.gafAreaCodeAndGroup(); }
  isSubArea() { return true; }
  areaGroup() { return this.mapArea.areaGroup(); }
  freezingLevel() { return this.mapArea.freezingLevel(); }
  subAreaID() { return this.gafSubArea.sub_area_id; }
  mapLabel() { return this.subAreaID(); }

  mapLayerID() {
    return "mapsubarea" + "_" + this.gafAreaCode + "_" + this.mapLabel() + this.uuid();
  }

  // returns "QLD-S-A", "TAS-B"
  groupLabel() { return this.mapArea.groupLabel(); }
}

// Returns MapArea objects that are in current map view
export function inCurrentView() : MapArea[] {
  let map = mapui.map;

  let mapBounds = map.getBounds();
  let view = [map.project(mapBounds.getSouthWest()), map.project(mapBounds.getNorthEast())];
  let featuresInCurrentView = map.queryRenderedFeatures(view, {layers: maparearender.allOutlineLayerIDs});

  var layerIDsFound : { [s: string]: boolean} = {};
  return featuresInCurrentView.reduce((r, a) => {
    var mapLayerID = a.properties.mapLayerID;
    if (!layerIDsFound[mapLayerID]) {
      r.push(maparearender.byLayerID[mapLayerID]);
      layerIDsFound[mapLayerID] = true;
    }
    return r;
  }, [])
}

// majorAreas returns a unique list of MapMajorAreas for
// a list of MapMajorAreas + MapSubAreas
export function majorAreas(mapAreas : MapArea[]) : MajorArea[] {
  var majorAreasFound : { [s: string]: boolean } = {};
  return mapAreas.reduce((result, mapArea) => {
    var mapMajorArea = mapArea.majorArea();
    var mapLayerID = mapMajorArea.mapLayerID();
    if (!majorAreasFound[mapLayerID]) {
      majorAreasFound[mapLayerID] = true;
      result.push(mapMajorArea);
    }
    return result;
  }, []);
}

// gafAreaCodesFromMapAreas returns a unique list of GAF areas (QLD-S, NSW-E etc) for
// a list of MapMajorAreas + MapSubAreas
export function gafAreaCodesFromMapAreas(mapAreas: MapArea[]) {
  var gafAreaCodesFound: { [gafAreaCode: string]: boolean } = {};
  return mapAreas.reduce((result, mapArea) => {
    var gafAreaCode = mapArea.gafAreaCode;
    if (!gafAreaCodesFound[gafAreaCode]) {
      gafAreaCodesFound[gafAreaCode] = true;
      result.push(gafAreaCode);
    }
    return result;
  }, []);
}

