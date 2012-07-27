var d3, jsbots;

(function(){
	jsbots.ui = function() {
		function RobotsUI() {
		}
		
		var ui,
			arena;
		
		RobotsUI.prototype.setup = function() {
			var svg = d3.select("body").append("svg")
				.attr("width", 1850)
				.attr("height", 1000);
			arena = svg.append("g")
				.classed("arena", true)
				.attr("transform", "translate(20, 20)");
			arena.append("rect")
				.classed("perimeter", true)
				.attr("width", 1500)
				.attr("height", 900);
		};
		
		RobotsUI.prototype.draw = function(robotsObj) {
			var robotGs,
				enterG,
				robots = [],
				name;
			
			for (name in robotsObj) {
				robots.push(robotsObj[name]);
			}
			
			robotGs = arena.selectAll("g.robot").data(robots);
			enterG = robotGs.enter()
				.append("g")
				.classed("robot", true)
				.attr("transform", function(d) {return "translate("+d.x+","+d.y+")";});
			enterG.append("circle")
				.attr("r", 30)
				.style("stroke", function(d) {return d.color;});
			enterG.append("line")
				.attr("x1", 0)
				.attr("y1", 0)
				.attr("x2", 0)
				.attr("y2", -40);
			
			robotGs.attr("transform", function(d) {
				return "translate("+d.x+","+d.y+") rotate("+d.angle+")";
			});
		};
		
		ui = new RobotsUI();
		return ui;
	};
}());
