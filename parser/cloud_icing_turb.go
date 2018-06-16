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
	Amount        string `json:"amount"`
	Type          string `json:"type"`
	Base          uint64 `json:"base"` // ignore if FEW clouds
	Top           uint64 `json:"top"`  // ignore if FEW clouds
	NightOnlyBase uint64 `json:"night_only_base"`
	NightOnlyTop  uint64 `json:"night_only_top"`
	Cumulus       bool   `json:"cumulus"`
	SeaOnly       bool   `json:"sea_only,omitempty"`
}

var inRE string
var areaAndAltBaseSubareaRE *regexp.Regexp
var areaAndAltLayersSubareaRE *regexp.Regexp
var areaAndAltAmountSubareasRE *regexp.Regexp
var areaAndAltAmountSubareaRE *regexp.Regexp
var subareasOnlyRE *regexp.Regexp
var subareaOnlyRE *regexp.Regexp
var subareaOnlyWithAltSubareaRE *regexp.Regexp
var simpleRE *regexp.Regexp

func cloudAmountRE(i int) string {
	return fmt.Sprintf(`(?P<cloudAmount%d>FEW|SCT|BKN|OVC|ISOL|OCNL|FREQ)`, i)
}

func cloudBaseTopRE(i int) string {
	return fmt.Sprintf(`(?P<cloudBase%d>\d+)/(?:ABV)?(?P<cloudTop%d>\d+)FT`, i, i)
}

func commonCloudRE(i int) string {
	cloudTypeRE := fmt.Sprintf(`(?P<cloudType%d>[A-Z/]+)`, i)
	ignoreLandOrSeaRE := ` *(?P<land>LAND)?/?(?P<sea>SEA)? *`
	return cloudAmountRE(i) + " +" + cloudTypeRE + " +" + cloudBaseTopRE(i) + ignoreLandOrSeaRE
}

func subareaLabelRE(i int) string {
	return fmt.Sprintf(`(?P<subarea%d>\w\d+)`, i)
}

// BKN IN A2
func cloudAmountInSubareaRE(i int) string {
	return cloudAmountRE(i) + " +" + inRE + subareaLabelRE(i)
}

func cloudBaseInSubareaRE(i int) string {
	return cloudAmountRE(i) + `? *` + fmt.Sprintf(`BASES? +(?:ABV)?(?P<cloudBase%d>\d+)FT +`, i) + inRE + subareaLabelRE(i)
}

