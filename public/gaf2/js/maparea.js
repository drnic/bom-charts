class MapMajorArea {
  // gafAreaCode - "QLD-S"
  // gafArea - "{"area-id":"A","wx-cond":[{"surface-vis-wx":{"text":">10KM NIL","surface-vis":10000},"cloud-ice-turb":[{"text":"BKN ST 1500/2500FT LAND A1 ONLY TL 02Z","sub-areas-mentioned":["A1"],"parsed":{"cloud":{"amount":"BKN","type":"ST","base":1500,"top":2500}}},{"text":"SCT CU/SC 3000/10000FT, BKN A1 TL 02Z","sub-areas-mentioned":["A1"],"parsed":{"cloud":{"amount":"SCT","type":"CU/SC","base":3000,"top":10000}}}]},{"surface-vis-wx":{"text":"5000M ISOL FU BLW 8000FT LAND","surface-vis":5000},"cloud-ice-turb":[]},{"surface-vis-wx":{"text":"3000M ISOL SHRA, SCT SEA","surface-vis":3000},"cloud-ice-turb":[{"text":"ISOL TCU 2500/ABV10000FT SEA","parsed":{"cumulus":{"amount":"ISOL","type":"TCU","base":2500,"top":10000}}},{"text":"BKN ST 0800/2500FT","parsed":{"cloud":{"amount":"BKN","type":"ST","base":800,"top":2500}}},{"text":"BKN CU/SC 2500/10000FT","parsed":{"cloud":{"amount":"BKN","type":"CU/SC","base":2500,"top":10000}}}]},{"surface-vis-wx":{"text":"2000M SCT DZ LAND S OF YMIM TL 02Z","surface-vis":2000},"cloud-ice-turb":[{"text":"SCT ST 1000/3000FT","parsed":{"cloud":{"amount":"SCT","type":"ST","base":1000,"top":3000}}},{"text":"OVC SC 2000/9000FT","parsed":{"cloud":{"amount":"OVC","type":"SC","base":2000,"top":9000}}}]}],"freezing-level":"10000FT","boundary":{"points":[[152.4,-23.16],...,[152.87,-23.16]]},"cloud-base":1500,"cloud-top":10000,"sub-areas":[{"area-id":"A","sub-area-id":"A1","boundary":{"points":[[153.27,-24.28],...,[153.31,-24.38]]},"cloud-base":1500,"cloud-top":10000}]}"
  constructor(gafAreaCode, gafArea) {
    this.gafAreaCode = gafAreaCode;
    this.gafArea = gafArea;
  }
  data() { return this.gafArea; }
  gafAreaCode() { return this.gafAreaCode; }
  mapLabel() { return this.gafArea["area-id"]; }
  cloudBase() { return this.gafArea["cloud-base"]; }

  boundaryPoints() { return this.gafArea["boundary"]["points"]; }
  turfPolygon() {
    if (this._turfPolygon === undefined) {
      var points = this.boundaryPoints();
      points.push(points[0]);
      this._turfPolygon = turf.polygon([points]);
    }
    return this._turfPolygon;
  }

  // returns "QLD-S-A", "TAS-B"
  groupLabel() { return this.gafAreaCode + "-" + this.mapLabel(); }
}

class MapSubArea {
  // mapArea - instance of MapMajorArea
  // gafSubArea - {"area-id":"A","sub-area-id":"A1","boundary":{"points":[[153.27,-24.28],...,[153.31,-24.38]]},"cloud-base":1500,"cloud-top":10000}"
  constructor(mapArea, gafSubArea) {
    this.mapArea = mapArea;
    this.gafSubArea = gafSubArea;
  }
  data() { return this.gafSubArea; }
  gafAreaCode() { return this.mapArea.gafAreaCode(); }
  mapLabel() { return this.gafSubArea["sub-area-id"]; }
  cloudBase() { return this.gafSubArea["cloud-base"]; }

  boundaryPoints() { return this.gafSubArea["boundary"]["points"]; }
  turfPolygon() {
    if (this._turfPolygon === undefined) {
      var points = this.boundaryPoints();
      points.push(points[0]);
      this._turfPolygon = turf.polygon([points]);
    }
    return this._turfPolygon;
  }

  // returns "QLD-S-A", "TAS-B"
  groupLabel() { return this.mapArea.groupLabel(); }
}
