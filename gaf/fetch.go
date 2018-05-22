package gaf

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

// Page describes a request/current Graphical Area Forecast (GAF)
type Page struct {
	Code   string
	RawXML []byte
	JSON   string
}

// NewPage is the constructor for a Page
func NewPage(pagecode string) (page *Page, err error) {
	page = &Page{Code: pagecode, JSON: "{}"}
	url := fmt.Sprintf("http://www.bom.gov.au/fwo/aviation/%s.xml", page.Code)
	resp, err := http.Get(url)
	if err != nil {
		return page, err
	}
	defer resp.Body.Close()
	page.RawXML, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		return page, err
	}
	return page, page.convertFromXML()
}

// JSON is converted from RawXML
func (page *Page) convertFromXML() error {
	return nil
}
