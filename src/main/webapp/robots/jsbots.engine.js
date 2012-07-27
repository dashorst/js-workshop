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
		
		function tick(elapsed) {
			var name, curRobot,
				delta = elapsed - lastTick,
				robotsJSON = {};
			if (delta > 10) {
				lastTick = elapsed;
				for (name in robots) {
					curRobot = robots[name];
					curRobot.tick(delta);
					robotsJSON[name] = curRobot.getJSON();
				}
				event.tick({
					type: "tick",
					delta: delta,
					robots: robotsJSON
				});
			}
			return elapsed > 30000;
		}
		
		RobotsEngine.prototype.addRobot = function(script) {
			var robot = jsbots.robot(),
				robotWorker = new Worker("robots/"+script+".js");
			engine.on("tick.robot", function(data) {
				robotWorker.postMessage(data);
			});
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