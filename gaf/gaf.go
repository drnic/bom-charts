package gaf

import (
	"encoding/xml"
	"fmt"
	"html"
	"io/ioutil"
	"net/http"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
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
	SurfaceVisWx       GAFSurfaceVisWx          `json:"surface-vis-wx"`
	CloudIceTurbulence []*GAFCloudIceTurbulence `json:"cloud-ice-turb"`
}

type GAFSurfaceVisWx struct {
	Text              string `json:"text"`
	SurfaceVisibility int64  `json:"surface-vis"`
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
		area := &GAFArea{
			ID:            rawArea.ID,
			FreezingLevel: html.UnescapeString(rawArea.FreezingLevel),
		}
		forecast.Areas[i] = area
		area.WxCond = make([]*GAFWxCond, len(rawArea.WxCond))
		for j, rawWxCond := range rawArea.WxCond {
			wxCond := &GAFWxCond{}
			area.WxCond[j] = wxCond

			if len(rawWxCond.SurfaceVisWx) > 0 {
				wxCond.SurfaceVisWx.Text = html.UnescapeString(rawWxCond.SurfaceVisWx[0])
				wxCond.SurfaceVisWx.Decode()
			}

			wxCond.CloudIceTurbulence = make([]*GAFCloudIceTurbulence, len(rawWxCond.CloudIceTurbulence))
			for k, rawCloud := range rawWxCond.CloudIceTurbulence {
				cloud := &GAFCloudIceTurbulence{
					Text: html.UnescapeString(rawCloud),
				}
				cloud.Decode()
				wxCond.CloudIceTurbulence[k] = cloud
			}
		}

		sort.Slice(area.WxCond, func(i, j int) bool {
			return area.WxCond[i].SurfaceVisWx.SurfaceVisibility > area.WxCond[j].SurfaceVisWx.SurfaceVisibility
		})
	}
}

// Decode extracts metadata from surface-visibility-wx raw text
func (surface *GAFSurfaceVisWx) Decode() {
	if strings.Contains(surface.Text, "10KM") {
		surface.SurfaceVisibility = 10000
	} else {
		r, _ := regexp.Compile("([0-9]+)M")
		matches := r.FindStringSubmatch(surface.Text)
		if len(matches) == 2 {
			i, err := strconv.ParseInt(matches[1], 10, 64)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Could not find surface visibility from %s. Error: %s", surface.Text, err)
			} else {
				surface.SurfaceVisibility = i
			}
		}
	}
}

// Decode extracts metadata from cloud-ice-turbulence raw text
func (cloud *GAFCloudIceTurbulence) Decode() {
}
