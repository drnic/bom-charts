import * as controller from './controller';

enum ThemeChoice {
  Day,
  Night,
}

interface Theme {
  textColor: string;
  lineColor: string;
  cssHeightColors: { [height: number]: string };
}

export var cssHeightColors: { [height: number]: string } = {
  0: "#BB0EC9",
  1: "#DF8211",
  2: "#FCFC00",
  3: "#99DAAA",
};

var dayTheme = {
  textColor: "#111",
  lineColor: "#99DAAA",
  cssHeightColors : cssHeightColors,
} as Theme;

var nightTheme = {
  textColor: "#eee",
  lineColor: "#eee",
  cssHeightColors : cssHeightColors,
} as Theme;

export function current() {
  if (controller.vfr == controller.VFR.night) {
    return nightTheme;
  } else {
    return dayTheme;
  }
}
