"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapui = require("./mapui");
const controller = require("./controller");
const menu = require("./menu");
const airports = require("./airports");
const gafarearender = require("./render/gafarea");
var map = mapui.map;
map.once("load", function () {
    // debug.init();
    gafarearender.init(map);
    menu.init(map);
    airports.init(map);
    controller.init(map);
});
