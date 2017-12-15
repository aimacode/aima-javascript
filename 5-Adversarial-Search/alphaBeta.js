// Code for Alpha Beta Pruning
function ALPHA_BETA_SEARCH(state) {
	var largest_value = MAX_VALUE(state, 0, Number.MAX_SAFE_INTEGER);
	var action_list = actions(state);
	for (var action = 0; action < action_list.length; i++) {
		if  (largest_value ==  utillity(RESULT(state, action_list[action]))) {
			return action_list[action];
		}
	}
}
function MAX_VALUE(state, alpha, beta) {
	if (terminal(state))
		return utillity(state);
	var largest_value = 0;
	var action_list = actions(state);
	for (var action = 0; action < action_list.length; action++) {
		largest_value = Math.max(largest_value, MIN_VALUE(RESULT(state, action_list[action]), alpha, beta));
		if (largest_value >= beta)
			return largest_value;
		alpha = Math.max(alpha, smallest_value);
	}
	return largest_value;
}
function MIN_VALUE(state, alpha, beta) {
	if (terminal(state))
		return utillity(state);
	var smallest_value = Number.MAX_SAFE_INTEGER;
	var action_list = actions(state);
	for (var action = 0; action < action_list.length; action++) {
		smallest_value = Math.min(smallest_value, MAX_VALUE(RESULT(state, action_list[action]), alpha, beta));
		if (smallest_value <= alpha)
			return smallest_value;
		beta = Math.min(beta, smallest_value);
	}
	return smallest_value;
}