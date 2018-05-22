package gaf

import (
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"net/http"
)

// Page describes a request/current Graphical Area Forecast (GAF)
type AreaForecast struct {
	AreaID            string `xml:"area-id,attr" json:"area-id`
	From              string `xml:"from,attr" json:"from"`
	IssuedAt          string `xml:"issued-at,attr" json:"issued-at"`
	StandardInclusion string `xml:"standard-inclusion" json:"standard-inclusion"`
	Till              string `xml:"till,attr" json:"till"`
	Area              []Area `xml:"area" json:"area"`
}

type Point struct {
	Latitude  string `xml:"latitude,attr" json:"latitude"`
	Longitude string `xml:"longitude,attr" json:"longitude"`
}

type Area struct {
	ID     string `xml:"id,attr" json:"id"`
	WxCond []struct {
		SurfaceVisWx       []string `xml:"scf-vis-wx" json:"surface-vis-wx"`
		CloudIceTurbulence []string `xml:"cld-ice-turb" json:"cloud-ice-turb"`
	} `xml:"wx-cond" json:"wx-cond"`
	FreezingLevel string `xml:"fz-lvl" json:"freezing-level"`
}

// NewPage is the constructor for a Page
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

	forecast = &AreaForecast{}
	err = xml.Unmarshal(rawXML, forecast)
	return forecast, err

	// TODO - sort WxCond by visibility (>10KM, 8000M, 2000M, "")
}
