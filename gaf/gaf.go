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
	"time"

	"github.com/gregjones/httpcache"

	"github.com/drnic/bom-charts/codes"
	"github.com/drnic/bom-charts/parser"
)

// AreaForecast describes a request/current Graphical Area Forecast (GAF)
type AreaForecast struct {
	PageCode          string       `json:"page_code"`
	GAFAreaID         string       `json:"gaf_area_id"`
	From              string       `json:"from"`
	IssuedAt          string       `json:"issued_at"`
	StandardInclusion string       `json:"standard_inclusion"`
	Till              string       `json:"till"`
	Areas             []*GAFArea   `json:"areas"`
	Boundary          *GAFBoundary `json:"boundary"`
}

type GAFArea struct {
	AreaID         string        `json:"area_id"`
	WxCond         []*GAFWxCond  `json:"wx_cond"`
	FreezingLevel  string        `json:"freezing_level"`
	Boundary       *GAFBoundary  `json:"boundary"`
	DayCloudBase   uint64        `json:"day_cloud_base,omitempty"`
	DayCloudTop    uint64        `json:"day_cloud_top,omitempty"`
	NightCloudBase uint64        `json:"night_cloud_base,omitempty"`
	NightCloudTop  uint64        `json:"night_cloud_top,omitempty"`
	SubAreas       []*GAFSubArea `json:"sub_areas"`
}

type GAFSubArea struct {
	AreaID         string       `json:"area_id"`
	SubAreaID      string       `json:"sub_area_id"`
	Boundary       *GAFBoundary `json:"boundary"`
	DayCloudBase   uint64       `json:"day_cloud_base,omitempty"`
	DayCloudTop    uint64       `json:"day_cloud_top,omitempty"`
	NightCloudBase uint64       `json:"night_cloud_base,omitempty"`
	NightCloudTop  uint64       `json:"night_cloud_top,omitempty"`
}

type GAFWxCond struct {
	SurfaceVisWx       GAFSurfaceVisWx          `json:"surface_vis_wx"`
	CloudIceTurbulence []*GAFCloudIceTurbulence `json:"cloud_ice_turb"`
}

type GAFSurfaceVisWx struct {
	Text              string   `json:"text"`
	SurfaceVisibility int64    `json:"surface_vis"`
	SubAreasMentioned []string `json:"sub_areas_mentioned,omitempty"`
}

type GAFCloudIceTurbulence struct {
	Text              string                       `json:"text"`
	SubAreasMentioned []string                     `json:"sub_areas_mentioned,omitempty"`
	Parsed            *parser.CloudIcingTurbParser `json:"parsed"`
}

type GAFBoundary struct {
	Points [][]float64 `json:"points"`
}

var httpTransportCreatedAt time.Time
var httpTransport *httpcache.Transport

// Cache fetched XML files for an hour
// TODO: perhaps just cache the AreaForecast instead
func httpCacheClient() *http.Client {
	if httpTransport == nil || time.Since(httpTransportCreatedAt) > time.Hour {
		httpTransport = httpcache.NewMemoryCacheTransport()
		httpTransportCreatedAt = time.Now()
	}
	return httpTransport.Client()
}

// NewAreaForecast is the constructor for a AreaForecast
func NewAreaForecast(pagecode string) (forecast *AreaForecast, err error) {
	httpClient := httpCacheClient()

	url := fmt.Sprintf("http://www.bom.gov.au/fwo/aviation/%s.xml", pagecode)
	fmt.Println("GET ", url)
	resp, err := httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	fmt.Println(resp)
	rawXML, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	rawForecast := &rawGAFAreaForecast{}
	if err = xml.Unmarshal(rawXML, rawForecast); err != nil {
		return forecast, err
	}

	forecast = &AreaForecast{PageCode: pagecode}
	forecast.copyFromRawForecast(rawForecast)

	return forecast, nil
}

func (forecast *AreaForecast) copyFromRawForecast(raw *rawGAFAreaForecast) {
	forecast.GAFAreaID = raw.AreaID
	forecast.From = raw.From
	forecast.IssuedAt = raw.IssuedAt
	forecast.StandardInclusion = raw.StandardInclusion
	forecast.Till = raw.Till

	forecast.Boundary = &GAFBoundary{}
	forecast.Boundary.copyFromRawForecast(raw.Boundary)

	forecast.Areas = make([]*GAFArea, len(raw.Areas))
	for i, rawArea := range raw.Areas {
		area := &GAFArea{
			AreaID:        rawArea.ID,
			FreezingLevel: html.UnescapeString(rawArea.FreezingLevel),
		}

		area.Boundary = &GAFBoundary{}
		area.Boundary.copyFromRawForecast(rawArea.Boundary)

		area.SubAreas = make([]*GAFSubArea, len(rawArea.SubAreas))
		for j, rawSubArea := range rawArea.SubAreas {
			area.SubAreas[j] = &GAFSubArea{
				AreaID:    area.AreaID,
				SubAreaID: rawSubArea.ID,
			}
			area.SubAreas[j].Boundary = &GAFBoundary{}
			area.SubAreas[j].Boundary.copyFromRawForecast(rawSubArea.Boundary)
		}

		forecast.Areas[i] = area
		area.WxCond = make([]*GAFWxCond, len(rawArea.WxCond))
		for j, rawWxCond := range rawArea.WxCond {
			wxCond := &GAFWxCond{}
			area.WxCond[j] = wxCond

			if len(rawWxCond.SurfaceVisWx) > 0 {
				wxCond.SurfaceVisWx.Text = html.UnescapeString(rawWxCond.SurfaceVisWx[0])
				wxCond.SurfaceVisWx.Decode(forecast, area)
			}

			wxCond.CloudIceTurbulence = make([]*GAFCloudIceTurbulence, len(rawWxCond.CloudIceTurbulence))
			for k, rawCloud := range rawWxCond.CloudIceTurbulence {
				cloud := &GAFCloudIceTurbulence{
					Text: html.UnescapeString(rawCloud),
				}
				cloud.Decode(forecast, area)
				wxCond.CloudIceTurbulence[k] = cloud
			}
		}

		sort.Slice(area.WxCond, func(i, j int) bool {
			return area.WxCond[i].SurfaceVisWx.SurfaceVisibility > area.WxCond[j].SurfaceVisWx.SurfaceVisibility
		})

		area.DecodeCloudLayers()
	}

}

