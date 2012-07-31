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
				.attr("width", jsbots.consts.arenaWidth)
				.attr("height", jsbots.consts.arenaHeight);
		};
		
		function drawRobots(robots) {
			var robotGs, enterG;
			
			robotGs = arena.selectAll("g.robot").data(robots, function(r) {return r.name;});
			enterG = robotGs.enter()
				.append("g")
				.classed("robot", true)
				.attr("transform", function(d) {return "translate("+d.x+","+(jsbots.consts.arenaHeight-d.y)+")";});
			
			enterG.append("path")
				.attr("d", "M-64.5-41v89.5l-7,31l27,27c0,0-0.25-7.25,44.833-7.25 c44.417,0,45.167,7.25,45.167,7.25l26-26l-7-31v-93l7-20l-27-27h-90l-26,26l7,20V-41")
				.style("stroke", function(d) {return d.color;})
				.attr("transform", "scale(0.4)");

			enterG.append("path")
				.attr("d", "M51.5,67.5h-103v18c0,0,38.57,4.75,51.5,4.75s51.5-4.75,51.5-4.75 V67.5z")
				.style("stroke", function(d) {return d.color;})
				.attr("transform", "scale(0.4)");
			
			enterG.append("path")
				.attr("d", "M-25.435,49.5l-25.769-70.91l25.769-45.09h18.102l4.085-112h6.969 L7.188-66.469L26-66.5l25.87,45.261L26.101,49.5c0,0-19.125,6.5-25.768,6.5S-25.435,49.5-25.435,49.5z")
				.style("stroke", function(d) {return d.color;})
				.classed("turret", true)
				.attr("transform", "scale(0.4)");

			enterG.append("text").classed("hitpoints", true);
			
			robotGs.exit().remove();
			
			robotGs
				.attr("transform", function(d) {
					return "translate("+d.x+","+(jsbots.consts.arenaHeight-d.y)+") rotate("+d.angle+")";
				})
				.select("text")
				.text(function (d) {return Math.round(d.hitpoints);});
			robotGs
				.select("path.turret")
				.attr("transform", function(d) {return "scale(0.4) rotate("+d.turretAngle+")";});
		}
		
		function drawProjectiles(projectiles) {
			var selection = arena.selectAll("circle.projectile").data(projectiles);
			selection.enter()
				.append("circle")
				.classed("projectile", true)
				.attr("r", function(p) {return Math.sqrt(p.charge)*2;});
			selection.exit().remove();
			selection
				.attr("cx", function(p) {return p.x;})
				.attr("cy", function(p) {return jsbots.consts.arenaHeight-p.y;});
		}
		
		RobotsUI.prototype.draw = function(data) {
			var robots = [],
				name;
			
			for (name in data.robots) {
				robots.push(data.robots[name]);
			}
			drawRobots(robots);
			drawProjectiles(data.projectiles);
		};
		
		ui = new RobotsUI();
		return ui;
	};
}());
