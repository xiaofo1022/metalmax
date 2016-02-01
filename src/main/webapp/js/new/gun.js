var Gun = function(context) {
	this.context = context;
	this.level = 1;
	this.x = null;
	this.y = null;
	this.direction = null;
	this.exp = 0;
	this.speed = 3;
	this.distance = 100;
	this.firedBullet = 0;
	this.magzineMax = 1;
	this.magzine = this.magzineMax;
	this.hit = 5;
	this.reload();
};

Gun.prototype = {
	setBuildingMap: function(buildingMap) {
		this.buildingMap = buildingMap;
	},
	
	setOwner: function(owner) {
		this.owner = owner;
	},
	
	setEnemyList: function(enemyList) {
		this.enemyList = enemyList;
	},
	
	fire: function(x, y, d) {
		if (this.magzine > 0) {
			switch (this.level) {
				case 1:
					this.fireLevel1(x, y, d);
					break;
				case 2:
					this.fireLevel2(x, y, d);
					break;
				default:
					this.fireLevel2(x, y, d);
					break;
			}
		}
	},
	
	fireLevel1: function(x, y, d) {
		var b1 = this.load(d);
		if (b1) {
			b1.setPosition(x + 10, y + 10);
			b1.fire();
		}
	},
	
	fireLevel2: function(x, y, d) {
		var b1 = this.load(d);
		var b2 = this.load(d);
		if (b1 && b2) {
			if (d == 1 || d == 2) {
				b1.setPosition(x, y);
				b2.setPosition(x, y + 20);
			} else {
				b1.setPosition(x, y);
				b2.setPosition(x + 20, y);
			}
			b1.fire();
			b2.fire();
		}
	},
	
	load: function(d) {
		var bullet = new Bullet(this);
		bullet.init(this.speed, this.distance, d, this.enemyList);
		bullet.setBuildingMap(this.buildingMap);
		return bullet;
	},
	
	reloadOne: function() {
		this.firedBullet++;
		if (this.firedBullet == this.magzineMax) {
			this.reload();
		}
	},
	
	reload: function() {
		this.firedBullet = 0;
		this.magzine = this.magzineMax;
	},
	
	addExp: function(exp) {
		this.exp += exp;
		this.owner.addExp(exp);
		if (this.exp % 100 == 0) {
			this.levelup();
			this.owner.levelup();
		}
	},
	
	levelup: function() {
		this.magzineMax++;
		this.reload();
		this.distance += 5;
	}
};