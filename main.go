package main

import (
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

func getAreaForecastByPageCode(params martini.Params, r render.Render) {
	areaForecast, err := gaf.NewAreaForecast(params["pagecode"])
	if err != nil {
		r.JSON(500, errorResponse(err))
		return
	}
	r.JSON(200, areaForecast)
}

func getCurrentAreaForecastByAreaCode(params martini.Params, r render.Render) {
	area, err := gaf.NewAreaMappingPageCode(params["area"])
	if err != nil {
		r.JSON(500, errorResponse(err))
		return
	}
	areaForecast, err := gaf.NewAreaForecast(area.CurrentGAFCode)
	if err != nil {
		r.JSON(500, errorResponse(err))
		return
	}
	r.JSON(200, areaForecast)
}

func getNextAreaForecastByAreaCode(params martini.Params, r render.Render) {
	area, err := gaf.NewAreaMappingPageCode(params["area"])
	if err != nil {
		r.JSON(500, errorResponse(err))
		return
	}
	areaForecast, err := gaf.NewAreaForecast(area.NextGAFCode)
	if err != nil {
		r.JSON(500, errorResponse(err))
		return
	}
	r.JSON(200, areaForecast)
}

func getGAFHTML(params martini.Params, r render.Render) {
	r.HTML(200, "gaf2/index", gafs)
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

	m.Get("/gaf2/:area", getGAFHTML)
	m.Group("/api", func(api martini.Router) {
		api.Get("/gaf/:pagecode.json", getAreaForecastByPageCode)
		api.Get("/gafarea/:area/current.json", getCurrentAreaForecastByAreaCode)
		api.Get("/gafarea/:area/next.json", getNextAreaForecastByAreaCode)
		api.Get("/airmet", getAIRMET)
	})

	m.Run()
}
