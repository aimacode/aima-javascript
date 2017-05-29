const policyEvaluation = function({pi, U, mdp, k=20}){
    /*
    mapped from the python implementation of policy_iteration function.
    ref: https://github.com/aimacode/aima-python/blob/master/mdp.py
    
    Inputs:
    - pi: A policy, a mapping from states to actions
    - U: A utility mapping, a mapping from states to expected gain
    - mdp: A markov decision process (MDP)
    - k: The number of steps looking in the future
    */
    const history = {iteration: []};
    for(let i = 0; i < k; i++){
        history.iteration.push([]);
        for(let s of mdp.get_all_reachable_non_terminal_states()){
            let sum = 0, next_states = mdp.T(s, pi[s.x][s.y]);
            for(let {p, next_state:ns} of next_states){
                sum += p * U[ns.x][ns.y];
            }
            U[s.x][s.y] = mdp.R(s) + mdp.gamma * sum;
            
            history.iteration[i].push({
                s: s,
                ns: next_states,
                v: U[s.x][s.y]
            });
        }
    }
    return {U, history};
};