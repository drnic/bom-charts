package gaf

type RawGAFAreaForecast struct {
	AreaID            string         `xml:"area-id,attr"`
	From              string         `xml:"from,attr"`
	IssuedAt          string         `xml:"issued-at,attr"`
	StandardInclusion string         `xml:"standard-inclusion"`
	Till              string         `xml:"till,attr"`
	Areas             []RawGAFArea   `xml:"area"`
	Boundary          RawGAFBoundary `xml:"boundary"`
}

type RawGAFBoundary struct {
	Points []RawGAFPoint `xml:"point"`
}
type RawGAFPoint struct {
	Latitude  string `xml:"latitude,attr"`
	Longitude string `xml:"longitude,attr"`
}

type RawGAFArea struct {
	ID            string         `xml:"id,attr"`
	WxCond        []RawGAFWxCond `xml:"wx-cond"`
	FreezingLevel string         `xml:"fz-lvl"`
}

type RawGAFWxCond struct {
	SurfaceVisWx       []string `xml:"scf-vis-wx"`
	CloudIceTurbulence []string `xml:"cld-ice-turb"`
}
