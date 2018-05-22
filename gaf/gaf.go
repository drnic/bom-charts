package gaf

import (
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"net/http"
)

// AreaForecast describes a request/current Graphical Area Forecast (GAF)
type AreaForecast struct {
	AreaID            string     `json:"area-id"`
	From              string     `json:"from"`
	IssuedAt          string     `json:"issued-at"`
	StandardInclusion string     `json:"standard-inclusion"`
	Till              string     `json:"till"`
	Areas             []*GAFArea `json:"areas"`
}

type GAFArea struct {
	ID            string       `json:"id"`
	WxCond        []*GAFWxCond `json:"wx-cond"`
	FreezingLevel string       `json:"freezing-level"`
}

type GAFWxCond struct {
	SurfaceVisWx       []*GAFSurfaceVisWx       `json:"surface-vis-wx"`
	CloudIceTurbulence []*GAFCloudIceTurbulence `json:"cloud-ice-turb"`
}

type GAFSurfaceVisWx struct {
	Text              string `json:"text"`
	SurfaceVisibility int    `json:"surface-vis"`
}

type GAFCloudIceTurbulence struct {
	Text string `json:"text"`
}

// NewAreaForecast is the constructor for a AreaForecast
func NewAreaForecast(pagecode string) (forecast *AreaForecast, err error) {
	url := fmt.Sprintf("http://www.bom.gov.au/fwo/aviation/%s.xml", pagecode)
	fmt.Println("GET ", url)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	fmt.Println(resp)
	rawXML, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	rawForecast := &RawGAFAreaForecast{}
	if err = xml.Unmarshal(rawXML, rawForecast); err != nil {
		return forecast, err
	}

	forecast = &AreaForecast{}
	forecast.copyFromRawForecast(rawForecast)

	// TODO - sort WxCond by visibility (>10KM, 8000M, 2000M, "")
	// TODO - convert HTML to ASCII (&gt;)
	return forecast, nil
}

func (forecast *AreaForecast) copyFromRawForecast(raw *RawGAFAreaForecast) {
	forecast.AreaID = raw.AreaID
	forecast.From = raw.From
	forecast.IssuedAt = raw.IssuedAt
	forecast.StandardInclusion = raw.StandardInclusion
	forecast.Till = raw.Till

	forecast.Areas = make([]*GAFArea, len(raw.Areas))
	for i, rawArea := range raw.Areas {
		area := &GAFArea{}
		forecast.Areas[i] = area
		area.ID = rawArea.ID
		area.FreezingLevel = rawArea.FreezingLevel
		area.WxCond = make([]*GAFWxCond, len(rawArea.WxCond))
		for j, rawWxCond := range rawArea.WxCond {
			wxCond := &GAFWxCond{}
			area.WxCond[j] = wxCond

			wxCond.SurfaceVisWx = make([]*GAFSurfaceVisWx, len(rawWxCond.SurfaceVisWx))
			for k, rawSurface := range rawWxCond.SurfaceVisWx {
				surfaceVisWx := &GAFSurfaceVisWx{
					Text: rawSurface,
				}
				wxCond.SurfaceVisWx[k] = surfaceVisWx
			}

			wxCond.CloudIceTurbulence = make([]*GAFCloudIceTurbulence, len(rawWxCond.CloudIceTurbulence))
			for k, rawCloud := range rawWxCond.CloudIceTurbulence {
				cloud := &GAFCloudIceTurbulence{
					Text: rawCloud,
				}
				wxCond.CloudIceTurbulence[k] = cloud
			}
		}
	}
}
