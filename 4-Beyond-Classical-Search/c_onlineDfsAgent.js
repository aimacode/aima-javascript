// TODO: Refactor code to extend from a single ProblemStatement class
var OnlineDfsAgentProblemStatement = function(){
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
		[[0,0,0,0,1,1],
		[1,1,0,0,1,0],
		[0,0,0,0,0,0],
		[0,0,1,0,1,1],
		[0,1,1,0,1,1],
		[0,0,0,0,1,1]];

		this.ROWS = this.graph.length;
		this.COLS = this.graph[0].length;
		this.TOTAL_STATES = this.ROWS * this.COLS;
		this.INITIAL = 0;
		this.END = 19;
	};
	this.init();
};

$(document).ready(function(){

	var two;
	var canvas;
	var robot;

	var DELAY = 1 * 60;
	var SIZE = 40;
	var NONBLOCKING = "#AAAACC"; // Color of non blocking tiles
	var BLOCKING = "#555577"; // Color of blocking tiles
	var ROBOTCOLOR = "#EE6622"; // Robot color
	var FINISHCOLOR = "#66EE22"; // Color of finsing tile
	var w,h;
	var baseX,baseY; // X and Y coordinates of the board origin

	var agent = null;
	var problem = null;
	var state,lastState;

	function init(){
		canvas = document.getElementById('onlineDfsCanvas');
		canvas.addEventListener("click",handleClick,false);
		w = canvas.offsetWidth,h=300;
		two = new Two({width:w,height:h}).appendTo(canvas);
		problem = new OnlineDfsAgentProblemStatement();
		agent = new OnlineDfsAgent(problem);
		state = lastState = problem.INITIAL;

		baseX = two.width/2 - problem.COLS/2 * SIZE;
		baseY = two.height/2 - problem.ROWS/2 * SIZE;

		drawBackground();
		two.update();
	}

	init();

	// Decide next action and take the action
	function step(){
		var action = agent.iterate(state);
		state = problem.getNextState(state,action);
	}

	var m_frame = DELAY;
	two.bind('update', function(frameCount) {
		--m_frame;
		if(m_frame == 0){
			m_frame = DELAY;
			lastState = state;
			step();
		} else {
			var t = 1-m_frame/DELAY;
			interpolate(t);
		}
	}).play();

	function drawBackground(){
		var tiles = [];
		// Draw the tiles
		for(var i = 0; i < problem.ROWS; i++){
			for(var j = 0; j < problem.COLS; j++){
				var temp = two.makeRectangle(SIZE/2+j*SIZE,SIZE/2+i*SIZE,SIZE,SIZE);
				if(problem.graph[i][j])
				temp.fill = BLOCKING;
				else
				temp.fill = NONBLOCKING;
				temp.noStroke();
				tiles.push(temp);
			}
		}
		// Draw the robot
		robot = two.makeRectangle(SIZE/2,SIZE/2,SIZE,SIZE);
		robot.fill = ROBOTCOLOR;
		robot.noStroke();
		tiles.push(robot);

		// Color the finishing tile differently
		tiles[problem.END].fill = FINISHCOLOR;

		// Group all drawables together and translate them to center
		var backgroundGroup = two.makeGroup(tiles);
		backgroundGroup.translation.set(baseX,baseY);
	}

	// Interpolate between old and new state
	function interpolate(t){
		var oldPos = problem.getIJ(lastState);
		var newPos = problem.getIJ(state);

		var x = SIZE/2+(t * newPos[1] + (1-t) * oldPos[1])*SIZE;
		var y = SIZE/2+(t * newPos[0] + (1-t) * oldPos[0])*SIZE;

		robot.translation.set(x,y);
	}

	// Reset simulation on mouse click
	function handleClick(evt){
		state = lastState = 0;
		problem = new OnlineDfsAgentProblemStatement();
		agent = new OnlineDfsAgent(problem);
		m_frame = DELAY;
	}

});
