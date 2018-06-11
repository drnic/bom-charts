"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapui = require("../mapui");
const $ = require("jquery");
const wait = require("../helpers/wait");
function init() {
    let styleloaded = $('<span/>');
    styleloaded.text(`-`);
    styleloaded.appendTo($('body'));
    wait.runEvery(100, () => {
        if (mapui.map.isStyleLoaded) {
            styleloaded.text("style loaded");
        }
        else {
            styleloaded.text("style not loaded");
        }
    });
}
exports.init = init;
