import * as mapui from '../mapui';
import * as $ from 'jquery';
import * as wait from "../helpers/wait";


export function init() {
  let styleloaded = $('<span/>');
  styleloaded.text(`-`);
  styleloaded.appendTo($('body'));

  wait.runEvery(100, () => {
    if (mapui.map.isStyleLoaded) {
      styleloaded.text("style loaded");
    } else {
      styleloaded.text("style not loaded");
    }
  })
}