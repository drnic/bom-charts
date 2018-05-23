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
		Expect(forecast.AreaID).To(Equal("NSW-E"))
		Expect(forecast.From).To(Equal("2018-05-22T05:00:00Z"))
		Expect(forecast.Till).To(Equal("2018-05-22T11:00:00Z"))
		Expect(len(forecast.Boundary.Points)).To(Equal(7))
		Expect(forecast.Boundary.Points[0]).To(Equal([]float64{152.67, -34.33}))

		aRegion := forecast.Areas[0]
		Expect(aRegion.ID).To(Equal("A"))
		Expect(aRegion.FreezingLevel).To(Equal("ABV 10000FT (10000FT IN S, 8500FT IN A2 FM 09Z)"))
		Expect(len(aRegion.WxCond)).To(Equal(4))
		Expect(int(aRegion.WxCond[0].SurfaceVisWx.SurfaceVisibility)).To(Equal(10000))
		Expect(int(aRegion.WxCond[1].SurfaceVisWx.SurfaceVisibility)).To(Equal(4000))
		Expect(int(aRegion.WxCond[2].SurfaceVisWx.SurfaceVisibility)).To(Equal(200))
		Expect(int(aRegion.WxCond[3].SurfaceVisWx.SurfaceVisibility)).To(Equal(0))
		Expect(aRegion.Boundary.Points[0]).To(Equal([]float64{152.67, -34.33}))
		Expect(len(aRegion.SubAreas)).To(Equal(2))
		Expect(aRegion.SubAreas[0].ID).To(Equal("A1"))
		Expect(aRegion.SubAreas[0].Boundary.Points[0]).To(Equal([]float64{149.87, -37.47}))
		Expect(aRegion.SubAreas[1].ID).To(Equal("A2"))
		Expect(aRegion.SubAreas[1].Boundary.Points[0]).To(Equal([]float64{152.45, -34.78}))

		bRegion := forecast.Areas[1]
		Expect(bRegion.ID).To(Equal("B"))
		Expect(bRegion.FreezingLevel).To(Equal("ABV 10000FT"))
		Expect(len(bRegion.WxCond)).To(Equal(2))
		Expect(bRegion.Boundary.Points[0]).To(Equal([]float64{148.45, -32.70}))
		Expect(len(bRegion.SubAreas)).To(Equal(0))
	})
})
