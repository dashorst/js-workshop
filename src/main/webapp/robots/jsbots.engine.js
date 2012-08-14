var d3, jsbots, Worker, console;

(function(){
	jsbots.engine = {};
	
	jsbots.engine.engine = function() {
		function RobotsEngine() {
		}
		
		var engine,
			robots = {},
			projectiles = [],
			marks = [],
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
					robot.collide(elapsed, Math.abs(jsbots.util.angleDiff(robot.direction(), impactAngle)) < 90);
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
			if (delta > 1000 / jsbots.consts.maxFrameRate) {
				tickCount++;
				lastTick = elapsed;
				projectiles = projectiles.filter(function(p){
					p.x += Math.sin(jsbots.util.toRad(p.direction)) *
						p.speed * delta * jsbots.consts.projectileSpeedRatio;
					p.y += Math.cos(jsbots.util.toRad(p.direction)) *
						p.speed * delta * jsbots.consts.projectileSpeedRatio;
					return checkProjectile(p);
				});
				for (name in robots) {
					robots[name].processActions(engine);
					robots[name].advance(delta);
					if (!running) {
						robots[name].targetSpeed(0);
					}
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
					tickCount: tickCount,
					delta: delta,
					elapsed: elapsed,
					elapsedRaw: elapsedRaw,
					projectiles: projectiles,
					marks: marks,
					robots: robotsJSON
				});
				marks = [];
				if (Object.getOwnPropertyNames(robots).length === 1) {
					if (running) {
						engine.stop();
					} else {
						return robots[Object.getOwnPropertyNames(robots)[0]].speed() === 0;
					}
				}
			}
			return elapsed > 300000 || Object.getOwnPropertyNames(robots).length === 0;
		}
		
		RobotsEngine.prototype.addRobot = function(script, color) {
			var robotWorker = new Worker("robots/"+script+".js"),
				robot = jsbots.engine.robot(robotWorker);
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
			robot.worker().postMessage({type: "stop"});
			delete robots[robot.name()];
			engine.on("tick."+robot.name(), null);
		};
		
		RobotsEngine.prototype.fireProjectile = function(robot, charge, speed) {
			var dir;
			if (speed === 0) {
				dir = robot.direction() - 180;
			} else {
				dir = robot.direction() + robot.turretAngle();
			}
			if ((speed === 0 && charge >= 5 && robot.charge() >= charge / 3) ||
				(charge * speed >= 5 && robot.charge() >= charge * speed && speed >= 0.5 && speed <= 3)) {
				projectiles.push({
					charge: charge,
					speed: speed,
					direction: dir,
					x: robot.x() + Math.sin(jsbots.util.toRad(dir)) * jsbots.consts.projectileStartDistance,
					y: robot.y() + Math.cos(jsbots.util.toRad(dir)) * jsbots.consts.projectileStartDistance
				});
				robot.charge(robot.charge() - (speed === 0 ? charge / 3 : charge * speed));
			}
		};
		
		RobotsEngine.prototype.mark = function(m) {
			marks.push({
				color: m.color,
				x: m.x,
				y: m.y,
				size: m.size
			});
		};
		
		RobotsEngine.prototype.start = function() {
			running = true;
			event.start({type: "start"});
			lastTick = 0;
			d3.timer(tick);
		};
		
		RobotsEngine.prototype.stop = function() {
			var name;
			running = false;
			projectiles = [];
			for (name in robots) {
				robots[name].targetSpeed(0).worker().postMessage({type: "stop"});
				engine.on("tick."+name, null);
			}
		};
		
		engine = new RobotsEngine();
		d3.rebind(engine, event, "on");
		return engine;
	};
	
	jsbots.engine.robot = function(pworker) {
		function JSRobot() {
		}
		
		var robot,
			worker = pworker,
			lastCollision = 0,
			actions = [];
		
		JSRobot.prototype = jsbots.robot();
		
		function isValid(value) {
			return value === 0 || value;
		}
		
		JSRobot.prototype.worker = function() {
			return worker;
		};
		
		JSRobot.prototype.processActions = function(engine) {
			actions.forEach(function(a) {
				if (a.type === "speed" && isValid(a.value)) {
					robot.targetSpeed(a.value);
				} else if (a.type === "direction" && isValid(a.value)) {
					robot.targetDirection(a.value);
				} else if (a.type === "turretAngle" && isValid(a.value)) {
					robot.targetTurretAngle(a.value);
				} else if (a.type === "fire" && isValid(a.charge) && isValid(a.speed)) {
					engine.fireProjectile(robot, a.charge, a.speed);
				} else if (a.type === "status") {
					robot.status(a.value);
				} else if (a.type === "drop") {
					robot.dropMessage();
				} else if (a.type === "log" && jsbots.consts.debug) {
					console.log(a.value);
				} else if (a.type === "mark") {
					engine.mark(a);
				}
			});
			actions = [];
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