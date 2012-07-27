var jsbots;

(function(){
	jsbots = {};
	
	jsbots.robot = function() {
		var robot,
			color,
			x, y,
			speed, targetSpeed,
			angle, targetAngle,
			lastCollision = 0,
			actions = [];
		
		function JSRobot() {
			x = Math.random() * 1300 + 100;
			y = Math.random() * 700 + 100;
			speed = 0;
			targetSpeed = 0;
			angle = 0;
			targetAngle = 0;
		}
		
		function updateValue(old, target, delta) {
			return old + Math.min(delta, Math.max(-delta, target - old));
		}
		
		function processActions() {
			actions.forEach(function(a) {
				if (a.type === "speed") {
					targetSpeed = a.value;
				} else if (a.type === "angle") {
					targetAngle = a.value;
				}
			});
			actions = [];
		}
		
		JSRobot.prototype.tick = function(delta) {
			processActions();
			speed = Math.min(15, Math.max(-5, updateValue(speed, targetSpeed, delta/200))); 
			angle = updateValue(angle, targetAngle, delta/10);
			x += Math.sin(angle*Math.PI/180) * speed * delta / 100;
			y += Math.cos(angle*Math.PI/180) * speed * delta / 100;
		};
		
		JSRobot.prototype.addAction = function(action) {
			actions.push(action);
		};
		
		JSRobot.prototype.collide = function(elapsed) {
			if (lastCollision + 100 < elapsed) {
				speed = -speed;
				lastCollision = elapsed;
			}
		};
		
		JSRobot.prototype.x = function() {
			return x;
		};
		
		JSRobot.prototype.y = function() {
			return y;
		};
		
		JSRobot.prototype.angle = function() {
			return angle;
		};
		
		JSRobot.prototype.speed = function() {
			return speed;
		};
		
		JSRobot.prototype.color = function(c) {
			if (!arguments) {return c;}
			color = c;
			return this;
		};
		
		JSRobot.prototype.getJSON = function() {
			return {
				x: x,
				y: y,
				speed: speed,
				targetSpeed: targetSpeed,
				angle: angle,
				targetAngle: targetAngle,
				color: color
			};
		};
		
		robot = new JSRobot();
		return robot;
	};
}());