util.initAnimation();
	
var levelSpan = document.getElementById("s-lv");
var scoreSpan = document.getElementById("s-score");
var lifeDiv = document.getElementById("div-life");
var mapctx = document.getElementById("map").getContext("2d");
var frontcns = document.getElementById("front");
var frontctx = frontcns.getContext("2d");
var battlectx = document.getElementById("battle").getContext("2d");
var deadbody = new Image();
deadbody.src = "images/heros/deadbody.png";
var downLadder = new Image();
downLadder.src = "images/items/down_ladder.png";
var upLadder = new Image();
upLadder.src = "images/items/up_ladder.png";
var desert = new Image();
desert.src = "images/items/desert.png";
var mapimg = new Image();
mapimg.src = "images/default_map.png";
mapimg.onload = function() {
	mapctx.drawImage(this, 0, 0, 640, 480);
	initBuildings();
};

var isStarted = false;
var stage = 1;
var holeMax = 2;
var boxMax = 2;
var buildingMap = new BuildingMap();
buildingMap.setShowLaddersFunc(showLadders);
var holePosList = [];
var enemyList = [];
var hostage = null;
var effect = new Effect(battlectx);
var heroPos = {x:320, y:240};
var gun = new Gun(battlectx);
gun.setEnemyList(enemyList);
var hero = new Hero("images/heros/wolf.png", heroPos.x, heroPos.y, 0, frontctx, 2);
hero.setEffect(effect);
hero.setLabels(levelSpan, scoreSpan, lifeDiv);
hero.setGun(gun);
hero.setDeadbody(deadbody);
hero.setBuildingMap(buildingMap);
hero.setInitFunc(init);

function init(isUp) {
	if (isUp) {
		stageLevelUp();
	} else {
		stageLevelDown();
	}
	buildingMap = new BuildingMap();
	buildingMap.setShowLaddersFunc(showLadders);
	hero.setBuildingMap(buildingMap);
	holePosList = [];
	enemyList = [];
	gun.setEnemyList(enemyList);
	hostage = null;
	hero.setBuildingMap(buildingMap);
	mapctx.clearRect(0, 0, 640, 480);
	mapctx.drawImage(mapimg, 0, 0, 640, 480);
	initBuildings();
}

function stageLevelUp() {
	stage++;
	holeMax++;
	boxMax++;
}

function stageLevelDown() {
	if (stage > 0) {
		stage--;
		holeMax--;
		boxMax--;
	}
}

function start() {
	createEnemy();
	if (!isStarted) {
		animate();
		isStarted = true;
	}
}

function initBuildings() {
	createHoleOnMap();
}

function createHoleOnMap() {
	while (holePosList.length < holeMax) {
		var pos = getMapRandowPos();
		if (pos) {
			holePosList.push(pos);
			createBuilding("images/items/boom.png", pos.x, pos.y, 100);
		}
	}
	createBoxOnMap();
}

function createBoxOnMap() {
	var boxCount = 0;
	while (boxCount < boxMax) {
		var pos = getMapRandowPos();
		if (pos) {
			var box = createBuilding("images/items/box.png", pos.x, pos.y, 1);
			if (boxCount == 0) {
				hostage = new Hero("images/heros/farmer.png", pos.x, pos.y, 0, frontctx);
				hostage.setEffect(effect);
				hostage.setExp(1);
				hostage.setDeadbody(deadbody);
				hostage.MAX_BREATH = 100;
				enemyList.push(hostage);
				box.initHostage(hostage);
			} else {
				box.setTeasure();
			}
			boxCount++;
		}
	}
	start();
}

function getMapRandowPos() {
	var randX = Math.floor(Math.random() * 20) * 32;
	var randY = Math.floor(Math.random() * 15) * 32;
	if (!buildingMap.hasBuilding(randX, randY)
		&& randX != heroPos.x && randY != heroPos.y) {
		return {x:randX, y:randY};
	} else {
		return null;
	}
}

function createBuilding(imgSrc, x, y, life) {
	var building = new Building(mapctx, imgSrc, x, y, life);
	building.setBuildingMap(buildingMap);
	return building;
}

