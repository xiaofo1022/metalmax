var Bullet = function(gun) {
	this.gun = gun;
	this.context = gun.context;
	this.hit = gun.hit;
	this.effect = new Effect(gun.context);
};

Bullet.prototype = {
	init: function(speed, distance, direction, enemyList) {
		this.speed = speed;
		this.distance = distance;
		this.direction = direction;
		this.enemyList = enemyList;
	},
	
	img: (function() {
		var img = new Image();
		img.src = "images/items/bullet.png";
		return img;
	})(),
	
	setBuildingMap: function(buildingMap) {
		this.buildingMap = buildingMap;
	},
	
	setPosition: function(x, y) {
		this.x = x;
		this.y = y;
		this.orginX = x;
		this.orginY = y;
	},
	
	clear: function() {
		this.context.save();
		this.context.translate(this.x, this.y);
		this.context.clearRect(0, 0, 15, 15);
		this.context.restore();
	},
	
	fire: function(ins) {
		if (!ins) {
			ins = this;
		}
		ins.clear();
		var dis = 0;
		if (ins.direction == 1 || ins.direction == 2) {
			dis = Math.abs(ins.x - ins.orginX - 13);
		} else {
			dis = Math.abs(ins.y - ins.orginY - 13);
		}
		if (dis < ins.distance) {
			switch (ins.direction) {
				case 0:
					ins.y += ins.speed;
					break;
				case 1:
					ins.x -= ins.speed;
					break;
				case 2:
					ins.x += ins.speed;
					break;
				case 3:
					ins.y -= ins.speed;
					break;
				default:
					break;
			}
			ins.context.drawImage(ins.img, 0, 0, 10, 10, ins.x, ins.y, 10, 10);
			var exp = ins.hitEnemy();
			if (exp) {
				ins.effect.hitEffect(ins.x, ins.y);
				ins.gun.addExp(exp);
				ins.gun.reloadOne();
				return;
			}
			setTimeout(arguments.callee, 10, ins);
		} else {
			ins.gun.reloadOne();
			return;
		}
	},
	
	hitEnemy: function() {
		if (this.enemyList) {
			for (var i in this.enemyList) {
				var enemy = this.enemyList[i];
				if (enemy && !enemy.die && enemy.complete) {
					if ((this.x >= enemy.x && this.x <= enemy.x + 32)
						&& (this.y >= enemy.y && this.y <= enemy.y + 32)) {
						enemy.beaten(this.hit);
						return enemy.exp;
					}
				}
			}
		}
		if (this.buildingMap.hitBuilding(this.x, this.y, this.hit)) {
			return 1;
		}
		return null;
	}
};