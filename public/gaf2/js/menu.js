$(function () {
  var vfr = getUrlParameter("vfr") || "day";
  var period = getUrlParameter("period") || "current";

  var menu = $("p#menu")
  if (vfr == "night") {
    menu.find("a#day-vfr").attr("href", `?vfr=day&period=${period}`);
  } else {
    menu.find("a#night-vfr").attr("href", `?vfr=night&period=${period}`);
  }

  if (period == "next") {
    menu.find("a#period-current").attr("href", `?vfr=${vfr}&period=current`);
  } else {
    menu.find("a#period-next").attr("href", `?vfr=${vfr}&period=next`);
  }
});