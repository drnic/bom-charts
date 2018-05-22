package main_test

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestBomCharts(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "BomCharts Suite")
}
