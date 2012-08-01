var jsbots, c, importScripts;

importScripts("jsbots.worker.js");

c = jsbots.api.communicator(this);
c.on("tick", function(robot, others, data) {
	robot.speed(10);
	robot.direction(Math.floor(data.elapsed / 5000) * 90);
});