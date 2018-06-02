package parser

// Abbreviations from https://en.wikipedia.org/wiki/METAR

import (
	"fmt"
	"regexp"
	"strconv"

	"github.com/drnic/bom-charts/codes"
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
	SeaOnly bool   `json:"sea-only,omitempty"`
}

var areaAndAltBaseSubareaRE *regexp.Regexp
var areaAndAltLayersSubareaRE *regexp.Regexp
var areaAndAltAmountSubareasRE *regexp.Regexp
var areaAndAltAmountSubareaRE *regexp.Regexp
var subareasOnlyRE *regexp.Regexp
var subareaOnlyRE *regexp.Regexp
var simpleRE *regexp.Regexp

func cloudAmountRE(i int) string {
	return fmt.Sprintf(`(?P<cloudAmount%d>FEW|SCT|BKN|OVC|ISOL|OCNL|FREQ)`, i)
}

func cloudBaseTopRE(i int) string {
	return fmt.Sprintf(`(?P<cloudBase%d>\d+)/(?:ABV)?(?P<cloudTop%d>\d+)FT`, i, i)
}

func commonCloudRE(i int) string {
	cloudTypeRE := fmt.Sprintf(`(?P<cloudType%d>[A-Z/]+)`, i)
	ignoreLandOrSeaRE := ` *(?:LAND)?/?(?P<sea>SEA)? *`
	return cloudAmountRE(i) + " +" + cloudTypeRE + " +" + cloudBaseTopRE(i) + ignoreLandOrSeaRE
}

func subareaLabelRE(i int) string {
	return fmt.Sprintf(`(?P<subarea%d>\w\d+)`, i)
}

func cloudAmountInSubareaRE(i int) string {
	inRE := `(?:IN )?`
	return cloudAmountRE(i) + " +" + inRE + subareaLabelRE(i)
}

func init() {
	inRE := `(?:IN )?`
	subareaOnlyFilters := inRE + subareaLabelRE(1)
	subareasOnlyFilters := inRE + subareaLabelRE(1) + ", " + inRE + subareaLabelRE(2)
	cloudBaseInSubareaRE := `BASES? +(?:ABV)?(?P<cloudBaseSubArea>\d+)FT +` + subareaOnlyFilters
	altLayerRE := cloudBaseTopRE(1) + " +" + subareaOnlyFilters

	// SCT CU/SC 3000/5000FT (OVC IN B1, BKN IN B2)
	areaAndAltAmountSubareasRE = regexp.MustCompile(commonCloudRE(0) + `.+\(` + cloudAmountInSubareaRE(1) + `, *` + cloudAmountInSubareaRE(2) + `.*\)`)

	// SCT CU/SC 3000/8000FT (BKN IN A1)
	areaAndAltAmountSubareaRE = regexp.MustCompile(commonCloudRE(0) + `.+\(` + cloudAmountInSubareaRE(1) + `.*\)`)

	// SCT CU/SC 4000/7000FT (BASES 3000FT A2)
	// SCT CU 3000/7000FT, BASE 2500FT IN C1
	areaAndAltBaseSubareaRE = regexp.MustCompile(commonCloudRE(0) + `,? *.+\(?` + cloudBaseInSubareaRE + `.*\)?`)

	// BKN CU/SC 4000/9000FT (3000/ABV10000FT IN A1)
	areaAndAltLayersSubareaRE = regexp.MustCompile(commonCloudRE(0) + `.+\(` + altLayerRE + `.*\)`)

	// BKN ST 1000/4000FT B1, B2
	subareasOnlyRE = regexp.MustCompile(commonCloudRE(0) + " +" + subareasOnlyFilters)

	// SCT CU/SC 5000/8000FT IN A1 ONLY
	subareaOnlyRE = regexp.MustCompile(commonCloudRE(0) + " +" + subareaOnlyFilters)

	// BKN ST 1000/5000FT
	simpleRE = regexp.MustCompile(commonCloudRE(0))
}

func parseNamedRegexp(re *regexp.Regexp, text string) (result map[string]string, matches bool) {
	if match := re.FindStringSubmatch(text); match != nil {
		result = map[string]string{}
		for i, name := range re.SubexpNames() {
			if i != 0 && name != "" {
				result[name] = match[i]
			}
		}
		return result, true
	}
	return result, false
}

