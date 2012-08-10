var d3, jsbots;

(function(){
	jsbots.ui = function() {
		function RobotsUI() {
		}
		
		var ui,
			stats,
			arena;
		
		RobotsUI.prototype.setup = function() {
			var svg = d3.select("body").append("svg")
				.attr("width", 1900)
				.attr("height", 1000);
			arena = svg.append("g")
				.classed("arena", true)
				.attr("transform", "translate(20, 20)");
			arena.append("rect")
				.classed("perimeter", true)
				.attr("width", jsbots.consts.arenaWidth)
				.attr("height", jsbots.consts.arenaHeight);
			stats = svg.append("g")
				.classed("robot-stats", true)
				.attr("transform", "translate("+(jsbots.consts.arenaWidth+40)+",20)");
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
					return "translate("+d.x+","+(jsbots.consts.arenaHeight-d.y)+") rotate("+d.direction+")";
				})
				.select("text")
				.text(function (d) {return Math.round(d.hitpoints);});
			robotGs
				.select("path.turret")
				.attr("transform", function(d) {return "scale(0.4) rotate("+d.turretAngle+")";});
		}
		
		function drawStats(robots, data) {
			var robotGs, enterG;
			robotGs = stats.selectAll("g.robot-stat").data(robots, function(r) {return r.name;});
			enterG = robotGs.enter()
				.append("g")
				.classed("robot-stat", true)
				.attr("transform", function(d, i) {return "translate(0, "+(i*150)+")";});
			enterG.append("rect")
				.attr("width", 350)
				.attr("height", 140)
				.style("stroke", function(r) {return r.color;});
			enterG.append("rect")
				.attr("width", 70)
				.attr("height", 5)
				.style("fill", "black")
				.attr("transform", "translate(15, -2)");
			enterG.append("text")
				.text(function(r) {return r.name;})
				.attr("transform", "translate(20, -2)");
			enterG.append("text")
				.attr("transform", "translate(10, 15)")
				.classed("hitpoints", true);
			enterG.append("text")
				.attr("transform", "translate(100, 15)")
				.classed("speed", true);
			enterG.append("text")
				.attr("transform", "translate(190, 15)")
				.classed("charge", true);
			enterG.append("text")
				.attr("transform", "translate(280, 15)")
				.classed("direction", true);
			enterG.append("text")
				.attr("transform", "translate(10, 35)")
				.classed("dropped", true);
			enterG.append("text")
				.attr("transform", "translate(10, 55)")
				.classed("status", true);
			
			robotGs.exit()
				.style("opacity", 0.5)
				.select("text.hitpoints")
				.text("Hit.: 0");
				
			robotGs.select("text.hitpoints")
				.text(function(r) {return "Hitp.: "+r.hitpoints.toFixed(0);});
			robotGs.select("text.speed")
				.text(function(r) {return "Speed: "+r.speed.toFixed(1);});
			robotGs.select("text.charge")
				.text(function(r) {return "Charge: "+r.charge.toFixed(1);});
			robotGs.select("text.direction")
				.text(function(r) {return "Dir.: "+r.direction.toFixed(1);});
			robotGs.select("text.dropped")
				.text(function(r) {return "Dropped frames: "+(100*r.dropped/data.tickCount).toFixed(0)+"%";});
			robotGs.select("text.status")
				.text(function(r) {return r.status;});
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
		
		function drawMarks(marks) {
			var selection = arena.selectAll("circle.mark").data(marks);
			selection.enter()
				.append("circle")
				.classed("mark", true);
			selection.exit().remove();
			selection
				.attr("cx", function(m) {return m.x;})
				.attr("cy", function(m) {return jsbots.consts.arenaHeight-m.y;})
				.attr("r", function(m) {return m.size;})
				.style("fill",function(m) {return m.color;});
		}
		
		RobotsUI.prototype.draw = function(data) {
			var robots = [],
				name;
			
			for (name in data.robots) {
				robots.push(data.robots[name]);
			}
			drawRobots(robots);
			drawStats(robots, data);
			drawProjectiles(data.projectiles);
			if (jsbots.consts.debug) {
				drawMarks(data.marks);
			}
		};
		
		ui = new RobotsUI();
		return ui;
	};
}());
