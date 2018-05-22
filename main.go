package main

import (
	"fmt"

	"github.com/drnic/bom-charts/gaf"
	"github.com/go-martini/martini"
)

func getGAF(params martini.Params) string {
	gafPage, err := gaf.NewPage(params["pagecode"])
	if err != nil {
		return fmt.Sprintf("{\"error\":\"%s\"}", err)
	}
	return fmt.Sprintf(string(gafPage.JSON))
}

func main() {
	m := martini.Classic()
	m.Use(martini.Static("assets"))

	m.Group("/api", func(api martini.Router) {
		api.Group("/gaf", func(r martini.Router) {
			r.Get("/:pagecode.json", getGAF)
		})
	})

	m.Run()
}
