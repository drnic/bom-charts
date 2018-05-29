package parser

// Abbreviations from https://en.wikipedia.org/wiki/METAR

import (
	"regexp"
	"strconv"
)

// CloudIcingTurbParser contains Cloud/Icing/Turbulance data
type CloudIcingTurbParser struct {
	EntireAreaCloud *CloudLayer            `json:"cloud,omitempty"`
	Subareas        map[string]*CloudLayer `json:"subareas,omitempty"`
}

// CloudLayer describes a layer of cloud AMSL
type CloudLayer struct {
	Amount  string `json:"amount"`
	Type    string `json:"type"`
	Base    uint64 `json:"base"`
	Top     uint64 `json:"top"`
	Cumulus bool   `json:"cumulus"`
}

var subareaOnlyRE *regexp.Regexp
var simpleRE *regexp.Regexp

func init() {
	cloudAmountRE := "(FEW|SCT|BKN|OVC|ISOL|OCNL|FREQ)"
	cloudTypeRE := "([A-Z/]+)"
	cloudBaseTopRE := "(\\d+)/(?:ABV)?(\\d+)FT"
	subareaLabelRE := "(\\w\\d+)"
	subareaOnlyFilters := subareaLabelRE

	subareaOnlyRE = regexp.MustCompile(cloudAmountRE + " +" + cloudTypeRE + " +" + cloudBaseTopRE + " +" + subareaOnlyFilters)
	simpleRE = regexp.MustCompile(cloudAmountRE + " +" + cloudTypeRE + " +" + cloudBaseTopRE)
}

// NewCloudIcingTurbParser parses Cloud/Icing/Turbulance text
func NewCloudIcingTurbParser(text string) (parser *CloudIcingTurbParser, err error) {
	parser = &CloudIcingTurbParser{}

	if matches := subareaOnlyRE.FindAllStringSubmatch(text, -1); matches != nil {
		cloud := &CloudLayer{}
		cloud.Amount = matches[0][1]
		cloud.Type = matches[0][2]
		cloud.Base, _ = strconv.ParseUint(matches[0][3], 10, 64)
		cloud.Top, _ = strconv.ParseUint(matches[0][4], 10, 64)
		cloud.Cumulus = cloud.Type == "CB" || cloud.Type == "TCU"
		subarea := matches[0][5]

		parser.Subareas = map[string]*CloudLayer{}
		parser.Subareas[subarea] = cloud
		return
	}

	if matches := simpleRE.FindAllStringSubmatch(text, -1); matches != nil {
		cloud := &CloudLayer{}
		cloud.Amount = matches[0][1]
		cloud.Type = matches[0][2]
		cloud.Base, _ = strconv.ParseUint(matches[0][3], 10, 64)
		cloud.Top, _ = strconv.ParseUint(matches[0][4], 10, 64)
		cloud.Cumulus = cloud.Type == "CB" || cloud.Type == "TCU"

		parser.EntireAreaCloud = cloud
		return
	}

	return
}
