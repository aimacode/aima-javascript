const policyEvaluation = function({pi, U, mdp, k=10}){
    /*
    mapped from the python implementation of policy_iteration function.
    ref: https://github.com/aimacode/aima-python/blob/master/mdp.py
    
    Inputs:
    - pi: A policy, a mapping from states to actions
    - U: A utility mapping, a mapping from states to expected gain
    - mdp: A markov decision process (MDP)
    - k: The number of steps looking in the future
    */
    const history = [];
    for(let i = 0; i < k; i++){
        history.push([]);
        for(let state of mdp.get_all_reachable_non_terminal_states()){
            let sum = 0, next_states = mdp.T(state, pi[state.x][state.y]);
            for(let {p, s} of next_states){
                sum += p * U[s.x][s.y];
            }
            U[state.x][state.y] = mdp.R(state) + mdp.gamma * sum;
            
            history[i].push({
                x: state.x, y: state.y,
                ns: next_states.map(({s, p}) => ({x:s.x, y:s.y, p:p})),
                v: U[state.x][state.y]
            });
        }
    }
    return {U, history};
};