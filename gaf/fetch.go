package gaf

type rawGAFAreaForecast struct {
	AreaID            string         `xml:"area-id,attr"`
	From              string         `xml:"from,attr"`
	IssuedAt          string         `xml:"issued-at,attr"`
	StandardInclusion string         `xml:"standard-inclusion"`
	Till              string         `xml:"till,attr"`
	Areas             []rawGAFArea   `xml:"area"`
	Boundary          rawGAFBoundary `xml:"boundary"`
}

type rawGAFArea struct {
	ID            string          `xml:"id,attr"`
	WxCond        []rawGAFWxCond  `xml:"wx-cond"`
	FreezingLevel string          `xml:"fz-lvl"`
	Boundary      rawGAFBoundary  `xml:"boundary"`
	SubAreas      []rawGAFSubArea `xml:"sub-area"`
}

type rawGAFSubArea struct {
	ID       string         `xml:"id,attr"`
	Boundary rawGAFBoundary `xml:"boundary"`
}

type rawGAFWxCond struct {
	SurfaceVisWx       []string `xml:"scf-vis-wx"`
	CloudIceTurbulence []string `xml:"cld-ice-turb"`
}

type rawGAFBoundary struct {
	Points []rawGAFPoint `xml:"point"`
}
type rawGAFPoint struct {
	Latitude  string `xml:"latitude,attr"`
	Longitude string `xml:"longitude,attr"`
}
