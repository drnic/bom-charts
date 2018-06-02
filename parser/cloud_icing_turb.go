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
	ignoreLandOrSeaRE := ` *(?:LAND)?/?(?:SEA)? *`
	return cloudAmountRE(i) + " +" + cloudTypeRE + " +" + cloudBaseTopRE(i) + ignoreLandOrSeaRE
}

func init() {
	subareaLabelRE := `(?P<subarea>\w\d+)`
	inRE := `(?:IN )?`
	subareaOnlyFilters := inRE + subareaLabelRE
	subareasOnlyFilters := inRE + subareaLabelRE + ", " + inRE + subareaLabelRE
	cloudAmountInSubareaRE := cloudAmountRE(1) + " +" + subareaOnlyFilters
	cloudBaseInSubareaRE := `BASES? +(?:ABV)?(?P<cloudBaseSubArea>\d+)FT +` + subareaOnlyFilters
	altLayerRE := cloudBaseTopRE(1) + " +" + subareaOnlyFilters

	// SCT CU/SC 3000/5000FT (OVC IN B1, BKN IN B2)
	areaAndAltAmountSubareasRE = regexp.MustCompile(commonCloudRE(0) + `.+\(` + cloudAmountInSubareaRE + `, *` + cloudAmountInSubareaRE + `.*\)`)

	// SCT CU/SC 3000/8000FT (BKN IN A1)
	areaAndAltAmountSubareaRE = regexp.MustCompile(commonCloudRE(0) + `.+\(` + cloudAmountInSubareaRE + `.*\)`)

	// SCT CU/SC 4000/7000FT (BASES 3000FT A2)
	// SCT CU 3000/7000FT, BASE 2500FT IN C1
	areaAndAltBaseSubareaRE = regexp.MustCompile(commonCloudRE(0) + `,? *.+\(?` + cloudBaseInSubareaRE + `.*\)?`)

	// BKN CU/SC 4000/9000FT (3000/ABV10000FT IN A1)
	areaAndAltLayersSubareaRE = regexp.MustCompile(commonCloudRE(0) + `.+\(?` + altLayerRE + `.*\)`)

	// BKN ST 1000/4000FT B1, B2
	subareasOnlyRE = regexp.MustCompile(commonCloudRE(0) + " +" + subareasOnlyFilters)

	// SCT CU/SC 5000/8000FT IN A1 ONLY
	subareaOnlyRE = regexp.MustCompile(commonCloudRE(0) + " +" + subareaOnlyFilters)

	// BKN ST 1000/5000FT
	simpleRE = regexp.MustCompile(commonCloudRE(0))
}

