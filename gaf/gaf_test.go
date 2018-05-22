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

		xmlTestdataFile, err := os.Open(filepath.Join(wd, "testdata/gaf/IDY42081.xml"))
		Ω(err).ShouldNot(HaveOccurred())

		xmlTestdata, err := ioutil.ReadAll(xmlTestdataFile)
		Ω(err).ShouldNot(HaveOccurred())

		httpmock.RegisterResponder("GET", "http://www.bom.gov.au/fwo/aviation/IDY42081.xml",
			httpmock.NewStringResponder(200, string(xmlTestdata)))

		forecast, err := NewAreaForecast("IDY42081")
		Ω(err).ShouldNot(HaveOccurred())
		Expect(forecast.AreaID).To(Equal("QLD-S"))
	})
})
