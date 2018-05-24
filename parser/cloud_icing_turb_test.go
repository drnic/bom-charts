package parser_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	. "github.com/drnic/bom-charts/parser"
)

var _ = Describe("CloudIcingTurbParser", func() {

	It("Parses BKN ST 1000/5000FT", func() {
		text := "BKN ST 1000/5000FT"
		p, _ := NewCloudIcingTurbParser(text)
		Expect(*p.Cloud).To(Equal(CloudLayer{"BKN", "ST", 1000, 5000}))
	})

	It("Parses BKN CU/SC 1000/5000FT LAND", func() {
		text := "BKN CU/SC 1000/5000FT LAND"
		p, _ := NewCloudIcingTurbParser(text)
		Expect(*p.Cloud).To(Equal(CloudLayer{"BKN", "CU/SC", 1000, 5000}))
	})

	It("Parses SCT CU/SC 3000/ABV10000FT", func() {
		text := "SCT CU/SC 3000/ABV10000FT"
		p, _ := NewCloudIcingTurbParser(text)
		Expect(*p.Cloud).To(Equal(CloudLayer{"SCT", "CU/SC", 3000, 10000}))
	})

	It("Parses ISOL TCU 2000/ABV10000FT", func() {
		text := "ISOL TCU 2000/ABV10000FT"
		p, _ := NewCloudIcingTurbParser(text)
		Expect(*p.Cumulus).To(Equal(CloudLayer{"ISOL", "TCU", 2000, 10000}))
	})

	// TODO:
	// * ISOL/OCNL/FREQ are spatial coverage abbr for CB + TCU
	// * TCU = "Towering Cumulus"
	// * CB = "Cumulonimbus"
	// ISOL TCU 2000/ABV10000FT A1 ONLY
	// OCNL TCU 2500/ABV10000FT (WDSPR B1 FM 11Z, OCNL B1 FM 15Z)
	// * look for "EMBD"

	// BKN AC/AS ABV10000FT
	// SCT CU/SC 5000/8000FT IN A1 ONLY
	// SCT CU/SC 3000/8000FT (BKN IN A1)
	// SCT ST 1500/2500FT LAND (BKN A2)
	// SCT CU/SC 2500/5000FT (BKN BASE 2000FT A1)
	// SCT CU/SC 3000/ABV10000FT, BASE 2000FT SEA
	// BKN CU/SC 2500/8000FT NE OF YBWP/YCKN
	// SCT ST 1500/3000FT (BKN FM 14Z IN B1 ONLY)
	// FEW ST 1500/2500FT, BECMG SCT FM 14Z
	// SCT ST 1000/3000FT C1, BKN FM 14Z
	// FEW CU/SC 2500/4500FT, SCT W OF 144E

	// MOD TURB BLW 6000FT SE OF YBOM/YMRY TL 14Z
	// MOD TURB BLW 6000FT LAND N OF YCKN
})
