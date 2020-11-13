(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
// Limit dependencies to core Node modules. This means the code in this file has to be very low-level and unattractive,
// but simplifies things for the consumer of this module.
__webpack_require__(3);
__webpack_require__(4);
var http = __webpack_require__(5);
var path = __webpack_require__(0);
var ArgsUtil_1 = __webpack_require__(6);
// Webpack doesn't support dynamic requires for files not present at compile time, so grab a direct
// reference to Node's runtime 'require' function.
var dynamicRequire = eval('require');
var server = http.createServer(function (req, res) {
    debugger;
    readRequestBodyAsJson(req, function (bodyJson) {
        var hasSentResult = false;
        var callback = function (errorValue, successValue) {
            if (!hasSentResult) {
                hasSentResult = true;
                if (errorValue) {
                    respondWithError(res, errorValue);
                }
                else if (typeof successValue !== 'string') {
                    // Arbitrary object/number/etc - JSON-serialize it
                    var successValueJson = void 0;
                    try {
                        successValueJson = JSON.stringify(successValue);
                    }
                    catch (ex) {
                        // JSON serialization error - pass it back to .NET
                        respondWithError(res, ex);
                        return;
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.end(successValueJson);
                }
                else {
                    // String - can bypass JSON-serialization altogether
                    res.setHeader('Content-Type', 'text/plain');
                    res.end(successValue);
                }
            }
        };
        // Support streamed responses
        Object.defineProperty(callback, 'stream', {
            enumerable: true,
            get: function () {
                if (!hasSentResult) {
                    hasSentResult = true;
                    res.setHeader('Content-Type', 'application/octet-stream');
                }
                return res;
            }
        });
        try {
            var resolvedPath = path.resolve(process.cwd(), bodyJson.moduleName);
            var invokedModule = dynamicRequire(resolvedPath);
            var func = bodyJson.exportedFunctionName ? invokedModule[bodyJson.exportedFunctionName] : invokedModule;
            if (!func) {
                throw new Error('The module "' + resolvedPath + '" has no export named "' + bodyJson.exportedFunctionName + '"');
            }
            func.apply(null, [callback].concat(bodyJson.args));
        }
        catch (synchronousException) {
            callback(synchronousException, null);
        }
    });
});
var parsedArgs = ArgsUtil_1.parseArgs(process.argv);
var requestedPortOrZero = parsedArgs.port || 0; // 0 means 'let the OS decide'
server.listen(requestedPortOrZero, 'localhost', function () {
    var addressInfo = server.address();
    // Signal to HttpNodeHost which loopback IP address (IPv4 or IPv6) and port it should make its HTTP connections on
    console.log('[Microsoft.AspNetCore.NodeServices.HttpNodeHost:Listening on {' + addressInfo.address + '} port ' + addressInfo.port + '\]');
    // Signal to the NodeServices base class that we're ready to accept invocations
    console.log('[Microsoft.AspNetCore.NodeServices:Listening]');
});
// exitWhenParentExits(parseInt(parsedArgs.parentPid), /* ignoreSigint */ true);
function readRequestBodyAsJson(request, callback) {
    debugger;
    var requestBodyAsString = '';
    request.on('data', function (chunk) { requestBodyAsString += chunk; });
    request.on('end', function () { callback(JSON.parse(requestBodyAsString)); });
}
function respondWithError(res, errorValue) {
    res.statusCode = 500;
    res.end(JSON.stringify({
        errorMessage: errorValue.message || errorValue,
        errorDetails: errorValue.stack || null
    }));
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var path = __webpack_require__(0);
var startsWith = function (str, prefix) { return str.substring(0, prefix.length) === prefix; };
var appRootDir = process.cwd();
function patchedLStat(pathToStatLong, fsReqWrap) {
    try {
        // If the lstat completes without errors, we don't modify its behavior at all
        return origLStat.apply(this, arguments);
    }
    catch (ex) {
        var shouldOverrideError = startsWith(ex.message, 'EPERM') // It's a permissions error
            && typeof appRootDirLong === 'string'
            && startsWith(appRootDirLong, pathToStatLong) // ... for an ancestor directory
            && ex.stack.indexOf('Object.realpathSync ') >= 0; // ... during symlink resolution
        if (shouldOverrideError) {
            // Fake the result to give the same result as an 'lstat' on the app root dir.
            // This stops Node failing to load modules just because it doesn't know whether
            // ancestor directories are symlinks or not. If there's a genuine file
            // permissions issue, it will still surface later when Node actually
            // tries to read the file.
            return origLStat.call(this, appRootDir, fsReqWrap);
        }
        else {
            // In any other case, preserve the original error
            throw ex;
        }
    }
}
;
// It's only necessary to apply this workaround on Windows
var appRootDirLong = null;
var origLStat = null;
if (/^win/.test(process.platform)) {
    try {
        // Get the app's root dir in Node's internal "long" format (e.g., \\?\C:\dir\subdir)
        appRootDirLong = path._makeLong(appRootDir);
        // Actually apply the patch, being as defensive as possible
        var bindingFs = process.binding('fs');
        origLStat = bindingFs.lstat;
        if (typeof origLStat === 'function') {
            bindingFs.lstat = patchedLStat;
        }
    }
    catch (ex) {
        // If some future version of Node throws (e.g., to prevent use of process.binding()),
        // don't apply the patch, but still let the application run.
    }
}


/***/ }),
/* 4 */
/***/ (function(module, exports) {

// When Node writes to stdout/strerr, we capture that and convert the lines into calls on the
// active .NET ILogger. But by default, stdout/stderr don't have any way of distinguishing
// linebreaks inside log messages from the linebreaks that delimit separate log messages,
// so multiline strings will end up being written to the ILogger as multiple independent
// log messages. This makes them very hard to make sense of, especially when they represent
// something like stack traces.
//
// To fix this, we intercept stdout/stderr writes, and replace internal linebreaks with a
// marker token. When .NET receives the lines, it converts the marker tokens back to regular
// linebreaks within the logged messages.
//
// Note that it's better to do the interception at the stdout/stderr level, rather than at
// the console.log/console.error (etc.) level, because this takes place after any native
// message formatting has taken place (e.g., inserting values for % placeholders).
var findInternalNewlinesRegex = /\n(?!$)/g;
var encodedNewline = '__ns_newline__';
encodeNewlinesWrittenToStream(process.stdout);
encodeNewlinesWrittenToStream(process.stderr);
function encodeNewlinesWrittenToStream(outputStream) {
    var origWriteFunction = outputStream.write;
    outputStream.write = function (value) {
        // Only interfere with the write if it's definitely a string
        if (typeof value === 'string') {
            var argsClone = Array.prototype.slice.call(arguments, 0);
            argsClone[0] = encodeNewlinesInString(value);
            origWriteFunction.apply(this, argsClone);
        }
        else {
            origWriteFunction.apply(this, arguments);
        }
    };
}
function encodeNewlinesInString(str) {
    return str.replace(findInternalNewlinesRegex, encodedNewline);
}


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
function parseArgs(args) {
    // Very simplistic parsing which is sufficient for the cases needed. We don't want to bring in any external
    // dependencies (such as an args-parsing library) to this file.
    var result = {};
    var currentKey = null;
    args.forEach(function (arg) {
        if (arg.indexOf('--') === 0) {
            var argName = arg.substring(2);
            result[argName] = undefined;
            currentKey = argName;
        }
        else if (currentKey) {
            result[currentKey] = arg;
            currentKey = null;
        }
    });
    return result;
}
exports.parseArgs = parseArgs;


/***/ })
/******/ ])));