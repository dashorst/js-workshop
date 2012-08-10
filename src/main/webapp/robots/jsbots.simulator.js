var d3, jsbots;

(function(){
	jsbots.simulator = function() {
		var simulator,
			robots = {},
			projectiles;
		
		function RobotsSimulator() {
		}
		
		RobotsSimulator.prototype.tick = function(self, others, data) {
			var oldRobots = robots;
			robots = {};
			others.forEach(function(r) {
				var oldRobot = oldRobots[r.name()];
				if (oldRobot) {
					robots[r.name()] = oldRobot.fromJSON(r.getJSON(), data.delta);
				} else {
					robots[r.name()] = jsbots.simulator.robot().fromJSON(r.getJSON(), data.delta);
				}
			});
			projectiles = data.projectiles.map(function(p) {
				return {charge:p.charge, direction: p.direction, x:p.x, y:p.y};
			});
		};
		
		function advanceSmallStep(delta) {
			jsbots.util.toArray(robots).forEach(function(r) {
				r.advance(delta);
			});
			projectiles.forEach(function(p) {
				p.x += Math.sin(jsbots.util.toRad(p.direction)) *
					delta * jsbots.consts.projectileSpeedRatio;
				p.y += Math.cos(jsbots.util.toRad(p.direction)) *
					delta * jsbots.consts.projectileSpeedRatio;
			});
		}

		function advance(delta) {
			var curDelta, totalDelta = 0;
			while (totalDelta < delta) {
				curDelta = Math.min(1000 / jsbots.consts.maxFrameRate, delta - totalDelta);
				totalDelta += curDelta;
				advanceSmallStep(curDelta);
			}
		}
		
		RobotsSimulator.prototype.simulate = function(steps, stepSize, process) {
			var step = 1;
			for (; step<=steps; step++) {
				advance(stepSize);
				process(step, step * stepSize, this.robots(), projectiles);
			}
		};
		
		RobotsSimulator.prototype.danger = function(x, y) {
			var ret = 0;
			jsbots.util.toArray(robots).forEach(function(r) {
				var dist = jsbots.util.dist(x, y, r.x(), r.y()) - 60;
				ret += jsbots.util.inRange(0, 10, (90 - dist)/9);
			});
			projectiles.forEach(function(p) {
				var dist = jsbots.util.dist(x, y, p.x, p.y) - 30;
				ret += jsbots.util.inRange(0, p.charge, (20 - dist)/20*p.charge*5);
			});
			ret += jsbots.util.inRange(0, 30, (40 - x)/3);
			ret += jsbots.util.inRange(0, 30, (40 - y)/3);
			ret += jsbots.util.inRange(0, 30, (40 - (jsbots.consts.arenaWidth-x))/3);
			ret += jsbots.util.inRange(0, 30, (40 - (jsbots.consts.arenaHeight-y))/3);
			return ret;
		};
		
		RobotsSimulator.prototype.robot = function(name) {
			return robots[name];
		};
		
		RobotsSimulator.prototype.robots = function() {
			return jsbots.util.toArray(robots);
		};
		
		simulator = new RobotsSimulator();
		return simulator;
	};
	
	jsbots.simulator.robot = function() {
		var robot,
			gxdirection = [0],
			deltas = [],
			rotationalSpeed;
		
		function superPrototype() {
			return Object.getPrototypeOf(Object.getPrototypeOf(robot));
		}
		
		function JSSimRobot() {
		}

		JSSimRobot.prototype = jsbots.robot();
		
		JSSimRobot.prototype.advance = function(delta) {
			this.targetDirection(this.direction() + rotationalSpeed * delta);
			return superPrototype().advance.apply(this, arguments);
		};
		
		JSSimRobot.prototype.fromJSON = function(json, delta) {
			rotationalSpeed = (json.direction - gxdirection[0]) /
				deltas.reduce(function(r, l){return r + l;}, delta);
			gxdirection.push(json.direction);
			deltas.push(delta);
			if (gxdirection.length > 4) {
				gxdirection.splice(0, 1);
			}
			if (deltas.length > 3) {
				deltas.splice(0, 1);
			}
			return superPrototype().fromJSON.call(this, json);
		};
		
		robot = new JSSimRobot();
		return robot;
	};
}());