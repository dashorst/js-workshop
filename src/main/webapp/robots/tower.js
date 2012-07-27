var self;

self.addEventListener("message", function(e) {
	self.postMessage({type: "speed", value: 10});
	self.postMessage({type: "angle", value: e.data.robots.tower.angle + 100});
}, false);