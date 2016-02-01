var Building = function(context, imgSrc, x, y, life) {
	var ins = this;
	this.context = context;
	this.blastItem = null;
	this.x = x;
	this.y = y;
	this.life = life;
	this.complete = false;
	this.img = new Image();
	this.img.src = imgSrc;
	this.name = util.getImageName(imgSrc);
	this.img.onload = function() {
		ins.complete = true;
		ins.context.drawImage(this, ins.x, ins.y, 32, 32);
	};
};

Building.prototype = {
	blastImg: (function() {
		var blastImg = new Image();
		blastImg.src = "images/items/blast.png";
		return blastImg;
	})(),
	
	desert: (function() {
		var img = new Image();
		img.src = "images/items/desert.png";
		return img;
	})(),
	
	initHostage: function(hostage) {
		this.hostage = hostage;
	},
	
	createTeasure: function(name, context) {
		var item = {};
		var img = new Image();
		img.src = "images/items/" + name + ".png";;
		item.name = name;
		item.img = img;
		item.desert = this.desert;
		item.context = context ? context : this.context;
		return item;
	},
	
	setBuildingMap: function(buildingMap) {
		this.buildingMap = buildingMap;
		this.buildingMap.addBuilding(this);
	},
	
	setTeasure: function() {
		var rand = Math.floor(Math.random() * 10);
		if (rand == 0) {
			this.teasure = this.createTeasure("gun");
		} else if (rand == 1) {
			this.teasure = this.createTeasure("green_radish");
		}
	},
	
	beaten: function(hit) {
		this.life -= hit;
		if (this.life <= 0) {
			this.destory();
			this.buildingMap.removeBuilding(this);
		}
	},
	
	destory: function(ins) {
		if (!ins) {
			ins = this;
		}
		if (!ins.blastItem) {
			ins.blastItem = {};
			ins.blastItem.xIndex = 0;
			ins.blastItem.yIndex = 1;
			ins.blastItem.size = 192;
			ins.blastItem.img = ins.blastImg;
		}
		var px = ins.blastItem.xIndex * ins.blastItem.size;
		var py = ins.blastItem.yIndex * ins.blastItem.size;
		ins.context.clearRect(ins.x, ins.y, 32, 32);
		ins.context.drawImage(ins.desert, ins.x, ins.y, 32, 32);
		ins.context.drawImage(ins.blastItem.img, px, py, ins.blastItem.size, ins.blastItem.size, ins.x, ins.y, 32, 32);
		ins.blastItem.xIndex++;
		if (ins.blastItem.xIndex == 5) {
			ins.blastItem.xIndex = 0;
			ins.blastItem.yIndex++;
		}
		if (ins.blastItem.yIndex < 3) {
			setTimeout(arguments.callee, 100, ins);
		} else {
			ins.context.clearRect(ins.x, ins.y, 32, 32);
			ins.context.drawImage(ins.desert, ins.x, ins.y, 32, 32);
			if (ins.teasure) {
				ins.context.drawImage(ins.teasure.img, ins.x, ins.y, 32, 32);
				ins.buildingMap.addTeasure(ins.x, ins.y, ins.teasure);
			}
			if (ins.hostage) {
				ins.hostage.complete = true;
				ins.hostage.draw();
			}
			ins.blastItem = null;
		}
	}
};