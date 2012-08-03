var d3, jsbots;

(function(){
	jsbots.api = {};
	
	jsbots.api.communicator = function(pworker) {
		var communicator,
			event = d3.dispatch("start", "tick", "hit", "collision"),
			worker = pworker,
			startTime,
			name;
		
		function Communicator() {
			pworker.addEventListener("message", this.messageReceived, false);
		}
		
		function objectValues(obj) {
			var cur, ret = [];
			for (cur in obj) {
				ret.push(obj[cur]);
			}
			return ret;
		}
		
		function processTick(data) {
			var thisRobot, robots, curTime;
			curTime = Date.now();
			if (!startTime) {
				startTime = curTime - data.elapsed;
			}
			thisRobot = jsbots.api.robot(worker).fromJSON(data.robots[name]);
			robots = objectValues(data.robots)
				.filter(function(r) {return r.name !== thisRobot.name();})
				.map(function(r) {return jsbots.robot().fromJSON(r);});
			thisRobot.events().forEach(function(e) {
				event[e.type](thisRobot, robots, data, e);
			});
			if (curTime - startTime < data.elapsed + 20) {
				event.tick(thisRobot, robots, data);
			} else {
				thisRobot.dropMessage();
			}
		}
		
		Communicator.prototype.messageReceived = function(e) {
			if (e.data.type === "start") {
				name = e.data.name;
				event.start(e.data);
			} else if (e.data.type === "tick") {
				processTick(e.data);
			} else if (e.data.type === "stop") {
				worker.close();
			}
		};
		
		Communicator.prototype.name = function() {
			return name;
		};
		
		communicator = new Communicator();
		d3.rebind(communicator, event, "on");
		return communicator;
	};
	
	jsbots.api.robot = function(pworker) {
		var robot,
			worker = pworker;
		
		function superPrototype() {
			return Object.getPrototypeOf(Object.getPrototypeOf(robot));
		}
		
		function JSAPIRobot() {
		}
		
		JSAPIRobot.prototype = jsbots.robot();
		
		JSAPIRobot.prototype.speed = function(nspeed) {
			if (arguments.length === 1) {
				worker.postMessage({type: "speed", value: nspeed});
			}
			return superPrototype().speed.apply(this, arguments);
		};
		
		JSAPIRobot.prototype.direction = function(ndirection) {
			if (arguments.length === 1) {
				worker.postMessage({type: "direction", value: ndirection});
			}
			return superPrototype().direction.apply(this, arguments);
		};
		
		JSAPIRobot.prototype.turretAngle = function(nturretAngle) {
			if (arguments.length === 1) {
				worker.postMessage({type: "turretAngle", value: nturretAngle});
			}
			return superPrototype().turretAngle.apply(this, arguments);
		};
		
		JSAPIRobot.prototype.status = function(nstatus) {
			if (arguments.length === 1) {
				worker.postMessage({type: "status", value: nstatus});
			}
			return superPrototype().status.apply(this, arguments);
		};
		
		JSAPIRobot.prototype.dropMessage = function() {
			worker.postMessage({type: "drop"});
			return this;
		};
		
		JSAPIRobot.prototype.log = function(value) {
			worker.postMessage({type: "log", value: value});
			return this;
		};
		
		JSAPIRobot.prototype.mark = function(color, x, y) {
			worker.postMessage({type: "mark", color: color, x: x, y: y});
			return this;
		};
		
		JSAPIRobot.prototype.fire = function(charge) {
			if (!charge) {
				charge = robot.charge();
			}
			worker.postMessage({type: "fire", value: charge});
			robot.charge(robot.charge() - charge);
			return this;
		};
				
		JSAPIRobot.prototype.distance = function(other) {
			return jsbots.util.dist(robot.x(), robot.y(), other.x(), other.y());
		};
		
		robot = new JSAPIRobot();
		return robot;
	};
}());