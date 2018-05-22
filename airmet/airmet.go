package airmet

import (
	"io/ioutil"
	"net/http"
)

// Airmet describes the fetched HTML and the enclosed encoded message
type Airmet struct {
	RawHTML            []byte
	Message            string
	BrisbaneRegionAny  bool
	MelbourneRegionAny bool
}

// NewAirmet is the constructor of Airmet and fetches latest raw HTML
func NewAirmet() (airmet *Airmet, err error) {
	airmet = &Airmet{}
	resp, err := http.Get("http://www.bom.gov.au/aviation/warnings/airmet/")
	if err != nil {
		return airmet, err
	}
	defer resp.Body.Close()
	airmet.RawHTML, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		return airmet, err
	}

	return airmet, err
}
