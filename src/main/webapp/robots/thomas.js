var jsbots, thomas, importScripts;

var inc = 150, total = 20;

importScripts("jsbots.worker.js", "jsbots.simulator.js");

thomas = function(pworker, communicator) {
	var robot,
		simulator = jsbots.simulator(),
		target,
		lastFire = 0;
	
	function Thomas() {
		communicator.on("tick.sim", simulator.tick);
		communicator.on("tick.robot", this.process);
		this.aimAt(function() {return target;});
		this.fireCharge(this.fireCondition);
	}
	
	Thomas.prototype = jsbots.api.robot(pworker, communicator);
	
	function ordering(prop) {
		return function(a, b) {return prop(a) < prop(b) ? a : b;};
	}
	
	function dangerFunction(x, y) {
		var mindist = this.robots().reduce(function(m, r) {
			return Math.min(m, jsbots.util.dist(x, y, r.x(), r.y()));
		}, 2000);
		return Math.min(5, 1000 / mindist);
	}

	Thomas.prototype.ai = function(others, data) {
		var index, count, dangers, minDanger, minDangerDir, minDangerIndex, 
		curDir, loc, curDanger;
	
		//simulator.addDanger(dangerFunction);
		robot.speed(15);
		
		target = undefined;
		dangers = {};
		for (index=-20; index<=20; index++) {
			dangers[index] = 0;
		}
		simulator.simulate(total, inc, function(step, time, robots){
			var range = time * jsbots.consts.projectileSpeedRatio + jsbots.consts.projectileStartDistance;
			robots.forEach(function(r) {
				var inrange = jsbots.util.dist(r.x(), r.y(), robot.x(), robot.y()) < range;
				if (inrange && !target) {
					target = {x: r.x(), y: r.y()};
				}
				robot.mark(r.color(), r.x(), r.y(), inrange ? 4 : 2);
			});
			for (index=-20; index<=20; index++) {
				curDir = index/20 * jsbots.consts.robotAngleSpeed * time;
				loc = robot.project(time, curDir);
				curDanger = simulator.danger(loc.x, loc.y);
				dangers[index] += curDanger * Math.sqrt(total - step + 1);
				robot.mark("rgb("+Math.min(255, curDanger*15).toFixed(0)+",50,50)", loc.x, loc.y);
			}
		});
		
		minDanger = dangers[0];
		minDangerDir = robot.direction();
		minDangerIndex = 0;
		for (index=-20; index<=20; index++) {
			curDir = index/20*jsbots.consts.robotAngleSpeed*total*inc;
			curDanger = dangers[index];
			if (curDanger < minDanger ||
				(curDanger === minDanger && Math.abs(index) < Math.abs(minDangerIndex))) {
				minDanger = curDanger;
				minDangerDir = robot.direction() + curDir;
				minDangerIndex = index;
			}
		}
		for (count=1; count<=total; count++) {
			curDir = minDangerIndex/20*jsbots.consts.robotAngleSpeed*count*inc;
			loc = robot.project(inc*count, curDir);
			robot.mark("blue", loc.x, loc.y);
		}
		robot.direction(minDangerDir);
	};
	
	Thomas.prototype.fireCondition = function(others, data) {
		var diff = Math.abs(jsbots.util.angleDiff(robot.turretAngle(), robot.currentTurretAngle()));
		if ((target && robot.charge() > 5 && data.elapsed > lastFire + 75 && diff < 2)
				|| robot.charge() === jsbots.consts.robotMaxCharge) {
			lastFire = data.elapsed;
			return {charge: 5, speed: 1};
		}
	};
	
	robot = new Thomas();
	return robot;
};

jsbots.api.communicator(this).robotConstructor(thomas);
