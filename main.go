package main

import "github.com/go-martini/martini"

func main() {
	m := martini.Classic()
	m.Use(martini.Static("assets"))

	m.Run()
}
