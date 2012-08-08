var jsbots, c, thomas, importScripts, lastFire=0;

var inc = 150, total = 20;

importScripts("jsbots.worker.js", "jsbots.simulator.js");

function ordering(prop) {
	return function(a, b) {return prop(a) < prop(b) ? a : b;};
}

thomas = function(pworker) {
	var robot;

	function Thomas() {
	}
	Thomas.prototype = jsbots.api.robot(pworker);
	
	robot = new Thomas();
	return robot;
};

c = jsbots.api.communicator(this).robotConstructor(thomas);
c.on("tick", function(robot, others, data) {
	var index, count, dangers, minDanger, minDangerDir, minDangerIndex, 
		curDir, dirDiff, loc, closest, time, a,
		simulator = jsbots.simulator(others, data);
	
	closest = others.reduce(ordering(robot.distance));
	time = robot.distance(closest) * closest.speed() *
		jsbots.consts.robotSpeedRatio / jsbots.consts.projectileSpeedRatio;
	var sx = closest.x() - robot.x() + Math.sin(jsbots.util.toRad(closest.direction())) * time;
	var sy = closest.y() - robot.y() + Math.cos(jsbots.util.toRad(closest.direction())) * time;
	a = jsbots.util.relativeTo(robot.direction(), jsbots.util.toDeg(Math.atan2(sx, sy))) - robot.direction();
	a = jsbots.util.angleDiff(a, robot.turretAngle()) + robot.turretAngle();
	robot.mark("green", sx + robot.x(), sy + robot.y());
	robot.turretAngle(a);
	robot.status("Attacking "+closest.name()+" at "+a.toFixed(1));
	if (robot.charge() > 5 && robot.distance(closest) < 600 && data.elapsed > lastFire + 75) {
		lastFire = data.elapsed;
		robot.fire(5);
	}
	
	robot.speed(15);
	dangers = {};
	for (index=-20; index<=20; index++) {
		dangers[index] = 0;
	}
	for (count=1; count<=total; count++) {
		simulator.advance(inc);
		for (index=-20; index<=20; index++) {
			curDir = index/20*jsbots.consts.robotAngleSpeed*count*inc;
			loc = robot.project(inc*count, curDir);
			var curDanger = simulator.danger(loc.x, loc.y);
			dangers[index] += curDanger * Math.sqrt(total - count + 1);
			robot.mark("rgb("+Math.min(255, curDanger*15).toFixed(0)+",50,50)", loc.x, loc.y);
		}
	}
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

//	closest = others.reduce(ordering(robot.distance));
//	time = robot.distance(closest) / jsbots.consts.projectileSpeedRatio;
//	simulator = jsbots.simulator(others, data);
//	simulator.advance(time);
//	closest = simulator.robot(closest.name());
//	robot.mark("green", closest.x(), closest.y());
//	a = jsbots.util.relativeTo(robot.direction(), jsbots.util.toDeg(
//			Math.atan2(closest.x()-robot.x(),closest.y()-robot.y())));
//	robot.turretAngle(a - robot.direction());
//	robot.fire(5);
});