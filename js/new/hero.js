var Hero = function(imgsrc, x, y, direction, context) {
	this.context = context;
	this.PIXEL = 32;
	this.x = x;
	this.y = y;
	this.direction = direction;
	this.frame = 0;
	this.frameDelay = 0;
	this.level = 1;
	this.exp = 0;
	this.step = 1;
	this.die = false;
	this.life = 10;
	this.MAX_BREATH = 30;
	this.breath = this.MAX_BREATH;
	this.canWalk = true;
	this.randomDistance = 20;
	this.dest = null;
    this.speed = 4;
	var ins = this;
	this.img = new Image();
	this.img.src = imgsrc;
	this.img.onload = function() {
		ins.name = util.getImageName(this.src);
		if (ins.name != "farmer") {
			ins.complete = true;
		}
	}
};

Hero.prototype = {
	setEffect: function(effect) {
		this.effect = effect;
	},
	
	setLabels: function(levelSpan, scoreSpan, lifeDiv) {
		this.levelSpan = levelSpan;
		this.scoreSpan = scoreSpan;
		this.lifeDiv = lifeDiv;
	},
	
	addExp: function(exp) {
		this.exp += exp;
		this.scoreSpan.innerHTML = this.exp;
	},
	
	setBattleContext: function(battleContext) {
		this.battleContext = battleContext;
	},
	
	setInitFunc: function(initFunc) {
		this.initFunc = initFunc;
	},
	
	setDeadbody: function(deadbody) {
		this.deadbody = deadbody;
	},
	
	levelup: function() {
		// Just Gun Level right now.
		this.level++;
		this.levelSpan.innerHTML = this.level;
	},
	
	setBuildingMap: function(buildingMap) {
		this.buildingMap = buildingMap;
		if (this.gun) {
			this.gun.setBuildingMap(buildingMap);
		}
	},
	
	setExp: function(exp) {
		this.exp = exp
	},
	
	setStep: function(step) {
		this.step = step;
	},
	
	setGun: function(gun) {
		this.gun = gun;
		this.gun.setOwner(this);
	},
	
	setDeadbody: function(deadbody) {
		this.deadbody = deadbody
	},
	
	changeLifeBar: function() {
		this.lifeDiv.style.width = this.life * 10 + "px";
		if (this.life < 4) {
			this.lifeDiv.style.backgroundColor = "red";
		} else {
			this.lifeDiv.style.backgroundColor = "#8EFF5E";
		}
	},
	
	beaten: function(hit) {
		this.life -= hit;
		if (this.effect) {
			this.effect.hitEffect(this.x, this.y);
		}
		if (this.lifeDiv) {
			this.changeLifeBar();
		}
		if (this.life <= 0) {
			this.destory();
		}
	},
	
	draw: function() {
		if (this.complete) {
			if (this.die) {
				if (this.deadbody) {
					this.context.drawImage(this.deadbody, this.x, this.y, 32, 32);
				}
			} else {
				this.context.drawImage(this.img, this.frame * 32, this.direction * 32, 32, 32, this.x, this.y, 32, 32);
			}
		}
	},
	
	destory: function() {
		this.die = true;
		this.context.save();
		this.context.translate(this.x, this.y);
		this.context.clearRect(0, 0, 32, 32);
		this.context.restore();
	},
	
	setCommand: function(code) {
		if (this.die) {
			return;
		}
		switch (code) {
			case "U":
				this.direction = 3;
				this.changeFrame();
				this.changeStep("y", false);
				break;
			case "D":
				this.direction = 0;
				this.changeFrame();
				this.changeStep("y", true, 448);
				break;
			case "L":
				this.direction = 1;
				this.changeFrame();
				this.changeStep("x", false);
				break;
			case "R":
				this.direction = 2;
				this.changeFrame();
				this.changeStep("x", true, 608);
				break;
			case "DASH":
				//this.dash();
				break;
			default:
				break;
		}
	},
	
	fire: function(direction) {
		if (this.gun) {
			this.gun.fire(this.x, this.y, direction);
		}
	},
	
	dash: function() {
		var param1, param2, param3;
		switch (this.direction) {
			case 0:
				param1 = "y";
				param2 = true;
				param3 = 448;
				break;
			case 1:
				param1 = "x";
				param2 = false;
				break;
			case 2:
				param1 = "x";
				param2 = true;
				param3 = 608;
				break;
			case 3:
				param1 = "y";
				param2 = false;
				break;
			default:
				break;
		}
		for (var i = 0; i < 20; i++) {
			this.changeStep(param1, param2, param3);
		}
	},
	
	lifeRecover: function() {
		this.life++;
		this.changeLifeBar();
	},
	
	eatTeasure: function(teasure) {
		switch (teasure.name) {
			case "gun":
				this.gun.level++;
				break;
			case "green_radish":
				this.lifeRecover();
				break;
			case "up_ladder":
				if (this.initFunc) {
					this.initFunc(true);
				}
				break;
			case "down_ladder":
				if (this.initFunc) {
					this.initFunc(false);
				}
				break;
			default:
				break;
		}
	},
	
	changeStep: function(prop, isPlus, maxmium) {
		//for (var i = 0; i < this.step; i++) {
			var wall = "";
			if (this.buildingMap) {
				wall = this.buildingMap.wallCheck(this.x, this.y);
				var teasure = this.buildingMap.hitTeasure(this.x, this.y);
				if (teasure) {
					this.eatTeasure(teasure);
					this.buildingMap.removeTeasure(teasure);
				}
			}
			if (isPlus) {
				if (this[prop] < maxmium) {
					if (prop == "x") {
						if (wall != "L") {
							this.x += this.speed;
						}
					}
					if (prop == "y") {
						if (wall != "T") {
							this.y += this.speed;
						}
					}
				}
			} else {
				if (this[prop] > 0) {
					if (prop == "x") {
						if (wall != "R") {
							this.x -= this.speed;
						}
					}
					if (prop == "y") {
						if (wall != "B") {
							this.y -= this.speed;
						}
					}
				}
			}
		//}
	},
	
	changeFrame: function() {
		if (this.frameDelay == 0) {
			this.frame++;
		}
		this.frameDelay++;
		if (this.frameDelay > 3) {
			this.frameDelay = 0;
		}
		if (this.frame > 3) {
			this.frame = 0;
		}
	},
	
	walkTo: function(hero) {
		if (!this.dest) {
			this.dest = hero;
		}
		if (this.canWalk) {
			var x = 0;
			var y = 0;
			if (this.randomDistance % 2 == 0) {
				x = this.dest.x + this.randomDistance;
				y = this.dest.y + this.randomDistance;
			} else {
				x = this.dest.x - this.randomDistance;
				y = this.dest.y - this.randomDistance;
			}
			if ((this.x + 32 >= this.dest.x && this.x <= this.dest.x + 32)
				&& (this.y + 32 >= this.dest.y && this.y <= this.dest.y + 32)) {
				if (typeof hero.beaten == "function") {
					hero.beaten(1);
				}
				this.breath = 0;
				this.canWalk = false;
			} else {
				if (this.x < x) {
					this.setCommand("R");
				} 
				if (this.x > x) {
					this.setCommand("L");
				} 
				if (this.y > y) {
					this.setCommand("U");
				} 
				if (this.y < y) {
					this.setCommand("D");
				}
				this.breath--;
				if (this.breath == 0) {
					this.canWalk = false;
				}
			}
		} else {
			this.breath++;
			if (this.breath == this.MAX_BREATH) {
				this.canWalk = true;
				this.dest = null;
				this.randomDistance = Math.floor(Math.random() * 20);
			}
		}
	}
};