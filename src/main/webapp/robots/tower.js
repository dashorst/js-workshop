var self;

self.addEventListener("message", function(e) {
	self.postMessage({type: "speed", value: 10});
	self.postMessage({type: "angle", value: 270 - 90 * (Math.floor(e.data.elapsed / 5000) % 4)});
}, false);