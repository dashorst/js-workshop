var jsbots, c, importScripts;

importScripts("../d3.dispatch.js", "jsbots.base.js", "jsbots.api.js");

function ordering(prop) {
	return function(a, b) {return prop(a) < prop(b) ? a : b;};
}

c = jsbots.api.communicator(this);
c.on("tick", function(robot, others, data) {
	var a, sx, sy, closest, time;
	closest = others.reduce(ordering(robot.distance));
	time = robot.distance(closest) * closest.speed() *
		jsbots.consts.robotSpeedRatio / jsbots.consts.projectileSpeedRatio;
	sx = closest.x() - robot.x() + Math.sin(jsbots.util.toRad(closest.angle())) * time;
	sy = closest.y() - robot.y() + Math.cos(jsbots.util.toRad(closest.angle())) * time;
	
	a = Math.atan2(sx, sy)*180/Math.PI;
	while (robot.angle() - a > 180) {
		a += 360;
	}
	while (a - robot.angle() > 180) {
		a -= 360;
	}
	robot.speed((Math.sqrt(sx*sx+sy*sy) - 200)/20);
	robot.turretAngle(a-robot.angle());
	robot.angle(a-20);
	if (robot.charge() > 5) {
		robot.fire();
	}
});