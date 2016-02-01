/**
 * Item
 */
var Item = function(name, life, exp, money, cost, img, dieimg) {
	this.name = name;
	this.life = life;
	this.maxLife = life;
	this.exp = exp;
	this.money = money;
	this.cost = cost ? cost : 0;
	this.img = img;
	this.dieimg = dieimg;
	this.alive = true;
	this.x = 0;
	this.y = 0;
};

Item.prototype = {
	setDieImg: function(dieimg) {
		this.dieimg = dieimg;
	},
	
	recover: function() {
		this.life = this.maxLife;
	},
};