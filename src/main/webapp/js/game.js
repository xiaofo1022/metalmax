/**
 * Game of coming home
 */
util.initAnimation();

var breath = document.getElementById("breath");
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var front = document.getElementById("front");
var fc = front.getContext("2d");
var textcns = document.getElementById("textcns");
var tc = textcns.getContext("2d");
var exp = document.getElementById("exp");
var step = document.getElementById("step");
var level = document.getElementById("level");
var money = document.getElementById("money");
var imgBoom = $("#imgSetBoom");

var items = new Items();
var map = new Map(canvas, context, "../images/default_map.png");
map.setTextPainter(tc);
map.setItems(items);
map.setWindow(this);
map.setFishLabel($("#fish"));
var frontPainter = frontPainter = new FrontPainter(fc);
frontPainter.setMap(map);
frontPainter.draw(frontPainter);
var isStartEnemyMove = true;
var gameMode = 0; // 0:single 1:multi
var hero = null;
var enemy = null;

startGame();

function startGame() {
	if (gameMode == 0) {
		createEnemy();
		hero = new Warrior("black_guy.png", [9, 7], "D");
		var heroWalk = new Walk(hero);
		map.setHero(hero);
		frontPainter.setWarriorList([hero]);
	} else {
		hero = new Warrior("black_guy.png", [0, 14], "U");
		hero.initSocket();
		checkSocket();
	}
	
	if (hero) {
		hero.setHiddenItems($(".hd"));
		hero.setImgBoom(imgBoom);
		hero.setItems(items);
		hero.setExpLabel(exp);
		hero.setStepLabel(step);
		hero.setLevelLabel(level);
		hero.setMoneyLabel(money);
		hero.setBreath(breath);
	}
}

function checkSocket() {
	if (hero.socketMode) {
		if (hero.socketMode == "main") {
			enemy = new Warrior("yellow_guy.png", [19, 0], "D");
		} else {
			enemy = new Warrior("yellow_guy.png", [0, 14], "U");
			hero.setMapIndex([19, 0]);
			hero.setDirection("D");
		}
		hero.setEnemy(enemy);
		var heroWalk = new Walk(hero);
		var enemyWalk = new Walk(enemy);
		map.setHero(hero);
		frontPainter.setWarriorList([hero, enemy]);
	} else {
		setTimeout(arguments.callee, 500);
	}
}

function createEnemy() {
	if (isStartEnemyMove) {
		enemy = getRandomEnemy();
		var enemyWalk = new Walk(enemy);
		frontPainter.addWarrior(enemy);
		enemyMove(enemy);
	} else {
		isStartEnemyMove = true;
	}
	var loopTime = 60000;
	if (hero) {
		loopTime = 60000 - hero.level * 1000;
		if (loopTime <= 0) {
			loopTime = 1000;
		}
	}
	setTimeout(arguments.callee, loopTime);
}

function getRandomEnemy(sourceUrl) {
	var rand = Math.floor(Math.random() * 4);
	var enemySource = sourceUrl ? sourceUrl : "crocodile.png";
	switch (rand) {
		case 0:
			return new Warrior(enemySource, [19, 0], "D", 1);
		case 1:
			return new Warrior(enemySource, [0, 14], "R", 1);
		case 2:
			return new Warrior(enemySource, [19, 14], "U", 1);
		case 3:
			return new Warrior(enemySource, [0, 0], "D", 1);
		default:
			return new Warrior(enemySource, [19, 0], "D", 1);
	}
}

function enemyMove(enemy) {
	if (enemy.status == "stand") {
		var ex = enemy.mx;
		var ey = enemy.my;
		var dest = getRandomDest(ex, ey);
		if (dest) {
			enemy.addDest(dest);
		}
	}
	setTimeout(arguments.callee, 3000, enemy);
}

function getRandomDest(x, y) {
	var itemMap = map.itemMap;
	var itemX;
	var itemY;
	for (var key in itemMap) {
		var item = itemMap[key];
		if (key && item && item.name != "boom") {
			var xys = key.split(",");
			itemX = parseInt(xys[0]);
			itemY = parseInt(xys[1]);
			break;
		}
	}
	if (itemX && itemY) {
		var randPixel = getRandowPixel();
		var destX;
		if (x == itemX) {
			destX = x;
		} else {
			destX = x < itemX ? x + randPixel : x - randPixel;
		}
		var destY;
		if (y == itemY) {
			destY = y;
		} else {
			destY = y < itemY ? y + randPixel : y - randPixel;
		}
		if (destX < 0) {
			destX = 0;
		}
		if (destX > 19 * 32) {
			destX = 19 * 32;
		}
		if (destY < 0) {
			destY = 0;
		}
		if (destY > 14 * 32) {
			destY = 14 * 32;
		}
		return {x: destX, y: destY};
	} else {
		return null;
	}
}

function getRandowPixel() {
	var rand = Math.floor(Math.random() * 3);
	switch (rand) {
		case 0:
			return 32;
		case 1:
			return 64;
		case 2:
			return 96;
		default:
			return 32;
	}
}

function farmerMove(farmer) {
	if (farmer.status == "stand") {
		var fx = farmer.mx;
		var fy = farmer.my;
		var itemMap = map.itemMap;
		for (var key in itemMap) {
			var item = itemMap[key];
			if (key && item && item.life <= 0 && item.maxLife > 0) {
				var xys = key.split(",");
				var dest = {x: parseInt(xys[0]), y: parseInt(xys[1])};
				farmer.addDest(dest);
			}
		}
	}
	setTimeout(arguments.callee, 3000, farmer);
}

function createFarmer() {
	var farmer = getRandomEnemy("farmer.png");
	farmer.setItem(items.items["bottle"]);
	var farmerWalk = new Walk(farmer);
	frontPainter.addWarrior(farmer);
	farmerMove(farmer);
}

function selectItem(img) {
	if (items.isLoaded()) {
		var name = util.getImageName(img.src);
		var item = null;
		if (name != "red") {
			item = items.items[name];
		}
		if (gameMode == 0) {
			if (name == "farmer") {
				createFarmer();
			} else {
				hero.setItem(item);
			}
		} else {
			hero.sendCommand({type:"selectItem", data:name});
		}
	}
}

front.onclick = function(e) {
	e.preventDefault();
	var loc = util.windowToCanvas(front, e.clientX, e.clientY);
	var dest = getDestination(loc);
	if (gameMode == 0) {
		hero.addDest(dest);
	} else {
		hero.sendCommand({type:"addDest", data:dest});
	}
};

front.onmousemove = function(e) {
	e.preventDefault();
	var loc = util.windowToCanvas(front, e.clientX, e.clientY);
	var dest = getDestination(loc);
	frontPainter.setDest(dest);
};

front.oncontextmenu = function(e) {
	e.preventDefault();
	hero.rollbackDest();
};

function getDestination(loc) {
	var BLOCK_PIXEL = 32;
	var countX = 0;
	var countY = 0;
	var resultX = loc.x;
	var resultY = loc.y;
	var destX = 0;
	var destY = 0;
	
	resultX -= BLOCK_PIXEL;
	while (resultX > 0) {
		resultX -= BLOCK_PIXEL;
		countX++;
	}
	
	resultY -= BLOCK_PIXEL;
	while (resultY > 0) {
		resultY -= BLOCK_PIXEL;
		countY++;
	}
	
	destX = countX * BLOCK_PIXEL;
	destY = countY * BLOCK_PIXEL;
	
	return {x: destX, y: destY};
}