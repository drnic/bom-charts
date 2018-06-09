"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mapui = require("./mapui");
var controller = require("./controller");
var menu = require("./menu");
var airports = require("./airports");
var gafarearender = require("./render/gafarea");
var map = mapui.map;
map.on("load", function () {
    gafarearender.init(map);
    menu.init(map);
    airports.init(map);
    controller.init(map);
});
