var d3, jsbots;

(function() {
	var engine = jsbots.engine(), 
		ui = jsbots.ui();
	ui.setup();
	engine.addRobot("tower");
	engine.on("tick.controller", function(data) {
		ui.draw(data.robots);
	});
	engine.start();
}());