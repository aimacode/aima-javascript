/*
Logic for LRTA Agent
Author: Souradeep Nanda
*/
var LrtaAgent = function(problem){
	this.problem = problem;
	this.result = new Array(this.problem.TOTAL_STATES);
	for(var i = 0; i < this.problem.TOTAL_STATES; i++)
		this.result[i] = [];
	this.H = new Array(this.problem.TOTAL_STATES);
	this.a = -1;
	this.s = -1;
	
	this.iterate = function(newState){
		if(this.problem.goal_test(newState))
			return this.problem.NO_ACTION;
		if(this.H[newState] == null)
			this.H[newState] = this.problem.h(newState);
		if(this.s != -1){
			this.result[this.s][this.a] = newState;
			var min = Number.MAX_VALUE;
			var actions = this.problem.actions(this.s);
			for(var i = 0; i < actions.length; i++){
				var a = actions[i];
				var cost = this.lrtaCost(this.s,a,result[this.s][a]);
				if(cost < min) min = cost;
			}
			this.H[this.s] = min;
		}
		var min = Number.MAX_VALUE;
		var a = this.problem.NO_ACTION;
		var actions = this.problem.actions(newState);
		for(var i = 0; i < actions.length; i++){
			var b = actions[i];
			var cost = this.problem.lrtaCost(newState,b,result[newState][b]);
			if(cost < min){
				min = cost;
				a = b;
			}
		}
		
		this.s = newState;
		this.a = a;
		return a;
	}
	this.lrtaCost(state,action,newState){
		if(newState == null)
			return this.problem.h(state);
		else
			return this.problem.cost(state,action,newState) + H[newState];
	}
}

// TODO: Refactor code to extend from a single ProblemStatement class
var LrtaAgentProblemStatement = function(){	
	this.NO_ACTION = 0;
	this.UP = 1;
	this.DOWN = 2;
	this.LEFT = 3;
	this.RIGHT = 4;
	
	this.at = function(i,j){
		return i * this.COLS + j;
	}
	this.getIJ = function(x){
		return [parseInt(x/this.COLS),x%this.COLS];
	}
	this.goal_test = function(state){
		return this.END == state;
	}
	// Get all possible actions
	this.actions = function(state){
		var a = [this.NO_ACTION];
		var i = this.getIJ(state)[0],j = this.getIJ(state)[1];
		if(i - 1 >= 0 && !this.graph[i-1][j]) a.push(this.UP);
		if(i + 1 < this.ROWS && !this.graph[i+1][j]) a.push(this.DOWN);
		if(j - 1 >= 0 && !this.graph[i][j-1]) a.push(this.LEFT);
		if(j + 1 < this.COLS && !this.graph[i][j+1]) a.push(this.RIGHT);
		return a;
	}	
	// Get state resulting from action taken
	this.getNextState = function(state,action){
		var x = this.getIJ(state)[0];
		var y = this.getIJ(state)[1];
		switch(action){
		case this.NO_ACTION = 0: /*Nothing*/ break;
		case this.UP = 1: x--; break;
		case this.DOWN = 2: x++; break;
		case this.LEFT = 3: y--; break;
		case this.RIGHT = 4: y++; break;
		}
		return this.at(x,y);
	}
	
	this.init = function(){
		this.graph = 
		[[0,0,0,1],
		[1,1,0,1],
		[0,0,0,1],
		[0,1,0,1]];
		
		this.ROWS = this.graph.length;
		this.COLS = this.graph[0].length;
		this.TOTAL_STATES = this.ROWS * this.COLS;
		this.INITIAL = 0;
		this.END = 19;
	}
	
	this.init();
	
	this.h(state){
		return 0;
	}	
	
	this.cost(state,action,newState){
		return 0;
	}
}