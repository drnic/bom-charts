package parser

// Abbreviations from https://en.wikipedia.org/wiki/METAR

import (
	"regexp"
	"strconv"
)

// CloudIcingTurbParser contains Cloud/Icing/Turbulance data
type CloudIcingTurbParser struct {
	PrimaryLayer CloudLayer
}

type CloudLayer struct {
	CloudAmount string
	CloudType   string
	CloudBase   uint64
	CloudTop    uint64
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
		parser.PrimaryLayer.CloudAmount = matches[0][1]
		parser.PrimaryLayer.CloudType = matches[0][2]
		parser.PrimaryLayer.CloudBase, _ = strconv.ParseUint(matches[0][3], 10, 64)
		parser.PrimaryLayer.CloudTop, _ = strconv.ParseUint(matches[0][4], 10, 64)
	}

	return
}
