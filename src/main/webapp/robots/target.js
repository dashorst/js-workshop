var self;

self.addEventListener("message", function(e) {
	var x = e.data.robots.target.x,
		y = e.data.robots.target.y,
		dx = e.data.robots.circle.x - x,
		dy = e.data.robots.circle.y - y,
		angle = e.data.robots.target.angle,
		a;
	a = Math.atan2(dx, dy)*180/Math.PI;
	while (angle - a > 180) {
		a += 360;
	}
	while (a - angle > 180) {
		a -= 360;
	}
	
	if (Math.sqrt(dx*dx+dy*dy) < 100) {
		a += 180;
	}
	
	self.postMessage({type: "speed", value: 11});
	self.postMessage({type: "angle", value: a});
}, false);