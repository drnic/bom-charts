import * as $ from 'jquery';
import * as controller from './controller';

declare var addToHomescreen: any;

export function update() {
  let gafAreaCode=controller.currentMapAreaFeature.properties["gafAreaCode"];
  console.log(controller.currentMapAreaFeature);
  $('link.areacode').remove();
  $(`<link class="areacode" rel="icon" sizes="128x128" href="../images/icons/${gafAreaCode}.png">`).appendTo("head");
  $(`<link class="areacode" rel="apple-touch-icon" href="../images/icons/${gafAreaCode}.png" />`).appendTo("head");

  addToHomescreen({
    appID: 'com.starkandwayne.bom-charts.gaf.' + gafAreaCode
  });
}
