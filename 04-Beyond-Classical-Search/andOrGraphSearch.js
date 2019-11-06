var AndOrGraphSearch = function(){
	this.orSearch = function(state,problem,path){
		// If goal is reached then no more planning required
		if(problem.goal_test(state))
			return [];

		// Return null if loops are found
		for(var i = 0; i < path.length; i++)
			if(path[i] == state)
				return null;

		var actions = problem.actions(state);
		for (var i = 0; i < actions.length; i++){
			var action = actions[i];
			plan = this.andSearch(problem.results(state,action),
				problem,
				path.unshift(state));
			if (plan.length > 0)
				return plan.unshift(action);
		}
		return null;
	};

	this.andSearch = function(states,problem,path){
		var plans = [];
		for (var i = 0; i < states.length; i++){
			plans[i] = this.orSearch(states[i],problem,path);
			if(plans[i] == null)
				return null;
		}
		return plans;
	};
	this.search = function(problem){
		return this.orSearch(problem.INITIAL_STATE,problem,[]);
	};
};
