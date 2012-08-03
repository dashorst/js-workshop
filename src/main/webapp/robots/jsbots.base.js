var jsbots;

(function(){
	jsbots = {};
	
	jsbots.robot = function() {
		var robot,
			name,
			status,
			hitpoints,
			charge,
			color,
			x, y,
			speed, targetSpeed,
			direction, targetDirection,
			turretAngle, targetTurretAngle,
			dropped,
			events = [];
		
		function JSRobot() {
			x = Math.random() * 1300 + 100;
			y = Math.random() * 700 + 100;
			status = "";
			charge = 0;
			hitpoints = jsbots.consts.robotHitpoints;
			speed = 0;
			targetSpeed = 0;
			direction = 0;
			targetDirection = 0;
			turretAngle = 0;
			targetTurretAngle = 0;
			dropped = 0;
		}
		
		JSRobot.prototype.name = function(nname) {
			if (!arguments.length) {return name;}
			name = nname;
			return this;
		};
		
		JSRobot.prototype.status = function(nstatus) {
			if (!arguments.length) {return status;}
			status = nstatus;
			return this;
		};
		
		JSRobot.prototype.hitpoints = function(nhitpoints) {
			if (!arguments.length) {return hitpoints;}
			hitpoints = nhitpoints;
			return this;
		};
		
		JSRobot.prototype.charge = function(ncharge) {
			if (!arguments.length) {return charge;}
			charge = ncharge;
			return this;
		};
		
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
		
		JSRobot.prototype.direction = function(ndirection) {
			if (!arguments.length) {return direction;}
			direction = ndirection;
			return this;
		};
		
		JSRobot.prototype.targetDirection = function(ntargetDirection) {
			if (!arguments.length) {return targetDirection;}
			targetDirection = ntargetDirection;
			return this;
		};
		
		JSRobot.prototype.turretAngle = function(nturretAngle) {
			if (!arguments.length) {return turretAngle;}
			turretAngle = nturretAngle;
			return this;
		};
		
		JSRobot.prototype.targetTurretAngle = function(ntargetTurretAngle) {
			if (!arguments.length) {return targetTurretAngle;}
			targetTurretAngle = ntargetTurretAngle;
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

		JSRobot.prototype.dropped = function() {
			return dropped;
		};
		
		JSRobot.prototype.dropMessage = function() {
			dropped++;
			return this;
		};
		
		JSRobot.prototype.events = function() {
			return events;
		};
		
		JSRobot.prototype.addEvent = function(event) {
			events.push(event);
			return this;
		};
		
		JSRobot.prototype.clearEvents = function() {
			events = [];
			return this;
		};
		
		function updateValue(old, target, delta) {
			return old + Math.min(delta, Math.max(-delta, target - old));
		}
		
		JSRobot.prototype.advance = function(delta) {
			this.speed(jsbots.util.inRange(
					jsbots.consts.robotMinSpeed,
					jsbots.consts.robotMaxSpeed,
					updateValue(this.speed(), this.targetSpeed(), delta * jsbots.consts.robotAccel))); 
			this.direction(
					updateValue(this.direction(), this.targetDirection(), delta * jsbots.consts.robotAngleSpeed));
			this.turretAngle(
					updateValue(this.turretAngle(), this.targetTurretAngle(), delta * jsbots.consts.robotTurretSpeed));
			this.x(this.x() + Math.sin(jsbots.util.toRad(this.direction())) *
					this.speed() * delta * jsbots.consts.robotSpeedRatio);
			this.y(this.y() + Math.cos(jsbots.util.toRad(this.direction())) *
					this.speed() * delta * jsbots.consts.robotSpeedRatio);
			this.charge(Math.min(jsbots.consts.robotMaxCharge, this.charge() + delta * jsbots.consts.robotChargeRate));
		};
		
		JSRobot.prototype.fromJSON = function(json) {
			name = json.name;
			status = json.status;
			hitpoints = json.hitpoints;
			charge = json.charge;
			x = json.x;
			y = json.y;
			speed = json.speed;
			targetSpeed = json.targetSpeed;
			direction = json.direction;
			targetDirection = json.targetDirection;
			turretAngle = json.turretAngle;
			targetTurretAngle = json.targetTurretAngle;
			events = json.events;
			dropped = json.dropped;
			color = json.color;
			return this;
		};
		
		JSRobot.prototype.getJSON = function() {
			return {
				name: name,
				status: status,
				hitpoints: hitpoints,
				charge: charge,
				x: x,
				y: y,
				speed: speed,
				targetSpeed: targetSpeed,
				direction: direction,
				targetDirection: targetDirection,
				turretAngle: turretAngle,
				targetTurretAngle: targetTurretAngle,
				events: events,
				dropped: dropped,
				color: color
			};
		};
		
		robot = new JSRobot();
		return robot;
	};
	
	jsbots.consts = {
		arenaWidth: 1500,
		arenaHeight: 900,
		gameSpeed: 1,
		robotSize: 30,
		robotMaxSpeed: 15,
		robotMinSpeed: -5,
		robotSpeedRatio: 0.01,
		robotAccel: 0.005,
		robotAngleSpeed: 0.05,
		robotTurretSpeed: 0.1,
		robotChargeRate: 0.005,
		robotMaxCharge: 50,
		robotHitpoints: 200,
		wallDamage: 10,
		projectileSpeedRatio: 0.30,
		debug: true
	};
	
	Object.freeze(jsbots.consts);
	
	jsbots.util = {};
	
	jsbots.util.normalize = function(deg) {
		var ret = (deg + 180) % 360;
		if (ret < 0) {
			ret += 360;
		}
		return ret - 180;
	};
	
	jsbots.util.angleDiff = function(deg1, deg2) {
		return jsbots.util.normalize(deg1 - deg2);
	};
	
	jsbots.util.relativeTo = function(base, angle) {
		return base - jsbots.util.angleDiff(base, angle);
	};
	
	jsbots.util.toDeg = function(rad) {
		return rad*180/Math.PI;
	};
	
	jsbots.util.toRad = function(deg) {
		return deg*Math.PI/180;
	};
	
	jsbots.util.dist = function(x1, y1, x2, y2) {
		var dx = x1-x2,
			dy = y1-y2;
		return Math.sqrt(dx*dx+dy*dy);
	};
	
	jsbots.util.inRange = function(min, max, value) {
		return Math.max(min, Math.min(max, value));
	};
}());