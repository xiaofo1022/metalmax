/**
 * Front Painter
 */
var FrontPainter = function(context) {
	this.context = context;
	this.cw = context.canvas.width;
	this.ch = context.canvas.height;
};

FrontPainter.prototype = {
	setWarriorList: function(warriorList) {
		this.hero = warriorList[0];
		this.warriorList = warriorList;
	},
		
	draw: function(ins) {
		ins.context.clearRect(0, 0, ins.cw, ins.ch);
		if (ins.warriorList) {
			var hero = ins.warriorList[0];
			for (var i in ins.warriorList) {
				var w = ins.warriorList[i];
				if (w.loaded) {
					ins.drawDestList(w, ins);
					ins.map.isStepOnBoom(w);
					ins.map.burnTheBanker(w);
					if (w.life > 0) {
						ins.context.drawImage(w.img, w.x, w.y, w.w, w.h, w.mx, w.my, w.w, w.h);
					} else {
						ins.warriorList.splice(i, 1);
					}
					w.refresh();
				}
			}
			if (ins.mouseDest) {
				ins.drawMouseDest(ins.mouseDest.x, ins.mouseDest.y);
			}
		}
		setTimeout(arguments.callee, 100, ins);
	},
	
	drawDestList: function(w, ins) {
		if (w.destList) {
			for (var i = 0; i < w.destList.length; i++) {
				var wdest = w.destList[i];
				if (wdest.complete) {
					var item = wdest.item;
					if (item) {
						var moneyDiff = w.money - item.cost;
						if (moneyDiff >= 0) {
							w.addMoney(-item.cost);
							if (item.name == "bottle") {
								ins.map.watering(wdest.x, wdest.y);
							} else if (item.name == "spade") {
								ins.map.turnTheSoil(item, wdest.x, wdest.y);
							} else if (item.name == "boom") {
								ins.map.dropBoom(wdest);
							} else {
								ins.map.drawItem(item, wdest.x, wdest.y);
							}
						}
					}
					ins.context.clearRect(wdest.x, wdest.y, 32, 32);
					w.destList.splice(i, 1);
				} else {
					if (w.type == 0 && w.id == ins.hero.id) {
						if (wdest.item) {
							ins.drawDest(wdest.x, wdest.y, wdest.item.img);
						} else {
							ins.drawMovePixel(wdest.x, wdest.y);
						}
						ins.drawDestIndex(wdest.x, wdest.y, wdest.index);
					}
				}
			}
		}
	},
	
	drawDest: function(x, y, img) {
		this.context.drawImage(img, x, y, 32, 32);
	},
	
	drawMouseDest: function(x, y) {
		if (this.warriorList) {
			var hero = this.warriorList[0];
			if (hero) {
				var heroItem = hero.getCurrentItem();
				if (heroItem) {
					this.context.drawImage(heroItem.img, x, y, 32, 32);
				} else {
					this.drawMovePixel(x, y);
				}
			}
		}
	},
	
	drawMovePixel: function(x, y) {
		this.context.save();
		this.context.fillStyle = "rgba(255, 0, 0, 0.5)";
		this.context.fillRect(x, y, 32, 32);
		this.context.restore();
	},
	
	drawDestIndex: function(x, y, index) {
		this.context.save();
		this.context.translate(x, y);
		this.context.fillStyle = "rgba(255, 255, 255, 1.0)";
		this.context.font = "8px Arial";
		this.context.fillText(index, 13, 20);
		this.context.restore();
	},
	
	setDest: function(dest) {
		this.mouseDest = dest;
	},
	
	setMap: function(map) {
		this.map = map;
	},
	
	addWarrior: function(warrior) {
		if (this.warriorList) {
			this.warriorList.push(warrior);
		}
	}
};