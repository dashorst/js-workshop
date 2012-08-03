var jsbots, c, importScripts;

var inc = 100, totalInc = 10 * inc;

importScripts("jsbots.worker.js", "jsbots.simulator.js");

c = jsbots.api.communicator(this);
c.on("tick", function(robot, others, data) {
	var index, minDanger=1000, minDangerDir, curDir,
		dirDiff = jsbots.consts.robotAngleSpeed * totalInc,
		simulator = jsbots.simulator(others, data);
	robot.speed(15);
	simulator.advance(inc);
	simulator.advance(inc);
	simulator.advance(inc);
	simulator.advance(inc);
	simulator.advance(inc);
	simulator.advance(inc);
	simulator.advance(inc);
	simulator.advance(inc);
	simulator.advance(inc);
	simulator.advance(inc);
	for (index=-20; index<=20; index++) {
		if (index !== 0) {
			curDir = index/20*dirDiff;
			var signum = index < 0 ? -1 : 1;
			var frac = Math.abs(curDir/360);
			var peri = robot.speed()*jsbots.consts.robotSpeedRatio*totalInc/frac;
			var radius = peri/2/Math.PI;
			var cang = jsbots.util.toRad(robot.direction() + signum * 90);
			var cx = robot.x() + Math.sin(cang) * radius;
			var cy = robot.y() + Math.cos(cang) * radius;
			var tang = cang - Math.PI + jsbots.util.toRad(curDir);
			var tx = cx + Math.sin(tang) * radius;
			var ty = cy + Math.cos(tang) * radius;
			var curDanger = simulator.danger(tx, ty);
			if (curDanger < minDanger) {
				minDanger = curDanger;
				minDangerDir = robot.direction() + curDir;
			}
			robot.mark("yellow", tx, ty);
		}
	}
	robot.direction(minDangerDir);
});