// NewCloudIcingTurbParser parses Cloud/Icing/Turbulance text
func NewCloudIcingTurbParser(text string) (parser *CloudIcingTurbParser, err error) {
	parser = &CloudIcingTurbParser{}

	// SCT CU/SC 3000/5000FT (OVC IN B1, BKN IN B2)
	if matches := areaAndAltAmountSubareasRE.FindAllStringSubmatch(text, -1); matches != nil {
		areaCloud := &CloudLayer{}
		areaCloud.Amount = matches[0][1]
		areaCloud.Type = matches[0][2]
		areaCloud.Base, _ = strconv.ParseUint(matches[0][3], 10, 64)
		areaCloud.Top, _ = strconv.ParseUint(matches[0][4], 10, 64)
		areaCloud.Cumulus = areaCloud.Type == "CB" || areaCloud.Type == "TCU"
		if areaCloud.Amount != "FEW" {
			parser.EntireAreaCloud = areaCloud
		}
		parser.Subareas = map[string]*CloudLayer{}

		subareaCloud1 := *areaCloud
		subareaCloud1.Amount = matches[0][5]
		if subareaCloud1.Amount == "FEW" {
			subareaCloud1.Base = codes.IgnoreMeCloudBase
			subareaCloud1.Top = codes.IgnoreMeCloudTop
		}
		subarea1 := matches[0][6]
		parser.Subareas[subarea1] = &subareaCloud1

		subareaCloud2 := *areaCloud
		subareaCloud2.Amount = matches[0][7]
		if subareaCloud2.Amount == "FEW" {
			subareaCloud2.Base = codes.IgnoreMeCloudBase
			subareaCloud2.Top = codes.IgnoreMeCloudTop
		}
		subarea2 := matches[0][8]
		parser.Subareas[subarea2] = &subareaCloud2
		return
	}

	// SCT CU/SC 3000/8000FT (BKN IN A1)
	if matches := areaAndAltAmountSubareaRE.FindAllStringSubmatch(text, -1); matches != nil {
		areaCloud := &CloudLayer{}
		areaCloud.Amount = matches[0][1]
		areaCloud.Type = matches[0][2]
		areaCloud.Base, _ = strconv.ParseUint(matches[0][3], 10, 64)
		areaCloud.Top, _ = strconv.ParseUint(matches[0][4], 10, 64)
		areaCloud.Cumulus = areaCloud.Type == "CB" || areaCloud.Type == "TCU"
		if areaCloud.Amount != "FEW" {
			parser.EntireAreaCloud = areaCloud
		}
		subareaCloud := *areaCloud
		subareaCloud.Amount = matches[0][5]
		subarea := matches[0][6]
		if subareaCloud.Amount == "FEW" {
			subareaCloud.Base = codes.IgnoreMeCloudBase
			subareaCloud.Top = codes.IgnoreMeCloudTop
		}

		parser.Subareas = map[string]*CloudLayer{}
		parser.Subareas[subarea] = &subareaCloud
		return
	}

	// SCT CU/SC 4000/7000FT (BASES 3000FT A2)
	if matches := areaAndAltBaseSubareaRE.FindAllStringSubmatch(text, -1); matches != nil {
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

	// BKN CU/SC 4000/9000FT (3000/ABV10000FT IN A1)
	if matches := areaAndAltLayersSubareaRE.FindStringSubmatch(text); matches != nil {
		fmt.Printf("%v\n", areaAndAltLayersSubareaRE)
		fmt.Printf("%#v\n", matches)
		fmt.Printf("%#v\n", areaAndAltLayersSubareaRE.SubexpNames())
		// areaCloud := &CloudLayer{}
		// areaCloud.Amount = matches[0][1]
		// areaCloud.Type = matches[0][2]
		// areaCloud.Base, _ = strconv.ParseUint(matches[0][3], 10, 64)
		// areaCloud.Top, _ = strconv.ParseUint(matches[0][4], 10, 64)
		// areaCloud.Cumulus = areaCloud.Type == "CB" || areaCloud.Type == "TCU"
		// parser.EntireAreaCloud = areaCloud

		// subareaCloud := *areaCloud
		// subareaCloud.Base, _ = strconv.ParseUint(matches[0][5], 10, 64)
		// subareaCloud.Top, _ = strconv.ParseUint(matches[0][6], 10, 64)
		// subarea := matches[0][7]

		// parser.Subareas = map[string]*CloudLayer{}
		// parser.Subareas[subarea] = &subareaCloud
		return
	}

	// BKN ST 1000/4000FT B1, B2
	if matches := subareasOnlyRE.FindAllStringSubmatch(text, -1); matches != nil {
		cloud := CloudLayer{}
		cloud.Amount = matches[0][1]
		cloud.Type = matches[0][2]
		cloud.Base, _ = strconv.ParseUint(matches[0][3], 10, 64)
		cloud.Top, _ = strconv.ParseUint(matches[0][4], 10, 64)
		cloud.Cumulus = cloud.Type == "CB" || cloud.Type == "TCU"
		subarea1 := matches[0][5]
		subarea2 := matches[0][6]

		if cloud.Amount != "FEW" {
			parser.Subareas = map[string]*CloudLayer{}
			parser.Subareas[subarea1] = &cloud
			parser.Subareas[subarea2] = &cloud
		}
		return
	}

	// SCT CU/SC 5000/8000FT IN A1 ONLY
	if matches := subareaOnlyRE.FindAllStringSubmatch(text, -1); matches != nil {
		cloud := &CloudLayer{}
		cloud.Amount = matches[0][1]
		cloud.Type = matches[0][2]
		cloud.Base, _ = strconv.ParseUint(matches[0][3], 10, 64)
		cloud.Top, _ = strconv.ParseUint(matches[0][4], 10, 64)
		cloud.Cumulus = cloud.Type == "CB" || cloud.Type == "TCU"
		subarea := matches[0][5]

		if cloud.Amount != "FEW" {
			parser.Subareas = map[string]*CloudLayer{}
			parser.Subareas[subarea] = cloud
		}
		return
	}

	// BKN ST 1000/5000FT
	if matches := simpleRE.FindAllStringSubmatch(text, -1); matches != nil {
		cloud := &CloudLayer{}
		cloud.Amount = matches[0][1]
		cloud.Type = matches[0][2]
		cloud.Base, _ = strconv.ParseUint(matches[0][3], 10, 64)
		cloud.Top, _ = strconv.ParseUint(matches[0][4], 10, 64)
		cloud.Cumulus = cloud.Type == "CB" || cloud.Type == "TCU"

		if cloud.Amount != "FEW" {
			parser.EntireAreaCloud = cloud
		}
		return
	}

	return
}
