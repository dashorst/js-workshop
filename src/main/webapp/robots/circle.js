var self;

self.addEventListener("message", function(e) {
	self.postMessage({type: "speed", value: 10});
	self.postMessage({type: "angle", value: e.data.robots.circle.angle + 0.3});
}, false);