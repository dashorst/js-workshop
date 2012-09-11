var jsbots, importScripts, tower;

importScripts("jsbots.worker.js");

tower = function(pworker, communicator) {
	var robot;
	
	function Tower() {
		communicator.on("tick.robot", this.process);
	}
	
	Tower.prototype = jsbots.api.robot(pworker, communicator);
	
	Tower.prototype.ai = function(others, data) {
		robot.speed(10);
		robot.direction(Math.floor(data.elapsed / 5000) * 90);
	};
	
	robot = new Tower();
	return robot;
};

jsbots.api.communicator(this).robotConstructor(tower);