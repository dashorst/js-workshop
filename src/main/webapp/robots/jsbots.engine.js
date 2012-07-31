var d3, jsbots, Worker;

(function(){
	jsbots.engine = {};
	
	jsbots.engine.engine = function() {
		function RobotsEngine() {
		}
		
		var engine,
			robots = {},
			projectiles = [],
			running = false,
			tickCount = 0,
			lastTick,
			event = d3.dispatch("start", "tick", "end");
		
		function outsideBounds(x, y, s) {
			return x < s || x > jsbots.consts.arenaWidth - s
				|| y < s || y > jsbots.consts.arenaHeight - s;
		}
		
		function checkRobot(robot, elapsed) {
			var name,
				dx, dy,
				impactAngle;
			
			if (outsideBounds(robot.x(), robot.y(), jsbots.consts.robotSize)) {
				robot.collide(elapsed);
				robot.x(Math.max(jsbots.consts.robotSize + 2,
						Math.min(jsbots.consts.arenaWidth - jsbots.consts.robotSize - 2, robot.x())));
				robot.y(Math.max(jsbots.consts.robotSize + 2,
						Math.min(jsbots.consts.arenaHeight - jsbots.consts.robotSize - 2, robot.y())));
			}
			for (name in robots) {
				dx = robot.x() - robots[name].x();
				dy = robot.y() - robots[name].y();
				if (robots[name] !== robot && Math.sqrt(dx*dx + dy*dy) < jsbots.consts.robotSize * 2) {
					impactAngle = jsbots.util.toDeg(Math.atan2(dx,dy));
					robot.collide(elapsed, Math.abs(jsbots.util.angleDiff(robot.angle(), impactAngle)) < 90);
				}
			}
		}
		
		function blast(p) {
			var name, dx, dy, dist;
			for (name in robots) {
				dx = p.x - robots[name].x();
				dy = p.y - robots[name].y();
				dist = Math.max(0, Math.sqrt(dx*dx + dy*dy) - jsbots.consts.robotSize);
				if (dist < jsbots.consts.robotSize) {
					robots[name].hit(p.charge * (1 - dist / jsbots.consts.robotSize));
				}
			}
		}
		
		function checkProjectile(p) {
			var name, dx, dy;
			if (outsideBounds(p.x, p.y, 0)) {
				blast(p);
				return false;
			}
			for (name in robots) {
				dx = p.x - robots[name].x();
				dy = p.y - robots[name].y();
				if (Math.sqrt(dx*dx + dy*dy) < jsbots.consts.robotSize) {
					blast(p);
					return false;
				}
			}
			return true;
		}
		
		function tick(elapsedRaw) {
			var elapsed = elapsedRaw * jsbots.consts.gameSpeed,
				name,
				delta = elapsed - lastTick,
				robotsJSON = {};
			if (delta > 10) {
				lastTick = elapsed;
				projectiles = projectiles.filter(function(p){
					p.x += Math.sin(jsbots.util.toRad(p.direction)) * delta * jsbots.consts.projectileSpeedRatio;
					p.y += Math.cos(jsbots.util.toRad(p.direction)) * delta * jsbots.consts.projectileSpeedRatio;
					return checkProjectile(p);
				});
				for (name in robots) {
					robots[name].tick(delta, engine);
				}
				for (name in robots) {
					checkRobot(robots[name], elapsed);
				}
				for (name in robots) {
					if (robots[name].hitpoints() <= 0) {
						engine.removeRobot(robots[name]);
					}
				}
				for (name in robots) {
					robotsJSON[name] = robots[name].getJSON();
					robots[name].clearEvents();
				}
				event.tick({
					type: "tick",
					delta: delta,
					elapsed: elapsed,
					projectiles: projectiles,
					robots: robotsJSON
				});
			}
			return elapsed > 300000 || Object.getOwnPropertyNames(robots).length === 0;
		}
		
		RobotsEngine.prototype.addRobot = function(script, color) {
			var robot = jsbots.engine.robot(),
				robotWorker = new Worker("robots/"+script+".js");
			engine.on("tick."+script, function(data) {
				robotWorker.postMessage(data);
			});
			robot.name(script).color(color);
			robots[script] = robot;
			robotWorker.addEventListener("message", function(e) {
				robot.addAction(e.data);
			}, false);
			robotWorker.postMessage({type: "start", name: script});
		};
		
		RobotsEngine.prototype.removeRobot = function(robot) {
			delete robots[robot.name()];
			engine.on("tick."+robot.name(), null);
		};
		
		RobotsEngine.prototype.fireProjectile = function(robot) {
			var dir = robot.angle() + robot.turretAngle();
			if (robot.charge() > 5) {
				projectiles.push({
					charge: robot.charge(),
					direction: dir,
					x: robot.x() + Math.sin(jsbots.util.toRad(dir)) * 45,
					y: robot.y() + Math.cos(jsbots.util.toRad(dir)) * 45
				});
				robot.charge(0);
			}
		};
		
		RobotsEngine.prototype.start = function() {
			running = true;
			event.start({type: "start"});
			lastTick = 0;
			d3.timer(tick);
		};
		
		engine = new RobotsEngine();
		d3.rebind(engine, event, "on");
		return engine;
	};
	
	jsbots.engine.robot = function() {
		function JSRobot() {
		}
		
		var robot,
			lastCollision = 0,
			actions = [];
		
		JSRobot.prototype = jsbots.robot();
		
		function updateValue(old, target, delta) {
			return old + Math.min(delta, Math.max(-delta, target - old));
		}
		
		function range(low, high, value) {
			return Math.max(low, Math.min(high, value));
		}
		
		function isValid(value) {
			return value === 0 || value;
		}
		
		function processActions(engine) {
			actions.forEach(function(a) {
				if (a.type === "speed" && isValid(a.value)) {
					robot.targetSpeed(a.value);
				} else if (a.type === "angle" && isValid(a.value)) {
					robot.targetAngle(a.value);
				} else if (a.type === "turretAngle" && isValid(a.value)) {
					robot.targetTurretAngle(a.value);
				} else if (a.type === "fire") {
					engine.fireProjectile(robot);
				}
			});
			actions = [];
		}
		
		JSRobot.prototype.tick = function(delta, engine) {
			processActions(engine);
			this.speed(range(
					jsbots.consts.robotMinSpeed,
					jsbots.consts.robotMaxSpeed,
					updateValue(this.speed(), this.targetSpeed(), delta * jsbots.consts.robotAccel))); 
			this.angle(
					updateValue(this.angle(), this.targetAngle(), delta * jsbots.consts.robotAngleSpeed));
			this.turretAngle(
					updateValue(this.turretAngle(), this.targetTurretAngle(), delta * jsbots.consts.robotTurretSpeed));
			this.x(this.x() + Math.sin(jsbots.util.toRad(this.angle())) *
					this.speed() * delta * jsbots.consts.robotSpeedRatio);
			this.y(this.y() + Math.cos(jsbots.util.toRad(this.angle())) *
					this.speed() * delta * jsbots.consts.robotSpeedRatio);
			this.charge(Math.min(jsbots.consts.robotMaxCharge, this.charge() + delta * jsbots.consts.robotChargeRate));
		};
		
		JSRobot.prototype.addAction = function(action) {
			actions.push(action);
		};
		
		JSRobot.prototype.collide = function(elapsed, bounce) {
			if (lastCollision + 100 < elapsed) {
				if (bounce === this.speed() > 0) {
					this.speed(2*this.speed());
				} else {
					this.speed(-this.speed());
				}
				this.hitpoints(this.hitpoints() - jsbots.consts.wallDamage);
				this.addEvent({type:"collision", damage: jsbots.consts.wallDamage});
			}
			lastCollision = elapsed;
		};
		
		JSRobot.prototype.hit = function(damage) {
			this.hitpoints(this.hitpoints() - damage);
			this.addEvent({type:"hit", damage: damage});
		};

		robot = new JSRobot();
		return robot;
	};
}());