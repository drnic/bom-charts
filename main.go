package main

import (
	"fmt"

	"github.com/drnic/bom-charts/airmet"

	"github.com/drnic/bom-charts/gaf"
	"github.com/go-martini/martini"
	"github.com/martini-contrib/render"
)

type basicResponse struct {
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

func errorResponse(err error) *basicResponse {
	return &basicResponse{Error: err.Error()}
}

func messageResponse(message string) *basicResponse {
	return &basicResponse{Message: message}
}

func getGAFImages(params martini.Params, r render.Render) {
	areaForecast, err := gaf.NewAreaForecast(params["pagecode"])
	if err != nil {
		r.JSON(500, errorResponse(err))
		return
	}
	r.JSON(200, areaForecast)
}

func getGAFHTML(params martini.Params, r render.Render) {
	areaForecast, err := gaf.NewAreaForecast(params["pagecode"])
	if err != nil {
		r.JSON(500, errorResponse(err))
		return
	}
	fmt.Printf("%#v\n", areaForecast)
	r.HTML(200, "gaf", areaForecast)
}

func getAIRMET(r render.Render) {
	airmet, err := airmet.NewAirmet()
	if err != nil {
		r.JSON(500, errorResponse(err))
		return
	}
	r.JSON(200, airmet)
}

func main() {
	m := martini.Classic()
	m.Use(martini.Static("assets"))
	m.Use(render.Renderer(render.Options{
		IndentJSON: true, // Output human readable JSON
	}))

	m.Get("/gaf/:pagecode", getGAFHTML)
	m.Group("/api", func(api martini.Router) {
		api.Group("/gaf", func(r martini.Router) {
			r.Get("/:pagecode.json", getGAFImages)
		})
		api.Get("/airmet", getAIRMET)
	})

	m.Run()
}
