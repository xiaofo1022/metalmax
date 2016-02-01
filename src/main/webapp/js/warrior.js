/**
 * Warrior
 */
var Warrior = function(sourceUrl, mapIndex, direction, type) {
	this.id = -1;
	this.sourceUrl = sourceUrl;
	this.mapIndex = mapIndex;
	this.direction = direction;
	this.warriorFrame = 0;
	this.x = 0;
	this.y = 0;
	this.w = 32;
	this.h = 32;
	this.mx = mapIndex[0] * 32;
	this.my = mapIndex[1] * 32;
	this.life = 100;
	this.level = 1;
	this.exp = 0;
	this.money = 100;
	this.destCount = 0;
	this.maxDest = 3;
	this.status = "stand";
	this.type = type ? type : 0;
	this.baseUrl = "images/heros/";
	this.img = new Image();
	this.img.src = this.baseUrl + sourceUrl;
	this.loaded = false;
	this.destList = [];
	var instance = this;
	this.img.onload = function() {
		instance.name = util.getImageName(this.src);
		instance.loadDeadBody();
	}
};

Warrior.prototype = {
	typeMap: {
		0: "hero",
		1: "npc"
	},
	
	setImgBoom: function(imgBoom) {
		this.imgBoom = imgBoom;
	},
	
	setType: function(type) {
		this.type = type;
	},
	
	setHiddenItems: function(hiddenItems) {
		this.hiddenItems = hiddenItems;
	},
	
	setItems: function(items) {
		this.items = items;
	},
	
	setEnemy: function(enemy) {
		this.enemy = enemy;
	},
	
	setMapIndex: function(mapIndex) {
		this.mapIndex = mapIndex;
		this.mx = mapIndex[0] * 32;
		this.my = mapIndex[1] * 32;
	},
	
	setId: function(id) {
		this.id = id;
	},
	
	initSocket: function() {
		var ins = this;
		this.socket = new WebSocket("ws://localhost:8081/");
		this.socket.onmessage = function(msg) {
			var data = JSON.parse(msg.data);
			console.log("Received: " + data);
			if (data.type == "ping") {
				ins.socket.send(JSON.stringify({type:"pong"}));
			} else if (data.type == "id") {
				ins.setId(data.id);
			} else if (data.type == "start") {
				var mode = data.mode;
				ins.socketMode = mode;
				if (mode == "sub") {
					ins.setMapIndex([19, 0]);
					ins.setDirection("D");
				}
			} else if (data.type == "addDest") {
				if (data.id == ins.id) {
					ins.addDest(data.data);
				} else {
					ins.enemy.addDest(data.data);
				}
			} else if (data.type == "selectItem") {
				var item = null;
				var name = data.data;
				if (name != "red") {
					item = ins.items.items[name];
				}
				if (data.id == ins.id) {
					ins.setItem(item);
				} else {
					ins.enemy.setItem(item);
				}
			} else if (data.type == "breath") {
				if (data.id != ins.id) {
					ins.enemy.destCount = 0;
				}
			}
		};
	},
	
	sendCommand: function(cmd) {
		cmd.id = this.id;
		this.socket.send(JSON.stringify(cmd));
	},
	
	loadDeadBody: function() {
		var instance = this;
		var img = new Image();
		if (this.type == 0) {
			img.src = "images/heros/bones.png";
		} else {
			img.src = "images/heros/deadbody.png";
		}
		img.onload = function() {
			instance.deadBody = this;
			instance.loaded = true;
			instance.refresh();
		}
	},
	
	refresh: function() {
		var di = this.getDirectionIndex(this.direction);
		var wi = [this.warriorFrame, di];
		var wp = this.getWarriorPixels(wi);
		this.x = wp.x;
		this.y = wp.y;
		if (this.status == "stand") {
			this.warriorFrame = 0;
		} else {
			this.warriorFrame++;
			if (this.warriorFrame > 3) {
				this.warriorFrame = 0;
			}
		}
	},
	
	getDirectionIndex: function(direction) {
		switch (direction) {
			case "D":
				return 0;
			case "L":
				return 1;
			case "R":
				return 2;
			case "U":
				return 3;
			default:
				return 0;
		}
	},
	
	getWarriorPixels: function(warriorIndex) {
		return {x: warriorIndex[0] * this.w, y: warriorIndex[1] * this.h};
	},
	
	setMapX: function(mx) {
		this.mx = mx;
	},
	
	setMapY: function(my) {
		this.my = my;
	},
	
	setDirection: function(direction) {
		this.direction = direction;
	},
	
	addDest: function(dest) {
		if (this.destCount < this.maxDest) {
			if (this.type == 0) {
				this.destCount++;
				this.changeStep();
			}
			var destItem = {};
			destItem.index = this.destCount;
			destItem.x = dest.x;
			destItem.y = dest.y;
			destItem.item = this.currentItem;
			if (destItem.item && destItem.item.name == "boom" && this.superBoom) {
				destItem.complete = true;
			} else {
				destItem.complete = false;
			}
			this.destList.push(destItem);
			if (this.destCount == this.maxDest) {
				if (this.breath) {
					this.breath.style.width = "2px";
					this.breath.style.backgroundColor = "#FF0000";
					this.startBreath(this);
				}
			}
		}
	},
	
	changeStep: function() {
		if (this.stepLabel) {
			this.stepLabel.innerHTML = (this.maxDest - this.destCount) + "/" + this.maxDest;
		}
	},
	
	startBreath: function(ins) {
		var width = parseInt(ins.breath.style.width.replace("px", ""));
		if (width < 62) {
			ins.breath.style.width = (width + 1) + "px";
			setTimeout(arguments.callee, 100, ins);
		} else {
			ins.breath.style.backgroundColor = "#8EFF5E";
			ins.destCount = 0;
			ins.changeStep();
			if (ins.socket) {
				ins.sendCommand({type:"breath", data:"none"});
			}
		}
	},
	
	setBreath: function(breath) {
		this.breath = breath;
	},
	
	setExpLabel: function(expLabel) {
		this.expLabel = expLabel;
	},
	
	setStepLabel: function(stepLabel) {
		this.stepLabel = stepLabel;
		this.changeStep();
	},
	
	setLevelLabel: function(levelLabel) {
		this.levelLabel = levelLabel;
		this.levelLabel.innerHTML = this.level;
	},
	
	setMoneyLabel: function(moneyLabel) {
		this.moneyLabel = moneyLabel;
		this.moneyLabel.innerHTML = this.money;
	},
	
	levelUp: function() {
		this.level++;
		this.maxDest++;
		this.unlockItem();
		this.unlockSuperBoom();
		this.levelLabel.innerHTML = this.level;
	},
	
	unlockSuperBoom: function() {
		if (this.level == 5) {
			if (this.imgBoom) {
				this.imgBoom.css("background-color", "red");
			}
			this.superBoom = true;
		}
	},
	
	unlockItem: function() {
		if (this.hiddenItems) {
			for (var i in this.hiddenItems) {
				var hdi = this.hiddenItems[i];
				if (!hdi.isShow) {
					$(hdi).show();
					hdi.isShow = true;
					break;
				}
			}
		}
	},
	
	addExp: function(exp) {
		this.exp += parseInt(exp);
		if (this.exp % 5 == 0 && this.exp >= 5) {
			this.levelUp();
		}
		if (this.expLabel) {
			this.expLabel.innerHTML = this.exp;
		}
	},
	
	addMoney: function(money) {
		this.money += parseInt(money);
		if (this.moneyLabel) {
			this.moneyLabel.innerHTML = this.money;
		}
	},
	
	setItem: function(item) {
		this.currentItem = item;
	},
	
	getCurrentItem: function() {
		return this.currentItem;
	},
	
	rollbackDest: function() {
		if (this.destList) {
			if (this.destList.length > 1) {
				this.destList.splice(this.destList.length - 1, 1);
//				if (this.destCount > 0) {
//					this.destCount--;
//					this.changeStep();
//				}
			}
		}
	}
};