import * as controller from './controller';
var ThemeChoice;
(function (ThemeChoice) {
    ThemeChoice[ThemeChoice["Day"] = 0] = "Day";
    ThemeChoice[ThemeChoice["Night"] = 1] = "Night";
})(ThemeChoice || (ThemeChoice = {}));
export var cssHeightColors = {
    0: "#BB0EC9",
    1: "#DF8211",
    2: "#FCFC00",
    3: "#99DAAA",
};
var dayTheme = {
    textColor: "#eee",
    lineColor: "#99DAAA",
    cssHeightColors: cssHeightColors,
};
var nightTheme = {
    textColor: "#111",
    lineColor: "#eee",
    cssHeightColors: cssHeightColors,
};
export function current() {
    if (controller.vfr == controller.VFR.night) {
        return nightTheme;
    }
    else {
        return dayTheme;
    }
}
