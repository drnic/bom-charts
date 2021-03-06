package main

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"

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
	r.HTML(200, "gaf2/index", struct{}{})
}

func getAIRMET(r render.Render) {
	airmet, err := airmet.NewAirmet()
	if err != nil {
		r.JSON(500, errorResponse(err))
		return
	}
	r.JSON(200, airmet)
}

func forwardLSALTHandler() func(http.ResponseWriter, *http.Request) {
	url, err := url.Parse(os.Getenv("LSALT_URL"))
	if err != nil {
		panic(err)
	}
	p := httputil.NewSingleHostReverseProxy(url)
	return func(w http.ResponseWriter, r *http.Request) {
		p.ServeHTTP(w, r)
	}
}

func main() {
	m := martini.Classic()
	m.Use(martini.Static("public"))
	m.Use(render.Renderer(render.Options{
		IndentJSON: true, // Output human readable JSON
	}))

	m.Get("/gaf2", getGAFHTML)
	m.Group("/api", func(api martini.Router) {
		api.Get("/gafarea/:area/current.json", getCurrentAreaForecastByAreaCode)
		api.Get("/gafarea/:area/next.json", getNextAreaForecastByAreaCode)
		api.Get("/airmet", getAIRMET)
	})
	m.Get("/api2/lsalt-features", forwardLSALTHandler())
	m.Get("/api2/gafareas-features", forwardLSALTHandler())
	m.Get("/api2/gafareas-envelopes", forwardLSALTHandler())
	m.Get("/api2/gafareas-dates", forwardLSALTHandler())
	m.Get("/api2/mapareas", forwardLSALTHandler())
	m.Get("/api2/mapareas/major", forwardLSALTHandler())

	m.Run()
}
