import * as $ from 'jquery';
import * as wait from "../helpers/wait";
export function init() {
    let styleloaded = $('<span/>');
    styleloaded.text(`-`);
    styleloaded.appendTo($('body'));
    wait.runEvery(100, () => {
    });
}
