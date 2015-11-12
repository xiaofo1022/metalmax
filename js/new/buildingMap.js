var BuildingMap = function() {
	this.map = {};
	this.mapCount = 0;
	this.teasureMap = {};
};

BuildingMap.prototype = {
	setShowLaddersFunc: function(showLaddersFunc) {
		this.showLaddersFunc = showLaddersFunc;
	},
	
	addBuilding: function(building) {
		this.map[building.x + "," + building.y] = building;
		if (building.name != "box") {
			this.mapCount++;
		}
	},
	
	addTeasure: function(x, y, teasure) {
		teasure.x = x;
		teasure.y = y;
		this.teasureMap[x + "," + y] = teasure;
	},
	
	removeTeasure: function(teasure) {
		teasure.context.clearRect(teasure.x, teasure.y, 32, 32);
		teasure.context.drawImage(teasure.desert, teasure.x, teasure.y, 32, 32);
		var key = teasure.x + "," + teasure.y;
		this.teasureMap[key] = null;
		delete this.teasureMap[key];
	},
	
	hasBuilding: function(x, y) {
		if (this.map[x + "," + y]) {
			return true;
		} else {
			return false;
		}
	},
	
	getBuilding: function(x, y) {
		if (this.hasBuilding(x, y)) {
			return this.map[x + "," + y];
		} else {
			return null;
		}
	},
	
	removeBuilding: function(building) {
		var key = building.x + "," + building.y;
		if (this.map[key]) {
			this.map[key] = null;
			delete this.map[key];
			if (building.name != "box") {
				this.mapCount--;
			}
		}
		if (this.mapCount == 0) {	
			if (this.showLaddersFunc) {
				this.showLaddersFunc();
			}
		}
	},
	
	wallCheck: function(x, y) {
		for (var key in this.map) {
			var keys = key.split(",");
			var mapx = parseInt(keys[0]);
			var mapy = parseInt(keys[1]);
			if (x == mapx + 32 && this.inRange(mapy, y)) {
				return "R";
			}
			if (x + 32 == mapx && this.inRange(mapy, y)) {
				return "L";
			}
			if (y == mapy + 32 && this.inRange(mapx, x)) {
				return "B";
			}
			if (y + 32 == mapy && this.inRange(mapx, x)) {
				return "T";
			}
		}
		return "";
	},
	
	inRange: function(map, p) {
		if ((p >= map && p <= map + 32)
			|| (p + 32 >= map && p + 32 <= map + 32)) {
			return true;
		} else {
			return false;
		}
	},
	
	hitBuilding: function(x, y, hit) {
		for (var key in this.map) {
			var keys = key.split(",");
			var mapx = parseInt(keys[0]);
			var mapy = parseInt(keys[1]);
			if ((x >= mapx && x <= mapx + 32)
				&& (y >= mapy && y <= mapy + 32)) {
				var building = this.map[key];
				building.beaten(hit);
				return true;
			}
		}
		return false;
	},
	
	hitTeasure: function(x, y) {
		var cx = x + 16;
		var cy = y + 16;
		for (var key in this.teasureMap) {
			var keys = key.split(",");
			var tx = parseInt(keys[0]);
			var ty = parseInt(keys[1]);
			if (cx >= tx && cx <= tx + 32 && cy >= ty && cy <= ty + 32) {
				var teasure = this.teasureMap[key];
				this.teasureMap[key] = null;
				delete this.teasureMap[key];
				return teasure;
			}
		}
		return null;
	}
};