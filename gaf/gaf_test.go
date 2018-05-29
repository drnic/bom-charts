package gaf_test

import (
	"io/ioutil"
	"os"
	"path/filepath"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	httpmock "gopkg.in/jarcoal/httpmock.v1"

	. "github.com/drnic/bom-charts/gaf"
)

var _ = BeforeSuite(func() {
	// block all HTTP requests
	httpmock.Activate()
})

var _ = BeforeEach(func() {
	// remove any mocks
	httpmock.Reset()
})

var _ = AfterSuite(func() {
	httpmock.DeactivateAndReset()
})

var _ = Describe("Page", func() {
	It("Converts from XML to JSON", func() {
		wd, _ := os.Getwd()

		xmlTestdataFile, err := os.Open(filepath.Join(wd, "testdata/gaf/IDY42082.xml"))
		Ω(err).ShouldNot(HaveOccurred())

		xmlTestdata, err := ioutil.ReadAll(xmlTestdataFile)
		Ω(err).ShouldNot(HaveOccurred())

		httpmock.RegisterResponder("GET", "http://www.bom.gov.au/fwo/aviation/IDY42082.xml",
			httpmock.NewStringResponder(200, string(xmlTestdata)))

		forecast, err := NewAreaForecast("IDY42082")
		Ω(err).ShouldNot(HaveOccurred())
		Expect(forecast.GAFAreaID).To(Equal("NSW-E"))
		Expect(forecast.From).To(Equal("2018-05-22T05:00:00Z"))
		Expect(forecast.Till).To(Equal("2018-05-22T11:00:00Z"))
		Expect(len(forecast.Boundary.Points)).To(Equal(7))
		Expect(forecast.Boundary.Points[0]).To(Equal([]float64{152.67, -34.33}))

		aRegion := forecast.Areas[0]
		Expect(aRegion.AreaID).To(Equal("A"))
		Expect(aRegion.FreezingLevel).To(Equal("ABV 10000FT (10000FT IN S, 8500FT IN A2 FM 09Z)"))

		// BKN ST 2000/6000FT IN A1
		// SCT CU/SC 3000/7000FT
		Expect(aRegion.CloudBase).To(Equal(uint64(3000))) // main area, not A1
		Expect(aRegion.CloudTop).To(Equal(uint64(7000)))

		Expect(len(aRegion.WxCond)).To(Equal(4))
		Expect(int(aRegion.WxCond[0].SurfaceVisWx.SurfaceVisibility)).To(Equal(10000))
		Expect(int(aRegion.WxCond[1].SurfaceVisWx.SurfaceVisibility)).To(Equal(4000))
		Expect(int(aRegion.WxCond[2].SurfaceVisWx.SurfaceVisibility)).To(Equal(200))
		Expect(int(aRegion.WxCond[3].SurfaceVisWx.SurfaceVisibility)).To(Equal(0))
		Expect(aRegion.WxCond[0].SurfaceVisWx.SubAreasMentioned).To(BeNil())
		Expect(aRegion.WxCond[1].SurfaceVisWx.SubAreasMentioned).To(Equal([]string{"A1", "A2"}))
		Expect(aRegion.WxCond[2].SurfaceVisWx.SubAreasMentioned).To(Equal([]string{"A1"}))
		Expect(aRegion.WxCond[3].SurfaceVisWx.SubAreasMentioned).To(BeNil())

		Expect(aRegion.WxCond[0].CloudIceTurbulence[0].SubAreasMentioned).To(Equal([]string{"A1"}))
		Expect(aRegion.WxCond[0].CloudIceTurbulence[1].SubAreasMentioned).To(BeNil())
		Expect(aRegion.WxCond[1].CloudIceTurbulence[0].SubAreasMentioned).To(BeNil())
		Expect(aRegion.WxCond[1].CloudIceTurbulence[1].SubAreasMentioned).To(BeNil())
		Expect(aRegion.WxCond[2].CloudIceTurbulence[0].SubAreasMentioned).To(BeNil())
		Expect(aRegion.WxCond[3].CloudIceTurbulence[0].SubAreasMentioned).To(BeNil())

		Expect(aRegion.Boundary.Points[0]).To(Equal([]float64{152.67, -34.33}))
		Expect(len(aRegion.SubAreas)).To(Equal(2))
		Expect(aRegion.SubAreas[0].AreaID).To(Equal("A"))
		Expect(aRegion.SubAreas[0].SubAreaID).To(Equal("A1"))
		Expect(aRegion.SubAreas[0].CloudBase).To(Equal(uint64(2000))) // BKN ST 2000/6000FT IN A1
		Expect(aRegion.SubAreas[0].CloudTop).To(Equal(uint64(6000)))
		Expect(aRegion.SubAreas[0].Boundary.Points[0]).To(Equal([]float64{149.87, -37.47}))
		Expect(aRegion.SubAreas[1].SubAreaID).To(Equal("A2"))
		Expect(aRegion.SubAreas[1].CloudBase).To(Equal(uint64(3000))) // SCT CU/SC 3000/7000FT
		Expect(aRegion.SubAreas[1].CloudTop).To(Equal(uint64(7000)))
		Expect(aRegion.SubAreas[1].Boundary.Points[0]).To(Equal([]float64{152.45, -34.78}))

		bRegion := forecast.Areas[1]
		Expect(bRegion.AreaID).To(Equal("B"))
		Expect(bRegion.FreezingLevel).To(Equal("ABV 10000FT"))
		Expect(len(bRegion.WxCond)).To(Equal(2))
		Expect(bRegion.Boundary.Points[0]).To(Equal([]float64{148.45, -32.70}))
		Expect(len(bRegion.SubAreas)).To(Equal(0))

		// FEW CU/SC 3000/6000FT - ignore
		Expect(bRegion.CloudBase).To(Equal(uint64(999999)))
		Expect(bRegion.CloudTop).To(Equal(uint64(0)))
	})
})

// TODO: ignore FEW, and use SCT+ for cloud bases
// FEW ST 1500/3000FT FM 09Z
// SCT CU/SC 4000/7000FT (BASES 3000FT SEA)
//
// FEW ST 2500/5000FT
// BKN CU/SC 4000/7000FT
//
// FEW CU/SC 4000/7000FT (SCT IN B1, B2, AND IN B3 TL 08Z)
// SCT AC/AS 6000/ABV10000FT (BKN IN B1, BKN IN B2 FM 08Z, IN B3 TL 08Z)
//
// SCT ST 0800/5000FT
// BKN AC/AS 6000/ABV10000FT

// FEW ST 1500/3000FT
// FEW CU/SC 4000/7000FT (BASES 3000FT SEA)
// SCT AC/AS 6000/ABV10000FT IN SW FM 15Z

// TODO: CB is first; but lowest cloud might be later
// ISOL CB 6000/ABV10000FT
// BKN ST 1000/5000FT
// BKN CU/SC 4000/7000FT
// BKN AC/AS 6000/ABV10000FT
