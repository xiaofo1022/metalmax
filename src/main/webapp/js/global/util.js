/**
 * Common Utils
 */
var util = {
	log: function(message) {
		console.log(message);
	},
	
	windowToCanvas: function(canvas, x, y) {
		var bbox = canvas.getBoundingClientRect();
		return {x: parseInt(x - bbox.left * (canvas.width / bbox.width)), y: parseInt(y - bbox.top * (canvas.height / bbox.height))};
	},
	
	initAnimation: function() {
		window.requestAnimation = (function() {
			return window.requestAnimationFrame
				|| window.webkitRequestAnimationFrame
				|| window.mozRequestAnimationFrame
				|| window.msRequestAnimationFrame;
		})();
	},
	
	getWindowPosition: function() {
		return {left: (typeof window.screenLeft == "number") ? window.screenLeft : window.screenX,
				top: (typeof window.screenTop == "number") ? window.screenTop : window.screenY};
	},
	
	getWindowSize: function() {
		var width = window.screen.width;
		var height = window.screen.height;
		if (typeof width != "number") {
			if (document.compatMode == "CSS1Compat") {
				width = document.documentElement.clientWidth;
				height = document.documentElement.clientHeight;
			} else {
				width = document.body.clientWidth;
				height = document.body.clientHeight;
			}
		}
		return {width: width, height: height};
	},
	
	getSearchArgs: function() {
		var search = location.search;
		var argStr = search.length > 0 ? search.substring(1) : "";
		var args = {};
		if (argStr != "") {
			var items = argStr.split("&");
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var nameValues = item.split("=");
				var name = decodeURIComponent(nameValues[0]);
				var value = decodeURIComponent(nameValues[1]);
				if (name.length) {
					args[name] = value;
				}
			}
		}
		return args;
	},
	
	hasPlugin: function(name) {
		for (var i = 0; i < navigator.plugins.length; i++) {
			var plugin = navigator.plugins[i];
			if (plugin.name.toLowerCase().indexOf(name.toLowerCase()) > -1) {
				return true;
			}
		}
		return false;
	},
	
	hasIEPlugin: function(name) {
		try {
			new ActiveXObject(name);
			return true;
		} catch (exp) {
			return false;
		}
	},
	
	isHostMethod: function(object, property) {
		var t = typeof object[property];
		return t == "function" 
			|| (!!(t == "object" && object[property]))
			|| t == "unknow";
	},
	
	formatArticle: function(article) {
		article = article.replace(/\n/g, "<br/>");
		article = article.replace(/[^<\S+>] /g, "&nbsp;");
		return article;
	},
	
	doGet: function(url, successFunction) {
		$.ajax({
			type: "get",
			contentType: "application/json",
			dataType: "json",
			url: url,
			success: successFunction,
			error: function(data) {
				console.log(data);
			}
		});
	},
	
	getImageName: function(src) {
		var st = src.split(".");
		st = st[0];
		st = st.split("/");
		st = st[st.length - 1];
		return st;
	}
};
