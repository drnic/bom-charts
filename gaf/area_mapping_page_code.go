package gaf

import (
	"fmt"
	"time"
)

type AreaMappingPageCode struct {
	Code           string
	CurrentGAFCode string
	NextGAFCode    string
}

// NewAreaMappingPageCode constructs an Area, and sets GAF Codes for current UTC time
func NewAreaMappingPageCode(code string) (area *AreaMappingPageCode, err error) {
	if !ValidArea(code) {
		return nil, fmt.Errorf("Invalid area code: %s", code)
	}
	area = &AreaMappingPageCode{Code: code}
	area.Update()
	return
}

// ValidArea returns true if area is in Areas list
func ValidArea(area string) bool {
	for _, validArea := range Areas {
		if area == validArea {
			return true
		}
	}
	return false
}

// Update sets the GAFCodes for the current UTC hour
func (area *AreaMappingPageCode) Update() {
	now := time.Now()
	area.UpdateForUTCHour(now.UTC().Hour())
}

// UpdateForUTCHour sets the GAFCodes for the specific UTC hour
func (area *AreaMappingPageCode) UpdateForUTCHour(nowUTCHour int) *AreaMappingPageCode {
	if nowUTCHour >= 5 && nowUTCHour < 11 {
		area.CurrentGAFCode = AreaMapping[area.Code][0]
		area.NextGAFCode = AreaMapping[area.Code][1]
	} else if nowUTCHour >= 11 && nowUTCHour < 17 {
		area.CurrentGAFCode = AreaMapping[area.Code][1]
		area.NextGAFCode = AreaMapping[area.Code][2]
	} else if nowUTCHour >= 17 && nowUTCHour < 23 {
		area.CurrentGAFCode = AreaMapping[area.Code][2]
		area.NextGAFCode = AreaMapping[area.Code][3]
	} else {
		area.CurrentGAFCode = AreaMapping[area.Code][3]
		area.NextGAFCode = AreaMapping[area.Code][0]
	}
	return area
}
