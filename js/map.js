/**
 * Map
 */
var Map = function(canvas, context, source) {
	this.canvas = canvas;
	this.context = context;
	this.w = canvas.width;
	this.h = canvas.height;
	this.loaded = false;
	this.itemMap = {};
	this.blastMap = {};
	this.fireMap = {};
	this.boomList = [];
	this.gameStarted = false;
	var instance = this;
	var map = new Image();
	map.src = "images/default_map.png";
	map.onload = function() {
		instance.context.drawImage(this, 0, 0, instance.w, instance.h);
		instance.loaded = true;
	};
};

Map.prototype = {
	setFishLabel: function(fishLabel) {
		this.fishLabel = fishLabel;
	},
	
	setWindow: function(window) {
		this.window = window;
	},
	
	watering: function(x, y) {
		var key = x + "," + y;
		var item = this.itemMap[key];
		if (item && item.life == 0) {
			item.recover();
			this.context.clearRect(x, y, 32, 32);
			this.context.drawImage(this.items.items["grass"].img, item.x, item.y, 32, 32);
			this.context.drawImage(item.img, item.x, item.y, 32, 32);
			this.runItem(item, this);
		}
	},
		
	turnTheSoil: function(item, x, y) {
		this.clearMapItem(x, y);
	},
	
	clearMapItem: function(x, y) {
		var key = x + "," + y;
		if (this.itemMap[key]) {
			var item = this.itemMap[key];
			item.alive = false;
			this.context.clearRect(x, y, 32, 32);
			this.context.drawImage(this.items.items["desert"].img, x, y, 32, 32);
			this.itemMap[key] = null;
			delete this.itemMap[key];
			if (this.isItemMapClear() && this.gameStarted) {
				this.window.location.replace("http://localhost:8087/gameover.html");
			}
			return true;
		} else {
			return false;
		}
	},
	
	isItemMapClear: function() {
		for (var key in this.itemMap) {
			if (this.itemMap[key] && this.itemMap[key].name != "boom") {
				return false;
			}
		}
		return true;
	},
	
	// TODO Close it right now
	enemyHitCheck: function(hero, enemy) {
		if (enemy.type == 1) {
			if (this.isOnPosition(hero.mx, hero.my, enemy.mx, enemy.my)) {
				hero.life = 0;
				this.context.clearRect(hero.mx, hero.my, 32, 32);
				if (this.items) {
					this.context.drawImage(this.items.items["desert"].img, hero.mx, hero.my, 32, 32);
				}
				this.context.drawImage(hero.deadBody, hero.mx, hero.my, 32, 32);
				this.drawFireAnimate(this, hero.mx, hero.my);
			}
		}
	},
	
	burnTheBanker: function(enemy) {
		if (enemy.type == 1 && enemy.name != "farmer") {
			if (this.clearMapItem(enemy.mx, enemy.my)) {
				this.drawFireAnimate(this, enemy.mx, enemy.my);
			}
		}
	},
	
	drawFireAnimate: function(ins, x, y) {
		var key = x + "," + y;
		var fire = ins.fireMap[key];
		if (!fire) {
			var fireImg = ins.items.items["fire"].img;
			if (fireImg) {
				fire = {};
				fire.index = 0;
				fire.size = 32;
				fire.img = fireImg;
				ins.fireMap[key] = fire;
			}
		}
		if (fire) {
			var px = fire.index * fire.size;
			var py = fire.index * fire.size;
			ins.textPainter.clearRect(x, y, 32, 32);
			ins.textPainter.drawImage(fire.img, px, py, fire.size, fire.size, x, y, 32, 32);
			fire.index++;
			if (fire.index < 6) {
				setTimeout(arguments.callee, 100, ins, x, y);
			} else {
				ins.textPainter.clearRect(x, y, 32, 32);
				ins.fireMap[key] = null;
			}
		}
	},
	
	dropBoom: function(wdest) {
		var item = wdest.item;
		var x = wdest.x;
		var y = wdest.y;
		var key = x + "," + y;
		if (!this.itemMap[key]) {
			this.itemMap[key] = item;
		}
		this.context.drawImage(item.img, x, y, 32, 32);
		this.boomList.push(wdest);
	},
	
	isStepOnBoom: function(warrior) {
		if (this.boomList) {
			for (var i in this.boomList) {
				var boom = this.boomList[i];
				if (warrior.type != 0) {
					if (this.isOnPosition(warrior.mx, warrior.my, boom.x, boom.y)) {
						warrior.life = 0;
						this.boomList.splice(i, 1);
						this.boom(warrior.deadBody, boom.x, boom.y);
						if (this.fishLabel) {
							var fishCount = parseInt(this.fishLabel.text());
							this.fishLabel.text(++fishCount);
						}
					}
				}
			}
		}
	},
	
	isOnPosition: function(wx, wy, dx, dy) {
		return (wx >= dx
				&& wx < dx + 10
				&& wy >= dy
				&& wy < dy + 10);
	},
	
	boom: function(img, x, y) {
		this.clearMapItem(x, y);
		this.context.drawImage(img, x, y, 32, 32);
		this.drawBlastAnimate(this, x, y);
	},
	
	drawBlastAnimate: function(ins, x, y) {
		var key = x + "," + y;
		var blast = ins.blastMap[key];
		if (!blast) {
			var blastItem = ins.items.items["blast"];
			if (blastItem) {
				blast = {};
				blast.xIndex = 0;
				blast.yIndex = 1;
				blast.size = 192;
				blast.img = blastItem.img;
				ins.blastMap[key] = blast;
			}
		}
		if (blast) {
			var px = blast.xIndex * blast.size;
			var py = blast.yIndex * blast.size;
			ins.textPainter.clearRect(x, y, 32, 32);
			ins.textPainter.drawImage(blast.img, px, py, blast.size, blast.size, x, y, 32, 32);
			blast.xIndex++;
			if (blast.xIndex == 5) {
				blast.xIndex = 0;
				blast.yIndex++;
			}
			if (blast.yIndex < 3) {
				setTimeout(arguments.callee, 100, ins, x, y);
			} else {
				ins.textPainter.clearRect(x, y, 32, 32);
				ins.blastMap[key] = null;
			}
		}
	},
	
	drawItem: function(data, x, y) {
		var key = x + "," + y;
		var value = this.itemMap[key];
		var canDraw = false;
		if (value) {
			canDraw = (value.name == "grass");
		} else {
			canDraw = (data.name == "grass");
		}
		if (canDraw) {
			if (!this.gameStarted) {
				this.gameStarted = true;
			}
			var item = new Item(data.name, data.life, data.exp, data.money, data.cost, data.img, data.dieimg);
			item.x = x;
			item.y = y;
			this.context.drawImage(item.img, x, y, 32, 32);
			this.itemMap[key] = item;
			this.runItem(item, this);
		}
	},
	
	runItem: function(item, ins) {
		if (ins.hero) {
			if (item.alive) {
				if (item.life > 0) {
					ins.runScore(ins, item, 11, 30);
					item.life--;
					ins.hero.addExp(item.exp);
					ins.hero.addMoney(item.money);
					setTimeout(arguments.callee, 5000, item, ins);
				} else {
					if (item.dieimg) {
						ins.context.drawImage(item.dieimg, item.x, item.y, 32, 32);
					}
				}
			}
		}
	},
	
	runScore: function(ins, item, fx, fy) {
		if (fy > 10) {
			ins.textPainter.save();
			ins.textPainter.translate(item.x, item.y);
			ins.textPainter.clearRect(0, 0, 32, 32);
			ins.textPainter.fillStyle = "rgba(255, 255, 0, 1.0)";
			ins.textPainter.font = "10px Arial";
			ins.textPainter.fillText("+" + item.exp, fx, fy);
			ins.textPainter.restore();
			setTimeout(arguments.callee, 50, ins, item, fx, --fy);
		} else {
			ins.textPainter.clearRect(item.x, item.y, 32, 32);
		}
	},
	
	setHero: function(hero) {
		this.hero = hero;
	},
	
	setTextPainter: function(textPainter) {
		this.textPainter = textPainter;
	},
	
	setItems: function(items) {
		this.items = items;
	}
};