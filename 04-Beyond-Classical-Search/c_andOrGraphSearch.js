var AndOrGraphSearchProblemStatement = function(){
	this.INITIAL_STATE = 0; // 0 to 7
	this.FINAL_STATE = 7;

	this.ACTIONS = function() {
		SUCK = 0;
		LEFT = 1;
		RIGHT = 2;
	};
	this.DIRT_PROBABILITY = 0.33;

	this.goal_test = function(state){
		return state == this.FINAL_STATE;
	};
	// See figure 4.9 page 134
	this.actions = function(state){
		var temp = [];
		state++;
		// Dirty tiles
		if(state == 1 || state == 3 || state == 2 || state == 6)
		temp.push(ACTIONS.SUCK);
		// Left tiles
		if(state == 1 || state == 3 || state == 5)
		temp.push(ACTIONS.RIGHT);
		// Right tiles
		if(state == 2 || state == 4 || state == 6)
		temp.push(ACTIONS.LEFT);
		return temp;
	};

	this.results = function(state,action){
		var states = [];
		switch(action){
			case ACTIONS.SUCK:
			switch(state){
				case 1: states.push(5,7); break;
				case 2: states.push(4,8); break;
				case 3: states.push(7); break;
				case 6: states.push(8); break;

				case 5: states.push(1,5); break;
				case 4: states.push(2,4); break;
			}
			break;
			case ACTIONS.RIGHT:
			states.push(state+1);
			break;
			case ACTIONS.LEFT:
			states.push(state-1);
			break;
		}
		return states;
	};
};

$(document).ready(function(){

});
