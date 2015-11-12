/**
 * Client
 */
var client = function() {
	var engine = {
		trident: 0,
		gecko: 0,
		webkit: 0,
		khtml: 0,
		opera: 0,
		name: "",
		ver: ""
	};
	
	var browser = {
		ie: 0,
		firefox: 0,
		safari: 0,
		konq: 0,
		opera: 0,
		chrome: 0,
		name: "",
		ver: ""
	};
	
	var system = {
		win: false,
		mac: false,
		x11: false,
		iphone: false,
		ipad: false,
		ipod: false,
		ios: false,
		android: false,
		winMoblie: false
	};
	
	var ua = navigator.userAgent;
	
	if (window.opera) {
		engine.ver = browser.ver = window.opera.version();
		engine.opera = browser.opera = parseFloat(engine.ver);
		browser.opera = engine.opera;
		engine.name = "opera";
		browser.name = "opera";
	} else if (/AppleWebKit\/(\S+)/.test(ua)) {
		engine.ver = RegExp["$1"];
		engine.webkit = parseFloat(engine.ver);
		engine.name = "webkit";
		if (/Chrome\/(\S+)/.test(ua)) {
			browser.ver = RegExp["$1"];
			browser.chrome = parseFloat(browser.ver);
			browser.name = "chrome";
		} else {
			browser.ver = RegExp["$1"];
			browser.safari = parseFloat(browser.ver);
			browser.name = "safari";
		}
	} else if (/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)) {
		engine.ver = browser.ver = RegExp["$1"];
		engine.khtml = browser.konq = parseFloat(engine.ver);
		engine.name = "khtml";
		browser.name = "konq";
	} else if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)) {
		engine.ver = RegExp["$1"];
		engine.gecko = parseFloat(engine.ver);
		engine.name = "gecko";
		if (/Firefox\/(\S+)/.test(ua)) {
			browser.ver = RegExp["$1"];
			browser.firefox = parseFloat(browser.ver);
			browser.name = "firefox";
		}
	} else if (/Trident\/([^;]+)/.test(ua)) {
		engine.ver = RegExp["$1"];
		engine.trident = parseFloat(engine.ver);
		engine.name = "trident";
		if (/rv:([^\)]+)/.test(ua)) {
			browser.ver = RegExp["$1"];
			browser.ie = parseFloat(browser.ver);
			browser.name = "ie";
		}
	}
	
	return {
		engine: engine,
		browser: browser
	};
}();