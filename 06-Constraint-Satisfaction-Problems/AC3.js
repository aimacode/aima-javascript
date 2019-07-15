var ARC = "ARC";
var SATISFIED = "SAT";
var UNSATISFIED = "UNSAT";
var timeline = [];

var ArcConsistency = function(){
	this.ac3 = function(csp){
		var queue = [];
		for(var i = 0; i < csp.variables.length; i++)
		for(var j = 0; j < csp.neighbours[i].length; j++)
		queue.push([csp.variables[i],csp.neighbours[i][j]]);
		while(queue.length){
			var arc = queue.shift();
			var xi = arc[0];
			var xj = arc[1];
			timeline.push([ARC,xi,xj]);
			if(this.revise(csp,xi,xj)){
				if(csp.domains[xi].length == 0)
				return false;
				for(var i = 0; i < csp.neighbours[xi].length; i++){
					var xk = csp.neighbours[xi][i];
					if(xk != xj)
					queue.push([xk,xi]);
				}
			}
		}
		return true;
	};
	this.revise = function(csp,xi,xj){
		revised = false;

		// For each value in the domain of X
		for(var i = 0; i < csp.domains[xi].length; i++){
			var x = csp.domains[xi][i];
			if(x == -1) continue;
			var satisfies = false;
			// Check if any value in the domain of y satisfies the
			// constraint
			for(var j = 0; j < csp.domains[xj].length; j++){
				var y = csp.domains[xj][j];
				if(y == -1) continue;
				if(csp.binaryConstraint(xi,xj,x,y)){
					timeline.push([SATISFIED,xi,xj,i,j]);
					satisfies = true;
					break;
				}
			}
			// If no value satisfies the constraint
			if(!satisfies){
				// Remove x from domain of X
				csp.domains[xi][i] = -1;
				timeline.push([UNSATISFIED,xi,i]);
				revised = true;
			}
		}
		return revised;
	};
};
