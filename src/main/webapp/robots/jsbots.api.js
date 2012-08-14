var d3, jsbots;

(function(){
	jsbots.api = {};
	
	jsbots.api.communicator = function(pworker) {
		var communicator,
			event = d3.dispatch("start", "tick", "hit", "collision"),
			worker = pworker,
			startTime,
			totalTime = 0,
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
			if (curTime - startTime < data.elapsedRaw + data.delta * 2 / jsbots.consts.gameSpeed &&
					totalTime < data.elapsedRaw * 0.4) {
				event.tick(thisRobot, robots, data);
			} else {
				thisRobot.dropMessage();
			}
			totalTime += (Date.now() - curTime); 
		}
		
		Communicator.prototype.messageReceived = function(e) {
			if (e.data.type === "start") {
				name = e.data.name;
				thisRobot = robotConstructor(worker, communicator);
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
	
	jsbots.api.robot = function(pworker, communicator) {
		var robot,
			worker = pworker,
			currentSpeed,
			currentDirection,
			currentTurretAngle,
			aimAt,
			fireCharge;
		
		function superPrototype() {
			return Object.getPrototypeOf(Object.getPrototypeOf(robot));
		}
		
		function JSAPIRobot() {
		}
		
		JSAPIRobot.prototype = jsbots.robot();
		
		JSAPIRobot.prototype.process = function(self, others, data) {
			var aimTarget, angle, charge;
			
			self.ai(others, data);
			aimTarget = aimAt ? aimAt(others, data) : undefined;
			if (aimTarget) {
				angle = jsbots.util.angleDiff(
						jsbots.util.toDeg(Math.atan2(aimTarget.x - self.x(), aimTarget.y - self.y())),
						self.currentDirection());
				self.turretAngle(jsbots.util.relativeTo(self.turretAngle(), angle));
			}
			charge = fireCharge ? fireCharge(others, data) : undefined;
			if (charge) {
				if (typeof charge === "number") {
					charge = {charge: charge, speed: 1};
				}
				self.fire(charge.charge, charge.speed);
			}
		};

		JSAPIRobot.prototype.ai = function(others, data) {
		}
		
		JSAPIRobot.prototype.currentSpeed = function() {
			return currentSpeed;
		};
		
		JSAPIRobot.prototype.currentDirection = function() {
			return currentDirection;
		};
		
		JSAPIRobot.prototype.currentTurretAngle = function() {
			return currentTurretAngle;
		};
		
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
		
		JSAPIRobot.prototype.aimAt = function(naimAt) {
			if (!arguments.length) {return aimAt;}
			aimAt = naimAt;
			return this;
		};
		
		JSAPIRobot.prototype.fireCharge = function(nfireCharge) {
			if (!arguments.length) {return fireCharge;}
			fireCharge = nfireCharge;
			return this;
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
		
		JSAPIRobot.prototype.mark = function(color, x, y, size) {
			if (jsbots.consts.debug) {
				worker.postMessage({
					type: "mark",
					color: color,
					x: x,
					y: y,
					size: (size ? size : 2)
				});
			}
			return this;
		};
		
		JSAPIRobot.prototype.mine = function(charge) {
			if (!charge) {
				charge = robot.charge();
			}
			worker.postMessage({type: "fire", charge: charge * 3, speed: 0});
			robot.charge(robot.charge() - charge);
			return this;
		};
		
		JSAPIRobot.prototype.fire = function(charge, speed) {
			if (!speed) {
				speed = 1;
			}
			if (!charge) {
				charge = robot.charge();
			}
			worker.postMessage({type: "fire", charge: charge/speed, speed: speed});
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
		
		JSAPIRobot.prototype.fromJSON = function(json) {
			currentSpeed = json.speed;
			currentDirection = json.direction;
			currentTurretAngle = json.turretAngle;
			return superPrototype().fromJSON.apply(this, arguments);
		};

		JSAPIRobot.prototype.distance = function(other) {
			return jsbots.util.dist(robot.x(), robot.y(), other.x(), other.y());
		};
		
		robot = new JSAPIRobot();
		return robot;
	};
}());