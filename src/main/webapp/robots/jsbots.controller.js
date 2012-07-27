var d3, jsbots;

(function() {
	var engine = jsbots.engine(), 
		ui = jsbots.ui();
	ui.setup();
	engine.addRobot("tower", "blue");
	engine.addRobot("circle", "yellow");
	engine.addRobot("target", "limegreen");
	engine.on("tick.controller", function(data) {
		ui.draw(data.robots);
	});
	engine.start();
}());