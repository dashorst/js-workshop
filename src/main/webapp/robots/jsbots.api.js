var d3, jsbots;

(function(){
	jsbots.api = {};
	
	jsbots.api.communicator = function(pworker) {
		var communicator,
			event = d3.dispatch("start", "tick", "hit", "collision"),
			worker = pworker,
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
			var thisRobot, robots;
			thisRobot = jsbots.api.robot(worker).fromJSON(data.robots[name]);
			robots = objectValues(data.robots)
				.filter(function(r) {return r.name !== thisRobot.name();})
				.map(function(r) {return jsbots.robot().fromJSON(r);});
			thisRobot.events().forEach(function(e) {
				event[e.type](thisRobot, robots, data, e);
			});
			event.tick(thisRobot, robots, data);
		}
		
		Communicator.prototype.messageReceived = function(e) {
			if (e.data.type === "start") {
				name = e.data.name;
				event.start(e.data);
			} else if (e.data.type === "tick") {
				processTick(e.data);
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
		
		JSAPIRobot.prototype.angle = function(nangle) {
			if (arguments.length === 1) {
				worker.postMessage({type: "angle", value: nangle});
			}
			return superPrototype().angle.apply(this, arguments);
		};
		
		JSAPIRobot.prototype.turretAngle = function(nturretAngle) {
			if (arguments.length === 1) {
				worker.postMessage({type: "turretAngle", value: nturretAngle});
			}
			return superPrototype().turretAngle.apply(this, arguments);
		};
		
		JSAPIRobot.prototype.fire = function() {
			worker.postMessage({type: "fire"});
			return this;
		};
		
		JSAPIRobot.prototype.distance = function(other) {
			var dx = robot.x() - other.x(),
				dy = robot.y() - other.y();
			return Math.sqrt(dx*dx + dy*dy);
		};
		
		robot = new JSAPIRobot();
		return robot;
	};
}());