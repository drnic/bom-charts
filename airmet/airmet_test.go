package airmet_test

import (
	"io/ioutil"
	"os"
	"path/filepath"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	httpmock "gopkg.in/jarcoal/httpmock.v1"

	. "github.com/drnic/bom-charts/airmet"
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

var _ = Describe("Airmet", func() {
	It("Fetches NIL current", func() {
		wd, _ := os.Getwd()

		htmlTestFile, err := os.Open(filepath.Join(wd, "testdata/AIRMET-nil-current.html"))
		Ω(err).ShouldNot(HaveOccurred())

		htmlTestResponse, err := ioutil.ReadAll(htmlTestFile)
		Ω(err).ShouldNot(HaveOccurred())

		httpmock.RegisterResponder("GET", "http://www.bom.gov.au/aviation/warnings/airmet/",
			httpmock.NewStringResponder(200, string(htmlTestResponse)))

		airmet, err := NewAirmet()
		Ω(err).ShouldNot(HaveOccurred())

		Expect(airmet.BrisbaneRegionAnyAlerts).To(BeFalse())
		Expect(airmet.MelbourneRegionAnyAlerts).To(BeFalse())

		Expect(airmet.Message).To(Equal("Nil current AIRMET."))
	})

	It("Fetches YMMM", func() {
		wd, _ := os.Getwd()

		htmlTestFile, err := os.Open(filepath.Join(wd, "testdata/AIRMET-ymmm.html"))
		Ω(err).ShouldNot(HaveOccurred())

		htmlTestResponse, err := ioutil.ReadAll(htmlTestFile)
		Ω(err).ShouldNot(HaveOccurred())

		httpmock.RegisterResponder("GET", "http://www.bom.gov.au/aviation/warnings/airmet/",
			httpmock.NewStringResponder(200, string(htmlTestResponse)))

		airmet, err := NewAirmet()
		Ω(err).ShouldNot(HaveOccurred())

		Expect(airmet.Message).To(Equal("Received at 20:00, 22/05/18<br/>YMMM AIRMET 01 VALID 220959/221359 YMRF-<br/>YMMM MELBOURNE FIR SFC VIS 0500M [FG] OBS AT 0950Z WI S3700 E14430 -<br/>S3630 E14500 - S3650 E14550 - S3720 E14510 STNR NC<br/>RMK: GAF VIC=<br/>--------------------------------------------------------------------"))

		Expect(airmet.BrisbaneRegionAnyAlerts).To(BeFalse())
		Expect(airmet.MelbourneRegionAnyAlerts).To(BeTrue())
	})
})
