package parser_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	. "github.com/drnic/bom-charts/parser"
)

var _ = Describe("CloudIcingTurbParser", func() {

	var _ = Describe("simple", func() {
		It("Parses BKN ST 1000/5000FT", func() {
			text := "BKN ST 1000/5000FT"
			p, _ := NewCloudIcingTurbParser(text)
			Expect(*p.EntireAreaCloud).To(Equal(CloudLayer{Amount: "BKN", Type: "ST", Base: 1000, Top: 5000, Cumulus: false}))
		})

		It("Parses BKN CU/SC 1000/5000FT LAND", func() {
			text := "BKN CU/SC 1000/5000FT LAND"
			p, _ := NewCloudIcingTurbParser(text)
			Expect(*p.EntireAreaCloud).To(Equal(CloudLayer{Amount: "BKN", Type: "CU/SC", Base: 1000, Top: 5000, Cumulus: false}))
		})

		It("Parses SCT CU/SC 3000/ABV10000FT", func() {
			text := "SCT CU/SC 3000/ABV10000FT"
			p, _ := NewCloudIcingTurbParser(text)
			Expect(*p.EntireAreaCloud).To(Equal(CloudLayer{Amount: "SCT", Type: "CU/SC", Base: 3000, Top: 10000, Cumulus: false}))
		})

		It("Parses ISOL TCU 2000/ABV10000FT", func() {
			text := "ISOL TCU 2000/ABV10000FT"
			p, _ := NewCloudIcingTurbParser(text)
			Expect(*p.EntireAreaCloud).To(Equal(CloudLayer{Amount: "ISOL", Type: "TCU", Base: 2000, Top: 10000, Cumulus: true}))
		})
	})

	var _ = Describe("only in subarea", func() {
		It("Parses SCT CU/SC 5000/8000FT IN A1 ONLY", func() {
			text := "SCT CU/SC 5000/8000FT IN A1 ONLY"
			p, _ := NewCloudIcingTurbParser(text)
			Expect(p.EntireAreaCloud).To(BeNil())
			Expect(*p.Subareas["A1"]).To(Equal(CloudLayer{Amount: "SCT", Type: "CU/SC", Base: 5000, Top: 8000, Cumulus: false}))
		})

		It("Parses SCT ST 1000/3000FT A1 ONLY FM 09Z", func() {
			text := "SCT ST 1000/3000FT A1 ONLY FM 09Z"
			p, _ := NewCloudIcingTurbParser(text)
			Expect(p.EntireAreaCloud).To(BeNil())
			Expect(*p.Subareas["A1"]).To(Equal(CloudLayer{Amount: "SCT", Type: "ST", Base: 1000, Top: 3000, Cumulus: false}))
		})

		It("Parses SCT SC 2500/4000FT A3 FM 01Z", func() {
			text := "SCT SC 2500/4000FT A3 FM 01Z"
			p, _ := NewCloudIcingTurbParser(text)
			Expect(p.EntireAreaCloud).To(BeNil())
			Expect(*p.Subareas["A3"]).To(Equal(CloudLayer{Amount: "SCT", Type: "SC", Base: 2500, Top: 4000, Cumulus: false}))
		})

		It("Parses BKN SC 3000/4000FT IN A1 ONLY", func() {
			text := "BKN SC 3000/4000FT IN A1 ONLY"
			p, _ := NewCloudIcingTurbParser(text)
			Expect(p.EntireAreaCloud).To(BeNil())
			Expect(*p.Subareas["A1"]).To(Equal(CloudLayer{Amount: "BKN", Type: "SC", Base: 3000, Top: 4000, Cumulus: false}))
		})
	})

	var _ = Describe("main area and alternate for a subarea", func() {
		It("Parses SCT CU/SC 3000/8000FT (BKN IN A1)", func() {
			text := "SCT CU/SC 3000/8000FT (BKN IN A1)"
			p, _ := NewCloudIcingTurbParser(text)
			Expect(*p.EntireAreaCloud).To(Equal(CloudLayer{Amount: "SCT", Type: "CU/SC", Base: 3000, Top: 8000, Cumulus: false}))
			Expect(*p.Subareas["A1"]).To(Equal(CloudLayer{Amount: "BKN", Type: "CU/SC", Base: 3000, Top: 8000, Cumulus: false}))
		})

		It("Parses SCT ST 1500/2500FT LAND (BKN A2)", func() {
			text := "SCT ST 1500/2500FT LAND (BKN A2)"
			p, _ := NewCloudIcingTurbParser(text)
			Expect(*p.EntireAreaCloud).To(Equal(CloudLayer{Amount: "SCT", Type: "ST", Base: 1500, Top: 2500, Cumulus: false}))
			Expect(*p.Subareas["A2"]).To(Equal(CloudLayer{Amount: "BKN", Type: "ST", Base: 1500, Top: 2500, Cumulus: false}))
		})
	})

	// TODO:
	// FEW SC 3000/5000FT SEA
	// SCT SC 2000/4000FT SEA W OF YPPD
	// SCT CU/SC 3000/10000FT, BKN SEA
	// SCT ST 1500/2500FT LAND (BKN A2)
	// SCT CU/SC 5000/7000FT LAND N YDMN
	// SCT CU/SC 4000/7000FT A1 (BASES 3000FT A2)
	// SCT CU/SC 7000/ABV10000FT, BASES 5000FT AT SEA
	// SCT CU/SC 3000/10000FT (BASES 2500FT IN A1)
	// SCT CU/SC 3000/5000FT (FEW IN B1, BKN IN B2)
	// SCT CU/SC 2500/5000FT (BKN BASE 2000FT A1)
	// SCT CU/SC 6000/10000FT (3000/7000FT IN C1) BASES 2000FT SEA
	// SCT CU/SC 3000/ABV10000FT (BKN BASES 2500FT IN B1)
	// FEW CU/SC 4000/7000FT (BKN IN A3 TL 23Z, BASES 3000FT SEA)
	// SCT CU/SC 5000/8000FT, BASES 3000FT E OF YBRK/YGAY/TBL
	// SCT ST 1500/3000FT, BASE 1000FT SEA (BKN IN B1)
	// SCT CU 2500/7000FT (A1 TL 09Z, BASE 4000FT)
	// BKN SC 3000/6000FT, SCT INLAND (BASE 4000FT A1)
	// FEW CU/SC 5000/9000FT SEA/LAND WI 20NM OF COAST (BASES 3000FT SEA)
	// SCT CU/SC 3000/ABV10000FT (BKN BASES 2500FT IN B1)
	// SCT CU/SC 5000/8000FT, BASES 3000FT E OF YBRK/YGAY/TBL
	// SCT CU/SC 3000/ABV10000FT, BASE 2000FT SEA
	// SCT ST 1500/2500FT B1, W SEA/COAST
	// BKN CU/SC 2500/8000FT NE OF YBWP/YCKN
	// SCT ST 1500/3000FT (BKN FM 14Z IN B1 ONLY)
	// FEW ST 1500/2500FT, BECMG SCT FM 14Z
	// SCT ST 1000/3000FT C1, BKN FM 14Z
	// FEW CU/SC 2500/4500FT, SCT W OF 144E
	// BKN CU/SC 3000/5000FT, SCT E OF WELS/FLIKI, (FEW IN B2 FM 03Z)
	// FEW CU/SC 3500/4500FT S OF HYDRA/YADG/YBOR
	// BKN ST 2000/4000FT LAND TL 02Z (CEASING IN B1 FM 01Z)
	// BKN ST 2000/4000FT LAND TL 02Z

	// SCT AC/AS 9000/ABV10000FT LAND NE YKLI/YHLC
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
	// MOD TURB BLW 8000FT, SEV S OF S3700
})
