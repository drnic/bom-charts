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

		aRegion := forecast.Areas[0]
		Expect(aRegion.ID).To(Equal("A"))
		Expect(aRegion.FreezingLevel).To(Equal("ABV 10000FT (10000FT IN S, 8500FT IN A2 FM 09Z)"))
		Expect(len(aRegion.WxCond)).To(Equal(4))

		bRegion := forecast.Areas[1]
		Expect(bRegion.ID).To(Equal("B"))
		Expect(bRegion.FreezingLevel).To(Equal("ABV 10000FT"))
		Expect(len(bRegion.WxCond)).To(Equal(2))
	})
})
