var d3, jsbots, Worker;

(function(){
	jsbots.engine = function() {
		function RobotsEngine() {
		}
		
		var engine,
			robots = {},
			running = false,
			tickCount = 0,
			lastTick,
			event = d3.dispatch("start", "tick", "end");
		
		function checkRobot(robot, elapsed) {
			if (robot.x() < 30 || robot.x() > 1470 || robot.y() < 30 || robot.y() > 870) {
				robot.collide(elapsed);
			}
		}
		
		function tick(elapsed) {
			var name,
				delta = elapsed - lastTick,
				robotsJSON = {};
			if (delta > 10) {
				lastTick = elapsed;
				for (name in robots) {
					robots[name].tick(delta);
				}
				for (name in robots) {
					checkRobot(robots[name], elapsed);
				}
				for (name in robots) {
					robotsJSON[name] = robots[name].getJSON();
				}
				event.tick({
					type: "tick",
					delta: delta,
					elapsed: elapsed,
					robots: robotsJSON
				});
			}
			return elapsed > 300000;
		}
		
		RobotsEngine.prototype.addRobot = function(script, color) {
			var robot = jsbots.robot(),
				robotWorker = new Worker("robots/"+script+".js");
			engine.on("tick."+script, function(data) {
				robotWorker.postMessage(data);
			});
			robot.color(color);
			robots[script] = robot;
			robotWorker.addEventListener("message", function(e) {
				robot.addAction(e.data);
			}, false);
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
}());