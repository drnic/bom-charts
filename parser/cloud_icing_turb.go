package parser

// Abbreviations from https://en.wikipedia.org/wiki/METAR

import (
	"regexp"
	"strconv"
)

// CloudIcingTurbParser contains Cloud/Icing/Turbulance data
type CloudIcingTurbParser struct {
	Cloud *CloudLayer `json:"cloud,omitempty"`
}

type CloudLayer struct {
	Amount string `json:"amount"`
	Type   string `json:"type"`
	Base   uint64 `json:"base"`
	Top    uint64 `json:"top"`
}

var simpleRE *regexp.Regexp

func init() {
	cloudAmountRE := "(FEW|SCT|BKN|OVC)"
	cloudTypeRE := "([A-Z/]+)"
	cloudBaseTopRE := "(\\d+)/(?:ABV)?(\\d+)FT"
	simpleRE = regexp.MustCompile(cloudAmountRE + " +" + cloudTypeRE + " +" + cloudBaseTopRE)
}

// NewCloudIcingTurbParser parses Cloud/Icing/Turbulance text
func NewCloudIcingTurbParser(text string) (parser *CloudIcingTurbParser, err error) {
	parser = &CloudIcingTurbParser{}

	if matches := simpleRE.FindAllStringSubmatch(text, -1); matches != nil {
		parser.Cloud = &CloudLayer{}
		parser.Cloud.Amount = matches[0][1]
		parser.Cloud.Type = matches[0][2]
		parser.Cloud.Base, _ = strconv.ParseUint(matches[0][3], 10, 64)
		parser.Cloud.Top, _ = strconv.ParseUint(matches[0][4], 10, 64)
	}

	return
}
