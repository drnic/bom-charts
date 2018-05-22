package gaf

import (
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"net/http"
)

// Page describes a request/current Graphical Area Forecast (GAF)
type AreaForecast struct {
	AreaID   string `xml:"area-id,attr"`
	IssuedAt string `xml:"issued-at,attr"`
	Till     string `xml:"till,attr"`
}

type Point struct {
	Latitude  string `xml:"latitude,attr"`
	Longitude string `xml:"longitude,attr"`
}

// NewPage is the constructor for a Page
func NewAreaForecast(pagecode string) (forecast *AreaForecast, err error) {
	url := fmt.Sprintf("http://www.bom.gov.au/fwo/aviation/%s.xml", pagecode)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	rawXML, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	forecast = &AreaForecast{}
	err = xml.Unmarshal(rawXML, forecast)
	return forecast, err
}
