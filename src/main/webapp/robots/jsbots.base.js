var jsbots;

(function(){
	jsbots = {};
	
	jsbots.robot = function() {
		var robot,
			color,
			x, y,
			speed, targetSpeed,
			angle, targetAngle;
		
		function JSRobot() {
			x = Math.random() * 1300 + 100;
			y = Math.random() * 700 + 100;
			speed = 0;
			targetSpeed = 0;
			angle = 0;
			targetAngle = 0;
		}
		
		JSRobot.prototype.x = function(nx) {
			if (!arguments.length) {return x;}
			x = nx;
			return this;
		};
		
		JSRobot.prototype.y = function(ny) {
			if (!arguments.length) {return y;}
			y = ny;
			return this;
		};
		
		JSRobot.prototype.angle = function(nangle) {
			if (!arguments.length) {return angle;}
			angle = nangle;
			return this;
		};
		
		JSRobot.prototype.targetAngle = function(ntargetAngle) {
			if (!arguments.length) {return targetAngle;}
			targetAngle = ntargetAngle;
			return this;
		};
		
		JSRobot.prototype.speed = function(nspeed) {
			if (!arguments.length) {return speed;}
			speed = nspeed;
			return this;
		};
		
		JSRobot.prototype.targetSpeed = function(ntargetSpeed) {
			if (!arguments.length) {return targetSpeed;}
			targetSpeed = ntargetSpeed;
			return this;
		};
		
		JSRobot.prototype.color = function(nc) {
			if (!arguments.length) {return color;}
			color = nc;
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