func init() {
	inRE = `(?:IN )?`
	subareaOnlyFilters := inRE + subareaLabelRE(1)
	subareasOnlyFilters := inRE + subareaLabelRE(1) + ", " + inRE + subareaLabelRE(2)
	altLayerRE := cloudBaseTopRE(1) + " +" + subareaOnlyFilters

	// SCT CU/SC 3000/5000FT (OVC IN B1, BKN IN B2)
	areaAndAltAmountSubareasRE = regexp.MustCompile(commonCloudRE(0) + `.+\(` + cloudAmountInSubareaRE(1) + `, *` + cloudAmountInSubareaRE(2) + `.*\)`)

	// SCT CU/SC 3000/8000FT (BKN IN A1)
	areaAndAltAmountSubareaRE = regexp.MustCompile(commonCloudRE(0) + `.+\(` + cloudAmountInSubareaRE(1) + `.*\)`)

	// SCT CU/SC 4000/7000FT (BASES 3000FT A2)
	// SCT CU 3000/7000FT, BASE 2500FT IN C1
	areaAndAltBaseSubareaRE = regexp.MustCompile(commonCloudRE(0) + `,? *\(?` + cloudBaseInSubareaRE(1) + `.*\)?`)

	// BKN CU/SC 4000/9000FT (3000/ABV10000FT IN A1)
	areaAndAltLayersSubareaRE = regexp.MustCompile(commonCloudRE(0) + `.+\(` + altLayerRE + `.*\)`)

	// BKN ST 1000/4000FT B1, B2
	subareasOnlyRE = regexp.MustCompile(commonCloudRE(0) + " +" + subareasOnlyFilters)

	// BKN SC 6000/ABV10000FT IN B2, SCT IN B1
	subareaOnlyWithAltSubareaRE = regexp.MustCompile(commonCloudRE(0) + " +" + inRE + subareaLabelRE(1) + `, *` + cloudAmountInSubareaRE(2))

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
		parser.EntireAreaCloud = areaCloud
		parser.Subareas = map[string]*CloudLayer{}

		for i := 1; i <= 2; i++ {
			subareaCloud := *areaCloud
			subareaCloud.Amount = match[matchKey("cloudAmount", i)]
			subareaCloud.updateForNightOnly()
			subarea := match[matchKey("subarea", i)]
			parser.Subareas[subarea] = &subareaCloud
		}
		return
	}

	// SCT CU/SC 3000/8000FT (BKN IN A1)
	if match, ok := parseNamedRegexp(areaAndAltAmountSubareaRE, text); ok {
		areaCloud := newCloudLayerFromFromRegexpMatch(match, 0)
		parser.EntireAreaCloud = areaCloud

		subareaCloud := *areaCloud
		subareaCloud.Amount = match["cloudAmount1"]
		subareaCloud.updateForNightOnly()
		subarea := match["subarea1"]

		parser.Subareas = map[string]*CloudLayer{}
		parser.Subareas[subarea] = &subareaCloud
		return
	}

	// SCT CU/SC 4000/7000FT (BASES 3000FT A2)
	// SCT CU/SC 4000/7000FT (BKN BASE 3000FT A2)
	if match, ok := parseNamedRegexp(areaAndAltBaseSubareaRE, text); ok {
		areaCloud := newCloudLayerFromFromRegexpMatch(match, 0)
		parser.EntireAreaCloud = areaCloud

		subareaCloud := *areaCloud
		subareaCloud.Base, _ = strconv.ParseUint(match["cloudBase1"], 10, 64)
		if len(match["cloudAmount1"]) > 0 {
			subareaCloud.Amount = match["cloudAmount1"]
			// subarea might be BKN, but main was FEW
			subareaCloud.Top = areaCloud.NightOnlyTop
		}
		subareaCloud.updateForNightOnly()
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
		subareaCloud.updateForNightOnly()
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

		parser.Subareas = map[string]*CloudLayer{}
		parser.Subareas[subarea1] = &cloud
		parser.Subareas[subarea2] = &cloud

		return
	}

	// BKN SC 6000/ABV10000FT IN B2, SCT IN B1
	if match, ok := parseNamedRegexp(subareaOnlyWithAltSubareaRE, text); ok {
		cloud := *newCloudLayerFromFromRegexpMatch(match, 0)
		subarea1 := match["subarea1"]
		subarea2 := match["subarea2"]

		parser.Subareas = map[string]*CloudLayer{}
		parser.Subareas[subarea1] = &cloud

		cloud2 := cloud
		cloud2.Amount = match["cloudAmount2"]
		parser.Subareas[subarea2] = &cloud2

		return
	}

	// SCT CU/SC 5000/8000FT IN A1 ONLY
	if match, ok := parseNamedRegexp(subareaOnlyRE, text); ok {
		cloud := newCloudLayerFromFromRegexpMatch(match, 0)
		subarea := match["subarea1"]

		parser.Subareas = map[string]*CloudLayer{}
		parser.Subareas[subarea] = cloud
		return
	}

	// SCT CU/SC 5000/8000FT
	if match, ok := parseNamedRegexp(simpleRE, text); ok {
		cloud := newCloudLayerFromFromRegexpMatch(match, 0)
		parser.EntireAreaCloud = cloud

		return
	}

	return
}

func matchKey(key string, i int) string {
	return fmt.Sprintf(key+"%d", i)
}

func newCloudLayerFromFromRegexpMatch(match map[string]string, i int) (cloudLayer *CloudLayer) {
	cloudLayer = &CloudLayer{}
	cloudLayer.Amount = match[matchKey("cloudAmount", i)]
	cloudLayer.Type = match[matchKey("cloudType", i)]
	cloudLayer.Base, _ = strconv.ParseUint(match[matchKey("cloudBase", i)], 10, 64)
	cloudLayer.Top, _ = strconv.ParseUint(match[matchKey("cloudTop", i)], 10, 64)
	cloudLayer.updateForNightOnly()

	cloudLayer.Cumulus = cloudLayer.Type == "CB" || cloudLayer.Type == "TCU"

	cloudLayer.SeaOnly = len(match["sea"]) > 0 && len(match["land"]) == 0
	if cloudLayer.SeaOnly {
		cloudLayer.Base = codes.IgnoreMeCloudBase
		cloudLayer.Top = codes.IgnoreMeCloudTop
		cloudLayer.NightOnlyBase = codes.IgnoreMeCloudBase
		cloudLayer.NightOnlyTop = codes.IgnoreMeCloudTop
	}

	return
}

func (cloudLayer *CloudLayer) updateForNightOnly() {
	if cloudLayer.Base != codes.IgnoreMeCloudBase {
		cloudLayer.NightOnlyBase = cloudLayer.Base
		cloudLayer.NightOnlyTop = cloudLayer.Top
	}
	if cloudLayer.Amount == "FEW" {
		cloudLayer.Base = codes.IgnoreMeCloudBase
		cloudLayer.Top = codes.IgnoreMeCloudTop
	} else {
		if cloudLayer.Base == codes.IgnoreMeCloudBase {
			cloudLayer.Base = cloudLayer.NightOnlyBase
			cloudLayer.Top = cloudLayer.NightOnlyTop
		}
	}
}
