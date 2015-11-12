var Effect = function(context) {
	this.context = context;
};

Effect.prototype = {
	effectList: (function() {
		var effect1 = new Image();
		effect1.src = "images/effects/bullet1.png";
		var effect2 = new Image();
		effect2.src = "images/effects/bullet2.png";
		return [effect1, effect2];
	})(),
	
	hitEffect: function(x, y, index, ins) {
		if (!ins) {
			ins = this;
		}
		if (!index) {
			index = 0;
		}
		if (index < ins.effectList.length) {
			var effect = ins.effectList[index];
			ins.context.save();
			ins.context.translate(x, y);
			ins.context.clearRect(0, 0, 26, 26);
			ins.context.drawImage(effect, 0, 0, 26, 26);
			ins.context.restore();
			setTimeout(arguments.callee, 20, x, y, ++index, ins);
		} else {
			ins.context.save();
			ins.context.translate(x, y);
			ins.context.clearRect(0, 0, 26, 26);
			ins.context.restore();
		}
	}
};