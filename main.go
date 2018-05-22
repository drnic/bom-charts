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

func getGAF(params martini.Params, r render.Render) {
	gafPage, err := gaf.NewPage(params["pagecode"])
	if err != nil {
		r.JSON(500, errorResponse(err))
	}
	r.Header().Add("Content-Type", "application/json")
	r.Text(200, gafPage.JSON)
}

func getAIRMET(r render.Render) {
	airmet, err := airmet.NewAirmet()
	if err != nil {
		r.JSON(500, errorResponse(err))
	}
	r.JSON(200, airmet)
}

func main() {
	m := martini.Classic()
	m.Use(martini.Static("assets"))
	m.Use(render.Renderer(render.Options{
		IndentJSON: true, // Output human readable JSON
	}))

	m.Group("/api", func(api martini.Router) {
		api.Group("/gaf", func(r martini.Router) {
			r.Get("/:pagecode.json", getGAF)
		})
		api.Get("/airmet", getAIRMET)
	})

	m.Run()
}
