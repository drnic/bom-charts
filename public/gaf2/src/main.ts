import * as debug from './debug';
import * as mapui from './mapui';
import * as controller from './controller';
import * as menu from "./menu";
import * as airports from "./airports";
import * as gafarea from "./gafarea";
import * as lsalt from "./lsalt";
import * as gaftable from "./render/gaftable";

var map = mapui.map;
map.once("load", function() {
  // debug.init();
  menu.init(map);

  airports.init(map);
  gafarea.init();
  lsalt.init();

  controller.init(map);

  // gaftable.init();
})
