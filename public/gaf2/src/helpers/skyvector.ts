import * as turf from '@turf/helpers';

/**
 * URL to display a sequence of points on Sky Vector
 * e.g. https://skyvector.com/?fpl=2900S15300E%202900S15330E%202830S15330E%202830S15300E%202900S15300E
 * @param positions sequnce of geo positions
 */
export function url(positions: turf.Position[]) : string {
  let locations: string[] = positions.map((position: turf.Position) => {
    return toLocation(position);
  });
  return `https://skyvector.com/?fpl=${locations.join('%20')}`;
}

function toLocation(position: turf.Position) : string {
  let longitude = position[0];
  let latitude = position[1];
  return `${toDegreeMinutes(latitude)}S${toDegreeMinutes(longitude)}E`;
}

function toDegreeMinutes(num: number) : string {
  num = Math.abs(num);
  let degrees = Math.floor(num);
  let minutes = Math.round((num - Math.floor(num)) * 60);
  return `${degrees}${pad(minutes, 2)}`
}

function pad(num: number, size: number) : string {
  var s = num+"";
  while (s.length < size) s = "0" + s;
  return s;
}