// NewCloudIcingTurbParser parses Cloud/Icing/Turbulance text
func NewCloudIcingTurbParser(text string) (parser *CloudIcingTurbParser, err error) {
	parser = &CloudIcingTurbParser{}

	// SCT CU/SC 3000/5000FT (OVC IN B1, BKN IN B2)
	if match, ok := parseNamedRegexp(areaAndAltAmountSubareasRE, text); ok {
		areaCloud := newCloudLayerFromFromRegexpMatch(match, 0)
		if areaCloud.Amount != "FEW" {
			parser.EntireAreaCloud = areaCloud
		}
		parser.Subareas = map[string]*CloudLayer{}

		for i := 1; i <= 2; i++ {
			subareaCloud := *areaCloud
			subareaCloud.Amount = match[matchKey("cloudAmount", i)]
			if subareaCloud.Amount == "FEW" {
				subareaCloud.Base = codes.IgnoreMeCloudBase
				subareaCloud.Top = codes.IgnoreMeCloudTop
			}
			subarea := match[matchKey("subarea", i)]
			parser.Subareas[subarea] = &subareaCloud
		}
		return
	}

	// SCT CU/SC 3000/8000FT (BKN IN A1)
	if match, ok := parseNamedRegexp(areaAndAltAmountSubareaRE, text); ok {
		areaCloud := newCloudLayerFromFromRegexpMatch(match, 0)
		if areaCloud.Amount != "FEW" {
			parser.EntireAreaCloud = areaCloud
		}
		subareaCloud := *areaCloud
		subareaCloud.Amount = match["cloudAmount1"]
		subarea := match["subarea1"]
		if subareaCloud.Amount == "FEW" {
			subareaCloud.Base = codes.IgnoreMeCloudBase
			subareaCloud.Top = codes.IgnoreMeCloudTop
		}

		parser.Subareas = map[string]*CloudLayer{}
		parser.Subareas[subarea] = &subareaCloud
		return
	}

	// SCT CU/SC 4000/7000FT (BASES 3000FT A2)
	if match, ok := parseNamedRegexp(areaAndAltBaseSubareaRE, text); ok {
		areaCloud := newCloudLayerFromFromRegexpMatch(match, 0)
		parser.EntireAreaCloud = areaCloud

		subareaCloud := *areaCloud
		subareaCloud.Base, _ = strconv.ParseUint(match["cloudBaseSubArea"], 10, 64)
		subarea := match["subarea1"]

		parser.Subareas = map[string]*CloudLayer{}
		parser.Subareas[subarea] = &subareaCloud
		return
	}

	// BKN CU/SC 4000/9000FT (3000/ABV10000FT IN A1)
	if match, ok := parseNamedRegexp(areaAndAltLayersSubareaRE, text); ok {
		areaCloud := newCloudLayerFromFromRegexpMatch(match, 0)
		parser.EntireAreaCloud = areaCloud

		subareaCloud := *areaCloud
		subareaCloud.Base, _ = strconv.ParseUint(match[matchKey("cloudBase", 1)], 10, 64)
		subareaCloud.Top, _ = strconv.ParseUint(match[matchKey("cloudTop", 1)], 10, 64)
		subarea := match["subarea1"]

		parser.Subareas = map[string]*CloudLayer{}
		parser.Subareas[subarea] = &subareaCloud
		return
	}

	// BKN ST 1000/4000FT B1, B2
	if match, ok := parseNamedRegexp(subareasOnlyRE, text); ok {
		cloud := *newCloudLayerFromFromRegexpMatch(match, 0)

		subarea1 := match["subarea1"]
		subarea2 := match["subarea2"]

		if cloud.Amount != "FEW" {
			parser.Subareas = map[string]*CloudLayer{}
			parser.Subareas[subarea1] = &cloud
			parser.Subareas[subarea2] = &cloud
		}
		return
	}

	// SCT CU/SC 5000/8000FT IN A1 ONLY
	if match, ok := parseNamedRegexp(subareaOnlyRE, text); ok {
		cloud := newCloudLayerFromFromRegexpMatch(match, 0)
		subarea := match["subarea1"]

		if cloud.Amount != "FEW" {
			parser.Subareas = map[string]*CloudLayer{}
			parser.Subareas[subarea] = cloud
		}
		return
	}

	// SCT CU/SC 5000/8000FT
	if match, ok := parseNamedRegexp(simpleRE, text); ok {
		cloud := newCloudLayerFromFromRegexpMatch(match, 0)

		if cloud.Amount != "FEW" {
			parser.EntireAreaCloud = cloud
		}
		return
	}

	return
}

func matchKey(key string, i int) string {
	return fmt.Sprintf(key+"%d", i)
}

func newCloudLayerFromFromRegexpMatch(match map[string]string, i int) (cloud *CloudLayer) {
	cloud = &CloudLayer{}
	cloud.Amount = match[matchKey("cloudAmount", i)]
	cloud.Type = match[matchKey("cloudType", i)]
	cloud.Base, _ = strconv.ParseUint(match[matchKey("cloudBase", i)], 10, 64)
	cloud.Top, _ = strconv.ParseUint(match[matchKey("cloudTop", i)], 10, 64)
	cloud.Cumulus = cloud.Type == "CB" || cloud.Type == "TCU"
	cloud.SeaOnly = match["sea"] == "SEA"

	return
}
