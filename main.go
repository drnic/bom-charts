package main

import (
	"encoding/json"

	"github.com/drnic/bom-charts/airmet"

	"github.com/drnic/bom-charts/gaf"
	"github.com/go-martini/martini"
)

type basicResponse struct {
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

func errorResponse(err error) string {
	res := &basicResponse{Error: err.Error()}
	j, _ := json.Marshal(res)
	return string(j)
}

func messageResponse(message string) string {
	res := &basicResponse{Message: message}
	j, _ := json.Marshal(res)
	return string(j)
}

func getGAF(params martini.Params) string {
	gafPage, err := gaf.NewPage(params["pagecode"])
	if err != nil {
		return errorResponse(err)
	}
	return string(gafPage.JSON)
}

func getAIRMET() string {
	airmet, err := airmet.NewAirmet()
	if err != nil {
		return errorResponse(err)
	}
	j, _ := json.Marshal(airmet)
	return string(j)
}

func main() {
	m := martini.Classic()
	m.Use(martini.Static("assets"))

	m.Group("/api", func(api martini.Router) {
		api.Group("/gaf", func(r martini.Router) {
			r.Get("/:pagecode.json", getGAF)
		})
		api.Get("/airmet", getAIRMET)
	})

	m.Run()
}