function createEnemy() {
	var pos = getRandomPos();
	if (pos) {
		if (buildingMap.hasBuilding(pos.x, pos.y)) {
			var enemy = new Hero("images/heros/crocodile.png", pos.x, pos.y, 0, frontctx);
			enemy.setStep(1);
			enemy.setExp(10);
			enemyList.push(enemy);
		} else {
			for (var i in holePosList) {
				var hole = holePosList[i];
				if (hole.x == pos.x && hole.y == pos.y) {
					holePosList.splice(i, 1);
					break;
				}
			}
			arguments.callee();
		}
	}
	setTimeout(arguments.callee, 10000);
}

function showLadders() {
	mapctx.clearRect(hostage.x, hostage.y, 32, 32);
	mapctx.drawImage(desert, 0, 0, 32, 32, hostage.x, hostage.y, 32, 32);
	hostage.setDeadbody(null);
	var ladder;
	if (hostage.complete && !hostage.die) {
		hostage.destory();
		mapctx.drawImage(upLadder, 0, 0, upLadder.width, upLadder.height, hostage.x, hostage.y, upLadder.width, upLadder.height);
		ladder = Building.prototype.createTeasure("up_ladder", mapctx);
	} else {
		mapctx.drawImage(downLadder, 0, 0, downLadder.width, downLadder.height, hostage.x, hostage.y, downLadder.width, downLadder.height);
		var building = buildingMap.getBuilding(hostage.x, hostage.y);
		if (building) {
			buildingMap.removeBuilding(building);
		}
		ladder = Building.prototype.createTeasure("down_ladder", mapctx);
	}
	buildingMap.addTeasure(hostage.x, hostage.y, ladder);
}

function getRandomPos() {
	var rand = Math.floor(Math.random() * holePosList.length);
	return holePosList[rand];
}

function draw() {
	hero.draw();
	if (hero.die) {
		location.replace("gameover.html");
	}
	for (var i in enemyList) {
		var enemy = enemyList[i];
		if (enemy.complete) {
			enemy.draw();
			if (enemy.die) {
				if (!enemy.deadbody) {
					enemyList.splice(i, 1);
				}
			} else {
				if (enemy.name == "farmer") {
					if (enemy.complete) {
						enemy.walkTo(getRandomDest(hostage));
					}
				} else {
					if (hostage && hostage.complete && !hostage.die) {
						enemy.walkTo(hostage);
					} else {
						enemy.walkTo(hero);
					}
				}
			}
		}
	}
}

var RAND_DIST = 64;

function getRandomDest(hero) {
	var random = Math.floor(Math.random() * 4);
	switch (random) {
		case 0:
			return {x: hero.x, y: hero.y + RAND_DIST};
		case 1:
			return {x: hero.x - RAND_DIST, y: hero.y};
		case 2:
			return {x: hero.x + RAND_DIST, y: hero.y};
		case 3:
			return {x: hero.x, y: hero.y - RAND_DIST};
		default:
			return {x: hero.x, y: hero.y};
	}
	return {x: hero.x, y: hero.y};
}

function animate(time) {
	frontctx.clearRect(0, 0, 640, 480);
	draw();
	window.requestAnimation(arguments.callee);
}

window.onkeydown = function(event) {
	doKeyboardAction(event.keyCode);
};

window.onkeyup = function(event) {
	clearKeyboardAction(event.keyCode);
};

function doKeyboardAction(code) {
	switch (code) {
		case 87:
			hero.setCommand("U");
			break;
		case 83:
			hero.setCommand("D");
			break;
		case 65:
			hero.setCommand("L");
			break;
		case 68:
			hero.setCommand("R");
			break;
        case 74:
            hero.fire(hero.direction);
            break;
		default:
			break;
	}
}

function clearKeyboardAction(code) {
    if (code == 87 || code == 83 || code == 65 || code == 68) {
        hero.setCommand(null);
    }
}

frontcns.onmousedown = function(event) {
	event.preventDefault();
	var loc = util.windowToCanvas(frontcns, event.clientX, event.clientY);
	var herocx = hero.x + 16;
	var herocy = hero.y + 16;
	var disx = loc.x - herocx;
	var disy = loc.y - herocy;
	
	if (Math.abs(disx) > Math.abs(disy)) {
		//Left
		if (disx < 0) {
			hero.fire(1);
		//Right
		} else {
			hero.fire(2);
		}
	} else {
		//Up
		if (disy < 0) {
			hero.fire(3);
		//Down
		} else {
			hero.fire(0);
		}
	}
};