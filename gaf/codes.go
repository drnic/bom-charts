package gaf

// AreaMapping allows for lookup of GAF page codes
var AreaMapping = map[string][]string{
	"WA-N":  []string{"IDY42054", "IDY42055", "IDY42056", "IDY42057"},
	"WA-S":  []string{"IDY42050", "IDY42051", "IDY42052", "IDY42053"},
	"NT":    []string{"IDY42058", "IDY42059", "IDY42060", "IDY42061"},
	"QLD-N": []string{"IDY42074", "IDY42075", "IDY42076", "IDY42077"},
	"QLD-S": []string{"IDY42078", "IDY42079", "IDY42080", "IDY42081"},
	"SA":    []string{"IDY42062", "IDY42063", "IDY42064", "IDY42065"},
	"NSW-W": []string{"IDY42086", "IDY42087", "IDY42088", "IDY42089"},
	"NSW-E": []string{"IDY42082", "IDY42083", "IDY42084", "IDY42085"},
	"VIC":   []string{"IDY42066", "IDY42067", "IDY42068", "IDY42069"},
	"TAS":   []string{"IDY42070", "IDY42071", "IDY42072", "IDY42073"},
}

// Areas is the list of known GAF area codes
var Areas = []string{"WA-N", "WA-S", "NT", "QLD-N", "QLD-S", "SA", "NSW-W", "NSW-E", "VIC", "TAS"}
