var jsbots, c, importScripts, lastFire=0;

importScripts("jsbots.worker.js");

function ordering(prop) {
	return function(a, b) {return prop(a) < prop(b) ? a : b;};
}

c = jsbots.api.communicator(this);
c.on("tick", function(robot, others, data) {
	var a, sx, sy, closest, time;
	closest = others.reduce(ordering(robot.distance));
	time = robot.distance(closest) * closest.speed() *
		jsbots.consts.robotSpeedRatio / jsbots.consts.projectileSpeedRatio;
	sx = closest.x() - robot.x() + Math.sin(jsbots.util.toRad(closest.direction())) * time;
	sy = closest.y() - robot.y() + Math.cos(jsbots.util.toRad(closest.direction())) * time;
	a = jsbots.util.relativeTo(robot.direction(), jsbots.util.toDeg(Math.atan2(sx, sy)));
	robot.mark("white", sx + robot.x(), sy + robot.y());
	robot.speed((Math.sqrt(sx*sx+sy*sy) - 200)/20);
	robot.turretAngle(a-robot.direction());
	robot.direction(a-20);
	robot.status("Attacking "+closest.name());
	if (robot.charge() > 5 && robot.distance(closest) < 300 && data.elapsed > lastFire + 75) {
		lastFire = data.elapsed;
		robot.fire(5);
	}
});