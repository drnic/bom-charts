package gaf

var WAN = []string{"IDY42054", "IDY42055", "IDY42056", "IDY42057"}  //area id #0 (WA - North)
var WAS = []string{"IDY42050", "IDY42051", "IDY42052", "IDY42053"}  //area id #1 (WA - South)
var NT = []string{"IDY42058", "IDY42059", "IDY42060", "IDY42061"}   //area id #2 (NT)
var QLDN = []string{"IDY42074", "IDY42075", "IDY42076", "IDY42077"} //area id #3 (QLD - North)
var QLDS = []string{"IDY42078", "IDY42079", "IDY42080", "IDY42081"} //area id #4 (QLD - South)
var SA = []string{"IDY42062", "IDY42063", "IDY42064", "IDY42065"}   //area id #5 (SA)
var NSWW = []string{"IDY42086", "IDY42087", "IDY42088", "IDY42089"} //area id #6 (NSW - West)
var NSWE = []string{"IDY42082", "IDY42083", "IDY42084", "IDY42085"} //area id #7 (NSW - East)
var VIC = []string{"IDY42066", "IDY42067", "IDY42068", "IDY42069"}  //area id #8 (VIC)
var TAS = []string{"IDY42070", "IDY42071", "IDY42072", "IDY42073"}  //area id #9 (TAS)

var AreaMapping = map[string][]string{
	"WA-N":  WAN,
	"WA-S":  WAS,
	"NT":    NT,
	"QLD-N": QLDN,
	"QLD-S": QLDS,
	"SA":    SA,
	"NSW-W": NSWW,
	"NSW-E": NSWE,
	"VIC":   VIC,
	"TAS":   TAS,
}

var Areas = []string{"WA-N", "WA-S", "NT", "QLD-N", "QLD-S", "SA", "NSW-W", "NSW-E", "VIC", "TAS"}
