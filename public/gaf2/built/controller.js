"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url = require("./helpers/url");
exports.vfr = url.getUrlParameter("vfr") || "day";
exports.period = url.getUrlParameter("period") || "current";
