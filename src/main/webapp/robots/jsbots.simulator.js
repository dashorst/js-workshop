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
				var dist = jsbots.util.dist(x, y, r.x(), r.y()) - 30;
				ret += jsbots.util.inRange(0, 10, (60 - dist)/6);
			});
			projectiles.forEach(function(p) {
				var dist = jsbots.util.dist(x, y, p.x, p.y) - 30;
				ret += jsbots.util.inRange(0, p.charge, (60 - dist)/60*p.charge);
			});
			ret += jsbots.util.inRange(0, 10, (60 - x)/6);
			ret += jsbots.util.inRange(0, 10, (60 - y)/6);
			ret += jsbots.util.inRange(0, 10, (60 - (jsbots.consts.arenaWidth-x))/6);
			ret += jsbots.util.inRange(0, 10, (60 - (jsbots.consts.arenaHeight-y))/6);
			return ret;
		};
		
		simulator = new RobotsSimulator();
		return simulator;
	};
}());