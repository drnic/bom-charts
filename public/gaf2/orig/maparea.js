"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var turf = require("@turf/helpers");
var MapAreaBase = /** @class */ (function () {
    function MapAreaBase(gafAreaCode, gafArea) {
        this.gafAreaCode = gafAreaCode;
        this.gafArea = gafArea;
    }
    MapAreaBase.prototype.uuid = function () {
        if (this._uuid === undefined) {
            this._uuid = '_' + Math.random().toString(36).substr(2, 9);
        }
        return this._uuid;
    };
    MapAreaBase.prototype.boundaryPoints = function () { return this.gafArea["boundary"]["points"]; };
    MapAreaBase.prototype.turfPolygon = function () {
        if (this._turfPolygon === undefined) {
            this._turfPolygon = turf.polygon([this.boundaryPoints()]);
        }
        return this._turfPolygon;
    };
    MapAreaBase.prototype.asFeature = function () {
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
    };
    MapAreaBase.prototype.cloudBaseColor = function () {
        var areaCloudLayerBase = this.cloudBase() === undefined ? 10000 : this.cloudBase();
        var areaCloudLayerBaseCode = Math.round(areaCloudLayerBase / 1000);
        var colorIndex = Math.min(3, Math.max(0, areaCloudLayerBaseCode));
        return cssHeightColors[colorIndex];
    };
    return MapAreaBase;
}());
exports.MapAreaBase = MapAreaBase;
var MapMajorArea = /** @class */ (function (_super) {
    __extends(MapMajorArea, _super);
    // gafAreaCode - "QLD-S"
    // gafArea - "{"area-id":"A","wx-cond":[{"surface-vis-wx":{"text":">10KM NIL","surface-vis":10000},"cloud-ice-turb":[{"text":"BKN ST 1500/2500FT LAND A1 ONLY TL 02Z","sub-areas-mentioned":["A1"],"parsed":{"cloud":{"amount":"BKN","type":"ST","base":1500,"top":2500}}},{"text":"SCT CU/SC 3000/10000FT, BKN A1 TL 02Z","sub-areas-mentioned":["A1"],"parsed":{"cloud":{"amount":"SCT","type":"CU/SC","base":3000,"top":10000}}}]},{"surface-vis-wx":{"text":"5000M ISOL FU BLW 8000FT LAND","surface-vis":5000},"cloud-ice-turb":[]},{"surface-vis-wx":{"text":"3000M ISOL SHRA, SCT SEA","surface-vis":3000},"cloud-ice-turb":[{"text":"ISOL TCU 2500/ABV10000FT SEA","parsed":{"cumulus":{"amount":"ISOL","type":"TCU","base":2500,"top":10000}}},{"text":"BKN ST 0800/2500FT","parsed":{"cloud":{"amount":"BKN","type":"ST","base":800,"top":2500}}},{"text":"BKN CU/SC 2500/10000FT","parsed":{"cloud":{"amount":"BKN","type":"CU/SC","base":2500,"top":10000}}}]},{"surface-vis-wx":{"text":"2000M SCT DZ LAND S OF YMIM TL 02Z","surface-vis":2000},"cloud-ice-turb":[{"text":"SCT ST 1000/3000FT","parsed":{"cloud":{"amount":"SCT","type":"ST","base":1000,"top":3000}}},{"text":"OVC SC 2000/9000FT","parsed":{"cloud":{"amount":"OVC","type":"SC","base":2000,"top":9000}}}]}],"freezing-level":"10000FT","boundary":{"points":[[152.4,-23.16],...,[152.87,-23.16]]},"cloud-base":1500,"cloud-top":10000,"sub-areas":[{"area-id":"A","sub-area-id":"A1","boundary":{"points":[[153.27,-24.28],...,[153.31,-24.38]]},"cloud-base":1500,"cloud-top":10000}]}"
    function MapMajorArea(gafAreaCode, gafArea) {
        return _super.call(this, gafAreaCode, gafArea) || this;
    }
    // A, B, C
    MapMajorArea.prototype.areaGroup = function () { return this.gafArea["area-id"]; };
    MapMajorArea.prototype.cloudBase = function () { return this.gafArea["cloud-base"]; };
    // QLD-S-A, NSW-E-C, TAS-B
    MapMajorArea.prototype.gafAreaCodeAndGroup = function () { return this.gafAreaCode + "-" + this.areaGroup(); };
    MapMajorArea.prototype.majorArea = function () { return this; };
    MapMajorArea.prototype.isSubArea = function () { return false; };
    MapMajorArea.prototype.freezingLevel = function () { return this.gafArea["freezing-level"]; };
    MapMajorArea.prototype.mapLabel = function () { return this.gafArea["area-id"]; };
    MapMajorArea.prototype.mapLayerID = function () {
        return "maparea" + "_" + this.gafAreaCode + "_" + this.mapLabel() + this.uuid();
    };
    // returns "QLD-S-A", "TAS-B"
    MapMajorArea.prototype.groupLabel = function () { return this.gafAreaCode + "-" + this.mapLabel(); };
    // Specific to MapMajorArea
    MapMajorArea.prototype.wxConds = function () { return this.gafArea["wx-cond"]; };
    return MapMajorArea;
}(MapAreaBase));
exports.MapMajorArea = MapMajorArea;
var MapSubArea = /** @class */ (function (_super) {
    __extends(MapSubArea, _super);
    // mapArea - instance of MapMajorArea
    // gafSubArea - {"area-id":"A","sub-area-id":"A1","boundary":{"points":[[153.27,-24.28],...,[153.31,-24.38]]},"cloud-base":1500,"cloud-top":10000}"
    function MapSubArea(mapArea, gafSubArea) {
        var _this = _super.call(this, mapArea.gafAreaCode, gafSubArea) || this;
        _this.mapArea = mapArea;
        return _this;
    }
    MapSubArea.prototype.majorArea = function () { return this.mapArea; };
    MapSubArea.prototype.gafAreaCodeAndGroup = function () { return this.mapArea.gafAreaCodeAndGroup(); };
    MapSubArea.prototype.isSubArea = function () { return true; };
    MapSubArea.prototype.areaGroup = function () { return this.mapArea.areaGroup(); };
    MapSubArea.prototype.freezingLevel = function () { return this.mapArea.freezingLevel(); };
    MapSubArea.prototype.subAreaID = function () { return this.gafArea["sub-area-id"]; };
    MapSubArea.prototype.mapLabel = function () { return this.gafArea["sub-area-id"]; };
    MapSubArea.prototype.cloudBase = function () { return this.gafArea["cloud-base"]; };
    MapSubArea.prototype.mapLayerID = function () {
        return "mapsubarea" + "_" + this.gafAreaCode + "_" + this.mapLabel() + this.uuid();
    };
    // returns "QLD-S-A", "TAS-B"
    MapSubArea.prototype.groupLabel = function () { return this.mapArea.groupLabel(); };
    return MapSubArea;
}(MapAreaBase));
exports.MapSubArea = MapSubArea;
// Returns Features for each MapMajorArea/MapSubArea in current map view
// note: may include duplicates
function mapAreaFeaturesInCurrentView() {
    var mapBounds = map.getBounds();
    var view = [map.project(mapBounds.getSouthWest()), map.project(mapBounds.getNorthEast())];
    return map.queryRenderedFeatures(view, { layers: mapAreasOutlineIDs });
}
// Returns MapArea objects that are in current map view
function mapAreasInCurrentView() {
    var features = mapAreaFeaturesInCurrentView();
    var layerIDsFound = {};
    return features.reduce(function (r, a) {
        var mapLayerID = a.properties.mapLayerID;
        if (!layerIDsFound[mapLayerID]) {
            mapArea = mapAreasByLayerID[mapLayerID];
            r.push(mapArea);
            layerIDsFound[mapLayerID] = true;
        }
        return r;
    }, []);
}
exports.mapAreasInCurrentView = mapAreasInCurrentView;
// majorAreas returns a unique list of MapMajorAreas for
// a list of MapMajorAreas + MapSubAreas
function majorAreas(mapAreas) {
    var majorAreasFound = {};
    return mapAreas.reduce(function (result, mapArea) {
        var mapMajorArea = mapArea.majorArea();
        var mapLayerID = mapMajorArea.mapLayerID();
        if (!majorAreasFound[mapLayerID]) {
            majorAreasFound[mapLayerID] = true;
            result.push(mapMajorArea);
        }
        return result;
    }, []);
}
exports.majorAreas = majorAreas;
// gafAreaCodesFromMapAreas returns a unique list of GAF areas (QLD-S, NSW-E etc) for
// a list of MapMajorAreas + MapSubAreas
function gafAreaCodesFromMapAreas(mapAreas) {
    var gafAreaCodesFound = {};
    return mapAreas.reduce(function (result, mapArea) {
        if (!gafAreaCodesFound[mapArea.gafAreaCode]) {
            gafAreaCodesFound[mapArea.gafAreaCode] = true;
            result.push(mapArea.gafAreaCode);
        }
        return result;
    }, []);
}
exports.gafAreaCodesFromMapAreas = gafAreaCodesFromMapAreas;
