var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/depd/lib/browser/index.js
var require_browser = __commonJS({
  "node_modules/depd/lib/browser/index.js"(exports, module) {
    "use strict";
    module.exports = depd;
    function depd(namespace) {
      if (!namespace) {
        throw new TypeError("argument namespace is required");
      }
      function deprecate(message) {
      }
      __name(deprecate, "deprecate");
      deprecate._file = void 0;
      deprecate._ignored = true;
      deprecate._namespace = namespace;
      deprecate._traced = false;
      deprecate._warned = /* @__PURE__ */ Object.create(null);
      deprecate.function = wrapfunction;
      deprecate.property = wrapproperty;
      return deprecate;
    }
    __name(depd, "depd");
    function wrapfunction(fn, message) {
      if (typeof fn !== "function") {
        throw new TypeError("argument fn must be a function");
      }
      return fn;
    }
    __name(wrapfunction, "wrapfunction");
    function wrapproperty(obj, prop, message) {
      if (!obj || typeof obj !== "object" && typeof obj !== "function") {
        throw new TypeError("argument obj must be object");
      }
      var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      if (!descriptor) {
        throw new TypeError("must call property on owner object");
      }
      if (!descriptor.configurable) {
        throw new TypeError("property must be configurable");
      }
    }
    __name(wrapproperty, "wrapproperty");
  }
});

// node_modules/bytes/index.js
var require_bytes = __commonJS({
  "node_modules/bytes/index.js"(exports, module) {
    "use strict";
    module.exports = bytes;
    module.exports.format = format;
    module.exports.parse = parse;
    var formatThousandsRegExp = /\B(?=(\d{3})+(?!\d))/g;
    var formatDecimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/;
    var map = {
      b: 1,
      kb: 1 << 10,
      mb: 1 << 20,
      gb: 1 << 30,
      tb: Math.pow(1024, 4),
      pb: Math.pow(1024, 5)
    };
    var parseRegExp = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i;
    function bytes(value, options) {
      if (typeof value === "string") {
        return parse(value);
      }
      if (typeof value === "number") {
        return format(value, options);
      }
      return null;
    }
    __name(bytes, "bytes");
    function format(value, options) {
      if (!Number.isFinite(value)) {
        return null;
      }
      var mag = Math.abs(value);
      var thousandsSeparator = options && options.thousandsSeparator || "";
      var unitSeparator = options && options.unitSeparator || "";
      var decimalPlaces = options && options.decimalPlaces !== void 0 ? options.decimalPlaces : 2;
      var fixedDecimals = Boolean(options && options.fixedDecimals);
      var unit = options && options.unit || "";
      if (!unit || !map[unit.toLowerCase()]) {
        if (mag >= map.pb) {
          unit = "PB";
        } else if (mag >= map.tb) {
          unit = "TB";
        } else if (mag >= map.gb) {
          unit = "GB";
        } else if (mag >= map.mb) {
          unit = "MB";
        } else if (mag >= map.kb) {
          unit = "KB";
        } else {
          unit = "B";
        }
      }
      var val = value / map[unit.toLowerCase()];
      var str = val.toFixed(decimalPlaces);
      if (!fixedDecimals) {
        str = str.replace(formatDecimalsRegExp, "$1");
      }
      if (thousandsSeparator) {
        str = str.split(".").map(function(s, i) {
          return i === 0 ? s.replace(formatThousandsRegExp, thousandsSeparator) : s;
        }).join(".");
      }
      return str + unitSeparator + unit;
    }
    __name(format, "format");
    function parse(val) {
      if (typeof val === "number" && !isNaN(val)) {
        return val;
      }
      if (typeof val !== "string") {
        return null;
      }
      var results = parseRegExp.exec(val);
      var floatValue;
      var unit = "b";
      if (!results) {
        floatValue = parseInt(val, 10);
        unit = "b";
      } else {
        floatValue = parseFloat(results[1]);
        unit = results[4].toLowerCase();
      }
      if (isNaN(floatValue)) {
        return null;
      }
      return Math.floor(map[unit] * floatValue);
    }
    __name(parse, "parse");
  }
});

// node_modules/content-type/index.js
var require_content_type = __commonJS({
  "node_modules/content-type/index.js"(exports) {
    "use strict";
    var PARAM_REGEXP = /; *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[\u000b\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u000b\u0020-\u00ff])*"|[!#$%&'*+.^_`|~0-9A-Za-z-]+) */g;
    var TEXT_REGEXP = /^[\u000b\u0020-\u007e\u0080-\u00ff]+$/;
    var TOKEN_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    var QESC_REGEXP = /\\([\u000b\u0020-\u00ff])/g;
    var QUOTE_REGEXP = /([\\"])/g;
    var TYPE_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    exports.format = format;
    exports.parse = parse;
    function format(obj) {
      if (!obj || typeof obj !== "object") {
        throw new TypeError("argument obj is required");
      }
      var parameters = obj.parameters;
      var type = obj.type;
      if (!type || !TYPE_REGEXP.test(type)) {
        throw new TypeError("invalid type");
      }
      var string = type;
      if (parameters && typeof parameters === "object") {
        var param;
        var params = Object.keys(parameters).sort();
        for (var i = 0; i < params.length; i++) {
          param = params[i];
          if (!TOKEN_REGEXP.test(param)) {
            throw new TypeError("invalid parameter name");
          }
          string += "; " + param + "=" + qstring(parameters[param]);
        }
      }
      return string;
    }
    __name(format, "format");
    function parse(string) {
      if (!string) {
        throw new TypeError("argument string is required");
      }
      var header = typeof string === "object" ? getcontenttype(string) : string;
      if (typeof header !== "string") {
        throw new TypeError("argument string is required to be a string");
      }
      var index = header.indexOf(";");
      var type = index !== -1 ? header.slice(0, index).trim() : header.trim();
      if (!TYPE_REGEXP.test(type)) {
        throw new TypeError("invalid media type");
      }
      var obj = new ContentType(type.toLowerCase());
      if (index !== -1) {
        var key2;
        var match;
        var value;
        PARAM_REGEXP.lastIndex = index;
        while (match = PARAM_REGEXP.exec(header)) {
          if (match.index !== index) {
            throw new TypeError("invalid parameter format");
          }
          index += match[0].length;
          key2 = match[1].toLowerCase();
          value = match[2];
          if (value.charCodeAt(0) === 34) {
            value = value.slice(1, -1);
            if (value.indexOf("\\") !== -1) {
              value = value.replace(QESC_REGEXP, "$1");
            }
          }
          obj.parameters[key2] = value;
        }
        if (index !== header.length) {
          throw new TypeError("invalid parameter format");
        }
      }
      return obj;
    }
    __name(parse, "parse");
    function getcontenttype(obj) {
      var header;
      if (typeof obj.getHeader === "function") {
        header = obj.getHeader("content-type");
      } else if (typeof obj.headers === "object") {
        header = obj.headers && obj.headers["content-type"];
      }
      if (typeof header !== "string") {
        throw new TypeError("content-type header is missing from object");
      }
      return header;
    }
    __name(getcontenttype, "getcontenttype");
    function qstring(val) {
      var str = String(val);
      if (TOKEN_REGEXP.test(str)) {
        return str;
      }
      if (str.length > 0 && !TEXT_REGEXP.test(str)) {
        throw new TypeError("invalid parameter value");
      }
      return '"' + str.replace(QUOTE_REGEXP, "\\$1") + '"';
    }
    __name(qstring, "qstring");
    function ContentType(type) {
      this.parameters = /* @__PURE__ */ Object.create(null);
      this.type = type;
    }
    __name(ContentType, "ContentType");
  }
});

// node_modules/setprototypeof/index.js
var require_setprototypeof = __commonJS({
  "node_modules/setprototypeof/index.js"(exports, module) {
    "use strict";
    module.exports = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array ? setProtoOf : mixinProperties);
    function setProtoOf(obj, proto) {
      obj.__proto__ = proto;
      return obj;
    }
    __name(setProtoOf, "setProtoOf");
    function mixinProperties(obj, proto) {
      for (var prop in proto) {
        if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
          obj[prop] = proto[prop];
        }
      }
      return obj;
    }
    __name(mixinProperties, "mixinProperties");
  }
});

// node_modules/statuses/codes.json
var require_codes = __commonJS({
  "node_modules/statuses/codes.json"(exports, module) {
    module.exports = {
      "100": "Continue",
      "101": "Switching Protocols",
      "102": "Processing",
      "103": "Early Hints",
      "200": "OK",
      "201": "Created",
      "202": "Accepted",
      "203": "Non-Authoritative Information",
      "204": "No Content",
      "205": "Reset Content",
      "206": "Partial Content",
      "207": "Multi-Status",
      "208": "Already Reported",
      "226": "IM Used",
      "300": "Multiple Choices",
      "301": "Moved Permanently",
      "302": "Found",
      "303": "See Other",
      "304": "Not Modified",
      "305": "Use Proxy",
      "307": "Temporary Redirect",
      "308": "Permanent Redirect",
      "400": "Bad Request",
      "401": "Unauthorized",
      "402": "Payment Required",
      "403": "Forbidden",
      "404": "Not Found",
      "405": "Method Not Allowed",
      "406": "Not Acceptable",
      "407": "Proxy Authentication Required",
      "408": "Request Timeout",
      "409": "Conflict",
      "410": "Gone",
      "411": "Length Required",
      "412": "Precondition Failed",
      "413": "Payload Too Large",
      "414": "URI Too Long",
      "415": "Unsupported Media Type",
      "416": "Range Not Satisfiable",
      "417": "Expectation Failed",
      "418": "I'm a Teapot",
      "421": "Misdirected Request",
      "422": "Unprocessable Entity",
      "423": "Locked",
      "424": "Failed Dependency",
      "425": "Too Early",
      "426": "Upgrade Required",
      "428": "Precondition Required",
      "429": "Too Many Requests",
      "431": "Request Header Fields Too Large",
      "451": "Unavailable For Legal Reasons",
      "500": "Internal Server Error",
      "501": "Not Implemented",
      "502": "Bad Gateway",
      "503": "Service Unavailable",
      "504": "Gateway Timeout",
      "505": "HTTP Version Not Supported",
      "506": "Variant Also Negotiates",
      "507": "Insufficient Storage",
      "508": "Loop Detected",
      "509": "Bandwidth Limit Exceeded",
      "510": "Not Extended",
      "511": "Network Authentication Required"
    };
  }
});

// node_modules/statuses/index.js
var require_statuses = __commonJS({
  "node_modules/statuses/index.js"(exports, module) {
    "use strict";
    var codes = require_codes();
    module.exports = status;
    status.message = codes;
    status.code = createMessageToStatusCodeMap(codes);
    status.codes = createStatusCodeList(codes);
    status.redirect = {
      300: true,
      301: true,
      302: true,
      303: true,
      305: true,
      307: true,
      308: true
    };
    status.empty = {
      204: true,
      205: true,
      304: true
    };
    status.retry = {
      502: true,
      503: true,
      504: true
    };
    function createMessageToStatusCodeMap(codes2) {
      var map = {};
      Object.keys(codes2).forEach(/* @__PURE__ */ __name(function forEachCode(code) {
        var message = codes2[code];
        var status2 = Number(code);
        map[message.toLowerCase()] = status2;
      }, "forEachCode"));
      return map;
    }
    __name(createMessageToStatusCodeMap, "createMessageToStatusCodeMap");
    function createStatusCodeList(codes2) {
      return Object.keys(codes2).map(/* @__PURE__ */ __name(function mapCode(code) {
        return Number(code);
      }, "mapCode"));
    }
    __name(createStatusCodeList, "createStatusCodeList");
    function getStatusCode(message) {
      var msg = message.toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(status.code, msg)) {
        throw new Error('invalid status message: "' + message + '"');
      }
      return status.code[msg];
    }
    __name(getStatusCode, "getStatusCode");
    function getStatusMessage(code) {
      if (!Object.prototype.hasOwnProperty.call(status.message, code)) {
        throw new Error("invalid status code: " + code);
      }
      return status.message[code];
    }
    __name(getStatusMessage, "getStatusMessage");
    function status(code) {
      if (typeof code === "number") {
        return getStatusMessage(code);
      }
      if (typeof code !== "string") {
        throw new TypeError("code must be a number or string");
      }
      var n = parseInt(code, 10);
      if (!isNaN(n)) {
        return getStatusMessage(n);
      }
      return getStatusCode(code);
    }
    __name(status, "status");
  }
});

// node_modules/unenv/dist/runtime/npm/inherits.mjs
var inherits_exports = {};
__export(inherits_exports, {
  default: () => inherits_default
});
import { inherits } from "node:util";
var inherits_default;
var init_inherits = __esm({
  "node_modules/unenv/dist/runtime/npm/inherits.mjs"() {
    inherits_default = inherits;
  }
});

// required-unenv-alias:inherits
var require_inherits = __commonJS({
  "required-unenv-alias:inherits"(exports, module) {
    init_inherits();
    module.exports = Object.entries(inherits_exports).filter(([k]) => k !== "default").reduce(
      (cjs, [k, value]) => Object.defineProperty(cjs, k, { value, enumerable: true }),
      "default" in inherits_exports ? inherits_default : {}
    );
  }
});

// node_modules/toidentifier/index.js
var require_toidentifier = __commonJS({
  "node_modules/toidentifier/index.js"(exports, module) {
    "use strict";
    module.exports = toIdentifier;
    function toIdentifier(str) {
      return str.split(" ").map(function(token) {
        return token.slice(0, 1).toUpperCase() + token.slice(1);
      }).join("").replace(/[^ _0-9a-z]/gi, "");
    }
    __name(toIdentifier, "toIdentifier");
  }
});

// node_modules/http-errors/index.js
var require_http_errors = __commonJS({
  "node_modules/http-errors/index.js"(exports, module) {
    "use strict";
    var deprecate = require_browser()("http-errors");
    var setPrototypeOf = require_setprototypeof();
    var statuses = require_statuses();
    var inherits2 = require_inherits();
    var toIdentifier = require_toidentifier();
    module.exports = createError;
    module.exports.HttpError = createHttpErrorConstructor();
    module.exports.isHttpError = createIsHttpErrorFunction(module.exports.HttpError);
    populateConstructorExports(module.exports, statuses.codes, module.exports.HttpError);
    function codeClass(status) {
      return Number(String(status).charAt(0) + "00");
    }
    __name(codeClass, "codeClass");
    function createError() {
      var err;
      var msg;
      var status = 500;
      var props = {};
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        var type = typeof arg;
        if (type === "object" && arg instanceof Error) {
          err = arg;
          status = err.status || err.statusCode || status;
        } else if (type === "number" && i === 0) {
          status = arg;
        } else if (type === "string") {
          msg = arg;
        } else if (type === "object") {
          props = arg;
        } else {
          throw new TypeError("argument #" + (i + 1) + " unsupported type " + type);
        }
      }
      if (typeof status === "number" && (status < 400 || status >= 600)) {
        deprecate("non-error status code; use only 4xx or 5xx status codes");
      }
      if (typeof status !== "number" || !statuses.message[status] && (status < 400 || status >= 600)) {
        status = 500;
      }
      var HttpError2 = createError[status] || createError[codeClass(status)];
      if (!err) {
        err = HttpError2 ? new HttpError2(msg) : new Error(msg || statuses.message[status]);
        Error.captureStackTrace(err, createError);
      }
      if (!HttpError2 || !(err instanceof HttpError2) || err.status !== status) {
        err.expose = status < 500;
        err.status = err.statusCode = status;
      }
      for (var key2 in props) {
        if (key2 !== "status" && key2 !== "statusCode") {
          err[key2] = props[key2];
        }
      }
      return err;
    }
    __name(createError, "createError");
    function createHttpErrorConstructor() {
      function HttpError2() {
        throw new TypeError("cannot construct abstract class");
      }
      __name(HttpError2, "HttpError");
      inherits2(HttpError2, Error);
      return HttpError2;
    }
    __name(createHttpErrorConstructor, "createHttpErrorConstructor");
    function createClientErrorConstructor(HttpError2, name, code) {
      var className = toClassName(name);
      function ClientError(message) {
        var msg = message != null ? message : statuses.message[code];
        var err = new Error(msg);
        Error.captureStackTrace(err, ClientError);
        setPrototypeOf(err, ClientError.prototype);
        Object.defineProperty(err, "message", {
          enumerable: true,
          configurable: true,
          value: msg,
          writable: true
        });
        Object.defineProperty(err, "name", {
          enumerable: false,
          configurable: true,
          value: className,
          writable: true
        });
        return err;
      }
      __name(ClientError, "ClientError");
      inherits2(ClientError, HttpError2);
      nameFunc(ClientError, className);
      ClientError.prototype.status = code;
      ClientError.prototype.statusCode = code;
      ClientError.prototype.expose = true;
      return ClientError;
    }
    __name(createClientErrorConstructor, "createClientErrorConstructor");
    function createIsHttpErrorFunction(HttpError2) {
      return /* @__PURE__ */ __name(function isHttpError(val) {
        if (!val || typeof val !== "object") {
          return false;
        }
        if (val instanceof HttpError2) {
          return true;
        }
        return val instanceof Error && typeof val.expose === "boolean" && typeof val.statusCode === "number" && val.status === val.statusCode;
      }, "isHttpError");
    }
    __name(createIsHttpErrorFunction, "createIsHttpErrorFunction");
    function createServerErrorConstructor(HttpError2, name, code) {
      var className = toClassName(name);
      function ServerError(message) {
        var msg = message != null ? message : statuses.message[code];
        var err = new Error(msg);
        Error.captureStackTrace(err, ServerError);
        setPrototypeOf(err, ServerError.prototype);
        Object.defineProperty(err, "message", {
          enumerable: true,
          configurable: true,
          value: msg,
          writable: true
        });
        Object.defineProperty(err, "name", {
          enumerable: false,
          configurable: true,
          value: className,
          writable: true
        });
        return err;
      }
      __name(ServerError, "ServerError");
      inherits2(ServerError, HttpError2);
      nameFunc(ServerError, className);
      ServerError.prototype.status = code;
      ServerError.prototype.statusCode = code;
      ServerError.prototype.expose = false;
      return ServerError;
    }
    __name(createServerErrorConstructor, "createServerErrorConstructor");
    function nameFunc(func, name) {
      var desc = Object.getOwnPropertyDescriptor(func, "name");
      if (desc && desc.configurable) {
        desc.value = name;
        Object.defineProperty(func, "name", desc);
      }
    }
    __name(nameFunc, "nameFunc");
    function populateConstructorExports(exports2, codes, HttpError2) {
      codes.forEach(/* @__PURE__ */ __name(function forEachCode(code) {
        var CodeError;
        var name = toIdentifier(statuses.message[code]);
        switch (codeClass(code)) {
          case 400:
            CodeError = createClientErrorConstructor(HttpError2, name, code);
            break;
          case 500:
            CodeError = createServerErrorConstructor(HttpError2, name, code);
            break;
        }
        if (CodeError) {
          exports2[code] = CodeError;
          exports2[name] = CodeError;
        }
      }, "forEachCode"));
    }
    __name(populateConstructorExports, "populateConstructorExports");
    function toClassName(name) {
      return name.slice(-5) === "Error" ? name : name + "Error";
    }
    __name(toClassName, "toClassName");
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isNaN(val) === false) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    __name(parse, "parse");
    function fmtShort(ms) {
      if (ms >= d) {
        return Math.round(ms / d) + "d";
      }
      if (ms >= h) {
        return Math.round(ms / h) + "h";
      }
      if (ms >= m) {
        return Math.round(ms / m) + "m";
      }
      if (ms >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    __name(fmtShort, "fmtShort");
    function fmtLong(ms) {
      return plural(ms, d, "day") || plural(ms, h, "hour") || plural(ms, m, "minute") || plural(ms, s, "second") || ms + " ms";
    }
    __name(fmtLong, "fmtLong");
    function plural(ms, n, name) {
      if (ms < n) {
        return;
      }
      if (ms < n * 1.5) {
        return Math.floor(ms / n) + " " + name;
      }
      return Math.ceil(ms / n) + " " + name + "s";
    }
    __name(plural, "plural");
  }
});

// node_modules/debug/src/debug.js
var require_debug = __commonJS({
  "node_modules/debug/src/debug.js"(exports, module) {
    exports = module.exports = createDebug.debug = createDebug["default"] = createDebug;
    exports.coerce = coerce;
    exports.disable = disable;
    exports.enable = enable;
    exports.enabled = enabled;
    exports.humanize = require_ms();
    exports.names = [];
    exports.skips = [];
    exports.formatters = {};
    var prevTime;
    function selectColor(namespace) {
      var hash2 = 0, i;
      for (i in namespace) {
        hash2 = (hash2 << 5) - hash2 + namespace.charCodeAt(i);
        hash2 |= 0;
      }
      return exports.colors[Math.abs(hash2) % exports.colors.length];
    }
    __name(selectColor, "selectColor");
    function createDebug(namespace) {
      function debug() {
        if (!debug.enabled) return;
        var self = debug;
        var curr = +/* @__PURE__ */ new Date();
        var ms = curr - (prevTime || curr);
        self.diff = ms;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        args[0] = exports.coerce(args[0]);
        if ("string" !== typeof args[0]) {
          args.unshift("%O");
        }
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
          if (match === "%%") return match;
          index++;
          var formatter = exports.formatters[format];
          if ("function" === typeof formatter) {
            var val = args[index];
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        exports.formatArgs.call(self, args);
        var logFn = debug.log || exports.log || console.log.bind(console);
        logFn.apply(self, args);
      }
      __name(debug, "debug");
      debug.namespace = namespace;
      debug.enabled = exports.enabled(namespace);
      debug.useColors = exports.useColors();
      debug.color = selectColor(namespace);
      if ("function" === typeof exports.init) {
        exports.init(debug);
      }
      return debug;
    }
    __name(createDebug, "createDebug");
    function enable(namespaces) {
      exports.save(namespaces);
      exports.names = [];
      exports.skips = [];
      var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      var len = split.length;
      for (var i = 0; i < len; i++) {
        if (!split[i]) continue;
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          exports.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
        } else {
          exports.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    __name(enable, "enable");
    function disable() {
      exports.enable("");
    }
    __name(disable, "disable");
    function enabled(name) {
      var i, len;
      for (i = 0, len = exports.skips.length; i < len; i++) {
        if (exports.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports.names.length; i < len; i++) {
        if (exports.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    __name(enabled, "enabled");
    function coerce(val) {
      if (val instanceof Error) return val.stack || val.message;
      return val;
    }
    __name(coerce, "coerce");
  }
});

// node_modules/debug/src/browser.js
var require_browser2 = __commonJS({
  "node_modules/debug/src/browser.js"(exports, module) {
    exports = module.exports = require_debug();
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : localstorage();
    exports.colors = [
      "lightseagreen",
      "forestgreen",
      "goldenrod",
      "dodgerblue",
      "darkorchid",
      "crimson"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
        return true;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && "Cloudflare-Workers" && "Cloudflare-Workers".toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && "Cloudflare-Workers" && "Cloudflare-Workers".toLowerCase().match(/applewebkit\/(\d+)/);
    }
    __name(useColors, "useColors");
    exports.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return "[UnexpectedJSONParseError]: " + err.message;
      }
    };
    function formatArgs(args) {
      var useColors2 = this.useColors;
      args[0] = (useColors2 ? "%c" : "") + this.namespace + (useColors2 ? " %c" : " ") + args[0] + (useColors2 ? "%c " : " ") + "+" + exports.humanize(this.diff);
      if (!useColors2) return;
      var c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if ("%%" === match) return;
        index++;
        if ("%c" === match) {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    __name(formatArgs, "formatArgs");
    function log() {
      return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    __name(log, "log");
    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports.storage.removeItem("debug");
        } else {
          exports.storage.debug = namespaces;
        }
      } catch (e) {
      }
    }
    __name(save, "save");
    function load() {
      var r;
      try {
        r = exports.storage.debug;
      } catch (e) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    __name(load, "load");
    exports.enable(load());
    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {
      }
    }
    __name(localstorage, "localstorage");
  }
});

// node-built-in-modules:tty
import libDefault from "tty";
var require_tty = __commonJS({
  "node-built-in-modules:tty"(exports, module) {
    module.exports = libDefault;
  }
});

// node-built-in-modules:util
import libDefault2 from "util";
var require_util = __commonJS({
  "node-built-in-modules:util"(exports, module) {
    module.exports = libDefault2;
  }
});

// node-built-in-modules:fs
import libDefault3 from "fs";
var require_fs = __commonJS({
  "node-built-in-modules:fs"(exports, module) {
    module.exports = libDefault3;
  }
});

// node-built-in-modules:net
import libDefault4 from "net";
var require_net = __commonJS({
  "node-built-in-modules:net"(exports, module) {
    module.exports = libDefault4;
  }
});

// node_modules/debug/src/node.js
var require_node = __commonJS({
  "node_modules/debug/src/node.js"(exports, module) {
    var tty = require_tty();
    var util = require_util();
    exports = module.exports = require_debug();
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.colors = [6, 2, 3, 4, 5, 1];
    exports.inspectOpts = Object.keys(process.env).filter(function(key2) {
      return /^debug_/i.test(key2);
    }).reduce(function(obj, key2) {
      var prop = key2.substring(6).toLowerCase().replace(/_([a-z])/g, function(_, k) {
        return k.toUpperCase();
      });
      var val = process.env[key2];
      if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
      else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
      else if (val === "null") val = null;
      else val = Number(val);
      obj[prop] = val;
      return obj;
    }, {});
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    if (1 !== fd && 2 !== fd) {
      util.deprecate(function() {
      }, "except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)")();
    }
    var stream = 1 === fd ? process.stdout : 2 === fd ? process.stderr : createWritableStdioStream(fd);
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(fd);
    }
    __name(useColors, "useColors");
    exports.formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map(function(str) {
        return str.trim();
      }).join(" ");
    };
    exports.formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
    function formatArgs(args) {
      var name = this.namespace;
      var useColors2 = this.useColors;
      if (useColors2) {
        var c = this.color;
        var prefix = "  \x1B[3" + c + ";1m" + name + " \x1B[0m";
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push("\x1B[3" + c + "m+" + exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = (/* @__PURE__ */ new Date()).toUTCString() + " " + name + " " + args[0];
      }
    }
    __name(formatArgs, "formatArgs");
    function log() {
      return stream.write(util.format.apply(util, arguments) + "\n");
    }
    __name(log, "log");
    function save(namespaces) {
      if (null == namespaces) {
        delete process.env.DEBUG;
      } else {
        process.env.DEBUG = namespaces;
      }
    }
    __name(save, "save");
    function load() {
      return process.env.DEBUG;
    }
    __name(load, "load");
    function createWritableStdioStream(fd2) {
      var stream2;
      var tty_wrap = process.binding("tty_wrap");
      switch (tty_wrap.guessHandleType(fd2)) {
        case "TTY":
          stream2 = new tty.WriteStream(fd2);
          stream2._type = "tty";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        case "FILE":
          var fs = require_fs();
          stream2 = new fs.SyncWriteStream(fd2, { autoClose: false });
          stream2._type = "fs";
          break;
        case "PIPE":
        case "TCP":
          var net = require_net();
          stream2 = new net.Socket({
            fd: fd2,
            readable: false,
            writable: true
          });
          stream2.readable = false;
          stream2.read = null;
          stream2._type = "pipe";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        default:
          throw new Error("Implement me. Unknown stream file type!");
      }
      stream2.fd = fd2;
      stream2._isStdio = true;
      return stream2;
    }
    __name(createWritableStdioStream, "createWritableStdioStream");
    function init(debug) {
      debug.inspectOpts = {};
      var keys = Object.keys(exports.inspectOpts);
      for (var i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    __name(init, "init");
    exports.enable(load());
  }
});

// node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/debug/src/index.js"(exports, module) {
    if (typeof process !== "undefined" && process.type === "renderer") {
      module.exports = require_browser2();
    } else {
      module.exports = require_node();
    }
  }
});

// node-built-in-modules:events
import libDefault5 from "events";
var require_events = __commonJS({
  "node-built-in-modules:events"(exports, module) {
    module.exports = libDefault5;
  }
});

// node-built-in-modules:stream
import libDefault6 from "stream";
var require_stream = __commonJS({
  "node-built-in-modules:stream"(exports, module) {
    module.exports = libDefault6;
  }
});

// node-built-in-modules:zlib
import libDefault7 from "zlib";
var require_zlib = __commonJS({
  "node-built-in-modules:zlib"(exports, module) {
    module.exports = libDefault7;
  }
});

// node_modules/destroy/index.js
var require_destroy = __commonJS({
  "node_modules/destroy/index.js"(exports, module) {
    "use strict";
    var EventEmitter = require_events().EventEmitter;
    var ReadStream = require_fs().ReadStream;
    var Stream = require_stream();
    var Zlib = require_zlib();
    module.exports = destroy;
    function destroy(stream, suppress) {
      if (isFsReadStream(stream)) {
        destroyReadStream(stream);
      } else if (isZlibStream(stream)) {
        destroyZlibStream(stream);
      } else if (hasDestroy(stream)) {
        stream.destroy();
      }
      if (isEventEmitter(stream) && suppress) {
        stream.removeAllListeners("error");
        stream.addListener("error", noop);
      }
      return stream;
    }
    __name(destroy, "destroy");
    function destroyReadStream(stream) {
      stream.destroy();
      if (typeof stream.close === "function") {
        stream.on("open", onOpenClose);
      }
    }
    __name(destroyReadStream, "destroyReadStream");
    function closeZlibStream(stream) {
      if (stream._hadError === true) {
        var prop = stream._binding === null ? "_binding" : "_handle";
        stream[prop] = {
          close: /* @__PURE__ */ __name(function() {
            this[prop] = null;
          }, "close")
        };
      }
      stream.close();
    }
    __name(closeZlibStream, "closeZlibStream");
    function destroyZlibStream(stream) {
      if (typeof stream.destroy === "function") {
        if (stream._binding) {
          stream.destroy();
          if (stream._processing) {
            stream._needDrain = true;
            stream.once("drain", onDrainClearBinding);
          } else {
            stream._binding.clear();
          }
        } else if (stream._destroy && stream._destroy !== Stream.Transform.prototype._destroy) {
          stream.destroy();
        } else if (stream._destroy && typeof stream.close === "function") {
          stream.destroyed = true;
          stream.close();
        } else {
          stream.destroy();
        }
      } else if (typeof stream.close === "function") {
        closeZlibStream(stream);
      }
    }
    __name(destroyZlibStream, "destroyZlibStream");
    function hasDestroy(stream) {
      return stream instanceof Stream && typeof stream.destroy === "function";
    }
    __name(hasDestroy, "hasDestroy");
    function isEventEmitter(val) {
      return val instanceof EventEmitter;
    }
    __name(isEventEmitter, "isEventEmitter");
    function isFsReadStream(stream) {
      return stream instanceof ReadStream;
    }
    __name(isFsReadStream, "isFsReadStream");
    function isZlibStream(stream) {
      return stream instanceof Zlib.Gzip || stream instanceof Zlib.Gunzip || stream instanceof Zlib.Deflate || stream instanceof Zlib.DeflateRaw || stream instanceof Zlib.Inflate || stream instanceof Zlib.InflateRaw || stream instanceof Zlib.Unzip;
    }
    __name(isZlibStream, "isZlibStream");
    function noop() {
    }
    __name(noop, "noop");
    function onDrainClearBinding() {
      this._binding.clear();
    }
    __name(onDrainClearBinding, "onDrainClearBinding");
    function onOpenClose() {
      if (typeof this.fd === "number") {
        this.close();
      }
    }
    __name(onOpenClose, "onOpenClose");
  }
});

// cloudflare/utf8.ts
var utf8_exports = {};
__export(utf8_exports, {
  decode: () => decode,
  encodingExists: () => encodingExists,
  getDecoder: () => getDecoder
});
function encodingExists(encoding) {
  return /^utf-?8$/i.test(encoding);
}
function getDecoder(encoding) {
  if (!encodingExists(encoding))
    throw new Error("Only UTF-8 JSON requests are supported");
  const decoder = new TextDecoder("utf-8");
  return {
    write: /* @__PURE__ */ __name((chunk) => decoder.decode(chunk, { stream: true }), "write"),
    end: /* @__PURE__ */ __name(() => decoder.decode(), "end")
  };
}
function decode(chunk, encoding) {
  if (!encodingExists(encoding)) throw new Error("Unsupported encoding");
  return new TextDecoder("utf-8").decode(chunk);
}
var init_utf8 = __esm({
  "cloudflare/utf8.ts"() {
    __name(encodingExists, "encodingExists");
    __name(getDecoder, "getDecoder");
    __name(decode, "decode");
  }
});

// node_modules/unpipe/index.js
var require_unpipe = __commonJS({
  "node_modules/unpipe/index.js"(exports, module) {
    "use strict";
    module.exports = unpipe;
    function hasPipeDataListeners(stream) {
      var listeners = stream.listeners("data");
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i].name === "ondata") {
          return true;
        }
      }
      return false;
    }
    __name(hasPipeDataListeners, "hasPipeDataListeners");
    function unpipe(stream) {
      if (!stream) {
        throw new TypeError("argument stream is required");
      }
      if (typeof stream.unpipe === "function") {
        stream.unpipe();
        return;
      }
      if (!hasPipeDataListeners(stream)) {
        return;
      }
      var listener;
      var listeners = stream.listeners("close");
      for (var i = 0; i < listeners.length; i++) {
        listener = listeners[i];
        if (listener.name !== "cleanup" && listener.name !== "onclose") {
          continue;
        }
        listener.call(stream);
      }
    }
    __name(unpipe, "unpipe");
  }
});

// node-built-in-modules:async_hooks
import libDefault8 from "async_hooks";
var require_async_hooks = __commonJS({
  "node-built-in-modules:async_hooks"(exports, module) {
    module.exports = libDefault8;
  }
});

// node_modules/raw-body/index.js
var require_raw_body = __commonJS({
  "node_modules/raw-body/index.js"(exports, module) {
    "use strict";
    var asyncHooks = tryRequireAsyncHooks();
    var bytes = require_bytes();
    var createError = require_http_errors();
    var iconv = (init_utf8(), __toCommonJS(utf8_exports));
    var unpipe = require_unpipe();
    module.exports = getRawBody;
    var ICONV_ENCODING_MESSAGE_REGEXP = /^Encoding not recognized: /;
    function getDecoder2(encoding) {
      if (!encoding) return null;
      try {
        return iconv.getDecoder(encoding);
      } catch (e) {
        if (!ICONV_ENCODING_MESSAGE_REGEXP.test(e.message)) throw e;
        throw createError(415, "specified encoding unsupported", {
          encoding,
          type: "encoding.unsupported"
        });
      }
    }
    __name(getDecoder2, "getDecoder");
    function getRawBody(stream, options, callback) {
      var done = callback;
      var opts = options || {};
      if (stream === void 0) {
        throw new TypeError("argument stream is required");
      } else if (typeof stream !== "object" || stream === null || typeof stream.on !== "function") {
        throw new TypeError("argument stream must be a stream");
      }
      if (options === true || typeof options === "string") {
        opts = {
          encoding: options
        };
      }
      if (typeof options === "function") {
        done = options;
        opts = {};
      }
      if (done !== void 0 && typeof done !== "function") {
        throw new TypeError("argument callback must be a function");
      }
      if (!done && !global.Promise) {
        throw new TypeError("argument callback is required");
      }
      var encoding = opts.encoding !== true ? opts.encoding : "utf-8";
      var limit = bytes.parse(opts.limit);
      var length = opts.length != null && !isNaN(opts.length) ? parseInt(opts.length, 10) : null;
      if (done) {
        return readStream(stream, encoding, length, limit, wrap(done));
      }
      return new Promise(/* @__PURE__ */ __name(function executor(resolve, reject) {
        readStream(stream, encoding, length, limit, /* @__PURE__ */ __name(function onRead(err, buf) {
          if (err) return reject(err);
          resolve(buf);
        }, "onRead"));
      }, "executor"));
    }
    __name(getRawBody, "getRawBody");
    function halt(stream) {
      unpipe(stream);
      if (typeof stream.pause === "function") {
        stream.pause();
      }
    }
    __name(halt, "halt");
    function readStream(stream, encoding, length, limit, callback) {
      var complete = false;
      var sync = true;
      if (limit !== null && length !== null && length > limit) {
        return done(createError(413, "request entity too large", {
          expected: length,
          length,
          limit,
          type: "entity.too.large"
        }));
      }
      var state = stream._readableState;
      if (stream._decoder || state && (state.encoding || state.decoder)) {
        return done(createError(500, "stream encoding should not be set", {
          type: "stream.encoding.set"
        }));
      }
      if (typeof stream.readable !== "undefined" && !stream.readable) {
        return done(createError(500, "stream is not readable", {
          type: "stream.not.readable"
        }));
      }
      var received = 0;
      var decoder;
      try {
        decoder = getDecoder2(encoding);
      } catch (err) {
        return done(err);
      }
      var buffer = decoder ? "" : [];
      stream.on("aborted", onAborted);
      stream.on("close", cleanup);
      stream.on("data", onData);
      stream.on("end", onEnd);
      stream.on("error", onEnd);
      sync = false;
      function done() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        complete = true;
        if (sync) {
          process.nextTick(invokeCallback);
        } else {
          invokeCallback();
        }
        function invokeCallback() {
          cleanup();
          if (args[0]) {
            halt(stream);
          }
          callback.apply(null, args);
        }
        __name(invokeCallback, "invokeCallback");
      }
      __name(done, "done");
      function onAborted() {
        if (complete) return;
        done(createError(400, "request aborted", {
          code: "ECONNABORTED",
          expected: length,
          length,
          received,
          type: "request.aborted"
        }));
      }
      __name(onAborted, "onAborted");
      function onData(chunk) {
        if (complete) return;
        received += chunk.length;
        if (limit !== null && received > limit) {
          done(createError(413, "request entity too large", {
            limit,
            received,
            type: "entity.too.large"
          }));
        } else if (decoder) {
          buffer += decoder.write(chunk);
        } else {
          buffer.push(chunk);
        }
      }
      __name(onData, "onData");
      function onEnd(err) {
        if (complete) return;
        if (err) return done(err);
        if (length !== null && received !== length) {
          done(createError(400, "request size did not match content length", {
            expected: length,
            length,
            received,
            type: "request.size.invalid"
          }));
        } else {
          var string = decoder ? buffer + (decoder.end() || "") : Buffer.concat(buffer);
          done(null, string);
        }
      }
      __name(onEnd, "onEnd");
      function cleanup() {
        buffer = null;
        stream.removeListener("aborted", onAborted);
        stream.removeListener("data", onData);
        stream.removeListener("end", onEnd);
        stream.removeListener("error", onEnd);
        stream.removeListener("close", cleanup);
      }
      __name(cleanup, "cleanup");
    }
    __name(readStream, "readStream");
    function tryRequireAsyncHooks() {
      try {
        return require_async_hooks();
      } catch (e) {
        return {};
      }
    }
    __name(tryRequireAsyncHooks, "tryRequireAsyncHooks");
    function wrap(fn) {
      var res;
      if (asyncHooks.AsyncResource) {
        res = new asyncHooks.AsyncResource(fn.name || "bound-anonymous-fn");
      }
      if (!res || !res.runInAsyncScope) {
        return fn;
      }
      return res.runInAsyncScope.bind(res, fn, null);
    }
    __name(wrap, "wrap");
  }
});

// node_modules/ee-first/index.js
var require_ee_first = __commonJS({
  "node_modules/ee-first/index.js"(exports, module) {
    "use strict";
    module.exports = first;
    function first(stuff, done) {
      if (!Array.isArray(stuff))
        throw new TypeError("arg must be an array of [ee, events...] arrays");
      var cleanups = [];
      for (var i = 0; i < stuff.length; i++) {
        var arr = stuff[i];
        if (!Array.isArray(arr) || arr.length < 2)
          throw new TypeError("each array member must be [ee, events...]");
        var ee = arr[0];
        for (var j = 1; j < arr.length; j++) {
          var event = arr[j];
          var fn = listener(event, callback);
          ee.on(event, fn);
          cleanups.push({
            ee,
            event,
            fn
          });
        }
      }
      function callback() {
        cleanup();
        done.apply(null, arguments);
      }
      __name(callback, "callback");
      function cleanup() {
        var x;
        for (var i2 = 0; i2 < cleanups.length; i2++) {
          x = cleanups[i2];
          x.ee.removeListener(x.event, x.fn);
        }
      }
      __name(cleanup, "cleanup");
      function thunk(fn2) {
        done = fn2;
      }
      __name(thunk, "thunk");
      thunk.cancel = cleanup;
      return thunk;
    }
    __name(first, "first");
    function listener(event, done) {
      return /* @__PURE__ */ __name(function onevent(arg1) {
        var args = new Array(arguments.length);
        var ee = this;
        var err = event === "error" ? arg1 : null;
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        done(err, ee, event, args);
      }, "onevent");
    }
    __name(listener, "listener");
  }
});

// node_modules/on-finished/index.js
var require_on_finished = __commonJS({
  "node_modules/on-finished/index.js"(exports, module) {
    "use strict";
    module.exports = onFinished;
    module.exports.isFinished = isFinished;
    var asyncHooks = tryRequireAsyncHooks();
    var first = require_ee_first();
    var defer = typeof setImmediate === "function" ? setImmediate : function(fn) {
      process.nextTick(fn.bind.apply(fn, arguments));
    };
    function onFinished(msg, listener) {
      if (isFinished(msg) !== false) {
        defer(listener, null, msg);
        return msg;
      }
      attachListener(msg, wrap(listener));
      return msg;
    }
    __name(onFinished, "onFinished");
    function isFinished(msg) {
      var socket = msg.socket;
      var finished = writableEnded(msg);
      if (typeof finished === "boolean") {
        return Boolean(finished || socket && !socket.writable);
      }
      if (typeof msg.complete === "boolean") {
        return Boolean(msg.upgrade || !socket || !socket.readable || msg.complete && !msg.readable);
      }
      return void 0;
    }
    __name(isFinished, "isFinished");
    function attachFinishedListener(msg, callback) {
      var eeMsg;
      var eeSocket;
      var finished = false;
      function onFinish(error) {
        eeMsg.cancel();
        eeSocket.cancel();
        finished = true;
        callback(error);
      }
      __name(onFinish, "onFinish");
      eeMsg = eeSocket = first([[msg, "end", "finish"]], onFinish);
      function onSocket(socket) {
        msg.removeListener("socket", onSocket);
        if (finished) return;
        if (eeMsg !== eeSocket) return;
        eeSocket = first([[socket, "error", "close"]], onFinish);
      }
      __name(onSocket, "onSocket");
      if (msg.socket) {
        onSocket(msg.socket);
        return;
      }
      msg.on("socket", onSocket);
      if (msg.socket === void 0) {
        patchAssignSocket(msg, onSocket);
      }
    }
    __name(attachFinishedListener, "attachFinishedListener");
    function attachListener(msg, listener) {
      var attached = msg.__onFinished;
      if (!attached || !attached.queue) {
        attached = msg.__onFinished = createListener(msg);
        attachFinishedListener(msg, attached);
      }
      attached.queue.push(listener);
    }
    __name(attachListener, "attachListener");
    function createListener(msg) {
      function listener(err) {
        if (msg.__onFinished === listener) msg.__onFinished = null;
        if (!listener.queue) return;
        var queue = listener.queue;
        listener.queue = null;
        for (var i = 0; i < queue.length; i++) {
          queue[i](err, msg);
        }
      }
      __name(listener, "listener");
      listener.queue = [];
      return listener;
    }
    __name(createListener, "createListener");
    function patchAssignSocket(res, callback) {
      var assignSocket = res.assignSocket;
      if (typeof assignSocket !== "function") return;
      res.assignSocket = /* @__PURE__ */ __name(function _assignSocket(socket) {
        assignSocket.call(this, socket);
        callback(socket);
      }, "_assignSocket");
    }
    __name(patchAssignSocket, "patchAssignSocket");
    function tryRequireAsyncHooks() {
      try {
        return require_async_hooks();
      } catch (e) {
        return {};
      }
    }
    __name(tryRequireAsyncHooks, "tryRequireAsyncHooks");
    function wrap(fn) {
      var res;
      if (asyncHooks.AsyncResource) {
        res = new asyncHooks.AsyncResource(fn.name || "bound-anonymous-fn");
      }
      if (!res || !res.runInAsyncScope) {
        return fn;
      }
      return res.runInAsyncScope.bind(res, fn, null);
    }
    __name(wrap, "wrap");
    function writableEnded(res) {
      return typeof res.writableEnded === "boolean" ? res.writableEnded : res.finished;
    }
    __name(writableEnded, "writableEnded");
  }
});

// node_modules/body-parser/lib/read.js
var require_read = __commonJS({
  "node_modules/body-parser/lib/read.js"(exports, module) {
    "use strict";
    var createError = require_http_errors();
    var destroy = require_destroy();
    var getBody = require_raw_body();
    var iconv = (init_utf8(), __toCommonJS(utf8_exports));
    var onFinished = require_on_finished();
    var unpipe = require_unpipe();
    var zlib = require_zlib();
    module.exports = read;
    function read(req, res, next, parse, debug, options) {
      var length;
      var opts = options;
      var stream;
      req._body = true;
      var encoding = opts.encoding !== null ? opts.encoding : null;
      var verify = opts.verify;
      if (verify && encoding !== null && !iconv.encodingExists(encoding)) {
        return next(createError(415, 'unsupported charset "' + encoding.toUpperCase() + '"', {
          charset: encoding.toLowerCase(),
          type: "charset.unsupported"
        }));
      }
      try {
        stream = contentstream(req, debug, opts.inflate);
        length = stream.length;
        stream.length = void 0;
      } catch (err) {
        return next(err);
      }
      opts.length = length;
      opts.encoding = verify ? null : encoding;
      debug("read body");
      getBody(stream, opts, function(error, body) {
        if (error) {
          var _error;
          if (error.type === "encoding.unsupported") {
            _error = createError(415, 'unsupported charset "' + encoding.toUpperCase() + '"', {
              charset: encoding.toLowerCase(),
              type: "charset.unsupported"
            });
          } else {
            _error = createError(400, error);
          }
          if (stream !== req) {
            unpipe(req);
            destroy(stream, true);
          }
          dump(req, /* @__PURE__ */ __name(function onfinished() {
            next(createError(400, _error));
          }, "onfinished"));
          return;
        }
        if (stream !== req) {
          if (typeof req.unpipe === "function") {
            req.unpipe(stream);
          } else {
            unpipe(req);
          }
          stream.on("error", function() {
          });
          destroy(stream, true);
          req.resume();
        }
        if (verify) {
          try {
            debug("verify body");
            verify(req, res, body, encoding);
          } catch (err) {
            next(createError(403, err, {
              body,
              type: err.type || "entity.verify.failed"
            }));
            return;
          }
        }
        var str = body;
        try {
          debug("parse body");
          str = typeof body !== "string" && encoding !== null ? iconv.decode(body, encoding) : body;
          req.body = parse(str);
        } catch (err) {
          next(createError(400, err, {
            body: str,
            type: err.type || "entity.parse.failed"
          }));
          return;
        }
        next();
      });
    }
    __name(read, "read");
    function contentstream(req, debug, inflate) {
      var encoding = (req.headers["content-encoding"] || "identity").toLowerCase();
      var length = req.headers["content-length"];
      var stream;
      debug('content-encoding "%s"', encoding);
      if (inflate === false && encoding !== "identity") {
        throw createError(415, "content encoding unsupported", {
          encoding,
          type: "encoding.unsupported"
        });
      }
      switch (encoding) {
        case "deflate":
          stream = zlib.createInflate();
          debug("inflate body");
          req.pipe(stream);
          break;
        case "gzip":
          stream = zlib.createGunzip();
          debug("gunzip body");
          req.pipe(stream);
          break;
        case "identity":
          stream = req;
          stream.length = length;
          break;
        default:
          throw createError(415, 'unsupported content encoding "' + encoding + '"', {
            encoding,
            type: "encoding.unsupported"
          });
      }
      return stream;
    }
    __name(contentstream, "contentstream");
    function dump(req, callback) {
      if (onFinished.isFinished(req)) {
        callback(null);
      } else {
        onFinished(req, callback);
        req.resume();
      }
    }
    __name(dump, "dump");
  }
});

// node_modules/media-typer/index.js
var require_media_typer = __commonJS({
  "node_modules/media-typer/index.js"(exports) {
    var paramRegExp = /; *([!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+) *= *("(?:[ !\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u0020-\u007e])*"|[!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+) */g;
    var textRegExp = /^[\u0020-\u007e\u0080-\u00ff]+$/;
    var tokenRegExp = /^[!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+$/;
    var qescRegExp = /\\([\u0000-\u007f])/g;
    var quoteRegExp = /([\\"])/g;
    var subtypeNameRegExp = /^[A-Za-z0-9][A-Za-z0-9!#$&^_.-]{0,126}$/;
    var typeNameRegExp = /^[A-Za-z0-9][A-Za-z0-9!#$&^_-]{0,126}$/;
    var typeRegExp = /^ *([A-Za-z0-9][A-Za-z0-9!#$&^_-]{0,126})\/([A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}) *$/;
    exports.format = format;
    exports.parse = parse;
    function format(obj) {
      if (!obj || typeof obj !== "object") {
        throw new TypeError("argument obj is required");
      }
      var parameters = obj.parameters;
      var subtype = obj.subtype;
      var suffix = obj.suffix;
      var type = obj.type;
      if (!type || !typeNameRegExp.test(type)) {
        throw new TypeError("invalid type");
      }
      if (!subtype || !subtypeNameRegExp.test(subtype)) {
        throw new TypeError("invalid subtype");
      }
      var string = type + "/" + subtype;
      if (suffix) {
        if (!typeNameRegExp.test(suffix)) {
          throw new TypeError("invalid suffix");
        }
        string += "+" + suffix;
      }
      if (parameters && typeof parameters === "object") {
        var param;
        var params = Object.keys(parameters).sort();
        for (var i = 0; i < params.length; i++) {
          param = params[i];
          if (!tokenRegExp.test(param)) {
            throw new TypeError("invalid parameter name");
          }
          string += "; " + param + "=" + qstring(parameters[param]);
        }
      }
      return string;
    }
    __name(format, "format");
    function parse(string) {
      if (!string) {
        throw new TypeError("argument string is required");
      }
      if (typeof string === "object") {
        string = getcontenttype(string);
      }
      if (typeof string !== "string") {
        throw new TypeError("argument string is required to be a string");
      }
      var index = string.indexOf(";");
      var type = index !== -1 ? string.substr(0, index) : string;
      var key2;
      var match;
      var obj = splitType(type);
      var params = {};
      var value;
      paramRegExp.lastIndex = index;
      while (match = paramRegExp.exec(string)) {
        if (match.index !== index) {
          throw new TypeError("invalid parameter format");
        }
        index += match[0].length;
        key2 = match[1].toLowerCase();
        value = match[2];
        if (value[0] === '"') {
          value = value.substr(1, value.length - 2).replace(qescRegExp, "$1");
        }
        params[key2] = value;
      }
      if (index !== -1 && index !== string.length) {
        throw new TypeError("invalid parameter format");
      }
      obj.parameters = params;
      return obj;
    }
    __name(parse, "parse");
    function getcontenttype(obj) {
      if (typeof obj.getHeader === "function") {
        return obj.getHeader("content-type");
      }
      if (typeof obj.headers === "object") {
        return obj.headers && obj.headers["content-type"];
      }
    }
    __name(getcontenttype, "getcontenttype");
    function qstring(val) {
      var str = String(val);
      if (tokenRegExp.test(str)) {
        return str;
      }
      if (str.length > 0 && !textRegExp.test(str)) {
        throw new TypeError("invalid parameter value");
      }
      return '"' + str.replace(quoteRegExp, "\\$1") + '"';
    }
    __name(qstring, "qstring");
    function splitType(string) {
      var match = typeRegExp.exec(string.toLowerCase());
      if (!match) {
        throw new TypeError("invalid media type");
      }
      var type = match[1];
      var subtype = match[2];
      var suffix;
      var index = subtype.lastIndexOf("+");
      if (index !== -1) {
        suffix = subtype.substr(index + 1);
        subtype = subtype.substr(0, index);
      }
      var obj = {
        type,
        subtype,
        suffix
      };
      return obj;
    }
    __name(splitType, "splitType");
  }
});

// node_modules/mime-db/db.json
var require_db = __commonJS({
  "node_modules/mime-db/db.json"(exports, module) {
    module.exports = {
      "application/1d-interleaved-parityfec": {
        source: "iana"
      },
      "application/3gpdash-qoe-report+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/3gpp-ims+xml": {
        source: "iana",
        compressible: true
      },
      "application/3gpphal+json": {
        source: "iana",
        compressible: true
      },
      "application/3gpphalforms+json": {
        source: "iana",
        compressible: true
      },
      "application/a2l": {
        source: "iana"
      },
      "application/ace+cbor": {
        source: "iana"
      },
      "application/activemessage": {
        source: "iana"
      },
      "application/activity+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-costmap+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-costmapfilter+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-directory+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointcost+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointcostparams+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointprop+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointpropparams+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-error+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-networkmap+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-networkmapfilter+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-updatestreamcontrol+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-updatestreamparams+json": {
        source: "iana",
        compressible: true
      },
      "application/aml": {
        source: "iana"
      },
      "application/andrew-inset": {
        source: "iana",
        extensions: ["ez"]
      },
      "application/applefile": {
        source: "iana"
      },
      "application/applixware": {
        source: "apache",
        extensions: ["aw"]
      },
      "application/at+jwt": {
        source: "iana"
      },
      "application/atf": {
        source: "iana"
      },
      "application/atfx": {
        source: "iana"
      },
      "application/atom+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atom"]
      },
      "application/atomcat+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomcat"]
      },
      "application/atomdeleted+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomdeleted"]
      },
      "application/atomicmail": {
        source: "iana"
      },
      "application/atomsvc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomsvc"]
      },
      "application/atsc-dwd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dwd"]
      },
      "application/atsc-dynamic-event-message": {
        source: "iana"
      },
      "application/atsc-held+xml": {
        source: "iana",
        compressible: true,
        extensions: ["held"]
      },
      "application/atsc-rdt+json": {
        source: "iana",
        compressible: true
      },
      "application/atsc-rsat+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rsat"]
      },
      "application/atxml": {
        source: "iana"
      },
      "application/auth-policy+xml": {
        source: "iana",
        compressible: true
      },
      "application/bacnet-xdd+zip": {
        source: "iana",
        compressible: false
      },
      "application/batch-smtp": {
        source: "iana"
      },
      "application/bdoc": {
        compressible: false,
        extensions: ["bdoc"]
      },
      "application/beep+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/calendar+json": {
        source: "iana",
        compressible: true
      },
      "application/calendar+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xcs"]
      },
      "application/call-completion": {
        source: "iana"
      },
      "application/cals-1840": {
        source: "iana"
      },
      "application/captive+json": {
        source: "iana",
        compressible: true
      },
      "application/cbor": {
        source: "iana"
      },
      "application/cbor-seq": {
        source: "iana"
      },
      "application/cccex": {
        source: "iana"
      },
      "application/ccmp+xml": {
        source: "iana",
        compressible: true
      },
      "application/ccxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ccxml"]
      },
      "application/cdfx+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cdfx"]
      },
      "application/cdmi-capability": {
        source: "iana",
        extensions: ["cdmia"]
      },
      "application/cdmi-container": {
        source: "iana",
        extensions: ["cdmic"]
      },
      "application/cdmi-domain": {
        source: "iana",
        extensions: ["cdmid"]
      },
      "application/cdmi-object": {
        source: "iana",
        extensions: ["cdmio"]
      },
      "application/cdmi-queue": {
        source: "iana",
        extensions: ["cdmiq"]
      },
      "application/cdni": {
        source: "iana"
      },
      "application/cea": {
        source: "iana"
      },
      "application/cea-2018+xml": {
        source: "iana",
        compressible: true
      },
      "application/cellml+xml": {
        source: "iana",
        compressible: true
      },
      "application/cfw": {
        source: "iana"
      },
      "application/city+json": {
        source: "iana",
        compressible: true
      },
      "application/clr": {
        source: "iana"
      },
      "application/clue+xml": {
        source: "iana",
        compressible: true
      },
      "application/clue_info+xml": {
        source: "iana",
        compressible: true
      },
      "application/cms": {
        source: "iana"
      },
      "application/cnrp+xml": {
        source: "iana",
        compressible: true
      },
      "application/coap-group+json": {
        source: "iana",
        compressible: true
      },
      "application/coap-payload": {
        source: "iana"
      },
      "application/commonground": {
        source: "iana"
      },
      "application/conference-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/cose": {
        source: "iana"
      },
      "application/cose-key": {
        source: "iana"
      },
      "application/cose-key-set": {
        source: "iana"
      },
      "application/cpl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cpl"]
      },
      "application/csrattrs": {
        source: "iana"
      },
      "application/csta+xml": {
        source: "iana",
        compressible: true
      },
      "application/cstadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/csvm+json": {
        source: "iana",
        compressible: true
      },
      "application/cu-seeme": {
        source: "apache",
        extensions: ["cu"]
      },
      "application/cwt": {
        source: "iana"
      },
      "application/cybercash": {
        source: "iana"
      },
      "application/dart": {
        compressible: true
      },
      "application/dash+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpd"]
      },
      "application/dash-patch+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpp"]
      },
      "application/dashdelta": {
        source: "iana"
      },
      "application/davmount+xml": {
        source: "iana",
        compressible: true,
        extensions: ["davmount"]
      },
      "application/dca-rft": {
        source: "iana"
      },
      "application/dcd": {
        source: "iana"
      },
      "application/dec-dx": {
        source: "iana"
      },
      "application/dialog-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/dicom": {
        source: "iana"
      },
      "application/dicom+json": {
        source: "iana",
        compressible: true
      },
      "application/dicom+xml": {
        source: "iana",
        compressible: true
      },
      "application/dii": {
        source: "iana"
      },
      "application/dit": {
        source: "iana"
      },
      "application/dns": {
        source: "iana"
      },
      "application/dns+json": {
        source: "iana",
        compressible: true
      },
      "application/dns-message": {
        source: "iana"
      },
      "application/docbook+xml": {
        source: "apache",
        compressible: true,
        extensions: ["dbk"]
      },
      "application/dots+cbor": {
        source: "iana"
      },
      "application/dskpp+xml": {
        source: "iana",
        compressible: true
      },
      "application/dssc+der": {
        source: "iana",
        extensions: ["dssc"]
      },
      "application/dssc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdssc"]
      },
      "application/dvcs": {
        source: "iana"
      },
      "application/ecmascript": {
        source: "iana",
        compressible: true,
        extensions: ["es", "ecma"]
      },
      "application/edi-consent": {
        source: "iana"
      },
      "application/edi-x12": {
        source: "iana",
        compressible: false
      },
      "application/edifact": {
        source: "iana",
        compressible: false
      },
      "application/efi": {
        source: "iana"
      },
      "application/elm+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/elm+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.cap+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/emergencycalldata.comment+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.control+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.deviceinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.ecall.msd": {
        source: "iana"
      },
      "application/emergencycalldata.providerinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.serviceinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.subscriberinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.veds+xml": {
        source: "iana",
        compressible: true
      },
      "application/emma+xml": {
        source: "iana",
        compressible: true,
        extensions: ["emma"]
      },
      "application/emotionml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["emotionml"]
      },
      "application/encaprtp": {
        source: "iana"
      },
      "application/epp+xml": {
        source: "iana",
        compressible: true
      },
      "application/epub+zip": {
        source: "iana",
        compressible: false,
        extensions: ["epub"]
      },
      "application/eshop": {
        source: "iana"
      },
      "application/exi": {
        source: "iana",
        extensions: ["exi"]
      },
      "application/expect-ct-report+json": {
        source: "iana",
        compressible: true
      },
      "application/express": {
        source: "iana",
        extensions: ["exp"]
      },
      "application/fastinfoset": {
        source: "iana"
      },
      "application/fastsoap": {
        source: "iana"
      },
      "application/fdt+xml": {
        source: "iana",
        compressible: true,
        extensions: ["fdt"]
      },
      "application/fhir+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/fhir+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/fido.trusted-apps+json": {
        compressible: true
      },
      "application/fits": {
        source: "iana"
      },
      "application/flexfec": {
        source: "iana"
      },
      "application/font-sfnt": {
        source: "iana"
      },
      "application/font-tdpfr": {
        source: "iana",
        extensions: ["pfr"]
      },
      "application/font-woff": {
        source: "iana",
        compressible: false
      },
      "application/framework-attributes+xml": {
        source: "iana",
        compressible: true
      },
      "application/geo+json": {
        source: "iana",
        compressible: true,
        extensions: ["geojson"]
      },
      "application/geo+json-seq": {
        source: "iana"
      },
      "application/geopackage+sqlite3": {
        source: "iana"
      },
      "application/geoxacml+xml": {
        source: "iana",
        compressible: true
      },
      "application/gltf-buffer": {
        source: "iana"
      },
      "application/gml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["gml"]
      },
      "application/gpx+xml": {
        source: "apache",
        compressible: true,
        extensions: ["gpx"]
      },
      "application/gxf": {
        source: "apache",
        extensions: ["gxf"]
      },
      "application/gzip": {
        source: "iana",
        compressible: false,
        extensions: ["gz"]
      },
      "application/h224": {
        source: "iana"
      },
      "application/held+xml": {
        source: "iana",
        compressible: true
      },
      "application/hjson": {
        extensions: ["hjson"]
      },
      "application/http": {
        source: "iana"
      },
      "application/hyperstudio": {
        source: "iana",
        extensions: ["stk"]
      },
      "application/ibe-key-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/ibe-pkg-reply+xml": {
        source: "iana",
        compressible: true
      },
      "application/ibe-pp-data": {
        source: "iana"
      },
      "application/iges": {
        source: "iana"
      },
      "application/im-iscomposing+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/index": {
        source: "iana"
      },
      "application/index.cmd": {
        source: "iana"
      },
      "application/index.obj": {
        source: "iana"
      },
      "application/index.response": {
        source: "iana"
      },
      "application/index.vnd": {
        source: "iana"
      },
      "application/inkml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ink", "inkml"]
      },
      "application/iotp": {
        source: "iana"
      },
      "application/ipfix": {
        source: "iana",
        extensions: ["ipfix"]
      },
      "application/ipp": {
        source: "iana"
      },
      "application/isup": {
        source: "iana"
      },
      "application/its+xml": {
        source: "iana",
        compressible: true,
        extensions: ["its"]
      },
      "application/java-archive": {
        source: "apache",
        compressible: false,
        extensions: ["jar", "war", "ear"]
      },
      "application/java-serialized-object": {
        source: "apache",
        compressible: false,
        extensions: ["ser"]
      },
      "application/java-vm": {
        source: "apache",
        compressible: false,
        extensions: ["class"]
      },
      "application/javascript": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["js", "mjs"]
      },
      "application/jf2feed+json": {
        source: "iana",
        compressible: true
      },
      "application/jose": {
        source: "iana"
      },
      "application/jose+json": {
        source: "iana",
        compressible: true
      },
      "application/jrd+json": {
        source: "iana",
        compressible: true
      },
      "application/jscalendar+json": {
        source: "iana",
        compressible: true
      },
      "application/json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["json", "map"]
      },
      "application/json-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/json-seq": {
        source: "iana"
      },
      "application/json5": {
        extensions: ["json5"]
      },
      "application/jsonml+json": {
        source: "apache",
        compressible: true,
        extensions: ["jsonml"]
      },
      "application/jwk+json": {
        source: "iana",
        compressible: true
      },
      "application/jwk-set+json": {
        source: "iana",
        compressible: true
      },
      "application/jwt": {
        source: "iana"
      },
      "application/kpml-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/kpml-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/ld+json": {
        source: "iana",
        compressible: true,
        extensions: ["jsonld"]
      },
      "application/lgr+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lgr"]
      },
      "application/link-format": {
        source: "iana"
      },
      "application/load-control+xml": {
        source: "iana",
        compressible: true
      },
      "application/lost+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lostxml"]
      },
      "application/lostsync+xml": {
        source: "iana",
        compressible: true
      },
      "application/lpf+zip": {
        source: "iana",
        compressible: false
      },
      "application/lxf": {
        source: "iana"
      },
      "application/mac-binhex40": {
        source: "iana",
        extensions: ["hqx"]
      },
      "application/mac-compactpro": {
        source: "apache",
        extensions: ["cpt"]
      },
      "application/macwriteii": {
        source: "iana"
      },
      "application/mads+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mads"]
      },
      "application/manifest+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["webmanifest"]
      },
      "application/marc": {
        source: "iana",
        extensions: ["mrc"]
      },
      "application/marcxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mrcx"]
      },
      "application/mathematica": {
        source: "iana",
        extensions: ["ma", "nb", "mb"]
      },
      "application/mathml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mathml"]
      },
      "application/mathml-content+xml": {
        source: "iana",
        compressible: true
      },
      "application/mathml-presentation+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-associated-procedure-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-deregister+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-envelope+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-msk+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-msk-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-protection-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-reception-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-register+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-register-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-schedule+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-user-service-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbox": {
        source: "iana",
        extensions: ["mbox"]
      },
      "application/media-policy-dataset+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpf"]
      },
      "application/media_control+xml": {
        source: "iana",
        compressible: true
      },
      "application/mediaservercontrol+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mscml"]
      },
      "application/merge-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/metalink+xml": {
        source: "apache",
        compressible: true,
        extensions: ["metalink"]
      },
      "application/metalink4+xml": {
        source: "iana",
        compressible: true,
        extensions: ["meta4"]
      },
      "application/mets+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mets"]
      },
      "application/mf4": {
        source: "iana"
      },
      "application/mikey": {
        source: "iana"
      },
      "application/mipc": {
        source: "iana"
      },
      "application/missing-blocks+cbor-seq": {
        source: "iana"
      },
      "application/mmt-aei+xml": {
        source: "iana",
        compressible: true,
        extensions: ["maei"]
      },
      "application/mmt-usd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["musd"]
      },
      "application/mods+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mods"]
      },
      "application/moss-keys": {
        source: "iana"
      },
      "application/moss-signature": {
        source: "iana"
      },
      "application/mosskey-data": {
        source: "iana"
      },
      "application/mosskey-request": {
        source: "iana"
      },
      "application/mp21": {
        source: "iana",
        extensions: ["m21", "mp21"]
      },
      "application/mp4": {
        source: "iana",
        extensions: ["mp4s", "m4p"]
      },
      "application/mpeg4-generic": {
        source: "iana"
      },
      "application/mpeg4-iod": {
        source: "iana"
      },
      "application/mpeg4-iod-xmt": {
        source: "iana"
      },
      "application/mrb-consumer+xml": {
        source: "iana",
        compressible: true
      },
      "application/mrb-publish+xml": {
        source: "iana",
        compressible: true
      },
      "application/msc-ivr+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/msc-mixer+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/msword": {
        source: "iana",
        compressible: false,
        extensions: ["doc", "dot"]
      },
      "application/mud+json": {
        source: "iana",
        compressible: true
      },
      "application/multipart-core": {
        source: "iana"
      },
      "application/mxf": {
        source: "iana",
        extensions: ["mxf"]
      },
      "application/n-quads": {
        source: "iana",
        extensions: ["nq"]
      },
      "application/n-triples": {
        source: "iana",
        extensions: ["nt"]
      },
      "application/nasdata": {
        source: "iana"
      },
      "application/news-checkgroups": {
        source: "iana",
        charset: "US-ASCII"
      },
      "application/news-groupinfo": {
        source: "iana",
        charset: "US-ASCII"
      },
      "application/news-transmission": {
        source: "iana"
      },
      "application/nlsml+xml": {
        source: "iana",
        compressible: true
      },
      "application/node": {
        source: "iana",
        extensions: ["cjs"]
      },
      "application/nss": {
        source: "iana"
      },
      "application/oauth-authz-req+jwt": {
        source: "iana"
      },
      "application/oblivious-dns-message": {
        source: "iana"
      },
      "application/ocsp-request": {
        source: "iana"
      },
      "application/ocsp-response": {
        source: "iana"
      },
      "application/octet-stream": {
        source: "iana",
        compressible: false,
        extensions: ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"]
      },
      "application/oda": {
        source: "iana",
        extensions: ["oda"]
      },
      "application/odm+xml": {
        source: "iana",
        compressible: true
      },
      "application/odx": {
        source: "iana"
      },
      "application/oebps-package+xml": {
        source: "iana",
        compressible: true,
        extensions: ["opf"]
      },
      "application/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["ogx"]
      },
      "application/omdoc+xml": {
        source: "apache",
        compressible: true,
        extensions: ["omdoc"]
      },
      "application/onenote": {
        source: "apache",
        extensions: ["onetoc", "onetoc2", "onetmp", "onepkg"]
      },
      "application/opc-nodeset+xml": {
        source: "iana",
        compressible: true
      },
      "application/oscore": {
        source: "iana"
      },
      "application/oxps": {
        source: "iana",
        extensions: ["oxps"]
      },
      "application/p21": {
        source: "iana"
      },
      "application/p21+zip": {
        source: "iana",
        compressible: false
      },
      "application/p2p-overlay+xml": {
        source: "iana",
        compressible: true,
        extensions: ["relo"]
      },
      "application/parityfec": {
        source: "iana"
      },
      "application/passport": {
        source: "iana"
      },
      "application/patch-ops-error+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xer"]
      },
      "application/pdf": {
        source: "iana",
        compressible: false,
        extensions: ["pdf"]
      },
      "application/pdx": {
        source: "iana"
      },
      "application/pem-certificate-chain": {
        source: "iana"
      },
      "application/pgp-encrypted": {
        source: "iana",
        compressible: false,
        extensions: ["pgp"]
      },
      "application/pgp-keys": {
        source: "iana",
        extensions: ["asc"]
      },
      "application/pgp-signature": {
        source: "iana",
        extensions: ["asc", "sig"]
      },
      "application/pics-rules": {
        source: "apache",
        extensions: ["prf"]
      },
      "application/pidf+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/pidf-diff+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/pkcs10": {
        source: "iana",
        extensions: ["p10"]
      },
      "application/pkcs12": {
        source: "iana"
      },
      "application/pkcs7-mime": {
        source: "iana",
        extensions: ["p7m", "p7c"]
      },
      "application/pkcs7-signature": {
        source: "iana",
        extensions: ["p7s"]
      },
      "application/pkcs8": {
        source: "iana",
        extensions: ["p8"]
      },
      "application/pkcs8-encrypted": {
        source: "iana"
      },
      "application/pkix-attr-cert": {
        source: "iana",
        extensions: ["ac"]
      },
      "application/pkix-cert": {
        source: "iana",
        extensions: ["cer"]
      },
      "application/pkix-crl": {
        source: "iana",
        extensions: ["crl"]
      },
      "application/pkix-pkipath": {
        source: "iana",
        extensions: ["pkipath"]
      },
      "application/pkixcmp": {
        source: "iana",
        extensions: ["pki"]
      },
      "application/pls+xml": {
        source: "iana",
        compressible: true,
        extensions: ["pls"]
      },
      "application/poc-settings+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/postscript": {
        source: "iana",
        compressible: true,
        extensions: ["ai", "eps", "ps"]
      },
      "application/ppsp-tracker+json": {
        source: "iana",
        compressible: true
      },
      "application/problem+json": {
        source: "iana",
        compressible: true
      },
      "application/problem+xml": {
        source: "iana",
        compressible: true
      },
      "application/provenance+xml": {
        source: "iana",
        compressible: true,
        extensions: ["provx"]
      },
      "application/prs.alvestrand.titrax-sheet": {
        source: "iana"
      },
      "application/prs.cww": {
        source: "iana",
        extensions: ["cww"]
      },
      "application/prs.cyn": {
        source: "iana",
        charset: "7-BIT"
      },
      "application/prs.hpub+zip": {
        source: "iana",
        compressible: false
      },
      "application/prs.nprend": {
        source: "iana"
      },
      "application/prs.plucker": {
        source: "iana"
      },
      "application/prs.rdf-xml-crypt": {
        source: "iana"
      },
      "application/prs.xsf+xml": {
        source: "iana",
        compressible: true
      },
      "application/pskc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["pskcxml"]
      },
      "application/pvd+json": {
        source: "iana",
        compressible: true
      },
      "application/qsig": {
        source: "iana"
      },
      "application/raml+yaml": {
        compressible: true,
        extensions: ["raml"]
      },
      "application/raptorfec": {
        source: "iana"
      },
      "application/rdap+json": {
        source: "iana",
        compressible: true
      },
      "application/rdf+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rdf", "owl"]
      },
      "application/reginfo+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rif"]
      },
      "application/relax-ng-compact-syntax": {
        source: "iana",
        extensions: ["rnc"]
      },
      "application/remote-printing": {
        source: "iana"
      },
      "application/reputon+json": {
        source: "iana",
        compressible: true
      },
      "application/resource-lists+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rl"]
      },
      "application/resource-lists-diff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rld"]
      },
      "application/rfc+xml": {
        source: "iana",
        compressible: true
      },
      "application/riscos": {
        source: "iana"
      },
      "application/rlmi+xml": {
        source: "iana",
        compressible: true
      },
      "application/rls-services+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rs"]
      },
      "application/route-apd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rapd"]
      },
      "application/route-s-tsid+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sls"]
      },
      "application/route-usd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rusd"]
      },
      "application/rpki-ghostbusters": {
        source: "iana",
        extensions: ["gbr"]
      },
      "application/rpki-manifest": {
        source: "iana",
        extensions: ["mft"]
      },
      "application/rpki-publication": {
        source: "iana"
      },
      "application/rpki-roa": {
        source: "iana",
        extensions: ["roa"]
      },
      "application/rpki-updown": {
        source: "iana"
      },
      "application/rsd+xml": {
        source: "apache",
        compressible: true,
        extensions: ["rsd"]
      },
      "application/rss+xml": {
        source: "apache",
        compressible: true,
        extensions: ["rss"]
      },
      "application/rtf": {
        source: "iana",
        compressible: true,
        extensions: ["rtf"]
      },
      "application/rtploopback": {
        source: "iana"
      },
      "application/rtx": {
        source: "iana"
      },
      "application/samlassertion+xml": {
        source: "iana",
        compressible: true
      },
      "application/samlmetadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/sarif+json": {
        source: "iana",
        compressible: true
      },
      "application/sarif-external-properties+json": {
        source: "iana",
        compressible: true
      },
      "application/sbe": {
        source: "iana"
      },
      "application/sbml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sbml"]
      },
      "application/scaip+xml": {
        source: "iana",
        compressible: true
      },
      "application/scim+json": {
        source: "iana",
        compressible: true
      },
      "application/scvp-cv-request": {
        source: "iana",
        extensions: ["scq"]
      },
      "application/scvp-cv-response": {
        source: "iana",
        extensions: ["scs"]
      },
      "application/scvp-vp-request": {
        source: "iana",
        extensions: ["spq"]
      },
      "application/scvp-vp-response": {
        source: "iana",
        extensions: ["spp"]
      },
      "application/sdp": {
        source: "iana",
        extensions: ["sdp"]
      },
      "application/secevent+jwt": {
        source: "iana"
      },
      "application/senml+cbor": {
        source: "iana"
      },
      "application/senml+json": {
        source: "iana",
        compressible: true
      },
      "application/senml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["senmlx"]
      },
      "application/senml-etch+cbor": {
        source: "iana"
      },
      "application/senml-etch+json": {
        source: "iana",
        compressible: true
      },
      "application/senml-exi": {
        source: "iana"
      },
      "application/sensml+cbor": {
        source: "iana"
      },
      "application/sensml+json": {
        source: "iana",
        compressible: true
      },
      "application/sensml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sensmlx"]
      },
      "application/sensml-exi": {
        source: "iana"
      },
      "application/sep+xml": {
        source: "iana",
        compressible: true
      },
      "application/sep-exi": {
        source: "iana"
      },
      "application/session-info": {
        source: "iana"
      },
      "application/set-payment": {
        source: "iana"
      },
      "application/set-payment-initiation": {
        source: "iana",
        extensions: ["setpay"]
      },
      "application/set-registration": {
        source: "iana"
      },
      "application/set-registration-initiation": {
        source: "iana",
        extensions: ["setreg"]
      },
      "application/sgml": {
        source: "iana"
      },
      "application/sgml-open-catalog": {
        source: "iana"
      },
      "application/shf+xml": {
        source: "iana",
        compressible: true,
        extensions: ["shf"]
      },
      "application/sieve": {
        source: "iana",
        extensions: ["siv", "sieve"]
      },
      "application/simple-filter+xml": {
        source: "iana",
        compressible: true
      },
      "application/simple-message-summary": {
        source: "iana"
      },
      "application/simplesymbolcontainer": {
        source: "iana"
      },
      "application/sipc": {
        source: "iana"
      },
      "application/slate": {
        source: "iana"
      },
      "application/smil": {
        source: "iana"
      },
      "application/smil+xml": {
        source: "iana",
        compressible: true,
        extensions: ["smi", "smil"]
      },
      "application/smpte336m": {
        source: "iana"
      },
      "application/soap+fastinfoset": {
        source: "iana"
      },
      "application/soap+xml": {
        source: "iana",
        compressible: true
      },
      "application/sparql-query": {
        source: "iana",
        extensions: ["rq"]
      },
      "application/sparql-results+xml": {
        source: "iana",
        compressible: true,
        extensions: ["srx"]
      },
      "application/spdx+json": {
        source: "iana",
        compressible: true
      },
      "application/spirits-event+xml": {
        source: "iana",
        compressible: true
      },
      "application/sql": {
        source: "iana"
      },
      "application/srgs": {
        source: "iana",
        extensions: ["gram"]
      },
      "application/srgs+xml": {
        source: "iana",
        compressible: true,
        extensions: ["grxml"]
      },
      "application/sru+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sru"]
      },
      "application/ssdl+xml": {
        source: "apache",
        compressible: true,
        extensions: ["ssdl"]
      },
      "application/ssml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ssml"]
      },
      "application/stix+json": {
        source: "iana",
        compressible: true
      },
      "application/swid+xml": {
        source: "iana",
        compressible: true,
        extensions: ["swidtag"]
      },
      "application/tamp-apex-update": {
        source: "iana"
      },
      "application/tamp-apex-update-confirm": {
        source: "iana"
      },
      "application/tamp-community-update": {
        source: "iana"
      },
      "application/tamp-community-update-confirm": {
        source: "iana"
      },
      "application/tamp-error": {
        source: "iana"
      },
      "application/tamp-sequence-adjust": {
        source: "iana"
      },
      "application/tamp-sequence-adjust-confirm": {
        source: "iana"
      },
      "application/tamp-status-query": {
        source: "iana"
      },
      "application/tamp-status-response": {
        source: "iana"
      },
      "application/tamp-update": {
        source: "iana"
      },
      "application/tamp-update-confirm": {
        source: "iana"
      },
      "application/tar": {
        compressible: true
      },
      "application/taxii+json": {
        source: "iana",
        compressible: true
      },
      "application/td+json": {
        source: "iana",
        compressible: true
      },
      "application/tei+xml": {
        source: "iana",
        compressible: true,
        extensions: ["tei", "teicorpus"]
      },
      "application/tetra_isi": {
        source: "iana"
      },
      "application/thraud+xml": {
        source: "iana",
        compressible: true,
        extensions: ["tfi"]
      },
      "application/timestamp-query": {
        source: "iana"
      },
      "application/timestamp-reply": {
        source: "iana"
      },
      "application/timestamped-data": {
        source: "iana",
        extensions: ["tsd"]
      },
      "application/tlsrpt+gzip": {
        source: "iana"
      },
      "application/tlsrpt+json": {
        source: "iana",
        compressible: true
      },
      "application/tnauthlist": {
        source: "iana"
      },
      "application/token-introspection+jwt": {
        source: "iana"
      },
      "application/toml": {
        compressible: true,
        extensions: ["toml"]
      },
      "application/trickle-ice-sdpfrag": {
        source: "iana"
      },
      "application/trig": {
        source: "iana",
        extensions: ["trig"]
      },
      "application/ttml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ttml"]
      },
      "application/tve-trigger": {
        source: "iana"
      },
      "application/tzif": {
        source: "iana"
      },
      "application/tzif-leap": {
        source: "iana"
      },
      "application/ubjson": {
        compressible: false,
        extensions: ["ubj"]
      },
      "application/ulpfec": {
        source: "iana"
      },
      "application/urc-grpsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/urc-ressheet+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rsheet"]
      },
      "application/urc-targetdesc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["td"]
      },
      "application/urc-uisocketdesc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vcard+json": {
        source: "iana",
        compressible: true
      },
      "application/vcard+xml": {
        source: "iana",
        compressible: true
      },
      "application/vemmi": {
        source: "iana"
      },
      "application/vividence.scriptfile": {
        source: "apache"
      },
      "application/vnd.1000minds.decision-model+xml": {
        source: "iana",
        compressible: true,
        extensions: ["1km"]
      },
      "application/vnd.3gpp-prose+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-prose-pc3ch+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-v2x-local-service-information": {
        source: "iana"
      },
      "application/vnd.3gpp.5gnas": {
        source: "iana"
      },
      "application/vnd.3gpp.access-transfer-events+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.bsf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.gmop+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.gtpc": {
        source: "iana"
      },
      "application/vnd.3gpp.interworking-data": {
        source: "iana"
      },
      "application/vnd.3gpp.lpp": {
        source: "iana"
      },
      "application/vnd.3gpp.mc-signalling-ear": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-payload": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-signalling": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-floor-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-location-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-signed+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-ue-init-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-location-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-transmission-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mid-call+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.ngap": {
        source: "iana"
      },
      "application/vnd.3gpp.pfcp": {
        source: "iana"
      },
      "application/vnd.3gpp.pic-bw-large": {
        source: "iana",
        extensions: ["plb"]
      },
      "application/vnd.3gpp.pic-bw-small": {
        source: "iana",
        extensions: ["psb"]
      },
      "application/vnd.3gpp.pic-bw-var": {
        source: "iana",
        extensions: ["pvb"]
      },
      "application/vnd.3gpp.s1ap": {
        source: "iana"
      },
      "application/vnd.3gpp.sms": {
        source: "iana"
      },
      "application/vnd.3gpp.sms+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.srvcc-ext+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.srvcc-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.state-and-event-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.ussd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp2.bcmcsinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp2.sms": {
        source: "iana"
      },
      "application/vnd.3gpp2.tcap": {
        source: "iana",
        extensions: ["tcap"]
      },
      "application/vnd.3lightssoftware.imagescal": {
        source: "iana"
      },
      "application/vnd.3m.post-it-notes": {
        source: "iana",
        extensions: ["pwn"]
      },
      "application/vnd.accpac.simply.aso": {
        source: "iana",
        extensions: ["aso"]
      },
      "application/vnd.accpac.simply.imp": {
        source: "iana",
        extensions: ["imp"]
      },
      "application/vnd.acucobol": {
        source: "iana",
        extensions: ["acu"]
      },
      "application/vnd.acucorp": {
        source: "iana",
        extensions: ["atc", "acutc"]
      },
      "application/vnd.adobe.air-application-installer-package+zip": {
        source: "apache",
        compressible: false,
        extensions: ["air"]
      },
      "application/vnd.adobe.flash.movie": {
        source: "iana"
      },
      "application/vnd.adobe.formscentral.fcdt": {
        source: "iana",
        extensions: ["fcdt"]
      },
      "application/vnd.adobe.fxp": {
        source: "iana",
        extensions: ["fxp", "fxpl"]
      },
      "application/vnd.adobe.partial-upload": {
        source: "iana"
      },
      "application/vnd.adobe.xdp+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdp"]
      },
      "application/vnd.adobe.xfdf": {
        source: "iana",
        extensions: ["xfdf"]
      },
      "application/vnd.aether.imp": {
        source: "iana"
      },
      "application/vnd.afpc.afplinedata": {
        source: "iana"
      },
      "application/vnd.afpc.afplinedata-pagedef": {
        source: "iana"
      },
      "application/vnd.afpc.cmoca-cmresource": {
        source: "iana"
      },
      "application/vnd.afpc.foca-charset": {
        source: "iana"
      },
      "application/vnd.afpc.foca-codedfont": {
        source: "iana"
      },
      "application/vnd.afpc.foca-codepage": {
        source: "iana"
      },
      "application/vnd.afpc.modca": {
        source: "iana"
      },
      "application/vnd.afpc.modca-cmtable": {
        source: "iana"
      },
      "application/vnd.afpc.modca-formdef": {
        source: "iana"
      },
      "application/vnd.afpc.modca-mediummap": {
        source: "iana"
      },
      "application/vnd.afpc.modca-objectcontainer": {
        source: "iana"
      },
      "application/vnd.afpc.modca-overlay": {
        source: "iana"
      },
      "application/vnd.afpc.modca-pagesegment": {
        source: "iana"
      },
      "application/vnd.age": {
        source: "iana",
        extensions: ["age"]
      },
      "application/vnd.ah-barcode": {
        source: "iana"
      },
      "application/vnd.ahead.space": {
        source: "iana",
        extensions: ["ahead"]
      },
      "application/vnd.airzip.filesecure.azf": {
        source: "iana",
        extensions: ["azf"]
      },
      "application/vnd.airzip.filesecure.azs": {
        source: "iana",
        extensions: ["azs"]
      },
      "application/vnd.amadeus+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.amazon.ebook": {
        source: "apache",
        extensions: ["azw"]
      },
      "application/vnd.amazon.mobi8-ebook": {
        source: "iana"
      },
      "application/vnd.americandynamics.acc": {
        source: "iana",
        extensions: ["acc"]
      },
      "application/vnd.amiga.ami": {
        source: "iana",
        extensions: ["ami"]
      },
      "application/vnd.amundsen.maze+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.android.ota": {
        source: "iana"
      },
      "application/vnd.android.package-archive": {
        source: "apache",
        compressible: false,
        extensions: ["apk"]
      },
      "application/vnd.anki": {
        source: "iana"
      },
      "application/vnd.anser-web-certificate-issue-initiation": {
        source: "iana",
        extensions: ["cii"]
      },
      "application/vnd.anser-web-funds-transfer-initiation": {
        source: "apache",
        extensions: ["fti"]
      },
      "application/vnd.antix.game-component": {
        source: "iana",
        extensions: ["atx"]
      },
      "application/vnd.apache.arrow.file": {
        source: "iana"
      },
      "application/vnd.apache.arrow.stream": {
        source: "iana"
      },
      "application/vnd.apache.thrift.binary": {
        source: "iana"
      },
      "application/vnd.apache.thrift.compact": {
        source: "iana"
      },
      "application/vnd.apache.thrift.json": {
        source: "iana"
      },
      "application/vnd.api+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.aplextor.warrp+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.apothekende.reservation+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.apple.installer+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpkg"]
      },
      "application/vnd.apple.keynote": {
        source: "iana",
        extensions: ["key"]
      },
      "application/vnd.apple.mpegurl": {
        source: "iana",
        extensions: ["m3u8"]
      },
      "application/vnd.apple.numbers": {
        source: "iana",
        extensions: ["numbers"]
      },
      "application/vnd.apple.pages": {
        source: "iana",
        extensions: ["pages"]
      },
      "application/vnd.apple.pkpass": {
        compressible: false,
        extensions: ["pkpass"]
      },
      "application/vnd.arastra.swi": {
        source: "iana"
      },
      "application/vnd.aristanetworks.swi": {
        source: "iana",
        extensions: ["swi"]
      },
      "application/vnd.artisan+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.artsquare": {
        source: "iana"
      },
      "application/vnd.astraea-software.iota": {
        source: "iana",
        extensions: ["iota"]
      },
      "application/vnd.audiograph": {
        source: "iana",
        extensions: ["aep"]
      },
      "application/vnd.autopackage": {
        source: "iana"
      },
      "application/vnd.avalon+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.avistar+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.balsamiq.bmml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["bmml"]
      },
      "application/vnd.balsamiq.bmpr": {
        source: "iana"
      },
      "application/vnd.banana-accounting": {
        source: "iana"
      },
      "application/vnd.bbf.usp.error": {
        source: "iana"
      },
      "application/vnd.bbf.usp.msg": {
        source: "iana"
      },
      "application/vnd.bbf.usp.msg+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.bekitzur-stech+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.bint.med-content": {
        source: "iana"
      },
      "application/vnd.biopax.rdf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.blink-idb-value-wrapper": {
        source: "iana"
      },
      "application/vnd.blueice.multipass": {
        source: "iana",
        extensions: ["mpm"]
      },
      "application/vnd.bluetooth.ep.oob": {
        source: "iana"
      },
      "application/vnd.bluetooth.le.oob": {
        source: "iana"
      },
      "application/vnd.bmi": {
        source: "iana",
        extensions: ["bmi"]
      },
      "application/vnd.bpf": {
        source: "iana"
      },
      "application/vnd.bpf3": {
        source: "iana"
      },
      "application/vnd.businessobjects": {
        source: "iana",
        extensions: ["rep"]
      },
      "application/vnd.byu.uapi+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cab-jscript": {
        source: "iana"
      },
      "application/vnd.canon-cpdl": {
        source: "iana"
      },
      "application/vnd.canon-lips": {
        source: "iana"
      },
      "application/vnd.capasystems-pg+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cendio.thinlinc.clientconf": {
        source: "iana"
      },
      "application/vnd.century-systems.tcp_stream": {
        source: "iana"
      },
      "application/vnd.chemdraw+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cdxml"]
      },
      "application/vnd.chess-pgn": {
        source: "iana"
      },
      "application/vnd.chipnuts.karaoke-mmd": {
        source: "iana",
        extensions: ["mmd"]
      },
      "application/vnd.ciedi": {
        source: "iana"
      },
      "application/vnd.cinderella": {
        source: "iana",
        extensions: ["cdy"]
      },
      "application/vnd.cirpack.isdn-ext": {
        source: "iana"
      },
      "application/vnd.citationstyles.style+xml": {
        source: "iana",
        compressible: true,
        extensions: ["csl"]
      },
      "application/vnd.claymore": {
        source: "iana",
        extensions: ["cla"]
      },
      "application/vnd.cloanto.rp9": {
        source: "iana",
        extensions: ["rp9"]
      },
      "application/vnd.clonk.c4group": {
        source: "iana",
        extensions: ["c4g", "c4d", "c4f", "c4p", "c4u"]
      },
      "application/vnd.cluetrust.cartomobile-config": {
        source: "iana",
        extensions: ["c11amc"]
      },
      "application/vnd.cluetrust.cartomobile-config-pkg": {
        source: "iana",
        extensions: ["c11amz"]
      },
      "application/vnd.coffeescript": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.document": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.document-template": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.presentation": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.presentation-template": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.spreadsheet": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.spreadsheet-template": {
        source: "iana"
      },
      "application/vnd.collection+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.collection.doc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.collection.next+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.comicbook+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.comicbook-rar": {
        source: "iana"
      },
      "application/vnd.commerce-battelle": {
        source: "iana"
      },
      "application/vnd.commonspace": {
        source: "iana",
        extensions: ["csp"]
      },
      "application/vnd.contact.cmsg": {
        source: "iana",
        extensions: ["cdbcmsg"]
      },
      "application/vnd.coreos.ignition+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cosmocaller": {
        source: "iana",
        extensions: ["cmc"]
      },
      "application/vnd.crick.clicker": {
        source: "iana",
        extensions: ["clkx"]
      },
      "application/vnd.crick.clicker.keyboard": {
        source: "iana",
        extensions: ["clkk"]
      },
      "application/vnd.crick.clicker.palette": {
        source: "iana",
        extensions: ["clkp"]
      },
      "application/vnd.crick.clicker.template": {
        source: "iana",
        extensions: ["clkt"]
      },
      "application/vnd.crick.clicker.wordbank": {
        source: "iana",
        extensions: ["clkw"]
      },
      "application/vnd.criticaltools.wbs+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wbs"]
      },
      "application/vnd.cryptii.pipe+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.crypto-shade-file": {
        source: "iana"
      },
      "application/vnd.cryptomator.encrypted": {
        source: "iana"
      },
      "application/vnd.cryptomator.vault": {
        source: "iana"
      },
      "application/vnd.ctc-posml": {
        source: "iana",
        extensions: ["pml"]
      },
      "application/vnd.ctct.ws+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cups-pdf": {
        source: "iana"
      },
      "application/vnd.cups-postscript": {
        source: "iana"
      },
      "application/vnd.cups-ppd": {
        source: "iana",
        extensions: ["ppd"]
      },
      "application/vnd.cups-raster": {
        source: "iana"
      },
      "application/vnd.cups-raw": {
        source: "iana"
      },
      "application/vnd.curl": {
        source: "iana"
      },
      "application/vnd.curl.car": {
        source: "apache",
        extensions: ["car"]
      },
      "application/vnd.curl.pcurl": {
        source: "apache",
        extensions: ["pcurl"]
      },
      "application/vnd.cyan.dean.root+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cybank": {
        source: "iana"
      },
      "application/vnd.cyclonedx+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cyclonedx+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.d2l.coursepackage1p0+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.d3m-dataset": {
        source: "iana"
      },
      "application/vnd.d3m-problem": {
        source: "iana"
      },
      "application/vnd.dart": {
        source: "iana",
        compressible: true,
        extensions: ["dart"]
      },
      "application/vnd.data-vision.rdz": {
        source: "iana",
        extensions: ["rdz"]
      },
      "application/vnd.datapackage+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dataresource+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dbf": {
        source: "iana",
        extensions: ["dbf"]
      },
      "application/vnd.debian.binary-package": {
        source: "iana"
      },
      "application/vnd.dece.data": {
        source: "iana",
        extensions: ["uvf", "uvvf", "uvd", "uvvd"]
      },
      "application/vnd.dece.ttml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["uvt", "uvvt"]
      },
      "application/vnd.dece.unspecified": {
        source: "iana",
        extensions: ["uvx", "uvvx"]
      },
      "application/vnd.dece.zip": {
        source: "iana",
        extensions: ["uvz", "uvvz"]
      },
      "application/vnd.denovo.fcselayout-link": {
        source: "iana",
        extensions: ["fe_launch"]
      },
      "application/vnd.desmume.movie": {
        source: "iana"
      },
      "application/vnd.dir-bi.plate-dl-nosuffix": {
        source: "iana"
      },
      "application/vnd.dm.delegation+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dna": {
        source: "iana",
        extensions: ["dna"]
      },
      "application/vnd.document+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dolby.mlp": {
        source: "apache",
        extensions: ["mlp"]
      },
      "application/vnd.dolby.mobile.1": {
        source: "iana"
      },
      "application/vnd.dolby.mobile.2": {
        source: "iana"
      },
      "application/vnd.doremir.scorecloud-binary-document": {
        source: "iana"
      },
      "application/vnd.dpgraph": {
        source: "iana",
        extensions: ["dpg"]
      },
      "application/vnd.dreamfactory": {
        source: "iana",
        extensions: ["dfac"]
      },
      "application/vnd.drive+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ds-keypoint": {
        source: "apache",
        extensions: ["kpxx"]
      },
      "application/vnd.dtg.local": {
        source: "iana"
      },
      "application/vnd.dtg.local.flash": {
        source: "iana"
      },
      "application/vnd.dtg.local.html": {
        source: "iana"
      },
      "application/vnd.dvb.ait": {
        source: "iana",
        extensions: ["ait"]
      },
      "application/vnd.dvb.dvbisl+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.dvbj": {
        source: "iana"
      },
      "application/vnd.dvb.esgcontainer": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcdftnotifaccess": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgaccess": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgaccess2": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgpdd": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcroaming": {
        source: "iana"
      },
      "application/vnd.dvb.iptv.alfec-base": {
        source: "iana"
      },
      "application/vnd.dvb.iptv.alfec-enhancement": {
        source: "iana"
      },
      "application/vnd.dvb.notif-aggregate-root+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-container+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-generic+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-msglist+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-registration-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-registration-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-init+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.pfr": {
        source: "iana"
      },
      "application/vnd.dvb.service": {
        source: "iana",
        extensions: ["svc"]
      },
      "application/vnd.dxr": {
        source: "iana"
      },
      "application/vnd.dynageo": {
        source: "iana",
        extensions: ["geo"]
      },
      "application/vnd.dzr": {
        source: "iana"
      },
      "application/vnd.easykaraoke.cdgdownload": {
        source: "iana"
      },
      "application/vnd.ecdis-update": {
        source: "iana"
      },
      "application/vnd.ecip.rlp": {
        source: "iana"
      },
      "application/vnd.eclipse.ditto+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ecowin.chart": {
        source: "iana",
        extensions: ["mag"]
      },
      "application/vnd.ecowin.filerequest": {
        source: "iana"
      },
      "application/vnd.ecowin.fileupdate": {
        source: "iana"
      },
      "application/vnd.ecowin.series": {
        source: "iana"
      },
      "application/vnd.ecowin.seriesrequest": {
        source: "iana"
      },
      "application/vnd.ecowin.seriesupdate": {
        source: "iana"
      },
      "application/vnd.efi.img": {
        source: "iana"
      },
      "application/vnd.efi.iso": {
        source: "iana"
      },
      "application/vnd.emclient.accessrequest+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.enliven": {
        source: "iana",
        extensions: ["nml"]
      },
      "application/vnd.enphase.envoy": {
        source: "iana"
      },
      "application/vnd.eprints.data+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.epson.esf": {
        source: "iana",
        extensions: ["esf"]
      },
      "application/vnd.epson.msf": {
        source: "iana",
        extensions: ["msf"]
      },
      "application/vnd.epson.quickanime": {
        source: "iana",
        extensions: ["qam"]
      },
      "application/vnd.epson.salt": {
        source: "iana",
        extensions: ["slt"]
      },
      "application/vnd.epson.ssf": {
        source: "iana",
        extensions: ["ssf"]
      },
      "application/vnd.ericsson.quickcall": {
        source: "iana"
      },
      "application/vnd.espass-espass+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.eszigno3+xml": {
        source: "iana",
        compressible: true,
        extensions: ["es3", "et3"]
      },
      "application/vnd.etsi.aoc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.asic-e+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.etsi.asic-s+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.etsi.cug+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvcommand+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvdiscovery+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-bc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-cod+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-npvr+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvservice+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsync+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvueprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.mcid+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.mheg5": {
        source: "iana"
      },
      "application/vnd.etsi.overload-control-policy-dataset+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.pstn+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.sci+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.simservs+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.timestamp-token": {
        source: "iana"
      },
      "application/vnd.etsi.tsl+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.tsl.der": {
        source: "iana"
      },
      "application/vnd.eu.kasparian.car+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.eudora.data": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.profile": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.settings": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.theme": {
        source: "iana"
      },
      "application/vnd.exstream-empower+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.exstream-package": {
        source: "iana"
      },
      "application/vnd.ezpix-album": {
        source: "iana",
        extensions: ["ez2"]
      },
      "application/vnd.ezpix-package": {
        source: "iana",
        extensions: ["ez3"]
      },
      "application/vnd.f-secure.mobile": {
        source: "iana"
      },
      "application/vnd.familysearch.gedcom+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.fastcopy-disk-image": {
        source: "iana"
      },
      "application/vnd.fdf": {
        source: "iana",
        extensions: ["fdf"]
      },
      "application/vnd.fdsn.mseed": {
        source: "iana",
        extensions: ["mseed"]
      },
      "application/vnd.fdsn.seed": {
        source: "iana",
        extensions: ["seed", "dataless"]
      },
      "application/vnd.ffsns": {
        source: "iana"
      },
      "application/vnd.ficlab.flb+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.filmit.zfc": {
        source: "iana"
      },
      "application/vnd.fints": {
        source: "iana"
      },
      "application/vnd.firemonkeys.cloudcell": {
        source: "iana"
      },
      "application/vnd.flographit": {
        source: "iana",
        extensions: ["gph"]
      },
      "application/vnd.fluxtime.clip": {
        source: "iana",
        extensions: ["ftc"]
      },
      "application/vnd.font-fontforge-sfd": {
        source: "iana"
      },
      "application/vnd.framemaker": {
        source: "iana",
        extensions: ["fm", "frame", "maker", "book"]
      },
      "application/vnd.frogans.fnc": {
        source: "iana",
        extensions: ["fnc"]
      },
      "application/vnd.frogans.ltf": {
        source: "iana",
        extensions: ["ltf"]
      },
      "application/vnd.fsc.weblaunch": {
        source: "iana",
        extensions: ["fsc"]
      },
      "application/vnd.fujifilm.fb.docuworks": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.docuworks.binder": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.docuworks.container": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.jfi+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.fujitsu.oasys": {
        source: "iana",
        extensions: ["oas"]
      },
      "application/vnd.fujitsu.oasys2": {
        source: "iana",
        extensions: ["oa2"]
      },
      "application/vnd.fujitsu.oasys3": {
        source: "iana",
        extensions: ["oa3"]
      },
      "application/vnd.fujitsu.oasysgp": {
        source: "iana",
        extensions: ["fg5"]
      },
      "application/vnd.fujitsu.oasysprs": {
        source: "iana",
        extensions: ["bh2"]
      },
      "application/vnd.fujixerox.art-ex": {
        source: "iana"
      },
      "application/vnd.fujixerox.art4": {
        source: "iana"
      },
      "application/vnd.fujixerox.ddd": {
        source: "iana",
        extensions: ["ddd"]
      },
      "application/vnd.fujixerox.docuworks": {
        source: "iana",
        extensions: ["xdw"]
      },
      "application/vnd.fujixerox.docuworks.binder": {
        source: "iana",
        extensions: ["xbd"]
      },
      "application/vnd.fujixerox.docuworks.container": {
        source: "iana"
      },
      "application/vnd.fujixerox.hbpl": {
        source: "iana"
      },
      "application/vnd.fut-misnet": {
        source: "iana"
      },
      "application/vnd.futoin+cbor": {
        source: "iana"
      },
      "application/vnd.futoin+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.fuzzysheet": {
        source: "iana",
        extensions: ["fzs"]
      },
      "application/vnd.genomatix.tuxedo": {
        source: "iana",
        extensions: ["txd"]
      },
      "application/vnd.gentics.grd+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geo+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geocube+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geogebra.file": {
        source: "iana",
        extensions: ["ggb"]
      },
      "application/vnd.geogebra.slides": {
        source: "iana"
      },
      "application/vnd.geogebra.tool": {
        source: "iana",
        extensions: ["ggt"]
      },
      "application/vnd.geometry-explorer": {
        source: "iana",
        extensions: ["gex", "gre"]
      },
      "application/vnd.geonext": {
        source: "iana",
        extensions: ["gxt"]
      },
      "application/vnd.geoplan": {
        source: "iana",
        extensions: ["g2w"]
      },
      "application/vnd.geospace": {
        source: "iana",
        extensions: ["g3w"]
      },
      "application/vnd.gerber": {
        source: "iana"
      },
      "application/vnd.globalplatform.card-content-mgt": {
        source: "iana"
      },
      "application/vnd.globalplatform.card-content-mgt-response": {
        source: "iana"
      },
      "application/vnd.gmx": {
        source: "iana",
        extensions: ["gmx"]
      },
      "application/vnd.google-apps.document": {
        compressible: false,
        extensions: ["gdoc"]
      },
      "application/vnd.google-apps.presentation": {
        compressible: false,
        extensions: ["gslides"]
      },
      "application/vnd.google-apps.spreadsheet": {
        compressible: false,
        extensions: ["gsheet"]
      },
      "application/vnd.google-earth.kml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["kml"]
      },
      "application/vnd.google-earth.kmz": {
        source: "iana",
        compressible: false,
        extensions: ["kmz"]
      },
      "application/vnd.gov.sk.e-form+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.gov.sk.e-form+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.gov.sk.xmldatacontainer+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.grafeq": {
        source: "iana",
        extensions: ["gqf", "gqs"]
      },
      "application/vnd.gridmp": {
        source: "iana"
      },
      "application/vnd.groove-account": {
        source: "iana",
        extensions: ["gac"]
      },
      "application/vnd.groove-help": {
        source: "iana",
        extensions: ["ghf"]
      },
      "application/vnd.groove-identity-message": {
        source: "iana",
        extensions: ["gim"]
      },
      "application/vnd.groove-injector": {
        source: "iana",
        extensions: ["grv"]
      },
      "application/vnd.groove-tool-message": {
        source: "iana",
        extensions: ["gtm"]
      },
      "application/vnd.groove-tool-template": {
        source: "iana",
        extensions: ["tpl"]
      },
      "application/vnd.groove-vcard": {
        source: "iana",
        extensions: ["vcg"]
      },
      "application/vnd.hal+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hal+xml": {
        source: "iana",
        compressible: true,
        extensions: ["hal"]
      },
      "application/vnd.handheld-entertainment+xml": {
        source: "iana",
        compressible: true,
        extensions: ["zmm"]
      },
      "application/vnd.hbci": {
        source: "iana",
        extensions: ["hbci"]
      },
      "application/vnd.hc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hcl-bireports": {
        source: "iana"
      },
      "application/vnd.hdt": {
        source: "iana"
      },
      "application/vnd.heroku+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hhe.lesson-player": {
        source: "iana",
        extensions: ["les"]
      },
      "application/vnd.hl7cda+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.hl7v2+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.hp-hpgl": {
        source: "iana",
        extensions: ["hpgl"]
      },
      "application/vnd.hp-hpid": {
        source: "iana",
        extensions: ["hpid"]
      },
      "application/vnd.hp-hps": {
        source: "iana",
        extensions: ["hps"]
      },
      "application/vnd.hp-jlyt": {
        source: "iana",
        extensions: ["jlt"]
      },
      "application/vnd.hp-pcl": {
        source: "iana",
        extensions: ["pcl"]
      },
      "application/vnd.hp-pclxl": {
        source: "iana",
        extensions: ["pclxl"]
      },
      "application/vnd.httphone": {
        source: "iana"
      },
      "application/vnd.hydrostatix.sof-data": {
        source: "iana",
        extensions: ["sfd-hdstx"]
      },
      "application/vnd.hyper+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hyper-item+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hyperdrive+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hzn-3d-crossword": {
        source: "iana"
      },
      "application/vnd.ibm.afplinedata": {
        source: "iana"
      },
      "application/vnd.ibm.electronic-media": {
        source: "iana"
      },
      "application/vnd.ibm.minipay": {
        source: "iana",
        extensions: ["mpy"]
      },
      "application/vnd.ibm.modcap": {
        source: "iana",
        extensions: ["afp", "listafp", "list3820"]
      },
      "application/vnd.ibm.rights-management": {
        source: "iana",
        extensions: ["irm"]
      },
      "application/vnd.ibm.secure-container": {
        source: "iana",
        extensions: ["sc"]
      },
      "application/vnd.iccprofile": {
        source: "iana",
        extensions: ["icc", "icm"]
      },
      "application/vnd.ieee.1905": {
        source: "iana"
      },
      "application/vnd.igloader": {
        source: "iana",
        extensions: ["igl"]
      },
      "application/vnd.imagemeter.folder+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.imagemeter.image+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.immervision-ivp": {
        source: "iana",
        extensions: ["ivp"]
      },
      "application/vnd.immervision-ivu": {
        source: "iana",
        extensions: ["ivu"]
      },
      "application/vnd.ims.imsccv1p1": {
        source: "iana"
      },
      "application/vnd.ims.imsccv1p2": {
        source: "iana"
      },
      "application/vnd.ims.imsccv1p3": {
        source: "iana"
      },
      "application/vnd.ims.lis.v2.result+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolproxy+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolproxy.id+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolsettings+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolsettings.simple+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.informedcontrol.rms+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.informix-visionary": {
        source: "iana"
      },
      "application/vnd.infotech.project": {
        source: "iana"
      },
      "application/vnd.infotech.project+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.innopath.wamp.notification": {
        source: "iana"
      },
      "application/vnd.insors.igm": {
        source: "iana",
        extensions: ["igm"]
      },
      "application/vnd.intercon.formnet": {
        source: "iana",
        extensions: ["xpw", "xpx"]
      },
      "application/vnd.intergeo": {
        source: "iana",
        extensions: ["i2g"]
      },
      "application/vnd.intertrust.digibox": {
        source: "iana"
      },
      "application/vnd.intertrust.nncp": {
        source: "iana"
      },
      "application/vnd.intu.qbo": {
        source: "iana",
        extensions: ["qbo"]
      },
      "application/vnd.intu.qfx": {
        source: "iana",
        extensions: ["qfx"]
      },
      "application/vnd.iptc.g2.catalogitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.conceptitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.knowledgeitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.newsitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.newsmessage+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.packageitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.planningitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ipunplugged.rcprofile": {
        source: "iana",
        extensions: ["rcprofile"]
      },
      "application/vnd.irepository.package+xml": {
        source: "iana",
        compressible: true,
        extensions: ["irp"]
      },
      "application/vnd.is-xpr": {
        source: "iana",
        extensions: ["xpr"]
      },
      "application/vnd.isac.fcs": {
        source: "iana",
        extensions: ["fcs"]
      },
      "application/vnd.iso11783-10+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.jam": {
        source: "iana",
        extensions: ["jam"]
      },
      "application/vnd.japannet-directory-service": {
        source: "iana"
      },
      "application/vnd.japannet-jpnstore-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-payment-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-registration": {
        source: "iana"
      },
      "application/vnd.japannet-registration-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-setstore-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-verification": {
        source: "iana"
      },
      "application/vnd.japannet-verification-wakeup": {
        source: "iana"
      },
      "application/vnd.jcp.javame.midlet-rms": {
        source: "iana",
        extensions: ["rms"]
      },
      "application/vnd.jisp": {
        source: "iana",
        extensions: ["jisp"]
      },
      "application/vnd.joost.joda-archive": {
        source: "iana",
        extensions: ["joda"]
      },
      "application/vnd.jsk.isdn-ngn": {
        source: "iana"
      },
      "application/vnd.kahootz": {
        source: "iana",
        extensions: ["ktz", "ktr"]
      },
      "application/vnd.kde.karbon": {
        source: "iana",
        extensions: ["karbon"]
      },
      "application/vnd.kde.kchart": {
        source: "iana",
        extensions: ["chrt"]
      },
      "application/vnd.kde.kformula": {
        source: "iana",
        extensions: ["kfo"]
      },
      "application/vnd.kde.kivio": {
        source: "iana",
        extensions: ["flw"]
      },
      "application/vnd.kde.kontour": {
        source: "iana",
        extensions: ["kon"]
      },
      "application/vnd.kde.kpresenter": {
        source: "iana",
        extensions: ["kpr", "kpt"]
      },
      "application/vnd.kde.kspread": {
        source: "iana",
        extensions: ["ksp"]
      },
      "application/vnd.kde.kword": {
        source: "iana",
        extensions: ["kwd", "kwt"]
      },
      "application/vnd.kenameaapp": {
        source: "iana",
        extensions: ["htke"]
      },
      "application/vnd.kidspiration": {
        source: "iana",
        extensions: ["kia"]
      },
      "application/vnd.kinar": {
        source: "iana",
        extensions: ["kne", "knp"]
      },
      "application/vnd.koan": {
        source: "iana",
        extensions: ["skp", "skd", "skt", "skm"]
      },
      "application/vnd.kodak-descriptor": {
        source: "iana",
        extensions: ["sse"]
      },
      "application/vnd.las": {
        source: "iana"
      },
      "application/vnd.las.las+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.las.las+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lasxml"]
      },
      "application/vnd.laszip": {
        source: "iana"
      },
      "application/vnd.leap+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.liberty-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.llamagraphics.life-balance.desktop": {
        source: "iana",
        extensions: ["lbd"]
      },
      "application/vnd.llamagraphics.life-balance.exchange+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lbe"]
      },
      "application/vnd.logipipe.circuit+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.loom": {
        source: "iana"
      },
      "application/vnd.lotus-1-2-3": {
        source: "iana",
        extensions: ["123"]
      },
      "application/vnd.lotus-approach": {
        source: "iana",
        extensions: ["apr"]
      },
      "application/vnd.lotus-freelance": {
        source: "iana",
        extensions: ["pre"]
      },
      "application/vnd.lotus-notes": {
        source: "iana",
        extensions: ["nsf"]
      },
      "application/vnd.lotus-organizer": {
        source: "iana",
        extensions: ["org"]
      },
      "application/vnd.lotus-screencam": {
        source: "iana",
        extensions: ["scm"]
      },
      "application/vnd.lotus-wordpro": {
        source: "iana",
        extensions: ["lwp"]
      },
      "application/vnd.macports.portpkg": {
        source: "iana",
        extensions: ["portpkg"]
      },
      "application/vnd.mapbox-vector-tile": {
        source: "iana",
        extensions: ["mvt"]
      },
      "application/vnd.marlin.drm.actiontoken+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.conftoken+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.license+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.mdcf": {
        source: "iana"
      },
      "application/vnd.mason+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.maxar.archive.3tz+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.maxmind.maxmind-db": {
        source: "iana"
      },
      "application/vnd.mcd": {
        source: "iana",
        extensions: ["mcd"]
      },
      "application/vnd.medcalcdata": {
        source: "iana",
        extensions: ["mc1"]
      },
      "application/vnd.mediastation.cdkey": {
        source: "iana",
        extensions: ["cdkey"]
      },
      "application/vnd.meridian-slingshot": {
        source: "iana"
      },
      "application/vnd.mfer": {
        source: "iana",
        extensions: ["mwf"]
      },
      "application/vnd.mfmp": {
        source: "iana",
        extensions: ["mfm"]
      },
      "application/vnd.micro+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.micrografx.flo": {
        source: "iana",
        extensions: ["flo"]
      },
      "application/vnd.micrografx.igx": {
        source: "iana",
        extensions: ["igx"]
      },
      "application/vnd.microsoft.portable-executable": {
        source: "iana"
      },
      "application/vnd.microsoft.windows.thumbnail-cache": {
        source: "iana"
      },
      "application/vnd.miele+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.mif": {
        source: "iana",
        extensions: ["mif"]
      },
      "application/vnd.minisoft-hp3000-save": {
        source: "iana"
      },
      "application/vnd.mitsubishi.misty-guard.trustweb": {
        source: "iana"
      },
      "application/vnd.mobius.daf": {
        source: "iana",
        extensions: ["daf"]
      },
      "application/vnd.mobius.dis": {
        source: "iana",
        extensions: ["dis"]
      },
      "application/vnd.mobius.mbk": {
        source: "iana",
        extensions: ["mbk"]
      },
      "application/vnd.mobius.mqy": {
        source: "iana",
        extensions: ["mqy"]
      },
      "application/vnd.mobius.msl": {
        source: "iana",
        extensions: ["msl"]
      },
      "application/vnd.mobius.plc": {
        source: "iana",
        extensions: ["plc"]
      },
      "application/vnd.mobius.txf": {
        source: "iana",
        extensions: ["txf"]
      },
      "application/vnd.mophun.application": {
        source: "iana",
        extensions: ["mpn"]
      },
      "application/vnd.mophun.certificate": {
        source: "iana",
        extensions: ["mpc"]
      },
      "application/vnd.motorola.flexsuite": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.adsi": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.fis": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.gotap": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.kmr": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.ttc": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.wem": {
        source: "iana"
      },
      "application/vnd.motorola.iprm": {
        source: "iana"
      },
      "application/vnd.mozilla.xul+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xul"]
      },
      "application/vnd.ms-3mfdocument": {
        source: "iana"
      },
      "application/vnd.ms-artgalry": {
        source: "iana",
        extensions: ["cil"]
      },
      "application/vnd.ms-asf": {
        source: "iana"
      },
      "application/vnd.ms-cab-compressed": {
        source: "iana",
        extensions: ["cab"]
      },
      "application/vnd.ms-color.iccprofile": {
        source: "apache"
      },
      "application/vnd.ms-excel": {
        source: "iana",
        compressible: false,
        extensions: ["xls", "xlm", "xla", "xlc", "xlt", "xlw"]
      },
      "application/vnd.ms-excel.addin.macroenabled.12": {
        source: "iana",
        extensions: ["xlam"]
      },
      "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
        source: "iana",
        extensions: ["xlsb"]
      },
      "application/vnd.ms-excel.sheet.macroenabled.12": {
        source: "iana",
        extensions: ["xlsm"]
      },
      "application/vnd.ms-excel.template.macroenabled.12": {
        source: "iana",
        extensions: ["xltm"]
      },
      "application/vnd.ms-fontobject": {
        source: "iana",
        compressible: true,
        extensions: ["eot"]
      },
      "application/vnd.ms-htmlhelp": {
        source: "iana",
        extensions: ["chm"]
      },
      "application/vnd.ms-ims": {
        source: "iana",
        extensions: ["ims"]
      },
      "application/vnd.ms-lrm": {
        source: "iana",
        extensions: ["lrm"]
      },
      "application/vnd.ms-office.activex+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-officetheme": {
        source: "iana",
        extensions: ["thmx"]
      },
      "application/vnd.ms-opentype": {
        source: "apache",
        compressible: true
      },
      "application/vnd.ms-outlook": {
        compressible: false,
        extensions: ["msg"]
      },
      "application/vnd.ms-package.obfuscated-opentype": {
        source: "apache"
      },
      "application/vnd.ms-pki.seccat": {
        source: "apache",
        extensions: ["cat"]
      },
      "application/vnd.ms-pki.stl": {
        source: "apache",
        extensions: ["stl"]
      },
      "application/vnd.ms-playready.initiator+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-powerpoint": {
        source: "iana",
        compressible: false,
        extensions: ["ppt", "pps", "pot"]
      },
      "application/vnd.ms-powerpoint.addin.macroenabled.12": {
        source: "iana",
        extensions: ["ppam"]
      },
      "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
        source: "iana",
        extensions: ["pptm"]
      },
      "application/vnd.ms-powerpoint.slide.macroenabled.12": {
        source: "iana",
        extensions: ["sldm"]
      },
      "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
        source: "iana",
        extensions: ["ppsm"]
      },
      "application/vnd.ms-powerpoint.template.macroenabled.12": {
        source: "iana",
        extensions: ["potm"]
      },
      "application/vnd.ms-printdevicecapabilities+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-printing.printticket+xml": {
        source: "apache",
        compressible: true
      },
      "application/vnd.ms-printschematicket+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-project": {
        source: "iana",
        extensions: ["mpp", "mpt"]
      },
      "application/vnd.ms-tnef": {
        source: "iana"
      },
      "application/vnd.ms-windows.devicepairing": {
        source: "iana"
      },
      "application/vnd.ms-windows.nwprinting.oob": {
        source: "iana"
      },
      "application/vnd.ms-windows.printerpairing": {
        source: "iana"
      },
      "application/vnd.ms-windows.wsd.oob": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.lic-chlg-req": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.lic-resp": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.meter-chlg-req": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.meter-resp": {
        source: "iana"
      },
      "application/vnd.ms-word.document.macroenabled.12": {
        source: "iana",
        extensions: ["docm"]
      },
      "application/vnd.ms-word.template.macroenabled.12": {
        source: "iana",
        extensions: ["dotm"]
      },
      "application/vnd.ms-works": {
        source: "iana",
        extensions: ["wps", "wks", "wcm", "wdb"]
      },
      "application/vnd.ms-wpl": {
        source: "iana",
        extensions: ["wpl"]
      },
      "application/vnd.ms-xpsdocument": {
        source: "iana",
        compressible: false,
        extensions: ["xps"]
      },
      "application/vnd.msa-disk-image": {
        source: "iana"
      },
      "application/vnd.mseq": {
        source: "iana",
        extensions: ["mseq"]
      },
      "application/vnd.msign": {
        source: "iana"
      },
      "application/vnd.multiad.creator": {
        source: "iana"
      },
      "application/vnd.multiad.creator.cif": {
        source: "iana"
      },
      "application/vnd.music-niff": {
        source: "iana"
      },
      "application/vnd.musician": {
        source: "iana",
        extensions: ["mus"]
      },
      "application/vnd.muvee.style": {
        source: "iana",
        extensions: ["msty"]
      },
      "application/vnd.mynfc": {
        source: "iana",
        extensions: ["taglet"]
      },
      "application/vnd.nacamar.ybrid+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ncd.control": {
        source: "iana"
      },
      "application/vnd.ncd.reference": {
        source: "iana"
      },
      "application/vnd.nearst.inv+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nebumind.line": {
        source: "iana"
      },
      "application/vnd.nervana": {
        source: "iana"
      },
      "application/vnd.netfpx": {
        source: "iana"
      },
      "application/vnd.neurolanguage.nlu": {
        source: "iana",
        extensions: ["nlu"]
      },
      "application/vnd.nimn": {
        source: "iana"
      },
      "application/vnd.nintendo.nitro.rom": {
        source: "iana"
      },
      "application/vnd.nintendo.snes.rom": {
        source: "iana"
      },
      "application/vnd.nitf": {
        source: "iana",
        extensions: ["ntf", "nitf"]
      },
      "application/vnd.noblenet-directory": {
        source: "iana",
        extensions: ["nnd"]
      },
      "application/vnd.noblenet-sealer": {
        source: "iana",
        extensions: ["nns"]
      },
      "application/vnd.noblenet-web": {
        source: "iana",
        extensions: ["nnw"]
      },
      "application/vnd.nokia.catalogs": {
        source: "iana"
      },
      "application/vnd.nokia.conml+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.conml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.iptv.config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.isds-radio-presets": {
        source: "iana"
      },
      "application/vnd.nokia.landmark+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.landmark+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.landmarkcollection+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.n-gage.ac+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ac"]
      },
      "application/vnd.nokia.n-gage.data": {
        source: "iana",
        extensions: ["ngdat"]
      },
      "application/vnd.nokia.n-gage.symbian.install": {
        source: "iana",
        extensions: ["n-gage"]
      },
      "application/vnd.nokia.ncd": {
        source: "iana"
      },
      "application/vnd.nokia.pcd+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.pcd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.radio-preset": {
        source: "iana",
        extensions: ["rpst"]
      },
      "application/vnd.nokia.radio-presets": {
        source: "iana",
        extensions: ["rpss"]
      },
      "application/vnd.novadigm.edm": {
        source: "iana",
        extensions: ["edm"]
      },
      "application/vnd.novadigm.edx": {
        source: "iana",
        extensions: ["edx"]
      },
      "application/vnd.novadigm.ext": {
        source: "iana",
        extensions: ["ext"]
      },
      "application/vnd.ntt-local.content-share": {
        source: "iana"
      },
      "application/vnd.ntt-local.file-transfer": {
        source: "iana"
      },
      "application/vnd.ntt-local.ogw_remote-access": {
        source: "iana"
      },
      "application/vnd.ntt-local.sip-ta_remote": {
        source: "iana"
      },
      "application/vnd.ntt-local.sip-ta_tcp_stream": {
        source: "iana"
      },
      "application/vnd.oasis.opendocument.chart": {
        source: "iana",
        extensions: ["odc"]
      },
      "application/vnd.oasis.opendocument.chart-template": {
        source: "iana",
        extensions: ["otc"]
      },
      "application/vnd.oasis.opendocument.database": {
        source: "iana",
        extensions: ["odb"]
      },
      "application/vnd.oasis.opendocument.formula": {
        source: "iana",
        extensions: ["odf"]
      },
      "application/vnd.oasis.opendocument.formula-template": {
        source: "iana",
        extensions: ["odft"]
      },
      "application/vnd.oasis.opendocument.graphics": {
        source: "iana",
        compressible: false,
        extensions: ["odg"]
      },
      "application/vnd.oasis.opendocument.graphics-template": {
        source: "iana",
        extensions: ["otg"]
      },
      "application/vnd.oasis.opendocument.image": {
        source: "iana",
        extensions: ["odi"]
      },
      "application/vnd.oasis.opendocument.image-template": {
        source: "iana",
        extensions: ["oti"]
      },
      "application/vnd.oasis.opendocument.presentation": {
        source: "iana",
        compressible: false,
        extensions: ["odp"]
      },
      "application/vnd.oasis.opendocument.presentation-template": {
        source: "iana",
        extensions: ["otp"]
      },
      "application/vnd.oasis.opendocument.spreadsheet": {
        source: "iana",
        compressible: false,
        extensions: ["ods"]
      },
      "application/vnd.oasis.opendocument.spreadsheet-template": {
        source: "iana",
        extensions: ["ots"]
      },
      "application/vnd.oasis.opendocument.text": {
        source: "iana",
        compressible: false,
        extensions: ["odt"]
      },
      "application/vnd.oasis.opendocument.text-master": {
        source: "iana",
        extensions: ["odm"]
      },
      "application/vnd.oasis.opendocument.text-template": {
        source: "iana",
        extensions: ["ott"]
      },
      "application/vnd.oasis.opendocument.text-web": {
        source: "iana",
        extensions: ["oth"]
      },
      "application/vnd.obn": {
        source: "iana"
      },
      "application/vnd.ocf+cbor": {
        source: "iana"
      },
      "application/vnd.oci.image.manifest.v1+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oftn.l10n+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.contentaccessdownload+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.contentaccessstreaming+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.cspg-hexbinary": {
        source: "iana"
      },
      "application/vnd.oipf.dae.svg+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.dae.xhtml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.mippvcontrolmessage+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.pae.gem": {
        source: "iana"
      },
      "application/vnd.oipf.spdiscovery+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.spdlist+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.ueprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.userprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.olpc-sugar": {
        source: "iana",
        extensions: ["xo"]
      },
      "application/vnd.oma-scws-config": {
        source: "iana"
      },
      "application/vnd.oma-scws-http-request": {
        source: "iana"
      },
      "application/vnd.oma-scws-http-response": {
        source: "iana"
      },
      "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.drm-trigger+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.imd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.ltkm": {
        source: "iana"
      },
      "application/vnd.oma.bcast.notification+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.provisioningtrigger": {
        source: "iana"
      },
      "application/vnd.oma.bcast.sgboot": {
        source: "iana"
      },
      "application/vnd.oma.bcast.sgdd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.sgdu": {
        source: "iana"
      },
      "application/vnd.oma.bcast.simple-symbol-container": {
        source: "iana"
      },
      "application/vnd.oma.bcast.smartcard-trigger+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.sprov+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.stkm": {
        source: "iana"
      },
      "application/vnd.oma.cab-address-book+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-feature-handler+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-pcc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-subs-invite+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-user-prefs+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.dcd": {
        source: "iana"
      },
      "application/vnd.oma.dcdc": {
        source: "iana"
      },
      "application/vnd.oma.dd2+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dd2"]
      },
      "application/vnd.oma.drm.risd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.group-usage-list+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.lwm2m+cbor": {
        source: "iana"
      },
      "application/vnd.oma.lwm2m+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.lwm2m+tlv": {
        source: "iana"
      },
      "application/vnd.oma.pal+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.detailed-progress-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.final-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.groups+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.invocation-descriptor+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.optimized-progress-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.push": {
        source: "iana"
      },
      "application/vnd.oma.scidm.messages+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.xcap-directory+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.omads-email+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omads-file+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omads-folder+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omaloc-supl-init": {
        source: "iana"
      },
      "application/vnd.onepager": {
        source: "iana"
      },
      "application/vnd.onepagertamp": {
        source: "iana"
      },
      "application/vnd.onepagertamx": {
        source: "iana"
      },
      "application/vnd.onepagertat": {
        source: "iana"
      },
      "application/vnd.onepagertatp": {
        source: "iana"
      },
      "application/vnd.onepagertatx": {
        source: "iana"
      },
      "application/vnd.openblox.game+xml": {
        source: "iana",
        compressible: true,
        extensions: ["obgx"]
      },
      "application/vnd.openblox.game-binary": {
        source: "iana"
      },
      "application/vnd.openeye.oeb": {
        source: "iana"
      },
      "application/vnd.openofficeorg.extension": {
        source: "apache",
        extensions: ["oxt"]
      },
      "application/vnd.openstreetmap.data+xml": {
        source: "iana",
        compressible: true,
        extensions: ["osm"]
      },
      "application/vnd.opentimestamps.ots": {
        source: "iana"
      },
      "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawing+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
        source: "iana",
        compressible: false,
        extensions: ["pptx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slide": {
        source: "iana",
        extensions: ["sldx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
        source: "iana",
        extensions: ["ppsx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.template": {
        source: "iana",
        extensions: ["potx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
        source: "iana",
        compressible: false,
        extensions: ["xlsx"]
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
        source: "iana",
        extensions: ["xltx"]
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.theme+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.vmldrawing": {
        source: "iana"
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        source: "iana",
        compressible: false,
        extensions: ["docx"]
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
        source: "iana",
        extensions: ["dotx"]
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.core-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.relationships+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oracle.resource+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.orange.indata": {
        source: "iana"
      },
      "application/vnd.osa.netdeploy": {
        source: "iana"
      },
      "application/vnd.osgeo.mapguide.package": {
        source: "iana",
        extensions: ["mgp"]
      },
      "application/vnd.osgi.bundle": {
        source: "iana"
      },
      "application/vnd.osgi.dp": {
        source: "iana",
        extensions: ["dp"]
      },
      "application/vnd.osgi.subsystem": {
        source: "iana",
        extensions: ["esa"]
      },
      "application/vnd.otps.ct-kip+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oxli.countgraph": {
        source: "iana"
      },
      "application/vnd.pagerduty+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.palm": {
        source: "iana",
        extensions: ["pdb", "pqa", "oprc"]
      },
      "application/vnd.panoply": {
        source: "iana"
      },
      "application/vnd.paos.xml": {
        source: "iana"
      },
      "application/vnd.patentdive": {
        source: "iana"
      },
      "application/vnd.patientecommsdoc": {
        source: "iana"
      },
      "application/vnd.pawaafile": {
        source: "iana",
        extensions: ["paw"]
      },
      "application/vnd.pcos": {
        source: "iana"
      },
      "application/vnd.pg.format": {
        source: "iana",
        extensions: ["str"]
      },
      "application/vnd.pg.osasli": {
        source: "iana",
        extensions: ["ei6"]
      },
      "application/vnd.piaccess.application-licence": {
        source: "iana"
      },
      "application/vnd.picsel": {
        source: "iana",
        extensions: ["efif"]
      },
      "application/vnd.pmi.widget": {
        source: "iana",
        extensions: ["wg"]
      },
      "application/vnd.poc.group-advertisement+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.pocketlearn": {
        source: "iana",
        extensions: ["plf"]
      },
      "application/vnd.powerbuilder6": {
        source: "iana",
        extensions: ["pbd"]
      },
      "application/vnd.powerbuilder6-s": {
        source: "iana"
      },
      "application/vnd.powerbuilder7": {
        source: "iana"
      },
      "application/vnd.powerbuilder7-s": {
        source: "iana"
      },
      "application/vnd.powerbuilder75": {
        source: "iana"
      },
      "application/vnd.powerbuilder75-s": {
        source: "iana"
      },
      "application/vnd.preminet": {
        source: "iana"
      },
      "application/vnd.previewsystems.box": {
        source: "iana",
        extensions: ["box"]
      },
      "application/vnd.proteus.magazine": {
        source: "iana",
        extensions: ["mgz"]
      },
      "application/vnd.psfs": {
        source: "iana"
      },
      "application/vnd.publishare-delta-tree": {
        source: "iana",
        extensions: ["qps"]
      },
      "application/vnd.pvi.ptid1": {
        source: "iana",
        extensions: ["ptid"]
      },
      "application/vnd.pwg-multiplexed": {
        source: "iana"
      },
      "application/vnd.pwg-xhtml-print+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.qualcomm.brew-app-res": {
        source: "iana"
      },
      "application/vnd.quarantainenet": {
        source: "iana"
      },
      "application/vnd.quark.quarkxpress": {
        source: "iana",
        extensions: ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"]
      },
      "application/vnd.quobject-quoxdocument": {
        source: "iana"
      },
      "application/vnd.radisys.moml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-conf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-conn+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-dialog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-stream+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-conf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-base+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-fax-detect+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-group+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-speech+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-transform+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.rainstor.data": {
        source: "iana"
      },
      "application/vnd.rapid": {
        source: "iana"
      },
      "application/vnd.rar": {
        source: "iana",
        extensions: ["rar"]
      },
      "application/vnd.realvnc.bed": {
        source: "iana",
        extensions: ["bed"]
      },
      "application/vnd.recordare.musicxml": {
        source: "iana",
        extensions: ["mxl"]
      },
      "application/vnd.recordare.musicxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["musicxml"]
      },
      "application/vnd.renlearn.rlprint": {
        source: "iana"
      },
      "application/vnd.resilient.logic": {
        source: "iana"
      },
      "application/vnd.restful+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.rig.cryptonote": {
        source: "iana",
        extensions: ["cryptonote"]
      },
      "application/vnd.rim.cod": {
        source: "apache",
        extensions: ["cod"]
      },
      "application/vnd.rn-realmedia": {
        source: "apache",
        extensions: ["rm"]
      },
      "application/vnd.rn-realmedia-vbr": {
        source: "apache",
        extensions: ["rmvb"]
      },
      "application/vnd.route66.link66+xml": {
        source: "iana",
        compressible: true,
        extensions: ["link66"]
      },
      "application/vnd.rs-274x": {
        source: "iana"
      },
      "application/vnd.ruckus.download": {
        source: "iana"
      },
      "application/vnd.s3sms": {
        source: "iana"
      },
      "application/vnd.sailingtracker.track": {
        source: "iana",
        extensions: ["st"]
      },
      "application/vnd.sar": {
        source: "iana"
      },
      "application/vnd.sbm.cid": {
        source: "iana"
      },
      "application/vnd.sbm.mid2": {
        source: "iana"
      },
      "application/vnd.scribus": {
        source: "iana"
      },
      "application/vnd.sealed.3df": {
        source: "iana"
      },
      "application/vnd.sealed.csf": {
        source: "iana"
      },
      "application/vnd.sealed.doc": {
        source: "iana"
      },
      "application/vnd.sealed.eml": {
        source: "iana"
      },
      "application/vnd.sealed.mht": {
        source: "iana"
      },
      "application/vnd.sealed.net": {
        source: "iana"
      },
      "application/vnd.sealed.ppt": {
        source: "iana"
      },
      "application/vnd.sealed.tiff": {
        source: "iana"
      },
      "application/vnd.sealed.xls": {
        source: "iana"
      },
      "application/vnd.sealedmedia.softseal.html": {
        source: "iana"
      },
      "application/vnd.sealedmedia.softseal.pdf": {
        source: "iana"
      },
      "application/vnd.seemail": {
        source: "iana",
        extensions: ["see"]
      },
      "application/vnd.seis+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.sema": {
        source: "iana",
        extensions: ["sema"]
      },
      "application/vnd.semd": {
        source: "iana",
        extensions: ["semd"]
      },
      "application/vnd.semf": {
        source: "iana",
        extensions: ["semf"]
      },
      "application/vnd.shade-save-file": {
        source: "iana"
      },
      "application/vnd.shana.informed.formdata": {
        source: "iana",
        extensions: ["ifm"]
      },
      "application/vnd.shana.informed.formtemplate": {
        source: "iana",
        extensions: ["itp"]
      },
      "application/vnd.shana.informed.interchange": {
        source: "iana",
        extensions: ["iif"]
      },
      "application/vnd.shana.informed.package": {
        source: "iana",
        extensions: ["ipk"]
      },
      "application/vnd.shootproof+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.shopkick+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.shp": {
        source: "iana"
      },
      "application/vnd.shx": {
        source: "iana"
      },
      "application/vnd.sigrok.session": {
        source: "iana"
      },
      "application/vnd.simtech-mindmapper": {
        source: "iana",
        extensions: ["twd", "twds"]
      },
      "application/vnd.siren+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.smaf": {
        source: "iana",
        extensions: ["mmf"]
      },
      "application/vnd.smart.notebook": {
        source: "iana"
      },
      "application/vnd.smart.teacher": {
        source: "iana",
        extensions: ["teacher"]
      },
      "application/vnd.snesdev-page-table": {
        source: "iana"
      },
      "application/vnd.software602.filler.form+xml": {
        source: "iana",
        compressible: true,
        extensions: ["fo"]
      },
      "application/vnd.software602.filler.form-xml-zip": {
        source: "iana"
      },
      "application/vnd.solent.sdkm+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sdkm", "sdkd"]
      },
      "application/vnd.spotfire.dxp": {
        source: "iana",
        extensions: ["dxp"]
      },
      "application/vnd.spotfire.sfs": {
        source: "iana",
        extensions: ["sfs"]
      },
      "application/vnd.sqlite3": {
        source: "iana"
      },
      "application/vnd.sss-cod": {
        source: "iana"
      },
      "application/vnd.sss-dtf": {
        source: "iana"
      },
      "application/vnd.sss-ntf": {
        source: "iana"
      },
      "application/vnd.stardivision.calc": {
        source: "apache",
        extensions: ["sdc"]
      },
      "application/vnd.stardivision.draw": {
        source: "apache",
        extensions: ["sda"]
      },
      "application/vnd.stardivision.impress": {
        source: "apache",
        extensions: ["sdd"]
      },
      "application/vnd.stardivision.math": {
        source: "apache",
        extensions: ["smf"]
      },
      "application/vnd.stardivision.writer": {
        source: "apache",
        extensions: ["sdw", "vor"]
      },
      "application/vnd.stardivision.writer-global": {
        source: "apache",
        extensions: ["sgl"]
      },
      "application/vnd.stepmania.package": {
        source: "iana",
        extensions: ["smzip"]
      },
      "application/vnd.stepmania.stepchart": {
        source: "iana",
        extensions: ["sm"]
      },
      "application/vnd.street-stream": {
        source: "iana"
      },
      "application/vnd.sun.wadl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wadl"]
      },
      "application/vnd.sun.xml.calc": {
        source: "apache",
        extensions: ["sxc"]
      },
      "application/vnd.sun.xml.calc.template": {
        source: "apache",
        extensions: ["stc"]
      },
      "application/vnd.sun.xml.draw": {
        source: "apache",
        extensions: ["sxd"]
      },
      "application/vnd.sun.xml.draw.template": {
        source: "apache",
        extensions: ["std"]
      },
      "application/vnd.sun.xml.impress": {
        source: "apache",
        extensions: ["sxi"]
      },
      "application/vnd.sun.xml.impress.template": {
        source: "apache",
        extensions: ["sti"]
      },
      "application/vnd.sun.xml.math": {
        source: "apache",
        extensions: ["sxm"]
      },
      "application/vnd.sun.xml.writer": {
        source: "apache",
        extensions: ["sxw"]
      },
      "application/vnd.sun.xml.writer.global": {
        source: "apache",
        extensions: ["sxg"]
      },
      "application/vnd.sun.xml.writer.template": {
        source: "apache",
        extensions: ["stw"]
      },
      "application/vnd.sus-calendar": {
        source: "iana",
        extensions: ["sus", "susp"]
      },
      "application/vnd.svd": {
        source: "iana",
        extensions: ["svd"]
      },
      "application/vnd.swiftview-ics": {
        source: "iana"
      },
      "application/vnd.sycle+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.syft+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.symbian.install": {
        source: "apache",
        extensions: ["sis", "sisx"]
      },
      "application/vnd.syncml+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["xsm"]
      },
      "application/vnd.syncml.dm+wbxml": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["bdm"]
      },
      "application/vnd.syncml.dm+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["xdm"]
      },
      "application/vnd.syncml.dm.notification": {
        source: "iana"
      },
      "application/vnd.syncml.dmddf+wbxml": {
        source: "iana"
      },
      "application/vnd.syncml.dmddf+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["ddf"]
      },
      "application/vnd.syncml.dmtnds+wbxml": {
        source: "iana"
      },
      "application/vnd.syncml.dmtnds+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.syncml.ds.notification": {
        source: "iana"
      },
      "application/vnd.tableschema+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tao.intent-module-archive": {
        source: "iana",
        extensions: ["tao"]
      },
      "application/vnd.tcpdump.pcap": {
        source: "iana",
        extensions: ["pcap", "cap", "dmp"]
      },
      "application/vnd.think-cell.ppttc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tmd.mediaflex.api+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tml": {
        source: "iana"
      },
      "application/vnd.tmobile-livetv": {
        source: "iana",
        extensions: ["tmo"]
      },
      "application/vnd.tri.onesource": {
        source: "iana"
      },
      "application/vnd.trid.tpt": {
        source: "iana",
        extensions: ["tpt"]
      },
      "application/vnd.triscape.mxs": {
        source: "iana",
        extensions: ["mxs"]
      },
      "application/vnd.trueapp": {
        source: "iana",
        extensions: ["tra"]
      },
      "application/vnd.truedoc": {
        source: "iana"
      },
      "application/vnd.ubisoft.webplayer": {
        source: "iana"
      },
      "application/vnd.ufdl": {
        source: "iana",
        extensions: ["ufd", "ufdl"]
      },
      "application/vnd.uiq.theme": {
        source: "iana",
        extensions: ["utz"]
      },
      "application/vnd.umajin": {
        source: "iana",
        extensions: ["umj"]
      },
      "application/vnd.unity": {
        source: "iana",
        extensions: ["unityweb"]
      },
      "application/vnd.uoml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["uoml"]
      },
      "application/vnd.uplanet.alert": {
        source: "iana"
      },
      "application/vnd.uplanet.alert-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.bearer-choice": {
        source: "iana"
      },
      "application/vnd.uplanet.bearer-choice-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.cacheop": {
        source: "iana"
      },
      "application/vnd.uplanet.cacheop-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.channel": {
        source: "iana"
      },
      "application/vnd.uplanet.channel-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.list": {
        source: "iana"
      },
      "application/vnd.uplanet.list-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.listcmd": {
        source: "iana"
      },
      "application/vnd.uplanet.listcmd-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.signal": {
        source: "iana"
      },
      "application/vnd.uri-map": {
        source: "iana"
      },
      "application/vnd.valve.source.material": {
        source: "iana"
      },
      "application/vnd.vcx": {
        source: "iana",
        extensions: ["vcx"]
      },
      "application/vnd.vd-study": {
        source: "iana"
      },
      "application/vnd.vectorworks": {
        source: "iana"
      },
      "application/vnd.vel+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.verimatrix.vcas": {
        source: "iana"
      },
      "application/vnd.veritone.aion+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.veryant.thin": {
        source: "iana"
      },
      "application/vnd.ves.encrypted": {
        source: "iana"
      },
      "application/vnd.vidsoft.vidconference": {
        source: "iana"
      },
      "application/vnd.visio": {
        source: "iana",
        extensions: ["vsd", "vst", "vss", "vsw"]
      },
      "application/vnd.visionary": {
        source: "iana",
        extensions: ["vis"]
      },
      "application/vnd.vividence.scriptfile": {
        source: "iana"
      },
      "application/vnd.vsf": {
        source: "iana",
        extensions: ["vsf"]
      },
      "application/vnd.wap.sic": {
        source: "iana"
      },
      "application/vnd.wap.slc": {
        source: "iana"
      },
      "application/vnd.wap.wbxml": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["wbxml"]
      },
      "application/vnd.wap.wmlc": {
        source: "iana",
        extensions: ["wmlc"]
      },
      "application/vnd.wap.wmlscriptc": {
        source: "iana",
        extensions: ["wmlsc"]
      },
      "application/vnd.webturbo": {
        source: "iana",
        extensions: ["wtb"]
      },
      "application/vnd.wfa.dpp": {
        source: "iana"
      },
      "application/vnd.wfa.p2p": {
        source: "iana"
      },
      "application/vnd.wfa.wsc": {
        source: "iana"
      },
      "application/vnd.windows.devicepairing": {
        source: "iana"
      },
      "application/vnd.wmc": {
        source: "iana"
      },
      "application/vnd.wmf.bootstrap": {
        source: "iana"
      },
      "application/vnd.wolfram.mathematica": {
        source: "iana"
      },
      "application/vnd.wolfram.mathematica.package": {
        source: "iana"
      },
      "application/vnd.wolfram.player": {
        source: "iana",
        extensions: ["nbp"]
      },
      "application/vnd.wordperfect": {
        source: "iana",
        extensions: ["wpd"]
      },
      "application/vnd.wqd": {
        source: "iana",
        extensions: ["wqd"]
      },
      "application/vnd.wrq-hp3000-labelled": {
        source: "iana"
      },
      "application/vnd.wt.stf": {
        source: "iana",
        extensions: ["stf"]
      },
      "application/vnd.wv.csp+wbxml": {
        source: "iana"
      },
      "application/vnd.wv.csp+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.wv.ssp+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xacml+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xara": {
        source: "iana",
        extensions: ["xar"]
      },
      "application/vnd.xfdl": {
        source: "iana",
        extensions: ["xfdl"]
      },
      "application/vnd.xfdl.webform": {
        source: "iana"
      },
      "application/vnd.xmi+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xmpie.cpkg": {
        source: "iana"
      },
      "application/vnd.xmpie.dpkg": {
        source: "iana"
      },
      "application/vnd.xmpie.plan": {
        source: "iana"
      },
      "application/vnd.xmpie.ppkg": {
        source: "iana"
      },
      "application/vnd.xmpie.xlim": {
        source: "iana"
      },
      "application/vnd.yamaha.hv-dic": {
        source: "iana",
        extensions: ["hvd"]
      },
      "application/vnd.yamaha.hv-script": {
        source: "iana",
        extensions: ["hvs"]
      },
      "application/vnd.yamaha.hv-voice": {
        source: "iana",
        extensions: ["hvp"]
      },
      "application/vnd.yamaha.openscoreformat": {
        source: "iana",
        extensions: ["osf"]
      },
      "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
        source: "iana",
        compressible: true,
        extensions: ["osfpvg"]
      },
      "application/vnd.yamaha.remote-setup": {
        source: "iana"
      },
      "application/vnd.yamaha.smaf-audio": {
        source: "iana",
        extensions: ["saf"]
      },
      "application/vnd.yamaha.smaf-phrase": {
        source: "iana",
        extensions: ["spf"]
      },
      "application/vnd.yamaha.through-ngn": {
        source: "iana"
      },
      "application/vnd.yamaha.tunnel-udpencap": {
        source: "iana"
      },
      "application/vnd.yaoweme": {
        source: "iana"
      },
      "application/vnd.yellowriver-custom-menu": {
        source: "iana",
        extensions: ["cmp"]
      },
      "application/vnd.youtube.yt": {
        source: "iana"
      },
      "application/vnd.zul": {
        source: "iana",
        extensions: ["zir", "zirz"]
      },
      "application/vnd.zzazz.deck+xml": {
        source: "iana",
        compressible: true,
        extensions: ["zaz"]
      },
      "application/voicexml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["vxml"]
      },
      "application/voucher-cms+json": {
        source: "iana",
        compressible: true
      },
      "application/vq-rtcpxr": {
        source: "iana"
      },
      "application/wasm": {
        source: "iana",
        compressible: true,
        extensions: ["wasm"]
      },
      "application/watcherinfo+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wif"]
      },
      "application/webpush-options+json": {
        source: "iana",
        compressible: true
      },
      "application/whoispp-query": {
        source: "iana"
      },
      "application/whoispp-response": {
        source: "iana"
      },
      "application/widget": {
        source: "iana",
        extensions: ["wgt"]
      },
      "application/winhlp": {
        source: "apache",
        extensions: ["hlp"]
      },
      "application/wita": {
        source: "iana"
      },
      "application/wordperfect5.1": {
        source: "iana"
      },
      "application/wsdl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wsdl"]
      },
      "application/wspolicy+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wspolicy"]
      },
      "application/x-7z-compressed": {
        source: "apache",
        compressible: false,
        extensions: ["7z"]
      },
      "application/x-abiword": {
        source: "apache",
        extensions: ["abw"]
      },
      "application/x-ace-compressed": {
        source: "apache",
        extensions: ["ace"]
      },
      "application/x-amf": {
        source: "apache"
      },
      "application/x-apple-diskimage": {
        source: "apache",
        extensions: ["dmg"]
      },
      "application/x-arj": {
        compressible: false,
        extensions: ["arj"]
      },
      "application/x-authorware-bin": {
        source: "apache",
        extensions: ["aab", "x32", "u32", "vox"]
      },
      "application/x-authorware-map": {
        source: "apache",
        extensions: ["aam"]
      },
      "application/x-authorware-seg": {
        source: "apache",
        extensions: ["aas"]
      },
      "application/x-bcpio": {
        source: "apache",
        extensions: ["bcpio"]
      },
      "application/x-bdoc": {
        compressible: false,
        extensions: ["bdoc"]
      },
      "application/x-bittorrent": {
        source: "apache",
        extensions: ["torrent"]
      },
      "application/x-blorb": {
        source: "apache",
        extensions: ["blb", "blorb"]
      },
      "application/x-bzip": {
        source: "apache",
        compressible: false,
        extensions: ["bz"]
      },
      "application/x-bzip2": {
        source: "apache",
        compressible: false,
        extensions: ["bz2", "boz"]
      },
      "application/x-cbr": {
        source: "apache",
        extensions: ["cbr", "cba", "cbt", "cbz", "cb7"]
      },
      "application/x-cdlink": {
        source: "apache",
        extensions: ["vcd"]
      },
      "application/x-cfs-compressed": {
        source: "apache",
        extensions: ["cfs"]
      },
      "application/x-chat": {
        source: "apache",
        extensions: ["chat"]
      },
      "application/x-chess-pgn": {
        source: "apache",
        extensions: ["pgn"]
      },
      "application/x-chrome-extension": {
        extensions: ["crx"]
      },
      "application/x-cocoa": {
        source: "nginx",
        extensions: ["cco"]
      },
      "application/x-compress": {
        source: "apache"
      },
      "application/x-conference": {
        source: "apache",
        extensions: ["nsc"]
      },
      "application/x-cpio": {
        source: "apache",
        extensions: ["cpio"]
      },
      "application/x-csh": {
        source: "apache",
        extensions: ["csh"]
      },
      "application/x-deb": {
        compressible: false
      },
      "application/x-debian-package": {
        source: "apache",
        extensions: ["deb", "udeb"]
      },
      "application/x-dgc-compressed": {
        source: "apache",
        extensions: ["dgc"]
      },
      "application/x-director": {
        source: "apache",
        extensions: ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"]
      },
      "application/x-doom": {
        source: "apache",
        extensions: ["wad"]
      },
      "application/x-dtbncx+xml": {
        source: "apache",
        compressible: true,
        extensions: ["ncx"]
      },
      "application/x-dtbook+xml": {
        source: "apache",
        compressible: true,
        extensions: ["dtb"]
      },
      "application/x-dtbresource+xml": {
        source: "apache",
        compressible: true,
        extensions: ["res"]
      },
      "application/x-dvi": {
        source: "apache",
        compressible: false,
        extensions: ["dvi"]
      },
      "application/x-envoy": {
        source: "apache",
        extensions: ["evy"]
      },
      "application/x-eva": {
        source: "apache",
        extensions: ["eva"]
      },
      "application/x-font-bdf": {
        source: "apache",
        extensions: ["bdf"]
      },
      "application/x-font-dos": {
        source: "apache"
      },
      "application/x-font-framemaker": {
        source: "apache"
      },
      "application/x-font-ghostscript": {
        source: "apache",
        extensions: ["gsf"]
      },
      "application/x-font-libgrx": {
        source: "apache"
      },
      "application/x-font-linux-psf": {
        source: "apache",
        extensions: ["psf"]
      },
      "application/x-font-pcf": {
        source: "apache",
        extensions: ["pcf"]
      },
      "application/x-font-snf": {
        source: "apache",
        extensions: ["snf"]
      },
      "application/x-font-speedo": {
        source: "apache"
      },
      "application/x-font-sunos-news": {
        source: "apache"
      },
      "application/x-font-type1": {
        source: "apache",
        extensions: ["pfa", "pfb", "pfm", "afm"]
      },
      "application/x-font-vfont": {
        source: "apache"
      },
      "application/x-freearc": {
        source: "apache",
        extensions: ["arc"]
      },
      "application/x-futuresplash": {
        source: "apache",
        extensions: ["spl"]
      },
      "application/x-gca-compressed": {
        source: "apache",
        extensions: ["gca"]
      },
      "application/x-glulx": {
        source: "apache",
        extensions: ["ulx"]
      },
      "application/x-gnumeric": {
        source: "apache",
        extensions: ["gnumeric"]
      },
      "application/x-gramps-xml": {
        source: "apache",
        extensions: ["gramps"]
      },
      "application/x-gtar": {
        source: "apache",
        extensions: ["gtar"]
      },
      "application/x-gzip": {
        source: "apache"
      },
      "application/x-hdf": {
        source: "apache",
        extensions: ["hdf"]
      },
      "application/x-httpd-php": {
        compressible: true,
        extensions: ["php"]
      },
      "application/x-install-instructions": {
        source: "apache",
        extensions: ["install"]
      },
      "application/x-iso9660-image": {
        source: "apache",
        extensions: ["iso"]
      },
      "application/x-iwork-keynote-sffkey": {
        extensions: ["key"]
      },
      "application/x-iwork-numbers-sffnumbers": {
        extensions: ["numbers"]
      },
      "application/x-iwork-pages-sffpages": {
        extensions: ["pages"]
      },
      "application/x-java-archive-diff": {
        source: "nginx",
        extensions: ["jardiff"]
      },
      "application/x-java-jnlp-file": {
        source: "apache",
        compressible: false,
        extensions: ["jnlp"]
      },
      "application/x-javascript": {
        compressible: true
      },
      "application/x-keepass2": {
        extensions: ["kdbx"]
      },
      "application/x-latex": {
        source: "apache",
        compressible: false,
        extensions: ["latex"]
      },
      "application/x-lua-bytecode": {
        extensions: ["luac"]
      },
      "application/x-lzh-compressed": {
        source: "apache",
        extensions: ["lzh", "lha"]
      },
      "application/x-makeself": {
        source: "nginx",
        extensions: ["run"]
      },
      "application/x-mie": {
        source: "apache",
        extensions: ["mie"]
      },
      "application/x-mobipocket-ebook": {
        source: "apache",
        extensions: ["prc", "mobi"]
      },
      "application/x-mpegurl": {
        compressible: false
      },
      "application/x-ms-application": {
        source: "apache",
        extensions: ["application"]
      },
      "application/x-ms-shortcut": {
        source: "apache",
        extensions: ["lnk"]
      },
      "application/x-ms-wmd": {
        source: "apache",
        extensions: ["wmd"]
      },
      "application/x-ms-wmz": {
        source: "apache",
        extensions: ["wmz"]
      },
      "application/x-ms-xbap": {
        source: "apache",
        extensions: ["xbap"]
      },
      "application/x-msaccess": {
        source: "apache",
        extensions: ["mdb"]
      },
      "application/x-msbinder": {
        source: "apache",
        extensions: ["obd"]
      },
      "application/x-mscardfile": {
        source: "apache",
        extensions: ["crd"]
      },
      "application/x-msclip": {
        source: "apache",
        extensions: ["clp"]
      },
      "application/x-msdos-program": {
        extensions: ["exe"]
      },
      "application/x-msdownload": {
        source: "apache",
        extensions: ["exe", "dll", "com", "bat", "msi"]
      },
      "application/x-msmediaview": {
        source: "apache",
        extensions: ["mvb", "m13", "m14"]
      },
      "application/x-msmetafile": {
        source: "apache",
        extensions: ["wmf", "wmz", "emf", "emz"]
      },
      "application/x-msmoney": {
        source: "apache",
        extensions: ["mny"]
      },
      "application/x-mspublisher": {
        source: "apache",
        extensions: ["pub"]
      },
      "application/x-msschedule": {
        source: "apache",
        extensions: ["scd"]
      },
      "application/x-msterminal": {
        source: "apache",
        extensions: ["trm"]
      },
      "application/x-mswrite": {
        source: "apache",
        extensions: ["wri"]
      },
      "application/x-netcdf": {
        source: "apache",
        extensions: ["nc", "cdf"]
      },
      "application/x-ns-proxy-autoconfig": {
        compressible: true,
        extensions: ["pac"]
      },
      "application/x-nzb": {
        source: "apache",
        extensions: ["nzb"]
      },
      "application/x-perl": {
        source: "nginx",
        extensions: ["pl", "pm"]
      },
      "application/x-pilot": {
        source: "nginx",
        extensions: ["prc", "pdb"]
      },
      "application/x-pkcs12": {
        source: "apache",
        compressible: false,
        extensions: ["p12", "pfx"]
      },
      "application/x-pkcs7-certificates": {
        source: "apache",
        extensions: ["p7b", "spc"]
      },
      "application/x-pkcs7-certreqresp": {
        source: "apache",
        extensions: ["p7r"]
      },
      "application/x-pki-message": {
        source: "iana"
      },
      "application/x-rar-compressed": {
        source: "apache",
        compressible: false,
        extensions: ["rar"]
      },
      "application/x-redhat-package-manager": {
        source: "nginx",
        extensions: ["rpm"]
      },
      "application/x-research-info-systems": {
        source: "apache",
        extensions: ["ris"]
      },
      "application/x-sea": {
        source: "nginx",
        extensions: ["sea"]
      },
      "application/x-sh": {
        source: "apache",
        compressible: true,
        extensions: ["sh"]
      },
      "application/x-shar": {
        source: "apache",
        extensions: ["shar"]
      },
      "application/x-shockwave-flash": {
        source: "apache",
        compressible: false,
        extensions: ["swf"]
      },
      "application/x-silverlight-app": {
        source: "apache",
        extensions: ["xap"]
      },
      "application/x-sql": {
        source: "apache",
        extensions: ["sql"]
      },
      "application/x-stuffit": {
        source: "apache",
        compressible: false,
        extensions: ["sit"]
      },
      "application/x-stuffitx": {
        source: "apache",
        extensions: ["sitx"]
      },
      "application/x-subrip": {
        source: "apache",
        extensions: ["srt"]
      },
      "application/x-sv4cpio": {
        source: "apache",
        extensions: ["sv4cpio"]
      },
      "application/x-sv4crc": {
        source: "apache",
        extensions: ["sv4crc"]
      },
      "application/x-t3vm-image": {
        source: "apache",
        extensions: ["t3"]
      },
      "application/x-tads": {
        source: "apache",
        extensions: ["gam"]
      },
      "application/x-tar": {
        source: "apache",
        compressible: true,
        extensions: ["tar"]
      },
      "application/x-tcl": {
        source: "apache",
        extensions: ["tcl", "tk"]
      },
      "application/x-tex": {
        source: "apache",
        extensions: ["tex"]
      },
      "application/x-tex-tfm": {
        source: "apache",
        extensions: ["tfm"]
      },
      "application/x-texinfo": {
        source: "apache",
        extensions: ["texinfo", "texi"]
      },
      "application/x-tgif": {
        source: "apache",
        extensions: ["obj"]
      },
      "application/x-ustar": {
        source: "apache",
        extensions: ["ustar"]
      },
      "application/x-virtualbox-hdd": {
        compressible: true,
        extensions: ["hdd"]
      },
      "application/x-virtualbox-ova": {
        compressible: true,
        extensions: ["ova"]
      },
      "application/x-virtualbox-ovf": {
        compressible: true,
        extensions: ["ovf"]
      },
      "application/x-virtualbox-vbox": {
        compressible: true,
        extensions: ["vbox"]
      },
      "application/x-virtualbox-vbox-extpack": {
        compressible: false,
        extensions: ["vbox-extpack"]
      },
      "application/x-virtualbox-vdi": {
        compressible: true,
        extensions: ["vdi"]
      },
      "application/x-virtualbox-vhd": {
        compressible: true,
        extensions: ["vhd"]
      },
      "application/x-virtualbox-vmdk": {
        compressible: true,
        extensions: ["vmdk"]
      },
      "application/x-wais-source": {
        source: "apache",
        extensions: ["src"]
      },
      "application/x-web-app-manifest+json": {
        compressible: true,
        extensions: ["webapp"]
      },
      "application/x-www-form-urlencoded": {
        source: "iana",
        compressible: true
      },
      "application/x-x509-ca-cert": {
        source: "iana",
        extensions: ["der", "crt", "pem"]
      },
      "application/x-x509-ca-ra-cert": {
        source: "iana"
      },
      "application/x-x509-next-ca-cert": {
        source: "iana"
      },
      "application/x-xfig": {
        source: "apache",
        extensions: ["fig"]
      },
      "application/x-xliff+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xlf"]
      },
      "application/x-xpinstall": {
        source: "apache",
        compressible: false,
        extensions: ["xpi"]
      },
      "application/x-xz": {
        source: "apache",
        extensions: ["xz"]
      },
      "application/x-zmachine": {
        source: "apache",
        extensions: ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]
      },
      "application/x400-bp": {
        source: "iana"
      },
      "application/xacml+xml": {
        source: "iana",
        compressible: true
      },
      "application/xaml+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xaml"]
      },
      "application/xcap-att+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xav"]
      },
      "application/xcap-caps+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xca"]
      },
      "application/xcap-diff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdf"]
      },
      "application/xcap-el+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xel"]
      },
      "application/xcap-error+xml": {
        source: "iana",
        compressible: true
      },
      "application/xcap-ns+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xns"]
      },
      "application/xcon-conference-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/xcon-conference-info-diff+xml": {
        source: "iana",
        compressible: true
      },
      "application/xenc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xenc"]
      },
      "application/xhtml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xhtml", "xht"]
      },
      "application/xhtml-voice+xml": {
        source: "apache",
        compressible: true
      },
      "application/xliff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xlf"]
      },
      "application/xml": {
        source: "iana",
        compressible: true,
        extensions: ["xml", "xsl", "xsd", "rng"]
      },
      "application/xml-dtd": {
        source: "iana",
        compressible: true,
        extensions: ["dtd"]
      },
      "application/xml-external-parsed-entity": {
        source: "iana"
      },
      "application/xml-patch+xml": {
        source: "iana",
        compressible: true
      },
      "application/xmpp+xml": {
        source: "iana",
        compressible: true
      },
      "application/xop+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xop"]
      },
      "application/xproc+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xpl"]
      },
      "application/xslt+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xsl", "xslt"]
      },
      "application/xspf+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xspf"]
      },
      "application/xv+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mxml", "xhvml", "xvml", "xvm"]
      },
      "application/yang": {
        source: "iana",
        extensions: ["yang"]
      },
      "application/yang-data+json": {
        source: "iana",
        compressible: true
      },
      "application/yang-data+xml": {
        source: "iana",
        compressible: true
      },
      "application/yang-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/yang-patch+xml": {
        source: "iana",
        compressible: true
      },
      "application/yin+xml": {
        source: "iana",
        compressible: true,
        extensions: ["yin"]
      },
      "application/zip": {
        source: "iana",
        compressible: false,
        extensions: ["zip"]
      },
      "application/zlib": {
        source: "iana"
      },
      "application/zstd": {
        source: "iana"
      },
      "audio/1d-interleaved-parityfec": {
        source: "iana"
      },
      "audio/32kadpcm": {
        source: "iana"
      },
      "audio/3gpp": {
        source: "iana",
        compressible: false,
        extensions: ["3gpp"]
      },
      "audio/3gpp2": {
        source: "iana"
      },
      "audio/aac": {
        source: "iana"
      },
      "audio/ac3": {
        source: "iana"
      },
      "audio/adpcm": {
        source: "apache",
        extensions: ["adp"]
      },
      "audio/amr": {
        source: "iana",
        extensions: ["amr"]
      },
      "audio/amr-wb": {
        source: "iana"
      },
      "audio/amr-wb+": {
        source: "iana"
      },
      "audio/aptx": {
        source: "iana"
      },
      "audio/asc": {
        source: "iana"
      },
      "audio/atrac-advanced-lossless": {
        source: "iana"
      },
      "audio/atrac-x": {
        source: "iana"
      },
      "audio/atrac3": {
        source: "iana"
      },
      "audio/basic": {
        source: "iana",
        compressible: false,
        extensions: ["au", "snd"]
      },
      "audio/bv16": {
        source: "iana"
      },
      "audio/bv32": {
        source: "iana"
      },
      "audio/clearmode": {
        source: "iana"
      },
      "audio/cn": {
        source: "iana"
      },
      "audio/dat12": {
        source: "iana"
      },
      "audio/dls": {
        source: "iana"
      },
      "audio/dsr-es201108": {
        source: "iana"
      },
      "audio/dsr-es202050": {
        source: "iana"
      },
      "audio/dsr-es202211": {
        source: "iana"
      },
      "audio/dsr-es202212": {
        source: "iana"
      },
      "audio/dv": {
        source: "iana"
      },
      "audio/dvi4": {
        source: "iana"
      },
      "audio/eac3": {
        source: "iana"
      },
      "audio/encaprtp": {
        source: "iana"
      },
      "audio/evrc": {
        source: "iana"
      },
      "audio/evrc-qcp": {
        source: "iana"
      },
      "audio/evrc0": {
        source: "iana"
      },
      "audio/evrc1": {
        source: "iana"
      },
      "audio/evrcb": {
        source: "iana"
      },
      "audio/evrcb0": {
        source: "iana"
      },
      "audio/evrcb1": {
        source: "iana"
      },
      "audio/evrcnw": {
        source: "iana"
      },
      "audio/evrcnw0": {
        source: "iana"
      },
      "audio/evrcnw1": {
        source: "iana"
      },
      "audio/evrcwb": {
        source: "iana"
      },
      "audio/evrcwb0": {
        source: "iana"
      },
      "audio/evrcwb1": {
        source: "iana"
      },
      "audio/evs": {
        source: "iana"
      },
      "audio/flexfec": {
        source: "iana"
      },
      "audio/fwdred": {
        source: "iana"
      },
      "audio/g711-0": {
        source: "iana"
      },
      "audio/g719": {
        source: "iana"
      },
      "audio/g722": {
        source: "iana"
      },
      "audio/g7221": {
        source: "iana"
      },
      "audio/g723": {
        source: "iana"
      },
      "audio/g726-16": {
        source: "iana"
      },
      "audio/g726-24": {
        source: "iana"
      },
      "audio/g726-32": {
        source: "iana"
      },
      "audio/g726-40": {
        source: "iana"
      },
      "audio/g728": {
        source: "iana"
      },
      "audio/g729": {
        source: "iana"
      },
      "audio/g7291": {
        source: "iana"
      },
      "audio/g729d": {
        source: "iana"
      },
      "audio/g729e": {
        source: "iana"
      },
      "audio/gsm": {
        source: "iana"
      },
      "audio/gsm-efr": {
        source: "iana"
      },
      "audio/gsm-hr-08": {
        source: "iana"
      },
      "audio/ilbc": {
        source: "iana"
      },
      "audio/ip-mr_v2.5": {
        source: "iana"
      },
      "audio/isac": {
        source: "apache"
      },
      "audio/l16": {
        source: "iana"
      },
      "audio/l20": {
        source: "iana"
      },
      "audio/l24": {
        source: "iana",
        compressible: false
      },
      "audio/l8": {
        source: "iana"
      },
      "audio/lpc": {
        source: "iana"
      },
      "audio/melp": {
        source: "iana"
      },
      "audio/melp1200": {
        source: "iana"
      },
      "audio/melp2400": {
        source: "iana"
      },
      "audio/melp600": {
        source: "iana"
      },
      "audio/mhas": {
        source: "iana"
      },
      "audio/midi": {
        source: "apache",
        extensions: ["mid", "midi", "kar", "rmi"]
      },
      "audio/mobile-xmf": {
        source: "iana",
        extensions: ["mxmf"]
      },
      "audio/mp3": {
        compressible: false,
        extensions: ["mp3"]
      },
      "audio/mp4": {
        source: "iana",
        compressible: false,
        extensions: ["m4a", "mp4a"]
      },
      "audio/mp4a-latm": {
        source: "iana"
      },
      "audio/mpa": {
        source: "iana"
      },
      "audio/mpa-robust": {
        source: "iana"
      },
      "audio/mpeg": {
        source: "iana",
        compressible: false,
        extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
      },
      "audio/mpeg4-generic": {
        source: "iana"
      },
      "audio/musepack": {
        source: "apache"
      },
      "audio/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["oga", "ogg", "spx", "opus"]
      },
      "audio/opus": {
        source: "iana"
      },
      "audio/parityfec": {
        source: "iana"
      },
      "audio/pcma": {
        source: "iana"
      },
      "audio/pcma-wb": {
        source: "iana"
      },
      "audio/pcmu": {
        source: "iana"
      },
      "audio/pcmu-wb": {
        source: "iana"
      },
      "audio/prs.sid": {
        source: "iana"
      },
      "audio/qcelp": {
        source: "iana"
      },
      "audio/raptorfec": {
        source: "iana"
      },
      "audio/red": {
        source: "iana"
      },
      "audio/rtp-enc-aescm128": {
        source: "iana"
      },
      "audio/rtp-midi": {
        source: "iana"
      },
      "audio/rtploopback": {
        source: "iana"
      },
      "audio/rtx": {
        source: "iana"
      },
      "audio/s3m": {
        source: "apache",
        extensions: ["s3m"]
      },
      "audio/scip": {
        source: "iana"
      },
      "audio/silk": {
        source: "apache",
        extensions: ["sil"]
      },
      "audio/smv": {
        source: "iana"
      },
      "audio/smv-qcp": {
        source: "iana"
      },
      "audio/smv0": {
        source: "iana"
      },
      "audio/sofa": {
        source: "iana"
      },
      "audio/sp-midi": {
        source: "iana"
      },
      "audio/speex": {
        source: "iana"
      },
      "audio/t140c": {
        source: "iana"
      },
      "audio/t38": {
        source: "iana"
      },
      "audio/telephone-event": {
        source: "iana"
      },
      "audio/tetra_acelp": {
        source: "iana"
      },
      "audio/tetra_acelp_bb": {
        source: "iana"
      },
      "audio/tone": {
        source: "iana"
      },
      "audio/tsvcis": {
        source: "iana"
      },
      "audio/uemclip": {
        source: "iana"
      },
      "audio/ulpfec": {
        source: "iana"
      },
      "audio/usac": {
        source: "iana"
      },
      "audio/vdvi": {
        source: "iana"
      },
      "audio/vmr-wb": {
        source: "iana"
      },
      "audio/vnd.3gpp.iufp": {
        source: "iana"
      },
      "audio/vnd.4sb": {
        source: "iana"
      },
      "audio/vnd.audiokoz": {
        source: "iana"
      },
      "audio/vnd.celp": {
        source: "iana"
      },
      "audio/vnd.cisco.nse": {
        source: "iana"
      },
      "audio/vnd.cmles.radio-events": {
        source: "iana"
      },
      "audio/vnd.cns.anp1": {
        source: "iana"
      },
      "audio/vnd.cns.inf1": {
        source: "iana"
      },
      "audio/vnd.dece.audio": {
        source: "iana",
        extensions: ["uva", "uvva"]
      },
      "audio/vnd.digital-winds": {
        source: "iana",
        extensions: ["eol"]
      },
      "audio/vnd.dlna.adts": {
        source: "iana"
      },
      "audio/vnd.dolby.heaac.1": {
        source: "iana"
      },
      "audio/vnd.dolby.heaac.2": {
        source: "iana"
      },
      "audio/vnd.dolby.mlp": {
        source: "iana"
      },
      "audio/vnd.dolby.mps": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2x": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2z": {
        source: "iana"
      },
      "audio/vnd.dolby.pulse.1": {
        source: "iana"
      },
      "audio/vnd.dra": {
        source: "iana",
        extensions: ["dra"]
      },
      "audio/vnd.dts": {
        source: "iana",
        extensions: ["dts"]
      },
      "audio/vnd.dts.hd": {
        source: "iana",
        extensions: ["dtshd"]
      },
      "audio/vnd.dts.uhd": {
        source: "iana"
      },
      "audio/vnd.dvb.file": {
        source: "iana"
      },
      "audio/vnd.everad.plj": {
        source: "iana"
      },
      "audio/vnd.hns.audio": {
        source: "iana"
      },
      "audio/vnd.lucent.voice": {
        source: "iana",
        extensions: ["lvp"]
      },
      "audio/vnd.ms-playready.media.pya": {
        source: "iana",
        extensions: ["pya"]
      },
      "audio/vnd.nokia.mobile-xmf": {
        source: "iana"
      },
      "audio/vnd.nortel.vbk": {
        source: "iana"
      },
      "audio/vnd.nuera.ecelp4800": {
        source: "iana",
        extensions: ["ecelp4800"]
      },
      "audio/vnd.nuera.ecelp7470": {
        source: "iana",
        extensions: ["ecelp7470"]
      },
      "audio/vnd.nuera.ecelp9600": {
        source: "iana",
        extensions: ["ecelp9600"]
      },
      "audio/vnd.octel.sbc": {
        source: "iana"
      },
      "audio/vnd.presonus.multitrack": {
        source: "iana"
      },
      "audio/vnd.qcelp": {
        source: "iana"
      },
      "audio/vnd.rhetorex.32kadpcm": {
        source: "iana"
      },
      "audio/vnd.rip": {
        source: "iana",
        extensions: ["rip"]
      },
      "audio/vnd.rn-realaudio": {
        compressible: false
      },
      "audio/vnd.sealedmedia.softseal.mpeg": {
        source: "iana"
      },
      "audio/vnd.vmx.cvsd": {
        source: "iana"
      },
      "audio/vnd.wave": {
        compressible: false
      },
      "audio/vorbis": {
        source: "iana",
        compressible: false
      },
      "audio/vorbis-config": {
        source: "iana"
      },
      "audio/wav": {
        compressible: false,
        extensions: ["wav"]
      },
      "audio/wave": {
        compressible: false,
        extensions: ["wav"]
      },
      "audio/webm": {
        source: "apache",
        compressible: false,
        extensions: ["weba"]
      },
      "audio/x-aac": {
        source: "apache",
        compressible: false,
        extensions: ["aac"]
      },
      "audio/x-aiff": {
        source: "apache",
        extensions: ["aif", "aiff", "aifc"]
      },
      "audio/x-caf": {
        source: "apache",
        compressible: false,
        extensions: ["caf"]
      },
      "audio/x-flac": {
        source: "apache",
        extensions: ["flac"]
      },
      "audio/x-m4a": {
        source: "nginx",
        extensions: ["m4a"]
      },
      "audio/x-matroska": {
        source: "apache",
        extensions: ["mka"]
      },
      "audio/x-mpegurl": {
        source: "apache",
        extensions: ["m3u"]
      },
      "audio/x-ms-wax": {
        source: "apache",
        extensions: ["wax"]
      },
      "audio/x-ms-wma": {
        source: "apache",
        extensions: ["wma"]
      },
      "audio/x-pn-realaudio": {
        source: "apache",
        extensions: ["ram", "ra"]
      },
      "audio/x-pn-realaudio-plugin": {
        source: "apache",
        extensions: ["rmp"]
      },
      "audio/x-realaudio": {
        source: "nginx",
        extensions: ["ra"]
      },
      "audio/x-tta": {
        source: "apache"
      },
      "audio/x-wav": {
        source: "apache",
        extensions: ["wav"]
      },
      "audio/xm": {
        source: "apache",
        extensions: ["xm"]
      },
      "chemical/x-cdx": {
        source: "apache",
        extensions: ["cdx"]
      },
      "chemical/x-cif": {
        source: "apache",
        extensions: ["cif"]
      },
      "chemical/x-cmdf": {
        source: "apache",
        extensions: ["cmdf"]
      },
      "chemical/x-cml": {
        source: "apache",
        extensions: ["cml"]
      },
      "chemical/x-csml": {
        source: "apache",
        extensions: ["csml"]
      },
      "chemical/x-pdb": {
        source: "apache"
      },
      "chemical/x-xyz": {
        source: "apache",
        extensions: ["xyz"]
      },
      "font/collection": {
        source: "iana",
        extensions: ["ttc"]
      },
      "font/otf": {
        source: "iana",
        compressible: true,
        extensions: ["otf"]
      },
      "font/sfnt": {
        source: "iana"
      },
      "font/ttf": {
        source: "iana",
        compressible: true,
        extensions: ["ttf"]
      },
      "font/woff": {
        source: "iana",
        extensions: ["woff"]
      },
      "font/woff2": {
        source: "iana",
        extensions: ["woff2"]
      },
      "image/aces": {
        source: "iana",
        extensions: ["exr"]
      },
      "image/apng": {
        compressible: false,
        extensions: ["apng"]
      },
      "image/avci": {
        source: "iana",
        extensions: ["avci"]
      },
      "image/avcs": {
        source: "iana",
        extensions: ["avcs"]
      },
      "image/avif": {
        source: "iana",
        compressible: false,
        extensions: ["avif"]
      },
      "image/bmp": {
        source: "iana",
        compressible: true,
        extensions: ["bmp"]
      },
      "image/cgm": {
        source: "iana",
        extensions: ["cgm"]
      },
      "image/dicom-rle": {
        source: "iana",
        extensions: ["drle"]
      },
      "image/emf": {
        source: "iana",
        extensions: ["emf"]
      },
      "image/fits": {
        source: "iana",
        extensions: ["fits"]
      },
      "image/g3fax": {
        source: "iana",
        extensions: ["g3"]
      },
      "image/gif": {
        source: "iana",
        compressible: false,
        extensions: ["gif"]
      },
      "image/heic": {
        source: "iana",
        extensions: ["heic"]
      },
      "image/heic-sequence": {
        source: "iana",
        extensions: ["heics"]
      },
      "image/heif": {
        source: "iana",
        extensions: ["heif"]
      },
      "image/heif-sequence": {
        source: "iana",
        extensions: ["heifs"]
      },
      "image/hej2k": {
        source: "iana",
        extensions: ["hej2"]
      },
      "image/hsj2": {
        source: "iana",
        extensions: ["hsj2"]
      },
      "image/ief": {
        source: "iana",
        extensions: ["ief"]
      },
      "image/jls": {
        source: "iana",
        extensions: ["jls"]
      },
      "image/jp2": {
        source: "iana",
        compressible: false,
        extensions: ["jp2", "jpg2"]
      },
      "image/jpeg": {
        source: "iana",
        compressible: false,
        extensions: ["jpeg", "jpg", "jpe"]
      },
      "image/jph": {
        source: "iana",
        extensions: ["jph"]
      },
      "image/jphc": {
        source: "iana",
        extensions: ["jhc"]
      },
      "image/jpm": {
        source: "iana",
        compressible: false,
        extensions: ["jpm"]
      },
      "image/jpx": {
        source: "iana",
        compressible: false,
        extensions: ["jpx", "jpf"]
      },
      "image/jxr": {
        source: "iana",
        extensions: ["jxr"]
      },
      "image/jxra": {
        source: "iana",
        extensions: ["jxra"]
      },
      "image/jxrs": {
        source: "iana",
        extensions: ["jxrs"]
      },
      "image/jxs": {
        source: "iana",
        extensions: ["jxs"]
      },
      "image/jxsc": {
        source: "iana",
        extensions: ["jxsc"]
      },
      "image/jxsi": {
        source: "iana",
        extensions: ["jxsi"]
      },
      "image/jxss": {
        source: "iana",
        extensions: ["jxss"]
      },
      "image/ktx": {
        source: "iana",
        extensions: ["ktx"]
      },
      "image/ktx2": {
        source: "iana",
        extensions: ["ktx2"]
      },
      "image/naplps": {
        source: "iana"
      },
      "image/pjpeg": {
        compressible: false
      },
      "image/png": {
        source: "iana",
        compressible: false,
        extensions: ["png"]
      },
      "image/prs.btif": {
        source: "iana",
        extensions: ["btif"]
      },
      "image/prs.pti": {
        source: "iana",
        extensions: ["pti"]
      },
      "image/pwg-raster": {
        source: "iana"
      },
      "image/sgi": {
        source: "apache",
        extensions: ["sgi"]
      },
      "image/svg+xml": {
        source: "iana",
        compressible: true,
        extensions: ["svg", "svgz"]
      },
      "image/t38": {
        source: "iana",
        extensions: ["t38"]
      },
      "image/tiff": {
        source: "iana",
        compressible: false,
        extensions: ["tif", "tiff"]
      },
      "image/tiff-fx": {
        source: "iana",
        extensions: ["tfx"]
      },
      "image/vnd.adobe.photoshop": {
        source: "iana",
        compressible: true,
        extensions: ["psd"]
      },
      "image/vnd.airzip.accelerator.azv": {
        source: "iana",
        extensions: ["azv"]
      },
      "image/vnd.cns.inf2": {
        source: "iana"
      },
      "image/vnd.dece.graphic": {
        source: "iana",
        extensions: ["uvi", "uvvi", "uvg", "uvvg"]
      },
      "image/vnd.djvu": {
        source: "iana",
        extensions: ["djvu", "djv"]
      },
      "image/vnd.dvb.subtitle": {
        source: "iana",
        extensions: ["sub"]
      },
      "image/vnd.dwg": {
        source: "iana",
        extensions: ["dwg"]
      },
      "image/vnd.dxf": {
        source: "iana",
        extensions: ["dxf"]
      },
      "image/vnd.fastbidsheet": {
        source: "iana",
        extensions: ["fbs"]
      },
      "image/vnd.fpx": {
        source: "iana",
        extensions: ["fpx"]
      },
      "image/vnd.fst": {
        source: "iana",
        extensions: ["fst"]
      },
      "image/vnd.fujixerox.edmics-mmr": {
        source: "iana",
        extensions: ["mmr"]
      },
      "image/vnd.fujixerox.edmics-rlc": {
        source: "iana",
        extensions: ["rlc"]
      },
      "image/vnd.globalgraphics.pgb": {
        source: "iana"
      },
      "image/vnd.microsoft.icon": {
        source: "iana",
        compressible: true,
        extensions: ["ico"]
      },
      "image/vnd.mix": {
        source: "iana"
      },
      "image/vnd.mozilla.apng": {
        source: "iana"
      },
      "image/vnd.ms-dds": {
        compressible: true,
        extensions: ["dds"]
      },
      "image/vnd.ms-modi": {
        source: "iana",
        extensions: ["mdi"]
      },
      "image/vnd.ms-photo": {
        source: "apache",
        extensions: ["wdp"]
      },
      "image/vnd.net-fpx": {
        source: "iana",
        extensions: ["npx"]
      },
      "image/vnd.pco.b16": {
        source: "iana",
        extensions: ["b16"]
      },
      "image/vnd.radiance": {
        source: "iana"
      },
      "image/vnd.sealed.png": {
        source: "iana"
      },
      "image/vnd.sealedmedia.softseal.gif": {
        source: "iana"
      },
      "image/vnd.sealedmedia.softseal.jpg": {
        source: "iana"
      },
      "image/vnd.svf": {
        source: "iana"
      },
      "image/vnd.tencent.tap": {
        source: "iana",
        extensions: ["tap"]
      },
      "image/vnd.valve.source.texture": {
        source: "iana",
        extensions: ["vtf"]
      },
      "image/vnd.wap.wbmp": {
        source: "iana",
        extensions: ["wbmp"]
      },
      "image/vnd.xiff": {
        source: "iana",
        extensions: ["xif"]
      },
      "image/vnd.zbrush.pcx": {
        source: "iana",
        extensions: ["pcx"]
      },
      "image/webp": {
        source: "apache",
        extensions: ["webp"]
      },
      "image/wmf": {
        source: "iana",
        extensions: ["wmf"]
      },
      "image/x-3ds": {
        source: "apache",
        extensions: ["3ds"]
      },
      "image/x-cmu-raster": {
        source: "apache",
        extensions: ["ras"]
      },
      "image/x-cmx": {
        source: "apache",
        extensions: ["cmx"]
      },
      "image/x-freehand": {
        source: "apache",
        extensions: ["fh", "fhc", "fh4", "fh5", "fh7"]
      },
      "image/x-icon": {
        source: "apache",
        compressible: true,
        extensions: ["ico"]
      },
      "image/x-jng": {
        source: "nginx",
        extensions: ["jng"]
      },
      "image/x-mrsid-image": {
        source: "apache",
        extensions: ["sid"]
      },
      "image/x-ms-bmp": {
        source: "nginx",
        compressible: true,
        extensions: ["bmp"]
      },
      "image/x-pcx": {
        source: "apache",
        extensions: ["pcx"]
      },
      "image/x-pict": {
        source: "apache",
        extensions: ["pic", "pct"]
      },
      "image/x-portable-anymap": {
        source: "apache",
        extensions: ["pnm"]
      },
      "image/x-portable-bitmap": {
        source: "apache",
        extensions: ["pbm"]
      },
      "image/x-portable-graymap": {
        source: "apache",
        extensions: ["pgm"]
      },
      "image/x-portable-pixmap": {
        source: "apache",
        extensions: ["ppm"]
      },
      "image/x-rgb": {
        source: "apache",
        extensions: ["rgb"]
      },
      "image/x-tga": {
        source: "apache",
        extensions: ["tga"]
      },
      "image/x-xbitmap": {
        source: "apache",
        extensions: ["xbm"]
      },
      "image/x-xcf": {
        compressible: false
      },
      "image/x-xpixmap": {
        source: "apache",
        extensions: ["xpm"]
      },
      "image/x-xwindowdump": {
        source: "apache",
        extensions: ["xwd"]
      },
      "message/cpim": {
        source: "iana"
      },
      "message/delivery-status": {
        source: "iana"
      },
      "message/disposition-notification": {
        source: "iana",
        extensions: [
          "disposition-notification"
        ]
      },
      "message/external-body": {
        source: "iana"
      },
      "message/feedback-report": {
        source: "iana"
      },
      "message/global": {
        source: "iana",
        extensions: ["u8msg"]
      },
      "message/global-delivery-status": {
        source: "iana",
        extensions: ["u8dsn"]
      },
      "message/global-disposition-notification": {
        source: "iana",
        extensions: ["u8mdn"]
      },
      "message/global-headers": {
        source: "iana",
        extensions: ["u8hdr"]
      },
      "message/http": {
        source: "iana",
        compressible: false
      },
      "message/imdn+xml": {
        source: "iana",
        compressible: true
      },
      "message/news": {
        source: "iana"
      },
      "message/partial": {
        source: "iana",
        compressible: false
      },
      "message/rfc822": {
        source: "iana",
        compressible: true,
        extensions: ["eml", "mime"]
      },
      "message/s-http": {
        source: "iana"
      },
      "message/sip": {
        source: "iana"
      },
      "message/sipfrag": {
        source: "iana"
      },
      "message/tracking-status": {
        source: "iana"
      },
      "message/vnd.si.simp": {
        source: "iana"
      },
      "message/vnd.wfa.wsc": {
        source: "iana",
        extensions: ["wsc"]
      },
      "model/3mf": {
        source: "iana",
        extensions: ["3mf"]
      },
      "model/e57": {
        source: "iana"
      },
      "model/gltf+json": {
        source: "iana",
        compressible: true,
        extensions: ["gltf"]
      },
      "model/gltf-binary": {
        source: "iana",
        compressible: true,
        extensions: ["glb"]
      },
      "model/iges": {
        source: "iana",
        compressible: false,
        extensions: ["igs", "iges"]
      },
      "model/mesh": {
        source: "iana",
        compressible: false,
        extensions: ["msh", "mesh", "silo"]
      },
      "model/mtl": {
        source: "iana",
        extensions: ["mtl"]
      },
      "model/obj": {
        source: "iana",
        extensions: ["obj"]
      },
      "model/step": {
        source: "iana"
      },
      "model/step+xml": {
        source: "iana",
        compressible: true,
        extensions: ["stpx"]
      },
      "model/step+zip": {
        source: "iana",
        compressible: false,
        extensions: ["stpz"]
      },
      "model/step-xml+zip": {
        source: "iana",
        compressible: false,
        extensions: ["stpxz"]
      },
      "model/stl": {
        source: "iana",
        extensions: ["stl"]
      },
      "model/vnd.collada+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dae"]
      },
      "model/vnd.dwf": {
        source: "iana",
        extensions: ["dwf"]
      },
      "model/vnd.flatland.3dml": {
        source: "iana"
      },
      "model/vnd.gdl": {
        source: "iana",
        extensions: ["gdl"]
      },
      "model/vnd.gs-gdl": {
        source: "apache"
      },
      "model/vnd.gs.gdl": {
        source: "iana"
      },
      "model/vnd.gtw": {
        source: "iana",
        extensions: ["gtw"]
      },
      "model/vnd.moml+xml": {
        source: "iana",
        compressible: true
      },
      "model/vnd.mts": {
        source: "iana",
        extensions: ["mts"]
      },
      "model/vnd.opengex": {
        source: "iana",
        extensions: ["ogex"]
      },
      "model/vnd.parasolid.transmit.binary": {
        source: "iana",
        extensions: ["x_b"]
      },
      "model/vnd.parasolid.transmit.text": {
        source: "iana",
        extensions: ["x_t"]
      },
      "model/vnd.pytha.pyox": {
        source: "iana"
      },
      "model/vnd.rosette.annotated-data-model": {
        source: "iana"
      },
      "model/vnd.sap.vds": {
        source: "iana",
        extensions: ["vds"]
      },
      "model/vnd.usdz+zip": {
        source: "iana",
        compressible: false,
        extensions: ["usdz"]
      },
      "model/vnd.valve.source.compiled-map": {
        source: "iana",
        extensions: ["bsp"]
      },
      "model/vnd.vtu": {
        source: "iana",
        extensions: ["vtu"]
      },
      "model/vrml": {
        source: "iana",
        compressible: false,
        extensions: ["wrl", "vrml"]
      },
      "model/x3d+binary": {
        source: "apache",
        compressible: false,
        extensions: ["x3db", "x3dbz"]
      },
      "model/x3d+fastinfoset": {
        source: "iana",
        extensions: ["x3db"]
      },
      "model/x3d+vrml": {
        source: "apache",
        compressible: false,
        extensions: ["x3dv", "x3dvz"]
      },
      "model/x3d+xml": {
        source: "iana",
        compressible: true,
        extensions: ["x3d", "x3dz"]
      },
      "model/x3d-vrml": {
        source: "iana",
        extensions: ["x3dv"]
      },
      "multipart/alternative": {
        source: "iana",
        compressible: false
      },
      "multipart/appledouble": {
        source: "iana"
      },
      "multipart/byteranges": {
        source: "iana"
      },
      "multipart/digest": {
        source: "iana"
      },
      "multipart/encrypted": {
        source: "iana",
        compressible: false
      },
      "multipart/form-data": {
        source: "iana",
        compressible: false
      },
      "multipart/header-set": {
        source: "iana"
      },
      "multipart/mixed": {
        source: "iana"
      },
      "multipart/multilingual": {
        source: "iana"
      },
      "multipart/parallel": {
        source: "iana"
      },
      "multipart/related": {
        source: "iana",
        compressible: false
      },
      "multipart/report": {
        source: "iana"
      },
      "multipart/signed": {
        source: "iana",
        compressible: false
      },
      "multipart/vnd.bint.med-plus": {
        source: "iana"
      },
      "multipart/voice-message": {
        source: "iana"
      },
      "multipart/x-mixed-replace": {
        source: "iana"
      },
      "text/1d-interleaved-parityfec": {
        source: "iana"
      },
      "text/cache-manifest": {
        source: "iana",
        compressible: true,
        extensions: ["appcache", "manifest"]
      },
      "text/calendar": {
        source: "iana",
        extensions: ["ics", "ifb"]
      },
      "text/calender": {
        compressible: true
      },
      "text/cmd": {
        compressible: true
      },
      "text/coffeescript": {
        extensions: ["coffee", "litcoffee"]
      },
      "text/cql": {
        source: "iana"
      },
      "text/cql-expression": {
        source: "iana"
      },
      "text/cql-identifier": {
        source: "iana"
      },
      "text/css": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["css"]
      },
      "text/csv": {
        source: "iana",
        compressible: true,
        extensions: ["csv"]
      },
      "text/csv-schema": {
        source: "iana"
      },
      "text/directory": {
        source: "iana"
      },
      "text/dns": {
        source: "iana"
      },
      "text/ecmascript": {
        source: "iana"
      },
      "text/encaprtp": {
        source: "iana"
      },
      "text/enriched": {
        source: "iana"
      },
      "text/fhirpath": {
        source: "iana"
      },
      "text/flexfec": {
        source: "iana"
      },
      "text/fwdred": {
        source: "iana"
      },
      "text/gff3": {
        source: "iana"
      },
      "text/grammar-ref-list": {
        source: "iana"
      },
      "text/html": {
        source: "iana",
        compressible: true,
        extensions: ["html", "htm", "shtml"]
      },
      "text/jade": {
        extensions: ["jade"]
      },
      "text/javascript": {
        source: "iana",
        compressible: true
      },
      "text/jcr-cnd": {
        source: "iana"
      },
      "text/jsx": {
        compressible: true,
        extensions: ["jsx"]
      },
      "text/less": {
        compressible: true,
        extensions: ["less"]
      },
      "text/markdown": {
        source: "iana",
        compressible: true,
        extensions: ["markdown", "md"]
      },
      "text/mathml": {
        source: "nginx",
        extensions: ["mml"]
      },
      "text/mdx": {
        compressible: true,
        extensions: ["mdx"]
      },
      "text/mizar": {
        source: "iana"
      },
      "text/n3": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["n3"]
      },
      "text/parameters": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/parityfec": {
        source: "iana"
      },
      "text/plain": {
        source: "iana",
        compressible: true,
        extensions: ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
      },
      "text/provenance-notation": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/prs.fallenstein.rst": {
        source: "iana"
      },
      "text/prs.lines.tag": {
        source: "iana",
        extensions: ["dsc"]
      },
      "text/prs.prop.logic": {
        source: "iana"
      },
      "text/raptorfec": {
        source: "iana"
      },
      "text/red": {
        source: "iana"
      },
      "text/rfc822-headers": {
        source: "iana"
      },
      "text/richtext": {
        source: "iana",
        compressible: true,
        extensions: ["rtx"]
      },
      "text/rtf": {
        source: "iana",
        compressible: true,
        extensions: ["rtf"]
      },
      "text/rtp-enc-aescm128": {
        source: "iana"
      },
      "text/rtploopback": {
        source: "iana"
      },
      "text/rtx": {
        source: "iana"
      },
      "text/sgml": {
        source: "iana",
        extensions: ["sgml", "sgm"]
      },
      "text/shaclc": {
        source: "iana"
      },
      "text/shex": {
        source: "iana",
        extensions: ["shex"]
      },
      "text/slim": {
        extensions: ["slim", "slm"]
      },
      "text/spdx": {
        source: "iana",
        extensions: ["spdx"]
      },
      "text/strings": {
        source: "iana"
      },
      "text/stylus": {
        extensions: ["stylus", "styl"]
      },
      "text/t140": {
        source: "iana"
      },
      "text/tab-separated-values": {
        source: "iana",
        compressible: true,
        extensions: ["tsv"]
      },
      "text/troff": {
        source: "iana",
        extensions: ["t", "tr", "roff", "man", "me", "ms"]
      },
      "text/turtle": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["ttl"]
      },
      "text/ulpfec": {
        source: "iana"
      },
      "text/uri-list": {
        source: "iana",
        compressible: true,
        extensions: ["uri", "uris", "urls"]
      },
      "text/vcard": {
        source: "iana",
        compressible: true,
        extensions: ["vcard"]
      },
      "text/vnd.a": {
        source: "iana"
      },
      "text/vnd.abc": {
        source: "iana"
      },
      "text/vnd.ascii-art": {
        source: "iana"
      },
      "text/vnd.curl": {
        source: "iana",
        extensions: ["curl"]
      },
      "text/vnd.curl.dcurl": {
        source: "apache",
        extensions: ["dcurl"]
      },
      "text/vnd.curl.mcurl": {
        source: "apache",
        extensions: ["mcurl"]
      },
      "text/vnd.curl.scurl": {
        source: "apache",
        extensions: ["scurl"]
      },
      "text/vnd.debian.copyright": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.dmclientscript": {
        source: "iana"
      },
      "text/vnd.dvb.subtitle": {
        source: "iana",
        extensions: ["sub"]
      },
      "text/vnd.esmertec.theme-descriptor": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.familysearch.gedcom": {
        source: "iana",
        extensions: ["ged"]
      },
      "text/vnd.ficlab.flt": {
        source: "iana"
      },
      "text/vnd.fly": {
        source: "iana",
        extensions: ["fly"]
      },
      "text/vnd.fmi.flexstor": {
        source: "iana",
        extensions: ["flx"]
      },
      "text/vnd.gml": {
        source: "iana"
      },
      "text/vnd.graphviz": {
        source: "iana",
        extensions: ["gv"]
      },
      "text/vnd.hans": {
        source: "iana"
      },
      "text/vnd.hgl": {
        source: "iana"
      },
      "text/vnd.in3d.3dml": {
        source: "iana",
        extensions: ["3dml"]
      },
      "text/vnd.in3d.spot": {
        source: "iana",
        extensions: ["spot"]
      },
      "text/vnd.iptc.newsml": {
        source: "iana"
      },
      "text/vnd.iptc.nitf": {
        source: "iana"
      },
      "text/vnd.latex-z": {
        source: "iana"
      },
      "text/vnd.motorola.reflex": {
        source: "iana"
      },
      "text/vnd.ms-mediapackage": {
        source: "iana"
      },
      "text/vnd.net2phone.commcenter.command": {
        source: "iana"
      },
      "text/vnd.radisys.msml-basic-layout": {
        source: "iana"
      },
      "text/vnd.senx.warpscript": {
        source: "iana"
      },
      "text/vnd.si.uricatalogue": {
        source: "iana"
      },
      "text/vnd.sosi": {
        source: "iana"
      },
      "text/vnd.sun.j2me.app-descriptor": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["jad"]
      },
      "text/vnd.trolltech.linguist": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.wap.si": {
        source: "iana"
      },
      "text/vnd.wap.sl": {
        source: "iana"
      },
      "text/vnd.wap.wml": {
        source: "iana",
        extensions: ["wml"]
      },
      "text/vnd.wap.wmlscript": {
        source: "iana",
        extensions: ["wmls"]
      },
      "text/vtt": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["vtt"]
      },
      "text/x-asm": {
        source: "apache",
        extensions: ["s", "asm"]
      },
      "text/x-c": {
        source: "apache",
        extensions: ["c", "cc", "cxx", "cpp", "h", "hh", "dic"]
      },
      "text/x-component": {
        source: "nginx",
        extensions: ["htc"]
      },
      "text/x-fortran": {
        source: "apache",
        extensions: ["f", "for", "f77", "f90"]
      },
      "text/x-gwt-rpc": {
        compressible: true
      },
      "text/x-handlebars-template": {
        extensions: ["hbs"]
      },
      "text/x-java-source": {
        source: "apache",
        extensions: ["java"]
      },
      "text/x-jquery-tmpl": {
        compressible: true
      },
      "text/x-lua": {
        extensions: ["lua"]
      },
      "text/x-markdown": {
        compressible: true,
        extensions: ["mkd"]
      },
      "text/x-nfo": {
        source: "apache",
        extensions: ["nfo"]
      },
      "text/x-opml": {
        source: "apache",
        extensions: ["opml"]
      },
      "text/x-org": {
        compressible: true,
        extensions: ["org"]
      },
      "text/x-pascal": {
        source: "apache",
        extensions: ["p", "pas"]
      },
      "text/x-processing": {
        compressible: true,
        extensions: ["pde"]
      },
      "text/x-sass": {
        extensions: ["sass"]
      },
      "text/x-scss": {
        extensions: ["scss"]
      },
      "text/x-setext": {
        source: "apache",
        extensions: ["etx"]
      },
      "text/x-sfv": {
        source: "apache",
        extensions: ["sfv"]
      },
      "text/x-suse-ymp": {
        compressible: true,
        extensions: ["ymp"]
      },
      "text/x-uuencode": {
        source: "apache",
        extensions: ["uu"]
      },
      "text/x-vcalendar": {
        source: "apache",
        extensions: ["vcs"]
      },
      "text/x-vcard": {
        source: "apache",
        extensions: ["vcf"]
      },
      "text/xml": {
        source: "iana",
        compressible: true,
        extensions: ["xml"]
      },
      "text/xml-external-parsed-entity": {
        source: "iana"
      },
      "text/yaml": {
        compressible: true,
        extensions: ["yaml", "yml"]
      },
      "video/1d-interleaved-parityfec": {
        source: "iana"
      },
      "video/3gpp": {
        source: "iana",
        extensions: ["3gp", "3gpp"]
      },
      "video/3gpp-tt": {
        source: "iana"
      },
      "video/3gpp2": {
        source: "iana",
        extensions: ["3g2"]
      },
      "video/av1": {
        source: "iana"
      },
      "video/bmpeg": {
        source: "iana"
      },
      "video/bt656": {
        source: "iana"
      },
      "video/celb": {
        source: "iana"
      },
      "video/dv": {
        source: "iana"
      },
      "video/encaprtp": {
        source: "iana"
      },
      "video/ffv1": {
        source: "iana"
      },
      "video/flexfec": {
        source: "iana"
      },
      "video/h261": {
        source: "iana",
        extensions: ["h261"]
      },
      "video/h263": {
        source: "iana",
        extensions: ["h263"]
      },
      "video/h263-1998": {
        source: "iana"
      },
      "video/h263-2000": {
        source: "iana"
      },
      "video/h264": {
        source: "iana",
        extensions: ["h264"]
      },
      "video/h264-rcdo": {
        source: "iana"
      },
      "video/h264-svc": {
        source: "iana"
      },
      "video/h265": {
        source: "iana"
      },
      "video/iso.segment": {
        source: "iana",
        extensions: ["m4s"]
      },
      "video/jpeg": {
        source: "iana",
        extensions: ["jpgv"]
      },
      "video/jpeg2000": {
        source: "iana"
      },
      "video/jpm": {
        source: "apache",
        extensions: ["jpm", "jpgm"]
      },
      "video/jxsv": {
        source: "iana"
      },
      "video/mj2": {
        source: "iana",
        extensions: ["mj2", "mjp2"]
      },
      "video/mp1s": {
        source: "iana"
      },
      "video/mp2p": {
        source: "iana"
      },
      "video/mp2t": {
        source: "iana",
        extensions: ["ts"]
      },
      "video/mp4": {
        source: "iana",
        compressible: false,
        extensions: ["mp4", "mp4v", "mpg4"]
      },
      "video/mp4v-es": {
        source: "iana"
      },
      "video/mpeg": {
        source: "iana",
        compressible: false,
        extensions: ["mpeg", "mpg", "mpe", "m1v", "m2v"]
      },
      "video/mpeg4-generic": {
        source: "iana"
      },
      "video/mpv": {
        source: "iana"
      },
      "video/nv": {
        source: "iana"
      },
      "video/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["ogv"]
      },
      "video/parityfec": {
        source: "iana"
      },
      "video/pointer": {
        source: "iana"
      },
      "video/quicktime": {
        source: "iana",
        compressible: false,
        extensions: ["qt", "mov"]
      },
      "video/raptorfec": {
        source: "iana"
      },
      "video/raw": {
        source: "iana"
      },
      "video/rtp-enc-aescm128": {
        source: "iana"
      },
      "video/rtploopback": {
        source: "iana"
      },
      "video/rtx": {
        source: "iana"
      },
      "video/scip": {
        source: "iana"
      },
      "video/smpte291": {
        source: "iana"
      },
      "video/smpte292m": {
        source: "iana"
      },
      "video/ulpfec": {
        source: "iana"
      },
      "video/vc1": {
        source: "iana"
      },
      "video/vc2": {
        source: "iana"
      },
      "video/vnd.cctv": {
        source: "iana"
      },
      "video/vnd.dece.hd": {
        source: "iana",
        extensions: ["uvh", "uvvh"]
      },
      "video/vnd.dece.mobile": {
        source: "iana",
        extensions: ["uvm", "uvvm"]
      },
      "video/vnd.dece.mp4": {
        source: "iana"
      },
      "video/vnd.dece.pd": {
        source: "iana",
        extensions: ["uvp", "uvvp"]
      },
      "video/vnd.dece.sd": {
        source: "iana",
        extensions: ["uvs", "uvvs"]
      },
      "video/vnd.dece.video": {
        source: "iana",
        extensions: ["uvv", "uvvv"]
      },
      "video/vnd.directv.mpeg": {
        source: "iana"
      },
      "video/vnd.directv.mpeg-tts": {
        source: "iana"
      },
      "video/vnd.dlna.mpeg-tts": {
        source: "iana"
      },
      "video/vnd.dvb.file": {
        source: "iana",
        extensions: ["dvb"]
      },
      "video/vnd.fvt": {
        source: "iana",
        extensions: ["fvt"]
      },
      "video/vnd.hns.video": {
        source: "iana"
      },
      "video/vnd.iptvforum.1dparityfec-1010": {
        source: "iana"
      },
      "video/vnd.iptvforum.1dparityfec-2005": {
        source: "iana"
      },
      "video/vnd.iptvforum.2dparityfec-1010": {
        source: "iana"
      },
      "video/vnd.iptvforum.2dparityfec-2005": {
        source: "iana"
      },
      "video/vnd.iptvforum.ttsavc": {
        source: "iana"
      },
      "video/vnd.iptvforum.ttsmpeg2": {
        source: "iana"
      },
      "video/vnd.motorola.video": {
        source: "iana"
      },
      "video/vnd.motorola.videop": {
        source: "iana"
      },
      "video/vnd.mpegurl": {
        source: "iana",
        extensions: ["mxu", "m4u"]
      },
      "video/vnd.ms-playready.media.pyv": {
        source: "iana",
        extensions: ["pyv"]
      },
      "video/vnd.nokia.interleaved-multimedia": {
        source: "iana"
      },
      "video/vnd.nokia.mp4vr": {
        source: "iana"
      },
      "video/vnd.nokia.videovoip": {
        source: "iana"
      },
      "video/vnd.objectvideo": {
        source: "iana"
      },
      "video/vnd.radgamettools.bink": {
        source: "iana"
      },
      "video/vnd.radgamettools.smacker": {
        source: "iana"
      },
      "video/vnd.sealed.mpeg1": {
        source: "iana"
      },
      "video/vnd.sealed.mpeg4": {
        source: "iana"
      },
      "video/vnd.sealed.swf": {
        source: "iana"
      },
      "video/vnd.sealedmedia.softseal.mov": {
        source: "iana"
      },
      "video/vnd.uvvu.mp4": {
        source: "iana",
        extensions: ["uvu", "uvvu"]
      },
      "video/vnd.vivo": {
        source: "iana",
        extensions: ["viv"]
      },
      "video/vnd.youtube.yt": {
        source: "iana"
      },
      "video/vp8": {
        source: "iana"
      },
      "video/vp9": {
        source: "iana"
      },
      "video/webm": {
        source: "apache",
        compressible: false,
        extensions: ["webm"]
      },
      "video/x-f4v": {
        source: "apache",
        extensions: ["f4v"]
      },
      "video/x-fli": {
        source: "apache",
        extensions: ["fli"]
      },
      "video/x-flv": {
        source: "apache",
        compressible: false,
        extensions: ["flv"]
      },
      "video/x-m4v": {
        source: "apache",
        extensions: ["m4v"]
      },
      "video/x-matroska": {
        source: "apache",
        compressible: false,
        extensions: ["mkv", "mk3d", "mks"]
      },
      "video/x-mng": {
        source: "apache",
        extensions: ["mng"]
      },
      "video/x-ms-asf": {
        source: "apache",
        extensions: ["asf", "asx"]
      },
      "video/x-ms-vob": {
        source: "apache",
        extensions: ["vob"]
      },
      "video/x-ms-wm": {
        source: "apache",
        extensions: ["wm"]
      },
      "video/x-ms-wmv": {
        source: "apache",
        compressible: false,
        extensions: ["wmv"]
      },
      "video/x-ms-wmx": {
        source: "apache",
        extensions: ["wmx"]
      },
      "video/x-ms-wvx": {
        source: "apache",
        extensions: ["wvx"]
      },
      "video/x-msvideo": {
        source: "apache",
        extensions: ["avi"]
      },
      "video/x-sgi-movie": {
        source: "apache",
        extensions: ["movie"]
      },
      "video/x-smv": {
        source: "apache",
        extensions: ["smv"]
      },
      "x-conference/x-cooltalk": {
        source: "apache",
        extensions: ["ice"]
      },
      "x-shader/x-fragment": {
        compressible: true
      },
      "x-shader/x-vertex": {
        compressible: true
      }
    };
  }
});

// node_modules/mime-db/index.js
var require_mime_db = __commonJS({
  "node_modules/mime-db/index.js"(exports, module) {
    module.exports = require_db();
  }
});

// node-built-in-modules:path
import libDefault9 from "path";
var require_path = __commonJS({
  "node-built-in-modules:path"(exports, module) {
    module.exports = libDefault9;
  }
});

// node_modules/mime-types/index.js
var require_mime_types = __commonJS({
  "node_modules/mime-types/index.js"(exports) {
    "use strict";
    var db = require_mime_db();
    var extname = require_path().extname;
    var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
    var TEXT_TYPE_REGEXP = /^text\//i;
    exports.charset = charset;
    exports.charsets = { lookup: charset };
    exports.contentType = contentType;
    exports.extension = extension;
    exports.extensions = /* @__PURE__ */ Object.create(null);
    exports.lookup = lookup;
    exports.types = /* @__PURE__ */ Object.create(null);
    populateMaps(exports.extensions, exports.types);
    function charset(type) {
      if (!type || typeof type !== "string") {
        return false;
      }
      var match = EXTRACT_TYPE_REGEXP.exec(type);
      var mime = match && db[match[1].toLowerCase()];
      if (mime && mime.charset) {
        return mime.charset;
      }
      if (match && TEXT_TYPE_REGEXP.test(match[1])) {
        return "UTF-8";
      }
      return false;
    }
    __name(charset, "charset");
    function contentType(str) {
      if (!str || typeof str !== "string") {
        return false;
      }
      var mime = str.indexOf("/") === -1 ? exports.lookup(str) : str;
      if (!mime) {
        return false;
      }
      if (mime.indexOf("charset") === -1) {
        var charset2 = exports.charset(mime);
        if (charset2) mime += "; charset=" + charset2.toLowerCase();
      }
      return mime;
    }
    __name(contentType, "contentType");
    function extension(type) {
      if (!type || typeof type !== "string") {
        return false;
      }
      var match = EXTRACT_TYPE_REGEXP.exec(type);
      var exts = match && exports.extensions[match[1].toLowerCase()];
      if (!exts || !exts.length) {
        return false;
      }
      return exts[0];
    }
    __name(extension, "extension");
    function lookup(path) {
      if (!path || typeof path !== "string") {
        return false;
      }
      var extension2 = extname("x." + path).toLowerCase().substr(1);
      if (!extension2) {
        return false;
      }
      return exports.types[extension2] || false;
    }
    __name(lookup, "lookup");
    function populateMaps(extensions, types) {
      var preference = ["nginx", "apache", void 0, "iana"];
      Object.keys(db).forEach(/* @__PURE__ */ __name(function forEachMimeType(type) {
        var mime = db[type];
        var exts = mime.extensions;
        if (!exts || !exts.length) {
          return;
        }
        extensions[type] = exts;
        for (var i = 0; i < exts.length; i++) {
          var extension2 = exts[i];
          if (types[extension2]) {
            var from = preference.indexOf(db[types[extension2]].source);
            var to = preference.indexOf(mime.source);
            if (types[extension2] !== "application/octet-stream" && (from > to || from === to && types[extension2].substr(0, 12) === "application/")) {
              continue;
            }
          }
          types[extension2] = type;
        }
      }, "forEachMimeType"));
    }
    __name(populateMaps, "populateMaps");
  }
});

// node_modules/type-is/index.js
var require_type_is = __commonJS({
  "node_modules/type-is/index.js"(exports, module) {
    "use strict";
    var typer = require_media_typer();
    var mime = require_mime_types();
    module.exports = typeofrequest;
    module.exports.is = typeis;
    module.exports.hasBody = hasbody;
    module.exports.normalize = normalize;
    module.exports.match = mimeMatch;
    function typeis(value, types_) {
      var i;
      var types = types_;
      var val = tryNormalizeType(value);
      if (!val) {
        return false;
      }
      if (types && !Array.isArray(types)) {
        types = new Array(arguments.length - 1);
        for (i = 0; i < types.length; i++) {
          types[i] = arguments[i + 1];
        }
      }
      if (!types || !types.length) {
        return val;
      }
      var type;
      for (i = 0; i < types.length; i++) {
        if (mimeMatch(normalize(type = types[i]), val)) {
          return type[0] === "+" || type.indexOf("*") !== -1 ? val : type;
        }
      }
      return false;
    }
    __name(typeis, "typeis");
    function hasbody(req) {
      return req.headers["transfer-encoding"] !== void 0 || !isNaN(req.headers["content-length"]);
    }
    __name(hasbody, "hasbody");
    function typeofrequest(req, types_) {
      var types = types_;
      if (!hasbody(req)) {
        return null;
      }
      if (arguments.length > 2) {
        types = new Array(arguments.length - 1);
        for (var i = 0; i < types.length; i++) {
          types[i] = arguments[i + 1];
        }
      }
      var value = req.headers["content-type"];
      return typeis(value, types);
    }
    __name(typeofrequest, "typeofrequest");
    function normalize(type) {
      if (typeof type !== "string") {
        return false;
      }
      switch (type) {
        case "urlencoded":
          return "application/x-www-form-urlencoded";
        case "multipart":
          return "multipart/*";
      }
      if (type[0] === "+") {
        return "*/*" + type;
      }
      return type.indexOf("/") === -1 ? mime.lookup(type) : type;
    }
    __name(normalize, "normalize");
    function mimeMatch(expected, actual) {
      if (expected === false) {
        return false;
      }
      var actualParts = actual.split("/");
      var expectedParts = expected.split("/");
      if (actualParts.length !== 2 || expectedParts.length !== 2) {
        return false;
      }
      if (expectedParts[0] !== "*" && expectedParts[0] !== actualParts[0]) {
        return false;
      }
      if (expectedParts[1].substr(0, 2) === "*+") {
        return expectedParts[1].length <= actualParts[1].length + 1 && expectedParts[1].substr(1) === actualParts[1].substr(1 - expectedParts[1].length);
      }
      if (expectedParts[1] !== "*" && expectedParts[1] !== actualParts[1]) {
        return false;
      }
      return true;
    }
    __name(mimeMatch, "mimeMatch");
    function normalizeType(value) {
      var type = typer.parse(value);
      type.parameters = void 0;
      return typer.format(type);
    }
    __name(normalizeType, "normalizeType");
    function tryNormalizeType(value) {
      if (!value) {
        return null;
      }
      try {
        return normalizeType(value);
      } catch (err) {
        return null;
      }
    }
    __name(tryNormalizeType, "tryNormalizeType");
  }
});

// node_modules/body-parser/lib/types/json.js
var require_json = __commonJS({
  "node_modules/body-parser/lib/types/json.js"(exports, module) {
    "use strict";
    var bytes = require_bytes();
    var contentType = require_content_type();
    var createError = require_http_errors();
    var debug = require_src()("body-parser:json");
    var read = require_read();
    var typeis = require_type_is();
    module.exports = json;
    var FIRST_CHAR_REGEXP = /^[\x20\x09\x0a\x0d]*([^\x20\x09\x0a\x0d])/;
    var JSON_SYNTAX_CHAR = "#";
    var JSON_SYNTAX_REGEXP = /#+/g;
    function json(options) {
      var opts = options || {};
      var limit = typeof opts.limit === "undefined" || opts.limit === null ? 102400 : bytes.parse(opts.limit);
      var inflate = opts.inflate !== false;
      var reviver = opts.reviver;
      var strict = opts.strict !== false;
      var type = opts.type || "application/json";
      var verify = opts.verify || false;
      if (limit === null) {
        throw new TypeError('option limit "' + String(opts.limit) + '" is invalid');
      }
      if (verify !== false && typeof verify !== "function") {
        throw new TypeError("option verify must be function");
      }
      var shouldParse = typeof type !== "function" ? typeChecker(type) : type;
      function parse(body) {
        if (body.length === 0) {
          return {};
        }
        if (strict) {
          var first = firstchar(body);
          if (first !== "{" && first !== "[") {
            debug("strict violation");
            throw createStrictSyntaxError(body, first);
          }
        }
        try {
          debug("parse json");
          return JSON.parse(body, reviver);
        } catch (e) {
          throw normalizeJsonSyntaxError(e, {
            message: e.message,
            stack: e.stack
          });
        }
      }
      __name(parse, "parse");
      return /* @__PURE__ */ __name(function jsonParser(req, res, next) {
        if (req._body) {
          debug("body already parsed");
          next();
          return;
        }
        req.body = req.body || {};
        if (!typeis.hasBody(req)) {
          debug("skip empty body");
          next();
          return;
        }
        debug("content-type %j", req.headers["content-type"]);
        if (!shouldParse(req)) {
          debug("skip parsing");
          next();
          return;
        }
        var charset = getCharset(req) || "utf-8";
        if (charset.slice(0, 4) !== "utf-") {
          debug("invalid charset");
          next(createError(415, 'unsupported charset "' + charset.toUpperCase() + '"', {
            charset,
            type: "charset.unsupported"
          }));
          return;
        }
        read(req, res, next, parse, debug, {
          encoding: charset,
          inflate,
          limit,
          verify
        });
      }, "jsonParser");
    }
    __name(json, "json");
    function createStrictSyntaxError(str, char) {
      var index = str.indexOf(char);
      var partial = "";
      if (index !== -1) {
        partial = str.substring(0, index) + new Array(str.length - index + 1).join(JSON_SYNTAX_CHAR);
      }
      try {
        JSON.parse(partial);
        throw new SyntaxError("strict violation");
      } catch (e) {
        return normalizeJsonSyntaxError(e, {
          message: e.message.replace(JSON_SYNTAX_REGEXP, function(placeholder) {
            return str.substring(index, index + placeholder.length);
          }),
          stack: e.stack
        });
      }
    }
    __name(createStrictSyntaxError, "createStrictSyntaxError");
    function firstchar(str) {
      var match = FIRST_CHAR_REGEXP.exec(str);
      return match ? match[1] : void 0;
    }
    __name(firstchar, "firstchar");
    function getCharset(req) {
      try {
        return (contentType.parse(req).parameters.charset || "").toLowerCase();
      } catch (e) {
        return void 0;
      }
    }
    __name(getCharset, "getCharset");
    function normalizeJsonSyntaxError(error, obj) {
      var keys = Object.getOwnPropertyNames(error);
      for (var i = 0; i < keys.length; i++) {
        var key2 = keys[i];
        if (key2 !== "stack" && key2 !== "message") {
          delete error[key2];
        }
      }
      error.stack = obj.stack.replace(error.message, obj.message);
      error.message = obj.message;
      return error;
    }
    __name(normalizeJsonSyntaxError, "normalizeJsonSyntaxError");
    function typeChecker(type) {
      return /* @__PURE__ */ __name(function checkType(req) {
        return Boolean(typeis(req, type));
      }, "checkType");
    }
    __name(typeChecker, "typeChecker");
  }
});

// node_modules/body-parser/lib/types/raw.js
var require_raw = __commonJS({
  "node_modules/body-parser/lib/types/raw.js"(exports, module) {
    "use strict";
    var bytes = require_bytes();
    var debug = require_src()("body-parser:raw");
    var read = require_read();
    var typeis = require_type_is();
    module.exports = raw;
    function raw(options) {
      var opts = options || {};
      var inflate = opts.inflate !== false;
      var limit = typeof opts.limit === "undefined" || opts.limit === null ? 102400 : bytes.parse(opts.limit);
      var type = opts.type || "application/octet-stream";
      var verify = opts.verify || false;
      if (limit === null) {
        throw new TypeError('option limit "' + String(opts.limit) + '" is invalid');
      }
      if (verify !== false && typeof verify !== "function") {
        throw new TypeError("option verify must be function");
      }
      var shouldParse = typeof type !== "function" ? typeChecker(type) : type;
      function parse(buf) {
        return buf;
      }
      __name(parse, "parse");
      return /* @__PURE__ */ __name(function rawParser(req, res, next) {
        if (req._body) {
          debug("body already parsed");
          next();
          return;
        }
        req.body = req.body || {};
        if (!typeis.hasBody(req)) {
          debug("skip empty body");
          next();
          return;
        }
        debug("content-type %j", req.headers["content-type"]);
        if (!shouldParse(req)) {
          debug("skip parsing");
          next();
          return;
        }
        read(req, res, next, parse, debug, {
          encoding: null,
          inflate,
          limit,
          verify
        });
      }, "rawParser");
    }
    __name(raw, "raw");
    function typeChecker(type) {
      return /* @__PURE__ */ __name(function checkType(req) {
        return Boolean(typeis(req, type));
      }, "checkType");
    }
    __name(typeChecker, "typeChecker");
  }
});

// node_modules/body-parser/lib/types/text.js
var require_text = __commonJS({
  "node_modules/body-parser/lib/types/text.js"(exports, module) {
    "use strict";
    var bytes = require_bytes();
    var contentType = require_content_type();
    var debug = require_src()("body-parser:text");
    var read = require_read();
    var typeis = require_type_is();
    module.exports = text2;
    function text2(options) {
      var opts = options || {};
      var defaultCharset = opts.defaultCharset || "utf-8";
      var inflate = opts.inflate !== false;
      var limit = typeof opts.limit === "undefined" || opts.limit === null ? 102400 : bytes.parse(opts.limit);
      var type = opts.type || "text/plain";
      var verify = opts.verify || false;
      if (limit === null) {
        throw new TypeError('option limit "' + String(opts.limit) + '" is invalid');
      }
      if (verify !== false && typeof verify !== "function") {
        throw new TypeError("option verify must be function");
      }
      var shouldParse = typeof type !== "function" ? typeChecker(type) : type;
      function parse(buf) {
        return buf;
      }
      __name(parse, "parse");
      return /* @__PURE__ */ __name(function textParser(req, res, next) {
        if (req._body) {
          debug("body already parsed");
          next();
          return;
        }
        req.body = req.body || {};
        if (!typeis.hasBody(req)) {
          debug("skip empty body");
          next();
          return;
        }
        debug("content-type %j", req.headers["content-type"]);
        if (!shouldParse(req)) {
          debug("skip parsing");
          next();
          return;
        }
        var charset = getCharset(req) || defaultCharset;
        read(req, res, next, parse, debug, {
          encoding: charset,
          inflate,
          limit,
          verify
        });
      }, "textParser");
    }
    __name(text2, "text");
    function getCharset(req) {
      try {
        return (contentType.parse(req).parameters.charset || "").toLowerCase();
      } catch (e) {
        return void 0;
      }
    }
    __name(getCharset, "getCharset");
    function typeChecker(type) {
      return /* @__PURE__ */ __name(function checkType(req) {
        return Boolean(typeis(req, type));
      }, "checkType");
    }
    __name(typeChecker, "typeChecker");
  }
});

// node_modules/es-errors/type.js
var require_type = __commonJS({
  "node_modules/es-errors/type.js"(exports, module) {
    "use strict";
    module.exports = TypeError;
  }
});

// (disabled):node_modules/object-inspect/util.inspect
var require_util2 = __commonJS({
  "(disabled):node_modules/object-inspect/util.inspect"() {
  }
});

// node_modules/object-inspect/index.js
var require_object_inspect = __commonJS({
  "node_modules/object-inspect/index.js"(exports, module) {
    var hasMap = typeof Map === "function" && Map.prototype;
    var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
    var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
    var mapForEach = hasMap && Map.prototype.forEach;
    var hasSet = typeof Set === "function" && Set.prototype;
    var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
    var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
    var setForEach = hasSet && Set.prototype.forEach;
    var hasWeakMap = typeof WeakMap === "function" && WeakMap.prototype;
    var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
    var hasWeakSet = typeof WeakSet === "function" && WeakSet.prototype;
    var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
    var hasWeakRef = typeof WeakRef === "function" && WeakRef.prototype;
    var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
    var booleanValueOf = Boolean.prototype.valueOf;
    var objectToString = Object.prototype.toString;
    var functionToString = Function.prototype.toString;
    var $match = String.prototype.match;
    var $slice = String.prototype.slice;
    var $replace = String.prototype.replace;
    var $toUpperCase = String.prototype.toUpperCase;
    var $toLowerCase = String.prototype.toLowerCase;
    var $test = RegExp.prototype.test;
    var $concat = Array.prototype.concat;
    var $join = Array.prototype.join;
    var $arrSlice = Array.prototype.slice;
    var $floor = Math.floor;
    var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
    var gOPS = Object.getOwnPropertySymbols;
    var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
    var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
    var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
    var isEnumerable = Object.prototype.propertyIsEnumerable;
    var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
      return O.__proto__;
    } : null);
    function addNumericSeparator(num, str) {
      if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) {
        return str;
      }
      var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
      if (typeof num === "number") {
        var int = num < 0 ? -$floor(-num) : $floor(num);
        if (int !== num) {
          var intStr = String(int);
          var dec = $slice.call(str, intStr.length + 1);
          return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
        }
      }
      return $replace.call(str, sepRegex, "$&_");
    }
    __name(addNumericSeparator, "addNumericSeparator");
    var utilInspect = require_util2();
    var inspectCustom = utilInspect.custom;
    var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
    var quotes = {
      __proto__: null,
      "double": '"',
      single: "'"
    };
    var quoteREs = {
      __proto__: null,
      "double": /(["\\])/g,
      single: /(['\\])/g
    };
    module.exports = /* @__PURE__ */ __name(function inspect_(obj, options, depth, seen) {
      var opts = options || {};
      if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
      }
      if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
      }
      var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
      if (typeof customInspect !== "boolean" && customInspect !== "symbol") {
        throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
      }
      if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
      }
      if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") {
        throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
      }
      var numericSeparator = opts.numericSeparator;
      if (typeof obj === "undefined") {
        return "undefined";
      }
      if (obj === null) {
        return "null";
      }
      if (typeof obj === "boolean") {
        return obj ? "true" : "false";
      }
      if (typeof obj === "string") {
        return inspectString(obj, opts);
      }
      if (typeof obj === "number") {
        if (obj === 0) {
          return Infinity / obj > 0 ? "0" : "-0";
        }
        var str = String(obj);
        return numericSeparator ? addNumericSeparator(obj, str) : str;
      }
      if (typeof obj === "bigint") {
        var bigIntStr = String(obj) + "n";
        return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
      }
      var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
      if (typeof depth === "undefined") {
        depth = 0;
      }
      if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") {
        return isArray(obj) ? "[Array]" : "[Object]";
      }
      var indent = getIndent(opts, depth);
      if (typeof seen === "undefined") {
        seen = [];
      } else if (indexOf(seen, obj) >= 0) {
        return "[Circular]";
      }
      function inspect(value, from, noIndent) {
        if (from) {
          seen = $arrSlice.call(seen);
          seen.push(from);
        }
        if (noIndent) {
          var newOpts = {
            depth: opts.depth
          };
          if (has(opts, "quoteStyle")) {
            newOpts.quoteStyle = opts.quoteStyle;
          }
          return inspect_(value, newOpts, depth + 1, seen);
        }
        return inspect_(value, opts, depth + 1, seen);
      }
      __name(inspect, "inspect");
      if (typeof obj === "function" && !isRegExp(obj)) {
        var name = nameOf(obj);
        var keys = arrObjKeys(obj, inspect);
        return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
      }
      if (isSymbol(obj)) {
        var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
        return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
      }
      if (isElement(obj)) {
        var s = "<" + $toLowerCase.call(String(obj.nodeName));
        var attrs = obj.attributes || [];
        for (var i = 0; i < attrs.length; i++) {
          s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
        }
        s += ">";
        if (obj.childNodes && obj.childNodes.length) {
          s += "...";
        }
        s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
        return s;
      }
      if (isArray(obj)) {
        if (obj.length === 0) {
          return "[]";
        }
        var xs = arrObjKeys(obj, inspect);
        if (indent && !singleLineValues(xs)) {
          return "[" + indentedJoin(xs, indent) + "]";
        }
        return "[ " + $join.call(xs, ", ") + " ]";
      }
      if (isError(obj)) {
        var parts = arrObjKeys(obj, inspect);
        if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) {
          return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect(obj.cause), parts), ", ") + " }";
        }
        if (parts.length === 0) {
          return "[" + String(obj) + "]";
        }
        return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
      }
      if (typeof obj === "object" && customInspect) {
        if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) {
          return utilInspect(obj, { depth: maxDepth - depth });
        } else if (customInspect !== "symbol" && typeof obj.inspect === "function") {
          return obj.inspect();
        }
      }
      if (isMap(obj)) {
        var mapParts = [];
        if (mapForEach) {
          mapForEach.call(obj, function(value, key2) {
            mapParts.push(inspect(key2, obj, true) + " => " + inspect(value, obj));
          });
        }
        return collectionOf("Map", mapSize.call(obj), mapParts, indent);
      }
      if (isSet(obj)) {
        var setParts = [];
        if (setForEach) {
          setForEach.call(obj, function(value) {
            setParts.push(inspect(value, obj));
          });
        }
        return collectionOf("Set", setSize.call(obj), setParts, indent);
      }
      if (isWeakMap(obj)) {
        return weakCollectionOf("WeakMap");
      }
      if (isWeakSet(obj)) {
        return weakCollectionOf("WeakSet");
      }
      if (isWeakRef(obj)) {
        return weakCollectionOf("WeakRef");
      }
      if (isNumber(obj)) {
        return markBoxed(inspect(Number(obj)));
      }
      if (isBigInt(obj)) {
        return markBoxed(inspect(bigIntValueOf.call(obj)));
      }
      if (isBoolean(obj)) {
        return markBoxed(booleanValueOf.call(obj));
      }
      if (isString(obj)) {
        return markBoxed(inspect(String(obj)));
      }
      if (typeof window !== "undefined" && obj === window) {
        return "{ [object Window] }";
      }
      if (typeof globalThis !== "undefined" && obj === globalThis || typeof global !== "undefined" && obj === global) {
        return "{ [object globalThis] }";
      }
      if (!isDate(obj) && !isRegExp(obj)) {
        var ys = arrObjKeys(obj, inspect);
        var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
        var protoTag = obj instanceof Object ? "" : "null prototype";
        var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
        var constructorTag = isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "";
        var tag = constructorTag + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
        if (ys.length === 0) {
          return tag + "{}";
        }
        if (indent) {
          return tag + "{" + indentedJoin(ys, indent) + "}";
        }
        return tag + "{ " + $join.call(ys, ", ") + " }";
      }
      return String(obj);
    }, "inspect_");
    function wrapQuotes(s, defaultStyle, opts) {
      var style = opts.quoteStyle || defaultStyle;
      var quoteChar = quotes[style];
      return quoteChar + s + quoteChar;
    }
    __name(wrapQuotes, "wrapQuotes");
    function quote(s) {
      return $replace.call(String(s), /"/g, "&quot;");
    }
    __name(quote, "quote");
    function canTrustToString(obj) {
      return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
    }
    __name(canTrustToString, "canTrustToString");
    function isArray(obj) {
      return toStr(obj) === "[object Array]" && canTrustToString(obj);
    }
    __name(isArray, "isArray");
    function isDate(obj) {
      return toStr(obj) === "[object Date]" && canTrustToString(obj);
    }
    __name(isDate, "isDate");
    function isRegExp(obj) {
      return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
    }
    __name(isRegExp, "isRegExp");
    function isError(obj) {
      return toStr(obj) === "[object Error]" && canTrustToString(obj);
    }
    __name(isError, "isError");
    function isString(obj) {
      return toStr(obj) === "[object String]" && canTrustToString(obj);
    }
    __name(isString, "isString");
    function isNumber(obj) {
      return toStr(obj) === "[object Number]" && canTrustToString(obj);
    }
    __name(isNumber, "isNumber");
    function isBoolean(obj) {
      return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
    }
    __name(isBoolean, "isBoolean");
    function isSymbol(obj) {
      if (hasShammedSymbols) {
        return obj && typeof obj === "object" && obj instanceof Symbol;
      }
      if (typeof obj === "symbol") {
        return true;
      }
      if (!obj || typeof obj !== "object" || !symToString) {
        return false;
      }
      try {
        symToString.call(obj);
        return true;
      } catch (e) {
      }
      return false;
    }
    __name(isSymbol, "isSymbol");
    function isBigInt(obj) {
      if (!obj || typeof obj !== "object" || !bigIntValueOf) {
        return false;
      }
      try {
        bigIntValueOf.call(obj);
        return true;
      } catch (e) {
      }
      return false;
    }
    __name(isBigInt, "isBigInt");
    var hasOwn = Object.prototype.hasOwnProperty || function(key2) {
      return key2 in this;
    };
    function has(obj, key2) {
      return hasOwn.call(obj, key2);
    }
    __name(has, "has");
    function toStr(obj) {
      return objectToString.call(obj);
    }
    __name(toStr, "toStr");
    function nameOf(f) {
      if (f.name) {
        return f.name;
      }
      var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
      if (m) {
        return m[1];
      }
      return null;
    }
    __name(nameOf, "nameOf");
    function indexOf(xs, x) {
      if (xs.indexOf) {
        return xs.indexOf(x);
      }
      for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) {
          return i;
        }
      }
      return -1;
    }
    __name(indexOf, "indexOf");
    function isMap(x) {
      if (!mapSize || !x || typeof x !== "object") {
        return false;
      }
      try {
        mapSize.call(x);
        try {
          setSize.call(x);
        } catch (s) {
          return true;
        }
        return x instanceof Map;
      } catch (e) {
      }
      return false;
    }
    __name(isMap, "isMap");
    function isWeakMap(x) {
      if (!weakMapHas || !x || typeof x !== "object") {
        return false;
      }
      try {
        weakMapHas.call(x, weakMapHas);
        try {
          weakSetHas.call(x, weakSetHas);
        } catch (s) {
          return true;
        }
        return x instanceof WeakMap;
      } catch (e) {
      }
      return false;
    }
    __name(isWeakMap, "isWeakMap");
    function isWeakRef(x) {
      if (!weakRefDeref || !x || typeof x !== "object") {
        return false;
      }
      try {
        weakRefDeref.call(x);
        return true;
      } catch (e) {
      }
      return false;
    }
    __name(isWeakRef, "isWeakRef");
    function isSet(x) {
      if (!setSize || !x || typeof x !== "object") {
        return false;
      }
      try {
        setSize.call(x);
        try {
          mapSize.call(x);
        } catch (m) {
          return true;
        }
        return x instanceof Set;
      } catch (e) {
      }
      return false;
    }
    __name(isSet, "isSet");
    function isWeakSet(x) {
      if (!weakSetHas || !x || typeof x !== "object") {
        return false;
      }
      try {
        weakSetHas.call(x, weakSetHas);
        try {
          weakMapHas.call(x, weakMapHas);
        } catch (s) {
          return true;
        }
        return x instanceof WeakSet;
      } catch (e) {
      }
      return false;
    }
    __name(isWeakSet, "isWeakSet");
    function isElement(x) {
      if (!x || typeof x !== "object") {
        return false;
      }
      if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) {
        return true;
      }
      return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
    }
    __name(isElement, "isElement");
    function inspectString(str, opts) {
      if (str.length > opts.maxStringLength) {
        var remaining = str.length - opts.maxStringLength;
        var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
        return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
      }
      var quoteRE = quoteREs[opts.quoteStyle || "single"];
      quoteRE.lastIndex = 0;
      var s = $replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte);
      return wrapQuotes(s, "single", opts);
    }
    __name(inspectString, "inspectString");
    function lowbyte(c) {
      var n = c.charCodeAt(0);
      var x = {
        8: "b",
        9: "t",
        10: "n",
        12: "f",
        13: "r"
      }[n];
      if (x) {
        return "\\" + x;
      }
      return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
    }
    __name(lowbyte, "lowbyte");
    function markBoxed(str) {
      return "Object(" + str + ")";
    }
    __name(markBoxed, "markBoxed");
    function weakCollectionOf(type) {
      return type + " { ? }";
    }
    __name(weakCollectionOf, "weakCollectionOf");
    function collectionOf(type, size, entries, indent) {
      var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
      return type + " (" + size + ") {" + joinedEntries + "}";
    }
    __name(collectionOf, "collectionOf");
    function singleLineValues(xs) {
      for (var i = 0; i < xs.length; i++) {
        if (indexOf(xs[i], "\n") >= 0) {
          return false;
        }
      }
      return true;
    }
    __name(singleLineValues, "singleLineValues");
    function getIndent(opts, depth) {
      var baseIndent;
      if (opts.indent === "	") {
        baseIndent = "	";
      } else if (typeof opts.indent === "number" && opts.indent > 0) {
        baseIndent = $join.call(Array(opts.indent + 1), " ");
      } else {
        return null;
      }
      return {
        base: baseIndent,
        prev: $join.call(Array(depth + 1), baseIndent)
      };
    }
    __name(getIndent, "getIndent");
    function indentedJoin(xs, indent) {
      if (xs.length === 0) {
        return "";
      }
      var lineJoiner = "\n" + indent.prev + indent.base;
      return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
    }
    __name(indentedJoin, "indentedJoin");
    function arrObjKeys(obj, inspect) {
      var isArr = isArray(obj);
      var xs = [];
      if (isArr) {
        xs.length = obj.length;
        for (var i = 0; i < obj.length; i++) {
          xs[i] = has(obj, i) ? inspect(obj[i], obj) : "";
        }
      }
      var syms = typeof gOPS === "function" ? gOPS(obj) : [];
      var symMap;
      if (hasShammedSymbols) {
        symMap = {};
        for (var k = 0; k < syms.length; k++) {
          symMap["$" + syms[k]] = syms[k];
        }
      }
      for (var key2 in obj) {
        if (!has(obj, key2)) {
          continue;
        }
        if (isArr && String(Number(key2)) === key2 && key2 < obj.length) {
          continue;
        }
        if (hasShammedSymbols && symMap["$" + key2] instanceof Symbol) {
          continue;
        } else if ($test.call(/[^\w$]/, key2)) {
          xs.push(inspect(key2, obj) + ": " + inspect(obj[key2], obj));
        } else {
          xs.push(key2 + ": " + inspect(obj[key2], obj));
        }
      }
      if (typeof gOPS === "function") {
        for (var j = 0; j < syms.length; j++) {
          if (isEnumerable.call(obj, syms[j])) {
            xs.push("[" + inspect(syms[j]) + "]: " + inspect(obj[syms[j]], obj));
          }
        }
      }
      return xs;
    }
    __name(arrObjKeys, "arrObjKeys");
  }
});

// node_modules/side-channel-list/index.js
var require_side_channel_list = __commonJS({
  "node_modules/side-channel-list/index.js"(exports, module) {
    "use strict";
    var inspect = require_object_inspect();
    var $TypeError = require_type();
    var listGetNode = /* @__PURE__ */ __name(function(list, key2, isDelete) {
      var prev = list;
      var curr;
      for (; (curr = prev.next) != null; prev = curr) {
        if (curr.key === key2) {
          prev.next = curr.next;
          if (!isDelete) {
            curr.next = /** @type {NonNullable<typeof list.next>} */
            list.next;
            list.next = curr;
          }
          return curr;
        }
      }
    }, "listGetNode");
    var listGet = /* @__PURE__ */ __name(function(objects, key2) {
      if (!objects) {
        return void 0;
      }
      var node = listGetNode(objects, key2);
      return node && node.value;
    }, "listGet");
    var listSet = /* @__PURE__ */ __name(function(objects, key2, value) {
      var node = listGetNode(objects, key2);
      if (node) {
        node.value = value;
      } else {
        objects.next = /** @type {import('./list.d.ts').ListNode<typeof value, typeof key>} */
        {
          // eslint-disable-line no-param-reassign, no-extra-parens
          key: key2,
          next: objects.next,
          value
        };
      }
    }, "listSet");
    var listHas = /* @__PURE__ */ __name(function(objects, key2) {
      if (!objects) {
        return false;
      }
      return !!listGetNode(objects, key2);
    }, "listHas");
    var listDelete = /* @__PURE__ */ __name(function(objects, key2) {
      if (objects) {
        return listGetNode(objects, key2, true);
      }
    }, "listDelete");
    module.exports = /* @__PURE__ */ __name(function getSideChannelList() {
      var $o;
      var channel = {
        assert: /* @__PURE__ */ __name(function(key2) {
          if (!channel.has(key2)) {
            throw new $TypeError("Side channel does not contain " + inspect(key2));
          }
        }, "assert"),
        "delete": /* @__PURE__ */ __name(function(key2) {
          var deletedNode = listDelete($o, key2);
          if (deletedNode && $o && !$o.next) {
            $o = void 0;
          }
          return !!deletedNode;
        }, "delete"),
        get: /* @__PURE__ */ __name(function(key2) {
          return listGet($o, key2);
        }, "get"),
        has: /* @__PURE__ */ __name(function(key2) {
          return listHas($o, key2);
        }, "has"),
        set: /* @__PURE__ */ __name(function(key2, value) {
          if (!$o) {
            $o = {
              next: void 0
            };
          }
          listSet(
            /** @type {NonNullable<typeof $o>} */
            $o,
            key2,
            value
          );
        }, "set")
      };
      return channel;
    }, "getSideChannelList");
  }
});

// node_modules/es-object-atoms/index.js
var require_es_object_atoms = __commonJS({
  "node_modules/es-object-atoms/index.js"(exports, module) {
    "use strict";
    module.exports = Object;
  }
});

// node_modules/es-errors/index.js
var require_es_errors = __commonJS({
  "node_modules/es-errors/index.js"(exports, module) {
    "use strict";
    module.exports = Error;
  }
});

// node_modules/es-errors/eval.js
var require_eval = __commonJS({
  "node_modules/es-errors/eval.js"(exports, module) {
    "use strict";
    module.exports = EvalError;
  }
});

// node_modules/es-errors/range.js
var require_range = __commonJS({
  "node_modules/es-errors/range.js"(exports, module) {
    "use strict";
    module.exports = RangeError;
  }
});

// node_modules/es-errors/ref.js
var require_ref = __commonJS({
  "node_modules/es-errors/ref.js"(exports, module) {
    "use strict";
    module.exports = ReferenceError;
  }
});

// node_modules/es-errors/syntax.js
var require_syntax = __commonJS({
  "node_modules/es-errors/syntax.js"(exports, module) {
    "use strict";
    module.exports = SyntaxError;
  }
});

// node_modules/es-errors/uri.js
var require_uri = __commonJS({
  "node_modules/es-errors/uri.js"(exports, module) {
    "use strict";
    module.exports = URIError;
  }
});

// node_modules/math-intrinsics/abs.js
var require_abs = __commonJS({
  "node_modules/math-intrinsics/abs.js"(exports, module) {
    "use strict";
    module.exports = Math.abs;
  }
});

// node_modules/math-intrinsics/floor.js
var require_floor = __commonJS({
  "node_modules/math-intrinsics/floor.js"(exports, module) {
    "use strict";
    module.exports = Math.floor;
  }
});

// node_modules/math-intrinsics/max.js
var require_max = __commonJS({
  "node_modules/math-intrinsics/max.js"(exports, module) {
    "use strict";
    module.exports = Math.max;
  }
});

// node_modules/math-intrinsics/min.js
var require_min = __commonJS({
  "node_modules/math-intrinsics/min.js"(exports, module) {
    "use strict";
    module.exports = Math.min;
  }
});

// node_modules/math-intrinsics/pow.js
var require_pow = __commonJS({
  "node_modules/math-intrinsics/pow.js"(exports, module) {
    "use strict";
    module.exports = Math.pow;
  }
});

// node_modules/math-intrinsics/round.js
var require_round = __commonJS({
  "node_modules/math-intrinsics/round.js"(exports, module) {
    "use strict";
    module.exports = Math.round;
  }
});

// node_modules/math-intrinsics/isNaN.js
var require_isNaN = __commonJS({
  "node_modules/math-intrinsics/isNaN.js"(exports, module) {
    "use strict";
    module.exports = Number.isNaN || /* @__PURE__ */ __name(function isNaN2(a) {
      return a !== a;
    }, "isNaN");
  }
});

// node_modules/math-intrinsics/sign.js
var require_sign = __commonJS({
  "node_modules/math-intrinsics/sign.js"(exports, module) {
    "use strict";
    var $isNaN = require_isNaN();
    module.exports = /* @__PURE__ */ __name(function sign(number2) {
      if ($isNaN(number2) || number2 === 0) {
        return number2;
      }
      return number2 < 0 ? -1 : 1;
    }, "sign");
  }
});

// node_modules/gopd/gOPD.js
var require_gOPD = __commonJS({
  "node_modules/gopd/gOPD.js"(exports, module) {
    "use strict";
    module.exports = Object.getOwnPropertyDescriptor;
  }
});

// node_modules/gopd/index.js
var require_gopd = __commonJS({
  "node_modules/gopd/index.js"(exports, module) {
    "use strict";
    var $gOPD = require_gOPD();
    if ($gOPD) {
      try {
        $gOPD([], "length");
      } catch (e) {
        $gOPD = null;
      }
    }
    module.exports = $gOPD;
  }
});

// node_modules/es-define-property/index.js
var require_es_define_property = __commonJS({
  "node_modules/es-define-property/index.js"(exports, module) {
    "use strict";
    var $defineProperty = Object.defineProperty || false;
    if ($defineProperty) {
      try {
        $defineProperty({}, "a", { value: 1 });
      } catch (e) {
        $defineProperty = false;
      }
    }
    module.exports = $defineProperty;
  }
});

// node_modules/has-symbols/shams.js
var require_shams = __commonJS({
  "node_modules/has-symbols/shams.js"(exports, module) {
    "use strict";
    module.exports = /* @__PURE__ */ __name(function hasSymbols() {
      if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
        return false;
      }
      if (typeof Symbol.iterator === "symbol") {
        return true;
      }
      var obj = {};
      var sym = /* @__PURE__ */ Symbol("test");
      var symObj = Object(sym);
      if (typeof sym === "string") {
        return false;
      }
      if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
        return false;
      }
      if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
        return false;
      }
      var symVal = 42;
      obj[sym] = symVal;
      for (var _ in obj) {
        return false;
      }
      if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
        return false;
      }
      if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
        return false;
      }
      var syms = Object.getOwnPropertySymbols(obj);
      if (syms.length !== 1 || syms[0] !== sym) {
        return false;
      }
      if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
        return false;
      }
      if (typeof Object.getOwnPropertyDescriptor === "function") {
        var descriptor = (
          /** @type {PropertyDescriptor} */
          Object.getOwnPropertyDescriptor(obj, sym)
        );
        if (descriptor.value !== symVal || descriptor.enumerable !== true) {
          return false;
        }
      }
      return true;
    }, "hasSymbols");
  }
});

// node_modules/has-symbols/index.js
var require_has_symbols = __commonJS({
  "node_modules/has-symbols/index.js"(exports, module) {
    "use strict";
    var origSymbol = typeof Symbol !== "undefined" && Symbol;
    var hasSymbolSham = require_shams();
    module.exports = /* @__PURE__ */ __name(function hasNativeSymbols() {
      if (typeof origSymbol !== "function") {
        return false;
      }
      if (typeof Symbol !== "function") {
        return false;
      }
      if (typeof origSymbol("foo") !== "symbol") {
        return false;
      }
      if (typeof /* @__PURE__ */ Symbol("bar") !== "symbol") {
        return false;
      }
      return hasSymbolSham();
    }, "hasNativeSymbols");
  }
});

// node_modules/get-proto/Reflect.getPrototypeOf.js
var require_Reflect_getPrototypeOf = __commonJS({
  "node_modules/get-proto/Reflect.getPrototypeOf.js"(exports, module) {
    "use strict";
    module.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
  }
});

// node_modules/get-proto/Object.getPrototypeOf.js
var require_Object_getPrototypeOf = __commonJS({
  "node_modules/get-proto/Object.getPrototypeOf.js"(exports, module) {
    "use strict";
    var $Object = require_es_object_atoms();
    module.exports = $Object.getPrototypeOf || null;
  }
});

// node_modules/function-bind/implementation.js
var require_implementation = __commonJS({
  "node_modules/function-bind/implementation.js"(exports, module) {
    "use strict";
    var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
    var toStr = Object.prototype.toString;
    var max = Math.max;
    var funcType = "[object Function]";
    var concatty = /* @__PURE__ */ __name(function concatty2(a, b) {
      var arr = [];
      for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
      }
      for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
      }
      return arr;
    }, "concatty");
    var slicy = /* @__PURE__ */ __name(function slicy2(arrLike, offset) {
      var arr = [];
      for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
      }
      return arr;
    }, "slicy");
    var joiny = /* @__PURE__ */ __name(function(arr, joiner) {
      var str = "";
      for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
          str += joiner;
        }
      }
      return str;
    }, "joiny");
    module.exports = /* @__PURE__ */ __name(function bind(that) {
      var target = this;
      if (typeof target !== "function" || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
      }
      var args = slicy(arguments, 1);
      var bound;
      var binder = /* @__PURE__ */ __name(function() {
        if (this instanceof bound) {
          var result = target.apply(
            this,
            concatty(args, arguments)
          );
          if (Object(result) === result) {
            return result;
          }
          return this;
        }
        return target.apply(
          that,
          concatty(args, arguments)
        );
      }, "binder");
      var boundLength = max(0, target.length - args.length);
      var boundArgs = [];
      for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = "$" + i;
      }
      bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
      if (target.prototype) {
        var Empty = /* @__PURE__ */ __name(function Empty2() {
        }, "Empty");
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
      }
      return bound;
    }, "bind");
  }
});

// node_modules/function-bind/index.js
var require_function_bind = __commonJS({
  "node_modules/function-bind/index.js"(exports, module) {
    "use strict";
    var implementation = require_implementation();
    module.exports = Function.prototype.bind || implementation;
  }
});

// node_modules/call-bind-apply-helpers/functionCall.js
var require_functionCall = __commonJS({
  "node_modules/call-bind-apply-helpers/functionCall.js"(exports, module) {
    "use strict";
    module.exports = Function.prototype.call;
  }
});

// node_modules/call-bind-apply-helpers/functionApply.js
var require_functionApply = __commonJS({
  "node_modules/call-bind-apply-helpers/functionApply.js"(exports, module) {
    "use strict";
    module.exports = Function.prototype.apply;
  }
});

// node_modules/call-bind-apply-helpers/reflectApply.js
var require_reflectApply = __commonJS({
  "node_modules/call-bind-apply-helpers/reflectApply.js"(exports, module) {
    "use strict";
    module.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
  }
});

// node_modules/call-bind-apply-helpers/actualApply.js
var require_actualApply = __commonJS({
  "node_modules/call-bind-apply-helpers/actualApply.js"(exports, module) {
    "use strict";
    var bind = require_function_bind();
    var $apply = require_functionApply();
    var $call = require_functionCall();
    var $reflectApply = require_reflectApply();
    module.exports = $reflectApply || bind.call($call, $apply);
  }
});

// node_modules/call-bind-apply-helpers/index.js
var require_call_bind_apply_helpers = __commonJS({
  "node_modules/call-bind-apply-helpers/index.js"(exports, module) {
    "use strict";
    var bind = require_function_bind();
    var $TypeError = require_type();
    var $call = require_functionCall();
    var $actualApply = require_actualApply();
    module.exports = /* @__PURE__ */ __name(function callBindBasic(args) {
      if (args.length < 1 || typeof args[0] !== "function") {
        throw new $TypeError("a function is required");
      }
      return $actualApply(bind, $call, args);
    }, "callBindBasic");
  }
});

// node_modules/dunder-proto/get.js
var require_get = __commonJS({
  "node_modules/dunder-proto/get.js"(exports, module) {
    "use strict";
    var callBind = require_call_bind_apply_helpers();
    var gOPD = require_gopd();
    var hasProtoAccessor;
    try {
      hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
      [].__proto__ === Array.prototype;
    } catch (e) {
      if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
        throw e;
      }
    }
    var desc = !!hasProtoAccessor && gOPD && gOPD(
      Object.prototype,
      /** @type {keyof typeof Object.prototype} */
      "__proto__"
    );
    var $Object = Object;
    var $getPrototypeOf = $Object.getPrototypeOf;
    module.exports = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
      /** @type {import('./get')} */
      /* @__PURE__ */ __name(function getDunder(value) {
        return $getPrototypeOf(value == null ? value : $Object(value));
      }, "getDunder")
    ) : false;
  }
});

// node_modules/get-proto/index.js
var require_get_proto = __commonJS({
  "node_modules/get-proto/index.js"(exports, module) {
    "use strict";
    var reflectGetProto = require_Reflect_getPrototypeOf();
    var originalGetProto = require_Object_getPrototypeOf();
    var getDunderProto = require_get();
    module.exports = reflectGetProto ? /* @__PURE__ */ __name(function getProto(O) {
      return reflectGetProto(O);
    }, "getProto") : originalGetProto ? /* @__PURE__ */ __name(function getProto(O) {
      if (!O || typeof O !== "object" && typeof O !== "function") {
        throw new TypeError("getProto: not an object");
      }
      return originalGetProto(O);
    }, "getProto") : getDunderProto ? /* @__PURE__ */ __name(function getProto(O) {
      return getDunderProto(O);
    }, "getProto") : null;
  }
});

// node_modules/hasown/index.js
var require_hasown = __commonJS({
  "node_modules/hasown/index.js"(exports, module) {
    "use strict";
    var call = Function.prototype.call;
    var $hasOwn = Object.prototype.hasOwnProperty;
    var bind = require_function_bind();
    module.exports = bind.call(call, $hasOwn);
  }
});

// node_modules/get-intrinsic/index.js
var require_get_intrinsic = __commonJS({
  "node_modules/get-intrinsic/index.js"(exports, module) {
    "use strict";
    var undefined2;
    var $Object = require_es_object_atoms();
    var $Error = require_es_errors();
    var $EvalError = require_eval();
    var $RangeError = require_range();
    var $ReferenceError = require_ref();
    var $SyntaxError = require_syntax();
    var $TypeError = require_type();
    var $URIError = require_uri();
    var abs = require_abs();
    var floor = require_floor();
    var max = require_max();
    var min = require_min();
    var pow = require_pow();
    var round = require_round();
    var sign = require_sign();
    var $Function = Function;
    var getEvalledConstructor = /* @__PURE__ */ __name(function(expressionSyntax) {
      try {
        return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
      } catch (e) {
      }
    }, "getEvalledConstructor");
    var $gOPD = require_gopd();
    var $defineProperty = require_es_define_property();
    var throwTypeError = /* @__PURE__ */ __name(function() {
      throw new $TypeError();
    }, "throwTypeError");
    var ThrowTypeError = $gOPD ? (function() {
      try {
        arguments.callee;
        return throwTypeError;
      } catch (calleeThrows) {
        try {
          return $gOPD(arguments, "callee").get;
        } catch (gOPDthrows) {
          return throwTypeError;
        }
      }
    })() : throwTypeError;
    var hasSymbols = require_has_symbols()();
    var getProto = require_get_proto();
    var $ObjectGPO = require_Object_getPrototypeOf();
    var $ReflectGPO = require_Reflect_getPrototypeOf();
    var $apply = require_functionApply();
    var $call = require_functionCall();
    var needsEval = {};
    var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
    var INTRINSICS = {
      __proto__: null,
      "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
      "%Array%": Array,
      "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
      "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
      "%AsyncFromSyncIteratorPrototype%": undefined2,
      "%AsyncFunction%": needsEval,
      "%AsyncGenerator%": needsEval,
      "%AsyncGeneratorFunction%": needsEval,
      "%AsyncIteratorPrototype%": needsEval,
      "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
      "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
      "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
      "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
      "%Boolean%": Boolean,
      "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
      "%Date%": Date,
      "%decodeURI%": decodeURI,
      "%decodeURIComponent%": decodeURIComponent,
      "%encodeURI%": encodeURI,
      "%encodeURIComponent%": encodeURIComponent,
      "%Error%": $Error,
      "%eval%": eval,
      // eslint-disable-line no-eval
      "%EvalError%": $EvalError,
      "%Float16Array%": typeof Float16Array === "undefined" ? undefined2 : Float16Array,
      "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
      "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
      "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
      "%Function%": $Function,
      "%GeneratorFunction%": needsEval,
      "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
      "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
      "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
      "%isFinite%": isFinite,
      "%isNaN%": isNaN,
      "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
      "%JSON%": typeof JSON === "object" ? JSON : undefined2,
      "%Map%": typeof Map === "undefined" ? undefined2 : Map,
      "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
      "%Math%": Math,
      "%Number%": Number,
      "%Object%": $Object,
      "%Object.getOwnPropertyDescriptor%": $gOPD,
      "%parseFloat%": parseFloat,
      "%parseInt%": parseInt,
      "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
      "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
      "%RangeError%": $RangeError,
      "%ReferenceError%": $ReferenceError,
      "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
      "%RegExp%": RegExp,
      "%Set%": typeof Set === "undefined" ? undefined2 : Set,
      "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
      "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
      "%String%": String,
      "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
      "%Symbol%": hasSymbols ? Symbol : undefined2,
      "%SyntaxError%": $SyntaxError,
      "%ThrowTypeError%": ThrowTypeError,
      "%TypedArray%": TypedArray,
      "%TypeError%": $TypeError,
      "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
      "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
      "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
      "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
      "%URIError%": $URIError,
      "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
      "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
      "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
      "%Function.prototype.call%": $call,
      "%Function.prototype.apply%": $apply,
      "%Object.defineProperty%": $defineProperty,
      "%Object.getPrototypeOf%": $ObjectGPO,
      "%Math.abs%": abs,
      "%Math.floor%": floor,
      "%Math.max%": max,
      "%Math.min%": min,
      "%Math.pow%": pow,
      "%Math.round%": round,
      "%Math.sign%": sign,
      "%Reflect.getPrototypeOf%": $ReflectGPO
    };
    if (getProto) {
      try {
        null.error;
      } catch (e) {
        errorProto = getProto(getProto(e));
        INTRINSICS["%Error.prototype%"] = errorProto;
      }
    }
    var errorProto;
    var doEval = /* @__PURE__ */ __name(function doEval2(name) {
      var value;
      if (name === "%AsyncFunction%") {
        value = getEvalledConstructor("async function () {}");
      } else if (name === "%GeneratorFunction%") {
        value = getEvalledConstructor("function* () {}");
      } else if (name === "%AsyncGeneratorFunction%") {
        value = getEvalledConstructor("async function* () {}");
      } else if (name === "%AsyncGenerator%") {
        var fn = doEval2("%AsyncGeneratorFunction%");
        if (fn) {
          value = fn.prototype;
        }
      } else if (name === "%AsyncIteratorPrototype%") {
        var gen = doEval2("%AsyncGenerator%");
        if (gen && getProto) {
          value = getProto(gen.prototype);
        }
      }
      INTRINSICS[name] = value;
      return value;
    }, "doEval");
    var LEGACY_ALIASES = {
      __proto__: null,
      "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
      "%ArrayPrototype%": ["Array", "prototype"],
      "%ArrayProto_entries%": ["Array", "prototype", "entries"],
      "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
      "%ArrayProto_keys%": ["Array", "prototype", "keys"],
      "%ArrayProto_values%": ["Array", "prototype", "values"],
      "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
      "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
      "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
      "%BooleanPrototype%": ["Boolean", "prototype"],
      "%DataViewPrototype%": ["DataView", "prototype"],
      "%DatePrototype%": ["Date", "prototype"],
      "%ErrorPrototype%": ["Error", "prototype"],
      "%EvalErrorPrototype%": ["EvalError", "prototype"],
      "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
      "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
      "%FunctionPrototype%": ["Function", "prototype"],
      "%Generator%": ["GeneratorFunction", "prototype"],
      "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
      "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
      "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
      "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
      "%JSONParse%": ["JSON", "parse"],
      "%JSONStringify%": ["JSON", "stringify"],
      "%MapPrototype%": ["Map", "prototype"],
      "%NumberPrototype%": ["Number", "prototype"],
      "%ObjectPrototype%": ["Object", "prototype"],
      "%ObjProto_toString%": ["Object", "prototype", "toString"],
      "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
      "%PromisePrototype%": ["Promise", "prototype"],
      "%PromiseProto_then%": ["Promise", "prototype", "then"],
      "%Promise_all%": ["Promise", "all"],
      "%Promise_reject%": ["Promise", "reject"],
      "%Promise_resolve%": ["Promise", "resolve"],
      "%RangeErrorPrototype%": ["RangeError", "prototype"],
      "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
      "%RegExpPrototype%": ["RegExp", "prototype"],
      "%SetPrototype%": ["Set", "prototype"],
      "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
      "%StringPrototype%": ["String", "prototype"],
      "%SymbolPrototype%": ["Symbol", "prototype"],
      "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
      "%TypedArrayPrototype%": ["TypedArray", "prototype"],
      "%TypeErrorPrototype%": ["TypeError", "prototype"],
      "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
      "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
      "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
      "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
      "%URIErrorPrototype%": ["URIError", "prototype"],
      "%WeakMapPrototype%": ["WeakMap", "prototype"],
      "%WeakSetPrototype%": ["WeakSet", "prototype"]
    };
    var bind = require_function_bind();
    var hasOwn = require_hasown();
    var $concat = bind.call($call, Array.prototype.concat);
    var $spliceApply = bind.call($apply, Array.prototype.splice);
    var $replace = bind.call($call, String.prototype.replace);
    var $strSlice = bind.call($call, String.prototype.slice);
    var $exec = bind.call($call, RegExp.prototype.exec);
    var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
    var reEscapeChar = /\\(\\)?/g;
    var stringToPath = /* @__PURE__ */ __name(function stringToPath2(string) {
      var first = $strSlice(string, 0, 1);
      var last = $strSlice(string, -1);
      if (first === "%" && last !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
      } else if (last === "%" && first !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
      }
      var result = [];
      $replace(string, rePropName, function(match, number2, quote, subString) {
        result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number2 || match;
      });
      return result;
    }, "stringToPath");
    var getBaseIntrinsic = /* @__PURE__ */ __name(function getBaseIntrinsic2(name, allowMissing) {
      var intrinsicName = name;
      var alias;
      if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
        alias = LEGACY_ALIASES[intrinsicName];
        intrinsicName = "%" + alias[0] + "%";
      }
      if (hasOwn(INTRINSICS, intrinsicName)) {
        var value = INTRINSICS[intrinsicName];
        if (value === needsEval) {
          value = doEval(intrinsicName);
        }
        if (typeof value === "undefined" && !allowMissing) {
          throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
        }
        return {
          alias,
          name: intrinsicName,
          value
        };
      }
      throw new $SyntaxError("intrinsic " + name + " does not exist!");
    }, "getBaseIntrinsic");
    module.exports = /* @__PURE__ */ __name(function GetIntrinsic(name, allowMissing) {
      if (typeof name !== "string" || name.length === 0) {
        throw new $TypeError("intrinsic name must be a non-empty string");
      }
      if (arguments.length > 1 && typeof allowMissing !== "boolean") {
        throw new $TypeError('"allowMissing" argument must be a boolean');
      }
      if ($exec(/^%?[^%]*%?$/, name) === null) {
        throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
      }
      var parts = stringToPath(name);
      var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
      var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
      var intrinsicRealName = intrinsic.name;
      var value = intrinsic.value;
      var skipFurtherCaching = false;
      var alias = intrinsic.alias;
      if (alias) {
        intrinsicBaseName = alias[0];
        $spliceApply(parts, $concat([0, 1], alias));
      }
      for (var i = 1, isOwn = true; i < parts.length; i += 1) {
        var part = parts[i];
        var first = $strSlice(part, 0, 1);
        var last = $strSlice(part, -1);
        if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
          throw new $SyntaxError("property names with quotes must have matching quotes");
        }
        if (part === "constructor" || !isOwn) {
          skipFurtherCaching = true;
        }
        intrinsicBaseName += "." + part;
        intrinsicRealName = "%" + intrinsicBaseName + "%";
        if (hasOwn(INTRINSICS, intrinsicRealName)) {
          value = INTRINSICS[intrinsicRealName];
        } else if (value != null) {
          if (!(part in value)) {
            if (!allowMissing) {
              throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
            }
            return void undefined2;
          }
          if ($gOPD && i + 1 >= parts.length) {
            var desc = $gOPD(value, part);
            isOwn = !!desc;
            if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
              value = desc.get;
            } else {
              value = value[part];
            }
          } else {
            isOwn = hasOwn(value, part);
            value = value[part];
          }
          if (isOwn && !skipFurtherCaching) {
            INTRINSICS[intrinsicRealName] = value;
          }
        }
      }
      return value;
    }, "GetIntrinsic");
  }
});

// node_modules/call-bound/index.js
var require_call_bound = __commonJS({
  "node_modules/call-bound/index.js"(exports, module) {
    "use strict";
    var GetIntrinsic = require_get_intrinsic();
    var callBindBasic = require_call_bind_apply_helpers();
    var $indexOf = callBindBasic([GetIntrinsic("%String.prototype.indexOf%")]);
    module.exports = /* @__PURE__ */ __name(function callBoundIntrinsic(name, allowMissing) {
      var intrinsic = (
        /** @type {(this: unknown, ...args: unknown[]) => unknown} */
        GetIntrinsic(name, !!allowMissing)
      );
      if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
        return callBindBasic(
          /** @type {const} */
          [intrinsic]
        );
      }
      return intrinsic;
    }, "callBoundIntrinsic");
  }
});

// node_modules/side-channel-map/index.js
var require_side_channel_map = __commonJS({
  "node_modules/side-channel-map/index.js"(exports, module) {
    "use strict";
    var GetIntrinsic = require_get_intrinsic();
    var callBound = require_call_bound();
    var inspect = require_object_inspect();
    var $TypeError = require_type();
    var $Map = GetIntrinsic("%Map%", true);
    var $mapGet = callBound("Map.prototype.get", true);
    var $mapSet = callBound("Map.prototype.set", true);
    var $mapHas = callBound("Map.prototype.has", true);
    var $mapDelete = callBound("Map.prototype.delete", true);
    var $mapSize = callBound("Map.prototype.size", true);
    module.exports = !!$Map && /** @type {Exclude<import('.'), false>} */
    /* @__PURE__ */ __name(function getSideChannelMap() {
      var $m;
      var channel = {
        assert: /* @__PURE__ */ __name(function(key2) {
          if (!channel.has(key2)) {
            throw new $TypeError("Side channel does not contain " + inspect(key2));
          }
        }, "assert"),
        "delete": /* @__PURE__ */ __name(function(key2) {
          if ($m) {
            var result = $mapDelete($m, key2);
            if ($mapSize($m) === 0) {
              $m = void 0;
            }
            return result;
          }
          return false;
        }, "delete"),
        get: /* @__PURE__ */ __name(function(key2) {
          if ($m) {
            return $mapGet($m, key2);
          }
        }, "get"),
        has: /* @__PURE__ */ __name(function(key2) {
          if ($m) {
            return $mapHas($m, key2);
          }
          return false;
        }, "has"),
        set: /* @__PURE__ */ __name(function(key2, value) {
          if (!$m) {
            $m = new $Map();
          }
          $mapSet($m, key2, value);
        }, "set")
      };
      return channel;
    }, "getSideChannelMap");
  }
});

// node_modules/side-channel-weakmap/index.js
var require_side_channel_weakmap = __commonJS({
  "node_modules/side-channel-weakmap/index.js"(exports, module) {
    "use strict";
    var GetIntrinsic = require_get_intrinsic();
    var callBound = require_call_bound();
    var inspect = require_object_inspect();
    var getSideChannelMap = require_side_channel_map();
    var $TypeError = require_type();
    var $WeakMap = GetIntrinsic("%WeakMap%", true);
    var $weakMapGet = callBound("WeakMap.prototype.get", true);
    var $weakMapSet = callBound("WeakMap.prototype.set", true);
    var $weakMapHas = callBound("WeakMap.prototype.has", true);
    var $weakMapDelete = callBound("WeakMap.prototype.delete", true);
    module.exports = $WeakMap ? (
      /** @type {Exclude<import('.'), false>} */
      /* @__PURE__ */ __name(function getSideChannelWeakMap() {
        var $wm;
        var $m;
        var channel = {
          assert: /* @__PURE__ */ __name(function(key2) {
            if (!channel.has(key2)) {
              throw new $TypeError("Side channel does not contain " + inspect(key2));
            }
          }, "assert"),
          "delete": /* @__PURE__ */ __name(function(key2) {
            if ($WeakMap && key2 && (typeof key2 === "object" || typeof key2 === "function")) {
              if ($wm) {
                return $weakMapDelete($wm, key2);
              }
            } else if (getSideChannelMap) {
              if ($m) {
                return $m["delete"](key2);
              }
            }
            return false;
          }, "delete"),
          get: /* @__PURE__ */ __name(function(key2) {
            if ($WeakMap && key2 && (typeof key2 === "object" || typeof key2 === "function")) {
              if ($wm) {
                return $weakMapGet($wm, key2);
              }
            }
            return $m && $m.get(key2);
          }, "get"),
          has: /* @__PURE__ */ __name(function(key2) {
            if ($WeakMap && key2 && (typeof key2 === "object" || typeof key2 === "function")) {
              if ($wm) {
                return $weakMapHas($wm, key2);
              }
            }
            return !!$m && $m.has(key2);
          }, "has"),
          set: /* @__PURE__ */ __name(function(key2, value) {
            if ($WeakMap && key2 && (typeof key2 === "object" || typeof key2 === "function")) {
              if (!$wm) {
                $wm = new $WeakMap();
              }
              $weakMapSet($wm, key2, value);
            } else if (getSideChannelMap) {
              if (!$m) {
                $m = getSideChannelMap();
              }
              $m.set(key2, value);
            }
          }, "set")
        };
        return channel;
      }, "getSideChannelWeakMap")
    ) : getSideChannelMap;
  }
});

// node_modules/side-channel/index.js
var require_side_channel = __commonJS({
  "node_modules/side-channel/index.js"(exports, module) {
    "use strict";
    var $TypeError = require_type();
    var inspect = require_object_inspect();
    var getSideChannelList = require_side_channel_list();
    var getSideChannelMap = require_side_channel_map();
    var getSideChannelWeakMap = require_side_channel_weakmap();
    var makeChannel = getSideChannelWeakMap || getSideChannelMap || getSideChannelList;
    module.exports = /* @__PURE__ */ __name(function getSideChannel() {
      var $channelData;
      var channel = {
        assert: /* @__PURE__ */ __name(function(key2) {
          if (!channel.has(key2)) {
            var keyDesc = key2 && Object(key2) === key2 ? "the given object key" : inspect(key2);
            throw new $TypeError("Side channel does not contain " + keyDesc);
          }
        }, "assert"),
        "delete": /* @__PURE__ */ __name(function(key2) {
          return !!$channelData && $channelData["delete"](key2);
        }, "delete"),
        get: /* @__PURE__ */ __name(function(key2) {
          return $channelData && $channelData.get(key2);
        }, "get"),
        has: /* @__PURE__ */ __name(function(key2) {
          return !!$channelData && $channelData.has(key2);
        }, "has"),
        set: /* @__PURE__ */ __name(function(key2, value) {
          if (!$channelData) {
            $channelData = makeChannel();
          }
          $channelData.set(key2, value);
        }, "set")
      };
      return channel;
    }, "getSideChannel");
  }
});

// node_modules/qs/lib/formats.js
var require_formats = __commonJS({
  "node_modules/qs/lib/formats.js"(exports, module) {
    "use strict";
    var replace = String.prototype.replace;
    var percentTwenties = /%20/g;
    var Format = {
      RFC1738: "RFC1738",
      RFC3986: "RFC3986"
    };
    module.exports = {
      "default": Format.RFC3986,
      formatters: {
        RFC1738: /* @__PURE__ */ __name(function(value) {
          return replace.call(value, percentTwenties, "+");
        }, "RFC1738"),
        RFC3986: /* @__PURE__ */ __name(function(value) {
          return String(value);
        }, "RFC3986")
      },
      RFC1738: Format.RFC1738,
      RFC3986: Format.RFC3986
    };
  }
});

// node_modules/qs/lib/utils.js
var require_utils = __commonJS({
  "node_modules/qs/lib/utils.js"(exports, module) {
    "use strict";
    var formats = require_formats();
    var getSideChannel = require_side_channel();
    var defineProperty = require_es_define_property();
    var has = Object.prototype.hasOwnProperty;
    var isArray = Array.isArray;
    var overflowChannel = getSideChannel();
    var markOverflow = /* @__PURE__ */ __name(function markOverflow2(obj, maxIndex) {
      overflowChannel.set(obj, maxIndex);
      return obj;
    }, "markOverflow");
    var isOverflow = /* @__PURE__ */ __name(function isOverflow2(obj) {
      return overflowChannel.has(obj);
    }, "isOverflow");
    var getMaxIndex = /* @__PURE__ */ __name(function getMaxIndex2(obj) {
      return overflowChannel.get(obj);
    }, "getMaxIndex");
    var setMaxIndex = /* @__PURE__ */ __name(function setMaxIndex2(obj, maxIndex) {
      overflowChannel.set(obj, maxIndex);
    }, "setMaxIndex");
    var conflictChannel = getSideChannel();
    var markConflict = /* @__PURE__ */ __name(function markConflict2(obj, maxIndex) {
      conflictChannel.set(obj, maxIndex);
      return obj;
    }, "markConflict");
    var isConflict = /* @__PURE__ */ __name(function isConflict2(obj) {
      return conflictChannel.has(obj);
    }, "isConflict");
    var getConflictIndex = /* @__PURE__ */ __name(function getConflictIndex2(obj) {
      return conflictChannel.get(obj);
    }, "getConflictIndex");
    var hexTable = (function() {
      var array = [];
      for (var i = 0; i < 256; ++i) {
        array[array.length] = "%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase();
      }
      return array;
    })();
    var compactQueue = /* @__PURE__ */ __name(function compactQueue2(queue) {
      while (queue.length > 1) {
        var item = queue.pop();
        var obj = item.obj[item.prop];
        if (isArray(obj)) {
          var compacted = [];
          for (var j = 0; j < obj.length; ++j) {
            if (typeof obj[j] !== "undefined") {
              compacted[compacted.length] = obj[j];
            }
          }
          item.obj[item.prop] = compacted;
        }
      }
    }, "compactQueue");
    var arrayToObject = /* @__PURE__ */ __name(function arrayToObject2(source, options) {
      var obj = options && options.plainObjects ? { __proto__: null } : {};
      for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== "undefined") {
          obj[i] = source[i];
        }
      }
      return obj;
    }, "arrayToObject");
    var setProperty = /* @__PURE__ */ __name(function setProperty2(obj, key2, value) {
      if (key2 === "__proto__" && defineProperty) {
        defineProperty(obj, key2, {
          configurable: true,
          enumerable: true,
          value,
          writable: true
        });
      } else {
        obj[key2] = value;
      }
    }, "setProperty");
    var maxNumericIndex = /* @__PURE__ */ __name(function maxNumericIndex2(obj, min) {
      var max = min;
      var keys = Object.keys(obj);
      for (var i = 0; i < keys.length; ++i) {
        var num = parseInt(keys[i], 10);
        if (String(num) === keys[i] && num > max) {
          max = num;
        }
      }
      return max;
    }, "maxNumericIndex");
    var limitedPair = /* @__PURE__ */ __name(function limitedPair2(first, second, options) {
      var pair = [first, second];
      if (options && typeof options.arrayLimit === "number" && pair.length > options.arrayLimit) {
        if (options.throwOnLimitExceeded) {
          throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
        }
        return markOverflow(arrayToObject(pair, options), 1);
      }
      return pair;
    }, "limitedPair");
    var merge = /* @__PURE__ */ __name(function merge2(target, source, options) {
      if (!source) {
        return target;
      }
      if (typeof source !== "object" && typeof source !== "function") {
        if (isArray(target)) {
          var nextIndex = target.length;
          if (options && typeof options.arrayLimit === "number" && nextIndex >= options.arrayLimit) {
            if (options.throwOnLimitExceeded) {
              throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
            }
            return markOverflow(arrayToObject(target.concat(source), options), nextIndex);
          }
          target[nextIndex] = source;
        } else if (target && typeof target === "object") {
          if (isOverflow(target)) {
            var newIndex = getMaxIndex(target) + 1;
            target[newIndex] = source;
            setMaxIndex(target, newIndex);
          } else if (options && options.strictMerge && isConflict(target)) {
            var nextConflict = getConflictIndex(target) + 1;
            if (options.throwOnLimitExceeded && typeof options.arrayLimit === "number" && nextConflict >= options.arrayLimit) {
              throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
            }
            target[nextConflict] = source;
            markConflict(target, nextConflict);
          } else if (options && options.strictMerge) {
            var conflict = limitedPair(target, source, options);
            return isArray(conflict) ? markConflict(conflict, 1) : conflict;
          } else if (options && (options.plainObjects || options.allowPrototypes) || !has.call(Object.prototype, source)) {
            target[source] = true;
          }
        } else {
          return limitedPair(target, source, options);
        }
        return target;
      }
      if (!target || typeof target !== "object") {
        if (isOverflow(source)) {
          var sourceKeys = Object.keys(source);
          var result = options && options.plainObjects ? { __proto__: null, 0: target } : { 0: target };
          for (var m = 0; m < sourceKeys.length; m++) {
            var oldKey = parseInt(sourceKeys[m], 10);
            result[oldKey + 1] = source[sourceKeys[m]];
          }
          return markOverflow(result, getMaxIndex(source) + 1);
        }
        var combined = [target].concat(source);
        if (options && typeof options.arrayLimit === "number" && combined.length > options.arrayLimit) {
          if (options.throwOnLimitExceeded) {
            throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
          }
          return markOverflow(arrayToObject(combined, options), combined.length - 1);
        }
        return combined;
      }
      var mergeTarget = target;
      if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options);
        if (isConflict(target)) {
          markConflict(mergeTarget, target.length - 1);
        }
      }
      if (isArray(target) && isArray(source)) {
        source.forEach(function(item, i) {
          if (has.call(target, i)) {
            var targetItem = target[i];
            if (targetItem && typeof targetItem === "object" && item && typeof item === "object") {
              target[i] = merge2(targetItem, item, options);
            } else {
              target[target.length] = item;
            }
          } else {
            target[i] = item;
          }
        });
        if (options && typeof options.arrayLimit === "number" && target.length > options.arrayLimit) {
          if (options.throwOnLimitExceeded) {
            throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
          }
          return markOverflow(arrayToObject(target, options), target.length - 1);
        }
        return target;
      }
      return Object.keys(source).reduce(function(acc, key2) {
        var value = source[key2];
        if (has.call(acc, key2)) {
          setProperty(acc, key2, merge2(acc[key2], value, options));
        } else {
          setProperty(acc, key2, value);
        }
        if (isOverflow(source) && !isOverflow(acc)) {
          markOverflow(acc, maxNumericIndex(acc, getMaxIndex(source)));
        }
        if (isOverflow(acc)) {
          var keyNum = parseInt(key2, 10);
          if (String(keyNum) === key2 && keyNum >= 0 && keyNum > getMaxIndex(acc)) {
            setMaxIndex(acc, keyNum);
          }
        }
        if (isConflict(acc)) {
          var conflictKey = parseInt(key2, 10);
          if (String(conflictKey) === key2 && conflictKey > getConflictIndex(acc)) {
            markConflict(acc, conflictKey);
          }
        }
        return acc;
      }, mergeTarget);
    }, "merge");
    var assign = /* @__PURE__ */ __name(function assignSingleSource(target, source) {
      return Object.keys(source).reduce(function(acc, key2) {
        setProperty(acc, key2, source[key2]);
        return acc;
      }, target);
    }, "assignSingleSource");
    var decode2 = /* @__PURE__ */ __name(function(str, defaultDecoder, charset) {
      if (typeof str === "string" && str.indexOf("%") === -1) {
        return str.indexOf("+") === -1 ? str : str.replace(/\+/g, " ");
      }
      var strWithoutPlus = str.replace(/\+/g, " ");
      if (charset === "iso-8859-1") {
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
      }
      try {
        return decodeURIComponent(strWithoutPlus);
      } catch (e) {
        return strWithoutPlus;
      }
    }, "decode");
    var hasToPrimitive = typeof Symbol === "function" && typeof Symbol.toPrimitive === "symbol";
    var arrayJoin = Array.prototype.join;
    var arrayToString = Array.prototype.toString;
    var objectToString = Object.prototype.toString;
    var toCoercible = /* @__PURE__ */ __name(function toCoercible2(value, joining) {
      if (!value || typeof value !== "object" && typeof value !== "function") {
        return value;
      }
      if (hasToPrimitive && value[Symbol.toPrimitive] != null) {
        return value;
      }
      if (isArray(value) && value.toString === arrayToString && value.join === arrayJoin) {
        var ancestors = joining || getSideChannel();
        if (ancestors.has(value)) {
          return "";
        }
        ancestors.set(value, true);
        var copy;
        for (var i = 0; i < value.length; i += 1) {
          var item = value[i];
          var coerced = toCoercible2(item, ancestors);
          if (!copy && coerced !== item) {
            copy = [];
            for (var j = 0; j < i; j += 1) {
              copy[j] = value[j];
            }
          }
          if (copy) {
            copy[i] = coerced;
          }
        }
        ancestors["delete"](value);
        return copy || value;
      }
      if (typeof value.toString === "function") {
        return value;
      }
      var valueOf = value.valueOf;
      if (typeof valueOf === "function") {
        var primitive = valueOf.call(value);
        if (!primitive || typeof primitive !== "object" && typeof primitive !== "function") {
          return String(primitive);
        }
      }
      return objectToString.call(value);
    }, "toCoercible");
    var limit = 1024;
    var encode2 = /* @__PURE__ */ __name(function encode3(str, defaultEncoder, charset, kind, format) {
      if (str.length === 0) {
        return str;
      }
      var string = str;
      if (typeof str === "symbol") {
        string = Symbol.prototype.toString.call(str);
      } else if (typeof str !== "string") {
        string = String(toCoercible(str));
      }
      if (charset === "iso-8859-1") {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
          return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
        }).replace(/\+/g, "%2B");
      }
      var out = "";
      for (var j = 0; j < string.length; j += limit) {
        var segment = string.length >= limit ? string.slice(j, j + limit) : string;
        if (j + limit < string.length) {
          var last = segment.charCodeAt(segment.length - 1);
          if (last >= 55296 && last <= 56319) {
            segment = segment.slice(0, -1);
            j -= 1;
          }
        }
        var arr = [];
        for (var i = 0; i < segment.length; ++i) {
          var c = segment.charCodeAt(i);
          if (c === 45 || c === 46 || c === 95 || c === 126 || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || format === formats.RFC1738 && (c === 40 || c === 41)) {
            arr[arr.length] = segment.charAt(i);
            continue;
          }
          if (c < 128) {
            arr[arr.length] = hexTable[c];
            continue;
          }
          if (c < 2048) {
            arr[arr.length] = hexTable[192 | c >> 6] + hexTable[128 | c & 63];
            continue;
          }
          if (c < 55296 || c >= 57344) {
            arr[arr.length] = hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
            continue;
          }
          i += 1;
          c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
          arr[arr.length] = hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
        }
        out += arr.join("");
      }
      return out;
    }, "encode");
    var compact = /* @__PURE__ */ __name(function compact2(value) {
      var queue = [{ obj: { o: value }, prop: "o" }];
      var refs = getSideChannel();
      for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];
        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
          var key2 = keys[j];
          var val = obj[key2];
          if (typeof val === "object" && val !== null && !refs.has(val)) {
            queue[queue.length] = { obj, prop: key2 };
            refs.set(val, true);
          }
        }
      }
      compactQueue(queue);
      return value;
    }, "compact");
    var isRegExp = /* @__PURE__ */ __name(function isRegExp2(obj) {
      return Object.prototype.toString.call(obj) === "[object RegExp]";
    }, "isRegExp");
    var isBuffer = /* @__PURE__ */ __name(function isBuffer2(obj) {
      if (!obj || typeof obj !== "object") {
        return false;
      }
      return !!(obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj));
    }, "isBuffer");
    var combine = /* @__PURE__ */ __name(function combine2(a, b, arrayLimit, plainObjects, throwOnLimitExceeded) {
      if (isOverflow(a)) {
        if (throwOnLimitExceeded) {
          throw new RangeError("Array limit exceeded. Only " + arrayLimit + " element" + (arrayLimit === 1 ? "" : "s") + " allowed in an array.");
        }
        var bValues = isArray(b) ? b : [b];
        var newIndex = getMaxIndex(a);
        for (var i = 0; i < bValues.length; ++i) {
          newIndex += 1;
          a[newIndex] = bValues[i];
        }
        setMaxIndex(a, newIndex);
        return a;
      }
      var result = [].concat(a, b);
      if (result.length > arrayLimit) {
        if (throwOnLimitExceeded) {
          throw new RangeError("Array limit exceeded. Only " + arrayLimit + " element" + (arrayLimit === 1 ? "" : "s") + " allowed in an array.");
        }
        return markOverflow(arrayToObject(result, { plainObjects }), result.length - 1);
      }
      return result;
    }, "combine");
    var maybeMap = /* @__PURE__ */ __name(function maybeMap2(val, fn) {
      if (isArray(val)) {
        var mapped = [];
        for (var i = 0; i < val.length; i += 1) {
          mapped[mapped.length] = fn(val[i]);
        }
        return mapped;
      }
      return fn(val);
    }, "maybeMap");
    module.exports = {
      arrayToObject,
      assign,
      combine,
      compact,
      decode: decode2,
      encode: encode2,
      isBuffer,
      isOverflow,
      isRegExp,
      markOverflow,
      maybeMap,
      merge,
      toCoercible
    };
  }
});

// node_modules/qs/lib/stringify.js
var require_stringify = __commonJS({
  "node_modules/qs/lib/stringify.js"(exports, module) {
    "use strict";
    var getSideChannel = require_side_channel();
    var utils = require_utils();
    var formats = require_formats();
    var has = Object.prototype.hasOwnProperty;
    var arrayPrefixGenerators = {
      brackets: /* @__PURE__ */ __name(function brackets(prefix) {
        return prefix + "[]";
      }, "brackets"),
      comma: "comma",
      indices: /* @__PURE__ */ __name(function indices(prefix, key2) {
        return prefix + "[" + key2 + "]";
      }, "indices"),
      repeat: /* @__PURE__ */ __name(function repeat(prefix) {
        return prefix;
      }, "repeat")
    };
    var isArray = Array.isArray;
    var push = Array.prototype.push;
    var pushToArray = /* @__PURE__ */ __name(function(arr, valueOrArray) {
      push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
    }, "pushToArray");
    var toISO = Date.prototype.toISOString;
    var defaultFormat = formats["default"];
    var defaults = {
      addQueryPrefix: false,
      allowDots: false,
      allowEmptyArrays: false,
      arrayFormat: "indices",
      charset: "utf-8",
      charsetSentinel: false,
      commaRoundTrip: false,
      delimiter: "&",
      depth: Infinity,
      encode: true,
      encodeDotInKeys: false,
      encoder: utils.encode,
      encodeValuesOnly: false,
      filter: void 0,
      format: defaultFormat,
      formatter: formats.formatters[defaultFormat],
      // deprecated
      indices: false,
      serializeDate: /* @__PURE__ */ __name(function serializeDate(date) {
        return toISO.call(date);
      }, "serializeDate"),
      skipNulls: false,
      strictNullHandling: false
    };
    var isNonNullishPrimitive = /* @__PURE__ */ __name(function isNonNullishPrimitive2(v) {
      return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
    }, "isNonNullishPrimitive");
    var sentinel = {};
    var stringify = /* @__PURE__ */ __name(function stringify2(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel, depth, currentDepth) {
      var obj = object;
      if (currentDepth > depth) {
        throw new RangeError("Input depth exceeded depth option of " + depth);
      }
      var tmpSc = sideChannel;
      var step = 0;
      var findFlag = false;
      while ((tmpSc = tmpSc.get(sentinel)) !== void 0 && !findFlag) {
        var pos = tmpSc.get(object);
        step += 1;
        if (typeof pos !== "undefined") {
          if (pos === step) {
            throw new RangeError("Cyclic object value");
          } else {
            findFlag = true;
          }
        }
        if (typeof tmpSc.get(sentinel) === "undefined") {
          step = 0;
        }
      }
      obj = typeof filter === "function" ? filter(prefix, obj) : obj;
      if (obj instanceof Date) {
        obj = serializeDate(obj);
      } else if (generateArrayPrefix === "comma" && isArray(obj)) {
        obj = utils.maybeMap(obj, function(value2) {
          if (value2 instanceof Date) {
            return serializeDate(value2);
          }
          return value2;
        });
      }
      if (obj === null) {
        if (strictNullHandling) {
          return formatter(encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, "key", format) : prefix);
        }
        obj = "";
      }
      if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
        if (encoder) {
          var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, "key", format);
          return [formatter(keyValue) + "=" + formatter(encoder(obj, defaults.encoder, charset, "value", format))];
        }
        return [formatter(prefix) + "=" + formatter(String(obj))];
      }
      var values = [];
      if (typeof obj === "undefined") {
        return values;
      }
      var objKeys;
      if (generateArrayPrefix === "comma" && isArray(obj)) {
        if (encodeValuesOnly && encoder) {
          obj = utils.maybeMap(obj, function(v) {
            return v == null ? v : encoder(v, defaults.encoder, charset, "value", format);
          });
        }
        objKeys = [{ value: obj.length > 0 ? utils.toCoercible(obj).join(",") || null : void 0 }];
      } else if (isArray(filter)) {
        objKeys = filter;
      } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
      }
      var encodedPrefix = String(prefix);
      var adjustedPrefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? encodedPrefix + "[]" : encodedPrefix;
      if (allowEmptyArrays && isArray(obj) && obj.length === 0 && Object.keys(obj).length === 0) {
        return adjustedPrefix + "[]";
      }
      for (var j = 0; j < objKeys.length; ++j) {
        var key2 = objKeys[j];
        var value = typeof key2 === "object" && key2 && typeof key2.value !== "undefined" ? key2.value : obj[key2];
        if (skipNulls && value === null) {
          continue;
        }
        var encodedKey = allowDots && encodeDotInKeys ? String(key2).replace(/\./g, "%2E") : String(key2);
        var keyPrefix = isArray(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix : adjustedPrefix + (allowDots ? "." + encodedKey : "[" + encodedKey + "]");
        sideChannel.set(object, step);
        var valueSideChannel = getSideChannel();
        valueSideChannel.set(sentinel, sideChannel);
        pushToArray(values, stringify2(
          value,
          keyPrefix,
          generateArrayPrefix,
          commaRoundTrip,
          allowEmptyArrays,
          strictNullHandling,
          skipNulls,
          encodeDotInKeys,
          generateArrayPrefix === "comma" && encodeValuesOnly && isArray(obj) ? null : encoder,
          filter,
          sort,
          allowDots,
          serializeDate,
          format,
          formatter,
          encodeValuesOnly,
          charset,
          valueSideChannel,
          depth,
          currentDepth + 1
        ));
      }
      return values;
    }, "stringify");
    var normalizeStringifyOptions = /* @__PURE__ */ __name(function normalizeStringifyOptions2(opts) {
      if (!opts) {
        return defaults;
      }
      if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
        throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
      }
      if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
        throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
      }
      if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
        throw new TypeError("Encoder has to be a function.");
      }
      var charset = opts.charset || defaults.charset;
      if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
        throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
      }
      var format = formats["default"];
      if (typeof opts.format !== "undefined") {
        if (!has.call(formats.formatters, opts.format)) {
          throw new TypeError("Unknown format option provided.");
        }
        format = opts.format;
      }
      var formatter = formats.formatters[format];
      var filter = defaults.filter;
      if (typeof opts.filter === "function" || isArray(opts.filter)) {
        filter = opts.filter;
      }
      var arrayFormat;
      if (has.call(arrayPrefixGenerators, opts.arrayFormat)) {
        arrayFormat = opts.arrayFormat;
      } else if ("indices" in opts) {
        arrayFormat = opts.indices ? "indices" : "repeat";
      } else {
        arrayFormat = defaults.arrayFormat;
      }
      if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
        throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
      }
      var allowDots = typeof opts.allowDots === "undefined" ? opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
      return {
        addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        arrayFormat,
        charset,
        charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
        commaRoundTrip: !!opts.commaRoundTrip,
        delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
        depth: typeof opts.depth === "number" ? opts.depth : defaults.depth,
        encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
        encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
        encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter,
        format,
        formatter,
        serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === "function" ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
      };
    }, "normalizeStringifyOptions");
    module.exports = function(object, opts) {
      var obj = object;
      var options = normalizeStringifyOptions(opts);
      var objKeys;
      var filter;
      if (typeof options.filter === "function") {
        filter = options.filter;
        obj = filter("", obj);
      } else if (isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
      }
      var keys = [];
      if (typeof obj !== "object" || obj === null) {
        return "";
      }
      var generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
      var commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
      if (!objKeys) {
        objKeys = Object.keys(obj);
      }
      if (options.sort) {
        objKeys.sort(options.sort);
      }
      var sideChannel = getSideChannel();
      for (var i = 0; i < objKeys.length; ++i) {
        var key2 = objKeys[i];
        if (typeof key2 === "undefined" || key2 === null) {
          continue;
        }
        var value = obj[key2];
        if (options.skipNulls && value === null) {
          continue;
        }
        var encodedKey = options.encodeDotInKeys ? String(key2).replace(/\./g, "%2E") : String(key2);
        pushToArray(keys, stringify(
          value,
          encodedKey,
          generateArrayPrefix,
          commaRoundTrip,
          options.allowEmptyArrays,
          options.strictNullHandling,
          options.skipNulls,
          options.encodeDotInKeys,
          options.encode ? options.encoder : null,
          options.filter,
          options.sort,
          options.allowDots,
          options.serializeDate,
          options.format,
          options.formatter,
          options.encodeValuesOnly,
          options.charset,
          sideChannel,
          options.depth,
          0
        ));
      }
      var joined = keys.join(options.delimiter);
      var prefix = options.addQueryPrefix === true ? "?" : "";
      if (options.charsetSentinel) {
        if (options.charset === "iso-8859-1") {
          prefix += "utf8=%26%2310003%3B" + options.delimiter;
        } else {
          prefix += "utf8=%E2%9C%93" + options.delimiter;
        }
      }
      return joined.length > 0 ? prefix + joined : "";
    };
  }
});

// node_modules/qs/lib/parse.js
var require_parse = __commonJS({
  "node_modules/qs/lib/parse.js"(exports, module) {
    "use strict";
    var getSideChannel = require_side_channel();
    var utils = require_utils();
    var has = Object.prototype.hasOwnProperty;
    var isArray = Array.isArray;
    var getPrototypeOf = Object.getPrototypeOf;
    var isPlainContainer = /* @__PURE__ */ __name(function isPlainContainer2(value) {
      if (!value || typeof value !== "object") {
        return false;
      }
      if (isArray(value)) {
        return true;
      }
      var proto = getPrototypeOf(value);
      return proto === Object.prototype || proto === null;
    }, "isPlainContainer");
    var emptyCopyOf = /* @__PURE__ */ __name(function emptyCopyOf2(value) {
      if (isArray(value)) {
        var arr = [];
        arr.length = value.length;
        return arr;
      }
      return getPrototypeOf(value) === null ? { __proto__: null } : {};
    }, "emptyCopyOf");
    var copyInput = /* @__PURE__ */ __name(function copyInput2(input) {
      var copies = getSideChannel();
      var result = {};
      var queue = [{ source: input, target: result }];
      for (var i = 0; i < queue.length; ++i) {
        var source = queue[i].source;
        var target = queue[i].target;
        var keys = Object.keys(source);
        for (var j = 0; j < keys.length; ++j) {
          var value = source[keys[j]];
          if (isPlainContainer(value)) {
            if (!copies.has(value)) {
              var copy = emptyCopyOf(value);
              copies.set(value, copy);
              queue[queue.length] = { source: value, target: copy };
            }
            target[keys[j]] = copies.get(value);
          } else {
            target[keys[j]] = value;
          }
        }
      }
      return result;
    }, "copyInput");
    var defaults = {
      allowDots: false,
      allowEmptyArrays: false,
      allowPrototypes: false,
      allowSparse: false,
      arrayLimit: 20,
      charset: "utf-8",
      charsetSentinel: false,
      comma: false,
      decodeDotInKeys: false,
      decoder: utils.decode,
      delimiter: "&",
      depth: 5,
      duplicates: "combine",
      ignoreQueryPrefix: false,
      interpretNumericEntities: false,
      parameterLimit: 1e3,
      parseArrays: true,
      plainObjects: false,
      strictDepth: false,
      strictMerge: true,
      strictNullHandling: false,
      throwOnLimitExceeded: false
    };
    var interpretNumericEntities = /* @__PURE__ */ __name(function(str) {
      return str.replace(/&#(\d+);/g, function($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
      });
    }, "interpretNumericEntities");
    var parseArrayValue = /* @__PURE__ */ __name(function(val, options, currentArrayLength) {
      if (val && typeof val === "string" && options.comma && val.indexOf(",") > -1) {
        if (options.throwOnLimitExceeded) {
          var commaCount = 0;
          var commaIndex = val.indexOf(",");
          while (commaIndex > -1) {
            commaCount += 1;
            if (commaCount >= options.arrayLimit) {
              throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
            }
            commaIndex = val.indexOf(",", commaIndex + 1);
          }
        }
        return val.split(",");
      }
      if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
        throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
      }
      return val;
    }, "parseArrayValue");
    var isoSentinel = "utf8=%26%2310003%3B";
    var charsetSentinel = "utf8=%E2%9C%93";
    var parseValues = /* @__PURE__ */ __name(function parseQueryStringValues(str, options) {
      var obj = { __proto__: null };
      var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, "") : str;
      cleanStr = cleanStr.replace(/%5B/gi, "[").replace(/%5D/gi, "]");
      var limit = options.parameterLimit === Infinity ? void 0 : options.parameterLimit;
      var parts = cleanStr.split(
        options.delimiter,
        options.throwOnLimitExceeded && typeof limit !== "undefined" ? limit + 1 : limit
      );
      if (options.throwOnLimitExceeded && typeof limit !== "undefined" && parts.length > limit) {
        throw new RangeError("Parameter limit exceeded. Only " + limit + " parameter" + (limit === 1 ? "" : "s") + " allowed.");
      }
      var skipIndex = -1;
      var i;
      var charset = options.charset;
      if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
          if (parts[i].indexOf("utf8=") === 0) {
            if (parts[i] === charsetSentinel) {
              charset = "utf-8";
            } else if (parts[i] === isoSentinel) {
              charset = "iso-8859-1";
            }
            skipIndex = i;
            i = parts.length;
          }
        }
      }
      for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
          continue;
        }
        var part = parts[i];
        var bracketEqualsPos = part.indexOf("]=");
        var pos = bracketEqualsPos === -1 ? part.indexOf("=") : bracketEqualsPos + 1;
        var isEmptyBracketKey = pos > 1 && part.slice(pos - 2, pos) === "[]";
        var key2;
        var val;
        if (pos === -1) {
          key2 = options.decoder(part, defaults.decoder, charset, "key");
          val = options.strictNullHandling ? null : "";
        } else {
          key2 = options.decoder(part.slice(0, pos), defaults.decoder, charset, "key");
          if (key2 !== null) {
            val = utils.maybeMap(
              parseArrayValue(
                part.slice(pos + 1),
                options,
                isArray(obj[key2]) ? obj[key2].length : 0
              ),
              function(encodedVal) {
                return options.decoder(encodedVal, defaults.decoder, charset, "value");
              }
            );
          }
        }
        if (val && options.interpretNumericEntities && charset === "iso-8859-1") {
          val = interpretNumericEntities(String(val));
        }
        if (isEmptyBracketKey) {
          val = isArray(val) ? [val] : val;
        }
        if (options.comma && isArray(val) && val.length > options.arrayLimit) {
          val = utils.combine([], val, options.arrayLimit, options.plainObjects, options.throwOnLimitExceeded);
        }
        if (key2 !== null) {
          var existing = has.call(obj, key2);
          if (existing && (options.duplicates === "combine" || isEmptyBracketKey)) {
            obj[key2] = utils.combine(
              obj[key2],
              val,
              options.arrayLimit,
              options.plainObjects,
              options.throwOnLimitExceeded
            );
          } else if (!existing || options.duplicates === "last") {
            obj[key2] = val;
          }
        }
      }
      return obj;
    }, "parseQueryStringValues");
    var parseObject = /* @__PURE__ */ __name(function(chain, val, options, valuesParsed) {
      var currentArrayLength = 0;
      if (chain.length > 0 && chain[chain.length - 1] === "[]") {
        var parentKey = chain.slice(0, -1).join("");
        currentArrayLength = Array.isArray(val) && val[parentKey] ? val[parentKey].length : 0;
      }
      var leaf = valuesParsed ? val : parseArrayValue(val, options, currentArrayLength);
      for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];
        if (root === "[]" && options.parseArrays) {
          if (utils.isOverflow(leaf)) {
            obj = leaf;
          } else {
            obj = options.allowEmptyArrays && (leaf === "" || options.strictNullHandling && leaf === null) ? [] : utils.combine(
              [],
              leaf,
              options.arrayLimit,
              options.plainObjects,
              options.throwOnLimitExceeded
            );
          }
        } else {
          obj = options.plainObjects ? { __proto__: null } : {};
          var cleanRoot = root.charAt(0) === "[" && root.charAt(root.length - 1) === "]" ? root.slice(1, -1) : root;
          var decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, ".") : cleanRoot;
          var index = parseInt(decodedRoot, 10);
          var isValidArrayIndex = !isNaN(index) && root !== decodedRoot && String(index) === decodedRoot && index >= 0 && options.parseArrays;
          if (!options.parseArrays && decodedRoot === "") {
            obj = { 0: leaf };
          } else if (isValidArrayIndex && index < options.arrayLimit) {
            obj = [];
            obj[index] = leaf;
          } else if (isValidArrayIndex && options.throwOnLimitExceeded) {
            throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
          } else if (isValidArrayIndex) {
            obj[index] = leaf;
            utils.markOverflow(obj, index);
          } else if (decodedRoot !== "__proto__") {
            obj[decodedRoot] = leaf;
          }
        }
        leaf = obj;
      }
      return leaf;
    }, "parseObject");
    var topLevelDotsToBrackets = /* @__PURE__ */ __name(function topLevelDotsToBrackets2(key2) {
      var result = "";
      var depth = 0;
      for (var i = 0; i < key2.length; i += 1) {
        var cu = key2.charCodeAt(i);
        if (cu === 91) {
          depth += 1;
          result += "[";
        } else if (cu === 93) {
          if (depth > 0) {
            depth -= 1;
          }
          result += "]";
        } else if (cu === 46 && depth === 0 && i + 1 < key2.length && key2.charCodeAt(i + 1) !== 46 && key2.charCodeAt(i + 1) !== 91) {
          var start = i + 1;
          var j = start;
          while (j < key2.length && key2.charCodeAt(j) !== 46 && key2.charCodeAt(j) !== 91) {
            j += 1;
          }
          result += "[" + key2.slice(start, j) + "]";
          i = j - 1;
        } else {
          result += key2.charAt(i);
        }
      }
      return result;
    }, "topLevelDotsToBrackets");
    var splitKeyIntoSegments = /* @__PURE__ */ __name(function splitKeyIntoSegments2(originalKey, options) {
      var key2 = options.allowDots ? topLevelDotsToBrackets(originalKey) : originalKey;
      if (options.depth <= 0) {
        if (!options.plainObjects && has.call(Object.prototype, key2)) {
          if (!options.allowPrototypes) {
            return;
          }
        }
        return [key2];
      }
      var segments = [];
      var first = key2.indexOf("[");
      var parent = first >= 0 ? key2.slice(0, first) : key2;
      if (parent) {
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
          if (!options.allowPrototypes) {
            return;
          }
        }
        segments[segments.length] = parent;
      }
      var n = key2.length;
      var open = first;
      var collected = 0;
      while (open >= 0 && collected < options.depth) {
        var level = 1;
        var i = open + 1;
        var close = -1;
        while (i < n && close < 0) {
          var cu = key2.charCodeAt(i);
          if (cu === 91) {
            level += 1;
          } else if (cu === 93) {
            level -= 1;
            if (level === 0) {
              close = i;
            }
          }
          i += 1;
        }
        if (close < 0) {
          segments[segments.length] = "[" + key2.slice(open) + "]";
          return segments;
        }
        var seg = key2.slice(open, close + 1);
        var content = seg.slice(1, -1);
        if (!options.plainObjects && has.call(Object.prototype, content) && !options.allowPrototypes) {
          return;
        }
        segments[segments.length] = seg;
        collected += 1;
        open = key2.indexOf("[", close + 1);
      }
      if (open >= 0) {
        if (options.strictDepth === true) {
          throw new RangeError("Input depth exceeded depth option of " + options.depth + " and strictDepth is true");
        }
        segments[segments.length] = "[" + key2.slice(open) + "]";
      }
      return segments;
    }, "splitKeyIntoSegments");
    var parseKeys = /* @__PURE__ */ __name(function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
      if (!givenKey) {
        return;
      }
      var keys = splitKeyIntoSegments(givenKey, options);
      if (!keys) {
        return;
      }
      return parseObject(keys, val, options, valuesParsed);
    }, "parseQueryStringKeys");
    var normalizeParseOptions = /* @__PURE__ */ __name(function normalizeParseOptions2(opts) {
      if (!opts) {
        return defaults;
      }
      if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
        throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
      }
      if (typeof opts.decodeDotInKeys !== "undefined" && typeof opts.decodeDotInKeys !== "boolean") {
        throw new TypeError("`decodeDotInKeys` option can only be `true` or `false`, when provided");
      }
      if (opts.decoder !== null && typeof opts.decoder !== "undefined" && typeof opts.decoder !== "function") {
        throw new TypeError("Decoder has to be a function.");
      }
      if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
        throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
      }
      if (typeof opts.throwOnLimitExceeded !== "undefined" && typeof opts.throwOnLimitExceeded !== "boolean") {
        throw new TypeError("`throwOnLimitExceeded` option must be a boolean");
      }
      var charset = typeof opts.charset === "undefined" ? defaults.charset : opts.charset;
      var duplicates = typeof opts.duplicates === "undefined" ? defaults.duplicates : opts.duplicates;
      if (duplicates !== "combine" && duplicates !== "first" && duplicates !== "last") {
        throw new TypeError("The duplicates option must be either combine, first, or last");
      }
      var allowDots = typeof opts.allowDots === "undefined" ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
      return {
        allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        allowPrototypes: typeof opts.allowPrototypes === "boolean" ? opts.allowPrototypes : defaults.allowPrototypes,
        allowSparse: typeof opts.allowSparse === "boolean" ? opts.allowSparse : defaults.allowSparse,
        arrayLimit: typeof opts.arrayLimit === "number" ? opts.arrayLimit : defaults.arrayLimit,
        charset,
        charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === "boolean" ? opts.comma : defaults.comma,
        decodeDotInKeys: typeof opts.decodeDotInKeys === "boolean" ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
        decoder: typeof opts.decoder === "function" ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === "string" || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: typeof opts.depth === "number" || opts.depth === false ? +opts.depth : defaults.depth,
        duplicates,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === "boolean" ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === "number" ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === "boolean" ? opts.plainObjects : defaults.plainObjects,
        strictDepth: typeof opts.strictDepth === "boolean" ? !!opts.strictDepth : defaults.strictDepth,
        strictMerge: typeof opts.strictMerge === "boolean" ? !!opts.strictMerge : defaults.strictMerge,
        strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling,
        throwOnLimitExceeded: typeof opts.throwOnLimitExceeded === "boolean" ? opts.throwOnLimitExceeded : false
      };
    }, "normalizeParseOptions");
    module.exports = function(str, opts) {
      var options = normalizeParseOptions(opts);
      if (str === "" || str === null || typeof str === "undefined") {
        return options.plainObjects ? { __proto__: null } : {};
      }
      var tempObj = typeof str === "string" ? parseValues(str, options) : copyInput(str);
      var obj = options.plainObjects ? { __proto__: null } : {};
      var keys = Object.keys(tempObj);
      for (var i = 0; i < keys.length; ++i) {
        var key2 = keys[i];
        var newObj = parseKeys(key2, tempObj[key2], options, typeof str === "string");
        obj = utils.merge(obj, newObj, options);
      }
      if (options.allowSparse === true) {
        return obj;
      }
      return utils.compact(obj);
    };
  }
});

// node_modules/qs/lib/index.js
var require_lib = __commonJS({
  "node_modules/qs/lib/index.js"(exports, module) {
    "use strict";
    var stringify = require_stringify();
    var parse = require_parse();
    var formats = require_formats();
    module.exports = {
      formats,
      parse,
      stringify
    };
  }
});

// node-built-in-modules:querystring
import libDefault10 from "querystring";
var require_querystring = __commonJS({
  "node-built-in-modules:querystring"(exports, module) {
    module.exports = libDefault10;
  }
});

// node_modules/body-parser/lib/types/urlencoded.js
var require_urlencoded = __commonJS({
  "node_modules/body-parser/lib/types/urlencoded.js"(exports, module) {
    "use strict";
    var bytes = require_bytes();
    var contentType = require_content_type();
    var createError = require_http_errors();
    var debug = require_src()("body-parser:urlencoded");
    var deprecate = require_browser()("body-parser");
    var read = require_read();
    var typeis = require_type_is();
    module.exports = urlencoded;
    var parsers = /* @__PURE__ */ Object.create(null);
    function urlencoded(options) {
      var opts = options || {};
      if (opts.extended === void 0) {
        deprecate("undefined extended: provide extended option");
      }
      var extended = opts.extended !== false;
      var inflate = opts.inflate !== false;
      var limit = typeof opts.limit === "undefined" || opts.limit === null ? 102400 : bytes.parse(opts.limit);
      var type = opts.type || "application/x-www-form-urlencoded";
      var verify = opts.verify || false;
      if (limit === null) {
        throw new TypeError('option limit "' + String(opts.limit) + '" is invalid');
      }
      if (verify !== false && typeof verify !== "function") {
        throw new TypeError("option verify must be function");
      }
      var queryparse = extended ? extendedparser(opts) : simpleparser(opts);
      var shouldParse = typeof type !== "function" ? typeChecker(type) : type;
      function parse(body) {
        return body.length ? queryparse(body) : {};
      }
      __name(parse, "parse");
      return /* @__PURE__ */ __name(function urlencodedParser(req, res, next) {
        if (req._body) {
          debug("body already parsed");
          next();
          return;
        }
        req.body = req.body || {};
        if (!typeis.hasBody(req)) {
          debug("skip empty body");
          next();
          return;
        }
        debug("content-type %j", req.headers["content-type"]);
        if (!shouldParse(req)) {
          debug("skip parsing");
          next();
          return;
        }
        var charset = getCharset(req) || "utf-8";
        if (charset !== "utf-8") {
          debug("invalid charset");
          next(createError(415, 'unsupported charset "' + charset.toUpperCase() + '"', {
            charset,
            type: "charset.unsupported"
          }));
          return;
        }
        read(req, res, next, parse, debug, {
          debug,
          encoding: charset,
          inflate,
          limit,
          verify
        });
      }, "urlencodedParser");
    }
    __name(urlencoded, "urlencoded");
    function extendedparser(options) {
      var parameterLimit = options.parameterLimit !== void 0 ? options.parameterLimit : 1e3;
      var depth = options.depth !== void 0 ? options.depth : 32;
      var parse = parser("qs");
      if (isNaN(parameterLimit) || parameterLimit < 1) {
        throw new TypeError("option parameterLimit must be a positive number");
      }
      if (isNaN(depth) || depth < 0) {
        throw new TypeError("option depth must be a zero or a positive number");
      }
      if (isFinite(parameterLimit)) {
        parameterLimit = parameterLimit | 0;
      }
      return /* @__PURE__ */ __name(function queryparse(body) {
        var paramCount = parameterCount(body, parameterLimit);
        if (paramCount === void 0) {
          debug("too many parameters");
          throw createError(413, "too many parameters", {
            type: "parameters.too.many"
          });
        }
        var arrayLimit = Math.max(100, paramCount);
        debug("parse extended urlencoding");
        try {
          return parse(body, {
            allowPrototypes: true,
            arrayLimit,
            depth,
            strictDepth: true,
            parameterLimit
          });
        } catch (err) {
          if (err instanceof RangeError) {
            throw createError(400, "The input exceeded the depth", {
              type: "querystring.parse.rangeError"
            });
          } else {
            throw err;
          }
        }
      }, "queryparse");
    }
    __name(extendedparser, "extendedparser");
    function getCharset(req) {
      try {
        return (contentType.parse(req).parameters.charset || "").toLowerCase();
      } catch (e) {
        return void 0;
      }
    }
    __name(getCharset, "getCharset");
    function parameterCount(body, limit) {
      var count = 0;
      var index = -1;
      do {
        count++;
        if (count > limit) {
          return void 0;
        }
        index = body.indexOf("&", index + 1);
      } while (index !== -1);
      return count;
    }
    __name(parameterCount, "parameterCount");
    function parser(name) {
      var mod = parsers[name];
      if (mod !== void 0) {
        return mod.parse;
      }
      switch (name) {
        case "qs":
          mod = require_lib();
          break;
        case "querystring":
          mod = require_querystring();
          break;
      }
      parsers[name] = mod;
      return mod.parse;
    }
    __name(parser, "parser");
    function simpleparser(options) {
      var parameterLimit = options.parameterLimit !== void 0 ? options.parameterLimit : 1e3;
      var parse = parser("querystring");
      if (isNaN(parameterLimit) || parameterLimit < 1) {
        throw new TypeError("option parameterLimit must be a positive number");
      }
      if (isFinite(parameterLimit)) {
        parameterLimit = parameterLimit | 0;
      }
      return /* @__PURE__ */ __name(function queryparse(body) {
        var paramCount = parameterCount(body, parameterLimit);
        if (paramCount === void 0) {
          debug("too many parameters");
          throw createError(413, "too many parameters", {
            type: "parameters.too.many"
          });
        }
        debug("parse urlencoding");
        return parse(body, void 0, void 0, { maxKeys: parameterLimit });
      }, "queryparse");
    }
    __name(simpleparser, "simpleparser");
    function typeChecker(type) {
      return /* @__PURE__ */ __name(function checkType(req) {
        return Boolean(typeis(req, type));
      }, "checkType");
    }
    __name(typeChecker, "typeChecker");
  }
});

// node_modules/body-parser/index.js
var require_body_parser = __commonJS({
  "node_modules/body-parser/index.js"(exports, module) {
    "use strict";
    var deprecate = require_browser()("body-parser");
    var parsers = /* @__PURE__ */ Object.create(null);
    exports = module.exports = deprecate.function(
      bodyParser,
      "bodyParser: use individual json/urlencoded middlewares"
    );
    Object.defineProperty(exports, "json", {
      configurable: true,
      enumerable: true,
      get: createParserGetter("json")
    });
    Object.defineProperty(exports, "raw", {
      configurable: true,
      enumerable: true,
      get: createParserGetter("raw")
    });
    Object.defineProperty(exports, "text", {
      configurable: true,
      enumerable: true,
      get: createParserGetter("text")
    });
    Object.defineProperty(exports, "urlencoded", {
      configurable: true,
      enumerable: true,
      get: createParserGetter("urlencoded")
    });
    function bodyParser(options) {
      var opts = Object.create(options || null, {
        type: {
          configurable: true,
          enumerable: true,
          value: void 0,
          writable: true
        }
      });
      var _urlencoded = exports.urlencoded(opts);
      var _json = exports.json(opts);
      return /* @__PURE__ */ __name(function bodyParser2(req, res, next) {
        _json(req, res, function(err) {
          if (err) return next(err);
          _urlencoded(req, res, next);
        });
      }, "bodyParser");
    }
    __name(bodyParser, "bodyParser");
    function createParserGetter(name) {
      return /* @__PURE__ */ __name(function get() {
        return loadParser(name);
      }, "get");
    }
    __name(createParserGetter, "createParserGetter");
    function loadParser(parserName) {
      var parser = parsers[parserName];
      if (parser !== void 0) {
        return parser;
      }
      switch (parserName) {
        case "json":
          parser = require_json();
          break;
        case "raw":
          parser = require_raw();
          break;
        case "text":
          parser = require_text();
          break;
        case "urlencoded":
          parser = require_urlencoded();
          break;
      }
      return parsers[parserName] = parser;
    }
    __name(loadParser, "loadParser");
  }
});

// node_modules/merge-descriptors/index.js
var require_merge_descriptors = __commonJS({
  "node_modules/merge-descriptors/index.js"(exports, module) {
    "use strict";
    module.exports = merge;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function merge(dest, src, redefine) {
      if (!dest) {
        throw new TypeError("argument dest is required");
      }
      if (!src) {
        throw new TypeError("argument src is required");
      }
      if (redefine === void 0) {
        redefine = true;
      }
      Object.getOwnPropertyNames(src).forEach(/* @__PURE__ */ __name(function forEachOwnPropertyName(name) {
        if (!redefine && hasOwnProperty.call(dest, name)) {
          return;
        }
        var descriptor = Object.getOwnPropertyDescriptor(src, name);
        Object.defineProperty(dest, name, descriptor);
      }, "forEachOwnPropertyName"));
      return dest;
    }
    __name(merge, "merge");
  }
});

// node_modules/encodeurl/index.js
var require_encodeurl = __commonJS({
  "node_modules/encodeurl/index.js"(exports, module) {
    "use strict";
    module.exports = encodeUrl;
    var ENCODE_CHARS_REGEXP = /(?:[^\x21\x23-\x3B\x3D\x3F-\x5F\x61-\x7A\x7C\x7E]|%(?:[^0-9A-Fa-f]|[0-9A-Fa-f][^0-9A-Fa-f]|$))+/g;
    var UNMATCHED_SURROGATE_PAIR_REGEXP = /(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]|[\uD800-\uDBFF]([^\uDC00-\uDFFF]|$)/g;
    var UNMATCHED_SURROGATE_PAIR_REPLACE = "$1\uFFFD$2";
    function encodeUrl(url) {
      return String(url).replace(UNMATCHED_SURROGATE_PAIR_REGEXP, UNMATCHED_SURROGATE_PAIR_REPLACE).replace(ENCODE_CHARS_REGEXP, encodeURI);
    }
    __name(encodeUrl, "encodeUrl");
  }
});

// node_modules/escape-html/index.js
var require_escape_html = __commonJS({
  "node_modules/escape-html/index.js"(exports, module) {
    "use strict";
    var matchHtmlRegExp = /["'&<>]/;
    module.exports = escapeHtml;
    function escapeHtml(string) {
      var str = "" + string;
      var match = matchHtmlRegExp.exec(str);
      if (!match) {
        return str;
      }
      var escape2;
      var html = "";
      var index = 0;
      var lastIndex = 0;
      for (index = match.index; index < str.length; index++) {
        switch (str.charCodeAt(index)) {
          case 34:
            escape2 = "&quot;";
            break;
          case 38:
            escape2 = "&amp;";
            break;
          case 39:
            escape2 = "&#39;";
            break;
          case 60:
            escape2 = "&lt;";
            break;
          case 62:
            escape2 = "&gt;";
            break;
          default:
            continue;
        }
        if (lastIndex !== index) {
          html += str.substring(lastIndex, index);
        }
        lastIndex = index + 1;
        html += escape2;
      }
      return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
    }
    __name(escapeHtml, "escapeHtml");
  }
});

// node-built-in-modules:url
import libDefault11 from "url";
var require_url = __commonJS({
  "node-built-in-modules:url"(exports, module) {
    module.exports = libDefault11;
  }
});

// node_modules/parseurl/index.js
var require_parseurl = __commonJS({
  "node_modules/parseurl/index.js"(exports, module) {
    "use strict";
    var url = require_url();
    var parse = url.parse;
    var Url = url.Url;
    module.exports = parseurl;
    module.exports.original = originalurl;
    function parseurl(req) {
      var url2 = req.url;
      if (url2 === void 0) {
        return void 0;
      }
      var parsed = req._parsedUrl;
      if (fresh(url2, parsed)) {
        return parsed;
      }
      parsed = fastparse(url2);
      parsed._raw = url2;
      return req._parsedUrl = parsed;
    }
    __name(parseurl, "parseurl");
    function originalurl(req) {
      var url2 = req.originalUrl;
      if (typeof url2 !== "string") {
        return parseurl(req);
      }
      var parsed = req._parsedOriginalUrl;
      if (fresh(url2, parsed)) {
        return parsed;
      }
      parsed = fastparse(url2);
      parsed._raw = url2;
      return req._parsedOriginalUrl = parsed;
    }
    __name(originalurl, "originalurl");
    function fastparse(str) {
      if (typeof str !== "string" || str.charCodeAt(0) !== 47) {
        return parse(str);
      }
      var pathname = str;
      var query = null;
      var search = null;
      for (var i = 1; i < str.length; i++) {
        switch (str.charCodeAt(i)) {
          case 63:
            if (search === null) {
              pathname = str.substring(0, i);
              query = str.substring(i + 1);
              search = str.substring(i);
            }
            break;
          case 9:
          /* \t */
          case 10:
          /* \n */
          case 12:
          /* \f */
          case 13:
          /* \r */
          case 32:
          /*    */
          case 35:
          /* #  */
          case 160:
          case 65279:
            return parse(str);
        }
      }
      var url2 = Url !== void 0 ? new Url() : {};
      url2.path = str;
      url2.href = str;
      url2.pathname = pathname;
      if (search !== null) {
        url2.query = query;
        url2.search = search;
      }
      return url2;
    }
    __name(fastparse, "fastparse");
    function fresh(url2, parsedUrl) {
      return typeof parsedUrl === "object" && parsedUrl !== null && (Url === void 0 || parsedUrl instanceof Url) && parsedUrl._raw === url2;
    }
    __name(fresh, "fresh");
  }
});

// node_modules/finalhandler/index.js
var require_finalhandler = __commonJS({
  "node_modules/finalhandler/index.js"(exports, module) {
    "use strict";
    var debug = require_src()("finalhandler");
    var encodeUrl = require_encodeurl();
    var escapeHtml = require_escape_html();
    var onFinished = require_on_finished();
    var parseUrl = require_parseurl();
    var statuses = require_statuses();
    var unpipe = require_unpipe();
    var DOUBLE_SPACE_REGEXP = /\x20{2}/g;
    var NEWLINE_REGEXP = /\n/g;
    var defer = typeof setImmediate === "function" ? setImmediate : function(fn) {
      process.nextTick(fn.bind.apply(fn, arguments));
    };
    var isFinished = onFinished.isFinished;
    function createHtmlDocument(message) {
      var body = escapeHtml(message).replace(NEWLINE_REGEXP, "<br>").replace(DOUBLE_SPACE_REGEXP, " &nbsp;");
      return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Error</title>\n</head>\n<body>\n<pre>' + body + "</pre>\n</body>\n</html>\n";
    }
    __name(createHtmlDocument, "createHtmlDocument");
    module.exports = finalhandler;
    function finalhandler(req, res, options) {
      var opts = options || {};
      var env = opts.env || "production";
      var onerror = opts.onerror;
      return function(err) {
        var headers;
        var msg;
        var status;
        if (!err && headersSent(res)) {
          debug("cannot 404 after headers sent");
          return;
        }
        if (err) {
          status = getErrorStatusCode(err);
          if (status === void 0) {
            status = getResponseStatusCode(res);
          } else {
            headers = getErrorHeaders(err);
          }
          msg = getErrorMessage(err, status, env);
        } else {
          status = 404;
          msg = "Cannot " + req.method + " " + encodeUrl(getResourceName(req));
        }
        debug("default %s", status);
        if (err && onerror) {
          defer(onerror, err, req, res);
        }
        if (headersSent(res)) {
          debug("cannot %d after headers sent", status);
          if (req.socket) {
            req.socket.destroy();
          }
          return;
        }
        send(req, res, status, headers, msg);
      };
    }
    __name(finalhandler, "finalhandler");
    function getErrorHeaders(err) {
      if (!err.headers || typeof err.headers !== "object") {
        return void 0;
      }
      var headers = /* @__PURE__ */ Object.create(null);
      var keys = Object.keys(err.headers);
      for (var i = 0; i < keys.length; i++) {
        var key2 = keys[i];
        headers[key2] = err.headers[key2];
      }
      return headers;
    }
    __name(getErrorHeaders, "getErrorHeaders");
    function getErrorMessage(err, status, env) {
      var msg;
      if (env !== "production") {
        msg = err.stack;
        if (!msg && typeof err.toString === "function") {
          msg = err.toString();
        }
      }
      return msg || statuses.message[status];
    }
    __name(getErrorMessage, "getErrorMessage");
    function getErrorStatusCode(err) {
      if (typeof err.status === "number" && err.status >= 400 && err.status < 600) {
        return err.status;
      }
      if (typeof err.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 600) {
        return err.statusCode;
      }
      return void 0;
    }
    __name(getErrorStatusCode, "getErrorStatusCode");
    function getResourceName(req) {
      try {
        return parseUrl.original(req).pathname;
      } catch (e) {
        return "resource";
      }
    }
    __name(getResourceName, "getResourceName");
    function getResponseStatusCode(res) {
      var status = res.statusCode;
      if (typeof status !== "number" || status < 400 || status > 599) {
        status = 500;
      }
      return status;
    }
    __name(getResponseStatusCode, "getResponseStatusCode");
    function headersSent(res) {
      return typeof res.headersSent !== "boolean" ? Boolean(res._header) : res.headersSent;
    }
    __name(headersSent, "headersSent");
    function send(req, res, status, headers, message) {
      function write() {
        var body = createHtmlDocument(message);
        res.statusCode = status;
        if (req.httpVersionMajor < 2) {
          res.statusMessage = statuses.message[status];
        }
        res.removeHeader("Content-Encoding");
        res.removeHeader("Content-Language");
        res.removeHeader("Content-Range");
        setHeaders(res, headers);
        res.setHeader("Content-Security-Policy", "default-src 'none'");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Content-Length", Buffer.byteLength(body, "utf8"));
        if (req.method === "HEAD") {
          res.end();
          return;
        }
        res.end(body, "utf8");
      }
      __name(write, "write");
      if (isFinished(req)) {
        write();
        return;
      }
      unpipe(req);
      onFinished(req, write);
      req.resume();
    }
    __name(send, "send");
    function setHeaders(res, headers) {
      if (!headers) {
        return;
      }
      var keys = Object.keys(headers);
      for (var i = 0; i < keys.length; i++) {
        var key2 = keys[i];
        res.setHeader(key2, headers[key2]);
      }
    }
    __name(setHeaders, "setHeaders");
  }
});

// node_modules/array-flatten/array-flatten.js
var require_array_flatten = __commonJS({
  "node_modules/array-flatten/array-flatten.js"(exports, module) {
    "use strict";
    module.exports = arrayFlatten;
    function flattenWithDepth(array, result, depth) {
      for (var i = 0; i < array.length; i++) {
        var value = array[i];
        if (depth > 0 && Array.isArray(value)) {
          flattenWithDepth(value, result, depth - 1);
        } else {
          result.push(value);
        }
      }
      return result;
    }
    __name(flattenWithDepth, "flattenWithDepth");
    function flattenForever(array, result) {
      for (var i = 0; i < array.length; i++) {
        var value = array[i];
        if (Array.isArray(value)) {
          flattenForever(value, result);
        } else {
          result.push(value);
        }
      }
      return result;
    }
    __name(flattenForever, "flattenForever");
    function arrayFlatten(array, depth) {
      if (depth == null) {
        return flattenForever(array, []);
      }
      return flattenWithDepth(array, [], depth);
    }
    __name(arrayFlatten, "arrayFlatten");
  }
});

// node_modules/path-to-regexp/index.js
var require_path_to_regexp = __commonJS({
  "node_modules/path-to-regexp/index.js"(exports, module) {
    module.exports = pathToRegexp;
    var MATCHING_GROUP_REGEXP = /\\.|\((?:\?<(.*?)>)?(?!\?)/g;
    function pathToRegexp(path, keys, options) {
      options = options || {};
      keys = keys || [];
      var strict = options.strict;
      var end = options.end !== false;
      var flags = options.sensitive ? "" : "i";
      var lookahead = options.lookahead !== false;
      var extraOffset = 0;
      var keysOffset = keys.length;
      var i = 0;
      var name = 0;
      var pos = 0;
      var backtrack = "";
      var m;
      if (path instanceof RegExp) {
        while (m = MATCHING_GROUP_REGEXP.exec(path.source)) {
          if (m[0][0] === "\\") continue;
          keys.push({
            name: m[1] || name++,
            optional: false,
            offset: m.index
          });
        }
        return path;
      }
      if (Array.isArray(path)) {
        path = path.map(function(value) {
          return pathToRegexp(value, keys, options).source;
        });
        return new RegExp(path.join("|"), flags);
      }
      if (typeof path !== "string") {
        throw new TypeError("path must be a string, array of strings, or regular expression");
      }
      path = path.replace(
        /\\.|(\/)?(\.)?:(\w+)(\(.*?\))?(\*)?(\?)?|[.*]|\/\(/g,
        function(match, slash, format, key2, capture, star, optional, offset) {
          if (match[0] === "\\") {
            backtrack += match;
            pos += 2;
            return match;
          }
          if (match === ".") {
            backtrack += "\\.";
            extraOffset += 1;
            pos += 1;
            return "\\.";
          }
          if (slash || format) {
            backtrack = "";
          } else {
            backtrack += path.slice(pos, offset);
          }
          pos = offset + match.length;
          if (match === "*") {
            backtrack = "";
            extraOffset += 3;
            return "(.*)";
          }
          if (match === "/(") {
            backtrack += "/";
            extraOffset += 2;
            return "/(?:";
          }
          slash = slash || "";
          format = format ? "\\." : "";
          optional = optional || "";
          capture = capture ? capture.replace(/\\.|\*/, function(m2) {
            return m2 === "*" ? "(.*)" : m2;
          }) : backtrack ? "((?:(?!/|" + backtrack + ").)+?)" : "([^/" + format + "]+?)";
          keys.push({
            name: key2,
            optional: !!optional,
            offset: offset + extraOffset
          });
          var result = "(?:" + format + slash + capture + (star ? "((?:[/" + format + "].+?)?)" : "") + ")" + optional;
          backtrack = "";
          extraOffset += result.length - match.length;
          return result;
        }
      );
      while (m = MATCHING_GROUP_REGEXP.exec(path)) {
        if (m[0][0] === "\\") continue;
        if (keysOffset + i === keys.length || keys[keysOffset + i].offset > m.index) {
          keys.splice(keysOffset + i, 0, {
            name: name++,
            // Unnamed matching groups must be consistently linear.
            optional: false,
            offset: m.index
          });
        }
        i++;
      }
      path += strict ? "" : path[path.length - 1] === "/" ? "?" : "/?";
      if (end) {
        path += "$";
      } else if (path[path.length - 1] !== "/") {
        path += lookahead ? "(?=/|$)" : "(?:/|$)";
      }
      return new RegExp("^" + path, flags);
    }
    __name(pathToRegexp, "pathToRegexp");
  }
});

// node_modules/express/lib/router/layer.js
var require_layer = __commonJS({
  "node_modules/express/lib/router/layer.js"(exports, module) {
    "use strict";
    var pathRegexp = require_path_to_regexp();
    var debug = require_src()("express:router:layer");
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    module.exports = Layer;
    function Layer(path, options, fn) {
      if (!(this instanceof Layer)) {
        return new Layer(path, options, fn);
      }
      debug("new %o", path);
      var opts = options || {};
      this.handle = fn;
      this.name = fn.name || "<anonymous>";
      this.params = void 0;
      this.path = void 0;
      this.regexp = pathRegexp(path, this.keys = [], opts);
      this.regexp.fast_star = path === "*";
      this.regexp.fast_slash = path === "/" && opts.end === false;
    }
    __name(Layer, "Layer");
    Layer.prototype.handle_error = /* @__PURE__ */ __name(function handle_error(error, req, res, next) {
      var fn = this.handle;
      if (fn.length !== 4) {
        return next(error);
      }
      try {
        fn(error, req, res, next);
      } catch (err) {
        next(err);
      }
    }, "handle_error");
    Layer.prototype.handle_request = /* @__PURE__ */ __name(function handle(req, res, next) {
      var fn = this.handle;
      if (fn.length > 3) {
        return next();
      }
      try {
        fn(req, res, next);
      } catch (err) {
        next(err);
      }
    }, "handle");
    Layer.prototype.match = /* @__PURE__ */ __name(function match(path) {
      var match2;
      if (path != null) {
        if (this.regexp.fast_slash) {
          this.params = {};
          this.path = "";
          return true;
        }
        if (this.regexp.fast_star) {
          this.params = { "0": decode_param(path) };
          this.path = path;
          return true;
        }
        match2 = this.regexp.exec(path);
      }
      if (!match2) {
        this.params = void 0;
        this.path = void 0;
        return false;
      }
      this.params = {};
      this.path = match2[0];
      var keys = this.keys;
      var params = this.params;
      for (var i = 1; i < match2.length; i++) {
        var key2 = keys[i - 1];
        var prop = key2.name;
        var val = decode_param(match2[i]);
        if (val !== void 0 || !hasOwnProperty.call(params, prop)) {
          params[prop] = val;
        }
      }
      return true;
    }, "match");
    function decode_param(val) {
      if (typeof val !== "string" || val.length === 0) {
        return val;
      }
      try {
        return decodeURIComponent(val);
      } catch (err) {
        if (err instanceof URIError) {
          err.message = "Failed to decode param '" + val + "'";
          err.status = err.statusCode = 400;
        }
        throw err;
      }
    }
    __name(decode_param, "decode_param");
  }
});

// node-built-in-modules:http
import libDefault12 from "http";
var require_http = __commonJS({
  "node-built-in-modules:http"(exports, module) {
    module.exports = libDefault12;
  }
});

// node_modules/methods/index.js
var require_methods = __commonJS({
  "node_modules/methods/index.js"(exports, module) {
    "use strict";
    var http = require_http();
    module.exports = getCurrentNodeMethods() || getBasicNodeMethods();
    function getCurrentNodeMethods() {
      return http.METHODS && http.METHODS.map(/* @__PURE__ */ __name(function lowerCaseMethod(method) {
        return method.toLowerCase();
      }, "lowerCaseMethod"));
    }
    __name(getCurrentNodeMethods, "getCurrentNodeMethods");
    function getBasicNodeMethods() {
      return [
        "get",
        "post",
        "put",
        "head",
        "delete",
        "options",
        "trace",
        "copy",
        "lock",
        "mkcol",
        "move",
        "purge",
        "propfind",
        "proppatch",
        "unlock",
        "report",
        "mkactivity",
        "checkout",
        "merge",
        "m-search",
        "notify",
        "subscribe",
        "unsubscribe",
        "patch",
        "search",
        "connect"
      ];
    }
    __name(getBasicNodeMethods, "getBasicNodeMethods");
  }
});

// node_modules/express/lib/router/route.js
var require_route = __commonJS({
  "node_modules/express/lib/router/route.js"(exports, module) {
    "use strict";
    var debug = require_src()("express:router:route");
    var flatten = require_array_flatten();
    var Layer = require_layer();
    var methods = require_methods();
    var slice = Array.prototype.slice;
    var toString = Object.prototype.toString;
    module.exports = Route;
    function Route(path) {
      this.path = path;
      this.stack = [];
      debug("new %o", path);
      this.methods = {};
    }
    __name(Route, "Route");
    Route.prototype._handles_method = /* @__PURE__ */ __name(function _handles_method(method) {
      if (this.methods._all) {
        return true;
      }
      var name = typeof method === "string" ? method.toLowerCase() : method;
      if (name === "head" && !this.methods["head"]) {
        name = "get";
      }
      return Boolean(this.methods[name]);
    }, "_handles_method");
    Route.prototype._options = /* @__PURE__ */ __name(function _options() {
      var methods2 = Object.keys(this.methods);
      if (this.methods.get && !this.methods.head) {
        methods2.push("head");
      }
      for (var i = 0; i < methods2.length; i++) {
        methods2[i] = methods2[i].toUpperCase();
      }
      return methods2;
    }, "_options");
    Route.prototype.dispatch = /* @__PURE__ */ __name(function dispatch(req, res, done) {
      var idx = 0;
      var stack = this.stack;
      var sync = 0;
      if (stack.length === 0) {
        return done();
      }
      var method = typeof req.method === "string" ? req.method.toLowerCase() : req.method;
      if (method === "head" && !this.methods["head"]) {
        method = "get";
      }
      req.route = this;
      next();
      function next(err) {
        if (err && err === "route") {
          return done();
        }
        if (err && err === "router") {
          return done(err);
        }
        if (++sync > 100) {
          return setImmediate(next, err);
        }
        var layer = stack[idx++];
        if (!layer) {
          return done(err);
        }
        if (layer.method && layer.method !== method) {
          next(err);
        } else if (err) {
          layer.handle_error(err, req, res, next);
        } else {
          layer.handle_request(req, res, next);
        }
        sync = 0;
      }
      __name(next, "next");
    }, "dispatch");
    Route.prototype.all = /* @__PURE__ */ __name(function all() {
      var handles = flatten(slice.call(arguments));
      for (var i = 0; i < handles.length; i++) {
        var handle = handles[i];
        if (typeof handle !== "function") {
          var type = toString.call(handle);
          var msg = "Route.all() requires a callback function but got a " + type;
          throw new TypeError(msg);
        }
        var layer = Layer("/", {}, handle);
        layer.method = void 0;
        this.methods._all = true;
        this.stack.push(layer);
      }
      return this;
    }, "all");
    methods.forEach(function(method) {
      Route.prototype[method] = function() {
        var handles = flatten(slice.call(arguments));
        for (var i = 0; i < handles.length; i++) {
          var handle = handles[i];
          if (typeof handle !== "function") {
            var type = toString.call(handle);
            var msg = "Route." + method + "() requires a callback function but got a " + type;
            throw new Error(msg);
          }
          debug("%s %o", method, this.path);
          var layer = Layer("/", {}, handle);
          layer.method = method;
          this.methods[method] = true;
          this.stack.push(layer);
        }
        return this;
      };
    });
  }
});

// node_modules/utils-merge/index.js
var require_utils_merge = __commonJS({
  "node_modules/utils-merge/index.js"(exports, module) {
    exports = module.exports = function(a, b) {
      if (a && b) {
        for (var key2 in b) {
          a[key2] = b[key2];
        }
      }
      return a;
    };
  }
});

// node_modules/express/lib/router/index.js
var require_router = __commonJS({
  "node_modules/express/lib/router/index.js"(exports, module) {
    "use strict";
    var Route = require_route();
    var Layer = require_layer();
    var methods = require_methods();
    var mixin = require_utils_merge();
    var debug = require_src()("express:router");
    var deprecate = require_browser()("express");
    var flatten = require_array_flatten();
    var parseUrl = require_parseurl();
    var setPrototypeOf = require_setprototypeof();
    var objectRegExp = /^\[object (\S+)\]$/;
    var slice = Array.prototype.slice;
    var toString = Object.prototype.toString;
    var proto = module.exports = function(options) {
      var opts = options || {};
      function router(req, res, next) {
        router.handle(req, res, next);
      }
      __name(router, "router");
      setPrototypeOf(router, proto);
      router.params = {};
      router._params = [];
      router.caseSensitive = opts.caseSensitive;
      router.mergeParams = opts.mergeParams;
      router.strict = opts.strict;
      router.stack = [];
      return router;
    };
    proto.param = /* @__PURE__ */ __name(function param(name, fn) {
      if (typeof name === "function") {
        deprecate("router.param(fn): Refactor to use path params");
        this._params.push(name);
        return;
      }
      var params = this._params;
      var len = params.length;
      var ret;
      if (name[0] === ":") {
        deprecate("router.param(" + JSON.stringify(name) + ", fn): Use router.param(" + JSON.stringify(name.slice(1)) + ", fn) instead");
        name = name.slice(1);
      }
      for (var i = 0; i < len; ++i) {
        if (ret = params[i](name, fn)) {
          fn = ret;
        }
      }
      if ("function" !== typeof fn) {
        throw new Error("invalid param() call for " + name + ", got " + fn);
      }
      (this.params[name] = this.params[name] || []).push(fn);
      return this;
    }, "param");
    proto.handle = /* @__PURE__ */ __name(function handle(req, res, out) {
      var self = this;
      debug("dispatching %s %s", req.method, req.url);
      var idx = 0;
      var protohost = getProtohost(req.url) || "";
      var removed = "";
      var slashAdded = false;
      var sync = 0;
      var paramcalled = {};
      var options = [];
      var stack = self.stack;
      var parentParams = req.params;
      var parentUrl = req.baseUrl || "";
      var done = restore(out, req, "baseUrl", "next", "params");
      req.next = next;
      if (req.method === "OPTIONS") {
        done = wrap(done, function(old, err) {
          if (err || options.length === 0) return old(err);
          sendOptionsResponse(res, options, old);
        });
      }
      req.baseUrl = parentUrl;
      req.originalUrl = req.originalUrl || req.url;
      next();
      function next(err) {
        var layerError = err === "route" ? null : err;
        if (slashAdded) {
          req.url = req.url.slice(1);
          slashAdded = false;
        }
        if (removed.length !== 0) {
          req.baseUrl = parentUrl;
          req.url = protohost + removed + req.url.slice(protohost.length);
          removed = "";
        }
        if (layerError === "router") {
          setImmediate(done, null);
          return;
        }
        if (idx >= stack.length) {
          setImmediate(done, layerError);
          return;
        }
        if (++sync > 100) {
          return setImmediate(next, err);
        }
        var path = getPathname(req);
        if (path == null) {
          return done(layerError);
        }
        var layer;
        var match;
        var route;
        while (match !== true && idx < stack.length) {
          layer = stack[idx++];
          match = matchLayer(layer, path);
          route = layer.route;
          if (typeof match !== "boolean") {
            layerError = layerError || match;
          }
          if (match !== true) {
            continue;
          }
          if (!route) {
            continue;
          }
          if (layerError) {
            match = false;
            continue;
          }
          var method = req.method;
          var has_method = route._handles_method(method);
          if (!has_method && method === "OPTIONS") {
            appendMethods(options, route._options());
          }
          if (!has_method && method !== "HEAD") {
            match = false;
          }
        }
        if (match !== true) {
          return done(layerError);
        }
        if (route) {
          req.route = route;
        }
        req.params = self.mergeParams ? mergeParams(layer.params, parentParams) : layer.params;
        var layerPath = layer.path;
        self.process_params(layer, paramcalled, req, res, function(err2) {
          if (err2) {
            next(layerError || err2);
          } else if (route) {
            layer.handle_request(req, res, next);
          } else {
            trim_prefix(layer, layerError, layerPath, path);
          }
          sync = 0;
        });
      }
      __name(next, "next");
      function trim_prefix(layer, layerError, layerPath, path) {
        if (layerPath.length !== 0) {
          if (layerPath !== path.slice(0, layerPath.length)) {
            next(layerError);
            return;
          }
          var c = path[layerPath.length];
          if (c && c !== "/" && c !== ".") return next(layerError);
          debug("trim prefix (%s) from url %s", layerPath, req.url);
          removed = layerPath;
          req.url = protohost + req.url.slice(protohost.length + removed.length);
          if (!protohost && req.url[0] !== "/") {
            req.url = "/" + req.url;
            slashAdded = true;
          }
          req.baseUrl = parentUrl + (removed[removed.length - 1] === "/" ? removed.substring(0, removed.length - 1) : removed);
        }
        debug("%s %s : %s", layer.name, layerPath, req.originalUrl);
        if (layerError) {
          layer.handle_error(layerError, req, res, next);
        } else {
          layer.handle_request(req, res, next);
        }
      }
      __name(trim_prefix, "trim_prefix");
    }, "handle");
    proto.process_params = /* @__PURE__ */ __name(function process_params(layer, called, req, res, done) {
      var params = this.params;
      var keys = layer.keys;
      if (!keys || keys.length === 0) {
        return done();
      }
      var i = 0;
      var name;
      var paramIndex = 0;
      var key2;
      var paramVal;
      var paramCallbacks;
      var paramCalled;
      function param(err) {
        if (err) {
          return done(err);
        }
        if (i >= keys.length) {
          return done();
        }
        paramIndex = 0;
        key2 = keys[i++];
        name = key2.name;
        paramVal = req.params[name];
        paramCallbacks = params[name];
        paramCalled = called[name];
        if (paramVal === void 0 || !paramCallbacks) {
          return param();
        }
        if (paramCalled && (paramCalled.match === paramVal || paramCalled.error && paramCalled.error !== "route")) {
          req.params[name] = paramCalled.value;
          return param(paramCalled.error);
        }
        called[name] = paramCalled = {
          error: null,
          match: paramVal,
          value: paramVal
        };
        paramCallback();
      }
      __name(param, "param");
      function paramCallback(err) {
        var fn = paramCallbacks[paramIndex++];
        paramCalled.value = req.params[key2.name];
        if (err) {
          paramCalled.error = err;
          param(err);
          return;
        }
        if (!fn) return param();
        try {
          fn(req, res, paramCallback, paramVal, key2.name);
        } catch (e) {
          paramCallback(e);
        }
      }
      __name(paramCallback, "paramCallback");
      param();
    }, "process_params");
    proto.use = /* @__PURE__ */ __name(function use(fn) {
      var offset = 0;
      var path = "/";
      if (typeof fn !== "function") {
        var arg = fn;
        while (Array.isArray(arg) && arg.length !== 0) {
          arg = arg[0];
        }
        if (typeof arg !== "function") {
          offset = 1;
          path = fn;
        }
      }
      var callbacks = flatten(slice.call(arguments, offset));
      if (callbacks.length === 0) {
        throw new TypeError("Router.use() requires a middleware function");
      }
      for (var i = 0; i < callbacks.length; i++) {
        var fn = callbacks[i];
        if (typeof fn !== "function") {
          throw new TypeError("Router.use() requires a middleware function but got a " + gettype(fn));
        }
        debug("use %o %s", path, fn.name || "<anonymous>");
        var layer = new Layer(path, {
          sensitive: this.caseSensitive,
          strict: false,
          end: false
        }, fn);
        layer.route = void 0;
        this.stack.push(layer);
      }
      return this;
    }, "use");
    proto.route = /* @__PURE__ */ __name(function route(path) {
      var route2 = new Route(path);
      var layer = new Layer(path, {
        sensitive: this.caseSensitive,
        strict: this.strict,
        end: true
      }, route2.dispatch.bind(route2));
      layer.route = route2;
      this.stack.push(layer);
      return route2;
    }, "route");
    methods.concat("all").forEach(function(method) {
      proto[method] = function(path) {
        var route = this.route(path);
        route[method].apply(route, slice.call(arguments, 1));
        return this;
      };
    });
    function appendMethods(list, addition) {
      for (var i = 0; i < addition.length; i++) {
        var method = addition[i];
        if (list.indexOf(method) === -1) {
          list.push(method);
        }
      }
    }
    __name(appendMethods, "appendMethods");
    function getPathname(req) {
      try {
        return parseUrl(req).pathname;
      } catch (err) {
        return void 0;
      }
    }
    __name(getPathname, "getPathname");
    function getProtohost(url) {
      if (typeof url !== "string" || url.length === 0 || url[0] === "/") {
        return void 0;
      }
      var searchIndex = url.indexOf("?");
      var pathLength = searchIndex !== -1 ? searchIndex : url.length;
      var fqdnIndex = url.slice(0, pathLength).indexOf("://");
      return fqdnIndex !== -1 ? url.substring(0, url.indexOf("/", 3 + fqdnIndex)) : void 0;
    }
    __name(getProtohost, "getProtohost");
    function gettype(obj) {
      var type = typeof obj;
      if (type !== "object") {
        return type;
      }
      return toString.call(obj).replace(objectRegExp, "$1");
    }
    __name(gettype, "gettype");
    function matchLayer(layer, path) {
      try {
        return layer.match(path);
      } catch (err) {
        return err;
      }
    }
    __name(matchLayer, "matchLayer");
    function mergeParams(params, parent) {
      if (typeof parent !== "object" || !parent) {
        return params;
      }
      var obj = mixin({}, parent);
      if (!(0 in params) || !(0 in parent)) {
        return mixin(obj, params);
      }
      var i = 0;
      var o = 0;
      while (i in params) {
        i++;
      }
      while (o in parent) {
        o++;
      }
      for (i--; i >= 0; i--) {
        params[i + o] = params[i];
        if (i < o) {
          delete params[i];
        }
      }
      return mixin(obj, params);
    }
    __name(mergeParams, "mergeParams");
    function restore(fn, obj) {
      var props = new Array(arguments.length - 2);
      var vals = new Array(arguments.length - 2);
      for (var i = 0; i < props.length; i++) {
        props[i] = arguments[i + 2];
        vals[i] = obj[props[i]];
      }
      return function() {
        for (var i2 = 0; i2 < props.length; i2++) {
          obj[props[i2]] = vals[i2];
        }
        return fn.apply(this, arguments);
      };
    }
    __name(restore, "restore");
    function sendOptionsResponse(res, options, next) {
      try {
        var body = options.join(",");
        res.set("Allow", body);
        res.send(body);
      } catch (err) {
        next(err);
      }
    }
    __name(sendOptionsResponse, "sendOptionsResponse");
    function wrap(old, fn) {
      return /* @__PURE__ */ __name(function proxy() {
        var args = new Array(arguments.length + 1);
        args[0] = old;
        for (var i = 0, len = arguments.length; i < len; i++) {
          args[i + 1] = arguments[i];
        }
        fn.apply(this, args);
      }, "proxy");
    }
    __name(wrap, "wrap");
  }
});

// node_modules/express/lib/middleware/init.js
var require_init = __commonJS({
  "node_modules/express/lib/middleware/init.js"(exports) {
    "use strict";
    var setPrototypeOf = require_setprototypeof();
    exports.init = function(app) {
      return /* @__PURE__ */ __name(function expressInit(req, res, next) {
        if (app.enabled("x-powered-by")) res.setHeader("X-Powered-By", "Express");
        req.res = res;
        res.req = req;
        req.next = next;
        setPrototypeOf(req, app.request);
        setPrototypeOf(res, app.response);
        res.locals = res.locals || /* @__PURE__ */ Object.create(null);
        next();
      }, "expressInit");
    };
  }
});

// node_modules/express/lib/middleware/query.js
var require_query = __commonJS({
  "node_modules/express/lib/middleware/query.js"(exports, module) {
    "use strict";
    var merge = require_utils_merge();
    var parseUrl = require_parseurl();
    var qs = require_lib();
    module.exports = /* @__PURE__ */ __name(function query(options) {
      var opts = merge({}, options);
      var queryparse = qs.parse;
      if (typeof options === "function") {
        queryparse = options;
        opts = void 0;
      }
      if (opts !== void 0 && opts.allowPrototypes === void 0) {
        opts.allowPrototypes = true;
      }
      return /* @__PURE__ */ __name(function query2(req, res, next) {
        if (!req.query) {
          var val = parseUrl(req).query;
          req.query = queryparse(val, opts);
        }
        next();
      }, "query");
    }, "query");
  }
});

// node_modules/express/lib/view.js
var require_view = __commonJS({
  "node_modules/express/lib/view.js"(exports, module) {
    "use strict";
    var debug = require_src()("express:view");
    var path = require_path();
    var fs = require_fs();
    var dirname = path.dirname;
    var basename = path.basename;
    var extname = path.extname;
    var join = path.join;
    var resolve = path.resolve;
    module.exports = View;
    function View(name, options) {
      var opts = options || {};
      this.defaultEngine = opts.defaultEngine;
      this.ext = extname(name);
      this.name = name;
      this.root = opts.root;
      if (!this.ext && !this.defaultEngine) {
        throw new Error("No default engine was specified and no extension was provided.");
      }
      var fileName = name;
      if (!this.ext) {
        this.ext = this.defaultEngine[0] !== "." ? "." + this.defaultEngine : this.defaultEngine;
        fileName += this.ext;
      }
      if (!opts.engines[this.ext]) {
        var mod = this.ext.slice(1);
        debug('require "%s"', mod);
        var fn = __require(mod).__express;
        if (typeof fn !== "function") {
          throw new Error('Module "' + mod + '" does not provide a view engine.');
        }
        opts.engines[this.ext] = fn;
      }
      this.engine = opts.engines[this.ext];
      this.path = this.lookup(fileName);
    }
    __name(View, "View");
    View.prototype.lookup = /* @__PURE__ */ __name(function lookup(name) {
      var path2;
      var roots = [].concat(this.root);
      debug('lookup "%s"', name);
      for (var i = 0; i < roots.length && !path2; i++) {
        var root = roots[i];
        var loc = resolve(root, name);
        var dir = dirname(loc);
        var file = basename(loc);
        path2 = this.resolve(dir, file);
      }
      return path2;
    }, "lookup");
    View.prototype.render = /* @__PURE__ */ __name(function render(options, callback) {
      debug('render "%s"', this.path);
      this.engine(this.path, options, callback);
    }, "render");
    View.prototype.resolve = /* @__PURE__ */ __name(function resolve2(dir, file) {
      var ext = this.ext;
      var path2 = join(dir, file);
      var stat = tryStat(path2);
      if (stat && stat.isFile()) {
        return path2;
      }
      path2 = join(dir, basename(file, ext), "index" + ext);
      stat = tryStat(path2);
      if (stat && stat.isFile()) {
        return path2;
      }
    }, "resolve");
    function tryStat(path2) {
      debug('stat "%s"', path2);
      try {
        return fs.statSync(path2);
      } catch (e) {
        return void 0;
      }
    }
    __name(tryStat, "tryStat");
  }
});

// node-built-in-modules:buffer
import libDefault13 from "buffer";
var require_buffer = __commonJS({
  "node-built-in-modules:buffer"(exports, module) {
    module.exports = libDefault13;
  }
});

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/safe-buffer/index.js"(exports, module) {
    var buffer = require_buffer();
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key2 in src) {
        dst[key2] = src[key2];
      }
    }
    __name(copyProps, "copyProps");
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module.exports = buffer;
    } else {
      copyProps(buffer, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    __name(SafeBuffer, "SafeBuffer");
    SafeBuffer.prototype = Object.create(Buffer2.prototype);
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/content-disposition/index.js
var require_content_disposition = __commonJS({
  "node_modules/content-disposition/index.js"(exports, module) {
    "use strict";
    module.exports = contentDisposition;
    module.exports.parse = parse;
    var basename = require_path().basename;
    var Buffer2 = require_safe_buffer().Buffer;
    var ENCODE_URL_ATTR_CHAR_REGEXP = /[\x00-\x20"'()*,/:;<=>?@[\\\]{}\x7f]/g;
    var HEX_ESCAPE_REGEXP = /%[0-9A-Fa-f]{2}/;
    var HEX_ESCAPE_REPLACE_REGEXP = /%([0-9A-Fa-f]{2})/g;
    var NON_LATIN1_REGEXP = /[^\x20-\x7e\xa0-\xff]/g;
    var QESC_REGEXP = /\\([\u0000-\u007f])/g;
    var QUOTE_REGEXP = /([\\"])/g;
    var PARAM_REGEXP = /;[\x09\x20]*([!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*=[\x09\x20]*("(?:[\x20!\x23-\x5b\x5d-\x7e\x80-\xff]|\\[\x20-\x7e])*"|[!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*/g;
    var TEXT_REGEXP = /^[\x20-\x7e\x80-\xff]+$/;
    var TOKEN_REGEXP = /^[!#$%&'*+.0-9A-Z^_`a-z|~-]+$/;
    var EXT_VALUE_REGEXP = /^([A-Za-z0-9!#$%&+\-^_`{}~]+)'(?:[A-Za-z]{2,3}(?:-[A-Za-z]{3}){0,3}|[A-Za-z]{4,8}|)'((?:%[0-9A-Fa-f]{2}|[A-Za-z0-9!#$&+.^_`|~-])+)$/;
    var DISPOSITION_TYPE_REGEXP = /^([!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*(?:$|;)/;
    function contentDisposition(filename, options) {
      var opts = options || {};
      var type = opts.type || "attachment";
      var params = createparams(filename, opts.fallback);
      return format(new ContentDisposition(type, params));
    }
    __name(contentDisposition, "contentDisposition");
    function createparams(filename, fallback) {
      if (filename === void 0) {
        return;
      }
      var params = {};
      if (typeof filename !== "string") {
        throw new TypeError("filename must be a string");
      }
      if (fallback === void 0) {
        fallback = true;
      }
      if (typeof fallback !== "string" && typeof fallback !== "boolean") {
        throw new TypeError("fallback must be a string or boolean");
      }
      if (typeof fallback === "string" && NON_LATIN1_REGEXP.test(fallback)) {
        throw new TypeError("fallback must be ISO-8859-1 string");
      }
      var name = basename(filename);
      var isQuotedString = TEXT_REGEXP.test(name);
      var fallbackName = typeof fallback !== "string" ? fallback && getlatin1(name) : basename(fallback);
      var hasFallback = typeof fallbackName === "string" && fallbackName !== name;
      if (hasFallback || !isQuotedString || HEX_ESCAPE_REGEXP.test(name)) {
        params["filename*"] = name;
      }
      if (isQuotedString || hasFallback) {
        params.filename = hasFallback ? fallbackName : name;
      }
      return params;
    }
    __name(createparams, "createparams");
    function format(obj) {
      var parameters = obj.parameters;
      var type = obj.type;
      if (!type || typeof type !== "string" || !TOKEN_REGEXP.test(type)) {
        throw new TypeError("invalid type");
      }
      var string = String(type).toLowerCase();
      if (parameters && typeof parameters === "object") {
        var param;
        var params = Object.keys(parameters).sort();
        for (var i = 0; i < params.length; i++) {
          param = params[i];
          var val = param.substr(-1) === "*" ? ustring(parameters[param]) : qstring(parameters[param]);
          string += "; " + param + "=" + val;
        }
      }
      return string;
    }
    __name(format, "format");
    function decodefield(str) {
      var match = EXT_VALUE_REGEXP.exec(str);
      if (!match) {
        throw new TypeError("invalid extended field value");
      }
      var charset = match[1].toLowerCase();
      var encoded = match[2];
      var value;
      var binary = encoded.replace(HEX_ESCAPE_REPLACE_REGEXP, pdecode);
      switch (charset) {
        case "iso-8859-1":
          value = getlatin1(binary);
          break;
        case "utf-8":
          value = Buffer2.from(binary, "binary").toString("utf8");
          break;
        default:
          throw new TypeError("unsupported charset in extended field");
      }
      return value;
    }
    __name(decodefield, "decodefield");
    function getlatin1(val) {
      return String(val).replace(NON_LATIN1_REGEXP, "?");
    }
    __name(getlatin1, "getlatin1");
    function parse(string) {
      if (!string || typeof string !== "string") {
        throw new TypeError("argument string is required");
      }
      var match = DISPOSITION_TYPE_REGEXP.exec(string);
      if (!match) {
        throw new TypeError("invalid type format");
      }
      var index = match[0].length;
      var type = match[1].toLowerCase();
      var key2;
      var names = [];
      var params = {};
      var value;
      index = PARAM_REGEXP.lastIndex = match[0].substr(-1) === ";" ? index - 1 : index;
      while (match = PARAM_REGEXP.exec(string)) {
        if (match.index !== index) {
          throw new TypeError("invalid parameter format");
        }
        index += match[0].length;
        key2 = match[1].toLowerCase();
        value = match[2];
        if (names.indexOf(key2) !== -1) {
          throw new TypeError("invalid duplicate parameter");
        }
        names.push(key2);
        if (key2.indexOf("*") + 1 === key2.length) {
          key2 = key2.slice(0, -1);
          value = decodefield(value);
          params[key2] = value;
          continue;
        }
        if (typeof params[key2] === "string") {
          continue;
        }
        if (value[0] === '"') {
          value = value.substr(1, value.length - 2).replace(QESC_REGEXP, "$1");
        }
        params[key2] = value;
      }
      if (index !== -1 && index !== string.length) {
        throw new TypeError("invalid parameter format");
      }
      return new ContentDisposition(type, params);
    }
    __name(parse, "parse");
    function pdecode(str, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    }
    __name(pdecode, "pdecode");
    function pencode(char) {
      return "%" + String(char).charCodeAt(0).toString(16).toUpperCase();
    }
    __name(pencode, "pencode");
    function qstring(val) {
      var str = String(val);
      return '"' + str.replace(QUOTE_REGEXP, "\\$1") + '"';
    }
    __name(qstring, "qstring");
    function ustring(val) {
      var str = String(val);
      var encoded = encodeURIComponent(str).replace(ENCODE_URL_ATTR_CHAR_REGEXP, pencode);
      return "UTF-8''" + encoded;
    }
    __name(ustring, "ustring");
    function ContentDisposition(type, parameters) {
      this.type = type;
      this.parameters = parameters;
    }
    __name(ContentDisposition, "ContentDisposition");
  }
});

// node-built-in-modules:crypto
import libDefault14 from "crypto";
var require_crypto = __commonJS({
  "node-built-in-modules:crypto"(exports, module) {
    module.exports = libDefault14;
  }
});

// node_modules/etag/index.js
var require_etag = __commonJS({
  "node_modules/etag/index.js"(exports, module) {
    "use strict";
    module.exports = etag;
    var crypto = require_crypto();
    var Stats = require_fs().Stats;
    var toString = Object.prototype.toString;
    function entitytag(entity) {
      if (entity.length === 0) {
        return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';
      }
      var hash2 = crypto.createHash("sha1").update(entity, "utf8").digest("base64").substring(0, 27);
      var len = typeof entity === "string" ? Buffer.byteLength(entity, "utf8") : entity.length;
      return '"' + len.toString(16) + "-" + hash2 + '"';
    }
    __name(entitytag, "entitytag");
    function etag(entity, options) {
      if (entity == null) {
        throw new TypeError("argument entity is required");
      }
      var isStats = isstats(entity);
      var weak = options && typeof options.weak === "boolean" ? options.weak : isStats;
      if (!isStats && typeof entity !== "string" && !Buffer.isBuffer(entity)) {
        throw new TypeError("argument entity must be string, Buffer, or fs.Stats");
      }
      var tag = isStats ? stattag(entity) : entitytag(entity);
      return weak ? "W/" + tag : tag;
    }
    __name(etag, "etag");
    function isstats(obj) {
      if (typeof Stats === "function" && obj instanceof Stats) {
        return true;
      }
      return obj && typeof obj === "object" && "ctime" in obj && toString.call(obj.ctime) === "[object Date]" && "mtime" in obj && toString.call(obj.mtime) === "[object Date]" && "ino" in obj && typeof obj.ino === "number" && "size" in obj && typeof obj.size === "number";
    }
    __name(isstats, "isstats");
    function stattag(stat) {
      var mtime = stat.mtime.getTime().toString(16);
      var size = stat.size.toString(16);
      return '"' + size + "-" + mtime + '"';
    }
    __name(stattag, "stattag");
  }
});

// node_modules/fresh/index.js
var require_fresh = __commonJS({
  "node_modules/fresh/index.js"(exports, module) {
    "use strict";
    var CACHE_CONTROL_NO_CACHE_REGEXP = /(?:^|,)\s*?no-cache\s*?(?:,|$)/;
    module.exports = fresh;
    function fresh(reqHeaders, resHeaders) {
      var modifiedSince = reqHeaders["if-modified-since"];
      var noneMatch = reqHeaders["if-none-match"];
      if (!modifiedSince && !noneMatch) {
        return false;
      }
      var cacheControl = reqHeaders["cache-control"];
      if (cacheControl && CACHE_CONTROL_NO_CACHE_REGEXP.test(cacheControl)) {
        return false;
      }
      if (noneMatch && noneMatch !== "*") {
        var etag = resHeaders["etag"];
        if (!etag) {
          return false;
        }
        var etagStale = true;
        var matches = parseTokenList(noneMatch);
        for (var i = 0; i < matches.length; i++) {
          var match = matches[i];
          if (match === etag || match === "W/" + etag || "W/" + match === etag) {
            etagStale = false;
            break;
          }
        }
        if (etagStale) {
          return false;
        }
      }
      if (modifiedSince) {
        var lastModified = resHeaders["last-modified"];
        var modifiedStale = !lastModified || !(parseHttpDate(lastModified) <= parseHttpDate(modifiedSince));
        if (modifiedStale) {
          return false;
        }
      }
      return true;
    }
    __name(fresh, "fresh");
    function parseHttpDate(date) {
      var timestamp = date && Date.parse(date);
      return typeof timestamp === "number" ? timestamp : NaN;
    }
    __name(parseHttpDate, "parseHttpDate");
    function parseTokenList(str) {
      var end = 0;
      var list = [];
      var start = 0;
      for (var i = 0, len = str.length; i < len; i++) {
        switch (str.charCodeAt(i)) {
          case 32:
            if (start === end) {
              start = end = i + 1;
            }
            break;
          case 44:
            list.push(str.substring(start, end));
            start = end = i + 1;
            break;
          default:
            end = i + 1;
            break;
        }
      }
      list.push(str.substring(start, end));
      return list;
    }
    __name(parseTokenList, "parseTokenList");
  }
});

// node_modules/mime/types.json
var require_types = __commonJS({
  "node_modules/mime/types.json"(exports, module) {
    module.exports = { "application/andrew-inset": ["ez"], "application/applixware": ["aw"], "application/atom+xml": ["atom"], "application/atomcat+xml": ["atomcat"], "application/atomsvc+xml": ["atomsvc"], "application/bdoc": ["bdoc"], "application/ccxml+xml": ["ccxml"], "application/cdmi-capability": ["cdmia"], "application/cdmi-container": ["cdmic"], "application/cdmi-domain": ["cdmid"], "application/cdmi-object": ["cdmio"], "application/cdmi-queue": ["cdmiq"], "application/cu-seeme": ["cu"], "application/dash+xml": ["mpd"], "application/davmount+xml": ["davmount"], "application/docbook+xml": ["dbk"], "application/dssc+der": ["dssc"], "application/dssc+xml": ["xdssc"], "application/ecmascript": ["ecma"], "application/emma+xml": ["emma"], "application/epub+zip": ["epub"], "application/exi": ["exi"], "application/font-tdpfr": ["pfr"], "application/font-woff": [], "application/font-woff2": [], "application/geo+json": ["geojson"], "application/gml+xml": ["gml"], "application/gpx+xml": ["gpx"], "application/gxf": ["gxf"], "application/gzip": ["gz"], "application/hyperstudio": ["stk"], "application/inkml+xml": ["ink", "inkml"], "application/ipfix": ["ipfix"], "application/java-archive": ["jar", "war", "ear"], "application/java-serialized-object": ["ser"], "application/java-vm": ["class"], "application/javascript": ["js", "mjs"], "application/json": ["json", "map"], "application/json5": ["json5"], "application/jsonml+json": ["jsonml"], "application/ld+json": ["jsonld"], "application/lost+xml": ["lostxml"], "application/mac-binhex40": ["hqx"], "application/mac-compactpro": ["cpt"], "application/mads+xml": ["mads"], "application/manifest+json": ["webmanifest"], "application/marc": ["mrc"], "application/marcxml+xml": ["mrcx"], "application/mathematica": ["ma", "nb", "mb"], "application/mathml+xml": ["mathml"], "application/mbox": ["mbox"], "application/mediaservercontrol+xml": ["mscml"], "application/metalink+xml": ["metalink"], "application/metalink4+xml": ["meta4"], "application/mets+xml": ["mets"], "application/mods+xml": ["mods"], "application/mp21": ["m21", "mp21"], "application/mp4": ["mp4s", "m4p"], "application/msword": ["doc", "dot"], "application/mxf": ["mxf"], "application/octet-stream": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"], "application/oda": ["oda"], "application/oebps-package+xml": ["opf"], "application/ogg": ["ogx"], "application/omdoc+xml": ["omdoc"], "application/onenote": ["onetoc", "onetoc2", "onetmp", "onepkg"], "application/oxps": ["oxps"], "application/patch-ops-error+xml": ["xer"], "application/pdf": ["pdf"], "application/pgp-encrypted": ["pgp"], "application/pgp-signature": ["asc", "sig"], "application/pics-rules": ["prf"], "application/pkcs10": ["p10"], "application/pkcs7-mime": ["p7m", "p7c"], "application/pkcs7-signature": ["p7s"], "application/pkcs8": ["p8"], "application/pkix-attr-cert": ["ac"], "application/pkix-cert": ["cer"], "application/pkix-crl": ["crl"], "application/pkix-pkipath": ["pkipath"], "application/pkixcmp": ["pki"], "application/pls+xml": ["pls"], "application/postscript": ["ai", "eps", "ps"], "application/prs.cww": ["cww"], "application/pskc+xml": ["pskcxml"], "application/raml+yaml": ["raml"], "application/rdf+xml": ["rdf"], "application/reginfo+xml": ["rif"], "application/relax-ng-compact-syntax": ["rnc"], "application/resource-lists+xml": ["rl"], "application/resource-lists-diff+xml": ["rld"], "application/rls-services+xml": ["rs"], "application/rpki-ghostbusters": ["gbr"], "application/rpki-manifest": ["mft"], "application/rpki-roa": ["roa"], "application/rsd+xml": ["rsd"], "application/rss+xml": ["rss"], "application/rtf": ["rtf"], "application/sbml+xml": ["sbml"], "application/scvp-cv-request": ["scq"], "application/scvp-cv-response": ["scs"], "application/scvp-vp-request": ["spq"], "application/scvp-vp-response": ["spp"], "application/sdp": ["sdp"], "application/set-payment-initiation": ["setpay"], "application/set-registration-initiation": ["setreg"], "application/shf+xml": ["shf"], "application/smil+xml": ["smi", "smil"], "application/sparql-query": ["rq"], "application/sparql-results+xml": ["srx"], "application/srgs": ["gram"], "application/srgs+xml": ["grxml"], "application/sru+xml": ["sru"], "application/ssdl+xml": ["ssdl"], "application/ssml+xml": ["ssml"], "application/tei+xml": ["tei", "teicorpus"], "application/thraud+xml": ["tfi"], "application/timestamped-data": ["tsd"], "application/vnd.3gpp.pic-bw-large": ["plb"], "application/vnd.3gpp.pic-bw-small": ["psb"], "application/vnd.3gpp.pic-bw-var": ["pvb"], "application/vnd.3gpp2.tcap": ["tcap"], "application/vnd.3m.post-it-notes": ["pwn"], "application/vnd.accpac.simply.aso": ["aso"], "application/vnd.accpac.simply.imp": ["imp"], "application/vnd.acucobol": ["acu"], "application/vnd.acucorp": ["atc", "acutc"], "application/vnd.adobe.air-application-installer-package+zip": ["air"], "application/vnd.adobe.formscentral.fcdt": ["fcdt"], "application/vnd.adobe.fxp": ["fxp", "fxpl"], "application/vnd.adobe.xdp+xml": ["xdp"], "application/vnd.adobe.xfdf": ["xfdf"], "application/vnd.ahead.space": ["ahead"], "application/vnd.airzip.filesecure.azf": ["azf"], "application/vnd.airzip.filesecure.azs": ["azs"], "application/vnd.amazon.ebook": ["azw"], "application/vnd.americandynamics.acc": ["acc"], "application/vnd.amiga.ami": ["ami"], "application/vnd.android.package-archive": ["apk"], "application/vnd.anser-web-certificate-issue-initiation": ["cii"], "application/vnd.anser-web-funds-transfer-initiation": ["fti"], "application/vnd.antix.game-component": ["atx"], "application/vnd.apple.installer+xml": ["mpkg"], "application/vnd.apple.mpegurl": ["m3u8"], "application/vnd.apple.pkpass": ["pkpass"], "application/vnd.aristanetworks.swi": ["swi"], "application/vnd.astraea-software.iota": ["iota"], "application/vnd.audiograph": ["aep"], "application/vnd.blueice.multipass": ["mpm"], "application/vnd.bmi": ["bmi"], "application/vnd.businessobjects": ["rep"], "application/vnd.chemdraw+xml": ["cdxml"], "application/vnd.chipnuts.karaoke-mmd": ["mmd"], "application/vnd.cinderella": ["cdy"], "application/vnd.claymore": ["cla"], "application/vnd.cloanto.rp9": ["rp9"], "application/vnd.clonk.c4group": ["c4g", "c4d", "c4f", "c4p", "c4u"], "application/vnd.cluetrust.cartomobile-config": ["c11amc"], "application/vnd.cluetrust.cartomobile-config-pkg": ["c11amz"], "application/vnd.commonspace": ["csp"], "application/vnd.contact.cmsg": ["cdbcmsg"], "application/vnd.cosmocaller": ["cmc"], "application/vnd.crick.clicker": ["clkx"], "application/vnd.crick.clicker.keyboard": ["clkk"], "application/vnd.crick.clicker.palette": ["clkp"], "application/vnd.crick.clicker.template": ["clkt"], "application/vnd.crick.clicker.wordbank": ["clkw"], "application/vnd.criticaltools.wbs+xml": ["wbs"], "application/vnd.ctc-posml": ["pml"], "application/vnd.cups-ppd": ["ppd"], "application/vnd.curl.car": ["car"], "application/vnd.curl.pcurl": ["pcurl"], "application/vnd.dart": ["dart"], "application/vnd.data-vision.rdz": ["rdz"], "application/vnd.dece.data": ["uvf", "uvvf", "uvd", "uvvd"], "application/vnd.dece.ttml+xml": ["uvt", "uvvt"], "application/vnd.dece.unspecified": ["uvx", "uvvx"], "application/vnd.dece.zip": ["uvz", "uvvz"], "application/vnd.denovo.fcselayout-link": ["fe_launch"], "application/vnd.dna": ["dna"], "application/vnd.dolby.mlp": ["mlp"], "application/vnd.dpgraph": ["dpg"], "application/vnd.dreamfactory": ["dfac"], "application/vnd.ds-keypoint": ["kpxx"], "application/vnd.dvb.ait": ["ait"], "application/vnd.dvb.service": ["svc"], "application/vnd.dynageo": ["geo"], "application/vnd.ecowin.chart": ["mag"], "application/vnd.enliven": ["nml"], "application/vnd.epson.esf": ["esf"], "application/vnd.epson.msf": ["msf"], "application/vnd.epson.quickanime": ["qam"], "application/vnd.epson.salt": ["slt"], "application/vnd.epson.ssf": ["ssf"], "application/vnd.eszigno3+xml": ["es3", "et3"], "application/vnd.ezpix-album": ["ez2"], "application/vnd.ezpix-package": ["ez3"], "application/vnd.fdf": ["fdf"], "application/vnd.fdsn.mseed": ["mseed"], "application/vnd.fdsn.seed": ["seed", "dataless"], "application/vnd.flographit": ["gph"], "application/vnd.fluxtime.clip": ["ftc"], "application/vnd.framemaker": ["fm", "frame", "maker", "book"], "application/vnd.frogans.fnc": ["fnc"], "application/vnd.frogans.ltf": ["ltf"], "application/vnd.fsc.weblaunch": ["fsc"], "application/vnd.fujitsu.oasys": ["oas"], "application/vnd.fujitsu.oasys2": ["oa2"], "application/vnd.fujitsu.oasys3": ["oa3"], "application/vnd.fujitsu.oasysgp": ["fg5"], "application/vnd.fujitsu.oasysprs": ["bh2"], "application/vnd.fujixerox.ddd": ["ddd"], "application/vnd.fujixerox.docuworks": ["xdw"], "application/vnd.fujixerox.docuworks.binder": ["xbd"], "application/vnd.fuzzysheet": ["fzs"], "application/vnd.genomatix.tuxedo": ["txd"], "application/vnd.geogebra.file": ["ggb"], "application/vnd.geogebra.tool": ["ggt"], "application/vnd.geometry-explorer": ["gex", "gre"], "application/vnd.geonext": ["gxt"], "application/vnd.geoplan": ["g2w"], "application/vnd.geospace": ["g3w"], "application/vnd.gmx": ["gmx"], "application/vnd.google-apps.document": ["gdoc"], "application/vnd.google-apps.presentation": ["gslides"], "application/vnd.google-apps.spreadsheet": ["gsheet"], "application/vnd.google-earth.kml+xml": ["kml"], "application/vnd.google-earth.kmz": ["kmz"], "application/vnd.grafeq": ["gqf", "gqs"], "application/vnd.groove-account": ["gac"], "application/vnd.groove-help": ["ghf"], "application/vnd.groove-identity-message": ["gim"], "application/vnd.groove-injector": ["grv"], "application/vnd.groove-tool-message": ["gtm"], "application/vnd.groove-tool-template": ["tpl"], "application/vnd.groove-vcard": ["vcg"], "application/vnd.hal+xml": ["hal"], "application/vnd.handheld-entertainment+xml": ["zmm"], "application/vnd.hbci": ["hbci"], "application/vnd.hhe.lesson-player": ["les"], "application/vnd.hp-hpgl": ["hpgl"], "application/vnd.hp-hpid": ["hpid"], "application/vnd.hp-hps": ["hps"], "application/vnd.hp-jlyt": ["jlt"], "application/vnd.hp-pcl": ["pcl"], "application/vnd.hp-pclxl": ["pclxl"], "application/vnd.hydrostatix.sof-data": ["sfd-hdstx"], "application/vnd.ibm.minipay": ["mpy"], "application/vnd.ibm.modcap": ["afp", "listafp", "list3820"], "application/vnd.ibm.rights-management": ["irm"], "application/vnd.ibm.secure-container": ["sc"], "application/vnd.iccprofile": ["icc", "icm"], "application/vnd.igloader": ["igl"], "application/vnd.immervision-ivp": ["ivp"], "application/vnd.immervision-ivu": ["ivu"], "application/vnd.insors.igm": ["igm"], "application/vnd.intercon.formnet": ["xpw", "xpx"], "application/vnd.intergeo": ["i2g"], "application/vnd.intu.qbo": ["qbo"], "application/vnd.intu.qfx": ["qfx"], "application/vnd.ipunplugged.rcprofile": ["rcprofile"], "application/vnd.irepository.package+xml": ["irp"], "application/vnd.is-xpr": ["xpr"], "application/vnd.isac.fcs": ["fcs"], "application/vnd.jam": ["jam"], "application/vnd.jcp.javame.midlet-rms": ["rms"], "application/vnd.jisp": ["jisp"], "application/vnd.joost.joda-archive": ["joda"], "application/vnd.kahootz": ["ktz", "ktr"], "application/vnd.kde.karbon": ["karbon"], "application/vnd.kde.kchart": ["chrt"], "application/vnd.kde.kformula": ["kfo"], "application/vnd.kde.kivio": ["flw"], "application/vnd.kde.kontour": ["kon"], "application/vnd.kde.kpresenter": ["kpr", "kpt"], "application/vnd.kde.kspread": ["ksp"], "application/vnd.kde.kword": ["kwd", "kwt"], "application/vnd.kenameaapp": ["htke"], "application/vnd.kidspiration": ["kia"], "application/vnd.kinar": ["kne", "knp"], "application/vnd.koan": ["skp", "skd", "skt", "skm"], "application/vnd.kodak-descriptor": ["sse"], "application/vnd.las.las+xml": ["lasxml"], "application/vnd.llamagraphics.life-balance.desktop": ["lbd"], "application/vnd.llamagraphics.life-balance.exchange+xml": ["lbe"], "application/vnd.lotus-1-2-3": ["123"], "application/vnd.lotus-approach": ["apr"], "application/vnd.lotus-freelance": ["pre"], "application/vnd.lotus-notes": ["nsf"], "application/vnd.lotus-organizer": ["org"], "application/vnd.lotus-screencam": ["scm"], "application/vnd.lotus-wordpro": ["lwp"], "application/vnd.macports.portpkg": ["portpkg"], "application/vnd.mcd": ["mcd"], "application/vnd.medcalcdata": ["mc1"], "application/vnd.mediastation.cdkey": ["cdkey"], "application/vnd.mfer": ["mwf"], "application/vnd.mfmp": ["mfm"], "application/vnd.micrografx.flo": ["flo"], "application/vnd.micrografx.igx": ["igx"], "application/vnd.mif": ["mif"], "application/vnd.mobius.daf": ["daf"], "application/vnd.mobius.dis": ["dis"], "application/vnd.mobius.mbk": ["mbk"], "application/vnd.mobius.mqy": ["mqy"], "application/vnd.mobius.msl": ["msl"], "application/vnd.mobius.plc": ["plc"], "application/vnd.mobius.txf": ["txf"], "application/vnd.mophun.application": ["mpn"], "application/vnd.mophun.certificate": ["mpc"], "application/vnd.mozilla.xul+xml": ["xul"], "application/vnd.ms-artgalry": ["cil"], "application/vnd.ms-cab-compressed": ["cab"], "application/vnd.ms-excel": ["xls", "xlm", "xla", "xlc", "xlt", "xlw"], "application/vnd.ms-excel.addin.macroenabled.12": ["xlam"], "application/vnd.ms-excel.sheet.binary.macroenabled.12": ["xlsb"], "application/vnd.ms-excel.sheet.macroenabled.12": ["xlsm"], "application/vnd.ms-excel.template.macroenabled.12": ["xltm"], "application/vnd.ms-fontobject": ["eot"], "application/vnd.ms-htmlhelp": ["chm"], "application/vnd.ms-ims": ["ims"], "application/vnd.ms-lrm": ["lrm"], "application/vnd.ms-officetheme": ["thmx"], "application/vnd.ms-outlook": ["msg"], "application/vnd.ms-pki.seccat": ["cat"], "application/vnd.ms-pki.stl": ["stl"], "application/vnd.ms-powerpoint": ["ppt", "pps", "pot"], "application/vnd.ms-powerpoint.addin.macroenabled.12": ["ppam"], "application/vnd.ms-powerpoint.presentation.macroenabled.12": ["pptm"], "application/vnd.ms-powerpoint.slide.macroenabled.12": ["sldm"], "application/vnd.ms-powerpoint.slideshow.macroenabled.12": ["ppsm"], "application/vnd.ms-powerpoint.template.macroenabled.12": ["potm"], "application/vnd.ms-project": ["mpp", "mpt"], "application/vnd.ms-word.document.macroenabled.12": ["docm"], "application/vnd.ms-word.template.macroenabled.12": ["dotm"], "application/vnd.ms-works": ["wps", "wks", "wcm", "wdb"], "application/vnd.ms-wpl": ["wpl"], "application/vnd.ms-xpsdocument": ["xps"], "application/vnd.mseq": ["mseq"], "application/vnd.musician": ["mus"], "application/vnd.muvee.style": ["msty"], "application/vnd.mynfc": ["taglet"], "application/vnd.neurolanguage.nlu": ["nlu"], "application/vnd.nitf": ["ntf", "nitf"], "application/vnd.noblenet-directory": ["nnd"], "application/vnd.noblenet-sealer": ["nns"], "application/vnd.noblenet-web": ["nnw"], "application/vnd.nokia.n-gage.data": ["ngdat"], "application/vnd.nokia.n-gage.symbian.install": ["n-gage"], "application/vnd.nokia.radio-preset": ["rpst"], "application/vnd.nokia.radio-presets": ["rpss"], "application/vnd.novadigm.edm": ["edm"], "application/vnd.novadigm.edx": ["edx"], "application/vnd.novadigm.ext": ["ext"], "application/vnd.oasis.opendocument.chart": ["odc"], "application/vnd.oasis.opendocument.chart-template": ["otc"], "application/vnd.oasis.opendocument.database": ["odb"], "application/vnd.oasis.opendocument.formula": ["odf"], "application/vnd.oasis.opendocument.formula-template": ["odft"], "application/vnd.oasis.opendocument.graphics": ["odg"], "application/vnd.oasis.opendocument.graphics-template": ["otg"], "application/vnd.oasis.opendocument.image": ["odi"], "application/vnd.oasis.opendocument.image-template": ["oti"], "application/vnd.oasis.opendocument.presentation": ["odp"], "application/vnd.oasis.opendocument.presentation-template": ["otp"], "application/vnd.oasis.opendocument.spreadsheet": ["ods"], "application/vnd.oasis.opendocument.spreadsheet-template": ["ots"], "application/vnd.oasis.opendocument.text": ["odt"], "application/vnd.oasis.opendocument.text-master": ["odm"], "application/vnd.oasis.opendocument.text-template": ["ott"], "application/vnd.oasis.opendocument.text-web": ["oth"], "application/vnd.olpc-sugar": ["xo"], "application/vnd.oma.dd2+xml": ["dd2"], "application/vnd.openofficeorg.extension": ["oxt"], "application/vnd.openxmlformats-officedocument.presentationml.presentation": ["pptx"], "application/vnd.openxmlformats-officedocument.presentationml.slide": ["sldx"], "application/vnd.openxmlformats-officedocument.presentationml.slideshow": ["ppsx"], "application/vnd.openxmlformats-officedocument.presentationml.template": ["potx"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"], "application/vnd.openxmlformats-officedocument.spreadsheetml.template": ["xltx"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"], "application/vnd.openxmlformats-officedocument.wordprocessingml.template": ["dotx"], "application/vnd.osgeo.mapguide.package": ["mgp"], "application/vnd.osgi.dp": ["dp"], "application/vnd.osgi.subsystem": ["esa"], "application/vnd.palm": ["pdb", "pqa", "oprc"], "application/vnd.pawaafile": ["paw"], "application/vnd.pg.format": ["str"], "application/vnd.pg.osasli": ["ei6"], "application/vnd.picsel": ["efif"], "application/vnd.pmi.widget": ["wg"], "application/vnd.pocketlearn": ["plf"], "application/vnd.powerbuilder6": ["pbd"], "application/vnd.previewsystems.box": ["box"], "application/vnd.proteus.magazine": ["mgz"], "application/vnd.publishare-delta-tree": ["qps"], "application/vnd.pvi.ptid1": ["ptid"], "application/vnd.quark.quarkxpress": ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"], "application/vnd.realvnc.bed": ["bed"], "application/vnd.recordare.musicxml": ["mxl"], "application/vnd.recordare.musicxml+xml": ["musicxml"], "application/vnd.rig.cryptonote": ["cryptonote"], "application/vnd.rim.cod": ["cod"], "application/vnd.rn-realmedia": ["rm"], "application/vnd.rn-realmedia-vbr": ["rmvb"], "application/vnd.route66.link66+xml": ["link66"], "application/vnd.sailingtracker.track": ["st"], "application/vnd.seemail": ["see"], "application/vnd.sema": ["sema"], "application/vnd.semd": ["semd"], "application/vnd.semf": ["semf"], "application/vnd.shana.informed.formdata": ["ifm"], "application/vnd.shana.informed.formtemplate": ["itp"], "application/vnd.shana.informed.interchange": ["iif"], "application/vnd.shana.informed.package": ["ipk"], "application/vnd.simtech-mindmapper": ["twd", "twds"], "application/vnd.smaf": ["mmf"], "application/vnd.smart.teacher": ["teacher"], "application/vnd.solent.sdkm+xml": ["sdkm", "sdkd"], "application/vnd.spotfire.dxp": ["dxp"], "application/vnd.spotfire.sfs": ["sfs"], "application/vnd.stardivision.calc": ["sdc"], "application/vnd.stardivision.draw": ["sda"], "application/vnd.stardivision.impress": ["sdd"], "application/vnd.stardivision.math": ["smf"], "application/vnd.stardivision.writer": ["sdw", "vor"], "application/vnd.stardivision.writer-global": ["sgl"], "application/vnd.stepmania.package": ["smzip"], "application/vnd.stepmania.stepchart": ["sm"], "application/vnd.sun.wadl+xml": ["wadl"], "application/vnd.sun.xml.calc": ["sxc"], "application/vnd.sun.xml.calc.template": ["stc"], "application/vnd.sun.xml.draw": ["sxd"], "application/vnd.sun.xml.draw.template": ["std"], "application/vnd.sun.xml.impress": ["sxi"], "application/vnd.sun.xml.impress.template": ["sti"], "application/vnd.sun.xml.math": ["sxm"], "application/vnd.sun.xml.writer": ["sxw"], "application/vnd.sun.xml.writer.global": ["sxg"], "application/vnd.sun.xml.writer.template": ["stw"], "application/vnd.sus-calendar": ["sus", "susp"], "application/vnd.svd": ["svd"], "application/vnd.symbian.install": ["sis", "sisx"], "application/vnd.syncml+xml": ["xsm"], "application/vnd.syncml.dm+wbxml": ["bdm"], "application/vnd.syncml.dm+xml": ["xdm"], "application/vnd.tao.intent-module-archive": ["tao"], "application/vnd.tcpdump.pcap": ["pcap", "cap", "dmp"], "application/vnd.tmobile-livetv": ["tmo"], "application/vnd.trid.tpt": ["tpt"], "application/vnd.triscape.mxs": ["mxs"], "application/vnd.trueapp": ["tra"], "application/vnd.ufdl": ["ufd", "ufdl"], "application/vnd.uiq.theme": ["utz"], "application/vnd.umajin": ["umj"], "application/vnd.unity": ["unityweb"], "application/vnd.uoml+xml": ["uoml"], "application/vnd.vcx": ["vcx"], "application/vnd.visio": ["vsd", "vst", "vss", "vsw"], "application/vnd.visionary": ["vis"], "application/vnd.vsf": ["vsf"], "application/vnd.wap.wbxml": ["wbxml"], "application/vnd.wap.wmlc": ["wmlc"], "application/vnd.wap.wmlscriptc": ["wmlsc"], "application/vnd.webturbo": ["wtb"], "application/vnd.wolfram.player": ["nbp"], "application/vnd.wordperfect": ["wpd"], "application/vnd.wqd": ["wqd"], "application/vnd.wt.stf": ["stf"], "application/vnd.xara": ["xar"], "application/vnd.xfdl": ["xfdl"], "application/vnd.yamaha.hv-dic": ["hvd"], "application/vnd.yamaha.hv-script": ["hvs"], "application/vnd.yamaha.hv-voice": ["hvp"], "application/vnd.yamaha.openscoreformat": ["osf"], "application/vnd.yamaha.openscoreformat.osfpvg+xml": ["osfpvg"], "application/vnd.yamaha.smaf-audio": ["saf"], "application/vnd.yamaha.smaf-phrase": ["spf"], "application/vnd.yellowriver-custom-menu": ["cmp"], "application/vnd.zul": ["zir", "zirz"], "application/vnd.zzazz.deck+xml": ["zaz"], "application/voicexml+xml": ["vxml"], "application/wasm": ["wasm"], "application/widget": ["wgt"], "application/winhlp": ["hlp"], "application/wsdl+xml": ["wsdl"], "application/wspolicy+xml": ["wspolicy"], "application/x-7z-compressed": ["7z"], "application/x-abiword": ["abw"], "application/x-ace-compressed": ["ace"], "application/x-apple-diskimage": [], "application/x-arj": ["arj"], "application/x-authorware-bin": ["aab", "x32", "u32", "vox"], "application/x-authorware-map": ["aam"], "application/x-authorware-seg": ["aas"], "application/x-bcpio": ["bcpio"], "application/x-bdoc": [], "application/x-bittorrent": ["torrent"], "application/x-blorb": ["blb", "blorb"], "application/x-bzip": ["bz"], "application/x-bzip2": ["bz2", "boz"], "application/x-cbr": ["cbr", "cba", "cbt", "cbz", "cb7"], "application/x-cdlink": ["vcd"], "application/x-cfs-compressed": ["cfs"], "application/x-chat": ["chat"], "application/x-chess-pgn": ["pgn"], "application/x-chrome-extension": ["crx"], "application/x-cocoa": ["cco"], "application/x-conference": ["nsc"], "application/x-cpio": ["cpio"], "application/x-csh": ["csh"], "application/x-debian-package": ["udeb"], "application/x-dgc-compressed": ["dgc"], "application/x-director": ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"], "application/x-doom": ["wad"], "application/x-dtbncx+xml": ["ncx"], "application/x-dtbook+xml": ["dtb"], "application/x-dtbresource+xml": ["res"], "application/x-dvi": ["dvi"], "application/x-envoy": ["evy"], "application/x-eva": ["eva"], "application/x-font-bdf": ["bdf"], "application/x-font-ghostscript": ["gsf"], "application/x-font-linux-psf": ["psf"], "application/x-font-pcf": ["pcf"], "application/x-font-snf": ["snf"], "application/x-font-type1": ["pfa", "pfb", "pfm", "afm"], "application/x-freearc": ["arc"], "application/x-futuresplash": ["spl"], "application/x-gca-compressed": ["gca"], "application/x-glulx": ["ulx"], "application/x-gnumeric": ["gnumeric"], "application/x-gramps-xml": ["gramps"], "application/x-gtar": ["gtar"], "application/x-hdf": ["hdf"], "application/x-httpd-php": ["php"], "application/x-install-instructions": ["install"], "application/x-iso9660-image": [], "application/x-java-archive-diff": ["jardiff"], "application/x-java-jnlp-file": ["jnlp"], "application/x-latex": ["latex"], "application/x-lua-bytecode": ["luac"], "application/x-lzh-compressed": ["lzh", "lha"], "application/x-makeself": ["run"], "application/x-mie": ["mie"], "application/x-mobipocket-ebook": ["prc", "mobi"], "application/x-ms-application": ["application"], "application/x-ms-shortcut": ["lnk"], "application/x-ms-wmd": ["wmd"], "application/x-ms-wmz": ["wmz"], "application/x-ms-xbap": ["xbap"], "application/x-msaccess": ["mdb"], "application/x-msbinder": ["obd"], "application/x-mscardfile": ["crd"], "application/x-msclip": ["clp"], "application/x-msdos-program": [], "application/x-msdownload": ["com", "bat"], "application/x-msmediaview": ["mvb", "m13", "m14"], "application/x-msmetafile": ["wmf", "emf", "emz"], "application/x-msmoney": ["mny"], "application/x-mspublisher": ["pub"], "application/x-msschedule": ["scd"], "application/x-msterminal": ["trm"], "application/x-mswrite": ["wri"], "application/x-netcdf": ["nc", "cdf"], "application/x-ns-proxy-autoconfig": ["pac"], "application/x-nzb": ["nzb"], "application/x-perl": ["pl", "pm"], "application/x-pilot": [], "application/x-pkcs12": ["p12", "pfx"], "application/x-pkcs7-certificates": ["p7b", "spc"], "application/x-pkcs7-certreqresp": ["p7r"], "application/x-rar-compressed": ["rar"], "application/x-redhat-package-manager": ["rpm"], "application/x-research-info-systems": ["ris"], "application/x-sea": ["sea"], "application/x-sh": ["sh"], "application/x-shar": ["shar"], "application/x-shockwave-flash": ["swf"], "application/x-silverlight-app": ["xap"], "application/x-sql": ["sql"], "application/x-stuffit": ["sit"], "application/x-stuffitx": ["sitx"], "application/x-subrip": ["srt"], "application/x-sv4cpio": ["sv4cpio"], "application/x-sv4crc": ["sv4crc"], "application/x-t3vm-image": ["t3"], "application/x-tads": ["gam"], "application/x-tar": ["tar"], "application/x-tcl": ["tcl", "tk"], "application/x-tex": ["tex"], "application/x-tex-tfm": ["tfm"], "application/x-texinfo": ["texinfo", "texi"], "application/x-tgif": ["obj"], "application/x-ustar": ["ustar"], "application/x-virtualbox-hdd": ["hdd"], "application/x-virtualbox-ova": ["ova"], "application/x-virtualbox-ovf": ["ovf"], "application/x-virtualbox-vbox": ["vbox"], "application/x-virtualbox-vbox-extpack": ["vbox-extpack"], "application/x-virtualbox-vdi": ["vdi"], "application/x-virtualbox-vhd": ["vhd"], "application/x-virtualbox-vmdk": ["vmdk"], "application/x-wais-source": ["src"], "application/x-web-app-manifest+json": ["webapp"], "application/x-x509-ca-cert": ["der", "crt", "pem"], "application/x-xfig": ["fig"], "application/x-xliff+xml": ["xlf"], "application/x-xpinstall": ["xpi"], "application/x-xz": ["xz"], "application/x-zmachine": ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"], "application/xaml+xml": ["xaml"], "application/xcap-diff+xml": ["xdf"], "application/xenc+xml": ["xenc"], "application/xhtml+xml": ["xhtml", "xht"], "application/xml": ["xml", "xsl", "xsd", "rng"], "application/xml-dtd": ["dtd"], "application/xop+xml": ["xop"], "application/xproc+xml": ["xpl"], "application/xslt+xml": ["xslt"], "application/xspf+xml": ["xspf"], "application/xv+xml": ["mxml", "xhvml", "xvml", "xvm"], "application/yang": ["yang"], "application/yin+xml": ["yin"], "application/zip": ["zip"], "audio/3gpp": [], "audio/adpcm": ["adp"], "audio/basic": ["au", "snd"], "audio/midi": ["mid", "midi", "kar", "rmi"], "audio/mp3": [], "audio/mp4": ["m4a", "mp4a"], "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"], "audio/ogg": ["oga", "ogg", "spx"], "audio/s3m": ["s3m"], "audio/silk": ["sil"], "audio/vnd.dece.audio": ["uva", "uvva"], "audio/vnd.digital-winds": ["eol"], "audio/vnd.dra": ["dra"], "audio/vnd.dts": ["dts"], "audio/vnd.dts.hd": ["dtshd"], "audio/vnd.lucent.voice": ["lvp"], "audio/vnd.ms-playready.media.pya": ["pya"], "audio/vnd.nuera.ecelp4800": ["ecelp4800"], "audio/vnd.nuera.ecelp7470": ["ecelp7470"], "audio/vnd.nuera.ecelp9600": ["ecelp9600"], "audio/vnd.rip": ["rip"], "audio/wav": ["wav"], "audio/wave": [], "audio/webm": ["weba"], "audio/x-aac": ["aac"], "audio/x-aiff": ["aif", "aiff", "aifc"], "audio/x-caf": ["caf"], "audio/x-flac": ["flac"], "audio/x-m4a": [], "audio/x-matroska": ["mka"], "audio/x-mpegurl": ["m3u"], "audio/x-ms-wax": ["wax"], "audio/x-ms-wma": ["wma"], "audio/x-pn-realaudio": ["ram", "ra"], "audio/x-pn-realaudio-plugin": ["rmp"], "audio/x-realaudio": [], "audio/x-wav": [], "audio/xm": ["xm"], "chemical/x-cdx": ["cdx"], "chemical/x-cif": ["cif"], "chemical/x-cmdf": ["cmdf"], "chemical/x-cml": ["cml"], "chemical/x-csml": ["csml"], "chemical/x-xyz": ["xyz"], "font/collection": ["ttc"], "font/otf": ["otf"], "font/ttf": ["ttf"], "font/woff": ["woff"], "font/woff2": ["woff2"], "image/apng": ["apng"], "image/bmp": ["bmp"], "image/cgm": ["cgm"], "image/g3fax": ["g3"], "image/gif": ["gif"], "image/ief": ["ief"], "image/jp2": ["jp2", "jpg2"], "image/jpeg": ["jpeg", "jpg", "jpe"], "image/jpm": ["jpm"], "image/jpx": ["jpx", "jpf"], "image/ktx": ["ktx"], "image/png": ["png"], "image/prs.btif": ["btif"], "image/sgi": ["sgi"], "image/svg+xml": ["svg", "svgz"], "image/tiff": ["tiff", "tif"], "image/vnd.adobe.photoshop": ["psd"], "image/vnd.dece.graphic": ["uvi", "uvvi", "uvg", "uvvg"], "image/vnd.djvu": ["djvu", "djv"], "image/vnd.dvb.subtitle": [], "image/vnd.dwg": ["dwg"], "image/vnd.dxf": ["dxf"], "image/vnd.fastbidsheet": ["fbs"], "image/vnd.fpx": ["fpx"], "image/vnd.fst": ["fst"], "image/vnd.fujixerox.edmics-mmr": ["mmr"], "image/vnd.fujixerox.edmics-rlc": ["rlc"], "image/vnd.ms-modi": ["mdi"], "image/vnd.ms-photo": ["wdp"], "image/vnd.net-fpx": ["npx"], "image/vnd.wap.wbmp": ["wbmp"], "image/vnd.xiff": ["xif"], "image/webp": ["webp"], "image/x-3ds": ["3ds"], "image/x-cmu-raster": ["ras"], "image/x-cmx": ["cmx"], "image/x-freehand": ["fh", "fhc", "fh4", "fh5", "fh7"], "image/x-icon": ["ico"], "image/x-jng": ["jng"], "image/x-mrsid-image": ["sid"], "image/x-ms-bmp": [], "image/x-pcx": ["pcx"], "image/x-pict": ["pic", "pct"], "image/x-portable-anymap": ["pnm"], "image/x-portable-bitmap": ["pbm"], "image/x-portable-graymap": ["pgm"], "image/x-portable-pixmap": ["ppm"], "image/x-rgb": ["rgb"], "image/x-tga": ["tga"], "image/x-xbitmap": ["xbm"], "image/x-xpixmap": ["xpm"], "image/x-xwindowdump": ["xwd"], "message/rfc822": ["eml", "mime"], "model/gltf+json": ["gltf"], "model/gltf-binary": ["glb"], "model/iges": ["igs", "iges"], "model/mesh": ["msh", "mesh", "silo"], "model/vnd.collada+xml": ["dae"], "model/vnd.dwf": ["dwf"], "model/vnd.gdl": ["gdl"], "model/vnd.gtw": ["gtw"], "model/vnd.mts": ["mts"], "model/vnd.vtu": ["vtu"], "model/vrml": ["wrl", "vrml"], "model/x3d+binary": ["x3db", "x3dbz"], "model/x3d+vrml": ["x3dv", "x3dvz"], "model/x3d+xml": ["x3d", "x3dz"], "text/cache-manifest": ["appcache", "manifest"], "text/calendar": ["ics", "ifb"], "text/coffeescript": ["coffee", "litcoffee"], "text/css": ["css"], "text/csv": ["csv"], "text/hjson": ["hjson"], "text/html": ["html", "htm", "shtml"], "text/jade": ["jade"], "text/jsx": ["jsx"], "text/less": ["less"], "text/markdown": ["markdown", "md"], "text/mathml": ["mml"], "text/n3": ["n3"], "text/plain": ["txt", "text", "conf", "def", "list", "log", "in", "ini"], "text/prs.lines.tag": ["dsc"], "text/richtext": ["rtx"], "text/rtf": [], "text/sgml": ["sgml", "sgm"], "text/slim": ["slim", "slm"], "text/stylus": ["stylus", "styl"], "text/tab-separated-values": ["tsv"], "text/troff": ["t", "tr", "roff", "man", "me", "ms"], "text/turtle": ["ttl"], "text/uri-list": ["uri", "uris", "urls"], "text/vcard": ["vcard"], "text/vnd.curl": ["curl"], "text/vnd.curl.dcurl": ["dcurl"], "text/vnd.curl.mcurl": ["mcurl"], "text/vnd.curl.scurl": ["scurl"], "text/vnd.dvb.subtitle": ["sub"], "text/vnd.fly": ["fly"], "text/vnd.fmi.flexstor": ["flx"], "text/vnd.graphviz": ["gv"], "text/vnd.in3d.3dml": ["3dml"], "text/vnd.in3d.spot": ["spot"], "text/vnd.sun.j2me.app-descriptor": ["jad"], "text/vnd.wap.wml": ["wml"], "text/vnd.wap.wmlscript": ["wmls"], "text/vtt": ["vtt"], "text/x-asm": ["s", "asm"], "text/x-c": ["c", "cc", "cxx", "cpp", "h", "hh", "dic"], "text/x-component": ["htc"], "text/x-fortran": ["f", "for", "f77", "f90"], "text/x-handlebars-template": ["hbs"], "text/x-java-source": ["java"], "text/x-lua": ["lua"], "text/x-markdown": ["mkd"], "text/x-nfo": ["nfo"], "text/x-opml": ["opml"], "text/x-org": [], "text/x-pascal": ["p", "pas"], "text/x-processing": ["pde"], "text/x-sass": ["sass"], "text/x-scss": ["scss"], "text/x-setext": ["etx"], "text/x-sfv": ["sfv"], "text/x-suse-ymp": ["ymp"], "text/x-uuencode": ["uu"], "text/x-vcalendar": ["vcs"], "text/x-vcard": ["vcf"], "text/xml": [], "text/yaml": ["yaml", "yml"], "video/3gpp": ["3gp", "3gpp"], "video/3gpp2": ["3g2"], "video/h261": ["h261"], "video/h263": ["h263"], "video/h264": ["h264"], "video/jpeg": ["jpgv"], "video/jpm": ["jpgm"], "video/mj2": ["mj2", "mjp2"], "video/mp2t": ["ts"], "video/mp4": ["mp4", "mp4v", "mpg4"], "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"], "video/ogg": ["ogv"], "video/quicktime": ["qt", "mov"], "video/vnd.dece.hd": ["uvh", "uvvh"], "video/vnd.dece.mobile": ["uvm", "uvvm"], "video/vnd.dece.pd": ["uvp", "uvvp"], "video/vnd.dece.sd": ["uvs", "uvvs"], "video/vnd.dece.video": ["uvv", "uvvv"], "video/vnd.dvb.file": ["dvb"], "video/vnd.fvt": ["fvt"], "video/vnd.mpegurl": ["mxu", "m4u"], "video/vnd.ms-playready.media.pyv": ["pyv"], "video/vnd.uvvu.mp4": ["uvu", "uvvu"], "video/vnd.vivo": ["viv"], "video/webm": ["webm"], "video/x-f4v": ["f4v"], "video/x-fli": ["fli"], "video/x-flv": ["flv"], "video/x-m4v": ["m4v"], "video/x-matroska": ["mkv", "mk3d", "mks"], "video/x-mng": ["mng"], "video/x-ms-asf": ["asf", "asx"], "video/x-ms-vob": ["vob"], "video/x-ms-wm": ["wm"], "video/x-ms-wmv": ["wmv"], "video/x-ms-wmx": ["wmx"], "video/x-ms-wvx": ["wvx"], "video/x-msvideo": ["avi"], "video/x-sgi-movie": ["movie"], "video/x-smv": ["smv"], "x-conference/x-cooltalk": ["ice"] };
  }
});

// node_modules/mime/mime.js
var require_mime = __commonJS({
  "node_modules/mime/mime.js"(exports, module) {
    var path = require_path();
    var fs = require_fs();
    function Mime() {
      this.types = /* @__PURE__ */ Object.create(null);
      this.extensions = /* @__PURE__ */ Object.create(null);
    }
    __name(Mime, "Mime");
    Mime.prototype.define = function(map) {
      for (var type in map) {
        var exts = map[type];
        for (var i = 0; i < exts.length; i++) {
          if (process.env.DEBUG_MIME && this.types[exts[i]]) {
            console.warn((this._loading || "define()").replace(/.*\//, ""), 'changes "' + exts[i] + '" extension type from ' + this.types[exts[i]] + " to " + type);
          }
          this.types[exts[i]] = type;
        }
        if (!this.extensions[type]) {
          this.extensions[type] = exts[0];
        }
      }
    };
    Mime.prototype.load = function(file) {
      this._loading = file;
      var map = {}, content = fs.readFileSync(file, "ascii"), lines = content.split(/[\r\n]+/);
      lines.forEach(function(line) {
        var fields = line.replace(/\s*#.*|^\s*|\s*$/g, "").split(/\s+/);
        map[fields.shift()] = fields;
      });
      this.define(map);
      this._loading = null;
    };
    Mime.prototype.lookup = function(path2, fallback) {
      var ext = path2.replace(/^.*[\.\/\\]/, "").toLowerCase();
      return this.types[ext] || fallback || this.default_type;
    };
    Mime.prototype.extension = function(mimeType) {
      var type = mimeType.match(/^\s*([^;\s]*)(?:;|\s|$)/)[1].toLowerCase();
      return this.extensions[type];
    };
    var mime = new Mime();
    mime.define(require_types());
    mime.default_type = mime.lookup("bin");
    mime.Mime = Mime;
    mime.charsets = {
      lookup: /* @__PURE__ */ __name(function(mimeType, fallback) {
        return /^text\/|^application\/(javascript|json)/.test(mimeType) ? "UTF-8" : fallback;
      }, "lookup")
    };
    module.exports = mime;
  }
});

// node_modules/send/node_modules/ms/index.js
var require_ms2 = __commonJS({
  "node_modules/send/node_modules/ms/index.js"(exports, module) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    __name(parse, "parse");
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    __name(fmtShort, "fmtShort");
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    __name(fmtLong, "fmtLong");
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
    __name(plural, "plural");
  }
});

// node_modules/range-parser/index.js
var require_range_parser = __commonJS({
  "node_modules/range-parser/index.js"(exports, module) {
    "use strict";
    module.exports = rangeParser;
    function rangeParser(size, str, options) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var index = str.indexOf("=");
      if (index === -1) {
        return -2;
      }
      var arr = str.slice(index + 1).split(",");
      var ranges = [];
      ranges.type = str.slice(0, index);
      for (var i = 0; i < arr.length; i++) {
        var range = arr[i].split("-");
        var start = parseInt(range[0], 10);
        var end = parseInt(range[1], 10);
        if (isNaN(start)) {
          start = size - end;
          end = size - 1;
        } else if (isNaN(end)) {
          end = size - 1;
        }
        if (end > size - 1) {
          end = size - 1;
        }
        if (isNaN(start) || isNaN(end) || start > end || start < 0) {
          continue;
        }
        ranges.push({
          start,
          end
        });
      }
      if (ranges.length < 1) {
        return -1;
      }
      return options && options.combine ? combineRanges(ranges) : ranges;
    }
    __name(rangeParser, "rangeParser");
    function combineRanges(ranges) {
      var ordered = ranges.map(mapWithIndex).sort(sortByRangeStart);
      for (var j = 0, i = 1; i < ordered.length; i++) {
        var range = ordered[i];
        var current = ordered[j];
        if (range.start > current.end + 1) {
          ordered[++j] = range;
        } else if (range.end > current.end) {
          current.end = range.end;
          current.index = Math.min(current.index, range.index);
        }
      }
      ordered.length = j + 1;
      var combined = ordered.sort(sortByRangeIndex).map(mapWithoutIndex);
      combined.type = ranges.type;
      return combined;
    }
    __name(combineRanges, "combineRanges");
    function mapWithIndex(range, index) {
      return {
        start: range.start,
        end: range.end,
        index
      };
    }
    __name(mapWithIndex, "mapWithIndex");
    function mapWithoutIndex(range) {
      return {
        start: range.start,
        end: range.end
      };
    }
    __name(mapWithoutIndex, "mapWithoutIndex");
    function sortByRangeIndex(a, b) {
      return a.index - b.index;
    }
    __name(sortByRangeIndex, "sortByRangeIndex");
    function sortByRangeStart(a, b) {
      return a.start - b.start;
    }
    __name(sortByRangeStart, "sortByRangeStart");
  }
});

// node_modules/send/index.js
var require_send = __commonJS({
  "node_modules/send/index.js"(exports, module) {
    "use strict";
    var createError = require_http_errors();
    var debug = require_src()("send");
    var deprecate = require_browser()("send");
    var destroy = require_destroy();
    var encodeUrl = require_encodeurl();
    var escapeHtml = require_escape_html();
    var etag = require_etag();
    var fresh = require_fresh();
    var fs = require_fs();
    var mime = require_mime();
    var ms = require_ms2();
    var onFinished = require_on_finished();
    var parseRange = require_range_parser();
    var path = require_path();
    var statuses = require_statuses();
    var Stream = require_stream();
    var util = require_util();
    var extname = path.extname;
    var join = path.join;
    var normalize = path.normalize;
    var resolve = path.resolve;
    var sep = path.sep;
    var BYTES_RANGE_REGEXP = /^ *bytes=/;
    var MAX_MAXAGE = 60 * 60 * 24 * 365 * 1e3;
    var UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/;
    module.exports = send;
    module.exports.mime = mime;
    function send(req, path2, options) {
      return new SendStream(req, path2, options);
    }
    __name(send, "send");
    function SendStream(req, path2, options) {
      Stream.call(this);
      var opts = options || {};
      this.options = opts;
      this.path = path2;
      this.req = req;
      this._acceptRanges = opts.acceptRanges !== void 0 ? Boolean(opts.acceptRanges) : true;
      this._cacheControl = opts.cacheControl !== void 0 ? Boolean(opts.cacheControl) : true;
      this._etag = opts.etag !== void 0 ? Boolean(opts.etag) : true;
      this._dotfiles = opts.dotfiles !== void 0 ? opts.dotfiles : "ignore";
      if (this._dotfiles !== "ignore" && this._dotfiles !== "allow" && this._dotfiles !== "deny") {
        throw new TypeError('dotfiles option must be "allow", "deny", or "ignore"');
      }
      this._hidden = Boolean(opts.hidden);
      if (opts.hidden !== void 0) {
        deprecate("hidden: use dotfiles: '" + (this._hidden ? "allow" : "ignore") + "' instead");
      }
      if (opts.dotfiles === void 0) {
        this._dotfiles = void 0;
      }
      this._extensions = opts.extensions !== void 0 ? normalizeList(opts.extensions, "extensions option") : [];
      this._immutable = opts.immutable !== void 0 ? Boolean(opts.immutable) : false;
      this._index = opts.index !== void 0 ? normalizeList(opts.index, "index option") : ["index.html"];
      this._lastModified = opts.lastModified !== void 0 ? Boolean(opts.lastModified) : true;
      this._maxage = opts.maxAge || opts.maxage;
      this._maxage = typeof this._maxage === "string" ? ms(this._maxage) : Number(this._maxage);
      this._maxage = !isNaN(this._maxage) ? Math.min(Math.max(0, this._maxage), MAX_MAXAGE) : 0;
      this._root = opts.root ? resolve(opts.root) : null;
      if (!this._root && opts.from) {
        this.from(opts.from);
      }
    }
    __name(SendStream, "SendStream");
    util.inherits(SendStream, Stream);
    SendStream.prototype.etag = deprecate.function(/* @__PURE__ */ __name(function etag2(val) {
      this._etag = Boolean(val);
      debug("etag %s", this._etag);
      return this;
    }, "etag"), "send.etag: pass etag as option");
    SendStream.prototype.hidden = deprecate.function(/* @__PURE__ */ __name(function hidden(val) {
      this._hidden = Boolean(val);
      this._dotfiles = void 0;
      debug("hidden %s", this._hidden);
      return this;
    }, "hidden"), "send.hidden: use dotfiles option");
    SendStream.prototype.index = deprecate.function(/* @__PURE__ */ __name(function index(paths) {
      var index2 = !paths ? [] : normalizeList(paths, "paths argument");
      debug("index %o", paths);
      this._index = index2;
      return this;
    }, "index"), "send.index: pass index as option");
    SendStream.prototype.root = /* @__PURE__ */ __name(function root(path2) {
      this._root = resolve(String(path2));
      debug("root %s", this._root);
      return this;
    }, "root");
    SendStream.prototype.from = deprecate.function(
      SendStream.prototype.root,
      "send.from: pass root as option"
    );
    SendStream.prototype.root = deprecate.function(
      SendStream.prototype.root,
      "send.root: pass root as option"
    );
    SendStream.prototype.maxage = deprecate.function(/* @__PURE__ */ __name(function maxage(maxAge) {
      this._maxage = typeof maxAge === "string" ? ms(maxAge) : Number(maxAge);
      this._maxage = !isNaN(this._maxage) ? Math.min(Math.max(0, this._maxage), MAX_MAXAGE) : 0;
      debug("max-age %d", this._maxage);
      return this;
    }, "maxage"), "send.maxage: pass maxAge as option");
    SendStream.prototype.error = /* @__PURE__ */ __name(function error(status, err) {
      if (hasListeners(this, "error")) {
        return this.emit("error", createHttpError(status, err));
      }
      var res = this.res;
      var msg = statuses.message[status] || String(status);
      var doc = createHtmlDocument("Error", escapeHtml(msg));
      clearHeaders(res);
      if (err && err.headers) {
        setHeaders(res, err.headers);
      }
      res.statusCode = status;
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      res.setHeader("Content-Length", Buffer.byteLength(doc));
      res.setHeader("Content-Security-Policy", "default-src 'none'");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.end(doc);
    }, "error");
    SendStream.prototype.hasTrailingSlash = /* @__PURE__ */ __name(function hasTrailingSlash() {
      return this.path[this.path.length - 1] === "/";
    }, "hasTrailingSlash");
    SendStream.prototype.isConditionalGET = /* @__PURE__ */ __name(function isConditionalGET() {
      return this.req.headers["if-match"] || this.req.headers["if-unmodified-since"] || this.req.headers["if-none-match"] || this.req.headers["if-modified-since"];
    }, "isConditionalGET");
    SendStream.prototype.isPreconditionFailure = /* @__PURE__ */ __name(function isPreconditionFailure() {
      var req = this.req;
      var res = this.res;
      var match = req.headers["if-match"];
      if (match) {
        var etag2 = res.getHeader("ETag");
        return !etag2 || match !== "*" && parseTokenList(match).every(function(match2) {
          return match2 !== etag2 && match2 !== "W/" + etag2 && "W/" + match2 !== etag2;
        });
      }
      var unmodifiedSince = parseHttpDate(req.headers["if-unmodified-since"]);
      if (!isNaN(unmodifiedSince)) {
        var lastModified = parseHttpDate(res.getHeader("Last-Modified"));
        return isNaN(lastModified) || lastModified > unmodifiedSince;
      }
      return false;
    }, "isPreconditionFailure");
    SendStream.prototype.removeContentHeaderFields = /* @__PURE__ */ __name(function removeContentHeaderFields() {
      var res = this.res;
      res.removeHeader("Content-Encoding");
      res.removeHeader("Content-Language");
      res.removeHeader("Content-Length");
      res.removeHeader("Content-Range");
      res.removeHeader("Content-Type");
    }, "removeContentHeaderFields");
    SendStream.prototype.notModified = /* @__PURE__ */ __name(function notModified() {
      var res = this.res;
      debug("not modified");
      this.removeContentHeaderFields();
      res.statusCode = 304;
      res.end();
    }, "notModified");
    SendStream.prototype.headersAlreadySent = /* @__PURE__ */ __name(function headersAlreadySent() {
      var err = new Error("Can't set headers after they are sent.");
      debug("headers already sent");
      this.error(500, err);
    }, "headersAlreadySent");
    SendStream.prototype.isCachable = /* @__PURE__ */ __name(function isCachable() {
      var statusCode = this.res.statusCode;
      return statusCode >= 200 && statusCode < 300 || statusCode === 304;
    }, "isCachable");
    SendStream.prototype.onStatError = /* @__PURE__ */ __name(function onStatError(error) {
      switch (error.code) {
        case "ENAMETOOLONG":
        case "ENOENT":
        case "ENOTDIR":
          this.error(404, error);
          break;
        default:
          this.error(500, error);
          break;
      }
    }, "onStatError");
    SendStream.prototype.isFresh = /* @__PURE__ */ __name(function isFresh() {
      return fresh(this.req.headers, {
        etag: this.res.getHeader("ETag"),
        "last-modified": this.res.getHeader("Last-Modified")
      });
    }, "isFresh");
    SendStream.prototype.isRangeFresh = /* @__PURE__ */ __name(function isRangeFresh() {
      var ifRange = this.req.headers["if-range"];
      if (!ifRange) {
        return true;
      }
      if (ifRange.indexOf('"') !== -1) {
        var etag2 = this.res.getHeader("ETag");
        return Boolean(etag2 && ifRange.indexOf(etag2) !== -1);
      }
      var lastModified = this.res.getHeader("Last-Modified");
      return parseHttpDate(lastModified) <= parseHttpDate(ifRange);
    }, "isRangeFresh");
    SendStream.prototype.redirect = /* @__PURE__ */ __name(function redirect(path2) {
      var res = this.res;
      if (hasListeners(this, "directory")) {
        this.emit("directory", res, path2);
        return;
      }
      if (this.hasTrailingSlash()) {
        this.error(403);
        return;
      }
      var loc = encodeUrl(collapseLeadingSlashes(this.path + "/"));
      var doc = createHtmlDocument("Redirecting", "Redirecting to " + escapeHtml(loc));
      res.statusCode = 301;
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      res.setHeader("Content-Length", Buffer.byteLength(doc));
      res.setHeader("Content-Security-Policy", "default-src 'none'");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Location", loc);
      res.end(doc);
    }, "redirect");
    SendStream.prototype.pipe = /* @__PURE__ */ __name(function pipe(res) {
      var root = this._root;
      this.res = res;
      var path2 = decode2(this.path);
      if (path2 === -1) {
        this.error(400);
        return res;
      }
      if (~path2.indexOf("\0")) {
        this.error(400);
        return res;
      }
      var parts;
      if (root !== null) {
        if (path2) {
          path2 = normalize("." + sep + path2);
        }
        if (UP_PATH_REGEXP.test(path2)) {
          debug('malicious path "%s"', path2);
          this.error(403);
          return res;
        }
        parts = path2.split(sep);
        path2 = normalize(join(root, path2));
      } else {
        if (UP_PATH_REGEXP.test(path2)) {
          debug('malicious path "%s"', path2);
          this.error(403);
          return res;
        }
        parts = normalize(path2).split(sep);
        path2 = resolve(path2);
      }
      if (containsDotFile(parts)) {
        var access = this._dotfiles;
        if (access === void 0) {
          access = parts[parts.length - 1][0] === "." ? this._hidden ? "allow" : "ignore" : "allow";
        }
        debug('%s dotfile "%s"', access, path2);
        switch (access) {
          case "allow":
            break;
          case "deny":
            this.error(403);
            return res;
          case "ignore":
          default:
            this.error(404);
            return res;
        }
      }
      if (this._index.length && this.hasTrailingSlash()) {
        this.sendIndex(path2);
        return res;
      }
      this.sendFile(path2);
      return res;
    }, "pipe");
    SendStream.prototype.send = /* @__PURE__ */ __name(function send2(path2, stat) {
      var len = stat.size;
      var options = this.options;
      var opts = {};
      var res = this.res;
      var req = this.req;
      var ranges = req.headers.range;
      var offset = options.start || 0;
      if (headersSent(res)) {
        this.headersAlreadySent();
        return;
      }
      debug('pipe "%s"', path2);
      this.setHeader(path2, stat);
      this.type(path2);
      if (this.isConditionalGET()) {
        if (this.isPreconditionFailure()) {
          this.error(412);
          return;
        }
        if (this.isCachable() && this.isFresh()) {
          this.notModified();
          return;
        }
      }
      len = Math.max(0, len - offset);
      if (options.end !== void 0) {
        var bytes = options.end - offset + 1;
        if (len > bytes) len = bytes;
      }
      if (this._acceptRanges && BYTES_RANGE_REGEXP.test(ranges)) {
        ranges = parseRange(len, ranges, {
          combine: true
        });
        if (!this.isRangeFresh()) {
          debug("range stale");
          ranges = -2;
        }
        if (ranges === -1) {
          debug("range unsatisfiable");
          res.setHeader("Content-Range", contentRange("bytes", len));
          return this.error(416, {
            headers: { "Content-Range": res.getHeader("Content-Range") }
          });
        }
        if (ranges !== -2 && ranges.length === 1) {
          debug("range %j", ranges);
          res.statusCode = 206;
          res.setHeader("Content-Range", contentRange("bytes", len, ranges[0]));
          offset += ranges[0].start;
          len = ranges[0].end - ranges[0].start + 1;
        }
      }
      for (var prop in options) {
        opts[prop] = options[prop];
      }
      opts.start = offset;
      opts.end = Math.max(offset, offset + len - 1);
      res.setHeader("Content-Length", len);
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      this.stream(path2, opts);
    }, "send");
    SendStream.prototype.sendFile = /* @__PURE__ */ __name(function sendFile(path2) {
      var i = 0;
      var self = this;
      debug('stat "%s"', path2);
      fs.stat(path2, /* @__PURE__ */ __name(function onstat(err, stat) {
        if (err && err.code === "ENOENT" && !extname(path2) && path2[path2.length - 1] !== sep) {
          return next(err);
        }
        if (err) return self.onStatError(err);
        if (stat.isDirectory()) return self.redirect(path2);
        self.emit("file", path2, stat);
        self.send(path2, stat);
      }, "onstat"));
      function next(err) {
        if (self._extensions.length <= i) {
          return err ? self.onStatError(err) : self.error(404);
        }
        var p = path2 + "." + self._extensions[i++];
        debug('stat "%s"', p);
        fs.stat(p, function(err2, stat) {
          if (err2) return next(err2);
          if (stat.isDirectory()) return next();
          self.emit("file", p, stat);
          self.send(p, stat);
        });
      }
      __name(next, "next");
    }, "sendFile");
    SendStream.prototype.sendIndex = /* @__PURE__ */ __name(function sendIndex(path2) {
      var i = -1;
      var self = this;
      function next(err) {
        if (++i >= self._index.length) {
          if (err) return self.onStatError(err);
          return self.error(404);
        }
        var p = join(path2, self._index[i]);
        debug('stat "%s"', p);
        fs.stat(p, function(err2, stat) {
          if (err2) return next(err2);
          if (stat.isDirectory()) return next();
          self.emit("file", p, stat);
          self.send(p, stat);
        });
      }
      __name(next, "next");
      next();
    }, "sendIndex");
    SendStream.prototype.stream = /* @__PURE__ */ __name(function stream(path2, options) {
      var self = this;
      var res = this.res;
      var stream2 = fs.createReadStream(path2, options);
      this.emit("stream", stream2);
      stream2.pipe(res);
      function cleanup() {
        destroy(stream2, true);
      }
      __name(cleanup, "cleanup");
      onFinished(res, cleanup);
      stream2.on("error", /* @__PURE__ */ __name(function onerror(err) {
        cleanup();
        self.onStatError(err);
      }, "onerror"));
      stream2.on("end", /* @__PURE__ */ __name(function onend() {
        self.emit("end");
      }, "onend"));
    }, "stream");
    SendStream.prototype.type = /* @__PURE__ */ __name(function type(path2) {
      var res = this.res;
      if (res.getHeader("Content-Type")) return;
      var type2 = mime.lookup(path2);
      if (!type2) {
        debug("no content-type");
        return;
      }
      var charset = mime.charsets.lookup(type2);
      debug("content-type %s", type2);
      res.setHeader("Content-Type", type2 + (charset ? "; charset=" + charset : ""));
    }, "type");
    SendStream.prototype.setHeader = /* @__PURE__ */ __name(function setHeader(path2, stat) {
      var res = this.res;
      this.emit("headers", res, path2, stat);
      if (this._acceptRanges && !res.getHeader("Accept-Ranges")) {
        debug("accept ranges");
        res.setHeader("Accept-Ranges", "bytes");
      }
      if (this._cacheControl && !res.getHeader("Cache-Control")) {
        var cacheControl = "public, max-age=" + Math.floor(this._maxage / 1e3);
        if (this._immutable) {
          cacheControl += ", immutable";
        }
        debug("cache-control %s", cacheControl);
        res.setHeader("Cache-Control", cacheControl);
      }
      if (this._lastModified && !res.getHeader("Last-Modified")) {
        var modified = stat.mtime.toUTCString();
        debug("modified %s", modified);
        res.setHeader("Last-Modified", modified);
      }
      if (this._etag && !res.getHeader("ETag")) {
        var val = etag(stat);
        debug("etag %s", val);
        res.setHeader("ETag", val);
      }
    }, "setHeader");
    function clearHeaders(res) {
      var headers = getHeaderNames(res);
      for (var i = 0; i < headers.length; i++) {
        res.removeHeader(headers[i]);
      }
    }
    __name(clearHeaders, "clearHeaders");
    function collapseLeadingSlashes(str) {
      for (var i = 0; i < str.length; i++) {
        if (str[i] !== "/") {
          break;
        }
      }
      return i > 1 ? "/" + str.substr(i) : str;
    }
    __name(collapseLeadingSlashes, "collapseLeadingSlashes");
    function containsDotFile(parts) {
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (part.length > 1 && part[0] === ".") {
          return true;
        }
      }
      return false;
    }
    __name(containsDotFile, "containsDotFile");
    function contentRange(type, size, range) {
      return type + " " + (range ? range.start + "-" + range.end : "*") + "/" + size;
    }
    __name(contentRange, "contentRange");
    function createHtmlDocument(title, body) {
      return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>' + title + "</title>\n</head>\n<body>\n<pre>" + body + "</pre>\n</body>\n</html>\n";
    }
    __name(createHtmlDocument, "createHtmlDocument");
    function createHttpError(status, err) {
      if (!err) {
        return createError(status);
      }
      return err instanceof Error ? createError(status, err, { expose: false }) : createError(status, err);
    }
    __name(createHttpError, "createHttpError");
    function decode2(path2) {
      try {
        return decodeURIComponent(path2);
      } catch (err) {
        return -1;
      }
    }
    __name(decode2, "decode");
    function getHeaderNames(res) {
      return typeof res.getHeaderNames !== "function" ? Object.keys(res._headers || {}) : res.getHeaderNames();
    }
    __name(getHeaderNames, "getHeaderNames");
    function hasListeners(emitter, type) {
      var count = typeof emitter.listenerCount !== "function" ? emitter.listeners(type).length : emitter.listenerCount(type);
      return count > 0;
    }
    __name(hasListeners, "hasListeners");
    function headersSent(res) {
      return typeof res.headersSent !== "boolean" ? Boolean(res._header) : res.headersSent;
    }
    __name(headersSent, "headersSent");
    function normalizeList(val, name) {
      var list = [].concat(val || []);
      for (var i = 0; i < list.length; i++) {
        if (typeof list[i] !== "string") {
          throw new TypeError(name + " must be array of strings or false");
        }
      }
      return list;
    }
    __name(normalizeList, "normalizeList");
    function parseHttpDate(date) {
      var timestamp = date && Date.parse(date);
      return typeof timestamp === "number" ? timestamp : NaN;
    }
    __name(parseHttpDate, "parseHttpDate");
    function parseTokenList(str) {
      var end = 0;
      var list = [];
      var start = 0;
      for (var i = 0, len = str.length; i < len; i++) {
        switch (str.charCodeAt(i)) {
          case 32:
            if (start === end) {
              start = end = i + 1;
            }
            break;
          case 44:
            if (start !== end) {
              list.push(str.substring(start, end));
            }
            start = end = i + 1;
            break;
          default:
            end = i + 1;
            break;
        }
      }
      if (start !== end) {
        list.push(str.substring(start, end));
      }
      return list;
    }
    __name(parseTokenList, "parseTokenList");
    function setHeaders(res, headers) {
      var keys = Object.keys(headers);
      for (var i = 0; i < keys.length; i++) {
        var key2 = keys[i];
        res.setHeader(key2, headers[key2]);
      }
    }
    __name(setHeaders, "setHeaders");
  }
});

// node_modules/forwarded/index.js
var require_forwarded = __commonJS({
  "node_modules/forwarded/index.js"(exports, module) {
    "use strict";
    module.exports = forwarded;
    function forwarded(req) {
      if (!req) {
        throw new TypeError("argument req is required");
      }
      var proxyAddrs = parse(req.headers["x-forwarded-for"] || "");
      var socketAddr = getSocketAddr(req);
      var addrs = [socketAddr].concat(proxyAddrs);
      return addrs;
    }
    __name(forwarded, "forwarded");
    function getSocketAddr(req) {
      return req.socket ? req.socket.remoteAddress : req.connection.remoteAddress;
    }
    __name(getSocketAddr, "getSocketAddr");
    function parse(header) {
      var end = header.length;
      var list = [];
      var start = header.length;
      for (var i = header.length - 1; i >= 0; i--) {
        switch (header.charCodeAt(i)) {
          case 32:
            if (start === end) {
              start = end = i;
            }
            break;
          case 44:
            if (start !== end) {
              list.push(header.substring(start, end));
            }
            start = end = i;
            break;
          default:
            start = i;
            break;
        }
      }
      if (start !== end) {
        list.push(header.substring(start, end));
      }
      return list;
    }
    __name(parse, "parse");
  }
});

// node_modules/ipaddr.js/lib/ipaddr.js
var require_ipaddr = __commonJS({
  "node_modules/ipaddr.js/lib/ipaddr.js"(exports, module) {
    (function() {
      var expandIPv6, ipaddr, ipv4Part, ipv4Regexes, ipv6Part, ipv6Regexes, matchCIDR, root, zoneIndex;
      ipaddr = {};
      root = this;
      if (typeof module !== "undefined" && module !== null && module.exports) {
        module.exports = ipaddr;
      } else {
        root["ipaddr"] = ipaddr;
      }
      matchCIDR = /* @__PURE__ */ __name(function(first, second, partSize, cidrBits) {
        var part, shift;
        if (first.length !== second.length) {
          throw new Error("ipaddr: cannot match CIDR for objects with different lengths");
        }
        part = 0;
        while (cidrBits > 0) {
          shift = partSize - cidrBits;
          if (shift < 0) {
            shift = 0;
          }
          if (first[part] >> shift !== second[part] >> shift) {
            return false;
          }
          cidrBits -= partSize;
          part += 1;
        }
        return true;
      }, "matchCIDR");
      ipaddr.subnetMatch = function(address, rangeList, defaultName) {
        var k, len, rangeName, rangeSubnets, subnet;
        if (defaultName == null) {
          defaultName = "unicast";
        }
        for (rangeName in rangeList) {
          rangeSubnets = rangeList[rangeName];
          if (rangeSubnets[0] && !(rangeSubnets[0] instanceof Array)) {
            rangeSubnets = [rangeSubnets];
          }
          for (k = 0, len = rangeSubnets.length; k < len; k++) {
            subnet = rangeSubnets[k];
            if (address.kind() === subnet[0].kind()) {
              if (address.match.apply(address, subnet)) {
                return rangeName;
              }
            }
          }
        }
        return defaultName;
      };
      ipaddr.IPv4 = (function() {
        function IPv4(octets) {
          var k, len, octet;
          if (octets.length !== 4) {
            throw new Error("ipaddr: ipv4 octet count should be 4");
          }
          for (k = 0, len = octets.length; k < len; k++) {
            octet = octets[k];
            if (!(0 <= octet && octet <= 255)) {
              throw new Error("ipaddr: ipv4 octet should fit in 8 bits");
            }
          }
          this.octets = octets;
        }
        __name(IPv4, "IPv4");
        IPv4.prototype.kind = function() {
          return "ipv4";
        };
        IPv4.prototype.toString = function() {
          return this.octets.join(".");
        };
        IPv4.prototype.toNormalizedString = function() {
          return this.toString();
        };
        IPv4.prototype.toByteArray = function() {
          return this.octets.slice(0);
        };
        IPv4.prototype.match = function(other, cidrRange) {
          var ref;
          if (cidrRange === void 0) {
            ref = other, other = ref[0], cidrRange = ref[1];
          }
          if (other.kind() !== "ipv4") {
            throw new Error("ipaddr: cannot match ipv4 address with non-ipv4 one");
          }
          return matchCIDR(this.octets, other.octets, 8, cidrRange);
        };
        IPv4.prototype.SpecialRanges = {
          unspecified: [[new IPv4([0, 0, 0, 0]), 8]],
          broadcast: [[new IPv4([255, 255, 255, 255]), 32]],
          multicast: [[new IPv4([224, 0, 0, 0]), 4]],
          linkLocal: [[new IPv4([169, 254, 0, 0]), 16]],
          loopback: [[new IPv4([127, 0, 0, 0]), 8]],
          carrierGradeNat: [[new IPv4([100, 64, 0, 0]), 10]],
          "private": [[new IPv4([10, 0, 0, 0]), 8], [new IPv4([172, 16, 0, 0]), 12], [new IPv4([192, 168, 0, 0]), 16]],
          reserved: [[new IPv4([192, 0, 0, 0]), 24], [new IPv4([192, 0, 2, 0]), 24], [new IPv4([192, 88, 99, 0]), 24], [new IPv4([198, 51, 100, 0]), 24], [new IPv4([203, 0, 113, 0]), 24], [new IPv4([240, 0, 0, 0]), 4]]
        };
        IPv4.prototype.range = function() {
          return ipaddr.subnetMatch(this, this.SpecialRanges);
        };
        IPv4.prototype.toIPv4MappedAddress = function() {
          return ipaddr.IPv6.parse("::ffff:" + this.toString());
        };
        IPv4.prototype.prefixLengthFromSubnetMask = function() {
          var cidr, i, k, octet, stop, zeros, zerotable;
          zerotable = {
            0: 8,
            128: 7,
            192: 6,
            224: 5,
            240: 4,
            248: 3,
            252: 2,
            254: 1,
            255: 0
          };
          cidr = 0;
          stop = false;
          for (i = k = 3; k >= 0; i = k += -1) {
            octet = this.octets[i];
            if (octet in zerotable) {
              zeros = zerotable[octet];
              if (stop && zeros !== 0) {
                return null;
              }
              if (zeros !== 8) {
                stop = true;
              }
              cidr += zeros;
            } else {
              return null;
            }
          }
          return 32 - cidr;
        };
        return IPv4;
      })();
      ipv4Part = "(0?\\d+|0x[a-f0-9]+)";
      ipv4Regexes = {
        fourOctet: new RegExp("^" + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "$", "i"),
        longValue: new RegExp("^" + ipv4Part + "$", "i")
      };
      ipaddr.IPv4.parser = function(string) {
        var match, parseIntAuto, part, shift, value;
        parseIntAuto = /* @__PURE__ */ __name(function(string2) {
          if (string2[0] === "0" && string2[1] !== "x") {
            return parseInt(string2, 8);
          } else {
            return parseInt(string2);
          }
        }, "parseIntAuto");
        if (match = string.match(ipv4Regexes.fourOctet)) {
          return (function() {
            var k, len, ref, results;
            ref = match.slice(1, 6);
            results = [];
            for (k = 0, len = ref.length; k < len; k++) {
              part = ref[k];
              results.push(parseIntAuto(part));
            }
            return results;
          })();
        } else if (match = string.match(ipv4Regexes.longValue)) {
          value = parseIntAuto(match[1]);
          if (value > 4294967295 || value < 0) {
            throw new Error("ipaddr: address outside defined range");
          }
          return (function() {
            var k, results;
            results = [];
            for (shift = k = 0; k <= 24; shift = k += 8) {
              results.push(value >> shift & 255);
            }
            return results;
          })().reverse();
        } else {
          return null;
        }
      };
      ipaddr.IPv6 = (function() {
        function IPv6(parts, zoneId) {
          var i, k, l, len, part, ref;
          if (parts.length === 16) {
            this.parts = [];
            for (i = k = 0; k <= 14; i = k += 2) {
              this.parts.push(parts[i] << 8 | parts[i + 1]);
            }
          } else if (parts.length === 8) {
            this.parts = parts;
          } else {
            throw new Error("ipaddr: ipv6 part count should be 8 or 16");
          }
          ref = this.parts;
          for (l = 0, len = ref.length; l < len; l++) {
            part = ref[l];
            if (!(0 <= part && part <= 65535)) {
              throw new Error("ipaddr: ipv6 part should fit in 16 bits");
            }
          }
          if (zoneId) {
            this.zoneId = zoneId;
          }
        }
        __name(IPv6, "IPv6");
        IPv6.prototype.kind = function() {
          return "ipv6";
        };
        IPv6.prototype.toString = function() {
          return this.toNormalizedString().replace(/((^|:)(0(:|$))+)/, "::");
        };
        IPv6.prototype.toRFC5952String = function() {
          var bestMatchIndex, bestMatchLength, match, regex, string;
          regex = /((^|:)(0(:|$)){2,})/g;
          string = this.toNormalizedString();
          bestMatchIndex = 0;
          bestMatchLength = -1;
          while (match = regex.exec(string)) {
            if (match[0].length > bestMatchLength) {
              bestMatchIndex = match.index;
              bestMatchLength = match[0].length;
            }
          }
          if (bestMatchLength < 0) {
            return string;
          }
          return string.substring(0, bestMatchIndex) + "::" + string.substring(bestMatchIndex + bestMatchLength);
        };
        IPv6.prototype.toByteArray = function() {
          var bytes, k, len, part, ref;
          bytes = [];
          ref = this.parts;
          for (k = 0, len = ref.length; k < len; k++) {
            part = ref[k];
            bytes.push(part >> 8);
            bytes.push(part & 255);
          }
          return bytes;
        };
        IPv6.prototype.toNormalizedString = function() {
          var addr, part, suffix;
          addr = (function() {
            var k, len, ref, results;
            ref = this.parts;
            results = [];
            for (k = 0, len = ref.length; k < len; k++) {
              part = ref[k];
              results.push(part.toString(16));
            }
            return results;
          }).call(this).join(":");
          suffix = "";
          if (this.zoneId) {
            suffix = "%" + this.zoneId;
          }
          return addr + suffix;
        };
        IPv6.prototype.toFixedLengthString = function() {
          var addr, part, suffix;
          addr = (function() {
            var k, len, ref, results;
            ref = this.parts;
            results = [];
            for (k = 0, len = ref.length; k < len; k++) {
              part = ref[k];
              results.push(part.toString(16).padStart(4, "0"));
            }
            return results;
          }).call(this).join(":");
          suffix = "";
          if (this.zoneId) {
            suffix = "%" + this.zoneId;
          }
          return addr + suffix;
        };
        IPv6.prototype.match = function(other, cidrRange) {
          var ref;
          if (cidrRange === void 0) {
            ref = other, other = ref[0], cidrRange = ref[1];
          }
          if (other.kind() !== "ipv6") {
            throw new Error("ipaddr: cannot match ipv6 address with non-ipv6 one");
          }
          return matchCIDR(this.parts, other.parts, 16, cidrRange);
        };
        IPv6.prototype.SpecialRanges = {
          unspecified: [new IPv6([0, 0, 0, 0, 0, 0, 0, 0]), 128],
          linkLocal: [new IPv6([65152, 0, 0, 0, 0, 0, 0, 0]), 10],
          multicast: [new IPv6([65280, 0, 0, 0, 0, 0, 0, 0]), 8],
          loopback: [new IPv6([0, 0, 0, 0, 0, 0, 0, 1]), 128],
          uniqueLocal: [new IPv6([64512, 0, 0, 0, 0, 0, 0, 0]), 7],
          ipv4Mapped: [new IPv6([0, 0, 0, 0, 0, 65535, 0, 0]), 96],
          rfc6145: [new IPv6([0, 0, 0, 0, 65535, 0, 0, 0]), 96],
          rfc6052: [new IPv6([100, 65435, 0, 0, 0, 0, 0, 0]), 96],
          "6to4": [new IPv6([8194, 0, 0, 0, 0, 0, 0, 0]), 16],
          teredo: [new IPv6([8193, 0, 0, 0, 0, 0, 0, 0]), 32],
          reserved: [[new IPv6([8193, 3512, 0, 0, 0, 0, 0, 0]), 32]]
        };
        IPv6.prototype.range = function() {
          return ipaddr.subnetMatch(this, this.SpecialRanges);
        };
        IPv6.prototype.isIPv4MappedAddress = function() {
          return this.range() === "ipv4Mapped";
        };
        IPv6.prototype.toIPv4Address = function() {
          var high, low, ref;
          if (!this.isIPv4MappedAddress()) {
            throw new Error("ipaddr: trying to convert a generic ipv6 address to ipv4");
          }
          ref = this.parts.slice(-2), high = ref[0], low = ref[1];
          return new ipaddr.IPv4([high >> 8, high & 255, low >> 8, low & 255]);
        };
        IPv6.prototype.prefixLengthFromSubnetMask = function() {
          var cidr, i, k, part, stop, zeros, zerotable;
          zerotable = {
            0: 16,
            32768: 15,
            49152: 14,
            57344: 13,
            61440: 12,
            63488: 11,
            64512: 10,
            65024: 9,
            65280: 8,
            65408: 7,
            65472: 6,
            65504: 5,
            65520: 4,
            65528: 3,
            65532: 2,
            65534: 1,
            65535: 0
          };
          cidr = 0;
          stop = false;
          for (i = k = 7; k >= 0; i = k += -1) {
            part = this.parts[i];
            if (part in zerotable) {
              zeros = zerotable[part];
              if (stop && zeros !== 0) {
                return null;
              }
              if (zeros !== 16) {
                stop = true;
              }
              cidr += zeros;
            } else {
              return null;
            }
          }
          return 128 - cidr;
        };
        return IPv6;
      })();
      ipv6Part = "(?:[0-9a-f]+::?)+";
      zoneIndex = "%[0-9a-z]{1,}";
      ipv6Regexes = {
        zoneIndex: new RegExp(zoneIndex, "i"),
        "native": new RegExp("^(::)?(" + ipv6Part + ")?([0-9a-f]+)?(::)?(" + zoneIndex + ")?$", "i"),
        transitional: new RegExp("^((?:" + ipv6Part + ")|(?:::)(?:" + ipv6Part + ")?)" + (ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part) + ("(" + zoneIndex + ")?$"), "i")
      };
      expandIPv6 = /* @__PURE__ */ __name(function(string, parts) {
        var colonCount, lastColon, part, replacement, replacementCount, zoneId;
        if (string.indexOf("::") !== string.lastIndexOf("::")) {
          return null;
        }
        zoneId = (string.match(ipv6Regexes["zoneIndex"]) || [])[0];
        if (zoneId) {
          zoneId = zoneId.substring(1);
          string = string.replace(/%.+$/, "");
        }
        colonCount = 0;
        lastColon = -1;
        while ((lastColon = string.indexOf(":", lastColon + 1)) >= 0) {
          colonCount++;
        }
        if (string.substr(0, 2) === "::") {
          colonCount--;
        }
        if (string.substr(-2, 2) === "::") {
          colonCount--;
        }
        if (colonCount > parts) {
          return null;
        }
        replacementCount = parts - colonCount;
        replacement = ":";
        while (replacementCount--) {
          replacement += "0:";
        }
        string = string.replace("::", replacement);
        if (string[0] === ":") {
          string = string.slice(1);
        }
        if (string[string.length - 1] === ":") {
          string = string.slice(0, -1);
        }
        parts = (function() {
          var k, len, ref, results;
          ref = string.split(":");
          results = [];
          for (k = 0, len = ref.length; k < len; k++) {
            part = ref[k];
            results.push(parseInt(part, 16));
          }
          return results;
        })();
        return {
          parts,
          zoneId
        };
      }, "expandIPv6");
      ipaddr.IPv6.parser = function(string) {
        var addr, k, len, match, octet, octets, zoneId;
        if (ipv6Regexes["native"].test(string)) {
          return expandIPv6(string, 8);
        } else if (match = string.match(ipv6Regexes["transitional"])) {
          zoneId = match[6] || "";
          addr = expandIPv6(match[1].slice(0, -1) + zoneId, 6);
          if (addr.parts) {
            octets = [parseInt(match[2]), parseInt(match[3]), parseInt(match[4]), parseInt(match[5])];
            for (k = 0, len = octets.length; k < len; k++) {
              octet = octets[k];
              if (!(0 <= octet && octet <= 255)) {
                return null;
              }
            }
            addr.parts.push(octets[0] << 8 | octets[1]);
            addr.parts.push(octets[2] << 8 | octets[3]);
            return {
              parts: addr.parts,
              zoneId: addr.zoneId
            };
          }
        }
        return null;
      };
      ipaddr.IPv4.isIPv4 = ipaddr.IPv6.isIPv6 = function(string) {
        return this.parser(string) !== null;
      };
      ipaddr.IPv4.isValid = function(string) {
        var e;
        try {
          new this(this.parser(string));
          return true;
        } catch (error1) {
          e = error1;
          return false;
        }
      };
      ipaddr.IPv4.isValidFourPartDecimal = function(string) {
        if (ipaddr.IPv4.isValid(string) && string.match(/^(0|[1-9]\d*)(\.(0|[1-9]\d*)){3}$/)) {
          return true;
        } else {
          return false;
        }
      };
      ipaddr.IPv6.isValid = function(string) {
        var addr, e;
        if (typeof string === "string" && string.indexOf(":") === -1) {
          return false;
        }
        try {
          addr = this.parser(string);
          new this(addr.parts, addr.zoneId);
          return true;
        } catch (error1) {
          e = error1;
          return false;
        }
      };
      ipaddr.IPv4.parse = function(string) {
        var parts;
        parts = this.parser(string);
        if (parts === null) {
          throw new Error("ipaddr: string is not formatted like ip address");
        }
        return new this(parts);
      };
      ipaddr.IPv6.parse = function(string) {
        var addr;
        addr = this.parser(string);
        if (addr.parts === null) {
          throw new Error("ipaddr: string is not formatted like ip address");
        }
        return new this(addr.parts, addr.zoneId);
      };
      ipaddr.IPv4.parseCIDR = function(string) {
        var maskLength, match, parsed;
        if (match = string.match(/^(.+)\/(\d+)$/)) {
          maskLength = parseInt(match[2]);
          if (maskLength >= 0 && maskLength <= 32) {
            parsed = [this.parse(match[1]), maskLength];
            Object.defineProperty(parsed, "toString", {
              value: /* @__PURE__ */ __name(function() {
                return this.join("/");
              }, "value")
            });
            return parsed;
          }
        }
        throw new Error("ipaddr: string is not formatted like an IPv4 CIDR range");
      };
      ipaddr.IPv4.subnetMaskFromPrefixLength = function(prefix) {
        var filledOctetCount, j, octets;
        prefix = parseInt(prefix);
        if (prefix < 0 || prefix > 32) {
          throw new Error("ipaddr: invalid IPv4 prefix length");
        }
        octets = [0, 0, 0, 0];
        j = 0;
        filledOctetCount = Math.floor(prefix / 8);
        while (j < filledOctetCount) {
          octets[j] = 255;
          j++;
        }
        if (filledOctetCount < 4) {
          octets[filledOctetCount] = Math.pow(2, prefix % 8) - 1 << 8 - prefix % 8;
        }
        return new this(octets);
      };
      ipaddr.IPv4.broadcastAddressFromCIDR = function(string) {
        var cidr, error, i, ipInterfaceOctets, octets, subnetMaskOctets;
        try {
          cidr = this.parseCIDR(string);
          ipInterfaceOctets = cidr[0].toByteArray();
          subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
          octets = [];
          i = 0;
          while (i < 4) {
            octets.push(parseInt(ipInterfaceOctets[i], 10) | parseInt(subnetMaskOctets[i], 10) ^ 255);
            i++;
          }
          return new this(octets);
        } catch (error1) {
          error = error1;
          throw new Error("ipaddr: the address does not have IPv4 CIDR format");
        }
      };
      ipaddr.IPv4.networkAddressFromCIDR = function(string) {
        var cidr, error, i, ipInterfaceOctets, octets, subnetMaskOctets;
        try {
          cidr = this.parseCIDR(string);
          ipInterfaceOctets = cidr[0].toByteArray();
          subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
          octets = [];
          i = 0;
          while (i < 4) {
            octets.push(parseInt(ipInterfaceOctets[i], 10) & parseInt(subnetMaskOctets[i], 10));
            i++;
          }
          return new this(octets);
        } catch (error1) {
          error = error1;
          throw new Error("ipaddr: the address does not have IPv4 CIDR format");
        }
      };
      ipaddr.IPv6.parseCIDR = function(string) {
        var maskLength, match, parsed;
        if (match = string.match(/^(.+)\/(\d+)$/)) {
          maskLength = parseInt(match[2]);
          if (maskLength >= 0 && maskLength <= 128) {
            parsed = [this.parse(match[1]), maskLength];
            Object.defineProperty(parsed, "toString", {
              value: /* @__PURE__ */ __name(function() {
                return this.join("/");
              }, "value")
            });
            return parsed;
          }
        }
        throw new Error("ipaddr: string is not formatted like an IPv6 CIDR range");
      };
      ipaddr.isValid = function(string) {
        return ipaddr.IPv6.isValid(string) || ipaddr.IPv4.isValid(string);
      };
      ipaddr.parse = function(string) {
        if (ipaddr.IPv6.isValid(string)) {
          return ipaddr.IPv6.parse(string);
        } else if (ipaddr.IPv4.isValid(string)) {
          return ipaddr.IPv4.parse(string);
        } else {
          throw new Error("ipaddr: the address has neither IPv6 nor IPv4 format");
        }
      };
      ipaddr.parseCIDR = function(string) {
        var e;
        try {
          return ipaddr.IPv6.parseCIDR(string);
        } catch (error1) {
          e = error1;
          try {
            return ipaddr.IPv4.parseCIDR(string);
          } catch (error12) {
            e = error12;
            throw new Error("ipaddr: the address has neither IPv6 nor IPv4 CIDR format");
          }
        }
      };
      ipaddr.fromByteArray = function(bytes) {
        var length;
        length = bytes.length;
        if (length === 4) {
          return new ipaddr.IPv4(bytes);
        } else if (length === 16) {
          return new ipaddr.IPv6(bytes);
        } else {
          throw new Error("ipaddr: the binary input is neither an IPv6 nor IPv4 address");
        }
      };
      ipaddr.process = function(string) {
        var addr;
        addr = this.parse(string);
        if (addr.kind() === "ipv6" && addr.isIPv4MappedAddress()) {
          return addr.toIPv4Address();
        } else {
          return addr;
        }
      };
    }).call(exports);
  }
});

// node_modules/proxy-addr/index.js
var require_proxy_addr = __commonJS({
  "node_modules/proxy-addr/index.js"(exports, module) {
    "use strict";
    module.exports = proxyaddr;
    module.exports.all = alladdrs;
    module.exports.compile = compile;
    var forwarded = require_forwarded();
    var ipaddr = require_ipaddr();
    var DIGIT_REGEXP = /^[0-9]+$/;
    var isip = ipaddr.isValid;
    var parseip = ipaddr.parse;
    var IP_RANGES = {
      linklocal: ["169.254.0.0/16", "fe80::/10"],
      loopback: ["127.0.0.1/8", "::1/128"],
      uniquelocal: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "fc00::/7"]
    };
    function alladdrs(req, trust) {
      var addrs = forwarded(req);
      if (!trust) {
        return addrs;
      }
      if (typeof trust !== "function") {
        trust = compile(trust);
      }
      for (var i = 0; i < addrs.length - 1; i++) {
        if (trust(addrs[i], i)) continue;
        addrs.length = i + 1;
      }
      return addrs;
    }
    __name(alladdrs, "alladdrs");
    function compile(val) {
      if (!val) {
        throw new TypeError("argument is required");
      }
      var trust;
      if (typeof val === "string") {
        trust = [val];
      } else if (Array.isArray(val)) {
        trust = val.slice();
      } else {
        throw new TypeError("unsupported trust argument");
      }
      for (var i = 0; i < trust.length; i++) {
        val = trust[i];
        if (!Object.prototype.hasOwnProperty.call(IP_RANGES, val)) {
          continue;
        }
        val = IP_RANGES[val];
        trust.splice.apply(trust, [i, 1].concat(val));
        i += val.length - 1;
      }
      return compileTrust(compileRangeSubnets(trust));
    }
    __name(compile, "compile");
    function compileRangeSubnets(arr) {
      var rangeSubnets = new Array(arr.length);
      for (var i = 0; i < arr.length; i++) {
        rangeSubnets[i] = parseipNotation(arr[i]);
      }
      return rangeSubnets;
    }
    __name(compileRangeSubnets, "compileRangeSubnets");
    function compileTrust(rangeSubnets) {
      var len = rangeSubnets.length;
      return len === 0 ? trustNone : len === 1 ? trustSingle(rangeSubnets[0]) : trustMulti(rangeSubnets);
    }
    __name(compileTrust, "compileTrust");
    function parseipNotation(note) {
      var pos = note.lastIndexOf("/");
      var str = pos !== -1 ? note.substring(0, pos) : note;
      if (!isip(str)) {
        throw new TypeError("invalid IP address: " + str);
      }
      var ip = parseip(str);
      if (pos === -1 && ip.kind() === "ipv6" && ip.isIPv4MappedAddress()) {
        ip = ip.toIPv4Address();
      }
      var max = ip.kind() === "ipv6" ? 128 : 32;
      var range = pos !== -1 ? note.substring(pos + 1, note.length) : null;
      if (range === null) {
        range = max;
      } else if (DIGIT_REGEXP.test(range)) {
        range = parseInt(range, 10);
      } else if (ip.kind() === "ipv4" && isip(range)) {
        range = parseNetmask(range);
      } else {
        range = null;
      }
      if (range <= 0 || range > max) {
        throw new TypeError("invalid range on address: " + note);
      }
      return [ip, range];
    }
    __name(parseipNotation, "parseipNotation");
    function parseNetmask(netmask) {
      var ip = parseip(netmask);
      var kind = ip.kind();
      return kind === "ipv4" ? ip.prefixLengthFromSubnetMask() : null;
    }
    __name(parseNetmask, "parseNetmask");
    function proxyaddr(req, trust) {
      if (!req) {
        throw new TypeError("req argument is required");
      }
      if (!trust) {
        throw new TypeError("trust argument is required");
      }
      var addrs = alladdrs(req, trust);
      var addr = addrs[addrs.length - 1];
      return addr;
    }
    __name(proxyaddr, "proxyaddr");
    function trustNone() {
      return false;
    }
    __name(trustNone, "trustNone");
    function trustMulti(subnets) {
      return /* @__PURE__ */ __name(function trust(addr) {
        if (!isip(addr)) return false;
        var ip = parseip(addr);
        if (ip.kind() === "ipv6" && ip.isIPv4MappedAddress()) {
          ip = ip.toIPv4Address();
        }
        var ipconv;
        var kind = ip.kind();
        for (var i = 0; i < subnets.length; i++) {
          var subnet = subnets[i];
          var subnetip = subnet[0];
          var subnetkind = subnetip.kind();
          var subnetrange = subnet[1];
          var trusted = ip;
          if (kind !== subnetkind) {
            if (subnetkind === "ipv4" && !ip.isIPv4MappedAddress()) {
              continue;
            }
            if (subnetkind !== "ipv4" && !(subnetrange >= 96 && subnetip.isIPv4MappedAddress())) {
              continue;
            }
            if (!ipconv) {
              ipconv = subnetkind === "ipv4" ? ip.toIPv4Address() : ip.toIPv4MappedAddress();
            }
            trusted = ipconv;
          } else if (kind === "ipv6" && subnetip.isIPv4MappedAddress()) {
            continue;
          }
          if (trusted.match(subnetip, subnetrange)) {
            return true;
          }
        }
        return false;
      }, "trust");
    }
    __name(trustMulti, "trustMulti");
    function trustSingle(subnet) {
      var subnetip = subnet[0];
      var subnetkind = subnetip.kind();
      var subnetisipv4 = subnetkind === "ipv4";
      var subnetrange = subnet[1];
      return /* @__PURE__ */ __name(function trust(addr) {
        if (!isip(addr)) return false;
        var ip = parseip(addr);
        if (ip.kind() === "ipv6" && ip.isIPv4MappedAddress()) {
          ip = ip.toIPv4Address();
        }
        var kind = ip.kind();
        if (kind !== subnetkind) {
          if (subnetisipv4 && !ip.isIPv4MappedAddress()) {
            return false;
          }
          if (!subnetisipv4 && !(subnetrange >= 96 && subnetip.isIPv4MappedAddress())) {
            return false;
          }
          ip = subnetisipv4 ? ip.toIPv4Address() : ip.toIPv4MappedAddress();
        } else if (kind === "ipv6" && subnetip.isIPv4MappedAddress()) {
          return false;
        }
        return ip.match(subnetip, subnetrange);
      }, "trust");
    }
    __name(trustSingle, "trustSingle");
  }
});

// node_modules/express/lib/utils.js
var require_utils2 = __commonJS({
  "node_modules/express/lib/utils.js"(exports) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    var contentDisposition = require_content_disposition();
    var contentType = require_content_type();
    var deprecate = require_browser()("express");
    var flatten = require_array_flatten();
    var mime = require_send().mime;
    var etag = require_etag();
    var proxyaddr = require_proxy_addr();
    var qs = require_lib();
    var querystring = require_querystring();
    exports.etag = createETagGenerator({ weak: false });
    exports.wetag = createETagGenerator({ weak: true });
    exports.isAbsolute = function(path) {
      if ("/" === path[0]) return true;
      if (":" === path[1] && ("\\" === path[2] || "/" === path[2])) return true;
      if ("\\\\" === path.substring(0, 2)) return true;
    };
    exports.flatten = deprecate.function(
      flatten,
      "utils.flatten: use array-flatten npm module instead"
    );
    exports.normalizeType = function(type) {
      return ~type.indexOf("/") ? acceptParams(type) : { value: mime.lookup(type), params: {} };
    };
    exports.normalizeTypes = function(types) {
      var ret = [];
      for (var i = 0; i < types.length; ++i) {
        ret.push(exports.normalizeType(types[i]));
      }
      return ret;
    };
    exports.contentDisposition = deprecate.function(
      contentDisposition,
      "utils.contentDisposition: use content-disposition npm module instead"
    );
    function acceptParams(str) {
      var parts = str.split(/ *; */);
      var ret = { value: parts[0], quality: 1, params: {} };
      for (var i = 1; i < parts.length; ++i) {
        var pms = parts[i].split(/ *= */);
        if ("q" === pms[0]) {
          ret.quality = parseFloat(pms[1]);
        } else {
          ret.params[pms[0]] = pms[1];
        }
      }
      return ret;
    }
    __name(acceptParams, "acceptParams");
    exports.compileETag = function(val) {
      var fn;
      if (typeof val === "function") {
        return val;
      }
      switch (val) {
        case true:
        case "weak":
          fn = exports.wetag;
          break;
        case false:
          break;
        case "strong":
          fn = exports.etag;
          break;
        default:
          throw new TypeError("unknown value for etag function: " + val);
      }
      return fn;
    };
    exports.compileQueryParser = /* @__PURE__ */ __name(function compileQueryParser(val) {
      var fn;
      if (typeof val === "function") {
        return val;
      }
      switch (val) {
        case true:
        case "simple":
          fn = querystring.parse;
          break;
        case false:
          fn = newObject;
          break;
        case "extended":
          fn = parseExtendedQueryString;
          break;
        default:
          throw new TypeError("unknown value for query parser function: " + val);
      }
      return fn;
    }, "compileQueryParser");
    exports.compileTrust = function(val) {
      if (typeof val === "function") return val;
      if (val === true) {
        return function() {
          return true;
        };
      }
      if (typeof val === "number") {
        return function(a, i) {
          return i < val;
        };
      }
      if (typeof val === "string") {
        val = val.split(",").map(function(v) {
          return v.trim();
        });
      }
      return proxyaddr.compile(val || []);
    };
    exports.setCharset = /* @__PURE__ */ __name(function setCharset(type, charset) {
      if (!type || !charset) {
        return type;
      }
      var parsed = contentType.parse(type);
      parsed.parameters.charset = charset;
      return contentType.format(parsed);
    }, "setCharset");
    function createETagGenerator(options) {
      return /* @__PURE__ */ __name(function generateETag(body, encoding) {
        var buf = !Buffer2.isBuffer(body) ? Buffer2.from(body, encoding) : body;
        return etag(buf, options);
      }, "generateETag");
    }
    __name(createETagGenerator, "createETagGenerator");
    function parseExtendedQueryString(str) {
      return qs.parse(str, {
        allowPrototypes: true,
        arrayLimit: 1e3
      });
    }
    __name(parseExtendedQueryString, "parseExtendedQueryString");
    function newObject() {
      return {};
    }
    __name(newObject, "newObject");
  }
});

// node_modules/express/lib/application.js
var require_application = __commonJS({
  "node_modules/express/lib/application.js"(exports, module) {
    "use strict";
    var finalhandler = require_finalhandler();
    var Router = require_router();
    var methods = require_methods();
    var middleware = require_init();
    var query = require_query();
    var debug = require_src()("express:application");
    var View = require_view();
    var http = require_http();
    var compileETag = require_utils2().compileETag;
    var compileQueryParser = require_utils2().compileQueryParser;
    var compileTrust = require_utils2().compileTrust;
    var deprecate = require_browser()("express");
    var flatten = require_array_flatten();
    var merge = require_utils_merge();
    var resolve = require_path().resolve;
    var setPrototypeOf = require_setprototypeof();
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var slice = Array.prototype.slice;
    var app = exports = module.exports = {};
    var trustProxyDefaultSymbol = "@@symbol:trust_proxy_default";
    app.init = /* @__PURE__ */ __name(function init() {
      this.cache = {};
      this.engines = {};
      this.settings = {};
      this.defaultConfiguration();
    }, "init");
    app.defaultConfiguration = /* @__PURE__ */ __name(function defaultConfiguration() {
      var env = "production";
      this.enable("x-powered-by");
      this.set("etag", "weak");
      this.set("env", env);
      this.set("query parser", "extended");
      this.set("subdomain offset", 2);
      this.set("trust proxy", false);
      Object.defineProperty(this.settings, trustProxyDefaultSymbol, {
        configurable: true,
        value: true
      });
      debug("booting in %s mode", env);
      this.on("mount", /* @__PURE__ */ __name(function onmount(parent) {
        if (this.settings[trustProxyDefaultSymbol] === true && typeof parent.settings["trust proxy fn"] === "function") {
          delete this.settings["trust proxy"];
          delete this.settings["trust proxy fn"];
        }
        setPrototypeOf(this.request, parent.request);
        setPrototypeOf(this.response, parent.response);
        setPrototypeOf(this.engines, parent.engines);
        setPrototypeOf(this.settings, parent.settings);
      }, "onmount"));
      this.locals = /* @__PURE__ */ Object.create(null);
      this.mountpath = "/";
      this.locals.settings = this.settings;
      this.set("view", View);
      this.set("views", resolve("views"));
      this.set("jsonp callback name", "callback");
      if (env === "production") {
        this.enable("view cache");
      }
      Object.defineProperty(this, "router", {
        get: /* @__PURE__ */ __name(function() {
          throw new Error("'app.router' is deprecated!\nPlease see the 3.x to 4.x migration guide for details on how to update your app.");
        }, "get")
      });
    }, "defaultConfiguration");
    app.lazyrouter = /* @__PURE__ */ __name(function lazyrouter() {
      if (!this._router) {
        this._router = new Router({
          caseSensitive: this.enabled("case sensitive routing"),
          strict: this.enabled("strict routing")
        });
        this._router.use(query(this.get("query parser fn")));
        this._router.use(middleware.init(this));
      }
    }, "lazyrouter");
    app.handle = /* @__PURE__ */ __name(function handle(req, res, callback) {
      var router = this._router;
      var done = callback || finalhandler(req, res, {
        env: this.get("env"),
        onerror: logerror.bind(this)
      });
      if (!router) {
        debug("no routes defined on app");
        done();
        return;
      }
      router.handle(req, res, done);
    }, "handle");
    app.use = /* @__PURE__ */ __name(function use(fn) {
      var offset = 0;
      var path = "/";
      if (typeof fn !== "function") {
        var arg = fn;
        while (Array.isArray(arg) && arg.length !== 0) {
          arg = arg[0];
        }
        if (typeof arg !== "function") {
          offset = 1;
          path = fn;
        }
      }
      var fns = flatten(slice.call(arguments, offset));
      if (fns.length === 0) {
        throw new TypeError("app.use() requires a middleware function");
      }
      this.lazyrouter();
      var router = this._router;
      fns.forEach(function(fn2) {
        if (!fn2 || !fn2.handle || !fn2.set) {
          return router.use(path, fn2);
        }
        debug(".use app under %s", path);
        fn2.mountpath = path;
        fn2.parent = this;
        router.use(path, /* @__PURE__ */ __name(function mounted_app(req, res, next) {
          var orig = req.app;
          fn2.handle(req, res, function(err) {
            setPrototypeOf(req, orig.request);
            setPrototypeOf(res, orig.response);
            next(err);
          });
        }, "mounted_app"));
        fn2.emit("mount", this);
      }, this);
      return this;
    }, "use");
    app.route = /* @__PURE__ */ __name(function route(path) {
      this.lazyrouter();
      return this._router.route(path);
    }, "route");
    app.engine = /* @__PURE__ */ __name(function engine(ext, fn) {
      if (typeof fn !== "function") {
        throw new Error("callback function required");
      }
      var extension = ext[0] !== "." ? "." + ext : ext;
      this.engines[extension] = fn;
      return this;
    }, "engine");
    app.param = /* @__PURE__ */ __name(function param(name, fn) {
      this.lazyrouter();
      if (Array.isArray(name)) {
        for (var i = 0; i < name.length; i++) {
          this.param(name[i], fn);
        }
        return this;
      }
      this._router.param(name, fn);
      return this;
    }, "param");
    app.set = /* @__PURE__ */ __name(function set(setting, val) {
      if (arguments.length === 1) {
        var settings = this.settings;
        while (settings && settings !== Object.prototype) {
          if (hasOwnProperty.call(settings, setting)) {
            return settings[setting];
          }
          settings = Object.getPrototypeOf(settings);
        }
        return void 0;
      }
      debug('set "%s" to %o', setting, val);
      this.settings[setting] = val;
      switch (setting) {
        case "etag":
          this.set("etag fn", compileETag(val));
          break;
        case "query parser":
          this.set("query parser fn", compileQueryParser(val));
          break;
        case "trust proxy":
          this.set("trust proxy fn", compileTrust(val));
          Object.defineProperty(this.settings, trustProxyDefaultSymbol, {
            configurable: true,
            value: false
          });
          break;
      }
      return this;
    }, "set");
    app.path = /* @__PURE__ */ __name(function path() {
      return this.parent ? this.parent.path() + this.mountpath : "";
    }, "path");
    app.enabled = /* @__PURE__ */ __name(function enabled(setting) {
      return Boolean(this.set(setting));
    }, "enabled");
    app.disabled = /* @__PURE__ */ __name(function disabled(setting) {
      return !this.set(setting);
    }, "disabled");
    app.enable = /* @__PURE__ */ __name(function enable(setting) {
      return this.set(setting, true);
    }, "enable");
    app.disable = /* @__PURE__ */ __name(function disable(setting) {
      return this.set(setting, false);
    }, "disable");
    methods.forEach(function(method) {
      app[method] = function(path) {
        if (method === "get" && arguments.length === 1) {
          return this.set(path);
        }
        this.lazyrouter();
        var route = this._router.route(path);
        route[method].apply(route, slice.call(arguments, 1));
        return this;
      };
    });
    app.all = /* @__PURE__ */ __name(function all(path) {
      this.lazyrouter();
      var route = this._router.route(path);
      var args = slice.call(arguments, 1);
      for (var i = 0; i < methods.length; i++) {
        route[methods[i]].apply(route, args);
      }
      return this;
    }, "all");
    app.del = deprecate.function(app.delete, "app.del: Use app.delete instead");
    app.render = /* @__PURE__ */ __name(function render(name, options, callback) {
      var cache = this.cache;
      var done = callback;
      var engines = this.engines;
      var opts = options;
      var renderOptions = {};
      var view;
      if (typeof options === "function") {
        done = options;
        opts = {};
      }
      merge(renderOptions, this.locals);
      if (opts._locals) {
        merge(renderOptions, opts._locals);
      }
      merge(renderOptions, opts);
      if (renderOptions.cache == null) {
        renderOptions.cache = this.enabled("view cache");
      }
      if (renderOptions.cache) {
        view = cache[name];
      }
      if (!view) {
        var View2 = this.get("view");
        view = new View2(name, {
          defaultEngine: this.get("view engine"),
          root: this.get("views"),
          engines
        });
        if (!view.path) {
          var dirs = Array.isArray(view.root) && view.root.length > 1 ? 'directories "' + view.root.slice(0, -1).join('", "') + '" or "' + view.root[view.root.length - 1] + '"' : 'directory "' + view.root + '"';
          var err = new Error('Failed to lookup view "' + name + '" in views ' + dirs);
          err.view = view;
          return done(err);
        }
        if (renderOptions.cache) {
          cache[name] = view;
        }
      }
      tryRender(view, renderOptions, done);
    }, "render");
    app.listen = /* @__PURE__ */ __name(function listen() {
      var server = http.createServer(this);
      return server.listen.apply(server, arguments);
    }, "listen");
    function logerror(err) {
      if (this.get("env") !== "test") console.error(err.stack || err.toString());
    }
    __name(logerror, "logerror");
    function tryRender(view, options, callback) {
      try {
        view.render(options, callback);
      } catch (err) {
        callback(err);
      }
    }
    __name(tryRender, "tryRender");
  }
});

// node_modules/negotiator/lib/charset.js
var require_charset = __commonJS({
  "node_modules/negotiator/lib/charset.js"(exports, module) {
    "use strict";
    module.exports = preferredCharsets;
    module.exports.preferredCharsets = preferredCharsets;
    var simpleCharsetRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;
    function parseAcceptCharset(accept) {
      var accepts = accept.split(",");
      for (var i = 0, j = 0; i < accepts.length; i++) {
        var charset = parseCharset(accepts[i].trim(), i);
        if (charset) {
          accepts[j++] = charset;
        }
      }
      accepts.length = j;
      return accepts;
    }
    __name(parseAcceptCharset, "parseAcceptCharset");
    function parseCharset(str, i) {
      var match = simpleCharsetRegExp.exec(str);
      if (!match) return null;
      var charset = match[1];
      var q = 1;
      if (match[2]) {
        var params = match[2].split(";");
        for (var j = 0; j < params.length; j++) {
          var p = params[j].trim().split("=");
          if (p[0] === "q") {
            q = parseFloat(p[1]);
            break;
          }
        }
      }
      return {
        charset,
        q,
        i
      };
    }
    __name(parseCharset, "parseCharset");
    function getCharsetPriority(charset, accepted, index) {
      var priority = { o: -1, q: 0, s: 0 };
      for (var i = 0; i < accepted.length; i++) {
        var spec = specify(charset, accepted[i], index);
        if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
          priority = spec;
        }
      }
      return priority;
    }
    __name(getCharsetPriority, "getCharsetPriority");
    function specify(charset, spec, index) {
      var s = 0;
      if (spec.charset.toLowerCase() === charset.toLowerCase()) {
        s |= 1;
      } else if (spec.charset !== "*") {
        return null;
      }
      return {
        i: index,
        o: spec.i,
        q: spec.q,
        s
      };
    }
    __name(specify, "specify");
    function preferredCharsets(accept, provided) {
      var accepts = parseAcceptCharset(accept === void 0 ? "*" : accept || "");
      if (!provided) {
        return accepts.filter(isQuality).sort(compareSpecs).map(getFullCharset);
      }
      var priorities = provided.map(/* @__PURE__ */ __name(function getPriority(type, index) {
        return getCharsetPriority(type, accepts, index);
      }, "getPriority"));
      return priorities.filter(isQuality).sort(compareSpecs).map(/* @__PURE__ */ __name(function getCharset(priority) {
        return provided[priorities.indexOf(priority)];
      }, "getCharset"));
    }
    __name(preferredCharsets, "preferredCharsets");
    function compareSpecs(a, b) {
      return b.q - a.q || b.s - a.s || a.o - b.o || a.i - b.i || 0;
    }
    __name(compareSpecs, "compareSpecs");
    function getFullCharset(spec) {
      return spec.charset;
    }
    __name(getFullCharset, "getFullCharset");
    function isQuality(spec) {
      return spec.q > 0;
    }
    __name(isQuality, "isQuality");
  }
});

// node_modules/negotiator/lib/encoding.js
var require_encoding = __commonJS({
  "node_modules/negotiator/lib/encoding.js"(exports, module) {
    "use strict";
    module.exports = preferredEncodings;
    module.exports.preferredEncodings = preferredEncodings;
    var simpleEncodingRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;
    function parseAcceptEncoding(accept) {
      var accepts = accept.split(",");
      var hasIdentity = false;
      var minQuality = 1;
      for (var i = 0, j = 0; i < accepts.length; i++) {
        var encoding = parseEncoding(accepts[i].trim(), i);
        if (encoding) {
          accepts[j++] = encoding;
          hasIdentity = hasIdentity || specify("identity", encoding);
          minQuality = Math.min(minQuality, encoding.q || 1);
        }
      }
      if (!hasIdentity) {
        accepts[j++] = {
          encoding: "identity",
          q: minQuality,
          i
        };
      }
      accepts.length = j;
      return accepts;
    }
    __name(parseAcceptEncoding, "parseAcceptEncoding");
    function parseEncoding(str, i) {
      var match = simpleEncodingRegExp.exec(str);
      if (!match) return null;
      var encoding = match[1];
      var q = 1;
      if (match[2]) {
        var params = match[2].split(";");
        for (var j = 0; j < params.length; j++) {
          var p = params[j].trim().split("=");
          if (p[0] === "q") {
            q = parseFloat(p[1]);
            break;
          }
        }
      }
      return {
        encoding,
        q,
        i
      };
    }
    __name(parseEncoding, "parseEncoding");
    function getEncodingPriority(encoding, accepted, index) {
      var priority = { o: -1, q: 0, s: 0 };
      for (var i = 0; i < accepted.length; i++) {
        var spec = specify(encoding, accepted[i], index);
        if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
          priority = spec;
        }
      }
      return priority;
    }
    __name(getEncodingPriority, "getEncodingPriority");
    function specify(encoding, spec, index) {
      var s = 0;
      if (spec.encoding.toLowerCase() === encoding.toLowerCase()) {
        s |= 1;
      } else if (spec.encoding !== "*") {
        return null;
      }
      return {
        i: index,
        o: spec.i,
        q: spec.q,
        s
      };
    }
    __name(specify, "specify");
    function preferredEncodings(accept, provided) {
      var accepts = parseAcceptEncoding(accept || "");
      if (!provided) {
        return accepts.filter(isQuality).sort(compareSpecs).map(getFullEncoding);
      }
      var priorities = provided.map(/* @__PURE__ */ __name(function getPriority(type, index) {
        return getEncodingPriority(type, accepts, index);
      }, "getPriority"));
      return priorities.filter(isQuality).sort(compareSpecs).map(/* @__PURE__ */ __name(function getEncoding(priority) {
        return provided[priorities.indexOf(priority)];
      }, "getEncoding"));
    }
    __name(preferredEncodings, "preferredEncodings");
    function compareSpecs(a, b) {
      return b.q - a.q || b.s - a.s || a.o - b.o || a.i - b.i || 0;
    }
    __name(compareSpecs, "compareSpecs");
    function getFullEncoding(spec) {
      return spec.encoding;
    }
    __name(getFullEncoding, "getFullEncoding");
    function isQuality(spec) {
      return spec.q > 0;
    }
    __name(isQuality, "isQuality");
  }
});

// node_modules/negotiator/lib/language.js
var require_language = __commonJS({
  "node_modules/negotiator/lib/language.js"(exports, module) {
    "use strict";
    module.exports = preferredLanguages;
    module.exports.preferredLanguages = preferredLanguages;
    var simpleLanguageRegExp = /^\s*([^\s\-;]+)(?:-([^\s;]+))?\s*(?:;(.*))?$/;
    function parseAcceptLanguage(accept) {
      var accepts = accept.split(",");
      for (var i = 0, j = 0; i < accepts.length; i++) {
        var language = parseLanguage(accepts[i].trim(), i);
        if (language) {
          accepts[j++] = language;
        }
      }
      accepts.length = j;
      return accepts;
    }
    __name(parseAcceptLanguage, "parseAcceptLanguage");
    function parseLanguage(str, i) {
      var match = simpleLanguageRegExp.exec(str);
      if (!match) return null;
      var prefix = match[1];
      var suffix = match[2];
      var full = prefix;
      if (suffix) full += "-" + suffix;
      var q = 1;
      if (match[3]) {
        var params = match[3].split(";");
        for (var j = 0; j < params.length; j++) {
          var p = params[j].split("=");
          if (p[0] === "q") q = parseFloat(p[1]);
        }
      }
      return {
        prefix,
        suffix,
        q,
        i,
        full
      };
    }
    __name(parseLanguage, "parseLanguage");
    function getLanguagePriority(language, accepted, index) {
      var priority = { o: -1, q: 0, s: 0 };
      for (var i = 0; i < accepted.length; i++) {
        var spec = specify(language, accepted[i], index);
        if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
          priority = spec;
        }
      }
      return priority;
    }
    __name(getLanguagePriority, "getLanguagePriority");
    function specify(language, spec, index) {
      var p = parseLanguage(language);
      if (!p) return null;
      var s = 0;
      if (spec.full.toLowerCase() === p.full.toLowerCase()) {
        s |= 4;
      } else if (spec.prefix.toLowerCase() === p.full.toLowerCase()) {
        s |= 2;
      } else if (spec.full.toLowerCase() === p.prefix.toLowerCase()) {
        s |= 1;
      } else if (spec.full !== "*") {
        return null;
      }
      return {
        i: index,
        o: spec.i,
        q: spec.q,
        s
      };
    }
    __name(specify, "specify");
    function preferredLanguages(accept, provided) {
      var accepts = parseAcceptLanguage(accept === void 0 ? "*" : accept || "");
      if (!provided) {
        return accepts.filter(isQuality).sort(compareSpecs).map(getFullLanguage);
      }
      var priorities = provided.map(/* @__PURE__ */ __name(function getPriority(type, index) {
        return getLanguagePriority(type, accepts, index);
      }, "getPriority"));
      return priorities.filter(isQuality).sort(compareSpecs).map(/* @__PURE__ */ __name(function getLanguage(priority) {
        return provided[priorities.indexOf(priority)];
      }, "getLanguage"));
    }
    __name(preferredLanguages, "preferredLanguages");
    function compareSpecs(a, b) {
      return b.q - a.q || b.s - a.s || a.o - b.o || a.i - b.i || 0;
    }
    __name(compareSpecs, "compareSpecs");
    function getFullLanguage(spec) {
      return spec.full;
    }
    __name(getFullLanguage, "getFullLanguage");
    function isQuality(spec) {
      return spec.q > 0;
    }
    __name(isQuality, "isQuality");
  }
});

// node_modules/negotiator/lib/mediaType.js
var require_mediaType = __commonJS({
  "node_modules/negotiator/lib/mediaType.js"(exports, module) {
    "use strict";
    module.exports = preferredMediaTypes;
    module.exports.preferredMediaTypes = preferredMediaTypes;
    var simpleMediaTypeRegExp = /^\s*([^\s\/;]+)\/([^;\s]+)\s*(?:;(.*))?$/;
    function parseAccept(accept) {
      var accepts = splitMediaTypes(accept);
      for (var i = 0, j = 0; i < accepts.length; i++) {
        var mediaType = parseMediaType(accepts[i].trim(), i);
        if (mediaType) {
          accepts[j++] = mediaType;
        }
      }
      accepts.length = j;
      return accepts;
    }
    __name(parseAccept, "parseAccept");
    function parseMediaType(str, i) {
      var match = simpleMediaTypeRegExp.exec(str);
      if (!match) return null;
      var params = /* @__PURE__ */ Object.create(null);
      var q = 1;
      var subtype = match[2];
      var type = match[1];
      if (match[3]) {
        var kvps = splitParameters(match[3]).map(splitKeyValuePair);
        for (var j = 0; j < kvps.length; j++) {
          var pair = kvps[j];
          var key2 = pair[0].toLowerCase();
          var val = pair[1];
          var value = val && val[0] === '"' && val[val.length - 1] === '"' ? val.substr(1, val.length - 2) : val;
          if (key2 === "q") {
            q = parseFloat(value);
            break;
          }
          params[key2] = value;
        }
      }
      return {
        type,
        subtype,
        params,
        q,
        i
      };
    }
    __name(parseMediaType, "parseMediaType");
    function getMediaTypePriority(type, accepted, index) {
      var priority = { o: -1, q: 0, s: 0 };
      for (var i = 0; i < accepted.length; i++) {
        var spec = specify(type, accepted[i], index);
        if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
          priority = spec;
        }
      }
      return priority;
    }
    __name(getMediaTypePriority, "getMediaTypePriority");
    function specify(type, spec, index) {
      var p = parseMediaType(type);
      var s = 0;
      if (!p) {
        return null;
      }
      if (spec.type.toLowerCase() == p.type.toLowerCase()) {
        s |= 4;
      } else if (spec.type != "*") {
        return null;
      }
      if (spec.subtype.toLowerCase() == p.subtype.toLowerCase()) {
        s |= 2;
      } else if (spec.subtype != "*") {
        return null;
      }
      var keys = Object.keys(spec.params);
      if (keys.length > 0) {
        if (keys.every(function(k) {
          return spec.params[k] == "*" || (spec.params[k] || "").toLowerCase() == (p.params[k] || "").toLowerCase();
        })) {
          s |= 1;
        } else {
          return null;
        }
      }
      return {
        i: index,
        o: spec.i,
        q: spec.q,
        s
      };
    }
    __name(specify, "specify");
    function preferredMediaTypes(accept, provided) {
      var accepts = parseAccept(accept === void 0 ? "*/*" : accept || "");
      if (!provided) {
        return accepts.filter(isQuality).sort(compareSpecs).map(getFullType);
      }
      var priorities = provided.map(/* @__PURE__ */ __name(function getPriority(type, index) {
        return getMediaTypePriority(type, accepts, index);
      }, "getPriority"));
      return priorities.filter(isQuality).sort(compareSpecs).map(/* @__PURE__ */ __name(function getType(priority) {
        return provided[priorities.indexOf(priority)];
      }, "getType"));
    }
    __name(preferredMediaTypes, "preferredMediaTypes");
    function compareSpecs(a, b) {
      return b.q - a.q || b.s - a.s || a.o - b.o || a.i - b.i || 0;
    }
    __name(compareSpecs, "compareSpecs");
    function getFullType(spec) {
      return spec.type + "/" + spec.subtype;
    }
    __name(getFullType, "getFullType");
    function isQuality(spec) {
      return spec.q > 0;
    }
    __name(isQuality, "isQuality");
    function quoteCount(string) {
      var count = 0;
      var index = 0;
      while ((index = string.indexOf('"', index)) !== -1) {
        count++;
        index++;
      }
      return count;
    }
    __name(quoteCount, "quoteCount");
    function splitKeyValuePair(str) {
      var index = str.indexOf("=");
      var key2;
      var val;
      if (index === -1) {
        key2 = str;
      } else {
        key2 = str.substr(0, index);
        val = str.substr(index + 1);
      }
      return [key2, val];
    }
    __name(splitKeyValuePair, "splitKeyValuePair");
    function splitMediaTypes(accept) {
      var accepts = accept.split(",");
      for (var i = 1, j = 0; i < accepts.length; i++) {
        if (quoteCount(accepts[j]) % 2 == 0) {
          accepts[++j] = accepts[i];
        } else {
          accepts[j] += "," + accepts[i];
        }
      }
      accepts.length = j + 1;
      return accepts;
    }
    __name(splitMediaTypes, "splitMediaTypes");
    function splitParameters(str) {
      var parameters = str.split(";");
      for (var i = 1, j = 0; i < parameters.length; i++) {
        if (quoteCount(parameters[j]) % 2 == 0) {
          parameters[++j] = parameters[i];
        } else {
          parameters[j] += ";" + parameters[i];
        }
      }
      parameters.length = j + 1;
      for (var i = 0; i < parameters.length; i++) {
        parameters[i] = parameters[i].trim();
      }
      return parameters;
    }
    __name(splitParameters, "splitParameters");
  }
});

// node_modules/negotiator/index.js
var require_negotiator = __commonJS({
  "node_modules/negotiator/index.js"(exports, module) {
    "use strict";
    var preferredCharsets = require_charset();
    var preferredEncodings = require_encoding();
    var preferredLanguages = require_language();
    var preferredMediaTypes = require_mediaType();
    module.exports = Negotiator;
    module.exports.Negotiator = Negotiator;
    function Negotiator(request) {
      if (!(this instanceof Negotiator)) {
        return new Negotiator(request);
      }
      this.request = request;
    }
    __name(Negotiator, "Negotiator");
    Negotiator.prototype.charset = /* @__PURE__ */ __name(function charset(available) {
      var set = this.charsets(available);
      return set && set[0];
    }, "charset");
    Negotiator.prototype.charsets = /* @__PURE__ */ __name(function charsets(available) {
      return preferredCharsets(this.request.headers["accept-charset"], available);
    }, "charsets");
    Negotiator.prototype.encoding = /* @__PURE__ */ __name(function encoding(available) {
      var set = this.encodings(available);
      return set && set[0];
    }, "encoding");
    Negotiator.prototype.encodings = /* @__PURE__ */ __name(function encodings(available) {
      return preferredEncodings(this.request.headers["accept-encoding"], available);
    }, "encodings");
    Negotiator.prototype.language = /* @__PURE__ */ __name(function language(available) {
      var set = this.languages(available);
      return set && set[0];
    }, "language");
    Negotiator.prototype.languages = /* @__PURE__ */ __name(function languages(available) {
      return preferredLanguages(this.request.headers["accept-language"], available);
    }, "languages");
    Negotiator.prototype.mediaType = /* @__PURE__ */ __name(function mediaType(available) {
      var set = this.mediaTypes(available);
      return set && set[0];
    }, "mediaType");
    Negotiator.prototype.mediaTypes = /* @__PURE__ */ __name(function mediaTypes(available) {
      return preferredMediaTypes(this.request.headers.accept, available);
    }, "mediaTypes");
    Negotiator.prototype.preferredCharset = Negotiator.prototype.charset;
    Negotiator.prototype.preferredCharsets = Negotiator.prototype.charsets;
    Negotiator.prototype.preferredEncoding = Negotiator.prototype.encoding;
    Negotiator.prototype.preferredEncodings = Negotiator.prototype.encodings;
    Negotiator.prototype.preferredLanguage = Negotiator.prototype.language;
    Negotiator.prototype.preferredLanguages = Negotiator.prototype.languages;
    Negotiator.prototype.preferredMediaType = Negotiator.prototype.mediaType;
    Negotiator.prototype.preferredMediaTypes = Negotiator.prototype.mediaTypes;
  }
});

// node_modules/accepts/index.js
var require_accepts = __commonJS({
  "node_modules/accepts/index.js"(exports, module) {
    "use strict";
    var Negotiator = require_negotiator();
    var mime = require_mime_types();
    module.exports = Accepts;
    function Accepts(req) {
      if (!(this instanceof Accepts)) {
        return new Accepts(req);
      }
      this.headers = req.headers;
      this.negotiator = new Negotiator(req);
    }
    __name(Accepts, "Accepts");
    Accepts.prototype.type = Accepts.prototype.types = function(types_) {
      var types = types_;
      if (types && !Array.isArray(types)) {
        types = new Array(arguments.length);
        for (var i = 0; i < types.length; i++) {
          types[i] = arguments[i];
        }
      }
      if (!types || types.length === 0) {
        return this.negotiator.mediaTypes();
      }
      if (!this.headers.accept) {
        return types[0];
      }
      var mimes = types.map(extToMime);
      var accepts = this.negotiator.mediaTypes(mimes.filter(validMime));
      var first = accepts[0];
      return first ? types[mimes.indexOf(first)] : false;
    };
    Accepts.prototype.encoding = Accepts.prototype.encodings = function(encodings_) {
      var encodings = encodings_;
      if (encodings && !Array.isArray(encodings)) {
        encodings = new Array(arguments.length);
        for (var i = 0; i < encodings.length; i++) {
          encodings[i] = arguments[i];
        }
      }
      if (!encodings || encodings.length === 0) {
        return this.negotiator.encodings();
      }
      return this.negotiator.encodings(encodings)[0] || false;
    };
    Accepts.prototype.charset = Accepts.prototype.charsets = function(charsets_) {
      var charsets = charsets_;
      if (charsets && !Array.isArray(charsets)) {
        charsets = new Array(arguments.length);
        for (var i = 0; i < charsets.length; i++) {
          charsets[i] = arguments[i];
        }
      }
      if (!charsets || charsets.length === 0) {
        return this.negotiator.charsets();
      }
      return this.negotiator.charsets(charsets)[0] || false;
    };
    Accepts.prototype.lang = Accepts.prototype.langs = Accepts.prototype.language = Accepts.prototype.languages = function(languages_) {
      var languages = languages_;
      if (languages && !Array.isArray(languages)) {
        languages = new Array(arguments.length);
        for (var i = 0; i < languages.length; i++) {
          languages[i] = arguments[i];
        }
      }
      if (!languages || languages.length === 0) {
        return this.negotiator.languages();
      }
      return this.negotiator.languages(languages)[0] || false;
    };
    function extToMime(type) {
      return type.indexOf("/") === -1 ? mime.lookup(type) : type;
    }
    __name(extToMime, "extToMime");
    function validMime(type) {
      return typeof type === "string";
    }
    __name(validMime, "validMime");
  }
});

// node_modules/express/lib/request.js
var require_request = __commonJS({
  "node_modules/express/lib/request.js"(exports, module) {
    "use strict";
    var accepts = require_accepts();
    var deprecate = require_browser()("express");
    var isIP = require_net().isIP;
    var typeis = require_type_is();
    var http = require_http();
    var fresh = require_fresh();
    var parseRange = require_range_parser();
    var parse = require_parseurl();
    var proxyaddr = require_proxy_addr();
    var req = Object.create(http.IncomingMessage.prototype);
    module.exports = req;
    req.get = req.header = /* @__PURE__ */ __name(function header(name) {
      if (!name) {
        throw new TypeError("name argument is required to req.get");
      }
      if (typeof name !== "string") {
        throw new TypeError("name must be a string to req.get");
      }
      var lc = name.toLowerCase();
      switch (lc) {
        case "referer":
        case "referrer":
          return this.headers.referrer || this.headers.referer;
        default:
          return this.headers[lc];
      }
    }, "header");
    req.accepts = function() {
      var accept = accepts(this);
      return accept.types.apply(accept, arguments);
    };
    req.acceptsEncodings = function() {
      var accept = accepts(this);
      return accept.encodings.apply(accept, arguments);
    };
    req.acceptsEncoding = deprecate.function(
      req.acceptsEncodings,
      "req.acceptsEncoding: Use acceptsEncodings instead"
    );
    req.acceptsCharsets = function() {
      var accept = accepts(this);
      return accept.charsets.apply(accept, arguments);
    };
    req.acceptsCharset = deprecate.function(
      req.acceptsCharsets,
      "req.acceptsCharset: Use acceptsCharsets instead"
    );
    req.acceptsLanguages = function() {
      var accept = accepts(this);
      return accept.languages.apply(accept, arguments);
    };
    req.acceptsLanguage = deprecate.function(
      req.acceptsLanguages,
      "req.acceptsLanguage: Use acceptsLanguages instead"
    );
    req.range = /* @__PURE__ */ __name(function range(size, options) {
      var range2 = this.get("Range");
      if (!range2) return;
      return parseRange(size, range2, options);
    }, "range");
    req.param = /* @__PURE__ */ __name(function param(name, defaultValue) {
      var params = this.params || {};
      var body = this.body || {};
      var query = this.query || {};
      var args = arguments.length === 1 ? "name" : "name, default";
      deprecate("req.param(" + args + "): Use req.params, req.body, or req.query instead");
      if (null != params[name] && params.hasOwnProperty(name)) return params[name];
      if (null != body[name]) return body[name];
      if (null != query[name]) return query[name];
      return defaultValue;
    }, "param");
    req.is = /* @__PURE__ */ __name(function is(types) {
      var arr = types;
      if (!Array.isArray(types)) {
        arr = new Array(arguments.length);
        for (var i = 0; i < arr.length; i++) {
          arr[i] = arguments[i];
        }
      }
      return typeis(this, arr);
    }, "is");
    defineGetter(req, "protocol", /* @__PURE__ */ __name(function protocol() {
      var proto = this.connection.encrypted ? "https" : "http";
      var trust = this.app.get("trust proxy fn");
      if (!trust(this.connection.remoteAddress, 0)) {
        return proto;
      }
      var header = this.get("X-Forwarded-Proto") || proto;
      var index = header.indexOf(",");
      return index !== -1 ? header.substring(0, index).trim() : header.trim();
    }, "protocol"));
    defineGetter(req, "secure", /* @__PURE__ */ __name(function secure() {
      return this.protocol === "https";
    }, "secure"));
    defineGetter(req, "ip", /* @__PURE__ */ __name(function ip() {
      var trust = this.app.get("trust proxy fn");
      return proxyaddr(this, trust);
    }, "ip"));
    defineGetter(req, "ips", /* @__PURE__ */ __name(function ips() {
      var trust = this.app.get("trust proxy fn");
      var addrs = proxyaddr.all(this, trust);
      addrs.reverse().pop();
      return addrs;
    }, "ips"));
    defineGetter(req, "subdomains", /* @__PURE__ */ __name(function subdomains() {
      var hostname = this.hostname;
      if (!hostname) return [];
      var offset = this.app.get("subdomain offset");
      var subdomains2 = !isIP(hostname) ? hostname.split(".").reverse() : [hostname];
      return subdomains2.slice(offset);
    }, "subdomains"));
    defineGetter(req, "path", /* @__PURE__ */ __name(function path() {
      return parse(this).pathname;
    }, "path"));
    defineGetter(req, "hostname", /* @__PURE__ */ __name(function hostname() {
      var trust = this.app.get("trust proxy fn");
      var host = this.get("X-Forwarded-Host");
      if (!host || !trust(this.connection.remoteAddress, 0)) {
        host = this.get("Host");
      } else if (host.indexOf(",") !== -1) {
        host = host.substring(0, host.indexOf(",")).trimRight();
      }
      if (!host) return;
      var offset = host[0] === "[" ? host.indexOf("]") + 1 : 0;
      var index = host.indexOf(":", offset);
      return index !== -1 ? host.substring(0, index) : host;
    }, "hostname"));
    defineGetter(req, "host", deprecate.function(/* @__PURE__ */ __name(function host() {
      return this.hostname;
    }, "host"), "req.host: Use req.hostname instead"));
    defineGetter(req, "fresh", function() {
      var method = this.method;
      var res = this.res;
      var status = res.statusCode;
      if ("GET" !== method && "HEAD" !== method && "QUERY" !== method) return false;
      if (status >= 200 && status < 300 || 304 === status) {
        return fresh(this.headers, {
          "etag": res.get("ETag"),
          "last-modified": res.get("Last-Modified")
        });
      }
      return false;
    });
    defineGetter(req, "stale", /* @__PURE__ */ __name(function stale() {
      return !this.fresh;
    }, "stale"));
    defineGetter(req, "xhr", /* @__PURE__ */ __name(function xhr() {
      var val = this.get("X-Requested-With") || "";
      return val.toLowerCase() === "xmlhttprequest";
    }, "xhr"));
    function defineGetter(obj, name, getter) {
      Object.defineProperty(obj, name, {
        configurable: true,
        enumerable: true,
        get: getter
      });
    }
    __name(defineGetter, "defineGetter");
  }
});

// node_modules/cookie-signature/index.js
var require_cookie_signature = __commonJS({
  "node_modules/cookie-signature/index.js"(exports) {
    var crypto = require_crypto();
    exports.sign = function(val, secret) {
      if ("string" !== typeof val) throw new TypeError("Cookie value must be provided as a string.");
      if (null == secret) throw new TypeError("Secret key must be provided.");
      return val + "." + crypto.createHmac("sha256", secret).update(val).digest("base64").replace(/\=+$/, "");
    };
    exports.unsign = function(val, secret) {
      if ("string" !== typeof val) throw new TypeError("Signed cookie string must be provided.");
      if (null == secret) throw new TypeError("Secret key must be provided.");
      var str = val.slice(0, val.lastIndexOf(".")), mac = exports.sign(str, secret);
      return sha1(mac) == sha1(val) ? str : false;
    };
    function sha1(str) {
      return crypto.createHash("sha1").update(str).digest("hex");
    }
    __name(sha1, "sha1");
  }
});

// node_modules/cookie/index.js
var require_cookie = __commonJS({
  "node_modules/cookie/index.js"(exports) {
    "use strict";
    exports.parse = parse;
    exports.serialize = serialize;
    var __toString = Object.prototype.toString;
    var __hasOwnProperty = Object.prototype.hasOwnProperty;
    var cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    var cookieValueRegExp = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    function parse(str, opt) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var len = str.length;
      if (len < 2) return obj;
      var dec = opt && opt.decode || decode2;
      var index = 0;
      var eqIdx = 0;
      var endIdx = 0;
      do {
        eqIdx = str.indexOf("=", index);
        if (eqIdx === -1) break;
        endIdx = str.indexOf(";", index);
        if (endIdx === -1) {
          endIdx = len;
        } else if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        var keyStartIdx = startIndex(str, index, eqIdx);
        var keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        var key2 = str.slice(keyStartIdx, keyEndIdx);
        if (!__hasOwnProperty.call(obj, key2)) {
          var valStartIdx = startIndex(str, eqIdx + 1, endIdx);
          var valEndIdx = endIndex(str, endIdx, valStartIdx);
          if (str.charCodeAt(valStartIdx) === 34 && str.charCodeAt(valEndIdx - 1) === 34) {
            valStartIdx++;
            valEndIdx--;
          }
          var val = str.slice(valStartIdx, valEndIdx);
          obj[key2] = tryDecode(val, dec);
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    __name(parse, "parse");
    function startIndex(str, index, max) {
      do {
        var code = str.charCodeAt(index);
        if (code !== 32 && code !== 9) return index;
      } while (++index < max);
      return max;
    }
    __name(startIndex, "startIndex");
    function endIndex(str, index, min) {
      while (index > min) {
        var code = str.charCodeAt(--index);
        if (code !== 32 && code !== 9) return index + 1;
      }
      return min;
    }
    __name(endIndex, "endIndex");
    function serialize(name, val, opt) {
      var enc = opt && opt.encode || encodeURIComponent;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!cookieNameRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (!opt) return str;
      if (null != opt.maxAge) {
        var maxAge = Math.floor(opt.maxAge);
        if (!isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + maxAge;
      }
      if (opt.domain) {
        if (!domainValueRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!pathValueRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        var expires = opt.expires;
        if (!isDate(expires) || isNaN(expires.valueOf())) {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.partitioned) {
        str += "; Partitioned";
      }
      if (opt.priority) {
        var priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError("option priority is invalid");
        }
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    __name(serialize, "serialize");
    function decode2(str) {
      return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
    }
    __name(decode2, "decode");
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
    __name(isDate, "isDate");
    function tryDecode(str, decode3) {
      try {
        return decode3(str);
      } catch (e) {
        return str;
      }
    }
    __name(tryDecode, "tryDecode");
  }
});

// node_modules/vary/index.js
var require_vary = __commonJS({
  "node_modules/vary/index.js"(exports, module) {
    "use strict";
    module.exports = vary;
    module.exports.append = append;
    var FIELD_NAME_REGEXP = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    function append(header, field) {
      if (typeof header !== "string") {
        throw new TypeError("header argument is required");
      }
      if (!field) {
        throw new TypeError("field argument is required");
      }
      var fields = !Array.isArray(field) ? parse(String(field)) : field;
      for (var j = 0; j < fields.length; j++) {
        if (!FIELD_NAME_REGEXP.test(fields[j])) {
          throw new TypeError("field argument contains an invalid header name");
        }
      }
      if (header === "*") {
        return header;
      }
      var val = header;
      var vals = parse(header.toLowerCase());
      if (fields.indexOf("*") !== -1 || vals.indexOf("*") !== -1) {
        return "*";
      }
      for (var i = 0; i < fields.length; i++) {
        var fld = fields[i].toLowerCase();
        if (vals.indexOf(fld) === -1) {
          vals.push(fld);
          val = val ? val + ", " + fields[i] : fields[i];
        }
      }
      return val;
    }
    __name(append, "append");
    function parse(header) {
      var end = 0;
      var list = [];
      var start = 0;
      for (var i = 0, len = header.length; i < len; i++) {
        switch (header.charCodeAt(i)) {
          case 32:
            if (start === end) {
              start = end = i + 1;
            }
            break;
          case 44:
            list.push(header.substring(start, end));
            start = end = i + 1;
            break;
          default:
            end = i + 1;
            break;
        }
      }
      list.push(header.substring(start, end));
      return list;
    }
    __name(parse, "parse");
    function vary(res, field) {
      if (!res || !res.getHeader || !res.setHeader) {
        throw new TypeError("res argument is required");
      }
      var val = res.getHeader("Vary") || "";
      var header = Array.isArray(val) ? val.join(", ") : String(val);
      if (val = append(header, field)) {
        res.setHeader("Vary", val);
      }
    }
    __name(vary, "vary");
  }
});

// node_modules/express/lib/response.js
var require_response = __commonJS({
  "node_modules/express/lib/response.js"(exports, module) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    var contentDisposition = require_content_disposition();
    var createError = require_http_errors();
    var deprecate = require_browser()("express");
    var encodeUrl = require_encodeurl();
    var escapeHtml = require_escape_html();
    var http = require_http();
    var isAbsolute = require_utils2().isAbsolute;
    var onFinished = require_on_finished();
    var path = require_path();
    var statuses = require_statuses();
    var merge = require_utils_merge();
    var sign = require_cookie_signature().sign;
    var normalizeType = require_utils2().normalizeType;
    var normalizeTypes = require_utils2().normalizeTypes;
    var setCharset = require_utils2().setCharset;
    var cookie = require_cookie();
    var send = require_send();
    var extname = path.extname;
    var mime = send.mime;
    var resolve = path.resolve;
    var vary = require_vary();
    var res = Object.create(http.ServerResponse.prototype);
    module.exports = res;
    var charsetRegExp = /;\s*charset\s*=/;
    res.status = /* @__PURE__ */ __name(function status(code) {
      if ((typeof code === "string" || Math.floor(code) !== code) && code > 99 && code < 1e3) {
        deprecate("res.status(" + JSON.stringify(code) + "): use res.status(" + Math.floor(code) + ") instead");
      }
      this.statusCode = code;
      return this;
    }, "status");
    res.links = function(links) {
      var link = this.get("Link") || "";
      if (link) link += ", ";
      return this.set("Link", link + Object.keys(links).map(function(rel) {
        return "<" + links[rel] + '>; rel="' + rel + '"';
      }).join(", "));
    };
    res.send = /* @__PURE__ */ __name(function send2(body) {
      var chunk = body;
      var encoding;
      var req = this.req;
      var type;
      var app = this.app;
      if (arguments.length === 2) {
        if (typeof arguments[0] !== "number" && typeof arguments[1] === "number") {
          deprecate("res.send(body, status): Use res.status(status).send(body) instead");
          this.statusCode = arguments[1];
        } else {
          deprecate("res.send(status, body): Use res.status(status).send(body) instead");
          this.statusCode = arguments[0];
          chunk = arguments[1];
        }
      }
      if (typeof chunk === "number" && arguments.length === 1) {
        if (!this.get("Content-Type")) {
          this.type("txt");
        }
        deprecate("res.send(status): Use res.sendStatus(status) instead");
        this.statusCode = chunk;
        chunk = statuses.message[chunk];
      }
      switch (typeof chunk) {
        // string defaulting to html
        case "string":
          if (!this.get("Content-Type")) {
            this.type("html");
          }
          break;
        case "boolean":
        case "number":
        case "object":
          if (chunk === null) {
            chunk = "";
          } else if (Buffer2.isBuffer(chunk)) {
            if (!this.get("Content-Type")) {
              this.type("bin");
            }
          } else {
            return this.json(chunk);
          }
          break;
      }
      if (typeof chunk === "string") {
        encoding = "utf8";
        type = this.get("Content-Type");
        if (typeof type === "string") {
          this.set("Content-Type", setCharset(type, "utf-8"));
        }
      }
      var etagFn = app.get("etag fn");
      var generateETag = !this.get("ETag") && typeof etagFn === "function";
      var len;
      if (chunk !== void 0) {
        if (Buffer2.isBuffer(chunk)) {
          len = chunk.length;
        } else if (!generateETag && chunk.length < 1e3) {
          len = Buffer2.byteLength(chunk, encoding);
        } else {
          chunk = Buffer2.from(chunk, encoding);
          encoding = void 0;
          len = chunk.length;
        }
        this.set("Content-Length", len);
      }
      var etag;
      if (generateETag && len !== void 0) {
        if (etag = etagFn(chunk, encoding)) {
          this.set("ETag", etag);
        }
      }
      if (req.fresh) this.statusCode = 304;
      if (204 === this.statusCode || 304 === this.statusCode) {
        this.removeHeader("Content-Type");
        this.removeHeader("Content-Length");
        this.removeHeader("Transfer-Encoding");
        chunk = "";
      }
      if (this.statusCode === 205) {
        this.set("Content-Length", "0");
        this.removeHeader("Transfer-Encoding");
        chunk = "";
      }
      if (req.method === "HEAD") {
        this.end();
      } else {
        this.end(chunk, encoding);
      }
      return this;
    }, "send");
    res.json = /* @__PURE__ */ __name(function json(obj) {
      var val = obj;
      if (arguments.length === 2) {
        if (typeof arguments[1] === "number") {
          deprecate("res.json(obj, status): Use res.status(status).json(obj) instead");
          this.statusCode = arguments[1];
        } else {
          deprecate("res.json(status, obj): Use res.status(status).json(obj) instead");
          this.statusCode = arguments[0];
          val = arguments[1];
        }
      }
      var app = this.app;
      var escape2 = app.get("json escape");
      var replacer = app.get("json replacer");
      var spaces = app.get("json spaces");
      var body = stringify(val, replacer, spaces, escape2);
      if (!this.get("Content-Type")) {
        this.set("Content-Type", "application/json");
      }
      return this.send(body);
    }, "json");
    res.jsonp = /* @__PURE__ */ __name(function jsonp(obj) {
      var val = obj;
      if (arguments.length === 2) {
        if (typeof arguments[1] === "number") {
          deprecate("res.jsonp(obj, status): Use res.status(status).jsonp(obj) instead");
          this.statusCode = arguments[1];
        } else {
          deprecate("res.jsonp(status, obj): Use res.status(status).jsonp(obj) instead");
          this.statusCode = arguments[0];
          val = arguments[1];
        }
      }
      var app = this.app;
      var escape2 = app.get("json escape");
      var replacer = app.get("json replacer");
      var spaces = app.get("json spaces");
      var body = stringify(val, replacer, spaces, escape2);
      var callback = this.req.query[app.get("jsonp callback name")];
      if (!this.get("Content-Type")) {
        this.set("X-Content-Type-Options", "nosniff");
        this.set("Content-Type", "application/json");
      }
      if (Array.isArray(callback)) {
        callback = callback[0];
      }
      if (typeof callback === "string" && callback.length !== 0) {
        this.set("X-Content-Type-Options", "nosniff");
        this.set("Content-Type", "text/javascript");
        callback = callback.replace(/[^\[\]\w$.]/g, "");
        if (body === void 0) {
          body = "";
        } else if (typeof body === "string") {
          body = body.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
        }
        body = "/**/ typeof " + callback + " === 'function' && " + callback + "(" + body + ");";
      }
      return this.send(body);
    }, "jsonp");
    res.sendStatus = /* @__PURE__ */ __name(function sendStatus(statusCode) {
      var body = statuses.message[statusCode] || String(statusCode);
      this.statusCode = statusCode;
      this.type("txt");
      return this.send(body);
    }, "sendStatus");
    res.sendFile = /* @__PURE__ */ __name(function sendFile(path2, options, callback) {
      var done = callback;
      var req = this.req;
      var res2 = this;
      var next = req.next;
      var opts = options || {};
      if (!path2) {
        throw new TypeError("path argument is required to res.sendFile");
      }
      if (typeof path2 !== "string") {
        throw new TypeError("path must be a string to res.sendFile");
      }
      if (typeof options === "function") {
        done = options;
        opts = {};
      }
      if (!opts.root && !isAbsolute(path2)) {
        throw new TypeError("path must be absolute or specify root to res.sendFile");
      }
      var pathname = encodeURI(path2);
      var file = send(req, pathname, opts);
      sendfile(res2, file, opts, function(err) {
        if (done) return done(err);
        if (err && err.code === "EISDIR") return next();
        if (err && err.code !== "ECONNABORTED" && err.syscall !== "write") {
          next(err);
        }
      });
    }, "sendFile");
    res.sendfile = function(path2, options, callback) {
      var done = callback;
      var req = this.req;
      var res2 = this;
      var next = req.next;
      var opts = options || {};
      if (typeof options === "function") {
        done = options;
        opts = {};
      }
      var file = send(req, path2, opts);
      sendfile(res2, file, opts, function(err) {
        if (done) return done(err);
        if (err && err.code === "EISDIR") return next();
        if (err && err.code !== "ECONNABORTED" && err.syscall !== "write") {
          next(err);
        }
      });
    };
    res.sendfile = deprecate.function(
      res.sendfile,
      "res.sendfile: Use res.sendFile instead"
    );
    res.download = /* @__PURE__ */ __name(function download(path2, filename, options, callback) {
      var done = callback;
      var name = filename;
      var opts = options || null;
      if (typeof filename === "function") {
        done = filename;
        name = null;
        opts = null;
      } else if (typeof options === "function") {
        done = options;
        opts = null;
      }
      if (typeof filename === "object" && (typeof options === "function" || options === void 0)) {
        name = null;
        opts = filename;
      }
      var headers = {
        "Content-Disposition": contentDisposition(name || path2)
      };
      if (opts && opts.headers) {
        var keys = Object.keys(opts.headers);
        for (var i = 0; i < keys.length; i++) {
          var key2 = keys[i];
          if (key2.toLowerCase() !== "content-disposition") {
            headers[key2] = opts.headers[key2];
          }
        }
      }
      opts = Object.create(opts);
      opts.headers = headers;
      var fullPath = !opts.root ? resolve(path2) : path2;
      return this.sendFile(fullPath, opts, done);
    }, "download");
    res.contentType = res.type = /* @__PURE__ */ __name(function contentType(type) {
      var ct = type.indexOf("/") === -1 ? mime.lookup(type) : type;
      return this.set("Content-Type", ct);
    }, "contentType");
    res.format = function(obj) {
      var req = this.req;
      var next = req.next;
      var keys = Object.keys(obj).filter(function(v) {
        return v !== "default";
      });
      var key2 = keys.length > 0 ? req.accepts(keys) : false;
      this.vary("Accept");
      if (key2) {
        this.set("Content-Type", normalizeType(key2).value);
        obj[key2](req, this, next);
      } else if (obj.default) {
        obj.default(req, this, next);
      } else {
        next(createError(406, {
          types: normalizeTypes(keys).map(function(o) {
            return o.value;
          })
        }));
      }
      return this;
    };
    res.attachment = /* @__PURE__ */ __name(function attachment(filename) {
      if (filename) {
        this.type(extname(filename));
      }
      this.set("Content-Disposition", contentDisposition(filename));
      return this;
    }, "attachment");
    res.append = /* @__PURE__ */ __name(function append(field, val) {
      var prev = this.get(field);
      var value = val;
      if (prev) {
        value = Array.isArray(prev) ? prev.concat(val) : Array.isArray(val) ? [prev].concat(val) : [prev, val];
      }
      return this.set(field, value);
    }, "append");
    res.set = res.header = /* @__PURE__ */ __name(function header(field, val) {
      if (arguments.length === 2) {
        var value = Array.isArray(val) ? val.map(String) : String(val);
        if (field.toLowerCase() === "content-type") {
          if (Array.isArray(value)) {
            throw new TypeError("Content-Type cannot be set to an Array");
          }
          if (!charsetRegExp.test(value)) {
            var charset = mime.charsets.lookup(value.split(";")[0]);
            if (charset) value += "; charset=" + charset.toLowerCase();
          }
        }
        this.setHeader(field, value);
      } else {
        for (var key2 in field) {
          this.set(key2, field[key2]);
        }
      }
      return this;
    }, "header");
    res.get = function(field) {
      return this.getHeader(field);
    };
    res.clearCookie = /* @__PURE__ */ __name(function clearCookie(name, options) {
      if (options) {
        if (options.maxAge) {
          deprecate('res.clearCookie: Passing "options.maxAge" is deprecated. In v5.0.0 of Express, this option will be ignored, as res.clearCookie will automatically set cookies to expire immediately. Please update your code to omit this option.');
        }
        if (options.expires) {
          deprecate('res.clearCookie: Passing "options.expires" is deprecated. In v5.0.0 of Express, this option will be ignored, as res.clearCookie will automatically set cookies to expire immediately. Please update your code to omit this option.');
        }
      }
      var opts = merge({ expires: /* @__PURE__ */ new Date(1), path: "/" }, options);
      return this.cookie(name, "", opts);
    }, "clearCookie");
    res.cookie = function(name, value, options) {
      var opts = merge({}, options);
      var secret = this.req.secret;
      var signed = opts.signed;
      if (signed && !secret) {
        throw new Error('cookieParser("secret") required for signed cookies');
      }
      var val = typeof value === "object" ? "j:" + JSON.stringify(value) : String(value);
      if (signed) {
        val = "s:" + sign(val, secret);
      }
      if (opts.maxAge != null) {
        var maxAge = opts.maxAge - 0;
        if (!isNaN(maxAge)) {
          opts.expires = new Date(Date.now() + maxAge);
          opts.maxAge = Math.floor(maxAge / 1e3);
        }
      }
      if (opts.path == null) {
        opts.path = "/";
      }
      this.append("Set-Cookie", cookie.serialize(name, String(val), opts));
      return this;
    };
    res.location = /* @__PURE__ */ __name(function location(url) {
      var loc;
      if (url === "back") {
        deprecate('res.location("back"): use res.location(req.get("Referrer") || "/") and refer to https://dub.sh/security-redirect for best practices');
        loc = this.req.get("Referrer") || "/";
      } else {
        loc = String(url);
      }
      return this.set("Location", encodeUrl(loc));
    }, "location");
    res.redirect = /* @__PURE__ */ __name(function redirect(url) {
      var address = url;
      var body;
      var status = 302;
      if (arguments.length === 2) {
        if (typeof arguments[0] === "number") {
          status = arguments[0];
          address = arguments[1];
        } else {
          deprecate("res.redirect(url, status): Use res.redirect(status, url) instead");
          status = arguments[1];
        }
      }
      address = this.location(address).get("Location");
      this.format({
        text: /* @__PURE__ */ __name(function() {
          body = statuses.message[status] + ". Redirecting to " + address;
        }, "text"),
        html: /* @__PURE__ */ __name(function() {
          var u = escapeHtml(address);
          body = "<p>" + statuses.message[status] + ". Redirecting to " + u + "</p>";
        }, "html"),
        default: /* @__PURE__ */ __name(function() {
          body = "";
        }, "default")
      });
      this.statusCode = status;
      this.set("Content-Length", Buffer2.byteLength(body));
      if (this.req.method === "HEAD") {
        this.end();
      } else {
        this.end(body);
      }
    }, "redirect");
    res.vary = function(field) {
      if (!field || Array.isArray(field) && !field.length) {
        deprecate("res.vary(): Provide a field name");
        return this;
      }
      vary(this, field);
      return this;
    };
    res.render = /* @__PURE__ */ __name(function render(view, options, callback) {
      var app = this.req.app;
      var done = callback;
      var opts = options || {};
      var req = this.req;
      var self = this;
      if (typeof options === "function") {
        done = options;
        opts = {};
      }
      opts._locals = self.locals;
      done = done || function(err, str) {
        if (err) return req.next(err);
        self.send(str);
      };
      app.render(view, opts, done);
    }, "render");
    function sendfile(res2, file, options, callback) {
      var done = false;
      var streaming;
      function onaborted() {
        if (done) return;
        done = true;
        var err = new Error("Request aborted");
        err.code = "ECONNABORTED";
        callback(err);
      }
      __name(onaborted, "onaborted");
      function ondirectory() {
        if (done) return;
        done = true;
        var err = new Error("EISDIR, read");
        err.code = "EISDIR";
        callback(err);
      }
      __name(ondirectory, "ondirectory");
      function onerror(err) {
        if (done) return;
        done = true;
        callback(err);
      }
      __name(onerror, "onerror");
      function onend() {
        if (done) return;
        done = true;
        callback();
      }
      __name(onend, "onend");
      function onfile() {
        streaming = false;
      }
      __name(onfile, "onfile");
      function onfinish(err) {
        if (err && err.code === "ECONNRESET") return onaborted();
        if (err) return onerror(err);
        if (done) return;
        setImmediate(function() {
          if (streaming !== false && !done) {
            onaborted();
            return;
          }
          if (done) return;
          done = true;
          callback();
        });
      }
      __name(onfinish, "onfinish");
      function onstream() {
        streaming = true;
      }
      __name(onstream, "onstream");
      file.on("directory", ondirectory);
      file.on("end", onend);
      file.on("error", onerror);
      file.on("file", onfile);
      file.on("stream", onstream);
      onFinished(res2, onfinish);
      if (options.headers) {
        file.on("headers", /* @__PURE__ */ __name(function headers(res3) {
          var obj = options.headers;
          var keys = Object.keys(obj);
          for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            res3.setHeader(k, obj[k]);
          }
        }, "headers"));
      }
      file.pipe(res2);
    }
    __name(sendfile, "sendfile");
    function stringify(value, replacer, spaces, escape2) {
      var json = replacer || spaces ? JSON.stringify(value, replacer, spaces) : JSON.stringify(value);
      if (escape2 && typeof json === "string") {
        json = json.replace(/[<>&]/g, function(c) {
          switch (c.charCodeAt(0)) {
            case 60:
              return "\\u003c";
            case 62:
              return "\\u003e";
            case 38:
              return "\\u0026";
            /* istanbul ignore next: unreachable default */
            default:
              return c;
          }
        });
      }
      return json;
    }
    __name(stringify, "stringify");
  }
});

// node_modules/serve-static/index.js
var require_serve_static = __commonJS({
  "node_modules/serve-static/index.js"(exports, module) {
    "use strict";
    var encodeUrl = require_encodeurl();
    var escapeHtml = require_escape_html();
    var parseUrl = require_parseurl();
    var resolve = require_path().resolve;
    var send = require_send();
    var url = require_url();
    module.exports = serveStatic;
    module.exports.mime = send.mime;
    function serveStatic(root, options) {
      if (!root) {
        throw new TypeError("root path required");
      }
      if (typeof root !== "string") {
        throw new TypeError("root path must be a string");
      }
      var opts = Object.create(options || null);
      var fallthrough = opts.fallthrough !== false;
      var redirect = opts.redirect !== false;
      var setHeaders = opts.setHeaders;
      if (setHeaders && typeof setHeaders !== "function") {
        throw new TypeError("option setHeaders must be function");
      }
      opts.maxage = opts.maxage || opts.maxAge || 0;
      opts.root = resolve(root);
      var onDirectory = redirect ? createRedirectDirectoryListener() : createNotFoundDirectoryListener();
      return /* @__PURE__ */ __name(function serveStatic2(req, res, next) {
        if (req.method !== "GET" && req.method !== "HEAD") {
          if (fallthrough) {
            return next();
          }
          res.statusCode = 405;
          res.setHeader("Allow", "GET, HEAD");
          res.setHeader("Content-Length", "0");
          res.end();
          return;
        }
        var forwardError = !fallthrough;
        var originalUrl = parseUrl.original(req);
        var path = parseUrl(req).pathname;
        if (path === "/" && originalUrl.pathname.substr(-1) !== "/") {
          path = "";
        }
        var stream = send(req, path, opts);
        stream.on("directory", onDirectory);
        if (setHeaders) {
          stream.on("headers", setHeaders);
        }
        if (fallthrough) {
          stream.on("file", /* @__PURE__ */ __name(function onFile() {
            forwardError = true;
          }, "onFile"));
        }
        stream.on("error", /* @__PURE__ */ __name(function error(err) {
          if (forwardError || !(err.statusCode < 500)) {
            next(err);
            return;
          }
          next();
        }, "error"));
        stream.pipe(res);
      }, "serveStatic");
    }
    __name(serveStatic, "serveStatic");
    function collapseLeadingSlashes(str) {
      for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) !== 47) {
          break;
        }
      }
      return i > 1 ? "/" + str.substr(i) : str;
    }
    __name(collapseLeadingSlashes, "collapseLeadingSlashes");
    function createHtmlDocument(title, body) {
      return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>' + title + "</title>\n</head>\n<body>\n<pre>" + body + "</pre>\n</body>\n</html>\n";
    }
    __name(createHtmlDocument, "createHtmlDocument");
    function createNotFoundDirectoryListener() {
      return /* @__PURE__ */ __name(function notFound() {
        this.error(404);
      }, "notFound");
    }
    __name(createNotFoundDirectoryListener, "createNotFoundDirectoryListener");
    function createRedirectDirectoryListener() {
      return /* @__PURE__ */ __name(function redirect(res) {
        if (this.hasTrailingSlash()) {
          this.error(404);
          return;
        }
        var originalUrl = parseUrl.original(this.req);
        originalUrl.path = null;
        originalUrl.pathname = collapseLeadingSlashes(originalUrl.pathname + "/");
        var loc = encodeUrl(url.format(originalUrl));
        var doc = createHtmlDocument("Redirecting", "Redirecting to " + escapeHtml(loc));
        res.statusCode = 301;
        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        res.setHeader("Content-Length", Buffer.byteLength(doc));
        res.setHeader("Content-Security-Policy", "default-src 'none'");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Location", loc);
        res.end(doc);
      }, "redirect");
    }
    __name(createRedirectDirectoryListener, "createRedirectDirectoryListener");
  }
});

// node_modules/express/lib/express.js
var require_express = __commonJS({
  "node_modules/express/lib/express.js"(exports, module) {
    "use strict";
    var bodyParser = require_body_parser();
    var EventEmitter = require_events().EventEmitter;
    var mixin = require_merge_descriptors();
    var proto = require_application();
    var Route = require_route();
    var Router = require_router();
    var req = require_request();
    var res = require_response();
    exports = module.exports = createApplication2;
    function createApplication2() {
      var app = /* @__PURE__ */ __name(function(req2, res2, next) {
        app.handle(req2, res2, next);
      }, "app");
      mixin(app, EventEmitter.prototype, false);
      mixin(app, proto, false);
      app.request = Object.create(req, {
        app: { configurable: true, enumerable: true, writable: true, value: app }
      });
      app.response = Object.create(res, {
        app: { configurable: true, enumerable: true, writable: true, value: app }
      });
      app.init();
      return app;
    }
    __name(createApplication2, "createApplication");
    exports.application = proto;
    exports.request = req;
    exports.response = res;
    exports.Route = Route;
    exports.Router = Router;
    exports.json = bodyParser.json;
    exports.query = require_query();
    exports.raw = bodyParser.raw;
    exports.static = require_serve_static();
    exports.text = bodyParser.text;
    exports.urlencoded = bodyParser.urlencoded;
    var removedMiddlewares = [
      "bodyParser",
      "compress",
      "cookieSession",
      "session",
      "logger",
      "cookieParser",
      "favicon",
      "responseTime",
      "errorHandler",
      "timeout",
      "methodOverride",
      "vhost",
      "csrf",
      "directory",
      "limit",
      "multipart",
      "staticCache"
    ];
    removedMiddlewares.forEach(function(name) {
      Object.defineProperty(exports, name, {
        get: /* @__PURE__ */ __name(function() {
          throw new Error("Most middleware (like " + name + ") is no longer bundled with Express and must be installed separately. Please see https://github.com/senchalabs/connect#middleware.");
        }, "get"),
        configurable: true
      });
    });
  }
});

// node_modules/express/index.js
var require_express2 = __commonJS({
  "node_modules/express/index.js"(exports, module) {
    "use strict";
    module.exports = require_express();
  }
});

// cloudflare/abWorker.ts
import { DurableObject } from "cloudflare:workers";
import { createServer } from "node:http";
import { handleAsNodeRequest } from "cloudflare:node";
import { randomUUID as randomUUID16 } from "node:crypto";

// server/application.ts
var import_express = __toESM(require_express2(), 1);
import { randomUUID as randomUUID14 } from "node:crypto";

// server/asyncDatabase.ts
import { AsyncLocalStorage } from "node:async_hooks";
var adapters = /* @__PURE__ */ new WeakMap();
function asyncDatabase(source) {
  if ("async" in source && source.async) return source;
  const existing = adapters.get(source);
  if (existing) return existing;
  const db = source, context = new AsyncLocalStorage();
  let tail = Promise.resolve();
  async function exclusive(fn) {
    if (context.getStore()) return fn();
    const prior = tail;
    let release;
    tail = new Promise((r) => {
      release = r;
    });
    await prior;
    try {
      return await context.run(true, fn);
    } finally {
      release();
    }
  }
  __name(exclusive, "exclusive");
  const adapter = {
    async: true,
    prepare(sql) {
      return {
        get: /* @__PURE__ */ __name((...a) => exclusive(() => db.prepare(sql).get(...a)), "get"),
        all: /* @__PURE__ */ __name((...a) => exclusive(() => db.prepare(sql).all(...a)), "all"),
        run: /* @__PURE__ */ __name((...a) => exclusive(() => db.prepare(sql).run(...a)), "run")
      };
    },
    transaction(callback) {
      return () => exclusive(async () => {
        db.prepare("SAVEPOINT sakura_async_transaction").run();
        try {
          const result = await callback();
          db.prepare("RELEASE SAVEPOINT sakura_async_transaction").run();
          return result;
        } catch (e) {
          db.prepare("ROLLBACK TO SAVEPOINT sakura_async_transaction").run();
          db.prepare("RELEASE SAVEPOINT sakura_async_transaction").run();
          throw e;
        }
      });
    }
  };
  adapters.set(source, adapter);
  return adapter;
}
__name(asyncDatabase, "asyncDatabase");
var configured = /* @__PURE__ */ new WeakSet();
function installAsyncRoutes(app) {
  if (configured.has(app)) return;
  configured.add(app);
  for (const method of [
    "get",
    "post",
    "patch",
    "put",
    "delete",
    "use"
  ]) {
    const original = app[method].bind(app);
    app[method] = (...args) => original(
      ...args.map(
        (arg) => typeof arg === "function" && arg.length !== 4 ? (req, res, next) => {
          try {
            Promise.resolve(arg(req, res, next)).catch(next);
          } catch (e) {
            next(e);
          }
        } : arg
      )
    );
  }
}
__name(installAsyncRoutes, "installAsyncRoutes");
async function asyncFilter(items, predicate) {
  const flags = await Promise.all(items.map(predicate));
  return items.filter((_, i) => flags[i]);
}
__name(asyncFilter, "asyncFilter");
async function asyncSome(items, predicate) {
  for (let i = 0; i < items.length; i++)
    if (await predicate(items[i], i)) return true;
  return false;
}
__name(asyncSome, "asyncSome");
async function asyncEach(items, callback) {
  for (let i = 0; i < items.length; i++) await callback(items[i], i);
}
__name(asyncEach, "asyncEach");

// server/auth.ts
import { createHash as createHash2, randomBytes as randomBytes2, randomUUID as randomUUID3 } from "node:crypto";

// server/http.ts
import { randomUUID } from "node:crypto";
var HttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
  static {
    __name(this, "HttpError");
  }
};
function text(value, name, options = {}) {
  if (options.optional && (value === void 0 || typeof value === "string" && !value.trim()))
    return "";
  if (typeof value !== "string" || !value.trim())
    throw new HttpError(422, `${name}\u4E0D\u80FD\u4E3A\u7A7A`);
  const result = value.trim();
  if (result.length > (options.max ?? 2e3))
    throw new HttpError(422, `${name}\u8D85\u8FC7\u957F\u5EA6\u9650\u5236`);
  return result;
}
__name(text, "text");
function number(value, name, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max)
    throw new HttpError(422, `${name}\u5FC5\u987B\u4E3A ${min} \u81F3 ${max} \u4E4B\u95F4\u7684\u6570\u5B57`);
  return value;
}
__name(number, "number");
function pagination(query) {
  const parse = /* @__PURE__ */ __name((value, fallback, max) => {
    if (value === void 0) return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value))
      throw new HttpError(422, "\u5206\u9875\u53C2\u6570\u5FC5\u987B\u662F\u6B63\u6574\u6570");
    const result = Number(value);
    if (!Number.isSafeInteger(result) || result < 1 || result > max)
      throw new HttpError(422, "\u5206\u9875\u53C2\u6570\u8D85\u51FA\u8303\u56F4");
    return result;
  }, "parse");
  const page = parse(query.page, 1, 1e5), pageSize = parse(query.pageSize, 20, 100);
  return { page, pageSize, offset: (page - 1) * pageSize };
}
__name(pagination, "pagination");
var apiErrorHandler = /* @__PURE__ */ __name((error, _req, res, _next) => {
  if (res.headersSent) return _next(error);
  const sqliteCode = typeof error?.code === "string" ? error.code : "";
  let status = error instanceof HttpError ? error.status : 500;
  let message = error instanceof HttpError ? error.message : "\u670D\u52A1\u5904\u7406\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5";
  if (sqliteCode.startsWith("SQLITE_CONSTRAINT")) {
    status = /UNIQUE|PRIMARYKEY|FOREIGNKEY/.test(sqliteCode) ? 409 : 422;
    message = status === 409 ? "\u8BB0\u5F55\u91CD\u590D\u6216\u5173\u8054\u5173\u7CFB\u51B2\u7A81" : "\u6570\u636E\u4E0D\u7B26\u5408\u4E1A\u52A1\u7EA6\u675F";
  } else if ([
    "ER_DUP_ENTRY",
    "ER_NO_REFERENCED_ROW_2",
    "ER_ROW_IS_REFERENCED_2"
  ].includes(sqliteCode)) {
    status = 409;
    message = "\u8BB0\u5F55\u91CD\u590D\u6216\u5173\u8054\u5173\u7CFB\u51B2\u7A81";
  } else if ([
    "ER_CHECK_CONSTRAINT_VIOLATED",
    "ER_BAD_NULL_ERROR",
    "ER_DATA_TOO_LONG"
  ].includes(sqliteCode)) {
    status = 422;
    message = "\u6570\u636E\u4E0D\u7B26\u5408\u4E1A\u52A1\u7EA6\u675F";
  } else if (/^(ECONNRESET|ECONNREFUSED|ETIMEDOUT|EPIPE|PROTOCOL_CONNECTION_LOST|PROTOCOL_SEQUENCE_TIMEOUT|POOL_ENQUEUELIMIT|POOL_CLOSED|ER_LOCK_WAIT_TIMEOUT|ER_LOCK_NOWAIT|ER_LOCK_DEADLOCK|DB_COMMIT_UNKNOWN|DB_REDIRECT_BLOCKED)$/.test(
    sqliteCode
  ) || /^SQLITE_(BUSY|LOCKED|IOERR|CANTOPEN|FULL|READONLY|CORRUPT|NOTADB)(_|$)/.test(
    sqliteCode
  ) || /database connection is not open/i.test(String(error?.message || ""))) {
    status = 503;
    message = "\u6570\u636E\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\uFF1B\u8BF7\u52FF\u91CD\u590D\u63D0\u4EA4\u5C1A\u672A\u786E\u8BA4\u7684\u64CD\u4F5C\u3002";
    res.setHeader("Retry-After", "3");
    res.setHeader("Cache-Control", "no-store");
  } else if (error?.type === "entity.parse.failed") {
    status = 400;
    message = "\u8BF7\u6C42 JSON \u683C\u5F0F\u9519\u8BEF";
  } else if (error?.type === "entity.too.large") {
    status = 413;
    message = "\u8BF7\u6C42\u5185\u5BB9\u8FC7\u5927";
  }
  res.status(status).json({
    code: status,
    success: false,
    message,
    data: null,
    ...error instanceof HttpError && error.status === 429 && Number.isSafeInteger(error.retryAfterSeconds) ? { retryAfterSeconds: error.retryAfterSeconds } : {},
    traceId: res.locals.requestId || randomUUID(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
}, "apiErrorHandler");

// server/passwords.ts
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHmac
} from "node:crypto";
var COST = { N: 16384, r: 8, p: 5, maxmem: 32 * 1024 * 1024 };
var legacy = /^scrypt\$([a-f0-9]{32})\$([a-f0-9]{128})$/;
var versioned = /^scrypt\$v2\$16384\$8\$(1|5)\$([a-f0-9]{32})\$(none|[a-z][a-z0-9_-]{0,31})\$([a-f0-9]{128})$/;
function key(policy, id) {
  if (!policy || !Object.hasOwn(policy.keys, id)) return null;
  const value = policy.keys[id];
  if (!/^[A-Za-z0-9_-]{43,86}$/.test(value)) return null;
  const bytes = Buffer.from(value, "base64url");
  return bytes.length >= 32 && bytes.length <= 64 ? bytes : null;
}
__name(key, "key");
function passwordPolicyFromSecret(value) {
  try {
    if (typeof value !== "string" || value.length > 8192) throw Error();
    const parsed = JSON.parse(value);
    if (parsed.requireProtected !== void 0 && typeof parsed.requireProtected !== "boolean")
      throw Error();
    if (!/^[a-z][a-z0-9_-]{0,31}$/.test(parsed.current) || parsed.current === "none" || !parsed.keys || Array.isArray(parsed.keys))
      throw Error();
    const entries = Object.entries(parsed.keys);
    if (entries.length < 1 || entries.length > 4) throw Error();
    const keys = /* @__PURE__ */ Object.create(null);
    for (const [id, secret] of entries) {
      if (!/^[a-z][a-z0-9_-]{0,31}$/.test(id) || id === "none" || typeof secret !== "string")
        throw Error();
      keys[id] = secret;
    }
    const policy = Object.freeze({
      current: parsed.current,
      keys: Object.freeze(keys),
      requireProtected: parsed.requireProtected === true
    });
    if (!key(policy, policy.current) || entries.some(([id]) => !key(policy, id)))
      throw Error();
    return policy;
  } catch {
    throw Object.assign(
      Error("Authentication security configuration unavailable"),
      { code: "AUTH_CONFIG_UNAVAILABLE" }
    );
  }
}
__name(passwordPolicyFromSecret, "passwordPolicyFromSecret");
function protect(derived, salt, p, id, policy) {
  if (id === "none") return derived;
  const secret = key(policy, id);
  if (!secret) throw Error("Password protection key unavailable");
  return createHmac("sha512", secret).update("SakuraEdu/password/v2\0").update(`16384$8$${p}$${salt}\0`).update(derived).digest();
}
__name(protect, "protect");
function encode(derived, salt, p, policy) {
  const id = policy?.current || "none";
  return `scrypt$v2$16384$8$${p}$${salt}$${id}$${protect(derived, salt, p, id, policy).toString("hex")}`;
}
__name(encode, "encode");
function hashPassword(password, policy) {
  if (typeof password !== "string" || password.length > 1024)
    throw Error("Invalid password input");
  const salt = randomBytes(16).toString("hex");
  return encode(scryptSync(password, salt, 64, COST), salt, COST.p, policy);
}
__name(hashPassword, "hashPassword");
function verifyPassword(password, encoded, policy) {
  if (typeof password !== "string" || password.length > 1024 || typeof encoded !== "string")
    return false;
  const old = legacy.exec(encoded);
  if (old && !policy?.requireProtected)
    return timingSafeEqual(
      scryptSync(password, old[1], 64),
      Buffer.from(old[2], "hex")
    );
  const current = versioned.exec(encoded);
  if (!current) return false;
  const [, cost, salt, id, expected] = current;
  if (id === "none" && policy?.requireProtected) return false;
  if (id !== "none" && !key(policy, id)) return false;
  const actual = protect(
    scryptSync(password, salt, 64, { ...COST, p: Number(cost) }),
    salt,
    Number(cost),
    id,
    policy
  );
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
}
__name(verifyPassword, "verifyPassword");
function passwordNeedsUpgrade(encoded, policy) {
  const current = versioned.exec(encoded);
  return !current || Number(current[1]) !== COST.p || current[3] !== (policy?.current || "none");
}
__name(passwordNeedsUpgrade, "passwordNeedsUpgrade");

// server/authProtection.ts
import { createHash } from "node:crypto";
var COOLDOWNS = [30, 60, 120, 900, 10800];
var protectionSql = `CREATE TABLE auth_protection(bucket_hash TEXT PRIMARY KEY,failures INTEGER NOT NULL DEFAULT 0 CHECK(failures>=0),level INTEGER NOT NULL DEFAULT 0 CHECK(level BETWEEN 0 AND 5),blocked_until INTEGER NOT NULL DEFAULT 0 CHECK(blocked_until>=0),updated_at INTEGER NOT NULL)`;
var hash = /* @__PURE__ */ __name((s) => createHash("sha256").update(s).digest("hex"), "hash");
var protectionChecksum = hash(protectionSql);
var AuthFailureLimiter = class {
  constructor(source, now = () => Date.now()) {
    this.now = now;
    this.db = asyncDatabase(source);
  }
  static {
    __name(this, "AuthFailureLimiter");
  }
  async state(key2) {
    return await this.db.prepare(
      "SELECT failures,level,blocked_until,updated_at FROM auth_protection WHERE bucket_hash=?"
    ).get(hash(key2)) || {
      failures: 0,
      level: 0,
      blocked_until: 0,
      updated_at: 0
    };
  }
  async remaining(keys) {
    return Math.max(
      0,
      ...await Promise.all(
        keys.map(
          async (key2) => Math.ceil(
            ((await this.state(key2)).blocked_until - this.now()) / 1e3
          )
        )
      )
    );
  }
  async failure(buckets) {
    return await this.db.transaction(async () => {
      const time = this.now();
      let until = 0;
      for (const { key: key2, threshold, idleResetMs } of buckets) {
        const prior = await this.state(key2);
        if (prior.blocked_until > time) {
          until = Math.max(until, prior.blocked_until);
          continue;
        }
        const expired = idleResetMs !== void 0 && time - prior.updated_at >= idleResetMs;
        let failures = (expired ? 0 : prior.failures) + 1, level = expired ? 0 : prior.level, blocked = 0;
        if (failures >= threshold) {
          blocked = time + COOLDOWNS[Math.min(level, COOLDOWNS.length - 1)] * 1e3;
          level = Math.min(level + 1, COOLDOWNS.length);
          failures = 0;
        }
        await this.db.prepare(
          "INSERT INTO auth_protection(bucket_hash,failures,level,blocked_until,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(bucket_hash) DO UPDATE SET failures=excluded.failures,level=excluded.level,blocked_until=excluded.blocked_until,updated_at=excluded.updated_at"
        ).run(hash(key2), failures, level, blocked, time);
        until = Math.max(until, blocked);
      }
      return Math.max(0, Math.ceil((until - time) / 1e3));
    })();
  }
  async reset(key2) {
    await this.db.prepare("DELETE FROM auth_protection WHERE bucket_hash=?").run(hash(key2));
  }
};
function withAuthProtection(source, kind, handler, trustCloudflare = false) {
  const db = asyncDatabase(source);
  const limiter = new AuthFailureLimiter(db);
  return async (req, res, next) => {
    const input = String(
      (kind === "login" ? req.body?.facultyId : req.body?.facultyCode) || ""
    ).trim().toLowerCase().slice(0, 128);
    const user = kind === "login" ? await db.prepare(
      "SELECT id FROM faculty_users WHERE faculty_code=? COLLATE NOCASE OR email=? COLLATE NOCASE OR phone=?"
    ).get(input, input, input) : void 0;
    const account = `${kind}:account:${user?.id || input}`;
    const source2 = `${kind}:source:${(trustCloudflare ? req.get("cf-connecting-ip") : void 0) || req.ip || "local"}`;
    const cooldown = /* @__PURE__ */ __name((seconds) => {
      res.setHeader("Retry-After", seconds);
      res.setHeader("Cache-Control", "no-store");
      const error = new HttpError(429, `\u5C1D\u8BD5\u8FC7\u591A\uFF0C\u8BF7\u5728 ${seconds} \u79D2\u540E\u91CD\u8BD5`);
      Object.assign(error, { retryAfterSeconds: seconds });
      return error;
    }, "cooldown");
    try {
      const remaining = await limiter.remaining([account, source2]);
      if (remaining) throw cooldown(remaining);
      res.locals.authProtectionSuccess = () => limiter.reset(account);
      await handler(req, res, next);
    } catch (error) {
      if (error instanceof HttpError && error.status >= 400 && error.status < 500 && error.status !== 429) {
        const seconds = await limiter.failure([
          { key: account, threshold: 5 },
          { key: source2, threshold: 25, idleResetMs: 6e5 }
        ]);
        if (seconds) return next(cooldown(seconds));
      }
      next(error);
    }
  };
}
__name(withAuthProtection, "withAuthProtection");

// server/organizationCore.ts
import { randomUUID as randomUUID2 } from "node:crypto";
var schoolToday = /* @__PURE__ */ __name(() => new Date(Date.now() + 8 * 36e5).toISOString().slice(0, 10), "schoolToday");
async function organizationScope(db, accountId) {
  const units = await db.prepare(
    `SELECT u.*,COALESCE(p.unit_type,u.kind) unit_type,p.subject_id,t.label type_label,s.name subject_name
    FROM organization_units u LEFT JOIN organization_unit_profiles p ON p.unit_id=u.id
    LEFT JOIN organization_unit_types t ON t.code=COALESCE(p.unit_type,u.kind) LEFT JOIN school_subjects s ON s.id=p.subject_id`
  ).all();
  const byId = new Map(units.map((u) => [u.id, u]));
  const ancestors = /* @__PURE__ */ __name((id) => {
    const result = [];
    let node = byId.get(id);
    while (node) {
      if (node.status !== "active" || result.includes(node.id)) return [];
      result.push(node.id);
      node = node.parent_id ? byId.get(node.parent_id) : void 0;
    }
    return result;
  }, "ancestors");
  const activeAppointments = (await activeStaffAppointments(db, accountId)).filter((a) => ancestors(a.unit_id).length);
  const member = /* @__PURE__ */ __name((id) => activeAppointments.some((a) => a.unit_id === id), "member");
  const manages = /* @__PURE__ */ __name((id) => {
    const chain = ancestors(id);
    return activeAppointments.some(
      (a) => a.role_code === "director" && chain.includes(a.unit_id)
    );
  }, "manages");
  const path = /* @__PURE__ */ __name((id) => ancestors(id).reverse().map((key2) => byId.get(key2).name).join(" / "), "path");
  return {
    units,
    byId,
    ancestors,
    activeAppointments,
    member,
    manages,
    path,
    descendants: /* @__PURE__ */ __name((id) => units.filter((u) => ancestors(u.id).includes(id)).map((u) => u.id), "descendants"),
    visibleUnits: units.filter((u) => ancestors(u.id).length && (member(u.id) || manages(u.id))).map((u) => ({
      ...u,
      path: path(u.id),
      canManage: manages(u.id)
    }))
  };
}
__name(organizationScope, "organizationScope");
async function activeStaffAppointments(db, accountId) {
  const today = schoolToday();
  return await db.prepare(
    `SELECT a.id appointment_id,a.institution_id,a.starts_on,a.ends_on,i.id identity_id,i.account_id,p.unit_id,p.role_code,p.code position_code,
    f.faculty_code,f.full_name,l.person_id,COALESCE(r.unit_type,u.kind) unit_type,r.subject_id,u.name unit_name
    FROM identity_appointments a JOIN identity_registry i ON i.id=a.identity_id AND i.institution_id=a.institution_id
    JOIN organization_positions p ON p.id=a.position_id AND p.institution_id=a.institution_id JOIN organization_units u ON u.id=p.unit_id
    JOIN faculty_users f ON f.id=i.account_id LEFT JOIN identity_person_links l ON l.identity_id=i.id
    LEFT JOIN school_people person ON person.id=l.person_id LEFT JOIN organization_unit_profiles r ON r.unit_id=u.id
    WHERE a.status='active' AND i.identity_kind='staff' AND i.status='active' AND f.status='ACTIVE' AND u.status='active'
    AND (person.id IS NULL OR person.status='active') AND a.starts_on<=? AND (a.ends_on IS NULL OR a.ends_on>=?)
    ${accountId ? "AND i.account_id=?" : ""} ORDER BY a.id`
  ).all(today, today, ...accountId ? [accountId] : []);
}
__name(activeStaffAppointments, "activeStaffAppointments");
async function ensureStaffIdentity(db, institutionId, accountId) {
  const account = await db.prepare(
    "SELECT id,faculty_code,full_name FROM faculty_users WHERE id=? AND status='ACTIVE'"
  ).get(accountId);
  if (!account) throw new HttpError(422, "\u8D26\u53F7\u4E0D\u5B58\u5728\u6216\u5DF2\u505C\u7528");
  let identity = await db.prepare(
    "SELECT id,status FROM identity_registry WHERE institution_id=? AND account_id=? AND identity_kind='staff'"
  ).get(institutionId, accountId);
  if (identity && identity.status !== "active")
    throw new HttpError(409, "\u804C\u5DE5\u8EAB\u4EFD\u5DF2\u505C\u7528");
  if (!identity) {
    identity = { id: randomUUID2() };
    await db.prepare(
      "INSERT INTO identity_registry(id,institution_id,account_id,identity_kind,external_id,display_name) VALUES (?,?,?,'staff',?,?)"
    ).run(
      identity.id,
      institutionId,
      accountId,
      account.faculty_code,
      account.full_name
    );
  }
  let person = await db.prepare(
    "SELECT person_id FROM person_account_links WHERE institution_id=? AND account_id=?"
  ).get(institutionId, accountId);
  if (!person) {
    person = { person_id: randomUUID2() };
    await db.prepare(
      "INSERT INTO school_people(id,institution_id,display_name) VALUES (?,?,?)"
    ).run(person.person_id, institutionId, account.full_name);
    await db.prepare("INSERT INTO person_account_links VALUES (?,?,?)").run(institutionId, person.person_id, accountId);
  }
  const state = await db.prepare("SELECT status FROM school_people WHERE id=?").get(person.person_id);
  if (state.status !== "active") throw new HttpError(409, "\u6821\u5185\u4EBA\u5458\u8EAB\u4EFD\u5DF2\u505C\u7528");
  await db.prepare("INSERT OR IGNORE INTO identity_person_links VALUES (?,?,?)").run(identity.id, institutionId, person.person_id);
  return { identityId: identity.id, personId: person.person_id };
}
__name(ensureStaffIdentity, "ensureStaffIdentity");
async function ensureUnitProfile(db, unitId) {
  if (await db.prepare("SELECT 1 FROM organization_unit_profiles WHERE unit_id=?").get(unitId))
    return;
  await db.prepare(
    "INSERT OR IGNORE INTO organization_unit_profiles(unit_id,institution_id,unit_type) SELECT id,institution_id,kind FROM organization_units WHERE id=?"
  ).run(unitId);
}
__name(ensureUnitProfile, "ensureUnitProfile");
async function headTeacherClassIds(db, accountId) {
  const heads = await organizationClassHeads(db, accountId);
  const legacy2 = await db.prepare(
    "SELECT c.id FROM academic_classes c WHERE c.head_teacher_id=? AND NOT EXISTS(SELECT 1 FROM organization_class_links l WHERE l.class_id=c.id)"
  ).all(accountId);
  return /* @__PURE__ */ new Set([
    ...legacy2.map((c) => c.id),
    ...[...heads].filter(([, head]) => head === accountId).map(([classId]) => classId)
  ]);
}
__name(headTeacherClassIds, "headTeacherClassIds");
async function organizationClassHeads(db, contextAccountId) {
  const scope = await organizationScope(db, contextAccountId), heads = (await activeStaffAppointments(db)).filter(
    (a) => a.role_code === "homeroom_teacher" && scope.ancestors(a.unit_id).length
  );
  const links = await db.prepare("SELECT class_id,unit_id FROM organization_class_links").all();
  return new Map(
    links.map((link) => [
      link.class_id,
      heads.find((a) => a.unit_id === link.unit_id)?.account_id || null
    ])
  );
}
__name(organizationClassHeads, "organizationClassHeads");
async function coursesForAppointment(db, appointment) {
  if (appointment.unit_type !== "subject_group" || !["subject_member", "teacher", "mentor", "director"].includes(
    appointment.role_code
  ))
    return [];
  const today = schoolToday();
  return await db.prepare(
    `SELECT c.id,c.name,
    CASE WHEN EXISTS(SELECT 1 FROM staff_course_qualifications q WHERE q.appointment_id=? AND q.course_id=c.id AND q.status='active' AND q.starts_on<=? AND (q.ends_on IS NULL OR q.ends_on>=?)) THEN 'confirmed' ELSE 'current_teaching' END evidence
    FROM subject_courses sc JOIN courses c ON c.id=sc.course_id JOIN school_subjects s ON s.id=sc.subject_id
    WHERE sc.subject_id=? AND sc.institution_id=? AND s.status='active' AND c.archived_at IS NULL AND
    (EXISTS(SELECT 1 FROM staff_course_qualifications q WHERE q.appointment_id=? AND q.course_id=c.id AND q.status='active' AND q.starts_on<=? AND (q.ends_on IS NULL OR q.ends_on>=?))
    OR EXISTS(SELECT 1 FROM teaching_assignments a JOIN academic_terms t ON t.id=a.term_id JOIN organization_class_links l ON l.class_id=a.class_id
      WHERE a.teacher_id=? AND a.course_id=c.id AND a.archived_at IS NULL AND t.archived_at IS NULL AND t.starts_on<=? AND t.ends_on>=? AND l.institution_id=sc.institution_id)) ORDER BY c.name`
  ).all(
    appointment.appointment_id,
    today,
    today,
    appointment.subject_id,
    appointment.institution_id,
    appointment.appointment_id,
    today,
    today,
    appointment.account_id,
    today,
    today
  );
}
__name(coursesForAppointment, "coursesForAppointment");
async function assertUnitCourse(db, unitId, courseId) {
  const group = await db.prepare(
    "SELECT p.subject_id FROM organization_unit_profiles p WHERE p.unit_id=? AND p.unit_type='subject_group'"
  ).get(unitId);
  if (group && !await db.prepare(
    "SELECT 1 FROM subject_courses c JOIN school_subjects s ON s.id=c.subject_id WHERE c.subject_id=? AND c.course_id=? AND s.status='active'"
  ).get(group.subject_id, courseId))
    throw new HttpError(403, "\u8BE5\u8BFE\u7A0B\u4E0D\u5C5E\u4E8E\u6240\u9009\u5B66\u79D1\u7EC4");
}
__name(assertUnitCourse, "assertUnitCourse");
async function assertSubstituteQualification(db, accountId, unitId, courseId) {
  await assertUnitCourse(db, unitId, courseId);
  const profile = await db.prepare(
    "SELECT 1 FROM organization_unit_profiles WHERE unit_id=? AND unit_type='subject_group'"
  ).get(unitId);
  if (profile && !await asyncSome(
    (await organizationScope(db, accountId)).activeAppointments,
    async (a) => a.unit_id === unitId && (await coursesForAppointment(db, a)).some((c) => c.id === courseId)
  ))
    throw new HttpError(403, "\u4EE3\u8BFE\u6559\u5E08\u5728\u8BE5\u5B66\u79D1\u7EC4\u5C1A\u65E0\u6709\u6548\u4EFB\u6559\u8D44\u683C");
}
__name(assertSubstituteQualification, "assertSubstituteQualification");
async function sameSchoolPerson(db, first, second, unitId) {
  if (first === second) return true;
  if (!unitId) return false;
  return !!await db.prepare(
    `SELECT 1 FROM person_account_links a JOIN person_account_links b ON b.institution_id=a.institution_id AND b.person_id=a.person_id
    JOIN organization_units u ON u.institution_id=a.institution_id WHERE a.account_id=? AND b.account_id=? AND u.id=?`
  ).get(first, second, unitId);
}
__name(sameSchoolPerson, "sameSchoolPerson");
async function classOrganizationActive(db, classId) {
  const link = await db.prepare("SELECT unit_id FROM organization_class_links WHERE class_id=?").get(classId);
  if (!link) return true;
  const chain = await db.prepare(
    `WITH RECURSIVE chain(id,parent_id,status) AS (SELECT id,parent_id,status FROM organization_units WHERE id=? UNION SELECT u.id,u.parent_id,u.status FROM organization_units u JOIN chain c ON u.id=c.parent_id) SELECT status FROM chain`
  ).all(link.unit_id);
  return chain.length > 0 && chain.every((u) => u.status === "active");
}
__name(classOrganizationActive, "classOrganizationActive");

// server/auth.ts
var digest = /* @__PURE__ */ __name((value) => createHash2("sha256").update(value).digest("hex"), "digest");
var publicProfile = /* @__PURE__ */ __name((user) => ({
  demoMode: process.env.SAKURA_DEMO_MODE === "true" && false,
  teacherId: user.id,
  facultyCode: user.faculty_code,
  fullName: user.full_name,
  titleRole: user.title_role,
  department: user.department,
  role: user.role,
  defaultTab: user.default_tab,
  defaultTheme: user.default_theme,
  defaultClassName: "\u8BF7\u5728\u8BFE\u8868\u6A21\u5757\u9009\u62E9\u9ED8\u8BA4\u73ED\u7EA7",
  semesterLabel: user.semester_label,
  dndEnabled: !!user.dnd_enabled,
  dndStartTime: user.dnd_start_time
}), "publicProfile");
var reply = /* @__PURE__ */ __name((res, data, message = "\u64CD\u4F5C\u6210\u529F") => res.json({
  code: 200,
  success: true,
  data,
  message,
  traceId: res.locals.requestId,
  timestamp: (/* @__PURE__ */ new Date()).toISOString()
}), "reply");
var cookieName = "sakura_session";
var cookieValue = /* @__PURE__ */ __name((req) => (req.headers.cookie || "").split(";").map((x) => x.trim()).find((x) => x.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1) || "", "cookieValue");
var sessionCookie = /* @__PURE__ */ __name((token, maxAge) => `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${process.env.COOKIE_SECURE === "true" ? "; Secure" : ""}`, "sessionCookie");
var mutations = /* @__PURE__ */ new Set(["POST", "PUT", "PATCH", "DELETE"]);
function registerAuth(app, source, svgCaptcha, options = {}) {
  const db = asyncDatabase(source);
  installAsyncRoutes(app);
  app.use("/api/v1", (req, _res, next) => {
    try {
      if (mutations.has(req.method) && req.headers.origin && new URL(req.headers.origin).host !== req.headers.host)
        throw new HttpError(403, "\u8BF7\u6C42\u6765\u6E90\u65E0\u6548");
      next();
    } catch (error) {
      next(error);
    }
  });
  const session = /* @__PURE__ */ __name(async (req, res, next) => {
    try {
      const hash2 = digest(cookieValue(req));
      const record = await db.prepare(
        "SELECT s.csrf_token,s.expires_at,u.* FROM auth_sessions s JOIN faculty_users u ON u.id=s.user_id WHERE s.token_hash=?"
      ).get(hash2);
      if (!record || record.expires_at <= Date.now() || record.status !== "ACTIVE")
        throw new HttpError(401, "\u8BF7\u5148\u767B\u5F55\u6216\u91CD\u65B0\u9A8C\u8BC1\u4F1A\u8BDD");
      if (mutations.has(req.method)) {
        if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host)
          throw new HttpError(403, "\u8BF7\u6C42\u6765\u6E90\u65E0\u6548");
        if (req.headers["x-csrf-token"] !== record.csrf_token)
          throw new HttpError(403, "\u8BF7\u6C42\u6821\u9A8C\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u9875\u9762");
      }
      res.locals.user = record;
      res.locals.sessionHash = hash2;
      res.locals.csrfToken = record.csrf_token;
      next();
    } catch (error) {
      next(error);
    }
  }, "session");
  app.get("/api/v1/security/captcha", async (req, res) => {
    const mode = String(req.query.mode || "graphic");
    if (!["graphic", "math"].includes(mode))
      throw new HttpError(422, "\u8BE5\u9A8C\u8BC1\u65B9\u5F0F\u5C1A\u672A\u5F00\u901A\uFF0C\u8BF7\u4F7F\u7528\u56FE\u5F62\u6216\u7B97\u672F\u9A8C\u8BC1");
    const captcha = mode === "math" ? svgCaptcha.createMathExpr({
      size: 2,
      noise: 1,
      width: 132,
      height: 40
    }) : svgCaptcha.create({
      size: 4,
      noise: 1,
      width: 132,
      height: 40,
      ignoreChars: "0o1ilIO",
      charPreset: "23456789"
    });
    const id = `cap-${randomUUID3()}`, answer = String(captcha.text).trim().toLowerCase(), expires = new Date(Date.now() + 3e5).toISOString();
    await db.prepare(
      "INSERT INTO security_captchas(captcha_id,mode,captcha_mode,answer_hash,answer_text,svg_markup,expires_at) VALUES (?,?,?,?,?,?,?)"
    ).run(id, mode, mode, digest(answer), "", captcha.data, expires);
    reply(
      res,
      {
        captchaId: id,
        mode,
        svg: captcha.data,
        sliderTargetX: null,
        demoHint: process.env.SAKURA_DEMO_MODE === "true" && false ? captcha.text : "",
        expiresAt: expires,
        provider: "svg-captcha"
      },
      "\u9A8C\u8BC1\u7801\u5DF2\u751F\u6210"
    );
  });
  app.post(
    "/api/v1/auth/register",
    withAuthProtection(
      db,
      "register",
      async (req, res) => {
        const account = text(req.body.facultyCode, "\u7528\u6237\u540D", {
          max: 32
        }).toLowerCase();
        const email = text(req.body.email, "\u90AE\u7BB1", { max: 128 }).toLowerCase();
        const fullName = text(req.body.fullName, "\u59D3\u540D", { max: 80, optional: true }) || account;
        const password = text(req.body.password, "\u5BC6\u7801", { max: 128 });
        if (!/^[a-z0-9_]{3,32}$/.test(account))
          throw new HttpError(422, "\u7528\u6237\u540D\u4E3A 3\u201332 \u4F4D\u5B57\u6BCD\u3001\u6570\u5B57\u6216\u4E0B\u5212\u7EBF");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          throw new HttpError(422, "\u8BF7\u8F93\u5165\u6709\u6548\u90AE\u7BB1");
        if (password.length < 8) throw new HttpError(422, "\u5BC6\u7801\u81F3\u5C11 8 \u4F4D");
        if (password !== req.body.confirmPassword)
          throw new HttpError(422, "\u4E24\u6B21\u8F93\u5165\u7684\u5BC6\u7801\u4E0D\u4E00\u81F4");
        const key2 = `register:${req.get("cf-connecting-ip") || req.ip || "local"}`;
        await db.prepare(
          "INSERT INTO login_attempts(account,attempted_at,succeeded) VALUES (?,?,0)"
        ).run(key2, Date.now());
        await db.transaction(async () => {
          const cap = await db.prepare(
            "SELECT answer_hash,expires_at,verified,mode FROM security_captchas WHERE captcha_id=?"
          ).get(req.body.captchaId || "");
          if (!cap || cap.mode !== "graphic" || cap.verified || Date.parse(cap.expires_at) <= Date.now() || cap.answer_hash !== digest(
            String(req.body.captchaAnswer || "").trim().toLowerCase()
          ))
            throw new HttpError(422, "\u9A8C\u8BC1\u7801\u4E0D\u6B63\u786E\u6216\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u6362\u4E00\u5F20\u91CD\u8BD5");
          const used = await db.prepare(
            "SELECT id FROM faculty_users WHERE faculty_code=? COLLATE NOCASE OR email=? COLLATE NOCASE"
          ).get(account, email);
          if (used) throw new HttpError(409, "\u7528\u6237\u540D\u6216\u90AE\u7BB1\u5DF2\u88AB\u4F7F\u7528");
          const firstAccount = !await db.prepare("SELECT 1 FROM faculty_users LIMIT 1").get();
          if ((await db.prepare(
            "UPDATE security_captchas SET verified=1 WHERE captcha_id=? AND verified=0"
          ).run(req.body.captchaId)).changes !== 1)
            throw new HttpError(422, "\u9A8C\u8BC1\u7801\u5DF2\u88AB\u4F7F\u7528");
          await db.prepare(
            "INSERT INTO faculty_users(id,faculty_code,email,password_hash,full_name,title_role,department,role,default_tab,default_theme,default_class_name,semester_label,dnd_enabled) VALUES (?,?,?,?,?,?,'\u672A\u8BBE\u7F6E',?,'dashboard-overview','forest-tea','\u5C1A\u672A\u5206\u914D\u73ED\u7EA7','\u5C1A\u672A\u8BBE\u7F6E\u5B66\u671F',0)"
          ).run(
            randomUUID3(),
            account,
            email,
            hashPassword(password, options.passwordPolicy),
            fullName,
            firstAccount ? "\u7CFB\u7EDF\u7BA1\u7406\u5458" : "\u6559\u5E08",
            firstAccount ? "admin" : "teacher"
          );
          await res.locals.authProtectionSuccess?.();
        })();
        reply(
          res,
          { facultyCode: account },
          "\u6CE8\u518C\u6210\u529F\uFF0C\u8BF7\u767B\u5F55\uFF1B\u73ED\u7EA7\u7531\u7BA1\u7406\u5458\u5206\u914D"
        );
      },
      options.trustCloudflare
    )
  );
  app.post(
    "/api/v1/auth/faculty-login",
    withAuthProtection(
      db,
      "login",
      async (req, res) => {
        if (req.body.loginType !== "account")
          throw new HttpError(501, "\u8BE5\u767B\u5F55\u65B9\u5F0F\u5C1A\u672A\u5F00\u901A\uFF0C\u8BF7\u4F7F\u7528\u8D26\u53F7\u767B\u5F55");
        const account = text(req.body.facultyId, "\u8D26\u53F7", { max: 128 }), password = text(req.body.password, "\u5BC6\u7801", { max: 256 });
        const cap = await db.prepare(
          "SELECT answer_hash,expires_at,verified FROM security_captchas WHERE captcha_id=?"
        ).get(req.body.captchaId || "");
        const validCaptcha = cap && !cap.verified && Date.parse(cap.expires_at) > Date.now() && cap.answer_hash === digest(
          String(req.body.captchaAnswer || "").trim().toLowerCase()
        );
        if (!validCaptcha)
          throw new HttpError(422, "\u9A8C\u8BC1\u7801\u65E0\u6548\u3001\u5DF2\u4F7F\u7528\u6216\u5DF2\u8FC7\u671F");
        const user = await db.prepare(
          "SELECT * FROM faculty_users WHERE faculty_code=? OR email=? OR phone=?"
        ).get(account, account, account);
        const valid = user && user.status === "ACTIVE" && verifyPassword(password, user.password_hash, options.passwordPolicy);
        await db.prepare(
          "INSERT INTO login_attempts(account,attempted_at,succeeded) VALUES (?,?,?)"
        ).run(account, Date.now(), valid ? 1 : 0);
        if ((await db.prepare(
          "UPDATE security_captchas SET verified=1 WHERE captcha_id=? AND verified=0"
        ).run(req.body.captchaId)).changes !== 1)
          throw new HttpError(422, "\u9A8C\u8BC1\u7801\u5DF2\u88AB\u4F7F\u7528");
        if (!valid) throw new HttpError(401, "\u8D26\u53F7\u6216\u5BC6\u7801\u4E0D\u6B63\u786E");
        const token = randomBytes2(32).toString("hex"), csrf = randomBytes2(24).toString("hex"), seconds = req.body.keepOnline ? 7 * 86400 : 8 * 3600;
        await db.transaction(async () => {
          if (passwordNeedsUpgrade(user.password_hash, options.passwordPolicy)) {
            const upgraded = hashPassword(password, options.passwordPolicy);
            const saved = await db.prepare(
              "UPDATE faculty_users SET password_hash=? WHERE id=? AND password_hash=? AND status='ACTIVE'"
            ).run(upgraded, user.id, user.password_hash);
            if (saved.changes !== 1)
              throw new HttpError(409, "\u8D26\u53F7\u51ED\u636E\u5DF2\u66F4\u65B0\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55");
          }
          await db.prepare("DELETE FROM auth_sessions WHERE expires_at<=?").run(Date.now());
          await db.prepare(
            "INSERT INTO auth_sessions(token_hash,user_id,csrf_token,expires_at,created_at) VALUES (?,?,?,?,?)"
          ).run(
            digest(token),
            user.id,
            csrf,
            Date.now() + seconds * 1e3,
            Date.now()
          );
          await res.locals.authProtectionSuccess?.();
        })();
        res.setHeader("Set-Cookie", sessionCookie(token, seconds));
        reply(
          res,
          { ...publicProfile(user), token: "", csrfToken: csrf },
          `\u6B22\u8FCE\u56DE\u6765\uFF0C${user.full_name}`
        );
      },
      options.trustCloudflare
    )
  );
  app.get(
    "/api/v1/auth/session",
    session,
    (_req, res) => reply(res, {
      ...publicProfile(res.locals.user),
      token: "",
      csrfToken: res.locals.csrfToken
    })
  );
  app.get(
    "/api/v1/auth/default-profile",
    session,
    (_req, res) => reply(res, {
      ...publicProfile(res.locals.user),
      csrfToken: res.locals.csrfToken
    })
  );
  app.post("/api/v1/auth/logout", session, async (_req, res) => {
    await db.prepare("DELETE FROM auth_sessions WHERE token_hash=?").run(res.locals.sessionHash);
    res.setHeader("Set-Cookie", sessionCookie("", 0));
    reply(res, { loggedOut: true });
  });
  app.put("/api/v1/auth/default-profile", session, async (req, res) => {
    const user = res.locals.user;
    if (req.body.facultyCode && req.body.facultyCode !== user.faculty_code || req.body.role && req.body.role !== user.role || req.body.password)
      throw new HttpError(403, "\u8D26\u53F7\u51ED\u636E\u4E0E\u89D2\u8272\u4E0D\u80FD\u901A\u8FC7\u504F\u597D\u8BBE\u7F6E\u4FEE\u6539");
    const fullName = text(req.body.fullName, "\u663E\u793A\u59D3\u540D", { max: 80 }), title = text(req.body.titleRole, "\u804C\u52A1", { max: 100 }), department = text(req.body.department, "\u90E8\u95E8", { max: 100 });
    const tabs = [
      "dashboard-overview",
      "homework-center",
      "student-profiles",
      "schedule-management",
      "lesson-plans",
      "exam-analytics",
      "school-home-communication"
    ];
    if (!tabs.includes(req.body.defaultTab))
      throw new HttpError(422, "\u9ED8\u8BA4\u9875\u9762\u65E0\u6548");
    const dnd = String(req.body.dndStartTime || user.dnd_start_time);
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(dnd) || Number(dnd.slice(0, 2)) < 8)
      throw new HttpError(
        422,
        "\u514D\u6253\u6270\u5F00\u59CB\u65F6\u95F4\u987B\u4E3A 08:00 \u81F3 23:59\uFF0C\u6B21\u65E5 08:00 \u7ED3\u675F"
      );
    const theme = String(req.body.defaultTheme || user.default_theme);
    if (![
      "awesome-green",
      "matcha-bamboo",
      "sakura-pink",
      "sakura-classic",
      "sakura-milk",
      "ocean-blue",
      "forest-tea",
      "amber-paper",
      "lavender-mist",
      "graphite-mono",
      "midnight-cyan"
    ].includes(theme))
      throw new HttpError(422, "\u4E3B\u9898\u65E0\u6548");
    await db.prepare(
      "UPDATE faculty_users SET full_name=?,title_role=?,department=?,default_tab=?,default_theme=?,dnd_enabled=?,dnd_start_time=?,semester_label=? WHERE id=?"
    ).run(
      fullName,
      title,
      department,
      req.body.defaultTab,
      theme,
      req.body.dndEnabled ? 1 : 0,
      dnd,
      text(req.body.semesterLabel || user.semester_label, "\u5B66\u671F\u663E\u793A\u8BF4\u660E", {
        max: 100
      }),
      user.id
    );
    reply(
      res,
      publicProfile(
        await db.prepare("SELECT * FROM faculty_users WHERE id=?").get(user.id)
      ),
      "\u4E2A\u4EBA\u504F\u597D\u5DF2\u4FDD\u5B58"
    );
  });
  app.get(
    "/api/v1/auth/env-check",
    async (_req, res) => reply(res, {
      gatewayLatencyMs: 0,
      ocrDriverVersion: "\u672A\u8FDE\u63A5",
      tablesReady: (await db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table'").get()).n
    })
  );
  app.use("/api/v1", session);
  app.use("/api/v1/sqlite", (req, res, next) => {
    return next(new HttpError(403, "\u6570\u636E\u5E93\u7BA1\u7406\u63A5\u53E3\u5DF2\u505C\u7528"));
  });
  app.use("/api/v1", async (req, res, next) => {
    if (res.locals.user.role === "admin") return next();
    if (req.path.startsWith("/academic/")) return next();
    if (req.path.startsWith("/lessons/") || req.path.startsWith("/schedules/") || req.path.startsWith("/exams/") || req.path.startsWith("/care/") || req.path.startsWith("/workspace/") || req.path.startsWith("/organization/"))
      return next();
    if (!req.path.startsWith("/students") && !req.path.startsWith("/homework"))
      return next(new HttpError(403, "\u8BE5\u64CD\u4F5C\u5C1A\u672A\u5411\u6559\u5E08\u5F00\u653E"));
    const owned = await db.prepare(
      "SELECT DISTINCT class_id FROM teaching_assignments WHERE teacher_id=? AND archived_at IS NULL"
    ).all(res.locals.user.id);
    const allowed = await asyncFilter(
      [
        .../* @__PURE__ */ new Set([
          ...owned.map((row) => row.class_id),
          ...await headTeacherClassIds(db, res.locals.user.id)
        ])
      ],
      async (id) => await classOrganizationActive(db, id)
    );
    if (!allowed.length) return next(new HttpError(403, "\u5C1A\u672A\u5206\u914D\u4EFB\u6559\u73ED\u7EA7"));
    const studentMatch = req.path.match(/^\/students\/([^/]+)/), submissionMatch = req.path.match(/^\/homework\/submissions\/([^/]+)/);
    if (studentMatch) {
      const row = await db.prepare("SELECT class_id FROM student_profiles WHERE id=?").get(studentMatch[1]);
      if (row && !allowed.includes(row.class_id))
        return next(new HttpError(403, "\u65E0\u6743\u8BBF\u95EE\u8BE5\u5B66\u751F"));
    }
    if (submissionMatch) {
      const row = await db.prepare(
        "SELECT a.class_id FROM homework_submissions s JOIN homework_assignments a ON a.id=s.assignment_id WHERE s.id=?"
      ).get(submissionMatch[1]);
      if (row && !allowed.includes(row.class_id))
        return next(new HttpError(403, "\u65E0\u6743\u8BBF\u95EE\u8BE5\u4F5C\u4E1A"));
    }
    res.locals.classScope = allowed;
    next();
  });
}
__name(registerAuth, "registerAuth");

// server/notificationEvents.ts
import { randomUUID as randomUUID4 } from "node:crypto";

// server/notificationTime.ts
function notificationTime(user, now = /* @__PURE__ */ new Date()) {
  if (!user.dnd_enabled) return now.toISOString();
  const shifted = new Date(now.getTime() + 8 * 36e5), minutes = shifted.getUTCHours() * 60 + shifted.getUTCMinutes(), start = String(user.dnd_start_time || "18:00").split(":").map(Number), threshold = start[0] * 60 + start[1];
  if (minutes >= threshold || minutes < 480) {
    if (minutes >= threshold) shifted.setUTCDate(shifted.getUTCDate() + 1);
    shifted.setUTCHours(8, 0, 0, 0);
    return new Date(shifted.getTime() - 8 * 36e5).toISOString();
  }
  return now.toISOString();
}
__name(notificationTime, "notificationTime");

// server/notificationEvents.ts
async function notifyChange(db, req, res, result, title) {
  const row = result && typeof result === "object" ? result : {};
  const recipients = /* @__PURE__ */ new Set([res.locals.user.id]);
  if (req.path.includes("/schedules/submissions/") && typeof row.owner_id === "string")
    recipients.add(row.owner_id);
  if (req.path.startsWith("/api/v1/schedules/changes/") || req.path.startsWith("/schedules/changes/")) {
    const change = await db.prepare("SELECT applicant_id FROM schedule_changes WHERE id=?").get(req.params.id);
    if (change) recipients.add(change.applicant_id);
  }
  const resource = String(row.id || req.params.id || ""), key2 = req.body.request_key ? `${req.path}:${req.body.request_key}` : res.locals.requestId, now = /* @__PURE__ */ new Date();
  for (const userId of recipients) {
    const user = await db.prepare("SELECT * FROM faculty_users WHERE id=?").get(userId);
    await db.prepare(
      "INSERT OR IGNORE INTO business_notifications VALUES (?,?,?,?,?,?,?,?,NULL)"
    ).run(
      randomUUID4(),
      userId,
      key2,
      title,
      req.path,
      resource,
      notificationTime(user, now),
      now.toISOString()
    );
  }
}
__name(notifyChange, "notifyChange");

// server/academic.ts
import { randomUUID as randomUUID5 } from "node:crypto";

// server/business.ts
var reply2 = /* @__PURE__ */ __name((res, data, message = "\u5DF2\u52A0\u8F7D") => res.json({
  code: 200,
  success: true,
  data,
  message,
  traceId: res.locals.requestId,
  timestamp: (/* @__PURE__ */ new Date()).toISOString()
}), "reply");
async function mutate(req, res, db, operation, message = "\u5DF2\u4FDD\u5B58") {
  const result = await db.transaction(async () => {
    const data = await operation();
    await db.prepare(
      "INSERT INTO sql_audit_logs(trace_id,fn_name,http_method,endpoint,sql_text,rows_affected,created_at) VALUES (?,?,?,?,?,1,?)"
    ).run(
      res.locals.requestId,
      `business.${req.method}`,
      req.method,
      req.path,
      JSON.stringify({ actor: res.locals.user.id, resource: req.path }),
      (/* @__PURE__ */ new Date()).toISOString()
    );
    await notifyChange(db, req, res, data, message);
    return data;
  })();
  return reply2(res, result, message);
}
__name(mutate, "mutate");
async function classAccess(db, res, id) {
  const row = await db.prepare("SELECT * FROM academic_classes WHERE id=?").get(id);
  if (!row) throw new HttpError(404, "\u73ED\u7EA7\u4E0D\u5B58\u5728");
  if (!await classOrganizationActive(db, id))
    throw new HttpError(403, "\u73ED\u7EA7\u7684\u7EC4\u7EC7\u5F52\u5C5E\u5DF2\u5F52\u6863");
  if (res.locals.user.role !== "admin" && !(res.locals.headTeacherClassIds ??= await headTeacherClassIds(
    db,
    res.locals.user.id
  )).has(id) && !await db.prepare(
    "SELECT 1 FROM teaching_assignments WHERE teacher_id=? AND class_id=? AND archived_at IS NULL"
  ).get(res.locals.user.id, id))
    throw new HttpError(403, "\u65E0\u6743\u8BBF\u95EE\u8BE5\u73ED\u7EA7");
  return row;
}
__name(classAccess, "classAccess");
function version(body, row) {
  if (!Number.isSafeInteger(body.version) || body.version !== row.version)
    throw new HttpError(409, "\u8BB0\u5F55\u5DF2\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0\u540E\u518D\u4FDD\u5B58");
}
__name(version, "version");
function exactDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
__name(exactDate, "exactDate");

// server/academic.ts
var reply3 = /* @__PURE__ */ __name((res, data, message = "\u5DF2\u52A0\u8F7D\u57FA\u7840\u8D44\u6599") => res.json({
  code: 200,
  success: true,
  data,
  message,
  traceId: res.locals.requestId,
  timestamp: (/* @__PURE__ */ new Date()).toISOString()
}), "reply");
async function mutation(req, res, db, operation) {
  let response;
  await db.transaction(async () => {
    await operation((data, message = "\u8D44\u6599\u5DF2\u4FDD\u5B58") => {
      response = { data, message };
    });
    if (!response) throw new Error("Mutation did not produce a response");
    await notifyChange(db, req, res, response.data, response.message);
    await db.prepare(
      "INSERT INTO sql_audit_logs(trace_id,fn_name,http_method,endpoint,sql_text,rows_affected,created_at) VALUES (?,?,?,?,?,1,strftime('%Y-%m-%dT%H:%M:%fZ','now'))"
    ).run(
      res.locals.requestId,
      `academic.${req.method}`,
      req.method,
      req.path,
      JSON.stringify({ actor: res.locals.user.id, resource: req.path })
    );
  })();
  return reply3(res, response.data, response.message);
}
__name(mutation, "mutation");
function registerAcademic(app, source, passwordPolicy) {
  const db = asyncDatabase(source);
  const admin = /* @__PURE__ */ __name((res) => {
    if (res.locals.user.role !== "admin")
      throw new HttpError(403, "\u9700\u8981\u7BA1\u7406\u5458\u6743\u9650");
  }, "admin");
  const exists = /* @__PURE__ */ __name(async (table, id) => {
    const row = typeof id === "string" ? await db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id) : void 0;
    if (!row || row.archived_at || table === "faculty_users" && row.status !== "ACTIVE")
      throw new HttpError(422, "\u5173\u8054\u8D44\u6599\u4E0D\u5B58\u5728\u6216\u5DF2\u5F52\u6863");
    return id;
  }, "exists");
  const scopedClasses = /* @__PURE__ */ __name(async (res) => {
    if (res.locals.user.role === "admin") return null;
    const assigned = await db.prepare(
      "SELECT class_id FROM teaching_assignments WHERE teacher_id=? AND archived_at IS NULL"
    ).all(res.locals.user.id);
    return [
      .../* @__PURE__ */ new Set([
        ...assigned.map((a) => a.class_id),
        ...await headTeacherClassIds(db, res.locals.user.id)
      ])
    ];
  }, "scopedClasses");
  app.get(
    "/api/v1/academic/terms",
    async (_req, res) => reply3(
      res,
      await db.prepare(
        "SELECT * FROM academic_terms WHERE archived_at IS NULL ORDER BY starts_on DESC,id"
      ).all()
    )
  );
  app.post(
    "/api/v1/academic/terms",
    async (req, res) => await mutation(req, res, db, async (respond) => {
      admin(res);
      const id = randomUUID5(), code = text(req.body.code, "\u5B66\u671F\u4EE3\u7801", { max: 40 }), name = text(req.body.name, "\u5B66\u671F\u540D\u79F0", { max: 80 }), start = text(req.body.starts_on, "\u5F00\u59CB\u65E5\u671F"), end = text(req.body.ends_on, "\u7ED3\u675F\u65E5\u671F");
      if (!exactDate(start) || !exactDate(end) || start > end)
        throw new HttpError(422, "\u5B66\u671F\u65E5\u671F\u65E0\u6548");
      await db.transaction(async () => {
        if (req.body.active)
          await db.prepare(
            "UPDATE academic_terms SET active=0,version=version+1 WHERE active=1 AND id<>?"
          ).run(id);
        await db.prepare(
          "INSERT INTO academic_terms(id,code,name,starts_on,ends_on,active) VALUES (?,?,?,?,?,?)"
        ).run(id, code, name, start, end, req.body.active ? 1 : 0);
      })();
      respond(
        await db.prepare("SELECT * FROM academic_terms WHERE id=?").get(id),
        "\u5B66\u671F\u5DF2\u521B\u5EFA"
      );
    })
  );
  app.get(
    "/api/v1/academic/courses",
    async (_req, res) => reply3(
      res,
      await db.prepare(
        "SELECT * FROM courses WHERE archived_at IS NULL ORDER BY code"
      ).all()
    )
  );
  app.post(
    "/api/v1/academic/courses",
    async (req, res) => await mutation(req, res, db, async (respond) => {
      admin(res);
      const id = randomUUID5();
      await db.prepare("INSERT INTO courses(id,code,name) VALUES (?,?,?)").run(
        id,
        text(req.body.code, "\u8BFE\u7A0B\u4EE3\u7801", { max: 40 }),
        text(req.body.name, "\u8BFE\u7A0B\u540D\u79F0", { max: 80 })
      );
      respond({ id }, "\u8BFE\u7A0B\u5DF2\u521B\u5EFA");
    })
  );
  app.get("/api/v1/academic/faculty", async (_req, res) => {
    admin(res);
    reply3(
      res,
      await db.prepare(
        "SELECT id,faculty_code,email,full_name,title_role,department,role,status,version FROM faculty_users ORDER BY faculty_code"
      ).all()
    );
  });
  app.post(
    "/api/v1/academic/faculty",
    async (req, res) => await mutation(req, res, db, async (respond) => {
      admin(res);
      const password = text(req.body.password, "\u521D\u59CB\u5BC6\u7801", { max: 128 });
      if (password.length < 8) throw new HttpError(422, "\u521D\u59CB\u5BC6\u7801\u81F3\u5C11 8 \u4F4D");
      const role = req.body.role || "teacher";
      if (!["teacher", "admin"].includes(role))
        throw new HttpError(422, "\u89D2\u8272\u65E0\u6548");
      const id = randomUUID5();
      await db.prepare(
        "INSERT INTO faculty_users(id,faculty_code,email,password_hash,full_name,title_role,department,role) VALUES (?,?,?,?,?,?,?,?)"
      ).run(
        id,
        text(req.body.faculty_code, "\u6559\u5DE5\u53F7", { max: 50 }),
        text(req.body.email, "\u90AE\u7BB1", { max: 128 }),
        hashPassword(password, passwordPolicy),
        text(req.body.full_name, "\u59D3\u540D", { max: 80 }),
        text(req.body.title_role || "\u4EFB\u8BFE\u6559\u5E08", "\u804C\u52A1", { max: 100 }),
        text(req.body.department || "\u6559\u7814\u7EC4", "\u90E8\u95E8", { max: 100 }),
        role
      );
      respond({ id }, "\u6559\u5E08\u8D26\u6237\u5DF2\u521B\u5EFA");
    })
  );
  app.get("/api/v1/academic/classes", async (_req, res) => {
    const scope = await scopedClasses(res);
    const rows = await db.prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM student_profiles s WHERE s.class_id=c.id AND s.archived_at IS NULL) AS actual_count FROM academic_classes c WHERE c.archived_at IS NULL ${scope ? `AND c.id IN (${scope.map(() => "?").join(",") || "NULL"})` : ""} ORDER BY c.class_code,c.id`
    ).all(...scope || []);
    const heads = await organizationClassHeads(db, res.locals.user.id);
    reply3(
      res,
      (await asyncFilter(
        rows,
        async (row) => scope === null || await classOrganizationActive(db, row.id)
      )).map(
        (row) => heads.has(row.id) ? {
          ...row,
          head_teacher_id: heads.get(row.id),
          head_teacher_source: "organization_appointment"
        } : row
      )
    );
  });
  app.post(
    "/api/v1/academic/classes",
    async (req, res) => await mutation(req, res, db, async (respond) => {
      admin(res);
      const id = randomUUID5(), teacher = req.body.head_teacher_id ? await exists("faculty_users", req.body.head_teacher_id) : null;
      await db.prepare(
        "INSERT INTO academic_classes(id,class_code,class_name,grade_level,head_teacher_id,student_count,room_location) VALUES (?,?,?,?,?,0,?)"
      ).run(
        id,
        text(req.body.class_code, "\u73ED\u7EA7\u4EE3\u7801", { max: 50 }),
        text(req.body.class_name, "\u73ED\u7EA7\u540D\u79F0", { max: 80 }),
        text(req.body.grade_level, "\u5E74\u7EA7", { max: 40 }),
        teacher,
        String(req.body.room_location || "")
      );
      respond({ id }, "\u73ED\u7EA7\u5DF2\u521B\u5EFA");
    })
  );
  app.patch(
    "/api/v1/academic/classes/:id",
    async (req, res) => await mutation(req, res, db, async (respond) => {
      admin(res);
      const row = await db.prepare("SELECT * FROM academic_classes WHERE id=?").get(req.params.id);
      if (!row) throw new HttpError(404, "\u73ED\u7EA7\u4E0D\u5B58\u5728");
      if (req.body.version !== row.version)
        throw new HttpError(409, "\u73ED\u7EA7\u8D44\u6599\u5DF2\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0");
      const heads = await organizationClassHeads(db, res.locals.user.id);
      if (heads.has(row.id) && req.body.head_teacher_id !== void 0 && (req.body.head_teacher_id || null) !== heads.get(row.id))
        throw new HttpError(
          409,
          "\u8BE5\u73ED\u7EA7\u5DF2\u7ED1\u5B9A\u7EC4\u7EC7\uFF0C\u8BF7\u901A\u8FC7\u7EC4\u7EC7\u4EFB\u804C\u8C03\u6574\u73ED\u4E3B\u4EFB"
        );
      const teacher = !heads.has(row.id) && req.body.head_teacher_id ? await exists("faculty_users", req.body.head_teacher_id) : row.head_teacher_id;
      if (req.body.archived && (await db.prepare(
        "SELECT COUNT(*) AS n FROM student_profiles WHERE class_id=? AND archived_at IS NULL"
      ).get(row.id)).n)
        throw new HttpError(409, "\u8BF7\u5148\u8F6C\u51FA\u6216\u5F52\u6863\u73ED\u7EA7\u5B66\u751F");
      await db.prepare(
        "UPDATE academic_classes SET class_name=?,grade_level=?,head_teacher_id=?,room_location=?,archived_at=?,version=version+1 WHERE id=?"
      ).run(
        text(req.body.class_name ?? row.class_name, "\u73ED\u7EA7\u540D\u79F0"),
        text(req.body.grade_level ?? row.grade_level, "\u5E74\u7EA7"),
        teacher,
        String(req.body.room_location ?? row.room_location),
        req.body.archived ? (/* @__PURE__ */ new Date()).toISOString() : row.archived_at,
        row.id
      );
      respond({ id: row.id, version: row.version + 1 }, "\u73ED\u7EA7\u8D44\u6599\u5DF2\u66F4\u65B0");
    })
  );
  app.post(
    "/api/v1/academic/teaching-assignments",
    async (req, res) => await mutation(req, res, db, async (respond) => {
      admin(res);
      const args = [
        await exists("faculty_users", req.body.teacher_id),
        await exists("academic_classes", req.body.class_id),
        await exists("courses", req.body.course_id),
        await exists("academic_terms", req.body.term_id)
      ];
      await db.prepare(
        "INSERT INTO teaching_assignments(teacher_id,class_id,course_id,term_id) VALUES (?,?,?,?)"
      ).run(...args);
      respond({ created: true }, "\u4EFB\u6559\u5173\u7CFB\u5DF2\u4FDD\u5B58");
    })
  );
  app.get("/api/v1/academic/teaching-assignments", async (_req, res) => {
    admin(res);
    reply3(
      res,
      await db.prepare(
        "SELECT t.*,u.full_name,c.class_name FROM teaching_assignments t JOIN faculty_users u ON u.id=t.teacher_id JOIN academic_classes c ON c.id=t.class_id WHERE t.archived_at IS NULL ORDER BY t.teacher_id,t.class_id"
      ).all()
    );
  });
  for (const [resource, table] of [
    ["terms", "academic_terms"],
    ["courses", "courses"],
    ["faculty", "faculty_users"],
    ["teaching-assignments", "teaching_assignments"]
  ]) {
    app.patch(
      `/api/v1/academic/${resource}/:id`,
      async (req, res) => await mutation(req, res, db, async (respond) => {
        admin(res);
        const row = await db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(req.params.id);
        if (!row) throw new HttpError(404, "\u8D44\u6599\u4E0D\u5B58\u5728");
        if (req.body.version !== row.version)
          throw new HttpError(409, "\u8D44\u6599\u5DF2\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0");
        await db.transaction(async () => {
          if (resource === "faculty") {
            if (row.id === res.locals.user.id && req.body.archived)
              throw new HttpError(409, "\u4E0D\u80FD\u5F52\u6863\u5F53\u524D\u767B\u5F55\u8D26\u6237");
            if (req.body.archived) {
              await db.prepare(
                "UPDATE faculty_users SET status='ARCHIVED',version=version+1 WHERE id=?"
              ).run(row.id);
              await db.prepare("DELETE FROM auth_sessions WHERE user_id=?").run(row.id);
            } else
              await db.prepare(
                "UPDATE faculty_users SET full_name=?,department=?,title_role=?,version=version+1 WHERE id=?"
              ).run(
                text(req.body.full_name ?? row.full_name, "\u6559\u5E08\u59D3\u540D"),
                String(req.body.department ?? row.department),
                String(req.body.title_role ?? row.title_role),
                row.id
              );
          } else if (resource === "terms") {
            const start = String(req.body.starts_on ?? row.starts_on), end = String(req.body.ends_on ?? row.ends_on);
            if (!exactDate(start) || !exactDate(end) || start > end)
              throw new HttpError(422, "\u5B66\u671F\u65E5\u671F\u65E0\u6548");
            if (req.body.active)
              await db.prepare(
                "UPDATE academic_terms SET active=0,version=version+1 WHERE active=1 AND id<>?"
              ).run(row.id);
            await db.prepare(
              "UPDATE academic_terms SET name=?,starts_on=?,ends_on=?,active=?,archived_at=?,version=version+1 WHERE id=?"
            ).run(
              text(req.body.name ?? row.name, "\u5B66\u671F\u540D\u79F0"),
              start,
              end,
              req.body.archived ? 0 : req.body.active === void 0 ? row.active : req.body.active ? 1 : 0,
              req.body.archived ? (/* @__PURE__ */ new Date()).toISOString() : row.archived_at,
              row.id
            );
          } else if (resource === "courses")
            await db.prepare(
              "UPDATE courses SET name=?,archived_at=?,version=version+1 WHERE id=?"
            ).run(
              text(req.body.name ?? row.name, "\u8BFE\u7A0B\u540D\u79F0"),
              req.body.archived ? (/* @__PURE__ */ new Date()).toISOString() : row.archived_at,
              row.id
            );
          else
            await db.prepare(
              "UPDATE teaching_assignments SET teacher_id=?,class_id=?,course_id=?,term_id=?,archived_at=?,version=version+1 WHERE id=?"
            ).run(
              await exists(
                "faculty_users",
                req.body.teacher_id ?? row.teacher_id
              ),
              await exists(
                "academic_classes",
                req.body.class_id ?? row.class_id
              ),
              await exists("courses", req.body.course_id ?? row.course_id),
              await exists(
                "academic_terms",
                req.body.term_id ?? row.term_id
              ),
              req.body.archived ? (/* @__PURE__ */ new Date()).toISOString() : null,
              row.id
            );
        })();
        respond({ id: row.id, version: row.version + 1 }, "\u8D44\u6599\u5DF2\u66F4\u65B0");
      })
    );
  }
  app.get("/api/v1/academic/students", async (req, res) => {
    const { page, pageSize, offset } = pagination(req.query), scope = await scopedClasses(res), args = [];
    let where = "s.archived_at IS NULL";
    if (scope) {
      where += ` AND s.class_id IN (${scope.map(() => "?").join(",") || "NULL"})`;
      args.push(...scope);
    }
    if (req.query.classId) {
      where += " AND s.class_id=?";
      args.push(String(req.query.classId));
    }
    if (req.query.q) {
      where += " AND (instr(s.full_name,?)>0 OR instr(s.student_no,?)>0)";
      args.push(String(req.query.q), String(req.query.q));
    }
    const total = (await db.prepare(`SELECT COUNT(*) AS n FROM student_profiles s WHERE ${where}`).get(...args)).n;
    const items = await db.prepare(
      `SELECT s.id,s.student_no,s.full_name,s.class_id,s.avatar_char,s.tag_category,s.version,c.class_name FROM student_profiles s JOIN academic_classes c ON c.id=s.class_id WHERE ${where} ORDER BY s.student_no,s.id LIMIT ? OFFSET ?`
    ).all(...args, pageSize, offset);
    reply3(res, { items, total, page, pageSize });
  });
  app.post(
    "/api/v1/academic/students",
    async (req, res) => await mutation(req, res, db, async (respond) => {
      admin(res);
      const id = randomUUID5(), classId = await exists("academic_classes", req.body.class_id), termId = await exists("academic_terms", req.body.term_id), name = text(req.body.full_name, "\u5B66\u751F\u59D3\u540D", { max: 80 }), studentNo = text(req.body.student_no, "\u5B66\u53F7", { max: 50 });
      const klass = await db.prepare(
        "SELECT class_name,archived_at FROM academic_classes WHERE id=?"
      ).get(classId);
      if (klass.archived_at)
        throw new HttpError(422, "\u4E0D\u80FD\u5411\u5DF2\u5F52\u6863\u73ED\u7EA7\u6DFB\u52A0\u5B66\u751F");
      const payload = {
        id,
        name,
        studentNo,
        shortNo: studentNo.slice(-2),
        className: klass.class_name,
        role: "",
        avatarChar: name[0],
        badgeText: "",
        badgeType: "normal",
        tagCategory: "care",
        rankBadge: "\u6682\u65E0\u6210\u7EE9",
        trendText: "\u6682\u65E0\u6210\u7EE9",
        trendDir: "flat",
        dailyStatus: "\u6682\u65E0\u8BB0\u5F55",
        bio: "",
        sakuraMedals: [],
        radarScores: {
          classical: 0,
          modern: 0,
          writing: 0,
          poetry: 0,
          basics: 0,
          overall: 0
        },
        strengthModule: "\u6682\u65E0\u5206\u6790",
        potentialModule: "\u6682\u65E0\u5206\u6790",
        examTrajectory: {
          rankChange: "\u6682\u65E0\u6210\u7EE9",
          points: [],
          summary: "\u6682\u65E0\u8003\u8BD5\u8BB0\u5F55",
          expectation: ""
        },
        presenceMetrics: {
          attendance: "\u2014",
          attendanceSub: "\u6682\u65E0\u8BB0\u5F55",
          interaction: "\u2014",
          interactionSub: "\u6682\u65E0\u8BB0\u5F55",
          quizSpeed: "\u2014",
          quizSpeedSub: "\u6682\u65E0\u8BB0\u5F55"
        },
        coachingJournals: [],
        parentMessages: [],
        parentName: "",
        careKitTitle: "\u6682\u65E0\u5173\u6000\u5305",
        careKitSub: ""
      };
      await db.transaction(async () => {
        await db.prepare(
          "INSERT INTO student_profiles(id,student_no,short_no,full_name,avatar_char,class_id,tag_category,radar_classical,radar_modern,radar_writing,radar_poetry,radar_basics,composite_score,payload_json) VALUES (?,?,?,?,?,?,?,0,0,0,0,0,0,?)"
        ).run(
          id,
          studentNo,
          studentNo.slice(-2),
          name,
          name[0],
          classId,
          "care",
          JSON.stringify(payload)
        );
        await db.prepare(
          "INSERT INTO class_enrollments(student_id,class_id,term_id) VALUES (?,?,?)"
        ).run(id, classId, termId);
      })();
      respond({ id }, "\u5B66\u751F\u5DF2\u521B\u5EFA");
    })
  );
  app.patch(
    "/api/v1/academic/students/:id",
    async (req, res) => await mutation(req, res, db, async (respond) => {
      admin(res);
      const row = await db.prepare("SELECT * FROM student_profiles WHERE id=?").get(req.params.id);
      if (!row) throw new HttpError(404, "\u5B66\u751F\u4E0D\u5B58\u5728");
      if (req.body.version !== row.version)
        throw new HttpError(409, "\u5B66\u751F\u8D44\u6599\u5DF2\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0");
      const name = text(req.body.full_name ?? row.full_name, "\u5B66\u751F\u59D3\u540D", {
        max: 80
      }), classId = req.body.class_id ? await exists("academic_classes", req.body.class_id) : row.class_id;
      const classRow = await db.prepare("SELECT archived_at FROM academic_classes WHERE id=?").get(classId);
      if (classRow.archived_at) throw new HttpError(422, "\u76EE\u6807\u73ED\u7EA7\u5DF2\u5F52\u6863");
      const termId = req.body.term_id ? await exists("academic_terms", req.body.term_id) : null;
      if (classId !== row.class_id && !termId)
        throw new HttpError(422, "\u8F6C\u73ED\u5FC5\u987B\u6307\u5B9A\u5B66\u671F");
      await db.transaction(async () => {
        await db.prepare(
          "UPDATE student_profiles SET full_name=?,avatar_char=?,class_id=?,archived_at=?,version=version+1 WHERE id=?"
        ).run(
          name,
          name[0],
          classId,
          req.body.archived ? (/* @__PURE__ */ new Date()).toISOString() : row.archived_at,
          row.id
        );
        if (termId)
          await db.prepare(
            "INSERT INTO class_enrollments(student_id,class_id,term_id) VALUES (?,?,?) ON CONFLICT(student_id,term_id) DO UPDATE SET class_id=excluded.class_id"
          ).run(row.id, classId, termId);
      })();
      respond({ id: row.id, version: row.version + 1 }, "\u5B66\u751F\u8D44\u6599\u5DF2\u66F4\u65B0");
    })
  );
}
__name(registerAcademic, "registerAcademic");

// server/homework.ts
import { randomUUID as randomUUID6 } from "node:crypto";
function registerHomework(app, source) {
  const db = asyncDatabase(source);
  const assignment = /* @__PURE__ */ __name(async (id, res) => {
    const row = await db.prepare(
      "SELECT a.*,c.class_name FROM homework_assignments a JOIN academic_classes c ON c.id=a.class_id WHERE a.id=?"
    ).get(id);
    if (!row) throw new HttpError(404, "\u4F5C\u4E1A\u4E0D\u5B58\u5728");
    await classAccess(db, res, row.class_id);
    if (row.lifecycle === "draft" && row.owner_id !== res.locals.user.id)
      throw new HttpError(403, "\u8349\u7A3F\u4EC5\u521B\u5EFA\u8005\u53EF\u8BBF\u95EE");
    return row;
  }, "assignment");
  const entry = /* @__PURE__ */ __name(async (id, res) => {
    const row = await db.prepare("SELECT * FROM homework_submissions WHERE id=?").get(id);
    if (!row) throw new HttpError(404, "\u63D0\u4EA4\u8BB0\u5F55\u4E0D\u5B58\u5728");
    const work = await assignment(row.assignment_id, res);
    return { row, work };
  }, "entry");
  const roster = /* @__PURE__ */ __name(async (work) => work.roster_json ? JSON.parse(work.roster_json) : (await db.prepare(
    "SELECT id FROM student_profiles WHERE class_id=? AND archived_at IS NULL ORDER BY student_no,id"
  ).all(work.class_id)).map((r) => r.id), "roster");
  const history = /* @__PURE__ */ __name(async (row, res, action) => await db.prepare("INSERT INTO homework_history VALUES (?,?,?,?,?,?)").run(
    randomUUID6(),
    row.id,
    res.locals.user.id,
    action,
    JSON.stringify(row),
    (/* @__PURE__ */ new Date()).toISOString()
  ), "history");
  const open = /* @__PURE__ */ __name((work) => {
    if (work.lifecycle === "archived" || work.lifecycle === "draft")
      throw new HttpError(409, "\u5F53\u524D\u4F5C\u4E1A\u72B6\u6001\u4E0D\u5141\u8BB8\u6279\u9605");
  }, "open");
  const stats = /* @__PURE__ */ __name(async (work) => {
    const counts = await db.prepare(
      `SELECT COUNT(*) AS submitted,SUM(CASE WHEN status='graded' THEN 1 ELSE 0 END) AS graded,SUM(CASE WHEN status='needs-correction' THEN 1 ELSE 0 END) AS correction,AVG(CASE WHEN status='graded' THEN total_score END) AS average,SUM(CASE WHEN status='graded' AND total_score>=? THEN 1 ELSE 0 END) AS excellent FROM homework_submissions WHERE assignment_id=?`
    ).get(work.max_score * 0.9, work.id);
    const total = (await roster(work)).length;
    return {
      ...counts,
      total,
      unsubmitted: Math.max(0, total - Number(counts.submitted)),
      pending: Number(counts.submitted) - Number(counts.graded) - Number(counts.correction),
      submissionRate: total ? Number(counts.submitted) / total : null,
      excellentRate: counts.graded ? Number(counts.excellent) / Number(counts.graded) : null
    };
  }, "stats");
  app.get("/api/v1/homework/assignments", async (req, res) => {
    const classes = await db.prepare("SELECT id FROM academic_classes WHERE archived_at IS NULL").all();
    const ids = (await asyncFilter(classes, async (c) => {
      try {
        await classAccess(db, res, c.id);
        return true;
      } catch {
        return false;
      }
    })).map((c) => c.id);
    const rows = await db.prepare(
      `SELECT a.*,c.class_name FROM homework_assignments a JOIN academic_classes c ON c.id=a.class_id WHERE a.class_id IN (${ids.map(() => "?").join(",") || "NULL"}) AND (a.lifecycle<>'draft' OR a.owner_id=?) ${req.query.classId ? "AND a.class_id=?" : ""} ORDER BY a.created_at DESC,a.id`
    ).all(
      ...ids,
      res.locals.user.id,
      ...req.query.classId ? [String(req.query.classId)] : []
    );
    reply2(
      res,
      await Promise.all(
        rows.map(async (row) => ({ ...row, stats: await stats(row) }))
      )
    );
  });
  app.post(
    "/api/v1/homework/assignments",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const classId = text(req.body.class_id, "\u73ED\u7EA7"), klass = await classAccess(db, res, classId);
        if (klass.archived_at) throw new HttpError(409, "\u73ED\u7EA7\u5DF2\u5F52\u6863");
        const id = randomUUID6(), max = number(req.body.max_score, "\u6EE1\u5206", 1, 1e4);
        if (Math.abs(max * 100 - Math.round(max * 100)) > 1e-7)
          throw new HttpError(422, "\u6EE1\u5206\u6700\u591A\u4E24\u4F4D\u5C0F\u6570");
        const due = req.body.due_at ? text(req.body.due_at, "\u622A\u6B62\u65F6\u95F4") : null;
        if (due && (!Number.isFinite(Date.parse(due)) || Date.parse(due) <= Date.now()))
          throw new HttpError(422, "\u622A\u6B62\u65F6\u95F4\u5FC5\u987B\u665A\u4E8E\u5F53\u524D\u65F6\u95F4");
        await db.prepare(
          "INSERT INTO homework_assignments(id,title,course_tag,class_id,max_score,lifecycle,owner_id,instructions,due_at,submitted_count,total_students,graded_count,avg_score,excellent_rate) VALUES (?,?,?,?,?,?,?,?,?,0,0,0,0,0)"
        ).run(
          id,
          text(req.body.title, "\u4F5C\u4E1A\u6807\u9898", { max: 200 }),
          text(req.body.course_tag || "\u7EFC\u5408", "\u8BFE\u7A0B", { max: 80 }),
          classId,
          max,
          "draft",
          res.locals.user.id,
          text(req.body.instructions, "\u4F5C\u4E1A\u8981\u6C42", {
            optional: true,
            max: 3e4
          }),
          due ? new Date(due).toISOString() : null
        );
        return await assignment(id, res);
      },
      "\u4F5C\u4E1A\u8349\u7A3F\u5DF2\u521B\u5EFA"
    )
  );
  app.patch(
    "/api/v1/homework/assignments/:id",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const work = await assignment(req.params.id, res);
        version(req.body, work);
        const target = req.body.lifecycle;
        const transitions = {
          draft: ["published", "archived"],
          published: ["closed", "archived"],
          closed: ["archived"],
          archived: []
        };
        if (typeof target !== "string" || !transitions[work.lifecycle].includes(target))
          throw new HttpError(409, "\u4F5C\u4E1A\u72B6\u6001\u8F6C\u6362\u65E0\u6548");
        const snapshot = target === "published" ? JSON.stringify(await roster(work)) : work.roster_json;
        if (target === "published" && work.due_at && Date.parse(work.due_at) <= Date.now())
          throw new HttpError(409, "\u8349\u7A3F\u622A\u6B62\u65F6\u95F4\u5DF2\u8FC7\uFF0C\u8BF7\u91CD\u65B0\u521B\u5EFA");
        await db.prepare(
          "UPDATE homework_assignments SET lifecycle=?,roster_json=?,version=version+1 WHERE id=?"
        ).run(target, snapshot, work.id);
        return await assignment(work.id, res);
      },
      "\u4F5C\u4E1A\u72B6\u6001\u5DF2\u66F4\u65B0"
    )
  );
  app.get("/api/v1/homework/assignments/:id", async (req, res) => {
    const work = await assignment(req.params.id, res), ids = await roster(work);
    const students = await db.prepare(
      `SELECT id,full_name,student_no FROM student_profiles WHERE id IN (${ids.map(() => "?").join(",") || "NULL"}) ORDER BY student_no,id`
    ).all(...ids);
    const submissions = await db.prepare(
      "SELECT s.*,p.full_name AS student_name FROM homework_submissions s JOIN student_profiles p ON p.id=s.student_id WHERE s.assignment_id=? ORDER BY s.submitted_at,s.id"
    ).all(work.id);
    reply2(res, {
      assignment: work,
      students,
      submissions,
      stats: await stats(work)
    });
  });
  app.post(
    "/api/v1/homework/assignments/:id/submissions",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const work = await assignment(req.params.id, res), studentId = text(req.body.student_id, "\u5B66\u751F");
        const prior = await db.prepare(
          "SELECT * FROM homework_submissions WHERE assignment_id=? AND student_id=?"
        ).get(work.id, studentId);
        const correction = prior?.status === "needs-correction";
        if (["draft", "archived"].includes(work.lifecycle) || !correction && (work.lifecycle !== "published" || work.due_at && Date.parse(work.due_at) < Date.now()))
          throw new HttpError(409, "\u5F53\u524D\u4F5C\u4E1A\u5DF2\u505C\u6B62\u63A5\u6536\u63D0\u4EA4");
        if (!(await roster(work)).includes(studentId))
          throw new HttpError(422, "\u8BE5\u5B66\u751F\u4E0D\u5728\u4F5C\u4E1A\u53D1\u5E03\u540D\u5355\u4E2D");
        const student = await db.prepare("SELECT full_name FROM student_profiles WHERE id=?").get(studentId);
        const content = text(req.body.content, "\u63D0\u4EA4\u6B63\u6587", { max: 1e5 });
        if (prior) {
          version(req.body, prior);
          if (prior.status !== "needs-correction")
            throw new HttpError(409, "\u5DF2\u6709\u63D0\u4EA4\uFF0C\u8BF7\u5148\u9000\u56DE\u8BA2\u6B63");
          await history(prior, res, "resubmit");
          await db.prepare(
            "UPDATE homework_submissions SET content=?,status='pending',total_score=NULL,feedback='',stamp_type=NULL,is_model_essay=0,status_badge='\u5F85\u6279\u9605',graded_at=NULL,submitted_at=?,version=version+1 WHERE id=?"
          ).run(content, (/* @__PURE__ */ new Date()).toISOString(), prior.id);
          return (await entry(prior.id, res)).row;
        }
        const id = randomUUID6();
        await db.prepare(
          "INSERT INTO homework_submissions(id,assignment_id,student_id,student_name,class_name,total_score,question_score,status,status_badge,payload_json,content,submitted_at) VALUES (?,?,?,?,?,NULL,0,'pending','\u5F85\u6279\u9605','{}',?,?)"
        ).run(
          id,
          work.id,
          studentId,
          student.full_name,
          work.class_name,
          content,
          (/* @__PURE__ */ new Date()).toISOString()
        );
        await history((await entry(id, res)).row, res, "submit");
        return (await entry(id, res)).row;
      },
      "\u63D0\u4EA4\u5DF2\u767B\u8BB0"
    )
  );
  app.patch(
    "/api/v1/homework/submissions/:id/grade",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const { row, work } = await entry(req.params.id, res);
        open(work);
        const score = number(req.body.score, "\u5206\u6570", 0, work.max_score);
        if (Math.abs(score * 100 - Math.round(score * 100)) > 1e-7)
          throw new HttpError(422, "\u5206\u6570\u6700\u591A\u4E24\u4F4D\u5C0F\u6570");
        version(req.body, row);
        if (!["pending", "ai-pregraded", "graded"].includes(row.status))
          throw new HttpError(409, "\u8BF7\u5148\u767B\u8BB0\u8BA2\u6B63\u91CD\u4EA4\uFF0C\u518D\u91CD\u65B0\u8BC4\u5206");
        const stamp = req.body.stampType === void 0 ? row.stamp_type : req.body.stampType;
        if (stamp !== null && ![
          "excellent",
          "progress",
          "neat",
          "sakura",
          "\u5999\u7B14\u751F\u82B1",
          "\u89C1\u89E3\u72EC\u5230"
        ].includes(stamp))
          throw new HttpError(422, "\u5370\u7AE0\u65E0\u6548");
        const feedback = req.body.feedback === void 0 ? row.feedback : text(req.body.feedback, "\u6279\u6CE8", { optional: true, max: 2e4 });
        await history(row, res, "grade");
        await db.prepare(
          "UPDATE homework_submissions SET total_score=?,feedback=?,status='graded',status_badge='\u5DF2\u6279\u9605',stamp_type=?,graded_at=?,version=version+1 WHERE id=?"
        ).run(score, feedback, stamp, (/* @__PURE__ */ new Date()).toISOString(), row.id);
        return {
          submission: (await entry(row.id, res)).row,
          stats: await stats(work)
        };
      },
      "\u8BC4\u5206\u5DF2\u4FDD\u5B58"
    )
  );
  app.patch(
    "/api/v1/homework/submissions/:id/stamp",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const { row, work } = await entry(req.params.id, res);
        open(work);
        version(req.body, row);
        if (req.body.stampType !== null && ![
          "excellent",
          "progress",
          "neat",
          "sakura",
          "\u5999\u7B14\u751F\u82B1",
          "\u89C1\u89E3\u72EC\u5230"
        ].includes(req.body.stampType))
          throw new HttpError(422, "\u5370\u7AE0\u65E0\u6548");
        await history(row, res, "stamp");
        await db.prepare(
          "UPDATE homework_submissions SET stamp_type=?,version=version+1 WHERE id=?"
        ).run(req.body.stampType, row.id);
        return (await entry(row.id, res)).row;
      },
      "\u5370\u7AE0\u5DF2\u4FDD\u5B58"
    )
  );
  app.patch(
    "/api/v1/homework/submissions/:id/review",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const { row, work } = await entry(req.params.id, res);
        open(work);
        version(req.body, row);
        if (req.body.action === "return") {
          if (row.status === "needs-correction")
            throw new HttpError(409, "\u5DF2\u7ECF\u9000\u56DE\u8BA2\u6B63");
          const feedback = text(req.body.feedback, "\u8BA2\u6B63\u8981\u6C42", {
            max: 2e4
          });
          await history(row, res, "return");
          await db.prepare(
            "UPDATE homework_submissions SET status='needs-correction',feedback=?,is_model_essay=0,version=version+1 WHERE id=?"
          ).run(feedback, row.id);
        } else if (req.body.action === "model") {
          if (row.status !== "graded" || typeof req.body.enabled !== "boolean")
            throw new HttpError(422, "\u53EA\u80FD\u6807\u8BB0\u5DF2\u6279\u9605\u8303\u6587");
          await history(row, res, "model");
          await db.prepare(
            "UPDATE homework_submissions SET is_model_essay=?,version=version+1 WHERE id=?"
          ).run(req.body.enabled ? 1 : 0, row.id);
        } else throw new HttpError(422, "\u64CD\u4F5C\u65E0\u6548");
        return (await entry(row.id, res)).row;
      },
      "\u6279\u9605\u72B6\u6001\u5DF2\u4FDD\u5B58"
    )
  );
  app.get("/api/v1/homework/submissions/:id/history", async (req, res) => {
    await entry(req.params.id, res);
    reply2(
      res,
      await db.prepare(
        "SELECT * FROM homework_history WHERE submission_id=? ORDER BY created_at,id"
      ).all(req.params.id)
    );
  });
}
__name(registerHomework, "registerHomework");

// server/lessons.ts
import { randomUUID as randomUUID7 } from "node:crypto";
function registerLessons(app, source) {
  const db = asyncDatabase(source);
  const get = /* @__PURE__ */ __name(async (id, res, write = false) => {
    const row = await db.prepare("SELECT * FROM lesson_plans WHERE id=?").get(id);
    if (!row) throw new HttpError(404, "\u6559\u6848\u4E0D\u5B58\u5728");
    if (write ? row.owner_id !== res.locals.user.id : row.visibility === "private" && row.owner_id !== res.locals.user.id)
      throw new HttpError(403, "\u65E0\u6743\u8BBF\u95EE\u6B64\u6559\u6848");
    return row;
  }, "get");
  app.get(
    ["/api/v1/lessons/plans", "/api/v1/lessons/unit-plans"],
    async (req, res) => {
      const rows = await db.prepare(
        `SELECT * FROM lesson_plans WHERE archived_at IS NULL AND (visibility='school' OR owner_id=?) AND instr(title||summary||tags_json,?)>0 ORDER BY updated_at DESC,id`
      ).all(res.locals.user.id, String(req.query.q || ""));
      reply2(
        res,
        await Promise.all(
          rows.map(async (r) => ({
            ...r,
            tags: JSON.parse(r.tags_json),
            schedules: await asyncFilter(
              await db.prepare(
                "SELECT id,class_id,starts_at FROM schedule_entries WHERE lesson_id=? AND cancelled_at IS NULL ORDER BY starts_at"
              ).all(r.id),
              async (s) => {
                try {
                  await classAccess(db, res, s.class_id);
                  return true;
                } catch {
                  return false;
                }
              }
            ),
            canEdit: r.owner_id === res.locals.user.id,
            links: (await asyncFilter(
              await db.prepare(
                "SELECT l.assignment_id,a.class_id,a.lifecycle,a.owner_id FROM lesson_homework l JOIN homework_assignments a ON a.id=l.assignment_id WHERE l.lesson_id=?"
              ).all(r.id),
              async (l) => {
                if (l.lifecycle === "draft" && l.owner_id !== res.locals.user.id)
                  return false;
                try {
                  await classAccess(db, res, l.class_id);
                  return true;
                } catch {
                  return false;
                }
              }
            )).map((l) => ({ assignment_id: l.assignment_id }))
          }))
        )
      );
    }
  );
  app.post(
    "/api/v1/lessons/plans",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const id = randomUUID7(), title = text(req.body.title, "\u6559\u6848\u6807\u9898", { max: 200 }), body = text(req.body.body, "\u6559\u6848\u6B63\u6587", { max: 1e5 });
        const visibility = req.body.visibility || "private";
        if (!["private", "school"].includes(visibility))
          throw new HttpError(422, "\u53EF\u89C1\u8303\u56F4\u65E0\u6548");
        const tags = validateTags(req.body.tags ?? []);
        await db.prepare(
          "INSERT INTO lesson_plans(id,title,summary,body,unit_code,author_name,owner_id,tags_json,visibility,citation_count,updated_at) VALUES (?,?,?,?,?,?,?,?,?,0,?)"
        ).run(
          id,
          title,
          body.slice(0, 200),
          body,
          String(req.body.unit_code || ""),
          res.locals.user.full_name,
          res.locals.user.id,
          JSON.stringify(tags),
          visibility,
          (/* @__PURE__ */ new Date()).toISOString()
        );
        return await get(id, res);
      },
      "\u6559\u6848\u5DF2\u521B\u5EFA"
    )
  );
  app.patch(
    "/api/v1/lessons/plans/:id",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const row = await get(req.params.id, res, true);
        version(req.body, row);
        if (row.archived_at && !req.body.restore)
          throw new HttpError(409, "\u6559\u6848\u5DF2\u5F52\u6863");
        const title = text(req.body.title ?? row.title, "\u6559\u6848\u6807\u9898", {
          max: 200
        }), body = text(req.body.body ?? row.body, "\u6559\u6848\u6B63\u6587", { max: 1e5 });
        const visibility = req.body.visibility ?? row.visibility;
        if (!["private", "school"].includes(visibility))
          throw new HttpError(422, "\u53EF\u89C1\u8303\u56F4\u65E0\u6548");
        await db.prepare("INSERT INTO lesson_revisions VALUES (?,?,?,?,?)").run(
          randomUUID7(),
          row.id,
          res.locals.user.id,
          JSON.stringify(row),
          (/* @__PURE__ */ new Date()).toISOString()
        );
        await db.prepare(
          "UPDATE lesson_plans SET title=?,body=?,summary=?,unit_code=?,tags_json=?,visibility=?,archived_at=?,version=version+1,updated_at=? WHERE id=?"
        ).run(
          title,
          body,
          body.slice(0, 200),
          String(req.body.unit_code ?? row.unit_code),
          JSON.stringify(
            validateTags(req.body.tags ?? JSON.parse(row.tags_json))
          ),
          visibility,
          req.body.archived ? (/* @__PURE__ */ new Date()).toISOString() : req.body.restore ? null : row.archived_at,
          (/* @__PURE__ */ new Date()).toISOString(),
          row.id
        );
        return await get(row.id, res);
      },
      "\u6559\u6848\u5DF2\u4FDD\u5B58"
    )
  );
  app.get("/api/v1/lessons/plans/:id/revisions", async (req, res) => {
    await get(req.params.id, res, true);
    reply2(
      res,
      await db.prepare(
        "SELECT * FROM lesson_revisions WHERE lesson_id=? ORDER BY created_at DESC,id"
      ).all(req.params.id)
    );
  });
  app.post(
    "/api/v1/lessons/plans/:id/links",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const row = await get(req.params.id, res, true);
        version(req.body, row);
        if (row.archived_at) throw new HttpError(409, "\u6559\u6848\u5DF2\u5F52\u6863");
        const work = await db.prepare(
          "SELECT class_id,lifecycle,owner_id FROM homework_assignments WHERE id=?"
        ).get(req.body.assignment_id);
        if (!work) throw new HttpError(404, "\u4F5C\u4E1A\u4E0D\u5B58\u5728");
        if (work.lifecycle === "draft" && work.owner_id !== res.locals.user.id)
          throw new HttpError(403, "\u65E0\u6743\u5173\u8054\u4ED6\u4EBA\u7684\u4F5C\u4E1A\u8349\u7A3F");
        await classAccess(db, res, work.class_id);
        if (req.body.remove === true)
          await db.prepare(
            "DELETE FROM lesson_homework WHERE lesson_id=? AND assignment_id=?"
          ).run(row.id, req.body.assignment_id);
        else
          await db.prepare("INSERT OR IGNORE INTO lesson_homework VALUES (?,?)").run(row.id, req.body.assignment_id);
        await db.prepare("UPDATE lesson_plans SET version=version+1 WHERE id=?").run(row.id);
        return await get(row.id, res);
      },
      "\u4F5C\u4E1A\u5173\u8054\u5DF2\u4FDD\u5B58"
    )
  );
  app.put(
    "/api/v1/lessons/unit-plans",
    (_req, _res, next) => next(
      new HttpError(
        409,
        "\u65E7\u6559\u6848\u5199\u5165\u63A5\u53E3\u5DF2\u505C\u7528\uFF0C\u8BF7\u4F7F\u7528\u6559\u6848\u5E93\u7684\u65B0\u5EFA\u548C\u7248\u672C\u5316\u4FDD\u5B58"
      )
    )
  );
}
__name(registerLessons, "registerLessons");
function validateTags(value) {
  if (!Array.isArray(value) || value.length > 20)
    throw new HttpError(422, "\u6807\u7B7E\u6700\u591A 20 \u4E2A");
  return [...new Set(value.map((v) => text(v, "\u6807\u7B7E", { max: 40 })))];
}
__name(validateTags, "validateTags");

// server/schedules.ts
import { randomUUID as randomUUID11 } from "node:crypto";

// server/scheduleAccess.ts
async function scheduleAccess(db, accountId) {
  const scope = await organizationScope(db, accountId);
  const eligible = scope.activeAppointments.filter(
    (a) => ["teacher", "mentor", "director", "subject_member"].includes(a.role_code)
  );
  const member = /* @__PURE__ */ __name((id) => eligible.some((a) => a.unit_id === id), "member");
  const manages = scope.manages;
  const institutions = new Map(
    (await db.prepare("SELECT id,code FROM institutions").all()).map((i) => [i.id, i.code])
  );
  const departments = scope.units.filter(
    (u) => ["department", "group"].includes(u.kind) && scope.ancestors(u.id).length && (member(u.id) || manages(u.id))
  ).map((u) => ({
    id: u.id,
    name: u.name,
    code: u.code,
    label: `${scope.path(u.id)} (${institutions.get(u.institution_id)}/${u.code})`,
    institution_id: u.institution_id,
    canSubmit: member(u.id),
    canManage: manages(u.id)
  }));
  return {
    member,
    manages,
    departments,
    visible: /* @__PURE__ */ __name((id) => !!id && (member(id) || manages(id)), "visible"),
    requireMember(id) {
      if (!departments.some((u) => u.id === id && u.canSubmit))
        throw new HttpError(
          403,
          "\u9700\u8981\u8BE5\u6559\u7814\u5BA4\u7684\u6709\u6548\u4EFB\u804C\uFF0C\u4E0D\u80FD\u81EA\u884C\u6307\u5B9A\u5171\u4EAB\u8303\u56F4"
        );
    },
    requireManager(id) {
      if (!id || !manages(id))
        throw new HttpError(403, "\u9700\u8981\u8BE5\u6559\u7814\u5BA4\u6216\u5176\u4E0A\u7EA7\u8D1F\u8D23\u4EBA\u7684\u6709\u6548\u4EFB\u804C");
    }
  };
}
__name(scheduleAccess, "scheduleAccess");
async function requestScheduleAccess(db, res) {
  return res.locals.scheduleAccess ??= await scheduleAccess(
    db,
    res.locals.user.id
  );
}
__name(requestScheduleAccess, "requestScheduleAccess");

// server/scheduleDepartments.ts
import { randomUUID as randomUUID8 } from "node:crypto";
function registerScheduleDepartments(app, source) {
  const db = asyncDatabase(source);
  const admin = /* @__PURE__ */ __name((res) => {
    if (res.locals.user.role !== "admin")
      throw new HttpError(403, "\u4EC5\u7BA1\u7406\u5458\u53EF\u914D\u7F6E\u6559\u7814\u5BA4\u4EFB\u804C");
  }, "admin");
  app.get("/api/v1/schedules/department-admin", async (_req, res) => {
    admin(res);
    reply2(res, {
      institutions: await db.prepare("SELECT id,name FROM institutions ORDER BY name").all(),
      departments: await db.prepare(
        "SELECT u.id,u.name,u.code,u.institution_id,i.code institution_code,i.name institution_name FROM organization_units u JOIN institutions i ON i.id=u.institution_id WHERE u.status='active' AND u.kind IN ('department','group') ORDER BY i.name,u.name,u.code"
      ).all(),
      users: await db.prepare(
        "SELECT id,faculty_code,full_name FROM faculty_users WHERE status='ACTIVE' ORDER BY faculty_code"
      ).all(),
      members: await db.prepare(
        `SELECT a.id,a.position_id,a.starts_on,a.ends_on,p.unit_id,p.role_code,u.name unit_name,u.code unit_code,school.code institution_code,f.faculty_code,f.full_name
        FROM identity_appointments a JOIN identity_registry i ON i.id=a.identity_id
        JOIN organization_positions p ON p.id=a.position_id JOIN organization_units u ON u.id=p.unit_id
        JOIN institutions school ON school.id=u.institution_id
        JOIN faculty_users f ON f.id=i.account_id WHERE a.status='active' AND i.status='active' AND p.role_code IN ('teacher','director','mentor') ORDER BY u.name,f.faculty_code`
      ).all()
    });
  });
  app.post(
    "/api/v1/schedules/departments",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        admin(res);
        let institutionId = req.body.institution_id;
        if (!institutionId) {
          const institutions = await db.prepare("SELECT id FROM institutions").all();
          if (institutions.length > 1) throw new HttpError(422, "\u8BF7\u9009\u62E9\u5B66\u6821");
          institutionId = institutions[0]?.id;
          if (!institutionId) {
            institutionId = randomUUID8();
            await db.prepare(
              "INSERT INTO institutions(id,code,name) VALUES (?,?,?)"
            ).run(institutionId, "sakura-school", "\u672C\u6821");
          }
        }
        if (!await db.prepare("SELECT id FROM institutions WHERE id=?").get(institutionId))
          throw new HttpError(422, "\u5B66\u6821\u4E0D\u5B58\u5728");
        let root = await db.prepare(
          "SELECT id FROM organization_units WHERE institution_id=? AND parent_id IS NULL AND status='active'"
        ).get(institutionId);
        if (!root) {
          if (await db.prepare(
            "SELECT id FROM organization_units WHERE institution_id=? AND parent_id IS NULL"
          ).get(institutionId))
            throw new HttpError(409, "\u5B66\u6821\u7EC4\u7EC7\u5DF2\u5F52\u6863");
          root = { id: randomUUID8() };
          await db.prepare(
            "INSERT INTO organization_units(id,institution_id,parent_id,kind,code,name) VALUES (?,?,NULL,'school',?,?)"
          ).run(root.id, institutionId, "school-root", "\u5B66\u6821");
        }
        const id = randomUUID8();
        await ensureUnitProfile(db, root.id);
        await db.prepare(
          "INSERT INTO organization_units(id,institution_id,parent_id,kind,code,name) VALUES (?,?,?,'department',?,?)"
        ).run(
          id,
          institutionId,
          root.id,
          text(req.body.code, "\u6559\u7814\u5BA4\u4EE3\u7801", { max: 40 }),
          text(req.body.name, "\u6559\u7814\u5BA4\u540D\u79F0", { max: 80 })
        );
        await ensureUnitProfile(db, id);
        return { id };
      },
      "\u6559\u7814\u5BA4\u5DF2\u521B\u5EFA"
    )
  );
  app.post(
    "/api/v1/schedules/departments/:id/members",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        admin(res);
        const unit = await db.prepare(
          "SELECT * FROM organization_units WHERE id=? AND status='active' AND kind IN ('department','group')"
        ).get(req.params.id);
        const account = await db.prepare(
          "SELECT id,faculty_code,full_name FROM faculty_users WHERE id=? AND status='ACTIVE'"
        ).get(req.body.account_id);
        if (!unit || !account) throw new HttpError(422, "\u6559\u7814\u5BA4\u6216\u8D26\u53F7\u4E0D\u5B58\u5728");
        const role = req.body.role_code;
        if (!["teacher", "director"].includes(role))
          throw new HttpError(422, "\u8BF7\u9009\u62E9\u6559\u5E08\u6216\u6559\u7814\u5BA4\u8D1F\u8D23\u4EBA");
        let identity = await db.prepare(
          "SELECT id,status FROM identity_registry WHERE institution_id=? AND account_id=? AND identity_kind='staff'"
        ).get(unit.institution_id, account.id);
        if (identity && identity.status !== "active")
          throw new HttpError(409, "\u8EAB\u4EFD\u5DF2\u505C\u7528\uFF0C\u8BF7\u5148\u5904\u7406\u7EC4\u7EC7\u8EAB\u4EFD\u72B6\u6001");
        if (!identity) {
          identity = { id: randomUUID8(), status: "active" };
          await db.prepare(
            "INSERT INTO identity_registry(id,institution_id,account_id,identity_kind,external_id,display_name) VALUES (?,?,?,'staff',?,?)"
          ).run(
            identity.id,
            unit.institution_id,
            account.id,
            account.faculty_code,
            account.full_name
          );
        }
        await ensureStaffIdentity(db, unit.institution_id, account.id);
        let position = await db.prepare(
          "SELECT id FROM organization_positions WHERE institution_id=? AND unit_id=? AND code=?"
        ).get(unit.institution_id, unit.id, `schedule-${role}`);
        if (!position) {
          position = { id: randomUUID8() };
          await db.prepare(
            "INSERT INTO organization_positions(id,institution_id,unit_id,role_code,code,hierarchy_level) VALUES (?,?,?,?,?,?)"
          ).run(
            position.id,
            unit.institution_id,
            unit.id,
            role,
            `schedule-${role}`,
            role === "director" ? 10 : 50
          );
        }
        if (await db.prepare(
          "SELECT id FROM identity_appointments WHERE identity_id=? AND position_id=? AND status='active'"
        ).get(identity.id, position.id))
          throw new HttpError(409, "\u8BE5\u4EFB\u804C\u5DF2\u5B58\u5728\uFF0C\u8BF7\u5148\u64A4\u9500\u65E7\u4EFB\u804C\u518D\u91CD\u65B0\u914D\u7F6E");
        const id = randomUUID8();
        await db.prepare(
          "INSERT INTO identity_appointments(id,institution_id,identity_id,position_id,starts_on) VALUES (?,?,?,?,?)"
        ).run(
          id,
          unit.institution_id,
          identity.id,
          position.id,
          (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
        );
        return { id };
      },
      "\u4EFB\u804C\u5DF2\u786E\u8BA4\uFF0C\u6309\u8D26\u53F7 ID \u7ED1\u5B9A"
    )
  );
  app.patch(
    "/api/v1/schedules/appointments/:id",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        admin(res);
        if (req.body.revoked !== true)
          throw new HttpError(422, "\u4EC5\u652F\u6301\u64A4\u9500\u4EFB\u804C");
        if (!await db.prepare("SELECT id FROM identity_appointments WHERE id=?").get(req.params.id))
          throw new HttpError(404, "\u4EFB\u804C\u4E0D\u5B58\u5728");
        await db.prepare(
          "UPDATE identity_appointments SET status='revoked' WHERE id=?"
        ).run(req.params.id);
        return { id: req.params.id };
      },
      "\u4EFB\u804C\u5DF2\u64A4\u9500\uFF0C\u5171\u4EAB\u6743\u9650\u7ACB\u5373\u5931\u6548"
    )
  );
}
__name(registerScheduleDepartments, "registerScheduleDepartments");

// server/scheduleSubmissions.ts
import { randomUUID as randomUUID9 } from "node:crypto";
function registerScheduleSubmissions(app, source, helpers) {
  const db = asyncDatabase(source);
  const access = /* @__PURE__ */ __name(async (res) => await requestScheduleAccess(db, res), "access");
  const assertOwnClass = /* @__PURE__ */ __name(async (owner, classId) => {
    if (!await classOrganizationActive(db, classId))
      throw new HttpError(403, "\u73ED\u7EA7\u7684\u7EC4\u7EC7\u5F52\u5C5E\u5DF2\u5F52\u6863");
    if (!await db.prepare(
      "SELECT 1 FROM teaching_assignments a JOIN academic_terms t ON t.id=a.term_id JOIN academic_classes c ON c.id=a.class_id WHERE a.teacher_id=? AND a.class_id=? AND a.archived_at IS NULL AND t.archived_at IS NULL AND c.archived_at IS NULL LIMIT 1"
    ).get(owner, classId))
      throw new HttpError(403, "\u9ED8\u8BA4\u73ED\u7EA7\u53EA\u80FD\u9009\u62E9\u672C\u4EBA\u6709\u6548\u4EFB\u8BFE\u7684\u73ED\u7EA7");
  }, "assertOwnClass");
  const canTeach = /* @__PURE__ */ __name(async (owner, data) => {
    if (!await classOrganizationActive(db, data.class_id))
      throw new HttpError(403, "\u73ED\u7EA7\u7684\u7EC4\u7EC7\u5F52\u5C5E\u5DF2\u5F52\u6863");
    const terms = await db.prepare(
      `SELECT t.starts_on,t.ends_on FROM teaching_assignments a JOIN academic_terms t ON t.id=a.term_id
      WHERE a.teacher_id=? AND a.class_id=? AND a.course_id=? AND a.archived_at IS NULL AND t.archived_at IS NULL`
    ).all(owner, data.class_id, data.course_id);
    if (!terms.some(
      (t) => Date.parse(data.starts_at) >= Date.parse(`${t.starts_on}T00:00:00+08:00`) && Date.parse(data.ends_at) <= Date.parse(`${t.ends_on}T00:00:00+08:00`) + 864e5
    ))
      throw new HttpError(
        403,
        "\u53EA\u80FD\u63D0\u4EA4\u6709\u6548\u4EFB\u8BFE\u5B66\u671F\u5185\u7684\u73ED\u7EA7\u4E0E\u8BFE\u7A0B\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u5206\u914D\u4EFB\u8BFE"
      );
  }, "canTeach");
  const noDuplicate = /* @__PURE__ */ __name(async (owner, data, exclude = "") => {
    if (await db.prepare(
      "SELECT id FROM schedule_submissions WHERE owner_id=? AND class_id=? AND course_id=? AND starts_at=? AND ends_at=? AND status='submitted' AND id<>?"
    ).get(
      owner,
      data.class_id,
      data.course_id,
      data.starts_at,
      data.ends_at,
      exclude
    ))
      throw new HttpError(409, "\u76F8\u540C\u8BFE\u65F6\u5DF2\u6709\u5F85\u5BA1\u6279\u63D0\u4EA4");
  }, "noDuplicate");
  const present = /* @__PURE__ */ __name(async (row, res) => {
    const own = row.owner_id === res.locals.user.id, manager = (await access(res)).manages(row.unit_id);
    return {
      ...row,
      review_note: own || manager ? row.review_note : "",
      canEdit: own && ["draft", "rejected", "withdrawn"].includes(row.status),
      canWithdraw: own && row.status === "submitted",
      canReview: !await sameSchoolPerson(
        db,
        row.owner_id,
        res.locals.user.id,
        row.unit_id
      ) && manager && row.status === "submitted"
    };
  }, "present");
  const read = /* @__PURE__ */ __name(async (id, res) => {
    const row = await db.prepare(
      `SELECT s.*,f.full_name,f.faculty_code,c.class_name,k.name course_name,u.name unit_name
      FROM schedule_submissions s JOIN faculty_users f ON f.id=s.owner_id JOIN academic_classes c ON c.id=s.class_id
      JOIN courses k ON k.id=s.course_id LEFT JOIN organization_units u ON u.id=s.unit_id WHERE s.id=?`
    ).get(id);
    if (!row || row.owner_id !== res.locals.user.id && (!row.shared || !(row.status !== "draft" && (await access(res)).manages(row.unit_id)) && (!["submitted", "approved"].includes(row.status) || !(await access(res)).visible(row.unit_id))))
      throw new HttpError(404, "\u63D0\u4EA4\u8BB0\u5F55\u4E0D\u5B58\u5728\u6216\u672A\u5171\u4EAB");
    return row;
  }, "read");
  const fields = /* @__PURE__ */ __name(async (body, owner) => {
    const data = await helpers.validate({ ...body, teacher_id: owner });
    await canTeach(owner, data);
    return {
      ...data,
      note: text(body.note ?? "", "\u6392\u8BFE\u8BF4\u660E", { max: 1e3, optional: true })
    };
  }, "fields");
  app.get("/api/v1/schedules/default-class", async (_req, res) => {
    const row = await db.prepare(
      "SELECT class_id FROM faculty_class_defaults WHERE account_id=?"
    ).get(res.locals.user.id);
    const classId = row?.class_id ?? null;
    const valid = classId ? await db.prepare(
      "SELECT 1 FROM teaching_assignments a JOIN academic_terms t ON t.id=a.term_id JOIN academic_classes c ON c.id=a.class_id WHERE a.teacher_id=? AND a.class_id=? AND a.archived_at IS NULL AND t.archived_at IS NULL AND c.archived_at IS NULL LIMIT 1"
    ).get(res.locals.user.id, classId) : null;
    reply2(res, {
      class_id: valid && await classOrganizationActive(db, classId) ? classId : null
    });
  });
  app.put(
    "/api/v1/schedules/default-class",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const accountId = res.locals.user.id;
        const classId = req.body.class_id ? text(req.body.class_id, "\u9ED8\u8BA4\u73ED\u7EA7", { max: 128 }) : null;
        if (classId) await assertOwnClass(accountId, classId);
        await db.prepare(
          `INSERT INTO faculty_class_defaults(account_id,class_id,updated_at) VALUES (?,?,?)
             ON CONFLICT(account_id) DO UPDATE SET class_id=excluded.class_id,updated_at=excluded.updated_at`
        ).run(accountId, classId, (/* @__PURE__ */ new Date()).toISOString());
        return { class_id: classId };
      },
      "\u9ED8\u8BA4\u73ED\u7EA7\u5DF2\u66F4\u65B0"
    )
  );
  app.get("/api/v1/schedules/task-pool", async (_req, res) => {
    const rows = await db.prepare(
      "SELECT p.*,c.class_name preferred_class_name FROM schedule_task_pool p LEFT JOIN academic_classes c ON c.id=p.preferred_class_id WHERE p.owner_id=? AND p.status='open' ORDER BY p.updated_at DESC,p.id LIMIT 200"
    ).all(res.locals.user.id);
    reply2(res, rows);
  });
  app.post(
    "/api/v1/schedules/task-pool",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const ownerId = res.locals.user.id;
        const title = text(req.body.title, "\u4EFB\u52A1\u6807\u9898", { max: 120 });
        const note = text(req.body.note ?? "", "\u4EFB\u52A1\u8BF4\u660E", {
          max: 1e3,
          optional: true
        });
        const defaultRow = await db.prepare("SELECT class_id FROM faculty_class_defaults WHERE account_id=?").get(ownerId);
        const classId = req.body.preferred_class_id ? text(req.body.preferred_class_id, "\u9884\u9009\u73ED\u7EA7", { max: 128 }) : defaultRow?.class_id ?? null;
        if (req.body.preferred_class_id && classId)
          await assertOwnClass(ownerId, classId);
        const hasCurrentAssignment = classId ? await db.prepare(
          "SELECT 1 FROM teaching_assignments a JOIN academic_terms t ON t.id=a.term_id JOIN academic_classes c ON c.id=a.class_id WHERE a.teacher_id=? AND a.class_id=? AND a.archived_at IS NULL AND t.archived_at IS NULL AND c.archived_at IS NULL LIMIT 1"
        ).get(ownerId, classId) : null;
        const preferredClassId = hasCurrentAssignment && classId && await classOrganizationActive(db, classId) ? classId : null;
        const pendingCount = await db.prepare(
          "SELECT COUNT(*) AS count FROM schedule_task_pool WHERE owner_id=? AND status='open'"
        ).get(ownerId);
        if (pendingCount.count >= 200)
          throw new HttpError(409, "\u4E2A\u4EBA\u6392\u8BFE\u4EFB\u52A1\u6C60\u5DF2\u6EE1\uFF0C\u8BF7\u5148\u5904\u7406\u73B0\u6709\u4EFB\u52A1");
        const id = randomUUID9();
        const now = (/* @__PURE__ */ new Date()).toISOString();
        await db.prepare(
          "INSERT INTO schedule_task_pool(id,owner_id,title,note,preferred_class_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?)"
        ).run(id, ownerId, title, note, preferredClassId, now, now);
        return {
          id,
          owner_id: ownerId,
          title,
          note,
          preferred_class_id: preferredClassId,
          status: "open",
          version: 1,
          created_at: now,
          updated_at: now
        };
      },
      "\u4EFB\u52A1\u5DF2\u52A0\u5165\u4F60\u7684\u6392\u8BFE\u4E2D\u95F4\u6C60\uFF0C\u4EC5\u4F60\u672C\u4EBA\u53EF\u89C1"
    )
  );
  app.patch(
    "/api/v1/schedules/task-pool/:id",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const row = await db.prepare("SELECT * FROM schedule_task_pool WHERE id=? AND owner_id=?").get(req.params.id, res.locals.user.id);
        if (!row) throw new HttpError(404, "\u4EFB\u52A1\u4E0D\u5B58\u5728");
        version(req.body, row);
        if (row.status !== "open")
          throw new HttpError(409, "\u8BE5\u4EFB\u52A1\u5DF2\u7ED1\u5B9A\u6392\u8BFE\u6216\u5DF2\u5173\u95ED");
        if (req.body.action === "cancel") {
          await db.prepare(
            "UPDATE schedule_task_pool SET status='cancelled',updated_at=?,version=version+1 WHERE id=? AND owner_id=?"
          ).run((/* @__PURE__ */ new Date()).toISOString(), row.id, res.locals.user.id);
          return { ...row, status: "cancelled", version: row.version + 1 };
        }
        const title = text(req.body.title ?? row.title, "\u4EFB\u52A1\u6807\u9898", { max: 120 });
        const note = text(req.body.note ?? row.note, "\u4EFB\u52A1\u8BF4\u660E", {
          max: 1e3,
          optional: true
        });
        const classId = req.body.preferred_class_id === void 0 ? row.preferred_class_id : req.body.preferred_class_id || null;
        if (classId) await assertOwnClass(res.locals.user.id, classId);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        await db.prepare(
          "UPDATE schedule_task_pool SET title=?,note=?,preferred_class_id=?,updated_at=?,version=version+1 WHERE id=? AND owner_id=?"
        ).run(title, note, classId, now, row.id, res.locals.user.id);
        return {
          ...row,
          title,
          note,
          preferred_class_id: classId,
          updated_at: now,
          version: row.version + 1
        };
      },
      "\u4EFB\u52A1\u6C60\u5DF2\u66F4\u65B0"
    )
  );
  app.get("/api/v1/schedules/submissions", async (req, res) => {
    const [from, to] = helpers.range(req.query), scope = await access(res), ids = scope.departments.map((u) => u.id), managed = scope.departments.filter((u) => u.canManage).map((u) => u.id);
    const rows = await db.prepare(
      `SELECT s.id FROM schedule_submissions s WHERE starts_at>=? AND starts_at<? AND
      (owner_id=? ${ids.length ? `OR (shared=1 AND status IN ('submitted','approved') AND unit_id IN (${ids.map(() => "?").join(",")}))` : ""}
      ${managed.length ? `OR (shared=1 AND status<>'draft' AND unit_id IN (${managed.map(() => "?").join(",")}))` : ""})
      ORDER BY updated_at DESC,id LIMIT 500`
    ).all(from, to, res.locals.user.id, ...ids, ...managed);
    reply2(
      res,
      await Promise.all(
        rows.map(async (r) => await present(await read(r.id, res), res))
      )
    );
  });
  app.post(
    "/api/v1/schedules/submissions",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const action = req.body.action ?? "draft";
        if (!["draft", "submit"].includes(action))
          throw new HttpError(422, "\u63D0\u4EA4\u64CD\u4F5C\u65E0\u6548");
        const owner = res.locals.user.id, data = await fields(req.body, owner), unit = req.body.unit_id || null;
        if (unit) {
          (await access(res)).requireMember(unit);
          await assertUnitCourse(db, unit, data.course_id);
        }
        if (action === "submit") {
          (await access(res)).requireMember(unit);
          await helpers.noConflict(data);
          await noDuplicate(owner, data);
        }
        const poolTaskId = req.body.pool_task_id ? text(req.body.pool_task_id, "\u4E2D\u95F4\u6C60\u4EFB\u52A1", { max: 128 }) : null;
        if (poolTaskId) {
          const poolTask = await db.prepare(
            "SELECT id,status FROM schedule_task_pool WHERE id=? AND owner_id=?"
          ).get(poolTaskId, owner);
          if (!poolTask || poolTask.status !== "open")
            throw new HttpError(409, "\u4E2D\u95F4\u6C60\u4EFB\u52A1\u4E0D\u5B58\u5728\u6216\u5DF2\u88AB\u5904\u7406");
        }
        const id = randomUUID9(), now = (/* @__PURE__ */ new Date()).toISOString();
        await db.prepare(
          "INSERT INTO schedule_submissions(id,owner_id,unit_id,class_id,course_id,starts_at,ends_at,room,note,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
        ).run(
          id,
          owner,
          unit,
          data.class_id,
          data.course_id,
          data.starts_at,
          data.ends_at,
          data.room,
          data.note,
          action === "submit" ? "submitted" : "draft",
          now,
          now
        );
        if (poolTaskId) {
          const linked = await db.prepare(
            "UPDATE schedule_task_pool SET status='linked',submission_id=?,updated_at=?,version=version+1 WHERE id=? AND owner_id=? AND status='open'"
          ).run(id, now, poolTaskId, owner);
          if (linked.changes !== 1)
            throw new HttpError(409, "\u4E2D\u95F4\u6C60\u4EFB\u52A1\u5DF2\u88AB\u5904\u7406\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5");
        }
        return await present(await read(id, res), res);
      },
      "\u8BFE\u8868\u63D0\u4EA4\u5DF2\u4FDD\u5B58\uFF1B\u63D0\u4EA4\u5230\u6559\u7814\u5BA4\u540E\u5171\u4EAB\uFF0C\u5BA1\u6279\u901A\u8FC7\u540E\u8BA1\u5165\u6B63\u5F0F\u8BFE\u8868"
    )
  );
  app.patch(
    "/api/v1/schedules/submissions/:id",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const row = await read(req.params.id, res);
        version(req.body, row);
        const action = req.body.action, own = row.owner_id === res.locals.user.id, now = (/* @__PURE__ */ new Date()).toISOString();
        if (["save", "submit", "withdraw"].includes(action)) {
          if (!own) throw new HttpError(403, "\u53EA\u80FD\u4FEE\u6539\u6216\u64A4\u56DE\u81EA\u5DF1\u7684\u8BFE\u8868\u63D0\u4EA4");
          if (action === "withdraw") {
            if (row.status !== "submitted")
              throw new HttpError(409, "\u4EC5\u5F85\u5BA1\u6279\u63D0\u4EA4\u53EF\u4EE5\u64A4\u56DE");
            await db.prepare(
              "UPDATE schedule_submissions SET status='withdrawn',updated_at=?,version=version+1 WHERE id=?"
            ).run(now, row.id);
          } else {
            if (!["draft", "rejected", "withdrawn"].includes(row.status))
              throw new HttpError(
                409,
                "\u8BF7\u5148\u64A4\u56DE\u5F85\u5BA1\u6279\u63D0\u4EA4\uFF0C\u6B63\u5F0F\u8BFE\u8868\u8BF7\u4F7F\u7528\u8C03\u4EE3\u8BFE\u7533\u8BF7"
              );
            const data = await fields({ ...row, ...req.body }, row.owner_id), unit = req.body.unit_id === void 0 ? row.unit_id : req.body.unit_id || null;
            if (unit) {
              (await access(res)).requireMember(unit);
              await assertUnitCourse(db, unit, data.course_id);
            }
            if (action === "submit") {
              (await access(res)).requireMember(unit);
              await helpers.noConflict({ ...data, teacher_id: row.owner_id });
              await noDuplicate(row.owner_id, data, row.id);
            }
            await db.prepare(
              "UPDATE schedule_submissions SET unit_id=?,class_id=?,course_id=?,starts_at=?,ends_at=?,room=?,note=?,status=?,reviewer_id=NULL,review_note='',updated_at=?,version=version+1 WHERE id=?"
            ).run(
              unit,
              data.class_id,
              data.course_id,
              data.starts_at,
              data.ends_at,
              data.room,
              data.note,
              action === "submit" ? "submitted" : "draft",
              now,
              row.id
            );
          }
        } else if (["approve", "reject"].includes(action)) {
          (await access(res)).requireManager(row.unit_id);
          if (await sameSchoolPerson(
            db,
            row.owner_id,
            res.locals.user.id,
            row.unit_id
          ))
            throw new HttpError(
              403,
              "\u4E0D\u80FD\u5BA1\u6279\u81EA\u5DF1\u6216\u540C\u4E00\u4EBA\u5458\u5173\u8054\u8D26\u53F7\u7684\u8BFE\u8868\u63D0\u4EA4"
            );
          if (row.status !== "submitted")
            throw new HttpError(409, "\u8BE5\u63D0\u4EA4\u5DF2\u5904\u7406");
          const review = text(req.body.review_note ?? "", "\u5BA1\u6279\u610F\u89C1", {
            max: 1e3,
            optional: true
          });
          let entryId = null;
          if (action === "approve") {
            (await scheduleAccess(db, row.owner_id)).requireMember(
              row.unit_id
            );
            await assertUnitCourse(db, row.unit_id, row.course_id);
            const data = await fields(row, row.owner_id);
            await helpers.noConflict({ ...data, teacher_id: row.owner_id });
            entryId = randomUUID9();
            await db.prepare(
              "INSERT INTO schedule_entries(id,class_id,teacher_id,course_id,starts_at,ends_at,room) VALUES (?,?,?,?,?,?,?)"
            ).run(
              entryId,
              row.class_id,
              row.owner_id,
              row.course_id,
              data.starts_at,
              data.ends_at,
              data.room
            );
            await db.prepare(
              "INSERT INTO schedule_entry_scopes(entry_id,unit_id,shared_by) VALUES (?,?,?)"
            ).run(entryId, row.unit_id, row.owner_id);
          }
          await db.prepare(
            "UPDATE schedule_submissions SET status=?,entry_id=?,reviewer_id=?,review_note=?,updated_at=?,version=version+1 WHERE id=?"
          ).run(
            action === "approve" ? "approved" : "rejected",
            entryId,
            res.locals.user.id,
            review,
            now,
            row.id
          );
        } else throw new HttpError(422, "\u64CD\u4F5C\u65E0\u6548");
        return await present(await read(row.id, res), res);
      },
      "\u8BFE\u8868\u63D0\u4EA4\u72B6\u6001\u5DF2\u66F4\u65B0"
    )
  );
}
__name(registerScheduleSubmissions, "registerScheduleSubmissions");

// server/organization.ts
import { randomUUID as randomUUID10 } from "node:crypto";
function registerOrganization(app, source) {
  const db = asyncDatabase(source);
  const admin = /* @__PURE__ */ __name((res) => {
    if (res.locals.user.role !== "admin")
      throw new HttpError(403, "\u9700\u8981\u7EC4\u7EC7\u914D\u7F6E\u7BA1\u7406\u5458\u6743\u9650");
  }, "admin");
  const unit = /* @__PURE__ */ __name(async (id) => {
    const row = await db.prepare(
      "SELECT u.*,COALESCE(p.unit_type,u.kind) unit_type,p.subject_id FROM organization_units u LEFT JOIN organization_unit_profiles p ON p.unit_id=u.id WHERE u.id=?"
    ).get(text(id, "\u7EC4\u7EC7 ID", { max: 128 }));
    if (!row || row.status !== "active")
      throw new HttpError(422, "\u7EC4\u7EC7\u4E0D\u5B58\u5728\u6216\u5DF2\u5F52\u6863");
    return row;
  }, "unit");
  const dates = /* @__PURE__ */ __name((body, defaultStart = schoolToday(), defaultEnd = null) => {
    const starts = body.starts_on || defaultStart, ends = body.ends_on || defaultEnd;
    if (typeof starts !== "string" || !exactDate(starts) || ends !== null && (typeof ends !== "string" || !exactDate(ends) || ends < starts))
      throw new HttpError(422, "\u4EFB\u804C\u6216\u8D44\u683C\u65E5\u671F\u65E0\u6548");
    return { starts, ends };
  }, "dates");
  app.get("/api/v1/organization/admin", async (_req, res) => {
    admin(res);
    const scope = await organizationScope(db, res.locals.user.id);
    reply2(res, {
      institutions: await db.prepare("SELECT id,code,name FROM institutions ORDER BY code").all(),
      units: scope.units.map((u) => ({
        ...u,
        path: scope.path(u.id),
        pathActive: !!scope.ancestors(u.id).length
      })),
      types: await db.prepare("SELECT * FROM organization_unit_types").all(),
      parentRules: await db.prepare("SELECT * FROM organization_parent_rules").all(),
      subjects: await db.prepare("SELECT * FROM school_subjects ORDER BY code").all(),
      subjectCourses: await db.prepare("SELECT * FROM subject_courses").all(),
      courses: await db.prepare(
        "SELECT id,code,name FROM courses WHERE archived_at IS NULL ORDER BY code"
      ).all(),
      users: await db.prepare(
        "SELECT id,faculty_code,full_name FROM faculty_users WHERE status='ACTIVE' ORDER BY faculty_code"
      ).all(),
      members: await db.prepare(
        `SELECT a.id,a.starts_on,a.ends_on,a.status,p.unit_id,p.role_code,f.id account_id,f.faculty_code,f.full_name,i.institution_id,l.person_id
        FROM identity_appointments a JOIN organization_positions p ON p.id=a.position_id JOIN identity_registry i ON i.id=a.identity_id
        JOIN faculty_users f ON f.id=i.account_id LEFT JOIN identity_person_links l ON l.identity_id=i.id WHERE a.status='active' ORDER BY a.id`
      ).all(),
      classLinks: await db.prepare(
        "SELECT l.*,c.class_name FROM organization_class_links l JOIN academic_classes c ON c.id=l.class_id"
      ).all(),
      classes: await db.prepare(
        "SELECT id,class_code,class_name FROM academic_classes WHERE archived_at IS NULL ORDER BY class_code"
      ).all(),
      qualifications: await db.prepare(
        "SELECT q.*,c.name course_name FROM staff_course_qualifications q JOIN courses c ON c.id=q.course_id WHERE q.status='active'"
      ).all()
    });
  });
  app.post(
    "/api/v1/organization/schools",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        admin(res);
        const id = randomUUID10(), root = randomUUID10();
        await db.prepare("INSERT INTO institutions(id,code,name) VALUES (?,?,?)").run(
          id,
          text(req.body.code, "\u5B66\u6821\u4EE3\u7801", { max: 40 }),
          text(req.body.name, "\u5B66\u6821\u540D\u79F0", { max: 80 })
        );
        await db.prepare(
          "INSERT INTO organization_units(id,institution_id,parent_id,kind,code,name) VALUES (?,?,NULL,'school','school-root',?)"
        ).run(root, id, text(req.body.name, "\u5B66\u6821\u540D\u79F0", { max: 80 }));
        await ensureUnitProfile(db, root);
        return { id, root_id: root };
      },
      "\u5B66\u6821\u7EC4\u7EC7\u5DF2\u5EFA\u7ACB"
    )
  );
  app.post(
    "/api/v1/organization/units",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        admin(res);
        const parent = await unit(req.body.parent_id), type = text(req.body.unit_type, "\u7EC4\u7EC7\u7C7B\u578B", { max: 40 });
        const definition = await db.prepare(
          "SELECT * FROM organization_unit_types WHERE code=? AND code<>'school'"
        ).get(type);
        if (!definition) throw new HttpError(422, "\u7EC4\u7EC7\u7C7B\u578B\u65E0\u6548");
        if (!(await organizationScope(db, res.locals.user.id)).ancestors(
          parent.id
        ).length)
          throw new HttpError(409, "\u4E0A\u7EA7\u7EC4\u7EC7\u94FE\u5DF2\u5F52\u6863");
        if (!await db.prepare(
          "SELECT 1 FROM organization_parent_rules WHERE parent_type=? AND child_type=?"
        ).get(parent.unit_type, type))
          throw new HttpError(422, "\u6240\u9009\u7EC4\u7EC7\u7C7B\u578B\u4E0D\u80FD\u8BBE\u5728\u8FD9\u4E2A\u4E0A\u7EA7\u4E0B");
        const subject = type === "subject_group" ? text(req.body.subject_id, "\u5B66\u79D1", { max: 128 }) : null;
        if (subject && !await db.prepare(
          "SELECT id FROM school_subjects WHERE id=? AND institution_id=? AND status='active'"
        ).get(subject, parent.institution_id))
          throw new HttpError(422, "\u5B66\u79D1\u5FC5\u987B\u5C5E\u4E8E\u540C\u4E00\u5B66\u6821");
        const id = randomUUID10();
        await db.prepare(
          "INSERT INTO organization_units(id,institution_id,parent_id,kind,code,name) VALUES (?,?,?,?,?,?)"
        ).run(
          id,
          parent.institution_id,
          parent.id,
          definition.structural_kind,
          text(req.body.code, "\u7EC4\u7EC7\u4EE3\u7801", { max: 40 }),
          text(req.body.name, "\u7EC4\u7EC7\u540D\u79F0", { max: 80 })
        );
        await db.prepare("INSERT INTO organization_unit_profiles VALUES (?,?,?,?)").run(id, parent.institution_id, type, subject);
        return { id };
      },
      "\u7EC4\u7EC7\u8282\u70B9\u5DF2\u5EFA\u7ACB\uFF0C\u4E0A\u4E0B\u7EA7\u5173\u7CFB\u5DF2\u6821\u9A8C"
    )
  );
  app.patch(
    "/api/v1/organization/units/:id",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        admin(res);
        if (req.body.archived !== true)
          throw new HttpError(422, "\u4EC5\u652F\u6301\u5F52\u6863\uFF1B\u91CD\u7EC4\u8BF7\u5EFA\u7ACB\u65B0\u5B9A\u4E49\u4EE5\u4FDD\u7559\u5386\u53F2");
        const row = await unit(req.params.id);
        await db.prepare(
          "UPDATE organization_units SET status='archived' WHERE id=?"
        ).run(row.id);
        return { id: row.id };
      },
      "\u7EC4\u7EC7\u5DF2\u5F52\u6863\uFF0C\u4E0B\u5C5E\u4EFB\u804C\u7684\u65B0\u8BBF\u95EE\u6743\u9650\u5931\u6548"
    )
  );
  app.post(
    "/api/v1/organization/subjects",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        admin(res);
        const institution = text(req.body.institution_id, "\u5B66\u6821 ID", {
          max: 128
        });
        if (!await db.prepare("SELECT id FROM institutions WHERE id=?").get(institution))
          throw new HttpError(422, "\u5B66\u6821\u4E0D\u5B58\u5728");
        const id = randomUUID10();
        await db.prepare(
          "INSERT INTO school_subjects(id,institution_id,code,name) VALUES (?,?,?,?)"
        ).run(
          id,
          institution,
          text(req.body.code, "\u5B66\u79D1\u4EE3\u7801", { max: 40 }),
          text(req.body.name, "\u5B66\u79D1\u540D\u79F0", { max: 80 })
        );
        return { id };
      },
      "\u5B66\u79D1\u5DF2\u5EFA\u7ACB"
    )
  );
  app.post(
    "/api/v1/organization/subject-courses",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        admin(res);
        const subject = await db.prepare(
          "SELECT * FROM school_subjects WHERE id=? AND status='active'"
        ).get(text(req.body.subject_id, "\u5B66\u79D1 ID", { max: 128 }));
        if (!subject || !await db.prepare(
          "SELECT id FROM courses WHERE id=? AND archived_at IS NULL"
        ).get(text(req.body.course_id, "\u8BFE\u7A0B ID", { max: 128 })))
          throw new HttpError(422, "\u5B66\u79D1\u6216\u8BFE\u7A0B\u65E0\u6548");
        await db.prepare("INSERT INTO subject_courses VALUES (?,?,?)").run(subject.institution_id, subject.id, req.body.course_id);
        return { id: subject.id };
      },
      "\u8BFE\u7A0B\u5DF2\u5F52\u5165\u5B66\u79D1"
    )
  );
  app.post(
    "/api/v1/organization/appointments",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        admin(res);
        const node = await unit(req.body.unit_id), scope = await organizationScope(db, res.locals.user.id);
        const chain = scope.ancestors(node.id);
        if (!chain.length) throw new HttpError(409, "\u7EC4\u7EC7\u94FE\u5DF2\u5F52\u6863");
        if (chain.length > 10) throw new HttpError(422, "\u7EC4\u7EC7\u5C42\u7EA7\u6700\u591A\u5341\u7EA7");
        const role = text(req.body.role_code, "\u4EFB\u804C\u8EAB\u4EFD", { max: 40 });
        if (![
          "teacher",
          "director",
          "homeroom_teacher",
          "subject_member",
          "mentor",
          "counselor"
        ].includes(role))
          throw new HttpError(422, "\u4EFB\u804C\u8EAB\u4EFD\u65E0\u6548");
        if (role === "homeroom_teacher" && !["homeroom", "class"].includes(node.unit_type))
          throw new HttpError(422, "\u73ED\u4E3B\u4EFB\u5FC5\u987B\u4EFB\u804C\u4E8E\u73ED\u7EA7\u8282\u70B9");
        if (role === "subject_member" && node.unit_type !== "subject_group")
          throw new HttpError(422, "\u5B66\u79D1\u7EC4\u6210\u5458\u5FC5\u987B\u4EFB\u804C\u4E8E\u5B66\u79D1\u7EC4");
        const identity = await ensureStaffIdentity(
          db,
          node.institution_id,
          text(req.body.account_id, "\u8D26\u53F7 ID", { max: 128 })
        ), period = dates(req.body);
        const code = "org-" + role;
        let position = await db.prepare(
          "SELECT id FROM organization_positions WHERE institution_id=? AND unit_id=? AND code=?"
        ).get(node.institution_id, node.id, code);
        if (!position) {
          position = { id: randomUUID10() };
          await db.prepare(
            "INSERT INTO organization_positions(id,institution_id,unit_id,role_code,code,hierarchy_level) VALUES (?,?,?,?,?,?)"
          ).run(
            position.id,
            node.institution_id,
            node.id,
            role,
            code,
            (chain.length - 1) * 8 + (role === "director" ? 1 : 6)
          );
        }
        const id = randomUUID10();
        await db.prepare(
          "INSERT INTO identity_appointments(id,institution_id,identity_id,position_id,starts_on,ends_on) VALUES (?,?,?,?,?,?)"
        ).run(
          id,
          node.institution_id,
          identity.identityId,
          position.id,
          period.starts,
          period.ends
        );
        if (req.body.supervisor_appointment_id) {
          const supervisor = text(
            req.body.supervisor_appointment_id,
            "\u76F4\u5C5E\u4E0A\u7EA7\u4EFB\u804C ID",
            { max: 128 }
          );
          if (!(await activeStaffAppointments(db)).some(
            (a) => a.appointment_id === supervisor && a.institution_id === node.institution_id && scope.ancestors(a.unit_id).length
          ))
            throw new HttpError(422, "\u76F4\u5C5E\u4E0A\u7EA7\u4EFB\u804C\u5DF2\u5931\u6548");
          await db.prepare(
            "INSERT INTO identity_reporting_lines(id,institution_id,subordinate_id,supervisor_id) VALUES (?,?,?,?)"
          ).run(randomUUID10(), node.institution_id, id, supervisor);
        }
        return { id, person_id: identity.personId };
      },
      "\u4EFB\u804C\u5DF2\u786E\u8BA4\uFF0C\u53EF\u540C\u65F6\u4FDD\u7559\u5176\u4ED6\u5C97\u4F4D"
    )
  );
  app.post(
    "/api/v1/organization/class-links",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        admin(res);
        const node = await unit(req.body.unit_id), classId = text(req.body.class_id, "\u73ED\u7EA7 ID", { max: 128 });
        if (!["homeroom", "class"].includes(node.unit_type) || !await db.prepare(
          "SELECT id FROM academic_classes WHERE id=? AND archived_at IS NULL"
        ).get(classId))
          throw new HttpError(422, "\u8BF7\u9009\u62E9\u6709\u6548\u7684\u73ED\u7EA7\u8282\u70B9\u548C\u6559\u52A1\u73ED\u7EA7");
        if (!(await organizationScope(db, res.locals.user.id)).ancestors(
          node.id
        ).length)
          throw new HttpError(409, "\u7EC4\u7EC7\u94FE\u5DF2\u5F52\u6863");
        await ensureUnitProfile(db, node.id);
        await db.prepare("INSERT INTO organization_class_links VALUES (?,?,?)").run(classId, node.institution_id, node.id);
        return { id: classId };
      },
      "\u73ED\u7EA7\u5DF2\u7ED1\u5B9A\u7EC4\u7EC7\u5F52\u5C5E\uFF1B\u73ED\u4E3B\u4EFB\u6743\u9650\u4EE5\u6709\u6548\u4EFB\u804C\u4E3A\u51C6"
    )
  );
  app.post(
    "/api/v1/organization/qualifications",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        admin(res);
        const appointment = await db.prepare(
          `SELECT a.*,p.unit_id,p.role_code,f.subject_id FROM identity_appointments a JOIN organization_positions p ON p.id=a.position_id JOIN organization_unit_profiles f ON f.unit_id=p.unit_id WHERE a.id=? AND a.status='active' AND f.unit_type='subject_group'`
        ).get(text(req.body.appointment_id, "\u4EFB\u804C ID", { max: 128 }));
        if (!appointment || !["teacher", "subject_member", "director", "mentor"].includes(
          appointment.role_code
        ))
          throw new HttpError(422, "\u8BF7\u9009\u62E9\u6709\u6548\u5B66\u79D1\u7EC4\u4EFB\u804C");
        if (!(await organizationScope(db, res.locals.user.id)).ancestors(
          appointment.unit_id
        ).length)
          throw new HttpError(409, "\u7EC4\u7EC7\u94FE\u5DF2\u5F52\u6863");
        const course = text(req.body.course_id, "\u8BFE\u7A0B ID", { max: 128 });
        if (!await db.prepare(
          "SELECT 1 FROM subject_courses WHERE subject_id=? AND course_id=?"
        ).get(appointment.subject_id, course))
          throw new HttpError(422, "\u8BFE\u7A0B\u672A\u5F52\u5165\u8BE5\u5B66\u79D1");
        const period = dates(
          req.body,
          [schoolToday(), appointment.starts_on].sort().at(-1),
          appointment.ends_on
        );
        if (period.starts < appointment.starts_on || appointment.ends_on && (!period.ends || period.ends > appointment.ends_on))
          throw new HttpError(422, "\u8D44\u683C\u6709\u6548\u671F\u4E0D\u80FD\u8D85\u51FA\u4EFB\u804C\u671F\u9650");
        const id = randomUUID10();
        await db.prepare(
          "INSERT INTO staff_course_qualifications(id,institution_id,appointment_id,subject_id,course_id,starts_on,ends_on) VALUES (?,?,?,?,?,?,?)"
        ).run(
          id,
          appointment.institution_id,
          appointment.id,
          appointment.subject_id,
          course,
          period.starts,
          period.ends
        );
        return { id };
      },
      "\u4EFB\u6559\u8D44\u683C\u5DF2\u786E\u8BA4\uFF0C\u4E0D\u81EA\u52A8\u5206\u914D\u73ED\u7EA7\u6216\u5F00\u653E\u5176\u4ED6\u4E1A\u52A1\u8D44\u6599"
    )
  );
  app.patch(
    "/api/v1/organization/qualifications/:id",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        admin(res);
        const row = await db.prepare("SELECT * FROM staff_course_qualifications WHERE id=?").get(req.params.id);
        if (!row) throw new HttpError(404, "\u8D44\u683C\u4E0D\u5B58\u5728");
        version(req.body, row);
        if (req.body.revoked !== true)
          throw new HttpError(422, "\u4EC5\u652F\u6301\u64A4\u9500\u8D44\u683C");
        await db.prepare(
          "UPDATE staff_course_qualifications SET status='revoked',version=version+1 WHERE id=?"
        ).run(row.id);
        return { id: row.id };
      },
      "\u4EFB\u6559\u8D44\u683C\u5DF2\u64A4\u9500"
    )
  );
  app.get("/api/v1/organization/scope", async (_req, res) => {
    const scope = await organizationScope(db, res.locals.user.id);
    const units = scope.visibleUnits;
    const subjects = await db.prepare(
      "SELECT id,institution_id,code,name FROM school_subjects WHERE status='active'"
    ).all();
    reply2(res, {
      units,
      subjects: subjects.filter(
        (s) => units.some((u) => u.institution_id === s.institution_id)
      ),
      courses: await db.prepare("SELECT id,code,name FROM courses WHERE archived_at IS NULL").all()
    });
  });
  app.get("/api/v1/organization/dispatchable-teachers", async (req, res) => {
    const scope = await organizationScope(db, res.locals.user.id), node = await unit(req.query.unit_id);
    if (!scope.member(node.id) && !scope.manages(node.id))
      throw new HttpError(403, "\u53EA\u80FD\u53D1\u73B0\u672C\u4EBA\u4EFB\u804C\u6216\u8D1F\u8D23\u8303\u56F4\u5185\u7684\u53EF\u534F\u8C03\u4EBA\u5458");
    if (!scope.ancestors(node.id).length)
      throw new HttpError(403, "\u7EC4\u7EC7\u94FE\u5DF2\u5F52\u6863");
    const subject = text(req.query.subject_id, "\u5B66\u79D1 ID", {
      optional: true,
      max: 128
    }), course = text(req.query.course_id, "\u8BFE\u7A0B ID", {
      optional: true,
      max: 128
    }), descendants = new Set(scope.descendants(node.id));
    const all = (await activeStaffAppointments(db)).filter(
      (a) => a.institution_id === node.institution_id && scope.ancestors(a.unit_id).length
    );
    const candidates = /* @__PURE__ */ new Map();
    for (const appointment of all) {
      if (!descendants.has(appointment.unit_id) || appointment.unit_type !== "subject_group" || subject && appointment.subject_id !== subject)
        continue;
      const qualifications = (await coursesForAppointment(db, appointment)).filter((c) => !course || c.id === course);
      if (!qualifications.length) continue;
      const key2 = appointment.person_id || appointment.identity_id;
      let person = candidates.get(key2);
      if (!person) {
        person = {
          person_id: key2,
          account_id: appointment.account_id,
          faculty_code: appointment.faculty_code,
          full_name: appointment.full_name || appointment.faculty_code,
          qualifications: [],
          appointments: all.filter((a) => (a.person_id || a.identity_id) === key2).map((a) => ({
            id: a.appointment_id,
            unit_id: a.unit_id,
            unit_name: a.unit_name,
            path: scope.path(a.unit_id),
            role_code: a.role_code,
            starts_on: a.starts_on,
            ends_on: a.ends_on
          })),
          availability: "needs_confirmation"
        };
        candidates.set(key2, person);
      }
      for (const qualification of qualifications)
        if (!person.qualifications.some(
          (q) => q.course_id === qualification.id && q.unit_id === appointment.unit_id
        ))
          person.qualifications.push({
            course_id: qualification.id,
            course_name: qualification.name,
            unit_id: appointment.unit_id,
            unit_name: appointment.unit_name,
            evidence: qualification.evidence
          });
    }
    reply2(res, {
      teachers: [...candidates.values()].sort(
        (a, b) => a.faculty_code.localeCompare(b.faculty_code)
      ),
      note: "\u4EFB\u6559\u8D44\u683C\u5019\u9009\uFF1B\u7A7A\u95F2\u65F6\u95F4\u5F85\u672C\u4EBA\u6216\u6B63\u5F0F\u6392\u8BFE\u786E\u8BA4\uFF0C\u8BFE\u65F6\u4ECD\u9700\u51B2\u7A81\u68C0\u67E5\u548C\u5BA1\u6279\u3002"
    });
  });
}
__name(registerOrganization, "registerOrganization");

// server/schedules.ts
function registerSchedules(app, source) {
  const db = asyncDatabase(source);
  const admin = /* @__PURE__ */ __name(async (res, unitId) => {
    (await requestScheduleAccess(db, res)).requireManager(unitId);
    const ids = process.env.SAKURA_SWAP_APPROVER_IDS?.split(",");
    if (ids && !ids.includes(res.locals.user.id))
      throw new HttpError(403, "\u672A\u914D\u7F6E\u4E3A\u8C03\u8BFE\u5BA1\u6279\u4EBA");
  }, "admin");
  const read = /* @__PURE__ */ __name(async (id, res) => {
    const row = await db.prepare("SELECT e.*,s.unit_id FROM schedule_entries e LEFT JOIN schedule_entry_scopes s ON s.entry_id=e.id WHERE e.id=?").get(id);
    if (!row)
      throw new HttpError(404, "\u8BFE\u65F6\u4E0D\u5B58\u5728");
    if (row.teacher_id !== res.locals.user.id && !(await requestScheduleAccess(db, res)).visible(row.unit_id))
      throw new HttpError(404, "\u8BFE\u65F6\u4E0D\u5B58\u5728\u6216\u672A\u5171\u4EAB");
    return row;
  }, "read");
  const validate = /* @__PURE__ */ __name(async (data) => {
    const teacher = await db.prepare("SELECT id FROM faculty_users WHERE id=? AND status='ACTIVE'").get(data.teacher_id), course = await db.prepare("SELECT id FROM courses WHERE id=? AND archived_at IS NULL").get(data.course_id), klass = await db.prepare("SELECT id FROM academic_classes WHERE id=? AND archived_at IS NULL").get(data.class_id);
    if (!teacher || !course || !klass)
      throw new HttpError(422, "\u6559\u5E08\u3001\u73ED\u7EA7\u6216\u8BFE\u7A0B\u65E0\u6548");
    const start = String(data.starts_at), end = String(data.ends_at);
    if (!exactDate(start.slice(0, 10)) || !exactDate(end.slice(0, 10)) || !Number.isFinite(Date.parse(start)) || !Number.isFinite(Date.parse(end)) || Date.parse(start) >= Date.parse(end) || Date.parse(end) - Date.parse(start) > 864e5)
      throw new HttpError(422, "\u8BFE\u65F6\u5F00\u59CB/\u7ED3\u675F\u65F6\u95F4\u65E0\u6548\uFF0C\u6700\u957F 24 \u5C0F\u65F6");
    return {
      ...data,
      starts_at: new Date(start).toISOString(),
      ends_at: new Date(end).toISOString(),
      room: text(data.room, "\u6559\u5BA4", { max: 80 })
    };
  }, "validate");
  const noConflict = /* @__PURE__ */ __name(async (target, exclude = "") => {
    const row = await db.prepare("SELECT id FROM schedule_entries WHERE cancelled_at IS NULL AND id<>? AND starts_at<? AND ends_at>? AND (teacher_id=? OR class_id=? OR room=?) LIMIT 1").get(exclude, target.ends_at, target.starts_at, target.teacher_id, target.class_id, target.room);
    if (row)
      throw new HttpError(409, "\u4E0E\u73B0\u6709\u8BFE\u65F6\u7684\u6559\u5E08\u3001\u73ED\u7EA7\u6216\u6559\u5BA4\u65F6\u95F4\u51B2\u7A81");
  }, "noConflict");
  const visible = /* @__PURE__ */ __name(async (res, row) => {
    try {
      return row.teacher_id === res.locals.user.id || (await requestScheduleAccess(db, res)).visible(row.unit_id);
    } catch {
      return false;
    }
  }, "visible");
  const rows = /* @__PURE__ */ __name(async (res, from, to) => await Promise.all((await asyncFilter(await db.prepare("SELECT e.*,s.unit_id,o.name unit_name,c.class_name,u.full_name,k.name AS course_name FROM schedule_entries e LEFT JOIN schedule_entry_scopes s ON s.entry_id=e.id LEFT JOIN organization_units o ON o.id=s.unit_id JOIN academic_classes c ON c.id=e.class_id JOIN faculty_users u ON u.id=e.teacher_id JOIN courses k ON k.id=e.course_id WHERE e.cancelled_at IS NULL AND e.starts_at>=? AND e.starts_at<? ORDER BY e.starts_at,e.id").all(from, to), async (row) => await visible(res, row))).map(async (row) => ({
    ...row,
    lesson_id: row.teacher_id === res.locals.user.id ? row.lesson_id : null,
    canRequestChange: row.teacher_id === res.locals.user.id,
    canCancel: row.teacher_id !== res.locals.user.id && (await requestScheduleAccess(db, res)).manages(row.unit_id),
    canShare: row.teacher_id === res.locals.user.id
  }))), "rows");
  const range = /* @__PURE__ */ __name((query) => {
    const from = String(query.from || new Date(Date.now() + 8 * 36e5).toISOString().slice(0, 10)), to = String(query.to || new Date(Date.now() + 31 * 864e5 + 8 * 36e5).toISOString().slice(0, 10));
    if (!exactDate(from) || !exactDate(to) || from >= to || Date.parse(to) - Date.parse(from) > 367 * 864e5)
      throw new HttpError(422, "\u65E5\u671F\u8303\u56F4\u65E0\u6548\uFF0C\u6700\u591A\u4E00\u5E74\uFF0C\u7ED3\u675F\u65E5\u671F\u4E0D\u542B\u5F53\u5929");
    return [
      (/* @__PURE__ */ new Date(`${from}T00:00:00+08:00`)).toISOString(),
      (/* @__PURE__ */ new Date(`${to}T00:00:00+08:00`)).toISOString()
    ];
  }, "range");
  registerScheduleDepartments(app, db);
  registerOrganization(app, db);
  registerScheduleSubmissions(app, db, { validate, noConflict, range });
  app.get("/api/v1/schedules/options", async (_req, res) => {
    const scope = await requestScheduleAccess(db, res);
    const teachers = await asyncFilter(await db.prepare("SELECT id,full_name FROM faculty_users WHERE status='ACTIVE' ORDER BY full_name").all(), async (u) => u.id === res.locals.user.id || await asyncSome(scope.departments, async (d) => (await scheduleAccess(db, u.id)).member(d.id)));
    const teacherIds = teachers.map((t) => t.id);
    const classes = (await db.prepare("SELECT c.id,c.class_name,t.teacher_id,t.course_id,a.name term_name,a.starts_on,a.ends_on FROM academic_classes c JOIN teaching_assignments t ON t.class_id=c.id JOIN academic_terms a ON a.id=t.term_id WHERE c.archived_at IS NULL AND t.archived_at IS NULL AND a.archived_at IS NULL").all()).filter((c) => teacherIds.includes(c.teacher_id));
    reply2(res, {
      teachers,
      classes,
      departments: scope.departments,
      userId: res.locals.user.id,
      assignments: classes.filter((c) => c.teacher_id === res.locals.user.id),
      courses: await db.prepare("SELECT id,name FROM courses WHERE archived_at IS NULL ORDER BY name").all(),
      canAdmin: res.locals.user.role === "admin",
      lessons: await db.prepare("SELECT id,title FROM lesson_plans WHERE archived_at IS NULL AND (visibility='school' OR owner_id=?) ORDER BY title,id").all(res.locals.user.id)
    });
  });
  app.get("/api/v1/schedules/entries", async (req, res) => {
    const [from, to] = range(req.query);
    reply2(res, await rows(res, from, to));
  });
  app.post("/api/v1/schedules/entries", async (req, res) => await mutate(req, res, db, () => {
    throw new HttpError(409, "\u8BF7\u4F7F\u7528\u8BFE\u8868\u63D0\u4EA4\uFF0C\u7531\u6559\u7814\u5BA4\u8D1F\u8D23\u4EBA\u5BA1\u6279\u540E\u751F\u6210\u6B63\u5F0F\u8BFE\u65F6");
  }, "\u8BFE\u65F6\u5DF2\u5EFA\u7ACB"));
  app.patch("/api/v1/schedules/entries/:id/sharing", async (req, res) => await mutate(req, res, db, async () => {
    const row = await read(req.params.id, res);
    version(req.body, row);
    if (row.teacher_id !== res.locals.user.id)
      throw new HttpError(403, "\u4EC5\u4EFB\u8BFE\u6559\u5E08\u53EF\u53D8\u66F4\u8BFE\u65F6\u7684\u5171\u4EAB\u8303\u56F4");
    if (row.cancelled_at)
      throw new HttpError(409, "\u8BFE\u65F6\u5DF2\u53D6\u6D88");
    const unit = req.body.unit_id || null;
    if (unit)
      (await requestScheduleAccess(db, res)).requireMember(unit);
    await db.prepare("DELETE FROM schedule_entry_scopes WHERE entry_id=?").run(row.id);
    if (unit)
      await db.prepare("INSERT INTO schedule_entry_scopes(entry_id,unit_id,shared_by) VALUES (?,?,?)").run(row.id, unit, res.locals.user.id);
    await db.prepare("UPDATE schedule_entries SET version=version+1 WHERE id=?").run(row.id);
    await db.prepare("UPDATE schedule_submissions SET shared=CASE WHEN unit_id=? THEN 1 ELSE 0 END,version=version+1,updated_at=? WHERE entry_id=?").run(unit, (/* @__PURE__ */ new Date()).toISOString(), row.id);
    return { id: row.id };
  }, "\u8BFE\u65F6\u5171\u4EAB\u8303\u56F4\u5DF2\u66F4\u65B0"));
  app.patch("/api/v1/schedules/entries/:id", async (req, res) => await mutate(req, res, db, async () => {
    const row = await read(req.params.id, res);
    await admin(res, row.unit_id);
    if (row.teacher_id === res.locals.user.id)
      throw new HttpError(403, "\u81EA\u5DF1\u7684\u8BFE\u65F6\u8BF7\u63D0\u4EA4\u8C03\u4EE3\u8BFE\u7533\u8BF7");
    version(req.body, row);
    if (req.body.cancelled !== true)
      throw new HttpError(422, "\u53EA\u652F\u6301\u53D6\u6D88\u8BFE\u65F6\uFF0C\u6539\u671F\u8BF7\u53D1\u8D77\u5BA1\u6279");
    await db.prepare("UPDATE schedule_entries SET cancelled_at=?,version=version+1 WHERE id=?").run((/* @__PURE__ */ new Date()).toISOString(), row.id);
    return await read(row.id, res);
  }, "\u8BFE\u65F6\u5DF2\u53D6\u6D88"));
  app.get("/api/v1/schedules/changes", async (_req, res) => {
    const changes = await db.prepare("SELECT s.*,e.class_id,e.teacher_id,e.starts_at,g.unit_id,u.full_name AS applicant_name FROM schedule_changes s JOIN schedule_entries e ON e.id=s.entry_id LEFT JOIN schedule_entry_scopes g ON g.entry_id=e.id JOIN faculty_users u ON u.id=s.applicant_id ORDER BY s.created_at DESC,s.id").all();
    reply2(res, await Promise.all((await asyncFilter(changes, async (r) => r.applicant_id === res.locals.user.id || (await requestScheduleAccess(db, res)).manages(r.unit_id))).map(async (r) => ({
      ...r,
      target: JSON.parse(r.target_json),
      canReview: !await sameSchoolPerson(db, r.applicant_id, res.locals.user.id, r.unit_id) && (await requestScheduleAccess(db, res)).manages(r.unit_id),
      canWithdraw: r.applicant_id === res.locals.user.id
    }))));
  });
  app.post("/api/v1/schedules/changes", async (req, res) => await mutate(req, res, db, async () => {
    const row = await read(req.body.entry_id, res);
    version(req.body, row);
    if (row.cancelled_at)
      throw new HttpError(409, "\u8BFE\u65F6\u5DF2\u53D6\u6D88");
    if (row.teacher_id !== res.locals.user.id)
      throw new HttpError(403, "\u53EA\u80FD\u4E3A\u81EA\u5DF1\u7684\u8BFE\u65F6\u7533\u8BF7\u8C03\u4EE3\u8BFE");
    if (await db.prepare("SELECT id FROM schedule_changes WHERE entry_id=? AND status='pending'").get(row.id))
      throw new HttpError(409, "\u8BE5\u8BFE\u65F6\u5DF2\u6709\u5F85\u5BA1\u7533\u8BF7");
    const target = await validate({
      ...row,
      ...req.body.target,
      class_id: row.class_id,
      course_id: row.course_id
    });
    if (target.teacher_id !== row.teacher_id && (!row.unit_id || !(await scheduleAccess(db, target.teacher_id)).member(row.unit_id)))
      throw new HttpError(403, "\u4EE3\u8BFE\u6559\u5E08\u5FC5\u987B\u5C5E\u4E8E\u5171\u4EAB\u6559\u7814\u5BA4");
    await noConflict(target, row.id);
    if (target.teacher_id !== row.teacher_id && row.unit_id)
      await assertSubstituteQualification(db, target.teacher_id, row.unit_id, row.course_id);
    const id = randomUUID11();
    await db.prepare("INSERT INTO schedule_changes(id,entry_id,source_version,applicant_id,target_json,reason,created_at) VALUES (?,?,?,?,?,?,?)").run(id, row.id, row.version, res.locals.user.id, JSON.stringify({
      teacher_id: target.teacher_id,
      starts_at: target.starts_at,
      ends_at: target.ends_at,
      room: target.room
    }), text(req.body.reason, "\u8C03\u8BFE\u539F\u56E0", { max: 2e3 }), (/* @__PURE__ */ new Date()).toISOString());
    return { id, status: "pending" };
  }, "\u7533\u8BF7\u5DF2\u63D0\u4EA4\uFF0C\u5BA1\u6279\u901A\u8FC7\u540E\u751F\u6548"));
  app.patch("/api/v1/schedules/changes/:id", async (req, res) => await mutate(req, res, db, async () => {
    const change = await db.prepare("SELECT * FROM schedule_changes WHERE id=?").get(req.params.id);
    if (!change)
      throw new HttpError(404, "\u7533\u8BF7\u4E0D\u5B58\u5728");
    const source2 = await read(change.entry_id, res);
    version(req.body, change);
    if (change.status !== "pending")
      throw new HttpError(409, "\u7533\u8BF7\u5DF2\u5904\u7406");
    const status = req.body.status;
    if (!["approved", "rejected", "cancelled"].includes(status))
      throw new HttpError(422, "\u5BA1\u6279\u72B6\u6001\u65E0\u6548");
    if (status === "cancelled") {
      if (change.applicant_id !== res.locals.user.id)
        throw new HttpError(403, "\u53EA\u80FD\u53D6\u6D88\u81EA\u5DF1\u7684\u7533\u8BF7");
    } else {
      await admin(res, source2.unit_id);
      if (await sameSchoolPerson(db, change.applicant_id, res.locals.user.id, source2.unit_id))
        throw new HttpError(403, "\u7533\u8BF7\u4EBA\u4E0D\u80FD\u5BA1\u6279\u81EA\u5DF1\u7684\u7533\u8BF7");
    }
    if (status === "approved") {
      if (source2.cancelled_at || source2.version !== change.source_version)
        throw new HttpError(409, "\u539F\u8BFE\u65F6\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u7533\u8BF7");
      const target = await validate({
        ...source2,
        ...JSON.parse(change.target_json)
      });
      if (target.teacher_id !== source2.teacher_id && (!source2.unit_id || !(await scheduleAccess(db, target.teacher_id)).member(source2.unit_id)))
        throw new HttpError(403, "\u4EE3\u8BFE\u6559\u5E08\u4EFB\u804C\u5DF2\u5931\u6548");
      await noConflict(target, source2.id);
      if (target.teacher_id !== source2.teacher_id && source2.unit_id)
        await assertSubstituteQualification(db, target.teacher_id, source2.unit_id, source2.course_id);
      await db.prepare("UPDATE schedule_entries SET teacher_id=?,starts_at=?,ends_at=?,room=?,version=version+1 WHERE id=?").run(target.teacher_id, target.starts_at, target.ends_at, target.room, source2.id);
    }
    const note = req.body.review_note === void 0 ? "" : String(req.body.review_note);
    if (note.length > 2e3)
      throw new HttpError(422, "\u5BA1\u6279\u610F\u89C1\u8FC7\u957F");
    await db.prepare("UPDATE schedule_changes SET status=?,reviewer_id=?,review_note=?,version=version+1 WHERE id=?").run(status, res.locals.user.id, note, change.id);
    return { id: change.id, status };
  }, "\u7533\u8BF7\u72B6\u6001\u5DF2\u66F4\u65B0"));
  app.get("/api/v1/schedules/calendar.ics", async (req, res) => {
    const [from, to] = range(req.query), stamp = /* @__PURE__ */ __name((s) => new Date(s).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), "stamp"), escape2 = /* @__PURE__ */ __name((s) => s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"), "escape");
    const events = (await rows(res, from, to)).map((row) => [
      "BEGIN:VEVENT",
      `UID:${row.id}@sakura.local`,
      `DTSTAMP:${stamp((/* @__PURE__ */ new Date()).toISOString())}`,
      `DTSTART:${stamp(row.starts_at)}`,
      `DTEND:${stamp(row.ends_at)}`,
      `SUMMARY:${escape2(`${row.class_name} ${row.course_name}`)}`,
      `LOCATION:${escape2(row.room)}`,
      `DESCRIPTION:${escape2(row.full_name)}`,
      "END:VEVENT"
    ].join("\r\n"));
    res.setHeader("Content-Disposition", 'attachment; filename="sakura-calendar.ics"');
    res.type("text/calendar").send([
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SakuraEdu//Schedule//ZH",
      "CALSCALE:GREGORIAN",
      ...events,
      "END:VCALENDAR",
      ""
    ].join("\r\n"));
  });
  app.post("/api/v1/schedules/swap-requests", (_req, _res, next) => next(new HttpError(409, "\u65E7\u8C03\u8BFE\u63A5\u53E3\u5DF2\u505C\u7528\uFF0C\u8BF7\u4F7F\u7528\u5E26\u5BA1\u6279\u7684\u8C03\u4EE3\u8BFE\u7533\u8BF7")));
}
__name(registerSchedules, "registerSchedules");

// server/exams.ts
import { createHash as createHash3, randomUUID as randomUUID12 } from "node:crypto";
function registerExams(app, source) {
  const db = asyncDatabase(source);
  const get = /* @__PURE__ */ __name(async (id, res) => {
    const row = await db.prepare("SELECT * FROM assessment_exams WHERE id=?").get(id);
    if (!row) throw new HttpError(404, "\u8003\u8BD5\u4E0D\u5B58\u5728");
    await classAccess(db, res, row.class_id);
    return row;
  }, "get");
  const questions = /* @__PURE__ */ __name(async (id) => await db.prepare(
    "SELECT * FROM assessment_questions WHERE exam_id=? ORDER BY ordinal"
  ).all(id), "questions");
  const report = /* @__PURE__ */ __name(async (exam) => {
    const ids = JSON.parse(exam.roster_json), qs = await questions(exam.id);
    const students = await db.prepare(
      `SELECT id,student_no,full_name FROM student_profiles WHERE id IN (${ids.map(() => "?").join(",") || "NULL"}) ORDER BY student_no,id`
    ).all(...ids);
    const results = await Promise.all(
      students.map(async (s) => {
        const result = await db.prepare(
          "SELECT status FROM assessment_results WHERE exam_id=? AND student_id=?"
        ).get(exam.id, s.id);
        const marks = await db.prepare(
          "SELECT question_id,score FROM assessment_marks WHERE exam_id=? AND student_id=?"
        ).all(exam.id, s.id);
        return {
          ...s,
          id: String(s.id),
          full_name: String(s.full_name),
          student_no: String(s.student_no),
          status: result?.status || "missing",
          scores: qs.map(
            (q) => marks.find((m) => m.question_id === q.id)?.score ?? null
          ),
          total: result?.status === "scored" && marks.length === qs.length ? marks.reduce((sum, m) => sum + m.score, 0) : null
        };
      })
    );
    const scored = results.filter((r) => r.total !== null), totals = scored.map((r) => r.total), average = totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : null;
    return {
      exam,
      questions: qs,
      students: results,
      stats: {
        expected: ids.length,
        scored: scored.length,
        absent: results.filter((r) => r.status === "absent").length,
        ungraded: results.filter((r) => r.status === "ungraded").length,
        missing: results.filter((r) => r.status === "missing").length,
        average,
        passRate: totals.length ? totals.filter((n) => n >= exam.max_score * exam.pass_ratio).length / totals.length : null,
        excellentRate: totals.length ? totals.filter((n) => n >= exam.max_score * exam.excellent_ratio).length / totals.length : null,
        distribution: [0, 0.6, 0.8, 0.9].map((min, i, arr) => ({
          label: ["\u4F4E\u4E8E60%", "60%\u201480%", "80%\u201490%", "90%\u53CA\u4EE5\u4E0A"][i],
          count: totals.filter(
            (n) => n >= min * exam.max_score && (i === 3 || n < arr[i + 1] * exam.max_score)
          ).length
        })),
        questionAverages: qs.map((q) => {
          const marks = scored.map((s) => s.scores[qs.indexOf(q)]);
          return {
            title: q.title,
            average: marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : null,
            max_score: q.max_score
          };
        })
      }
    };
  }, "report");
  app.get("/api/v1/exams/batches", async (_req, res) => {
    const rows = await db.prepare(
      "SELECT e.*,c.class_name,k.name AS course_name FROM assessment_exams e JOIN academic_classes c ON c.id=e.class_id JOIN courses k ON k.id=e.course_id WHERE e.archived_at IS NULL ORDER BY e.exam_date DESC,e.id"
    ).all();
    reply2(
      res,
      await asyncFilter(rows, async (r) => {
        try {
          await classAccess(db, res, r.class_id);
          return true;
        } catch {
          return false;
        }
      })
    );
  });
  app.post(
    "/api/v1/exams/batches",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const classId = text(req.body.class_id, "\u73ED\u7EA7"), klass = await classAccess(db, res, classId);
        if (klass.archived_at) throw new HttpError(409, "\u73ED\u7EA7\u5DF2\u5F52\u6863");
        const courseId = text(req.body.course_id, "\u8BFE\u7A0B");
        if (!await db.prepare(
          "SELECT id FROM courses WHERE id=? AND archived_at IS NULL"
        ).get(courseId))
          throw new HttpError(422, "\u8BFE\u7A0B\u65E0\u6548");
        const date = text(req.body.exam_date, "\u8003\u8BD5\u65E5\u671F");
        if (!exactDate(date)) throw new HttpError(422, "\u8003\u8BD5\u65E5\u671F\u65E0\u6548");
        if (!Array.isArray(req.body.questions) || req.body.questions.length < 1 || req.body.questions.length > 100)
          throw new HttpError(422, "\u8BF7\u914D\u7F6E 1 \u81F3 100 \u9053\u9898\u76EE");
        const qs = req.body.questions.map((q) => ({
          title: text(q?.title, "\u9898\u76EE\u540D\u79F0", { max: 100 }),
          max: number(q?.max_score, "\u9898\u76EE\u6EE1\u5206", 0.01, 1e4)
        }));
        const max = qs.reduce(
          (n, q) => n + q.max,
          0
        );
        const pass = number(req.body.pass_ratio ?? 0.6, "\u53CA\u683C\u6BD4\u4F8B", 0, 1), excellent = number(
          req.body.excellent_ratio ?? 0.9,
          "\u4F18\u79C0\u6BD4\u4F8B",
          pass,
          1
        ), id = randomUUID12();
        const ids = (await db.prepare(
          "SELECT id FROM student_profiles WHERE class_id=? AND archived_at IS NULL ORDER BY student_no,id"
        ).all(classId)).map((r) => r.id);
        await db.prepare(
          "INSERT INTO assessment_exams(id,title,exam_date,class_id,course_id,owner_id,max_score,pass_ratio,excellent_ratio,roster_json) VALUES (?,?,?,?,?,?,?,?,?,?)"
        ).run(
          id,
          text(req.body.title, "\u8003\u8BD5\u540D\u79F0", { max: 200 }),
          date,
          classId,
          courseId,
          res.locals.user.id,
          max,
          pass,
          excellent,
          JSON.stringify(ids)
        );
        await asyncEach(
          qs,
          async (q, i) => await db.prepare("INSERT INTO assessment_questions VALUES (?,?,?,?,?)").run(randomUUID12(), id, q.title, q.max, i)
        );
        return await get(id, res);
      },
      "\u8003\u8BD5\u5DF2\u521B\u5EFA"
    )
  );
  app.get(
    "/api/v1/exams/batches/:id",
    async (req, res) => reply2(res, await report(await get(req.params.id, res)))
  );
  app.patch(
    "/api/v1/exams/batches/:id",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const row = await get(req.params.id, res);
        version(req.body, row);
        if (req.body.archived !== true)
          throw new HttpError(422, "\u53EA\u652F\u6301\u5F52\u6863\uFF0C\u9898\u76EE\u53D1\u5E03\u540E\u4FDD\u7559\u539F\u59CB\u6EE1\u5206");
        await db.prepare(
          "UPDATE assessment_exams SET archived_at=?,version=version+1 WHERE id=?"
        ).run((/* @__PURE__ */ new Date()).toISOString(), row.id);
        return await get(row.id, res);
      },
      "\u8003\u8BD5\u5DF2\u5F52\u6863"
    )
  );
  const validateImport = /* @__PURE__ */ __name(async (row, body) => {
    version(body, row);
    if (row.archived_at) throw new HttpError(409, "\u8003\u8BD5\u5DF2\u5F52\u6863");
    const qs = await questions(row.id), ids = JSON.parse(row.roster_json);
    if (!Array.isArray(body.rows) || body.rows.length < 1 || body.rows.length > 500)
      throw new HttpError(422, "\u6BCF\u6B21\u5BFC\u5165 1 \u81F3 500 \u884C");
    const seen = /* @__PURE__ */ new Set();
    return await Promise.all(
      body.rows.map(async (item, index) => {
        const no = text(item?.student_no, `\u7B2C ${index + 1} \u884C\u5B66\u53F7`), student = await db.prepare(
          "SELECT id,full_name FROM student_profiles WHERE student_no=?"
        ).get(no);
        if (!student || !ids.includes(student.id) || seen.has(student.id))
          throw new HttpError(
            422,
            `\u7B2C ${index + 1} \u884C\u5B66\u53F7\u4E0D\u5B58\u5728\u3001\u4E0D\u5728\u8003\u8BD5\u540D\u5355\u4E2D\u6216\u91CD\u590D`
          );
        seen.add(student.id);
        const status = item.status;
        if (!["scored", "absent", "ungraded"].includes(status))
          throw new HttpError(422, `\u7B2C ${index + 1} \u884C\u72B6\u6001\u65E0\u6548`);
        if (!Array.isArray(item.scores) || status === "scored" && item.scores.length !== qs.length || status !== "scored" && item.scores.length)
          throw new HttpError(422, `\u7B2C ${index + 1} \u884C\u9898\u76EE\u5206\u6570\u6570\u91CF\u4E0D\u7B26`);
        const scores = item.scores.map((score, i) => {
          const value = number(
            score,
            `\u7B2C ${index + 1} \u884C\u7B2C ${i + 1} \u9898`,
            0,
            qs[i].max_score
          );
          if (Math.abs(value * 100 - Math.round(value * 100)) > 1e-7)
            throw new HttpError(422, "\u6210\u7EE9\u6700\u591A\u4E24\u4F4D\u5C0F\u6570");
          return value;
        });
        return {
          student_id: student.id,
          student_no: no,
          full_name: student.full_name,
          status,
          scores,
          total: status === "scored" ? scores.reduce((a, b) => a + b, 0) : null
        };
      })
    );
  }, "validateImport");
  const hash2 = /* @__PURE__ */ __name((data) => createHash3("sha256").update(JSON.stringify(data)).digest("hex"), "hash");
  app.post("/api/v1/exams/batches/:id/import-preview", async (req, res) => {
    const row = await get(req.params.id, res), rows = await validateImport(row, req.body);
    reply2(
      res,
      {
        rows,
        previewHash: hash2({ exam: row.id, version: row.version, rows }),
        version: row.version
      },
      "\u6821\u9A8C\u901A\u8FC7\uFF1B\u5BFC\u5165\u5C06\u66FF\u6362\u8FD9\u4E9B\u5B66\u751F\u7684\u6210\u7EE9\uFF0C\u5176\u4ED6\u5B66\u751F\u4FDD\u6301\u539F\u503C"
    );
  });
  app.post(
    "/api/v1/exams/batches/:id/import",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const row = await get(req.params.id, res), key2 = text(req.body.request_key, "\u5BFC\u5165\u8BF7\u6C42\u6807\u8BC6", { max: 100 }), payloadHash = hash2({
          exam: row.id,
          version: req.body.version,
          rows: req.body.rows,
          previewHash: req.body.previewHash
        });
        const prior = await db.prepare(
          "SELECT * FROM assessment_imports WHERE actor_id=? AND request_key=?"
        ).get(res.locals.user.id, key2);
        if (prior) {
          if (prior.exam_id !== row.id || prior.payload_hash !== payloadHash)
            throw new HttpError(409, "\u8BF7\u6C42\u6807\u8BC6\u5DF2\u7528\u4E8E\u53E6\u4E00\u4EFD\u5BFC\u5165");
          return JSON.parse(prior.result_json);
        }
        const rows = await validateImport(row, req.body), qs = await questions(row.id);
        if (req.body.previewHash !== hash2({ exam: row.id, version: row.version, rows }))
          throw new HttpError(409, "\u9884\u89C8\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u6821\u9A8C");
        for (const item of rows) {
          await db.prepare(
            "DELETE FROM assessment_marks WHERE exam_id=? AND student_id=?"
          ).run(row.id, item.student_id);
          await db.prepare(
            "INSERT INTO assessment_results VALUES (?,?,?) ON CONFLICT(exam_id,student_id) DO UPDATE SET status=excluded.status"
          ).run(row.id, item.student_id, item.status);
          await asyncEach(
            item.scores,
            async (score, i) => await db.prepare("INSERT INTO assessment_marks VALUES (?,?,?,?)").run(row.id, item.student_id, qs[i].id, score)
          );
        }
        await db.prepare("UPDATE assessment_exams SET version=version+1 WHERE id=?").run(row.id);
        const result = { imported: rows.length, version: row.version + 1 };
        await db.prepare("INSERT INTO assessment_imports VALUES (?,?,?,?,?)").run(
          res.locals.user.id,
          key2,
          row.id,
          payloadHash,
          JSON.stringify(result)
        );
        return result;
      },
      "\u6210\u7EE9\u5DF2\u5BFC\u5165"
    )
  );
  app.get("/api/v1/exams/students/:id/trajectory", async (req, res) => {
    const student = await db.prepare("SELECT class_id FROM student_profiles WHERE id=?").get(req.params.id);
    if (!student) throw new HttpError(404, "\u5B66\u751F\u4E0D\u5B58\u5728");
    await classAccess(db, res, student.class_id);
    const exams = await db.prepare(
      "SELECT * FROM assessment_exams WHERE archived_at IS NULL ORDER BY exam_date,id"
    ).all();
    reply2(
      res,
      (await Promise.all(
        (await asyncFilter(exams, async (e) => {
          try {
            await classAccess(db, res, e.class_id);
            return true;
          } catch {
            return false;
          }
        })).map(async (e) => {
          const student2 = (await report(e)).students.find(
            (s) => s.id === req.params.id
          );
          return student2 ? [
            {
              exam_id: e.id,
              title: e.title,
              date: e.exam_date,
              total: student2.total,
              max_score: e.max_score,
              status: student2.status
            }
          ] : [];
        })
      )).flat()
    );
  });
}
__name(registerExams, "registerExams");

// server/care.ts
import { randomUUID as randomUUID13 } from "node:crypto";
function registerCare(app, source) {
  const db = asyncDatabase(source);
  const student = /* @__PURE__ */ __name(async (id, res) => {
    const row = await db.prepare("SELECT * FROM student_profiles WHERE id=?").get(id);
    if (!row) throw new HttpError(404, "\u5B66\u751F\u4E0D\u5B58\u5728");
    await classAccess(db, res, row.class_id);
    return row;
  }, "student");
  const contact = /* @__PURE__ */ __name(async (id, res) => {
    const row = await db.prepare("SELECT * FROM care_contacts WHERE id=?").get(id);
    if (!row) throw new HttpError(404, "\u8054\u7CFB\u4EBA\u4E0D\u5B58\u5728");
    await student(row.student_id, res);
    return row;
  }, "contact");
  const thread = /* @__PURE__ */ __name(async (id, res) => {
    const row = await db.prepare("SELECT * FROM care_threads WHERE id=?").get(id);
    if (!row) throw new HttpError(404, "\u4F1A\u8BDD\u4E0D\u5B58\u5728");
    await contact(row.contact_id, res);
    if (row.teacher_id !== res.locals.user.id && res.locals.user.role !== "admin")
      throw new HttpError(403, "\u65E0\u6743\u8BBF\u95EE\u5176\u4ED6\u6559\u5E08\u7684\u4F1A\u8BDD");
    return row;
  }, "thread");
  app.get("/api/v1/care/contacts", async (req, res) => {
    await student(req.query.studentId, res);
    reply2(
      res,
      await db.prepare(
        "SELECT * FROM care_contacts WHERE student_id=? AND archived_at IS NULL ORDER BY name,id"
      ).all(req.query.studentId)
    );
  });
  app.post(
    "/api/v1/care/contacts",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const s = await student(req.body.student_id, res);
        if (s.archived_at) throw new HttpError(409, "\u5B66\u751F\u5DF2\u5F52\u6863");
        const id = randomUUID13();
        await db.prepare(
          "INSERT INTO care_contacts(id,student_id,name,relationship,phone) VALUES (?,?,?,?,?)"
        ).run(
          id,
          s.id,
          text(req.body.name, "\u8054\u7CFB\u4EBA\u59D3\u540D", { max: 80 }),
          text(req.body.relationship, "\u5173\u7CFB", { max: 40 }),
          String(req.body.phone || "").slice(0, 40)
        );
        return { id };
      },
      "\u8054\u7CFB\u4EBA\u5DF2\u4FDD\u5B58"
    )
  );
  app.patch(
    "/api/v1/care/contacts/:id",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const row = await contact(req.params.id, res);
        version(req.body, row);
        await db.prepare(
          "UPDATE care_contacts SET name=?,relationship=?,phone=?,archived_at=?,version=version+1 WHERE id=?"
        ).run(
          text(req.body.name ?? row.name, "\u59D3\u540D", { max: 80 }),
          text(req.body.relationship ?? row.relationship, "\u5173\u7CFB", {
            max: 40
          }),
          String(req.body.phone ?? row.phone).slice(0, 40),
          req.body.archived ? (/* @__PURE__ */ new Date()).toISOString() : row.archived_at,
          row.id
        );
        return { id: row.id, version: row.version + 1 };
      },
      "\u8054\u7CFB\u4EBA\u5DF2\u66F4\u65B0"
    )
  );
  app.get("/api/v1/care/threads", async (req, res) => {
    const rows = await db.prepare(
      `SELECT t.*,c.name AS contact_name,c.relationship,c.student_id,s.full_name AS student_name,s.class_id,(SELECT COUNT(*) FROM care_messages m WHERE m.thread_id=t.id AND m.kind='incoming-record' AND m.sequence>t.last_read_sequence) AS unread_count FROM care_threads t JOIN care_contacts c ON c.id=t.contact_id JOIN student_profiles s ON s.id=c.student_id WHERE (?='admin' OR t.teacher_id=?) ${req.query.studentId ? "AND c.student_id=?" : ""} ORDER BY t.updated_at DESC,t.id`
    ).all(
      res.locals.user.role,
      res.locals.user.id,
      ...req.query.studentId ? [String(req.query.studentId)] : []
    );
    reply2(
      res,
      (await asyncFilter(rows, async (r) => {
        try {
          await classAccess(db, res, r.class_id);
          return true;
        } catch {
          return false;
        }
      })).map((r) => ({ ...r, canWrite: r.teacher_id === res.locals.user.id }))
    );
  });
  app.post(
    "/api/v1/care/threads",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const c = await contact(req.body.contact_id, res);
        if (c.archived_at) throw new HttpError(409, "\u8054\u7CFB\u4EBA\u5DF2\u5F52\u6863");
        const existing = await db.prepare(
          "SELECT id FROM care_threads WHERE contact_id=? AND teacher_id=?"
        ).get(c.id, res.locals.user.id);
        if (existing) return existing;
        const id = randomUUID13();
        await db.prepare(
          "INSERT INTO care_threads(id,contact_id,teacher_id,updated_at) VALUES (?,?,?,?)"
        ).run(id, c.id, res.locals.user.id, (/* @__PURE__ */ new Date()).toISOString());
        return { id };
      },
      "\u4F1A\u8BDD\u5DF2\u6253\u5F00"
    )
  );
  app.get("/api/v1/care/threads/:id/messages", async (req, res) => {
    await thread(req.params.id, res);
    reply2(
      res,
      await db.prepare(
        "SELECT * FROM care_messages WHERE thread_id=? ORDER BY sequence"
      ).all(req.params.id)
    );
  });
  app.post(
    "/api/v1/care/threads/:id/read",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const row = await thread(req.params.id, res);
        if (row.teacher_id !== res.locals.user.id)
          throw new HttpError(403, "\u53EA\u80FD\u4FEE\u6539\u81EA\u5DF1\u7684\u5DF2\u8BFB\u72B6\u6001");
        await db.prepare(
          "UPDATE care_threads SET last_read_sequence=COALESCE((SELECT MAX(sequence) FROM care_messages WHERE thread_id=?),0) WHERE id=?"
        ).run(row.id, row.id);
        return { id: row.id };
      },
      "\u5DF2\u6807\u8BB0\u5DF2\u8BFB"
    )
  );
  app.post(
    "/api/v1/care/threads/:id/messages",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const row = await thread(req.params.id, res);
        if (row.teacher_id !== res.locals.user.id)
          throw new HttpError(403, "\u53EA\u80FD\u5728\u81EA\u5DF1\u7684\u4F1A\u8BDD\u4E2D\u8BB0\u5F55\u6D88\u606F");
        const c = await contact(row.contact_id, res);
        if (c.archived_at) throw new HttpError(409, "\u8054\u7CFB\u4EBA\u5DF2\u5F52\u6863");
        const content = text(req.body.content, "\u6D88\u606F\u6B63\u6587", { max: 2e4 }), key2 = text(req.body.request_key, "\u8BF7\u6C42\u6807\u8BC6", { max: 100 }), kind = req.body.kind;
        if (!["note", "outgoing", "incoming-record"].includes(kind))
          throw new HttpError(422, "\u6D88\u606F\u7C7B\u578B\u65E0\u6548");
        const previous = await db.prepare(
          "SELECT * FROM care_messages WHERE actor_id=? AND request_key=?"
        ).get(res.locals.user.id, key2);
        if (previous) {
          if (previous.thread_id !== row.id || previous.content !== content || previous.kind !== kind)
            throw new HttpError(409, "\u8BF7\u6C42\u6807\u8BC6\u5DF2\u7528\u4E8E\u53E6\u4E00\u6761\u6D88\u606F");
          return previous;
        }
        const id = randomUUID13(), now = (/* @__PURE__ */ new Date()).toISOString(), status = kind === "outgoing" ? "queued" : "recorded", notBefore = notificationTime(res.locals.user);
        await db.prepare(
          "INSERT INTO care_messages(id,thread_id,actor_id,request_key,kind,content,status,not_before,created_at) VALUES (?,?,?,?,?,?,?,?,?)"
        ).run(
          id,
          row.id,
          res.locals.user.id,
          key2,
          kind,
          content,
          status,
          notBefore,
          now
        );
        await db.prepare(
          "UPDATE care_threads SET last_message=?,updated_at=? WHERE id=?"
        ).run(content, now, row.id);
        return await db.prepare("SELECT * FROM care_messages WHERE id=?").get(id);
      },
      "\u5DF2\u4FDD\u5B58\u7AD9\u5185\u8BB0\u5F55\uFF1B\u5F85\u53D1\u9001\u5185\u5BB9\u5C1A\u672A\u5BF9\u5916\u6295\u9012"
    )
  );
  app.get("/api/v1/care/todos", async (req, res) => {
    const rows = await db.prepare(
      `SELECT t.*,s.full_name,s.class_id FROM care_todos t JOIN student_profiles s ON s.id=t.student_id WHERE (?='admin' OR t.owner_id=?) ${req.query.studentId ? "AND t.student_id=?" : ""} ${req.query.dueBefore ? "AND t.due_at<=?" : ""} ORDER BY t.due_at,t.id`
    ).all(
      res.locals.user.role,
      res.locals.user.id,
      ...req.query.studentId ? [String(req.query.studentId)] : [],
      ...req.query.dueBefore ? [String(req.query.dueBefore)] : []
    );
    reply2(
      res,
      await asyncFilter(rows, async (r) => {
        try {
          await classAccess(db, res, r.class_id);
          return true;
        } catch {
          return false;
        }
      })
    );
  });
  app.post(
    "/api/v1/care/todos",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const s = await student(req.body.student_id, res), due = String(req.body.due_at);
        if (!Number.isFinite(Date.parse(due)))
          throw new HttpError(422, "\u5F85\u529E\u65E5\u671F\u65E0\u6548");
        const id = randomUUID13();
        await db.prepare(
          "INSERT INTO care_todos(id,student_id,owner_id,title,due_at,created_at) VALUES (?,?,?,?,?,?)"
        ).run(
          id,
          s.id,
          res.locals.user.id,
          text(req.body.title, "\u5F85\u529E\u6807\u9898", { max: 200 }),
          new Date(due).toISOString(),
          (/* @__PURE__ */ new Date()).toISOString()
        );
        return { id };
      },
      "\u5173\u6000\u5F85\u529E\u5DF2\u521B\u5EFA"
    )
  );
  app.patch(
    "/api/v1/care/todos/:id",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const row = await db.prepare("SELECT * FROM care_todos WHERE id=?").get(req.params.id);
        if (!row) throw new HttpError(404, "\u5F85\u529E\u4E0D\u5B58\u5728");
        await student(row.student_id, res);
        if (row.owner_id !== res.locals.user.id && res.locals.user.role !== "admin")
          throw new HttpError(403, "\u65E0\u6743\u4FEE\u6539\u4ED6\u4EBA\u5F85\u529E");
        version(req.body, row);
        if (!["open", "done", "cancelled"].includes(req.body.status))
          throw new HttpError(422, "\u5F85\u529E\u72B6\u6001\u65E0\u6548");
        await db.prepare(
          "UPDATE care_todos SET status=?,version=version+1 WHERE id=?"
        ).run(req.body.status, row.id);
        return { id: row.id, version: row.version + 1 };
      },
      "\u5F85\u529E\u72B6\u6001\u5DF2\u4FDD\u5B58"
    )
  );
  app.get("/api/v1/students/:id/coaching-journals", async (req, res) => {
    await student(req.params.id, res);
    reply2(
      res,
      await db.prepare(
        "SELECT * FROM coaching_journals WHERE student_id=? ORDER BY created_at DESC,id"
      ).all(req.params.id)
    );
  });
  app.post(
    "/api/v1/students/:id/coaching-journals",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const s = await student(req.params.id, res), id = randomUUID13(), now = (/* @__PURE__ */ new Date()).toISOString();
        await db.prepare(
          "INSERT INTO coaching_journals(id,student_id,student_name,teacher_id,date_title,tag,content,teacher_name,status_text,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)"
        ).run(
          id,
          s.id,
          s.full_name,
          res.locals.user.id,
          now.slice(0, 10),
          String(req.body.tag || "\u5173\u6000\u8BB0\u5F55").slice(0, 40),
          text(req.body.content, "\u8F85\u5BFC\u5185\u5BB9", { max: 2e4 }),
          res.locals.user.full_name,
          "\u7AD9\u5185\u5DF2\u8BB0\u5F55",
          now
        );
        return { id };
      },
      "\u8F85\u5BFC\u8BB0\u5F55\u5DF2\u4FDD\u5B58"
    )
  );
  app.get("/api/v1/students/:id/profile", async (req, res) => {
    const s = await student(req.params.id, res);
    reply2(res, {
      id: s.id,
      full_name: s.full_name,
      student_no: s.student_no,
      class_id: s.class_id,
      tag_category: s.tag_category,
      version: s.version,
      bio: JSON.parse(s.payload_json).bio || ""
    });
  });
  app.patch(
    "/api/v1/students/:id/profile",
    async (req, res) => await mutate(
      req,
      res,
      db,
      async () => {
        const s = await student(req.params.id, res);
        version(req.body, s);
        const tag = req.body.tag_category ?? s.tag_category;
        if (!["focus", "progress", "coaching", "competition", "care"].includes(
          tag
        ))
          throw new HttpError(422, "\u5B66\u751F\u6807\u7B7E\u65E0\u6548");
        const payload = JSON.parse(s.payload_json), bio = req.body.bio ?? payload.bio;
        if (typeof bio !== "string" || bio.length > 2e3)
          throw new HttpError(422, "\u7B80\u4ECB\u65E0\u6548");
        await db.prepare(
          "UPDATE student_profiles SET tag_category=?,payload_json=?,version=version+1 WHERE id=?"
        ).run(tag, JSON.stringify({ ...payload, bio }), s.id);
        return { id: s.id, version: s.version + 1 };
      },
      "\u6863\u6848\u5DF2\u4FDD\u5B58"
    )
  );
}
__name(registerCare, "registerCare");

// server/workspace.ts
function registerWorkspace(app, source) {
  const db = asyncDatabase(source);
  const visible = /* @__PURE__ */ __name(async (res, classId) => {
    try {
      await classAccess(db, res, classId);
      return true;
    } catch {
      return false;
    }
  }, "visible");
  app.get("/api/v1/workspace/overview", async (_req, res) => {
    const classes = await asyncFilter(
      await db.prepare(
        "SELECT id,class_name FROM academic_classes WHERE archived_at IS NULL ORDER BY class_code,id"
      ).all(),
      async (c) => await visible(res, c.id)
    ), ids = classes.map((c) => c.id), inClasses = `(${ids.map(() => "?").join(",") || "NULL"})`, now = /* @__PURE__ */ new Date(), shifted = new Date(now.getTime() + 8 * 36e5), today = shifted.toISOString().slice(0, 10), dayStart = (/* @__PURE__ */ new Date(`${today}T00:00:00+08:00`)).toISOString(), dayEnd = new Date(Date.parse(dayStart) + 864e5).toISOString();
    const students = (await db.prepare(
      `SELECT COUNT(*) AS n FROM student_profiles WHERE archived_at IS NULL AND class_id IN ${inClasses}`
    ).get(...ids)).n;
    const homework = await db.prepare(
      `SELECT a.id,a.title,a.due_at,a.class_id,COUNT(CASE WHEN s.status IN ('pending','ai-pregraded') THEN 1 END) AS pending FROM homework_assignments a LEFT JOIN homework_submissions s ON s.assignment_id=a.id WHERE a.lifecycle IN ('published','closed') AND a.class_id IN ${inClasses} GROUP BY a.id ORDER BY a.due_at IS NULL,a.due_at,a.id`
    ).all(...ids);
    const scheduleScope = await scheduleAccess(db, res.locals.user.id);
    const schedules = (await db.prepare(
      `SELECT e.*,g.unit_id,c.class_name,k.name AS course_name,u.full_name FROM schedule_entries e LEFT JOIN schedule_entry_scopes g ON g.entry_id=e.id JOIN academic_classes c ON c.id=e.class_id JOIN courses k ON k.id=e.course_id JOIN faculty_users u ON u.id=e.teacher_id WHERE cancelled_at IS NULL AND starts_at>=? AND starts_at<? ORDER BY starts_at,e.id`
    ).all(dayStart, dayEnd)).filter(
      (e) => e.teacher_id === res.locals.user.id || scheduleScope.visible(e.unit_id)
    ).map((e) => ({
      ...e,
      lesson_id: e.teacher_id === res.locals.user.id ? e.lesson_id : null
    }));
    const todos = await db.prepare(
      `SELECT t.*,s.full_name FROM care_todos t JOIN student_profiles s ON s.id=t.student_id WHERE t.owner_id=? AND t.status='open' AND s.class_id IN ${inClasses} ORDER BY due_at,id`
    ).all(res.locals.user.id, ...ids);
    const unread = (await db.prepare(
      `SELECT COUNT(*) AS n FROM care_messages m JOIN care_threads t ON t.id=m.thread_id JOIN care_contacts c ON c.id=t.contact_id JOIN student_profiles s ON s.id=c.student_id WHERE t.teacher_id=? AND m.kind='incoming-record' AND m.sequence>t.last_read_sequence AND s.class_id IN ${inClasses}`
    ).get(res.locals.user.id, ...ids)).n;
    const lessons = (await db.prepare(
      "SELECT COUNT(*) AS n FROM lesson_plans WHERE archived_at IS NULL AND (visibility='school' OR owner_id=?)"
    ).get(res.locals.user.id)).n;
    reply2(res, {
      today,
      classes,
      students,
      pending: homework.reduce((sum, row) => sum + row.pending, 0),
      unread,
      lessons,
      homework,
      schedules,
      todos,
      external: {
        ai: false,
        ocr: false,
        parentDelivery: false,
        projection: false
      }
    });
  });
  app.get("/api/v1/workspace/search", async (req, res) => {
    const q = text(req.query.q, "\u641C\u7D22\u5173\u952E\u8BCD", { max: 100 }), results = [];
    const studentRows = await db.prepare(
      "SELECT s.id,s.full_name,s.student_no,s.class_id,c.class_name FROM student_profiles s JOIN academic_classes c ON c.id=s.class_id WHERE s.archived_at IS NULL AND (instr(s.full_name,?)>0 OR instr(s.student_no,?)>0) ORDER BY s.student_no,s.id"
    ).all(q, q);
    for (const s of (await asyncFilter(
      studentRows,
      async (s2) => await visible(res, s2.class_id)
    )).slice(0, 20))
      results.push({
        id: s.id,
        title: s.full_name,
        subtitle: `${s.class_name} \xB7 ${s.student_no}`,
        type: "student",
        tab: "student-profiles",
        class_id: s.class_id
      });
    const lessons = await db.prepare(
      "SELECT id,title,owner_id,visibility FROM lesson_plans WHERE archived_at IS NULL AND instr(title||body||tags_json,?)>0 AND (visibility='school' OR owner_id=?) ORDER BY updated_at DESC,id LIMIT 20"
    ).all(q, res.locals.user.id);
    for (const l of lessons)
      results.push({
        id: l.id,
        title: l.title,
        subtitle: "\u6559\u6848",
        type: "lesson",
        tab: "lesson-plans"
      });
    for (const [table, type, tab] of [
      ["homework_assignments", "homework", "homework-center"],
      ["assessment_exams", "exam", "exam-analytics"]
    ]) {
      const rows = await db.prepare(
        `SELECT id,title,class_id FROM ${table} WHERE instr(title,?)>0 AND ${type === "homework" ? "lifecycle<>'archived' AND (lifecycle<>'draft' OR owner_id=?)" : "archived_at IS NULL"} ORDER BY id`
      ).all(
        q,
        ...type === "homework" ? [res.locals.user.id] : []
      );
      for (const row of (await asyncFilter(rows, async (r) => await visible(res, r.class_id))).slice(0, 20))
        results.push({
          id: row.id,
          title: row.title,
          subtitle: type === "homework" ? "\u4F5C\u4E1A" : "\u8003\u8BD5",
          type,
          tab,
          class_id: row.class_id
        });
    }
    reply2(res, results);
  });
  app.get(
    "/api/v1/workspace/notifications",
    async (_req, res) => reply2(
      res,
      await db.prepare(
        "SELECT * FROM business_notifications WHERE user_id=? AND available_at<=? ORDER BY created_at DESC,id LIMIT 100"
      ).all(res.locals.user.id, (/* @__PURE__ */ new Date()).toISOString())
    )
  );
  app.post("/api/v1/workspace/notifications/read", async (req, res) => {
    const id = req.body.id;
    if (id !== void 0 && typeof id !== "string")
      throw new HttpError(422, "\u901A\u77E5\u6807\u8BC6\u65E0\u6548");
    if (id && !await db.prepare(
      "SELECT id FROM business_notifications WHERE id=? AND user_id=?"
    ).get(id, res.locals.user.id))
      throw new HttpError(404, "\u901A\u77E5\u4E0D\u5B58\u5728");
    await db.prepare(
      `UPDATE business_notifications SET read_at=? WHERE user_id=? AND available_at<=? ${id ? "AND id=?" : ""}`
    ).run(
      (/* @__PURE__ */ new Date()).toISOString(),
      res.locals.user.id,
      (/* @__PURE__ */ new Date()).toISOString(),
      ...id ? [id] : []
    );
    reply2(res, { read: true }, "\u5DF2\u6807\u8BB0\u5DF2\u8BFB");
  });
}
__name(registerWorkspace, "registerWorkspace");

// server/legacyViews.ts
function registerLegacyViews(app, source) {
  const db = asyncDatabase(source);
  app.get("/api/v1/homework/submissions", async (req, res) => {
    const className = String(req.query.className || ""), status = String(req.query.status || "all");
    const scope = res.locals.classScope;
    const rows = await db.prepare(
      `SELECT s.* FROM homework_submissions s JOIN homework_assignments a ON a.id=s.assignment_id WHERE s.class_name=? AND (?='all' OR s.status=?) AND (a.lifecycle<>'draft' OR a.owner_id=?) ${scope ? `AND a.class_id IN (${scope.map(() => "?").join(",") || "NULL"})` : ""} ORDER BY s.submitted_at,s.id`
    ).all(className, status, status, res.locals.user.id, ...scope || []);
    reply2(
      res,
      rows.map((row) => ({
        ...JSON.parse(row.payload_json),
        id: row.id,
        score: row.total_score,
        status: row.status,
        statusBadge: row.status_badge,
        stamp: row.stamp_type
      })),
      "\u5DF2\u52A0\u8F7D\u4F5C\u4E1A\u6279\u9605\u6C60"
    );
  });
  app.get("/api/v1/students", async (req, res) => {
    const classId = String(req.query.classId || ""), tag = String(req.query.tag || "all");
    const scope = res.locals.classScope;
    const rows = await db.prepare(
      `SELECT s.*,c.class_name FROM student_profiles s JOIN academic_classes c ON c.id=s.class_id WHERE s.archived_at IS NULL AND s.class_id=? AND (?='all' OR s.tag_category=?) ${scope ? `AND s.class_id IN (${scope.map(() => "?").join(",") || "NULL"})` : ""} ORDER BY s.student_no,s.id`
    ).all(classId, tag, tag, ...scope || []);
    const journals = rows.length ? await db.prepare(
      `SELECT id,student_id,date_title,tag,content,teacher_name,status_text FROM coaching_journals WHERE student_id IN (${rows.map(() => "?").join(",")}) ORDER BY date_title DESC,id DESC`
    ).all(...rows.map((row) => row.id)) : [];
    reply2(
      res,
      rows.map((row) => ({
        ...JSON.parse(row.payload_json),
        id: row.id,
        name: row.full_name,
        studentNo: row.student_no,
        shortNo: row.short_no,
        className: row.class_name,
        avatarChar: row.avatar_char,
        tagCategory: row.tag_category,
        coachingJournals: journals.filter((j) => j.student_id === row.id).map((j) => ({
          id: j.id,
          dateTitle: j.date_title,
          tag: j.tag,
          content: j.content,
          teacher: j.teacher_name,
          statusText: j.status_text
        }))
      })),
      "\u5DF2\u52A0\u8F7D\u5B66\u751F\u5B66\u60C5\u6863\u6848"
    );
  });
}
__name(registerLegacyViews, "registerLegacyViews");

// server/application.ts
function createApplication(db, captcha, trustCloudflare = false, diagnostics = false, passwordPolicy, databaseLabel = "TiDB") {
  const app = (0, import_express.default)();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.locals.requestId = randomUUID14();
    res.setHeader("X-Request-Id", res.locals.requestId);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Sakura-Database", databaseLabel);
    next();
  });
  app.use(import_express.default.json({ limit: "5mb" }));
  app.use((req, _res, next) => {
    if (["POST", "PATCH", "PUT"].includes(req.method)) {
      req.body ??= {};
      if (typeof req.body !== "object" || Array.isArray(req.body))
        return next(new HttpError(422, "\u8BF7\u6C42\u5185\u5BB9\u5FC5\u987B\u4E3A JSON \u5BF9\u8C61"));
    }
    next();
  });
  registerAuth(app, db, captcha, { trustCloudflare, passwordPolicy });
  registerAcademic(app, db, passwordPolicy);
  registerHomework(app, db);
  registerLessons(app, db);
  registerSchedules(app, db);
  registerExams(app, db);
  registerCare(app, db);
  registerWorkspace(app, db);
  registerLegacyViews(app, db);
  app.use(
    "/api/v1",
    (_req, _res, next) => next(new HttpError(404, "\u63A5\u53E3\u4E0D\u5B58\u5728"))
  );
  if (diagnostics)
    app.use(
      (error, _req, res, next) => {
        res.setHeader(
          "X-Sakura-Error-Code",
          /^[A-Z0-9_]{1,64}$/.test(
            String(error?.code || error?.details?.code || "")
          ) ? String(error?.code || error?.details?.code) : "INTERNAL_ERROR"
        );
        next(error);
      }
    );
  app.use(apiErrorHandler);
  return app;
}
__name(createApplication, "createApplication");

// cloudflare/adapters.ts
import { randomBytes as randomBytes3, randomInt } from "node:crypto";
function svg(text2) {
  const letters = text2.split("").map(
    (letter, i) => `<text x="${18 + i * 24}" y="34" transform="rotate(${randomInt(-5, 6)} ${18 + i * 24} 34)" fill="#194b3a" font-family="sans-serif" font-size="26" font-weight="bold">${letter}</text>`
  ).join("");
  const noise = Array.from(
    { length: 1 },
    () => `<path d="M${randomInt(0, 160)} ${randomInt(0, 48)}L${randomInt(0, 160)} ${randomInt(0, 48)}" stroke="#9dafaa" fill="none"/>`
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="170" height="48" viewBox="0 0 170 48"><rect width="170" height="48" rx="6" fill="#edf6ef"/>${noise}${letters}</svg>`;
}
__name(svg, "svg");
var edgeCaptcha = {
  create() {
    const alphabet = "23456789", text2 = Array.from(
      randomBytes3(4),
      (n) => alphabet[n % alphabet.length]
    ).join("");
    return { text: text2, data: svg(text2) };
  },
  createMathExpr() {
    const a = randomInt(1, 10), b = randomInt(1, 10);
    return { text: String(a + b), data: svg(`${a}+${b}=?`) };
  }
};

// cloudflare/abSqliteDatabase.ts
import { AsyncLocalStorage as AsyncLocalStorage2 } from "node:async_hooks";

// cloudflare/schema.json
var schema_default = {
  version: 1,
  sourceMigrationVersion: 16,
  tables: [
    "academic_classes",
    "academic_terms",
    "assessment_exams",
    "assessment_imports",
    "assessment_marks",
    "assessment_questions",
    "assessment_results",
    "auth_protection",
    "auth_sessions",
    "business_notifications",
    "care_contacts",
    "care_messages",
    "care_threads",
    "care_todos",
    "class_enrollments",
    "coaching_journals",
    "course_swap_requests",
    "courses",
    "exam_analytics_batches",
    "faculty_class_defaults",
    "faculty_users",
    "home_school_messages",
    "home_school_threads",
    "homework_assignments",
    "homework_history",
    "homework_submissions",
    "identity_appointments",
    "identity_object_bindings",
    "identity_objects",
    "identity_person_links",
    "identity_registry",
    "identity_reporting_lines",
    "identity_roles",
    "institutions",
    "lesson_homework",
    "lesson_plans",
    "lesson_revisions",
    "login_attempts",
    "organization_class_links",
    "organization_parent_rules",
    "organization_positions",
    "organization_unit_profiles",
    "organization_unit_types",
    "organization_units",
    "person_account_links",
    "schedule_changes",
    "schedule_entries",
    "schedule_entry_scopes",
    "schedule_submissions",
    "schedule_task_pool",
    "schema_migrations",
    "school_people",
    "school_subjects",
    "security_captchas",
    "sql_audit_logs",
    "staff_course_qualifications",
    "student_profiles",
    "subject_courses",
    "teaching_assignments",
    "timetable_schedules"
  ],
  statements: [
    `CREATE TABLE "academic_classes" (
      id TEXT PRIMARY KEY,
      class_code TEXT NOT NULL UNIQUE,
      class_name TEXT NOT NULL,
      grade_level TEXT NOT NULL,
      head_teacher_id TEXT,
      student_count INTEGER NOT NULL DEFAULT 45,
      room_location TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    , archived_at TEXT, version INTEGER NOT NULL DEFAULT 1, FOREIGN KEY (head_teacher_id) REFERENCES faculty_users(id) ON DELETE RESTRICT
)`,
    "CREATE TABLE academic_terms (\n  id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL,\n  starts_on TEXT NOT NULL, ends_on TEXT NOT NULL,\n  active INTEGER NOT NULL DEFAULT 0 CHECK(active IN (0,1)), archived_at TEXT, version INTEGER NOT NULL DEFAULT 1, CHECK(starts_on <= ends_on)\n)",
    "CREATE TABLE assessment_exams(id TEXT PRIMARY KEY,title TEXT NOT NULL,exam_date TEXT NOT NULL,class_id TEXT NOT NULL REFERENCES academic_classes(id),course_id TEXT NOT NULL REFERENCES courses(id),owner_id TEXT NOT NULL REFERENCES faculty_users(id),max_score REAL NOT NULL CHECK(max_score>0),pass_ratio REAL NOT NULL CHECK(pass_ratio>=0 AND pass_ratio<=1),excellent_ratio REAL NOT NULL CHECK(excellent_ratio>=pass_ratio AND excellent_ratio<=1),roster_json TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,archived_at TEXT)",
    "CREATE TABLE assessment_imports(actor_id TEXT NOT NULL REFERENCES faculty_users(id),request_key TEXT NOT NULL,exam_id TEXT NOT NULL REFERENCES assessment_exams(id),payload_hash TEXT NOT NULL,result_json TEXT NOT NULL,PRIMARY KEY(actor_id,request_key))",
    "CREATE TABLE assessment_marks(exam_id TEXT NOT NULL,student_id TEXT NOT NULL,question_id TEXT NOT NULL REFERENCES assessment_questions(id),score REAL NOT NULL CHECK(score>=0),PRIMARY KEY(exam_id,student_id,question_id),FOREIGN KEY(exam_id,student_id) REFERENCES assessment_results(exam_id,student_id))",
    "CREATE TABLE assessment_questions(id TEXT PRIMARY KEY,exam_id TEXT NOT NULL REFERENCES assessment_exams(id),title TEXT NOT NULL,max_score REAL NOT NULL CHECK(max_score>0),ordinal INTEGER NOT NULL,UNIQUE(exam_id,ordinal))",
    "CREATE TABLE assessment_results(exam_id TEXT NOT NULL REFERENCES assessment_exams(id),student_id TEXT NOT NULL REFERENCES student_profiles(id),status TEXT NOT NULL CHECK(status IN ('scored','absent','ungraded')),PRIMARY KEY(exam_id,student_id))",
    "CREATE TABLE auth_protection(bucket_hash TEXT PRIMARY KEY,failures INTEGER NOT NULL DEFAULT 0 CHECK(failures>=0),level INTEGER NOT NULL DEFAULT 0 CHECK(level BETWEEN 0 AND 5),blocked_until INTEGER NOT NULL DEFAULT 0 CHECK(blocked_until>=0),updated_at INTEGER NOT NULL)",
    "CREATE TABLE auth_sessions (\n      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES faculty_users(id) ON DELETE CASCADE,\n      csrf_token TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL\n    )",
    "CREATE TABLE business_notifications(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES faculty_users(id),event_key TEXT NOT NULL,title TEXT NOT NULL,resource_path TEXT NOT NULL,resource_id TEXT,available_at TEXT NOT NULL,created_at TEXT NOT NULL,read_at TEXT,UNIQUE(user_id,event_key))",
    "CREATE TABLE care_contacts(id TEXT PRIMARY KEY,student_id TEXT NOT NULL REFERENCES student_profiles(id),name TEXT NOT NULL,relationship TEXT NOT NULL,phone TEXT NOT NULL DEFAULT '',version INTEGER NOT NULL DEFAULT 1,archived_at TEXT)",
    "CREATE TABLE care_messages(sequence INTEGER PRIMARY KEY AUTOINCREMENT,id TEXT NOT NULL UNIQUE,thread_id TEXT NOT NULL REFERENCES care_threads(id),actor_id TEXT NOT NULL REFERENCES faculty_users(id),request_key TEXT NOT NULL,kind TEXT NOT NULL CHECK(kind IN ('note','outgoing','incoming-record')),content TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('recorded','queued')),not_before TEXT NOT NULL,created_at TEXT NOT NULL,UNIQUE(actor_id,request_key))",
    "CREATE TABLE care_threads(id TEXT PRIMARY KEY,contact_id TEXT NOT NULL REFERENCES care_contacts(id),teacher_id TEXT NOT NULL REFERENCES faculty_users(id),last_message TEXT NOT NULL DEFAULT '',updated_at TEXT NOT NULL,last_read_sequence INTEGER NOT NULL DEFAULT 0,UNIQUE(contact_id,teacher_id))",
    "CREATE TABLE care_todos(id TEXT PRIMARY KEY,student_id TEXT NOT NULL REFERENCES student_profiles(id),owner_id TEXT NOT NULL REFERENCES faculty_users(id),title TEXT NOT NULL,due_at TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','done','cancelled')),version INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL)",
    "CREATE TABLE class_enrollments (\n  student_id TEXT NOT NULL REFERENCES student_profiles(id),\n  class_id TEXT NOT NULL REFERENCES academic_classes(id),\n  term_id TEXT NOT NULL REFERENCES academic_terms(id),\n  PRIMARY KEY(student_id,term_id)\n)",
    `CREATE TABLE "coaching_journals" (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      teacher_id TEXT NOT NULL DEFAULT 'fac-admin',
      date_title TEXT NOT NULL,
      tag TEXT NOT NULL,
      content TEXT NOT NULL,
      teacher_name TEXT NOT NULL DEFAULT '\u6797\u77E5\u590F \u8001\u5E08',
      status_text TEXT NOT NULL DEFAULT '\u5DF2\u540C\u6B65\u6210\u957F\u6863\u6848',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    , FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE RESTRICT, FOREIGN KEY (teacher_id) REFERENCES faculty_users(id) ON DELETE RESTRICT
)`,
    `CREATE TABLE "course_swap_requests" (
      id TEXT PRIMARY KEY,
      applicant_teacher_id TEXT NOT NULL,
      target_teacher_name TEXT NOT NULL,
      source_period_desc TEXT NOT NULL,
      target_period_desc TEXT NOT NULL,
      reason TEXT NOT NULL,
      approval_status TEXT NOT NULL DEFAULT 'APPROVED',
      approved_by TEXT DEFAULT '\u9648\u94ED (\u8BED\u6587\u6559\u7814\u7EC4\u957F)',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    , FOREIGN KEY (applicant_teacher_id) REFERENCES faculty_users(id) ON DELETE RESTRICT
)`,
    "CREATE TABLE courses (id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, archived_at TEXT, version INTEGER NOT NULL DEFAULT 1)",
    `CREATE TABLE "exam_analytics_batches" (
      id TEXT PRIMARY KEY,
      exam_title TEXT NOT NULL,
      exam_date TEXT NOT NULL,
      class_id TEXT NOT NULL,
      class_avg REAL NOT NULL,
      grade_avg REAL NOT NULL,
      excellent_rate REAL NOT NULL,
      pass_rate REAL NOT NULL,
      ai_confidence REAL NOT NULL DEFAULT 98.4,
      core_conclusion TEXT NOT NULL,
      tactical_advice TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    , FOREIGN KEY (class_id) REFERENCES academic_classes(id) ON DELETE RESTRICT
)`,
    "CREATE TABLE faculty_class_defaults(\n    account_id TEXT PRIMARY KEY REFERENCES faculty_users(id),\n    class_id TEXT REFERENCES academic_classes(id),\n    updated_at TEXT NOT NULL\n  )",
    "CREATE TABLE faculty_users (\n      id TEXT PRIMARY KEY,\n      faculty_code TEXT NOT NULL UNIQUE,\n      email TEXT NOT NULL UNIQUE,\n      phone TEXT UNIQUE,\n      password_hash TEXT NOT NULL,\n      full_name TEXT NOT NULL,\n      title_role TEXT NOT NULL,\n      department TEXT NOT NULL DEFAULT '\u9AD8\u4E2D\u8BED\u6587\u6559\u7814\u7EC4',\n      default_tab TEXT NOT NULL DEFAULT 'homework-center',\n      default_theme TEXT NOT NULL DEFAULT 'awesome-green',\n      default_class_name TEXT NOT NULL DEFAULT '\u9AD8\u4E8C(1)\u73ED',\n      semester_label TEXT NOT NULL DEFAULT '2024 \u6625\u5B63\u5B66\u671F \xB7 \u7B2C 12 \u5468',\n      dnd_enabled INTEGER NOT NULL DEFAULT 1,\n      dnd_start_time TEXT NOT NULL DEFAULT '20:30',\n      status TEXT NOT NULL DEFAULT 'ACTIVE',\n      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))\n    , role TEXT NOT NULL DEFAULT 'teacher' CHECK(role IN ('admin','teacher')), version INTEGER NOT NULL DEFAULT 1)",
    `CREATE TABLE "home_school_messages" (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      content TEXT NOT NULL,
      medal_attached_json TEXT,
      sent_time_label TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    , FOREIGN KEY (thread_id) REFERENCES home_school_threads(id) ON DELETE RESTRICT
)`,
    `CREATE TABLE "home_school_threads" (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      class_name TEXT NOT NULL DEFAULT '\u9AD8\u4E8C(1)\u73ED',
      role_tag TEXT NOT NULL DEFAULT '',
      topic_tag TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'all',
      unread_count INTEGER NOT NULL DEFAULT 0,
      last_time TEXT NOT NULL DEFAULT '',
      last_message TEXT NOT NULL DEFAULT '',
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    , FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE RESTRICT, CHECK (unread_count >= 0)
)`,
    `CREATE TABLE "homework_assignments" (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      course_tag TEXT NOT NULL,
      class_id TEXT NOT NULL,
      max_score REAL NOT NULL DEFAULT 100,
      submitted_count INTEGER NOT NULL DEFAULT 1,
      total_students INTEGER NOT NULL DEFAULT 1,
      graded_count INTEGER NOT NULL DEFAULT 1,
      avg_score REAL NOT NULL DEFAULT 98.0,
      excellent_rate REAL NOT NULL DEFAULT 100.0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    , lifecycle TEXT NOT NULL DEFAULT 'published' CHECK(lifecycle IN ('draft','published','closed','archived')), owner_id TEXT REFERENCES faculty_users(id), instructions TEXT NOT NULL DEFAULT '', due_at TEXT, version INTEGER NOT NULL DEFAULT 1, roster_json TEXT, FOREIGN KEY (class_id) REFERENCES academic_classes(id) ON DELETE RESTRICT, CHECK (max_score > 0), CHECK (total_students >= 0)
)`,
    "CREATE TABLE homework_history(id TEXT PRIMARY KEY,submission_id TEXT NOT NULL REFERENCES homework_submissions(id),actor_id TEXT NOT NULL REFERENCES faculty_users(id),action TEXT NOT NULL,snapshot_json TEXT NOT NULL,created_at TEXT NOT NULL)",
    `CREATE TABLE "homework_submissions" (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      class_name TEXT NOT NULL DEFAULT '\u9AD8\u4E8C(1)\u73ED',
      total_score REAL,
      question_score REAL NOT NULL DEFAULT 24.5,
      status TEXT NOT NULL DEFAULT 'graded',
      tag_text TEXT NOT NULL DEFAULT '',
      status_badge TEXT NOT NULL DEFAULT '',
      is_model_essay INTEGER NOT NULL DEFAULT 0,
      stamp_type TEXT,
      payload_json TEXT NOT NULL,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      graded_at TEXT
    , version INTEGER NOT NULL DEFAULT 1, content TEXT NOT NULL DEFAULT '', feedback TEXT NOT NULL DEFAULT '', FOREIGN KEY (assignment_id) REFERENCES homework_assignments(id) ON DELETE RESTRICT, FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE RESTRICT, CHECK (total_score IS NULL OR total_score >= 0), CHECK (question_score >= 0)
)`,
    "CREATE TABLE identity_appointments(\n id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),identity_id TEXT NOT NULL,position_id TEXT NOT NULL,\n starts_on TEXT NOT NULL CHECK(date(starts_on) IS NOT NULL AND date(starts_on)=starts_on),\n ends_on TEXT CHECK(ends_on IS NULL OR (date(ends_on) IS NOT NULL AND date(ends_on)=ends_on AND ends_on>=starts_on)),\n status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','ended','revoked')),\n UNIQUE(id,institution_id),FOREIGN KEY(identity_id,institution_id) REFERENCES identity_registry(id,institution_id),\n FOREIGN KEY(position_id,institution_id) REFERENCES organization_positions(id,institution_id))",
    "CREATE TABLE identity_object_bindings(\n id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),identity_id TEXT NOT NULL,object_id TEXT NOT NULL,\n relation TEXT NOT NULL CHECK(relation IN ('member','teaches','mentors','counsels','guardian_of','self_record','reports_to')),\n period_key TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','revoked')),\n created_by TEXT NOT NULL,confirmed_by TEXT,proof_key_hash TEXT CHECK(proof_key_hash IS NULL OR (length(proof_key_hash)=64 AND proof_key_hash NOT GLOB '*[^0-9a-f]*')),\n CHECK(status<>'confirmed' OR (confirmed_by IS NOT NULL AND proof_key_hash IS NOT NULL)),\n UNIQUE(institution_id,identity_id,object_id,relation,period_key),\n FOREIGN KEY(identity_id,institution_id) REFERENCES identity_registry(id,institution_id),\n FOREIGN KEY(object_id,institution_id) REFERENCES identity_objects(id,institution_id),\n FOREIGN KEY(created_by,institution_id) REFERENCES identity_registry(id,institution_id),\n FOREIGN KEY(confirmed_by,institution_id) REFERENCES identity_registry(id,institution_id))",
    "CREATE TABLE identity_objects(\n id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),owner_identity_id TEXT NOT NULL,\n object_kind TEXT NOT NULL CHECK(object_kind IN ('student','class','course','term','homework','lesson','exam','report','attachment')),\n source_ref TEXT NOT NULL CHECK(length(trim(source_ref))>0),UNIQUE(id,institution_id),UNIQUE(institution_id,object_kind,source_ref),\n FOREIGN KEY(owner_identity_id,institution_id) REFERENCES identity_registry(id,institution_id))",
    "CREATE TABLE identity_person_links(identity_id TEXT PRIMARY KEY,institution_id TEXT NOT NULL,person_id TEXT NOT NULL,FOREIGN KEY(identity_id,institution_id) REFERENCES identity_registry(id,institution_id),FOREIGN KEY(person_id,institution_id) REFERENCES school_people(id,institution_id))",
    "CREATE TABLE identity_registry(\n id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),account_id TEXT REFERENCES faculty_users(id),\n identity_kind TEXT NOT NULL CHECK(identity_kind IN ('staff','student','guardian')),\n external_id TEXT NOT NULL COLLATE NOCASE CHECK(length(trim(external_id))>0 AND external_id=trim(external_id)),\n display_name TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended','archived')),\n UNIQUE(id,institution_id),UNIQUE(institution_id,identity_kind,external_id),UNIQUE(account_id,institution_id,identity_kind))",
    "CREATE TABLE identity_reporting_lines(\n id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),subordinate_id TEXT NOT NULL,supervisor_id TEXT NOT NULL,\n status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','ended','revoked')),CHECK(subordinate_id<>supervisor_id),\n FOREIGN KEY(subordinate_id,institution_id) REFERENCES identity_appointments(id,institution_id),\n FOREIGN KEY(supervisor_id,institution_id) REFERENCES identity_appointments(id,institution_id))",
    "CREATE TABLE identity_roles(code TEXT PRIMARY KEY,identity_kind TEXT NOT NULL CHECK(identity_kind IN ('staff','student','guardian')),label TEXT NOT NULL)",
    "CREATE TABLE institutions(id TEXT PRIMARY KEY,code TEXT NOT NULL UNIQUE CHECK(length(trim(code))>0),name TEXT NOT NULL CHECK(length(trim(name))>0))",
    "CREATE TABLE lesson_homework(lesson_id TEXT NOT NULL REFERENCES lesson_plans(id),assignment_id TEXT NOT NULL REFERENCES homework_assignments(id),PRIMARY KEY(lesson_id,assignment_id))",
    "CREATE TABLE lesson_plans (\n      id TEXT PRIMARY KEY,\n      unit_code TEXT NOT NULL DEFAULT 'u2',\n      title TEXT NOT NULL,\n      summary TEXT NOT NULL,\n      category TEXT NOT NULL DEFAULT 'all',\n      badge_text TEXT DEFAULT '',\n      author_name TEXT NOT NULL,\n      citation_count INTEGER NOT NULL DEFAULT 120,\n      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))\n    , owner_id TEXT REFERENCES faculty_users(id), body TEXT NOT NULL DEFAULT '', tags_json TEXT NOT NULL DEFAULT '[]', visibility TEXT NOT NULL DEFAULT 'school' CHECK(visibility IN ('private','school')), archived_at TEXT, version INTEGER NOT NULL DEFAULT 1)",
    "CREATE TABLE lesson_revisions(id TEXT PRIMARY KEY,lesson_id TEXT NOT NULL REFERENCES lesson_plans(id),actor_id TEXT NOT NULL REFERENCES faculty_users(id),snapshot_json TEXT NOT NULL,created_at TEXT NOT NULL)",
    "CREATE TABLE login_attempts(id INTEGER PRIMARY KEY, account TEXT NOT NULL, attempted_at INTEGER NOT NULL, succeeded INTEGER NOT NULL CHECK(succeeded IN (0,1)))",
    "CREATE TABLE organization_class_links(class_id TEXT PRIMARY KEY REFERENCES academic_classes(id),institution_id TEXT NOT NULL,unit_id TEXT NOT NULL UNIQUE,FOREIGN KEY(unit_id,institution_id) REFERENCES organization_unit_profiles(unit_id,institution_id))",
    "CREATE TABLE organization_parent_rules(parent_type TEXT NOT NULL REFERENCES organization_unit_types(code),child_type TEXT NOT NULL REFERENCES organization_unit_types(code),PRIMARY KEY(parent_type,child_type))",
    "CREATE TABLE organization_positions(\n id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),unit_id TEXT NOT NULL,role_code TEXT NOT NULL REFERENCES identity_roles(code),code TEXT NOT NULL,\n hierarchy_level INTEGER NOT NULL CHECK(hierarchy_level BETWEEN 1 AND 100),\n UNIQUE(id,institution_id),UNIQUE(institution_id,unit_id,code),FOREIGN KEY(unit_id,institution_id) REFERENCES organization_units(id,institution_id))",
    "CREATE TABLE organization_unit_profiles(unit_id TEXT PRIMARY KEY,institution_id TEXT NOT NULL,unit_type TEXT NOT NULL REFERENCES organization_unit_types(code),subject_id TEXT,UNIQUE(unit_id,institution_id),FOREIGN KEY(unit_id,institution_id) REFERENCES organization_units(id,institution_id),FOREIGN KEY(subject_id,institution_id) REFERENCES school_subjects(id,institution_id),CHECK((unit_type='subject_group' AND subject_id IS NOT NULL) OR (unit_type<>'subject_group' AND subject_id IS NULL)))",
    "CREATE TABLE organization_unit_types(code TEXT PRIMARY KEY,label TEXT NOT NULL,structural_kind TEXT NOT NULL)",
    "CREATE TABLE organization_units(\n id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),parent_id TEXT,\n kind TEXT NOT NULL CHECK(kind IN ('school','campus','division','department','grade','class','group')),\n code TEXT NOT NULL CHECK(length(trim(code))>0),name TEXT NOT NULL CHECK(length(trim(name))>0),\n status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','archived')),\n UNIQUE(id,institution_id),UNIQUE(institution_id,code),\n FOREIGN KEY(parent_id,institution_id) REFERENCES organization_units(id,institution_id),\n CHECK((kind='school' AND parent_id IS NULL) OR (kind<>'school' AND parent_id IS NOT NULL)),CHECK(parent_id IS NULL OR parent_id<>id))",
    "CREATE TABLE person_account_links(institution_id TEXT NOT NULL,person_id TEXT NOT NULL,account_id TEXT NOT NULL REFERENCES faculty_users(id),PRIMARY KEY(institution_id,account_id),FOREIGN KEY(person_id,institution_id) REFERENCES school_people(id,institution_id))",
    "CREATE TABLE schedule_changes(id TEXT PRIMARY KEY,entry_id TEXT NOT NULL REFERENCES schedule_entries(id),source_version INTEGER NOT NULL,applicant_id TEXT NOT NULL REFERENCES faculty_users(id),target_json TEXT NOT NULL,reason TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','cancelled')),reviewer_id TEXT REFERENCES faculty_users(id),review_note TEXT NOT NULL DEFAULT '',version INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL)",
    "CREATE TABLE schedule_entries(id TEXT PRIMARY KEY,class_id TEXT NOT NULL REFERENCES academic_classes(id),teacher_id TEXT NOT NULL REFERENCES faculty_users(id),course_id TEXT NOT NULL REFERENCES courses(id),starts_at TEXT NOT NULL,ends_at TEXT NOT NULL,room TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,cancelled_at TEXT, lesson_id TEXT REFERENCES lesson_plans(id),CHECK(starts_at<ends_at))",
    "CREATE TABLE schedule_entry_scopes(entry_id TEXT PRIMARY KEY REFERENCES schedule_entries(id),unit_id TEXT NOT NULL REFERENCES organization_units(id),shared_by TEXT NOT NULL REFERENCES faculty_users(id))",
    "CREATE TABLE schedule_submissions(\n    id TEXT PRIMARY KEY,owner_id TEXT NOT NULL REFERENCES faculty_users(id),unit_id TEXT REFERENCES organization_units(id),\n    class_id TEXT NOT NULL REFERENCES academic_classes(id),course_id TEXT NOT NULL REFERENCES courses(id),\n    starts_at TEXT NOT NULL,ends_at TEXT NOT NULL,room TEXT NOT NULL,note TEXT NOT NULL DEFAULT '',\n    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','approved','rejected','withdrawn')),\n    reviewer_id TEXT REFERENCES faculty_users(id),review_note TEXT NOT NULL DEFAULT '',entry_id TEXT UNIQUE REFERENCES schedule_entries(id),\n    shared INTEGER NOT NULL DEFAULT 1 CHECK(shared IN (0,1)),\n    version INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,\n    CHECK(starts_at<ends_at),CHECK(status='draft' OR unit_id IS NOT NULL))",
    "CREATE TABLE schedule_task_pool(\n    id TEXT PRIMARY KEY,\n    owner_id TEXT NOT NULL REFERENCES faculty_users(id),\n    title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120),\n    note TEXT NOT NULL DEFAULT '',\n    preferred_class_id TEXT REFERENCES academic_classes(id),\n    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','linked','cancelled')),\n    submission_id TEXT UNIQUE REFERENCES schedule_submissions(id),\n    version INTEGER NOT NULL DEFAULT 1,\n    created_at TEXT NOT NULL,\n    updated_at TEXT NOT NULL,\n    CHECK((status='linked' AND submission_id IS NOT NULL) OR (status<>'linked' AND submission_id IS NULL))\n  )",
    "CREATE TABLE schema_migrations(version INTEGER PRIMARY KEY, name TEXT NOT NULL, checksum TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))",
    "CREATE TABLE school_people(id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),display_name TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended','archived')),UNIQUE(id,institution_id))",
    "CREATE TABLE school_subjects(id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),code TEXT NOT NULL,name TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','archived')),UNIQUE(id,institution_id),UNIQUE(institution_id,code))",
    "CREATE TABLE security_captchas (\n      captcha_id TEXT PRIMARY KEY,\n      mode TEXT NOT NULL DEFAULT 'graphic',\n      captcha_mode TEXT NOT NULL DEFAULT 'graphic',\n      question_label TEXT NOT NULL DEFAULT '',\n      answer_hash TEXT NOT NULL DEFAULT '',\n      answer_text TEXT NOT NULL DEFAULT '',\n      svg_markup TEXT NOT NULL DEFAULT '',\n      verified INTEGER NOT NULL DEFAULT 0,\n      client_ip TEXT DEFAULT '127.0.0.1',\n      expires_at TEXT NOT NULL,\n      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))\n    )",
    "CREATE TABLE sql_audit_logs (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      trace_id TEXT NOT NULL,\n      fn_name TEXT NOT NULL,\n      http_method TEXT NOT NULL,\n      endpoint TEXT NOT NULL,\n      sql_text TEXT NOT NULL,\n      rows_affected INTEGER DEFAULT 1,\n      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))\n    )",
    "CREATE TABLE staff_course_qualifications(id TEXT PRIMARY KEY,institution_id TEXT NOT NULL,appointment_id TEXT NOT NULL,subject_id TEXT NOT NULL,course_id TEXT NOT NULL,\n    starts_on TEXT NOT NULL CHECK(date(starts_on) IS NOT NULL AND date(starts_on)=starts_on),ends_on TEXT CHECK(ends_on IS NULL OR (date(ends_on) IS NOT NULL AND date(ends_on)=ends_on AND ends_on>=starts_on)),status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','revoked')),version INTEGER NOT NULL DEFAULT 1,\n    FOREIGN KEY(appointment_id,institution_id) REFERENCES identity_appointments(id,institution_id),FOREIGN KEY(subject_id,institution_id,course_id) REFERENCES subject_courses(subject_id,institution_id,course_id))",
    `CREATE TABLE "student_profiles" (
      id TEXT PRIMARY KEY,
      student_no TEXT NOT NULL UNIQUE,
      short_no TEXT NOT NULL,
      full_name TEXT NOT NULL,
      avatar_char TEXT NOT NULL,
      avatar_url TEXT,
      class_id TEXT NOT NULL,
      role_badge TEXT DEFAULT '',
      rank_label TEXT DEFAULT '',
      tag_label TEXT DEFAULT '',
      badge_type TEXT DEFAULT '',
      trend_text TEXT DEFAULT '',
      trend_dir TEXT DEFAULT 'up',
      daily_status TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      tag_category TEXT NOT NULL DEFAULT 'focus',
      radar_classical REAL NOT NULL DEFAULT 90,
      radar_modern REAL NOT NULL DEFAULT 90,
      radar_writing REAL NOT NULL DEFAULT 90,
      radar_poetry REAL NOT NULL DEFAULT 90,
      radar_basics REAL NOT NULL DEFAULT 90,
      composite_score REAL NOT NULL DEFAULT 90,
      strength_module TEXT DEFAULT '',
      potential_module TEXT DEFAULT '',
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    , archived_at TEXT, version INTEGER NOT NULL DEFAULT 1, FOREIGN KEY (class_id) REFERENCES academic_classes(id) ON DELETE RESTRICT
)`,
    "CREATE TABLE subject_courses(institution_id TEXT NOT NULL,subject_id TEXT NOT NULL,course_id TEXT NOT NULL REFERENCES courses(id),PRIMARY KEY(subject_id,course_id),UNIQUE(subject_id,institution_id,course_id),FOREIGN KEY(subject_id,institution_id) REFERENCES school_subjects(id,institution_id))",
    'CREATE TABLE "teaching_assignments" (\n      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),\n      teacher_id TEXT NOT NULL REFERENCES faculty_users(id), class_id TEXT NOT NULL REFERENCES academic_classes(id),\n      course_id TEXT NOT NULL REFERENCES courses(id), term_id TEXT NOT NULL REFERENCES academic_terms(id),\n      archived_at TEXT, version INTEGER NOT NULL DEFAULT 1, UNIQUE(teacher_id,class_id,course_id,term_id)\n    )',
    `CREATE TABLE "timetable_schedules" (
      id TEXT PRIMARY KEY,
      semester TEXT NOT NULL DEFAULT '2024-SPRING',
      week_num INTEGER NOT NULL DEFAULT 12,
      day_of_week INTEGER NOT NULL,
      period_id TEXT NOT NULL,
      period_name TEXT NOT NULL,
      time_range TEXT NOT NULL,
      teacher_id TEXT NOT NULL,
      class_group TEXT NOT NULL DEFAULT 'both',
      course_title TEXT NOT NULL,
      course_subtitle TEXT DEFAULT '',
      room_name TEXT NOT NULL,
      tag_label TEXT NOT NULL,
      card_type TEXT NOT NULL DEFAULT 'chinese-main',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    , FOREIGN KEY (teacher_id) REFERENCES faculty_users(id) ON DELETE RESTRICT, CHECK (day_of_week BETWEEN 1 AND 7)
)`,
    "CREATE TRIGGER account_person_immutable BEFORE UPDATE ON person_account_links BEGIN SELECT RAISE(ABORT,'account person links require a reviewed migration to change'); END",
    "CREATE TRIGGER account_person_keep BEFORE DELETE ON person_account_links BEGIN SELECT RAISE(ABORT,'retain account person history'); END",
    "CREATE TRIGGER appointment_definition_immutable BEFORE UPDATE OF identity_id,position_id,institution_id ON identity_appointments WHEN NEW.identity_id<>OLD.identity_id OR NEW.position_id<>OLD.position_id OR NEW.institution_id<>OLD.institution_id BEGIN SELECT RAISE(ABORT,'appointment definition is immutable'); END",
    "CREATE TRIGGER appointment_role_insert BEFORE INSERT ON identity_appointments BEGIN\n SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_registry i JOIN organization_positions p ON p.id=NEW.position_id AND p.institution_id=NEW.institution_id JOIN identity_roles r ON r.code=p.role_code JOIN organization_units u ON u.id=p.unit_id WHERE i.id=NEW.identity_id AND i.institution_id=NEW.institution_id AND i.identity_kind=r.identity_kind AND (NEW.status<>'active' OR (i.status='active' AND u.status='active'))) THEN RAISE(ABORT,'identity does not match position role') END; END",
    "CREATE TRIGGER appointment_role_update BEFORE UPDATE ON identity_appointments BEGIN\n SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_registry i JOIN organization_positions p ON p.id=NEW.position_id AND p.institution_id=NEW.institution_id JOIN identity_roles r ON r.code=p.role_code JOIN organization_units u ON u.id=p.unit_id WHERE i.id=NEW.identity_id AND i.institution_id=NEW.institution_id AND i.identity_kind=r.identity_kind AND (NEW.status<>'active' OR (i.status='active' AND u.status='active'))) THEN RAISE(ABORT,'identity does not match position role') END; END",
    "CREATE TRIGGER binding_identity_insert BEFORE INSERT ON identity_object_bindings BEGIN\n SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_registry i JOIN identity_objects o ON o.id=NEW.object_id AND o.institution_id=NEW.institution_id WHERE i.id=NEW.identity_id AND i.institution_id=NEW.institution_id AND (NEW.status<>'confirmed' OR i.status='active') AND\n ((NEW.relation='guardian_of' AND i.identity_kind='guardian' AND o.object_kind='student') OR (NEW.relation='self_record' AND i.identity_kind='student' AND o.object_kind='student' AND o.owner_identity_id=i.id) OR (NEW.relation IN ('teaches','mentors','counsels') AND i.identity_kind='staff') OR NEW.relation IN ('member','reports_to')))\n THEN RAISE(ABORT,'binding identity or object kind mismatch') END;\n SELECT CASE WHEN NEW.status='confirmed' AND NOT EXISTS(SELECT 1 FROM identity_objects o WHERE o.id=NEW.object_id AND o.owner_identity_id=NEW.created_by AND NEW.confirmed_by=NEW.identity_id) THEN RAISE(ABORT,'object owner and recipient must confirm binding') END; END",
    "CREATE TRIGGER binding_identity_update BEFORE UPDATE ON identity_object_bindings BEGIN\n SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_registry i JOIN identity_objects o ON o.id=NEW.object_id AND o.institution_id=NEW.institution_id WHERE i.id=NEW.identity_id AND i.institution_id=NEW.institution_id AND (NEW.status<>'confirmed' OR i.status='active') AND\n ((NEW.relation='guardian_of' AND i.identity_kind='guardian' AND o.object_kind='student') OR (NEW.relation='self_record' AND i.identity_kind='student' AND o.object_kind='student' AND o.owner_identity_id=i.id) OR (NEW.relation IN ('teaches','mentors','counsels') AND i.identity_kind='staff') OR NEW.relation IN ('member','reports_to')))\n THEN RAISE(ABORT,'binding identity or object kind mismatch') END;\n SELECT CASE WHEN NEW.status='confirmed' AND NOT EXISTS(SELECT 1 FROM identity_objects o WHERE o.id=NEW.object_id AND o.owner_identity_id=NEW.created_by AND NEW.confirmed_by=NEW.identity_id) THEN RAISE(ABORT,'object owner and recipient must confirm binding') END; END",
    "CREATE TRIGGER class_org_insert BEFORE INSERT ON organization_class_links BEGIN SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM organization_unit_profiles p JOIN organization_units u ON u.id=p.unit_id WHERE p.unit_id=NEW.unit_id AND p.institution_id=NEW.institution_id AND p.unit_type IN ('homeroom','class') AND u.status='active') THEN RAISE(ABORT,'academic class must bind to a homeroom unit') END; END",
    "CREATE TRIGGER class_org_update BEFORE UPDATE ON organization_class_links BEGIN SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM organization_unit_profiles p JOIN organization_units u ON u.id=p.unit_id WHERE p.unit_id=NEW.unit_id AND p.institution_id=NEW.institution_id AND p.unit_type IN ('homeroom','class') AND u.status='active') THEN RAISE(ABORT,'academic class must bind to a homeroom unit') END; END",
    "CREATE INDEX faculty_class_default_class ON faculty_class_defaults(class_id)",
    "CREATE TRIGGER homeroom_role_insert BEFORE INSERT ON identity_appointments WHEN NEW.status='active' BEGIN\n    SELECT CASE WHEN EXISTS(SELECT 1 FROM organization_positions p WHERE p.id=NEW.position_id AND p.role_code='homeroom_teacher' AND NOT EXISTS(SELECT 1 FROM organization_units u LEFT JOIN organization_unit_profiles f ON f.unit_id=u.id WHERE u.id=p.unit_id AND COALESCE(f.unit_type,u.kind) IN ('homeroom','class'))) THEN RAISE(ABORT,'homeroom teacher requires a class unit') END;\n    SELECT CASE WHEN EXISTS(SELECT 1 FROM organization_positions p WHERE p.id=NEW.position_id AND p.role_code='subject_member' AND NOT EXISTS(SELECT 1 FROM organization_unit_profiles f WHERE f.unit_id=p.unit_id AND f.unit_type='subject_group')) THEN RAISE(ABORT,'subject member requires a subject group') END;\n    SELECT CASE WHEN EXISTS(SELECT 1 FROM organization_positions p JOIN organization_positions q ON q.unit_id=p.unit_id AND q.role_code='homeroom_teacher' JOIN identity_appointments a ON a.position_id=q.id WHERE p.id=NEW.position_id AND p.role_code='homeroom_teacher' AND a.id<>NEW.id AND a.status='active' AND a.starts_on<=COALESCE(NEW.ends_on,'9999-12-31') AND NEW.starts_on<=COALESCE(a.ends_on,'9999-12-31')) THEN RAISE(ABORT,'overlapping primary homeroom teacher appointments') END;\n    END",
    "CREATE TRIGGER homeroom_role_update BEFORE UPDATE ON identity_appointments WHEN NEW.status='active' BEGIN\n    SELECT CASE WHEN EXISTS(SELECT 1 FROM organization_positions p WHERE p.id=NEW.position_id AND p.role_code='homeroom_teacher' AND NOT EXISTS(SELECT 1 FROM organization_units u LEFT JOIN organization_unit_profiles f ON f.unit_id=u.id WHERE u.id=p.unit_id AND COALESCE(f.unit_type,u.kind) IN ('homeroom','class'))) THEN RAISE(ABORT,'homeroom teacher requires a class unit') END;\n    SELECT CASE WHEN EXISTS(SELECT 1 FROM organization_positions p WHERE p.id=NEW.position_id AND p.role_code='subject_member' AND NOT EXISTS(SELECT 1 FROM organization_unit_profiles f WHERE f.unit_id=p.unit_id AND f.unit_type='subject_group')) THEN RAISE(ABORT,'subject member requires a subject group') END;\n    SELECT CASE WHEN EXISTS(SELECT 1 FROM organization_positions p JOIN organization_positions q ON q.unit_id=p.unit_id AND q.role_code='homeroom_teacher' JOIN identity_appointments a ON a.position_id=q.id WHERE p.id=NEW.position_id AND p.role_code='homeroom_teacher' AND a.id<>NEW.id AND a.status='active' AND a.starts_on<=COALESCE(NEW.ends_on,'9999-12-31') AND NEW.starts_on<=COALESCE(a.ends_on,'9999-12-31')) THEN RAISE(ABORT,'overlapping primary homeroom teacher appointments') END;\n    END",
    "CREATE TRIGGER identity_account_immutable BEFORE UPDATE OF account_id ON identity_registry WHEN NEW.account_id IS NOT OLD.account_id AND EXISTS(SELECT 1 FROM identity_person_links WHERE identity_id=OLD.id) BEGIN SELECT RAISE(ABORT,'linked identity account cannot be replaced'); END",
    "CREATE UNIQUE INDEX identity_active_position ON identity_appointments(identity_id,position_id) WHERE status='active'",
    "CREATE INDEX identity_appointments_scope ON identity_appointments(institution_id,identity_id,status)",
    "CREATE INDEX identity_bindings_object ON identity_object_bindings(institution_id,object_id,status)",
    "CREATE TRIGGER identity_number_immutable BEFORE UPDATE OF institution_id,identity_kind,external_id ON identity_registry\n WHEN NEW.institution_id<>OLD.institution_id OR NEW.identity_kind<>OLD.identity_kind OR NEW.external_id<>OLD.external_id\n BEGIN SELECT RAISE(ABORT,'identity composite number is immutable'); END",
    "CREATE TRIGGER identity_person_immutable BEFORE UPDATE ON identity_person_links BEGIN SELECT RAISE(ABORT,'person identity links require a reviewed migration to change'); END",
    "CREATE TRIGGER identity_person_keep BEFORE DELETE ON identity_person_links BEGIN SELECT RAISE(ABORT,'retain identity person history'); END",
    "CREATE TRIGGER identity_person_scope BEFORE INSERT ON identity_person_links BEGIN SELECT CASE WHEN EXISTS(SELECT 1 FROM identity_registry i WHERE i.id=NEW.identity_id AND i.account_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM person_account_links a WHERE a.institution_id=i.institution_id AND a.account_id=i.account_id AND a.person_id=NEW.person_id)) THEN RAISE(ABORT,'identity person does not match linked account') END; END",
    "CREATE INDEX idx_assignment_class ON homework_assignments(class_id)",
    "CREATE INDEX idx_audit_trace ON sql_audit_logs(trace_id)",
    "CREATE INDEX idx_care_messages_thread ON care_messages(thread_id,sequence)",
    "CREATE INDEX idx_enrollment_class ON class_enrollments(class_id,term_id)",
    "CREATE INDEX idx_exam_class_date ON exam_analytics_batches(class_id,exam_date)",
    "CREATE INDEX idx_homework_history_submission ON homework_history(submission_id,created_at)",
    "CREATE INDEX idx_journal_student ON coaching_journals(student_id,created_at)",
    "CREATE INDEX idx_login_account_time ON login_attempts(account,attempted_at)",
    "CREATE INDEX idx_message_thread ON home_school_messages(thread_id,created_at,id)",
    "CREATE INDEX idx_notifications_user ON business_notifications(user_id,available_at,read_at)",
    "CREATE INDEX idx_schedule_lesson ON schedule_entries(lesson_id)",
    "CREATE INDEX idx_schedule_teacher_week ON timetable_schedules(teacher_id,semester,week_num,day_of_week,period_id)",
    "CREATE INDEX idx_schedule_time ON schedule_entries(starts_at,ends_at)",
    "CREATE INDEX idx_sessions_user_expiry ON auth_sessions(user_id,expires_at)",
    "CREATE INDEX idx_student_class_category ON student_profiles(class_id,tag_category)",
    "CREATE INDEX idx_submission_assignment_status ON homework_submissions(assignment_id,status,submitted_at,id)",
    "CREATE UNIQUE INDEX idx_submission_assignment_student ON homework_submissions(assignment_id,student_id)",
    "CREATE INDEX idx_submission_student ON homework_submissions(student_id)",
    "CREATE INDEX idx_teaching_class ON teaching_assignments(class_id,teacher_id)",
    "CREATE INDEX idx_thread_student ON home_school_threads(student_id)",
    "CREATE TRIGGER org_profile_immutable BEFORE UPDATE ON organization_unit_profiles BEGIN SELECT RAISE(ABORT,'create a new organization definition instead of rewriting history'); END",
    "CREATE TRIGGER org_profile_insert BEFORE INSERT ON organization_unit_profiles BEGIN\n    SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM organization_units u JOIN organization_unit_types t ON t.code=NEW.unit_type WHERE u.id=NEW.unit_id AND u.institution_id=NEW.institution_id AND u.kind=t.structural_kind) THEN RAISE(ABORT,'organization type does not match structural kind') END;\n    SELECT CASE WHEN EXISTS(SELECT 1 FROM organization_units u WHERE u.id=NEW.unit_id AND u.parent_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM organization_units p LEFT JOIN organization_unit_profiles f ON f.unit_id=p.id JOIN organization_parent_rules r ON r.parent_type=COALESCE(f.unit_type,p.kind) AND r.child_type=NEW.unit_type WHERE p.id=u.parent_id AND p.status='active')) THEN RAISE(ABORT,'invalid semantic organization parent') END;\n    END",
    "CREATE TRIGGER org_profile_keep BEFORE DELETE ON organization_unit_profiles BEGIN SELECT RAISE(ABORT,'organization profiles must be retained'); END",
    "CREATE UNIQUE INDEX organization_one_root ON organization_units(institution_id) WHERE parent_id IS NULL",
    "CREATE TRIGGER organization_parent_immutable BEFORE UPDATE OF parent_id ON organization_units WHEN NEW.parent_id IS NOT OLD.parent_id BEGIN SELECT RAISE(ABORT,'create a new organization unit to change its parent'); END",
    "CREATE TRIGGER organization_parent_insert BEFORE INSERT ON organization_units WHEN NEW.parent_id IS NOT NULL BEGIN\n SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM organization_units p WHERE p.id=NEW.parent_id AND p.institution_id=NEW.institution_id AND p.status='active' AND\n ((NEW.kind='campus' AND p.kind='school') OR (NEW.kind IN ('division','department','grade') AND p.kind IN ('school','campus','division')) OR (NEW.kind='class' AND p.kind='grade') OR (NEW.kind='group' AND p.kind IN ('department','class')))) THEN RAISE(ABORT,'invalid organization parent') END;\n SELECT CASE WHEN EXISTS(WITH RECURSIVE ancestors(id) AS (SELECT NEW.parent_id UNION SELECT u.parent_id FROM organization_units u JOIN ancestors a ON u.id=a.id WHERE u.parent_id IS NOT NULL) SELECT 1 FROM ancestors WHERE id=NEW.id) THEN RAISE(ABORT,'organization hierarchy cycle') END; END",
    "CREATE TRIGGER organization_parent_update BEFORE UPDATE ON organization_units WHEN NEW.parent_id IS NOT NULL BEGIN\n SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM organization_units p WHERE p.id=NEW.parent_id AND p.institution_id=NEW.institution_id AND p.status='active' AND\n ((NEW.kind='campus' AND p.kind='school') OR (NEW.kind IN ('division','department','grade') AND p.kind IN ('school','campus','division')) OR (NEW.kind='class' AND p.kind='grade') OR (NEW.kind='group' AND p.kind IN ('department','class')))) THEN RAISE(ABORT,'invalid organization parent') END;\n SELECT CASE WHEN EXISTS(WITH RECURSIVE ancestors(id) AS (SELECT NEW.parent_id UNION SELECT u.parent_id FROM organization_units u JOIN ancestors a ON u.id=a.id WHERE u.parent_id IS NOT NULL) SELECT 1 FROM ancestors WHERE id=NEW.id) THEN RAISE(ABORT,'organization hierarchy cycle') END; END",
    "CREATE TRIGGER organization_scope_immutable BEFORE UPDATE OF institution_id,kind ON organization_units WHEN NEW.institution_id<>OLD.institution_id OR NEW.kind<>OLD.kind BEGIN SELECT RAISE(ABORT,'organization scope and kind are immutable'); END",
    "CREATE INDEX people_identity_scope ON identity_person_links(institution_id,person_id)",
    "CREATE TRIGGER person_account_scope BEFORE INSERT ON person_account_links BEGIN SELECT CASE WHEN EXISTS(SELECT 1 FROM identity_person_links p JOIN identity_registry i ON i.id=p.identity_id WHERE i.institution_id=NEW.institution_id AND i.account_id=NEW.account_id AND p.person_id<>NEW.person_id) THEN RAISE(ABORT,'account already belongs to another person') END; END",
    "CREATE TRIGGER position_definition_immutable BEFORE UPDATE OF institution_id,unit_id,role_code,hierarchy_level ON organization_positions WHEN NEW.institution_id<>OLD.institution_id OR NEW.unit_id<>OLD.unit_id OR NEW.role_code<>OLD.role_code OR NEW.hierarchy_level<>OLD.hierarchy_level BEGIN SELECT RAISE(ABORT,'position definition is immutable'); END",
    "CREATE TRIGGER qualification_insert BEFORE INSERT ON staff_course_qualifications BEGIN SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_appointments a JOIN organization_unit_profiles p ON p.unit_id=(SELECT unit_id FROM organization_positions WHERE id=a.position_id) WHERE a.id=NEW.appointment_id AND a.institution_id=NEW.institution_id AND p.unit_type='subject_group' AND p.subject_id=NEW.subject_id) THEN RAISE(ABORT,'qualification must match the appointed subject group') END; END",
    "CREATE UNIQUE INDEX qualification_one_active ON staff_course_qualifications(appointment_id,course_id) WHERE status='active'",
    "CREATE INDEX qualification_scope ON staff_course_qualifications(institution_id,course_id,status)",
    "CREATE TRIGGER qualification_update BEFORE UPDATE ON staff_course_qualifications BEGIN SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_appointments a JOIN organization_unit_profiles p ON p.unit_id=(SELECT unit_id FROM organization_positions WHERE id=a.position_id) WHERE a.id=NEW.appointment_id AND a.institution_id=NEW.institution_id AND p.unit_type='subject_group' AND p.subject_id=NEW.subject_id) THEN RAISE(ABORT,'qualification must match the appointed subject group') END; END",
    "CREATE TRIGGER reporting_cycle_insert BEFORE INSERT ON identity_reporting_lines WHEN NEW.status='active' BEGIN\n SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_appointments a JOIN identity_appointments b ON b.id=NEW.supervisor_id JOIN identity_registry i ON i.id=a.identity_id JOIN identity_registry j ON j.id=b.identity_id WHERE a.id=NEW.subordinate_id AND a.institution_id=NEW.institution_id AND b.institution_id=NEW.institution_id AND a.status='active' AND b.status='active' AND i.status='active' AND j.status='active' AND i.identity_kind='staff' AND j.identity_kind='staff' AND a.identity_id<>b.identity_id) THEN RAISE(ABORT,'invalid active reporting identities') END;\n SELECT CASE WHEN EXISTS(WITH RECURSIVE chain(id) AS (SELECT NEW.supervisor_id UNION SELECT r.supervisor_id FROM identity_reporting_lines r JOIN chain c ON r.subordinate_id=c.id WHERE r.status='active' AND r.id<>NEW.id) SELECT 1 FROM chain WHERE id=NEW.subordinate_id) THEN RAISE(ABORT,'reporting hierarchy cycle') END; END",
    "CREATE TRIGGER reporting_cycle_update BEFORE UPDATE ON identity_reporting_lines WHEN NEW.status='active' BEGIN\n SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_appointments a JOIN identity_appointments b ON b.id=NEW.supervisor_id JOIN identity_registry i ON i.id=a.identity_id JOIN identity_registry j ON j.id=b.identity_id WHERE a.id=NEW.subordinate_id AND a.institution_id=NEW.institution_id AND b.institution_id=NEW.institution_id AND a.status='active' AND b.status='active' AND i.status='active' AND j.status='active' AND i.identity_kind='staff' AND j.identity_kind='staff' AND a.identity_id<>b.identity_id) THEN RAISE(ABORT,'invalid active reporting identities') END;\n SELECT CASE WHEN EXISTS(WITH RECURSIVE chain(id) AS (SELECT NEW.supervisor_id UNION SELECT r.supervisor_id FROM identity_reporting_lines r JOIN chain c ON r.subordinate_id=c.id WHERE r.status='active' AND r.id<>NEW.id) SELECT 1 FROM chain WHERE id=NEW.subordinate_id) THEN RAISE(ABORT,'reporting hierarchy cycle') END; END",
    "CREATE UNIQUE INDEX reporting_one_supervisor ON identity_reporting_lines(subordinate_id) WHERE status='active'",
    "CREATE TRIGGER reporting_person_insert BEFORE INSERT ON identity_reporting_lines WHEN NEW.status='active' BEGIN SELECT CASE WHEN EXISTS(SELECT 1 FROM identity_appointments a JOIN identity_appointments b ON b.id=NEW.supervisor_id JOIN identity_person_links x ON x.identity_id=a.identity_id JOIN identity_person_links y ON y.identity_id=b.identity_id WHERE a.id=NEW.subordinate_id AND x.institution_id=y.institution_id AND x.person_id=y.person_id) THEN RAISE(ABORT,'a person cannot supervise their other account') END; END",
    "CREATE TRIGGER reporting_person_update BEFORE UPDATE ON identity_reporting_lines WHEN NEW.status='active' BEGIN SELECT CASE WHEN EXISTS(SELECT 1 FROM identity_appointments a JOIN identity_appointments b ON b.id=NEW.supervisor_id JOIN identity_person_links x ON x.identity_id=a.identity_id JOIN identity_person_links y ON y.identity_id=b.identity_id WHERE a.id=NEW.subordinate_id AND x.institution_id=y.institution_id AND x.person_id=y.person_id) THEN RAISE(ABORT,'a person cannot supervise their other account') END; END",
    "CREATE TRIGGER reporting_scope_insert BEFORE INSERT ON identity_reporting_lines WHEN NEW.status='active' BEGIN\n SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_appointments a JOIN organization_positions p ON p.id=a.position_id JOIN identity_appointments b ON b.id=NEW.supervisor_id JOIN organization_positions q ON q.id=b.position_id WHERE a.id=NEW.subordinate_id AND q.hierarchy_level<p.hierarchy_level AND q.unit_id IN (WITH RECURSIVE ancestors(id) AS (SELECT p.unit_id UNION SELECT u.parent_id FROM organization_units u JOIN ancestors x ON u.id=x.id WHERE u.parent_id IS NOT NULL) SELECT id FROM ancestors)) THEN RAISE(ABORT,'supervisor must be higher in the organization hierarchy') END; END",
    "CREATE TRIGGER reporting_scope_update BEFORE UPDATE ON identity_reporting_lines WHEN NEW.status='active' BEGIN\n SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_appointments a JOIN organization_positions p ON p.id=a.position_id JOIN identity_appointments b ON b.id=NEW.supervisor_id JOIN organization_positions q ON q.id=b.position_id WHERE a.id=NEW.subordinate_id AND q.hierarchy_level<p.hierarchy_level AND q.unit_id IN (WITH RECURSIVE ancestors(id) AS (SELECT p.unit_id UNION SELECT u.parent_id FROM organization_units u JOIN ancestors x ON u.id=x.id WHERE u.parent_id IS NOT NULL) SELECT id FROM ancestors)) THEN RAISE(ABORT,'supervisor must be higher in the organization hierarchy') END; END",
    "CREATE TRIGGER role_kind_immutable BEFORE UPDATE OF identity_kind ON identity_roles WHEN NEW.identity_kind<>OLD.identity_kind BEGIN SELECT RAISE(ABORT,'role kind is immutable'); END",
    "CREATE INDEX schedule_scope_unit ON schedule_entry_scopes(unit_id)",
    "CREATE INDEX schedule_submission_owner ON schedule_submissions(owner_id,starts_at)",
    "CREATE INDEX schedule_submission_unit ON schedule_submissions(unit_id,status,starts_at)",
    "CREATE INDEX schedule_task_pool_owner ON schedule_task_pool(owner_id,status,updated_at)"
  ],
  ledger: [
    {
      version: 1,
      name: "relational-foundation",
      checksum: "4107a885824aaeebbd41da436b7617c2b5d86e6eb134f0b29a4e33b9bc9afb26"
    },
    {
      version: 2,
      name: "accounts-and-sessions",
      checksum: "ad551cfae14f3042d0c4358a18140ab5e827b0983de8d912419d30d9756e1763"
    },
    {
      version: 3,
      name: "academic-master-data",
      checksum: "0360fa82adac6ad56a692921f71cbaf6457cc8f7fccf759c7ced4d7df7c3bbd0"
    },
    {
      version: 4,
      name: "versioned-master-records",
      checksum: "c09379446e5483eaf45fefb80f39e20360e017230299d9e27eb7f4c5804d28c3"
    },
    {
      version: 5,
      name: "manual-homework-workflow",
      checksum: "3188dc40117cabfe05cb6f42c510fee9876c5bec9a710d7e27355cf75a877803"
    },
    {
      version: 6,
      name: "lesson-content-and-revisions",
      checksum: "554b59fe9c2f297ce97ac3103714b4623c3213cfb553ee82c442689cb526f8fc"
    },
    {
      version: 7,
      name: "schedule-approval-workflow",
      checksum: "3f483a3a5606bde773eb675059e0b45a6a6d7ec729999262107a088d84eba722"
    },
    {
      version: 8,
      name: "assessment-scores-and-imports",
      checksum: "dfb29220cd015e8df545b09b152b7554032710c103f6e076b615c400c8dd0cff"
    },
    {
      version: 9,
      name: "internal-care-records",
      checksum: "00746dafc69b3b044d8f6c29c731b35fb823ebd52cfbc539f2a1b3dc77a50f46"
    },
    {
      version: 10,
      name: "workspace-notifications",
      checksum: "f60b35b2aed0b7124d708cb680e22ba93c09c4065842046f65b65ff7b54baf70"
    },
    {
      version: 11,
      name: "lesson-schedule-links",
      checksum: "b8a7f852dab4322f2640fc040656817bbb2577cb62a2feb2687601acfe1ee9d4"
    },
    {
      version: 12,
      name: "identity-organization-object-bindings",
      checksum: "6e17a7a2ed7a90a2b686997a7e337472f4d3e2023e4a2723eefc6637fd4662b2"
    },
    {
      version: 13,
      name: "persistent-authentication-cooldowns",
      checksum: "502f523ec386e96994cc9c616a84dc0d45a68d14123fdfe1ca20cbe0498d25c2"
    },
    {
      version: 14,
      name: "department-schedule-submissions",
      checksum: "eccabf5bb085120508f4baee307008db4da4ca13a5495eac50fcab6be6414ff0"
    },
    {
      version: 15,
      name: "school-people-organization-multiple-appointments",
      checksum: "4f5637588704176a2fa4a826db68420a16905794c7a42844c6d8005c6b2c14bd"
    },
    {
      version: 16,
      name: "private-schedule-task-pool",
      checksum: "1910748368abdce6fb80c21dcbdd07dc6338c8480ab01597c6e9e9a7acbee05b"
    }
  ],
  checksum: "0c7e8c38d3dd0e0c3cfbaac3dac74314bb4bae490d476bf7801b9fd64d50716f"
};

// cloudflare/abSqliteDatabase.ts
var AbDurableSqlite = class {
  constructor(storage) {
    this.storage = storage;
    this.async = true;
    this.activeTransaction = new AsyncLocalStorage2();
  }
  static {
    __name(this, "AbDurableSqlite");
  }
  execute(sql, args = []) {
    try {
      return this.storage.sql.exec(sql, ...args.map(
        (value) => value === void 0 ? null : typeof value === "boolean" ? Number(value) : value
      )).toArray();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      const error = new Error(message);
      if (/UNIQUE constraint|PRIMARY KEY constraint/i.test(message))
        error.code = "SQLITE_CONSTRAINT_UNIQUE";
      else if (/FOREIGN KEY constraint/i.test(message))
        error.code = "SQLITE_CONSTRAINT_FOREIGNKEY";
      else if (/CHECK constraint/i.test(message))
        error.code = "SQLITE_CONSTRAINT_CHECK";
      else if (/NOT NULL constraint/i.test(message))
        error.code = "SQLITE_CONSTRAINT_NOTNULL";
      throw error;
    }
  }
  prepare(sql) {
    return {
      get: /* @__PURE__ */ __name(async (...args) => this.execute(sql, args)[0], "get"),
      all: /* @__PURE__ */ __name(async (...args) => this.execute(sql, args), "all"),
      run: /* @__PURE__ */ __name(async (...args) => {
        this.execute(sql, args);
        const stats = this.execute("SELECT changes() AS changes, last_insert_rowid() AS id")[0];
        return { changes: stats?.changes || 0, lastInsertRowid: stats?.id || 0 };
      }, "run")
    };
  }
  transaction(callback) {
    return async () => {
      if (this.activeTransaction.getStore()) return await callback();
      return await this.storage.transaction(
        async () => this.activeTransaction.run(true, callback)
      );
    };
  }
};
var expectedVersion = schema_default.sourceMigrationVersion;
var expectedTables = schema_default.tables.length;
function ensureAbSchema(storage) {
  const sql = storage.sql;
  const exists = sql.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'"
  ).toArray().length > 0;
  if (!exists) {
    storage.transactionSync(() => {
      for (const statement of schema_default.statements) sql.exec(statement);
      for (const migration2 of schema_default.ledger)
        sql.exec(
          "INSERT INTO schema_migrations(version,name,checksum) VALUES (?,?,?)",
          migration2.version,
          migration2.name,
          migration2.checksum
        );
    });
  }
  const migration = sql.exec(
    "SELECT COUNT(*) AS count, MAX(version) AS version FROM schema_migrations"
  ).one();
  const tables = sql.exec(
    "SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'"
  ).one().count;
  if (migration.count !== schema_default.ledger.length || migration.version !== expectedVersion || tables !== expectedTables)
    throw Error("AB SQLite migration drift: refusing to serve business requests");
  return {
    engine: "SQLite",
    driver: "Durable Object SQL",
    version: expectedVersion,
    migrations: migration.count,
    tables,
    ready: true
  };
}
__name(ensureAbSchema, "ensureAbSchema");

// cloudflare/security.ts
import { randomUUID as randomUUID15 } from "node:crypto";
function secureRequest(request) {
  const url = new URL(request.url), headers = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  };
  if (Array.from(url.searchParams.keys()).some(
    (name) => /^(password|password_hash|confirmPassword|secret|token|access_token|refresh_token|csrfToken|captchaAnswer|TIDB_DATABASE_URL)$/i.test(
      name
    )
  ))
    return Response.json(
      {
        code: 400,
        success: false,
        data: null,
        message: "\u654F\u611F\u51ED\u636E\u4E0D\u80FD\u653E\u5728\u7F51\u5740\u4E2D",
        traceId: randomUUID15()
      },
      { status: 400, headers }
    );
  if (url.protocol !== "https:") {
    if (request.method === "GET" || request.method === "HEAD") {
      url.protocol = "https:";
      return new Response(null, {
        status: 308,
        headers: { ...headers, Location: url.href }
      });
    }
    return Response.json(
      {
        code: 400,
        success: false,
        data: null,
        message: "\u8BA4\u8BC1\u548C\u63D0\u4EA4\u64CD\u4F5C\u5FC5\u987B\u4F7F\u7528 HTTPS",
        traceId: randomUUID15()
      },
      { status: 400, headers }
    );
  }
  return null;
}
__name(secureRequest, "secureRequest");
function secureResponse(response) {
  const headers = new Headers(response.headers);
  headers.set("Strict-Transport-Security", "max-age=31536000");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
__name(secureResponse, "secureResponse");

// package.json
var package_default = {
  name: "sakura-dashboard",
  private: true,
  version: "1.0.2-sakura",
  description: "SakuraEdu: school organization, teaching workflows and scoped scheduling on Cloudflare Workers and TiDB.",
  license: "MIT",
  repository: { type: "git", url: "git+https://github.com/yanyu03/Sakura_DashBoard.git" },
  engines: { node: ">=22.12.0" },
  type: "module",
  scripts: {
    dev: "tsx scripts/dev-standard.ts",
    "dev:portfolio": "tsx scripts/dev-portfolio.ts",
    "dev:legacy": "tsx server.ts",
    "dev:standard": "tsx scripts/dev-standard.ts",
    start: "tsx server.ts",
    build: "vite build",
    preview: "vite preview",
    clean: "rm -rf dist server.js",
    lint: "tsc --noEmit",
    "docs:check": "node scripts/verify-docs.mjs",
    "version:check": "node scripts/verify-version.mjs",
    "test:local": "node scripts/verify-local.mjs",
    "test:preview": "tsx scripts/verify-local-preview.ts",
    "test:sqlite": "tsx scripts/verify-sqlite.ts",
    "test:migrations": "tsx scripts/verify-migrations.ts",
    "baseline:business": "tsx scripts/create-business-baseline.ts",
    "cf:types": "wrangler types --strict-vars=false",
    "cf:check": "npm run cf:types && tsc --noEmit -p cloudflare/tsconfig.json",
    "cf:dev": "wrangler dev",
    "cf:deploy": "npm run build && npm run cf:check && wrangler deploy",
    "test:cloudflare": "tsx scripts/verify-cloudflare.ts",
    "test:auth": "tsx scripts/verify-auth-registration.ts",
    "test:security-hardening": "tsx scripts/verify-security-hardening.ts",
    "test:cf-security": "tsx scripts/verify-cf-security.ts",
    "test:hierarchy": "tsx scripts/verify-identity-hierarchy.ts",
    "test:protection": "tsx scripts/verify-auth-protection.ts",
    "test:reliability": "tsx scripts/verify-auth-reliability.ts",
    "test:schedule-sharing": "tsx scripts/verify-schedule-sharing.ts",
    "test:schedule-workers": "tsx scripts/verify-schedule-sharing-workers.ts",
    "test:organization": "tsx scripts/verify-organization.ts",
    "test:organization-workers": "tsx scripts/verify-organization-workers.ts",
    "test:tidb": "tsx scripts/verify-tidb.ts",
    "test:tidb-reliability": "tsx scripts/verify-tidb-reliability.ts",
    "test:tidb-read-compatibility": "tsx scripts/verify-tidb-read-compatibility.ts",
    "test:first-registration": "tsx scripts/verify-first-registration.ts",
    "test:tidb-functions": "tsx scripts/verify-tidb-functions.ts"
  },
  dependencies: {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.3.3",
    "@tidbcloud/serverless": "0.3.0",
    "@vitejs/plugin-react": "^6.1.1",
    "better-sqlite3": "^13.0.3",
    dotenv: "^17.2.3",
    express: "^4.21.2",
    "lucide-react": "^0.546.0",
    motion: "^12.23.24",
    mysql2: "^3.24.6",
    react: "^19.0.1",
    "react-dom": "^19.0.1",
    "svg-captcha": "^1.4.0",
    vite: "^8.3.0"
  },
  devDependencies: {
    "@types/better-sqlite3": "^9.6.0",
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    autoprefixer: "^10.4.21",
    esbuild: "^0.28.2",
    tailwindcss: "^4.3.3",
    tsx: "^4.21.0",
    typescript: "^7.0.2",
    wrangler: "^4.153.0"
  }
};

// app-version.ts
var APP_VERSION = package_default.version;
var DESIGN_STANDARD_VERSION = "1.0Sakura";
var API_VERSION = "v1";
var VERSION_INFO = Object.freeze({
  name: "SakuraEdu",
  version: APP_VERSION,
  designStandard: DESIGN_STANDARD_VERSION,
  apiVersion: API_VERSION
});

// cloudflare/abWorker.ts
var responses = {
  headers: { "Cache-Control": "no-store", "X-Sakura-Database": "SQLite" },
  reply(status, data, message) {
    return Response.json({
      code: status,
      success: status === 200,
      data,
      message,
      traceId: randomUUID16(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }, { status, headers: this.headers });
  }
};
var SakuraAbSchool = class extends DurableObject {
  static {
    __name(this, "SakuraAbSchool");
  }
  constructor(state, env) {
    super(state, env);
    this.db = new AbDurableSqlite(state.storage);
    state.blockConcurrencyWhile(async () => {
      this.schemaStatus = ensureAbSchema(state.storage);
    });
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/api/v1/health/sqlite") {
      if (request.method !== "GET") return responses.reply(405, null, "\u4EC5\u652F\u6301 GET");
      return responses.reply(200, {
        ...this.schemaStatus,
        database: "SQLite",
        driver: "Durable Object SQLite",
        isolated: true,
        businessApiEnabled: true,
        readOnly: false
      }, "AB SQLite \u6D4B\u8BD5\u670D\u6570\u636E\u5E93\u5DF2\u8FDE\u63A5");
    }
    const app = createApplication(
      this.db,
      edgeCaptcha,
      true,
      false,
      passwordPolicyFromSecret(this.env.AB_PASSWORD_PEPPERS),
      "SQLite"
    );
    const server = createServer(app);
    try {
      server.listen(0);
      const address = server.address();
      if (!address || typeof address === "string")
        throw Error("AB Node HTTP adapter unavailable");
      return await handleAsNodeRequest(address.port, request);
    } finally {
      server.close();
    }
  }
};
var authPaths = /* @__PURE__ */ new Set([
  "/api/v1/auth/faculty-login",
  "/api/v1/auth/register",
  "/api/v1/security/captcha"
]);
var gateway = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/__ab/status") {
      if (request.method !== "GET") return responses.reply(405, null, "\u4EC5\u652F\u6301 GET");
      return responses.reply(200, {
        worker: "sakura-dashboard-ab",
        database: "SQLite",
        driver: "Durable Object SQLite",
        stage: "full-business-preview",
        isolatedFromProduction: true,
        sourceDatabase: "AB-only Durable Object"
      }, "AB SQLite \u6D4B\u8BD5\u670D\u8FD0\u884C\u4E2D");
    }
    if (url.pathname === "/api/v1/meta/version") {
      if (request.method !== "GET") return responses.reply(405, null, "\u4EC5\u652F\u6301 GET");
      return responses.reply(200, {
        ...VERSION_INFO,
        database: "SQLite",
        environment: "AB preview"
      }, "AB \u6D4B\u8BD5\u670D\u7248\u672C\u4FE1\u606F");
    }
    if (url.pathname === "/api/v1/health/tidb")
      return responses.reply(410, null, "AB \u4E0D\u4F7F\u7528 TiDB\uFF0C\u8BF7\u6539\u7528 /api/v1/health/sqlite");
    if (url.pathname.startsWith("/api/")) {
      if (env.DATABASE_MODE !== "sqlite")
        return responses.reply(503, null, "AB SQLite \u6570\u636E\u5E93\u914D\u7F6E\u9519\u8BEF");
      if (authPaths.has(url.pathname)) {
        const ip = request.headers.get("CF-Connecting-IP") || "unknown";
        const limiter = await env.AUTH_LIMITER.limit({ key: "ab:" + ip });
        if (!limiter.success) return responses.reply(429, null, "\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");
      }
      const stub = env.SCHOOL_AB.get(env.SCHOOL_AB.idFromName("sakura-ab-sqlite-v1"));
      return await stub.fetch(request);
    }
    if (url.pathname === "/" && !url.searchParams.has("design")) {
      url.searchParams.set("design", "1.0Sakura");
      return Response.redirect(url.toString(), 302);
    }
    return env.ASSETS.fetch(request);
  }
};
var abWorker_default = {
  async fetch(request, env) {
    try {
      return secureResponse(secureRequest(request) || await gateway.fetch(request, env));
    } catch (error) {
      console.error({
        event: "ab_sqlite_request_failed",
        name: error instanceof Error ? error.name : "UnknownError"
      });
      return secureResponse(responses.reply(503, null, "AB SQLite \u6D4B\u8BD5\u670D\u6682\u65F6\u4E0D\u53EF\u7528"));
    }
  }
};
export {
  SakuraAbSchool,
  abWorker_default as default
};
/*! Bundled license information:

depd/lib/browser/index.js:
  (*!
   * depd
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

bytes/index.js:
  (*!
   * bytes
   * Copyright(c) 2012-2014 TJ Holowaychuk
   * Copyright(c) 2015 Jed Watson
   * MIT Licensed
   *)

content-type/index.js:
  (*!
   * content-type
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

statuses/index.js:
  (*!
   * statuses
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2016 Douglas Christopher Wilson
   * MIT Licensed
   *)

toidentifier/index.js:
  (*!
   * toidentifier
   * Copyright(c) 2016 Douglas Christopher Wilson
   * MIT Licensed
   *)

http-errors/index.js:
  (*!
   * http-errors
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2016 Douglas Christopher Wilson
   * MIT Licensed
   *)

destroy/index.js:
  (*!
   * destroy
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015-2022 Douglas Christopher Wilson
   * MIT Licensed
   *)

unpipe/index.js:
  (*!
   * unpipe
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

raw-body/index.js:
  (*!
   * raw-body
   * Copyright(c) 2013-2014 Jonathan Ong
   * Copyright(c) 2014-2022 Douglas Christopher Wilson
   * MIT Licensed
   *)

ee-first/index.js:
  (*!
   * ee-first
   * Copyright(c) 2014 Jonathan Ong
   * MIT Licensed
   *)

on-finished/index.js:
  (*!
   * on-finished
   * Copyright(c) 2013 Jonathan Ong
   * Copyright(c) 2014 Douglas Christopher Wilson
   * MIT Licensed
   *)

body-parser/lib/read.js:
body-parser/lib/types/raw.js:
body-parser/lib/types/text.js:
body-parser/index.js:
  (*!
   * body-parser
   * Copyright(c) 2014-2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

media-typer/index.js:
  (*!
   * media-typer
   * Copyright(c) 2014 Douglas Christopher Wilson
   * MIT Licensed
   *)

mime-db/index.js:
  (*!
   * mime-db
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015-2022 Douglas Christopher Wilson
   * MIT Licensed
   *)

mime-types/index.js:
  (*!
   * mime-types
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

type-is/index.js:
  (*!
   * type-is
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2014-2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

body-parser/lib/types/json.js:
body-parser/lib/types/urlencoded.js:
  (*!
   * body-parser
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2014-2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

merge-descriptors/index.js:
  (*!
   * merge-descriptors
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

encodeurl/index.js:
  (*!
   * encodeurl
   * Copyright(c) 2016 Douglas Christopher Wilson
   * MIT Licensed
   *)

escape-html/index.js:
  (*!
   * escape-html
   * Copyright(c) 2012-2013 TJ Holowaychuk
   * Copyright(c) 2015 Andreas Lubbe
   * Copyright(c) 2015 Tiancheng "Timothy" Gu
   * MIT Licensed
   *)

parseurl/index.js:
  (*!
   * parseurl
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2014-2017 Douglas Christopher Wilson
   * MIT Licensed
   *)

finalhandler/index.js:
  (*!
   * finalhandler
   * Copyright(c) 2014-2022 Douglas Christopher Wilson
   * MIT Licensed
   *)

express/lib/router/layer.js:
express/lib/router/route.js:
express/lib/router/index.js:
express/lib/middleware/init.js:
express/lib/middleware/query.js:
express/lib/view.js:
express/lib/application.js:
express/lib/request.js:
express/lib/express.js:
express/index.js:
  (*!
   * express
   * Copyright(c) 2009-2013 TJ Holowaychuk
   * Copyright(c) 2013 Roman Shtylman
   * Copyright(c) 2014-2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

methods/index.js:
  (*!
   * methods
   * Copyright(c) 2013-2014 TJ Holowaychuk
   * Copyright(c) 2015-2016 Douglas Christopher Wilson
   * MIT Licensed
   *)

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

content-disposition/index.js:
  (*!
   * content-disposition
   * Copyright(c) 2014-2017 Douglas Christopher Wilson
   * MIT Licensed
   *)

etag/index.js:
  (*!
   * etag
   * Copyright(c) 2014-2016 Douglas Christopher Wilson
   * MIT Licensed
   *)

fresh/index.js:
  (*!
   * fresh
   * Copyright(c) 2012 TJ Holowaychuk
   * Copyright(c) 2016-2017 Douglas Christopher Wilson
   * MIT Licensed
   *)

range-parser/index.js:
  (*!
   * range-parser
   * Copyright(c) 2012-2014 TJ Holowaychuk
   * Copyright(c) 2015-2016 Douglas Christopher Wilson
   * MIT Licensed
   *)

send/index.js:
  (*!
   * send
   * Copyright(c) 2012 TJ Holowaychuk
   * Copyright(c) 2014-2022 Douglas Christopher Wilson
   * MIT Licensed
   *)

forwarded/index.js:
  (*!
   * forwarded
   * Copyright(c) 2014-2017 Douglas Christopher Wilson
   * MIT Licensed
   *)

proxy-addr/index.js:
  (*!
   * proxy-addr
   * Copyright(c) 2014-2016 Douglas Christopher Wilson
   * MIT Licensed
   *)

express/lib/utils.js:
express/lib/response.js:
  (*!
   * express
   * Copyright(c) 2009-2013 TJ Holowaychuk
   * Copyright(c) 2014-2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

negotiator/index.js:
  (*!
   * negotiator
   * Copyright(c) 2012 Federico Romero
   * Copyright(c) 2012-2014 Isaac Z. Schlueter
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

accepts/index.js:
  (*!
   * accepts
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

cookie/index.js:
  (*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

vary/index.js:
  (*!
   * vary
   * Copyright(c) 2014-2017 Douglas Christopher Wilson
   * MIT Licensed
   *)

serve-static/index.js:
  (*!
   * serve-static
   * Copyright(c) 2010 Sencha Inc.
   * Copyright(c) 2011 TJ Holowaychuk
   * Copyright(c) 2014-2016 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
//# sourceMappingURL=abWorker.js.map