func (boundary *GAFBoundary) copyFromRawForecast(raw rawGAFBoundary) {
	first := raw.Points[0]
	last := raw.Points[len(raw.Points)-1]
	boundaryLen := len(raw.Points)
	addFirstToEnd := false
	if first.Latitude != last.Latitude || first.Longitude != last.Longitude {
		boundaryLen++
		addFirstToEnd = true
	}

	boundary.Points = make([][]float64, boundaryLen)
	for i, rawPoint := range raw.Points {
		boundary.Points[i] = []float64{0, 0}
		boundary.Points[i][0], _ = strconv.ParseFloat(rawPoint.Longitude, 64)
		boundary.Points[i][1], _ = strconv.ParseFloat(rawPoint.Latitude, 64)
	}
	if addFirstToEnd {
		boundary.Points[boundaryLen-1] = []float64{0, 0}
		boundary.Points[boundaryLen-1][0] = boundary.Points[0][0]
		boundary.Points[boundaryLen-1][1] = boundary.Points[0][1]
	}
}

// DecodeCloudLayers takes the major layer and finds the lowest base and highest top
func (area *GAFArea) DecodeCloudLayers() {
	if len(area.WxCond) > 0 && len(area.WxCond[0].CloudIceTurbulence) > 0 {
		area.DayCloudBase = codes.IgnoreMeCloudBase
		area.DayCloudTop = codes.IgnoreMeCloudTop
		area.NightCloudBase = codes.IgnoreMeCloudBase
		area.NightCloudTop = codes.IgnoreMeCloudTop
		for _, cloudLayer := range area.WxCond[0].CloudIceTurbulence {
			if cloudLayer.Parsed.EntireAreaCloud != nil {
				if area.DayCloudBase > cloudLayer.Parsed.EntireAreaCloud.Base {
					area.DayCloudBase = cloudLayer.Parsed.EntireAreaCloud.Base
				}
				if area.DayCloudTop < cloudLayer.Parsed.EntireAreaCloud.Top {
					area.DayCloudTop = cloudLayer.Parsed.EntireAreaCloud.Top
				}
				if area.NightCloudBase > cloudLayer.Parsed.EntireAreaCloud.Base {
					area.NightCloudBase = cloudLayer.Parsed.EntireAreaCloud.Base
				}
				if area.NightCloudTop < cloudLayer.Parsed.EntireAreaCloud.Top {
					area.NightCloudTop = cloudLayer.Parsed.EntireAreaCloud.Top
				}
			}
		}

		for _, subarea := range area.SubAreas {
			subarea.DayCloudBase = area.DayCloudBase
			subarea.DayCloudTop = area.DayCloudTop
			subarea.NightCloudBase = area.NightCloudBase
			subarea.NightCloudTop = area.NightCloudTop

			// TODO: the first CloudIceTurbulence might be ignorable
			// Look in each CloudIceTurbulence for each subarea to find lowest + highest
			if len(area.WxCond) > 0 && len(area.WxCond[0].CloudIceTurbulence) > 0 {
				subareasWxCloud := area.WxCond[0].CloudIceTurbulence[0].Parsed.Subareas
				if subareaWxCloud, ok := subareasWxCloud[subarea.SubAreaID]; ok {
					subarea.DayCloudBase = subareaWxCloud.Base
					subarea.DayCloudTop = subareaWxCloud.Top
					subarea.NightCloudBase = subareaWxCloud.NightOnlyBase
					subarea.NightCloudTop = subareaWxCloud.NightOnlyTop
				}
			}
		}
	}
}

// Decode extracts metadata from surface-visibility-wx raw text
func (surface *GAFSurfaceVisWx) Decode(forecast *AreaForecast, area *GAFArea) {
	if strings.Contains(surface.Text, "10KM") {
		surface.SurfaceVisibility = 10000
	} else {
		r := regexp.MustCompile("([0-9]+)M")
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

	r := regexp.MustCompile(fmt.Sprintf("%s([0-9])", area.AreaID))
	surface.SubAreasMentioned = r.FindAllString(surface.Text, -1)
}

// Decode extracts metadata from cloud-ice-turbulence raw text
func (cloud *GAFCloudIceTurbulence) Decode(forecast *AreaForecast, area *GAFArea) {
	r := regexp.MustCompile(fmt.Sprintf("%s([0-9])", area.AreaID))
	cloud.SubAreasMentioned = r.FindAllString(cloud.Text, -1)

	cloud.Parsed, _ = parser.NewCloudIcingTurbParser(cloud.Text)
}
