"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapui = require("./mapui");
const controller = require("./controller");
const menu = require("./menu");
const airports = require("./airports");
var map = mapui.map;
map.once("load", function () {
    // debug.init();
    menu.init(map);
    airports.init(map);
    controller.init(map);
});
