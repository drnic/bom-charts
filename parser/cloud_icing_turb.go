package parser

// Abbreviations from https://en.wikipedia.org/wiki/METAR

import (
	"regexp"
	"strconv"
)

// CloudIcingTurbParser contains Cloud/Icing/Turbulance data
type CloudIcingTurbParser struct {
	Cloud   *CloudLayer `json:"cloud,omitempty"`
	Cumulus *CloudLayer `json:"cumulus,omitempty"`
}

type CloudLayer struct {
	Amount string `json:"amount"`
	Type   string `json:"type"`
	Base   uint64 `json:"base"`
	Top    uint64 `json:"top"`
}

var simpleRE *regexp.Regexp
var cumulusRE *regexp.Regexp

func init() {
	cloudAmountRE := "(FEW|SCT|BKN|OVC)"
	cloudTypeRE := "([A-Z/]+)"
	cloudBaseTopRE := "(\\d+)/(?:ABV)?(\\d+)FT"
	simpleRE = regexp.MustCompile(cloudAmountRE + " +" + cloudTypeRE + " +" + cloudBaseTopRE)

	cumulusCoverageRE := "(ISOL|OCNL|FREQ)"
	cumulusTypeRE := "(CB|TCU)"
	cumulusRE = regexp.MustCompile(cumulusCoverageRE + " +" + cumulusTypeRE + " +" + cloudBaseTopRE)
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

	if matches := cumulusRE.FindAllStringSubmatch(text, -1); matches != nil {
		parser.Cumulus = &CloudLayer{}
		parser.Cumulus.Amount = matches[0][1]
		parser.Cumulus.Type = matches[0][2]
		parser.Cumulus.Base, _ = strconv.ParseUint(matches[0][3], 10, 64)
		parser.Cumulus.Top, _ = strconv.ParseUint(matches[0][4], 10, 64)
	}

	return
}
