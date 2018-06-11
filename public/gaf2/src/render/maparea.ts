import * as $ from 'jquery';
import * as gaftablerender from "./gaftable";
import * as theme from "../theme";
import * as mapareadata from '../data/maparea';
import * as mapui from "../mapui";
import * as wait from "../helpers/wait";
import * as turfcenter from "../turf/center";

export let byLayerID : { [s: string] : mapareadata.MapArea } = {};
export let allOutlineLayerIDs : string[] = [];

// mapArea is MapMajorArea or MapSubArea
export function setupMapFill(mapArea: mapareadata.MapArea) {
  let map = mapui.map;

  let baseID = mapArea.uuid();
  let layerID = mapArea.mapLayerID();
  byLayerID[layerID] = mapArea;

  let labelID = "label" + baseID;
  let outlineID = "outline" + baseID;
  allOutlineLayerIDs.push(outlineID);

  // 1000ft AGL matches to .height-1 in main.css
  let fillColor = mapArea.cloudBaseColor();

  let areaLayerFeature = mapArea.asFeature();

  map.addSource(layerID, {
    "type": "geojson",
    "data": areaLayerFeature,
  });

  map.addLayer({
    "id": layerID,
    "type": "fill",
    "source": layerID,
    "paint": {
      "fill-color": fillColor,
      "fill-opacity": 0.2,
    }
  });

  map.addLayer({
    "id": outlineID,
    "type": "line",
    "source": layerID,
    "layout": {
      "line-join": "round", "line-cap": "round",
    },
    "paint": {
      "line-color": fillColor, "line-width": 2,
    }
  });

  let areaCenter = turfcenter.center(areaLayerFeature, 1);
  areaCenter.properties = {"title": mapArea.mapLabel()}
  map.addLayer({
    "id": labelID,
    "type": "symbol",
    "source": {
      "type": "geojson",
      "data": areaCenter
    },
    "layout": {
      "text-field": "{title}",
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      "text-anchor": "top"
    },
    "paint": {
      "text-color": theme.current().textColor,
    }
  });

  wait.delay(500).then(() => {
    gaftablerender.update();
  });

  map.on("mousemove", layerID, () => {
    $(`#gaf-table tr.gaf-${mapArea.gafAreaCodeAndGroup()}`).addClass("area-selected");
    if (mapArea.isSubArea()) {
      $(`#gaf-table tr.gaf-${mapArea.gafAreaCodeAndGroup()} .subarea-mentioned-${mapArea.mapLabel()}`).addClass("sub-area-selected");
    }
  });

  map.on("mouseleave", layerID, () => {
    $(`#gaf-table tr.gaf-${mapArea.gafAreaCodeAndGroup()}`).removeClass("area-selected");
    if (mapArea.isSubArea()) {
      $(`#gaf-table tr.gaf-${mapArea.gafAreaCodeAndGroup()} .subarea-mentioned-${mapArea.mapLabel()}`).removeClass("sub-area-selected");
    }
  });

  map.on("mouseover", layerID, () => {
    let text = mapArea.mapLabel();
    if (mapArea.cloudBase() === undefined || mapArea.cloudBase() === 999999) {
      text += " has N/A clouds";
    } else {
      text += " has cloud base " + mapArea.cloudBase() + "MSL";
    }
    $('#mouseover-summary-area').text(text);
  });

//   let initialZoom = true;
//   map.on('moveend', () => {
//     if(initialZoom){
//       initialZoom = false;
//       updateGAFTableFromVisibleAreas();
//       updateLSALTFromVisibleAreas(nightVFR);
//     }
//  });
}