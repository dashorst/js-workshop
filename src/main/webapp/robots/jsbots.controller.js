var d3, jsbots;

(function() {
	var engine = jsbots.engine.engine(), 
		ui = jsbots.ui();
	ui.setup();
	engine.addRobot("tower", "blue");
	engine.addRobot("circle", "yellow");
	engine.addRobot("target", "limegreen");
	//engine.addRobot("target2", "purple");
	engine.on("tick.controller", ui.draw);
	engine.start();
}());