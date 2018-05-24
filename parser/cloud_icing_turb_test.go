package parser_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	. "github.com/drnic/bom-charts/parser"
)

var _ = Describe("CloudIcingTurbParser", func() {
	It("Parses simple BKN ST 1000/5000FT", func() {
		text := "BKN ST 1000/5000FT"

		p, err := NewCloudIcingTurbParser(text)
		Ω(err).ShouldNot(HaveOccurred())

		Expect(p.PrimaryLayer).To(Equal(CloudLayer{"BKN", "ST", 1000, 5000}))
	})

	It("Parses simple SCT CU/SC 3000/ABV10000FT", func() {
		text := "SCT CU/SC 3000/ABV10000FT"

		p, err := NewCloudIcingTurbParser(text)
		Ω(err).ShouldNot(HaveOccurred())

		Expect(p.PrimaryLayer).To(Equal(CloudLayer{"SCT", "CU/SC", 3000, 10000}))
	})
})
