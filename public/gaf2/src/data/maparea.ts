import { WxCond } from "./gaf";

export interface MapAreaImport {
  gafAreaCode: string;
  mapLayerID: string;
  mapLabel: string;
  gafAreaCodeAndGroup: string;
  wxConds?: WxCond[];
  freezingLevel?: string;
}