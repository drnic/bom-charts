$(function () {
  var vfr = getUrlParameter("vfr") || "day";
  var period = getUrlParameter("period") || "current";

  var menu = $("p#menu")
  menu.find("a#day-vfr").attr("href", `?vfr=day&period=${period}`);
  menu.find("a#night-vfr").attr("href", `?vfr=night&period=${period}`);
  menu.find("a#period-current").attr("href", `?vfr=${vfr}&period=current`);
  menu.find("a#period-next").attr("href", `?vfr=${vfr}&period=next`);
});