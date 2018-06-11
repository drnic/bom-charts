"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller = require("./controller");
var ThemeChoice;
(function (ThemeChoice) {
    ThemeChoice[ThemeChoice["Day"] = 0] = "Day";
    ThemeChoice[ThemeChoice["Night"] = 1] = "Night";
})(ThemeChoice || (ThemeChoice = {}));
exports.cssHeightColors = {
    0: "#BB0EC9",
    1: "#DF8211",
    2: "#FCFC00",
    3: "#99DAAA",
};
var dayTheme = {
    textColor: "#eee",
    lineColor: "#99DAAA",
    cssHeightColors: exports.cssHeightColors,
};
var nightTheme = {
    textColor: "#111",
    lineColor: "#eee",
    cssHeightColors: exports.cssHeightColors,
};
function current() {
    if (controller.vfr == controller.VFR.night) {
        return nightTheme;
    }
    else {
        return dayTheme;
    }
}
exports.current = current;
