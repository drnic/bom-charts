package gaf_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	. "github.com/drnic/bom-charts/gaf"
)

var _ = Describe("Area", func() {
	It("returns error if invalid area code", func() {
		_, err := NewArea("XXX")
		Ω(err).Should(HaveOccurred())
	})

	It("returns GAF code for each UTC hour", func() {
		area, err := NewArea("QLD-S")
		Ω(err).ShouldNot(HaveOccurred())

		Expect(area.CurrentGAFCode).To(Not(Equal("")))
		Expect(area.NextGAFCode).To(Not(Equal("")))

		Expect(area.UpdateForUTCHour(5).CurrentGAFCode).To(Equal("IDY42078"))
		Expect(area.UpdateForUTCHour(6).CurrentGAFCode).To(Equal("IDY42078"))
		Expect(area.UpdateForUTCHour(7).CurrentGAFCode).To(Equal("IDY42078"))
		Expect(area.UpdateForUTCHour(8).CurrentGAFCode).To(Equal("IDY42078"))
		Expect(area.UpdateForUTCHour(9).CurrentGAFCode).To(Equal("IDY42078"))
		Expect(area.UpdateForUTCHour(10).CurrentGAFCode).To(Equal("IDY42078"))

		Expect(area.UpdateForUTCHour(11).CurrentGAFCode).To(Equal("IDY42079"))
		Expect(area.UpdateForUTCHour(12).CurrentGAFCode).To(Equal("IDY42079"))
		Expect(area.UpdateForUTCHour(13).CurrentGAFCode).To(Equal("IDY42079"))
		Expect(area.UpdateForUTCHour(14).CurrentGAFCode).To(Equal("IDY42079"))
		Expect(area.UpdateForUTCHour(15).CurrentGAFCode).To(Equal("IDY42079"))
		Expect(area.UpdateForUTCHour(16).CurrentGAFCode).To(Equal("IDY42079"))

		Expect(area.UpdateForUTCHour(17).CurrentGAFCode).To(Equal("IDY42080"))
		Expect(area.UpdateForUTCHour(18).CurrentGAFCode).To(Equal("IDY42080"))
		Expect(area.UpdateForUTCHour(19).CurrentGAFCode).To(Equal("IDY42080"))
		Expect(area.UpdateForUTCHour(20).CurrentGAFCode).To(Equal("IDY42080"))
		Expect(area.UpdateForUTCHour(21).CurrentGAFCode).To(Equal("IDY42080"))
		Expect(area.UpdateForUTCHour(22).CurrentGAFCode).To(Equal("IDY42080"))

		Expect(area.UpdateForUTCHour(23).CurrentGAFCode).To(Equal("IDY42081"))
		Expect(area.UpdateForUTCHour(0).CurrentGAFCode).To(Equal("IDY42081"))
		Expect(area.UpdateForUTCHour(1).CurrentGAFCode).To(Equal("IDY42081"))
		Expect(area.UpdateForUTCHour(2).CurrentGAFCode).To(Equal("IDY42081"))
		Expect(area.UpdateForUTCHour(3).CurrentGAFCode).To(Equal("IDY42081"))
		Expect(area.UpdateForUTCHour(4).CurrentGAFCode).To(Equal("IDY42081"))
	})
})
