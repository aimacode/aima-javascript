// TODO: Refactor code to extend from a single ProblemStatement class
var LrtaAgentProblemStatement = function(){
	///////////////////////////////////////////////////
	////// TODO: PUT IN SUPER CLASS (START)
	///////////////////////////////////////////////////
	this.NO_ACTION = 0;
	this.UP = 1;
	this.DOWN = 2;
	this.LEFT = 3;
	this.RIGHT = 4;

	this.at = function(i,j){
		return i * this.COLS + j;
	};
	this.getIJ = function(x){
		return [parseInt(x/this.COLS),x%this.COLS];
	};
	this.goal_test = function(state){
		return this.END == state;
	};
	// Get all possible actions
	this.actions = function(state){
		var a = [this.NO_ACTION];
		var i = this.getIJ(state)[0],j = this.getIJ(state)[1];
		if(i - 1 >= 0 && !this.graph[i-1][j]) a.push(this.UP);
		if(i + 1 < this.ROWS && !this.graph[i+1][j]) a.push(this.DOWN);
		if(j - 1 >= 0 && !this.graph[i][j-1]) a.push(this.LEFT);
		if(j + 1 < this.COLS && !this.graph[i][j+1]) a.push(this.RIGHT);
		return a;
	};
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
	};

	///////////////////////////////////////////////////
	////// TODO: PUT IN SUPER CLASS (END)
	///////////////////////////////////////////////////

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
		this.END = 12;
	};

	this.init();

	// Manhattan distance
	this.h = function(state){
		var current = this.getIJ(state);
		var goal = this.getIJ(this.END);
		var x = Math.abs(current[0]-goal[0]);
		var y = Math.abs(current[1]-goal[1]);
		console.log("Manhattan (%d+%d)",x,y);
		return x+y;
	};

	// Binary manhattan weights
	this.cost = function(state,action,newState){
		if(action == 0) return 0;
		else return 1;
	};
};

var problem = new LrtaAgentProblemStatement();
var state = problem.INITIAL;
var agent = new LrtaAgent(problem);

// Decide next action and take the action
function step(){
	var action = agent.iterate(state);
	state = problem.getNextState(state,action);
}

$(document).ready(function(){

});
