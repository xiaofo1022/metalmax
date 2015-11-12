/**
 * Walk
 */
var Walk = function(warrior) {
	this.warrior = warrior;
	this.speed = 15;
	this.walk(this);
};

Walk.prototype = {
	walk: function(instance) {
		var dest = instance.warrior.destList[0];
		if (dest && !dest.complete) {
			if (instance.warrior.status == "stand") {
				instance.dest = dest;
				if (dest.x != instance.warrior.mx) {
					instance.warrior.status = "walk";
					var directionX = dest.x > instance.warrior.mx ? "R" : "L";
					instance.direct = directionX;
					instance.warrior.setDirection(directionX);
					instance.walkX(instance);
				} else if (dest.y != instance.warrior.my) {
					instance.warrior.status = "walk";
					var directionY = dest.y > instance.warrior.my ? "D" : "U";
					instance.direct = directionY;
					instance.warrior.setDirection(directionY);
					instance.walkY(instance);
				} else {
					if (instance.warrior.destList[0]) {
						instance.warrior.destList[0].complete = true;
					}
				}
			}
		}
		setTimeout(arguments.callee, instance.speed, instance);
	},
		
	walkX: function(instance) {
		if (instance.warrior.mx != instance.dest.x) {
			if (instance.direct == "R") {
				instance.warrior.setMapX(instance.warrior.mx + 1);
			} else {
				instance.warrior.setMapX(instance.warrior.mx - 1);
			}
			setTimeout(arguments.callee, instance.speed, instance);
		} else {
			instance.warrior.status = "stand";
		}
	},
	
	walkY: function(instance) {
		if (instance.warrior.my != instance.dest.y) {
			if (instance.direct == "D") {
				instance.warrior.setMapY(instance.warrior.my + 1);
			} else {
				instance.warrior.setMapY(instance.warrior.my - 1);
			}
			setTimeout(arguments.callee, instance.speed, instance);
		} else {
			instance.warrior.status = "stand";
		}
	}
};