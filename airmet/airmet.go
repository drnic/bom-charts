package airmet

import (
	"strings"

	"github.com/PuerkitoBio/goquery"

	"github.com/drnic/bom-charts/gaf"
)

// Airmet describes the fetched HTML and the enclosed encoded message
type Airmet struct {
	Message                  string   `json:"message"`
	BrisbaneRegionAnyAlerts  bool     `json:"brisbane-region-any-alert"`
	MelbourneRegionAnyAlerts bool     `json:"melbourne-region-any-alert"`
	RemarkedGAFs             []string `json:"remarked-gafs"`
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
	}

	airmet.Message = strings.Replace(airmet.Message, "<br/>", "\n", -1)
	airmet.BrisbaneRegionAnyAlerts = strings.Contains(airmet.Message, "YBBB")
	airmet.MelbourneRegionAnyAlerts = strings.Contains(airmet.Message, "YMMM")

	// TODO: find specific "RMK: GAF" line and only do Contains in it
	airmet.RemarkedGAFs = []string{}
	for _, area := range gaf.Areas {
		if strings.Contains(airmet.Message, area) {
			airmet.RemarkedGAFs = append(airmet.RemarkedGAFs, area)
		}
	}

	return airmet, nil
}
