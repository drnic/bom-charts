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
		Expect(*p.Cloud).To(Equal(CloudLayer{Amount: "BKN", Type: "ST", Base: 1000, Top: 5000}))
	})

	It("Parses BKN CU/SC 1000/5000FT LAND", func() {
		text := "BKN CU/SC 1000/5000FT LAND"
		p, _ := NewCloudIcingTurbParser(text)
		Expect(*p.Cloud).To(Equal(CloudLayer{Amount: "BKN", Type: "CU/SC", Base: 1000, Top: 5000}))
	})

	It("Parses SCT CU/SC 3000/ABV10000FT", func() {
		text := "SCT CU/SC 3000/ABV10000FT"
		p, _ := NewCloudIcingTurbParser(text)
		Expect(*p.Cloud).To(Equal(CloudLayer{Amount: "SCT", Type: "CU/SC", Base: 3000, Top: 10000}))
	})

	It("Parses ISOL TCU 2000/ABV10000FT", func() {
		text := "ISOL TCU 2000/ABV10000FT"
		p, _ := NewCloudIcingTurbParser(text)
		Expect(*p.Cumulus).To(Equal(CloudLayer{Amount: "ISOL", Type: "TCU", Base: 2000, Top: 10000}))
	})

	// TODO:
	// * ISOL/OCNL/FREQ are spatial coverage abbr for CB + TCU
	// * TCU = "Towering Cumulus"
	// * CB = "Cumulonimbus"
	// ISOL TCU 2000/ABV10000FT A1 ONLY
	// OCNL TCU 2500/ABV10000FT (WDSPR B1 FM 11Z, OCNL B1 FM 15Z)
	// * look for "EMBD"

	// FEW SC 3000/5000FT SEA
	// SCT SC 2000/4000FT SEA W OF YPPD
	// SCT CU/SC 5000/8000FT IN A1 ONLY
	// SCT CU/SC 3000/10000FT, BKN SEA
	// SCT SC 2500/4000FT A3 FM 01Z
	// SCT CU/SC 3000/8000FT (BKN IN A1)
	// SCT ST 1500/2500FT LAND (BKN A2)
	// SCT CU/SC 5000/7000FT LAND N YDMN
	// SCT CU/SC 7000/ABV10000FT, BASES 5000FT AT SEA
	// SCT CU/SC 3000/5000FT (FEW IN B1, BKN IN B2)
	// SCT CU/SC 2500/5000FT (BKN BASE 2000FT A1)
	// SCT CU/SC 3000/ABV10000FT (BKN BASES 2500FT IN B1)
	// SCT CU/SC 5000/8000FT, BASES 3000FT E OF YBRK/YGAY/TBL
	// SCT ST 1500/3000FT, BASE 1000FT SEA (BKN IN B1)
	// FEW CU/SC 5000/9000FT SEA/LAND WI 20NM OF COAST (BASES 3000FT SEA)
	// SCT CU/SC 3000/ABV10000FT (BKN BASES 2500FT IN B1)
	// SCT CU/SC 5000/8000FT, BASES 3000FT E OF YBRK/YGAY/TBL
	// SCT CU/SC 3000/ABV10000FT, BASE 2000FT SEA
	// BKN CU/SC 2500/8000FT NE OF YBWP/YCKN
	// BKN SC 3000/4000FT IN A1 ONLY - SCT FM 08Z
	// SCT ST 1500/3000FT (BKN FM 14Z IN B1 ONLY)
	// FEW ST 1500/2500FT, BECMG SCT FM 14Z
	// SCT ST 1000/3000FT C1, BKN FM 14Z
	// FEW CU/SC 2500/4500FT, SCT W OF 144E
	// BKN CU/SC 3000/5000FT, SCT E OF WELS/FLIKI, (FEW IN B2 FM 03Z)
	// FEW CU/SC 3500/4500FT S OF HYDRA/YADG/YBOR
	// BKN ST 2000/4000FT LAND TL 02Z (CEASING IN B1 FM 01Z)
	// BKN ST 2000/4000FT LAND TL 02Z

	// BKN AC/AS 8000/ABV10000FT
	// BKN AC/AS ABV10000FT
	// BKN AC/AS 9000/ABV10000FT SW OF BIDAP/LTL/YCAG

	// MOD TURB BLW 5000FT A1
	// MOD TURB BLW 6000FT SE OF YBOM/YMRY TL 14Z
	// MOD TURB BLW 6000FT LAND N OF YCKN
	// MOD TURB BLW 7000FT AND IN THERMALS
	// MOD TURB BLW 5000FT, SEV S OF LKG TL 02Z
	// MOD TURB BLW 5000FT (SEV C1)
	// MOD TURB BLW 7000FT IN THERMALS LAND N OF YCHK/YBGO FM 04Z
})
