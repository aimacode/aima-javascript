var CSP = {};

/****
 * vars        An array of variables
 * domains     An object of { "var1": ["possible value 1", "possible value 2", ...], ... } that lists the possible options for each var
 * neighbours  An object of { "var1": ["var2", "var3"], ...} that lists the other variables that participate in constraints
 * constraints A function f(A, a, B, b) that returns true if neighbours A, B satisfy the contraint when they have values A=a, B=b
 ****/
CSP.get_solution = function(vars_list, domains_list, neighbours, constraints){
	//sort the vars array and put the one with the highest number of constraints first
	vars_list.sort(function (a,b){
		return neighbours[b].length - neighbours[a].length;
	});

	//recurse into a solution selector
	var res = CSP.select_soln([], vars_list, domains_list, neighbours, constraints);
	//convert the res array into an object
	if (res){
		var soln_obj = {};
		res.map(function(val, i, arr){
			soln_obj[val["variable"]] = val["soln"];
		});
		return soln_obj;
	}else
		return false;
};

CSP.select_soln = function(assigned, vars_left, domains_left, neighbours, constraints_fn){
	if (vars_left.length == 0){
		//finished!
		return assigned;
	}else{
		//take the most constrained item...
		var solve_for = vars_left.shift();

		//...check if there are any possible solutions remaining for it
		if (domains_left[solve_for].length < 1){
			//this path is not viable
			return false;
		}

		var new_domains = Object.clone(domains_left);

		//now that we know there are still options here...
		for (var i = 0; i < domains_left[solve_for].length; i++){
			//...take the next domain element available for this solution
			var proposed = domains_left[solve_for][i];

			//navigate through the neighbours to remove any options that are no longer viable due to this assigment
			neighbours[solve_for].map(function (curr_neighbour, j, all_neighbours){
				var curr_neighbour_options = domains_left[curr_neighbour];
				var new_neighbour_options = [];
				curr_neighbour_options.map(function (neighbour_option, k, all_options){
					if (constraints_fn(solve_for, proposed, curr_neighbour, neighbour_option))
						//keep this valid option
						new_neighbour_options.push(neighbour_option);
				//replace the options list with this one
				});
				new_domains[curr_neighbour] = new_neighbour_options;

				//TODO - if a variable is removed that is NOT assigned and the domain is reduced to zero, fail early

			});

			var viable = (function(a, v, d, n, c){
				return CSP.select_soln(a, v, d, n, c);
			})(Array.prototype.concat(assigned, {variable: solve_for, soln: proposed}),
			   clone(vars_left),
			   new_domains,
			   neighbours,
			   constraints_fn);

			//if this is not false, it means success, otherwise we have to iterate to the next possible value
			if (viable != false){
				return viable;
			}
		}
		//this path is not viable
		return false;
	}

};
