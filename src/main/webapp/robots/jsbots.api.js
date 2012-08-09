var d3, jsbots;

(function(){
	jsbots.api = {};
	
	jsbots.api.communicator = function(pworker) {
		var communicator,
			event = d3.dispatch("start", "tick", "hit", "collision"),
			worker = pworker,
			startTime,
			name,
			robotConstructor = jsbots.api.robot,
			thisRobot;
		
		function Communicator() {
			pworker.addEventListener("message", this.messageReceived, false);
		}
		
		function processTick(data) {
			var robots, curTime;
			curTime = Date.now();
			if (!startTime) {
				startTime = curTime - data.elapsedRaw;
			}
			thisRobot.fromJSON(data.robots[name]);
			robots = jsbots.util.toArray(data.robots)
				.filter(function(r) {return r.name !== thisRobot.name();})
				.map(function(r) {return jsbots.robot().fromJSON(r);});
			thisRobot.events().forEach(function(e) {
				event[e.type](thisRobot, robots, data, e);
			});
			if (curTime - startTime < data.elapsedRaw + data.delta * 2 / jsbots.consts.gameSpeed) {
				event.tick(thisRobot, robots, data);
			} else {
				thisRobot.dropMessage();
			}
		}
		
		Communicator.prototype.messageReceived = function(e) {
			if (e.data.type === "start") {
				name = e.data.name;
				thisRobot = robotConstructor(worker);
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
		
		Communicator.prototype.robotConstructor = function(pRobotConstructor) {
			if (!arguments.length) {return robotConstructor;}
			robotConstructor = pRobotConstructor;
			return this;
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
				
		JSAPIRobot.prototype.project = function(time, rotationSpeed) {
			var dist, signum, frac, peri, radius, cang, cx, cy, tang;
			
			if (rotationSpeed === 0) {
				dist = this.speed() * jsbots.consts.robotSpeedRatio * time;
				return {
					x: this.x() + Math.sin(jsbots.util.toRad(this.direction())) * dist,
					y: this.y() + Math.cos(jsbots.util.toRad(this.direction())) * dist
				};
			} else {
				signum = rotationSpeed < 0 ? -1 : 1;
				frac = Math.abs(rotationSpeed/360);
				peri = this.speed() * jsbots.consts.robotSpeedRatio * time / frac;
				radius = peri/2/Math.PI;
				cang = jsbots.util.toRad(this.direction() + signum * 90);
				cx = this.x() + Math.sin(cang) * radius;
				cy = this.y() + Math.cos(cang) * radius;
				tang = cang - Math.PI + jsbots.util.toRad(rotationSpeed);
				return {
					x: cx + Math.sin(tang) * radius,
					y: cy + Math.cos(tang) * radius
				};
			}
		};

		JSAPIRobot.prototype.distance = function(other) {
			return jsbots.util.dist(robot.x(), robot.y(), other.x(), other.y());
		};
		
		robot = new JSAPIRobot();
		return robot;
	};
}());