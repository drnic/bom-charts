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

var areaAndAltBaseSubareaOnlyRE *regexp.Regexp
var areaAndAltAmountSubareasOnlyRE *regexp.Regexp
var areaAndAltAmountSubareaOnlyRE *regexp.Regexp
var subareaOnlyRE *regexp.Regexp
var simpleRE *regexp.Regexp

func init() {
	cloudAmountRE := "(FEW|SCT|BKN|OVC|ISOL|OCNL|FREQ)"
	cloudTypeRE := "([A-Z/]+)"
	cloudRE := "(?:ABV)?(\\d+)FT"
	cloudBaseTopRE := "(\\d+)/" + cloudRE
	subareaLabelRE := "(\\w\\d+)"
	subareaOnlyFilters := "(?:IN )?" + subareaLabelRE
	cloudAmountInSubareaRE := cloudAmountRE + " +" + subareaOnlyFilters
	cloudBaseInSubareaRE := "BASES +" + cloudRE + " +" + subareaLabelRE

	areaAndAltAmountSubareasOnlyRE = regexp.MustCompile(cloudAmountRE + " +" + cloudTypeRE + " +" + cloudBaseTopRE + ".+\\(" + cloudAmountInSubareaRE + ", *" + cloudAmountInSubareaRE + ".*\\)")
	areaAndAltAmountSubareaOnlyRE = regexp.MustCompile(cloudAmountRE + " +" + cloudTypeRE + " +" + cloudBaseTopRE + ".+\\(" + cloudAmountInSubareaRE + ".*\\)")
	areaAndAltBaseSubareaOnlyRE = regexp.MustCompile(cloudAmountRE + " +" + cloudTypeRE + " +" + cloudBaseTopRE + ".+\\(" + cloudBaseInSubareaRE + ".*\\)")
	subareaOnlyRE = regexp.MustCompile(cloudAmountRE + " +" + cloudTypeRE + " +" + cloudBaseTopRE + " +" + subareaOnlyFilters)
	simpleRE = regexp.MustCompile(cloudAmountRE + " +" + cloudTypeRE + " +" + cloudBaseTopRE)
}

// NewCloudIcingTurbParser parses Cloud/Icing/Turbulance text
func NewCloudIcingTurbParser(text string) (parser *CloudIcingTurbParser, err error) {
	parser = &CloudIcingTurbParser{}

	if matches := areaAndAltAmountSubareasOnlyRE.FindAllStringSubmatch(text, -1); matches != nil {
		// fmt.Println(areaAndAltAmountSubareasOnlyRE)
		// fmt.Printf("%#v\n", matches)
		areaCloud := &CloudLayer{}
		areaCloud.Amount = matches[0][1]
		areaCloud.Type = matches[0][2]
		areaCloud.Base, _ = strconv.ParseUint(matches[0][3], 10, 64)
		areaCloud.Top, _ = strconv.ParseUint(matches[0][4], 10, 64)
		areaCloud.Cumulus = areaCloud.Type == "CB" || areaCloud.Type == "TCU"
		parser.EntireAreaCloud = areaCloud

		parser.Subareas = map[string]*CloudLayer{}

		subareaCloud1 := *areaCloud
		subareaCloud1.Amount = matches[0][5]
		subarea1 := matches[0][6]
		parser.Subareas[subarea1] = &subareaCloud1

		subareaCloud2 := *areaCloud
		subareaCloud2.Amount = matches[0][7]
		subarea2 := matches[0][8]
		parser.Subareas[subarea2] = &subareaCloud2

		return
	}

	if matches := areaAndAltAmountSubareaOnlyRE.FindAllStringSubmatch(text, -1); matches != nil {
		areaCloud := &CloudLayer{}
		areaCloud.Amount = matches[0][1]
		areaCloud.Type = matches[0][2]
		areaCloud.Base, _ = strconv.ParseUint(matches[0][3], 10, 64)
		areaCloud.Top, _ = strconv.ParseUint(matches[0][4], 10, 64)
		areaCloud.Cumulus = areaCloud.Type == "CB" || areaCloud.Type == "TCU"
		parser.EntireAreaCloud = areaCloud

		subareaCloud := *areaCloud
		subareaCloud.Amount = matches[0][5]
		subarea := matches[0][6]

		parser.Subareas = map[string]*CloudLayer{}
		parser.Subareas[subarea] = &subareaCloud
		return
	}

	if matches := areaAndAltBaseSubareaOnlyRE.FindAllStringSubmatch(text, -1); matches != nil {
		areaCloud := &CloudLayer{}
		areaCloud.Amount = matches[0][1]
		areaCloud.Type = matches[0][2]
		areaCloud.Base, _ = strconv.ParseUint(matches[0][3], 10, 64)
		areaCloud.Top, _ = strconv.ParseUint(matches[0][4], 10, 64)
		areaCloud.Cumulus = areaCloud.Type == "CB" || areaCloud.Type == "TCU"
		parser.EntireAreaCloud = areaCloud

		subareaCloud := *areaCloud
		subareaCloud.Base, _ = strconv.ParseUint(matches[0][5], 10, 64)
		subarea := matches[0][6]

		parser.Subareas = map[string]*CloudLayer{}
		parser.Subareas[subarea] = &subareaCloud
		return
	}

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
