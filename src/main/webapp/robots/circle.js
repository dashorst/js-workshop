var jsbots, importScripts, circle;

importScripts("jsbots.worker.js");

circle = function(pworker, communicator) {
	var robot;
	
	function Circle() {
		communicator.on("tick.robot", this.process);
	}
	
	Circle.prototype = jsbots.api.robot(pworker, communicator);

	Circle.prototype.ai = function(others, data) {
		robot.speed(10);
		robot.direction(robot.direction() + 1);
		robot.mine(20);
	};
	
	robot = new Circle();
	return robot;
};

jsbots.api.communicator(this).robotConstructor(circle);