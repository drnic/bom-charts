package airmet_test

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestAirmet(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Airmet Suite")
}
