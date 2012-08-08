var d3, jsbots;

(function(){
	jsbots.simulator = function(others, data) {
		var simulator,
			robots,
			projectiles;
		
		function RobotsSimulator() {
			robots = others.map(function(r) {return jsbots.robot().fromJSON(r.getJSON());});
			projectiles = data.projectiles.map(function(p) {
				return {charge:p.charge, direction: p.direction, x:p.x, y:p.y};
			});
		}
		
		RobotsSimulator.prototype.advance = function(delta) {
			robots.forEach(function(r) {
				r.advance(delta);
			});
			projectiles.forEach(function(p) {
				p.x += Math.sin(jsbots.util.toRad(p.direction)) * delta * jsbots.consts.projectileSpeedRatio;
				p.y += Math.cos(jsbots.util.toRad(p.direction)) * delta * jsbots.consts.projectileSpeedRatio;
			});
		};
		
		RobotsSimulator.prototype.danger = function(x, y) {
			var ret = 0;
			robots.forEach(function(r) {
				var dist = jsbots.util.dist(x, y, r.x(), r.y()) - 60;
				ret += jsbots.util.inRange(0, 10, (90 - dist)/9);
			});
			projectiles.forEach(function(p) {
				var dist = jsbots.util.dist(x, y, p.x, p.y) - 30;
				ret += jsbots.util.inRange(0, p.charge, (20 - dist)/20*p.charge*5);
			});
			ret += jsbots.util.inRange(0, 30, (40 - x)/3);
			ret += jsbots.util.inRange(0, 30, (40 - y)/3);
			ret += jsbots.util.inRange(0, 30, (40 - (jsbots.consts.arenaWidth-x))/3);
			ret += jsbots.util.inRange(0, 30, (40 - (jsbots.consts.arenaHeight-y))/3);
			return ret;
		};
		
		RobotsSimulator.prototype.robot = function(name) {
			var robot;
			for (robot in robots) {
				if (robots[robot].name() === name) {
					return robots[robot];
				}
			}
		};
		
		simulator = new RobotsSimulator();
		return simulator;
	};
}());