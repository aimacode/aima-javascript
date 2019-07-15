var OnlineDfsAgent = function(problem){
	this.problem = problem;
	this.state = problem.INITIAL;
	this.result = new Array(this.problem.TOTAL_STATES);
	for(var i = 0; i < this.problem.TOTAL_STATES; i++)
	this.result[i] = [];
	this.untried = [];
	this.unbacktracked = [];
	this.s = -1;
	this.a = -1;
	this.iterate = function(newState){
		// If already at target, do nothing
		if(this.problem.goal_test(newState))
		return this.problem.NO_ACTION;

		// If not already tried then try it
		if(this.untried[newState] == null)
		this.untried[newState] = this.problem.actions(newState);

		// Mark this state as backtrackable
		if(this.s != -1){
			if(newState != this.result[this.s][this.a]){
				this.result[this.s][this.a] = newState;
				if(this.unbacktracked[newState] == null)
				this.unbacktracked[newState] = [];
				this.unbacktracked[newState].push(this.s);
			}
		}

		// NO_ACTION is considered to be empty
		if(this.untried[newState].length <= 1){
			if(this.unbacktracked[newState].length == 0) { // No states to backtrack
				return this.problem.NO_ACTION;
			} else { // Get the action which results in backtracking
				var popped = this.unbacktracked[newState].pop();
				for(var j = 0; j < this.result[newState].length; j++){
					if(this.result[newState][j] == popped){
						this.a = j;
						break;
					}
				}
			}
		} else {
			// Try taking a different action
			this.a = this.untried[newState].pop();
		}
		this.s = newState;
		return this.a;
	};
};
