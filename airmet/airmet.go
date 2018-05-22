package airmet

import (
	"fmt"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

// Airmet describes the fetched HTML and the enclosed encoded message
type Airmet struct {
	Message                  string `json:"message"`
	BrisbaneRegionAnyAlerts  bool   `json:"brisbane_region_any_alert"`
	MelbourneRegionAnyAlerts bool   `json:"melbourne_region_any_alert"`
}

// NewAirmet is the constructor of Airmet and fetches latest raw HTML
func NewAirmet() (airmet *Airmet, err error) {
	airmet = &Airmet{}
	doc, err := goquery.NewDocument("http://www.bom.gov.au/aviation/warnings/airmet/")
	if err != nil {
		return nil, err
	}

	airmet.Message = doc.Find("span.info").First().Text()

	if airmet.Message == "" {
		airmet.Message, err = doc.Find("p.product").Last().Html()
		if err != nil {
			return nil, err
		}
		fmt.Printf("%#v\n", airmet.Message)
	}

	airmet.BrisbaneRegionAnyAlerts = strings.Contains(airmet.Message, "YBBB")
	airmet.MelbourneRegionAnyAlerts = strings.Contains(airmet.Message, "YMMM")

	return airmet, nil
}
