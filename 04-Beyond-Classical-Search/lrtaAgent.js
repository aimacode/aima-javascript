var LrtaAgent = function(problem){
	this.problem = problem;
	this.result = new Array(this.problem.TOTAL_STATES);
	for(var i = 0; i < this.problem.TOTAL_STATES; i++)
	this.result[i] = [];
	this.H = new Array(this.problem.TOTAL_STATES);
	this.a = -1;
	this.s = -1;

	this.iterate = function(newState){
		// If reached target then stop
		if(this.problem.goal_test(newState))
		return this.problem.NO_ACTION;
		// If this state is unvisited then calculate H
		if(this.H[newState] == null)
		this.H[newState] = this.problem.h(newState);
		// If not first iteration
		if(this.s != -1){
			this.result[this.s][this.a] = newState;
			var min = Number.MAX_VALUE;
			var actions = this.problem.actions(this.s);
			for(var i = 0; i < actions.length; i++){
				var a = actions[i];
				if(this.result[this.s][a] == null)
				this.result[this.s][a] = this.problem.getNextState(this.s,a);
				var cost = this.lrtaCost(this.s,a,this.result[this.s][a]);
				if(cost < min) min = cost;

				console.log(this.problem.getIJ(this.result[this.s][a])+" "+cost);
			}
			this.H[this.s] = min;
		}
		console.log("\n");
		var min = Number.MAX_VALUE;
		var a = this.problem.NO_ACTION;
		var actions = this.problem.actions(newState);
		for(var i = 0; i < actions.length; i++){
			var b = actions[i];
			if(this.result[newState][b] == null)
			this.result[newState][b] = this.problem.getNextState(newState,b);
			var cost = this.lrtaCost(newState,b,this.result[newState][b]);
			if(cost < min){
				min = cost;
				a = b;
			}
			console.log(this.problem.getIJ(this.result[newState][b])+" "+cost);
		}

		var coord = this.problem.getIJ(newState);
		console.log("(%d,%d)",coord[0],coord[1]);
		this.s = newState;
		this.a = a;
		return a;
	};
	this.lrtaCost = function(state,action,newState){
		if(this.H[newState] == null)
		return this.problem.h(state);
		else
		return this.problem.cost(state,action,newState) + this.H[newState];
	};
};
