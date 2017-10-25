const PEModel = (function(policyEvaluation){
    class Model {
        constructor(policy, U, env){
            this.env = env, this.U = U, this.policy = policy;
            const {history} = policyEvaluation({pi:policy, U:U.map(e => e.slice()), mdp:env});
            this.history = history;
            this.num_iter = history.length;
            this.num_steps = history[0].length;
            this.num_cols = this.env.cols;
            this.num_rows = this.env.rows;
            
            this.s_meta = this.state_meta();
            this.p_meta = this.policy_meta();
            this.svh_meta = this.state_value_history_meta();
        }
        
        is_terminal (i, j){
            if(this.env.terminals[i] !== undefined && this.env.terminals[i][j] === true){ return true; }
            return false;
        }
        
        * states(){
            for(let r = 0; r < this.num_rows; r++){
                for(let c = 0; c < this.num_cols; c++){
                    if(this.env.grid[r][c] !== null){
                        let t = this.is_terminal(r, c);
                        yield [r, c, t];
                    }
                }
            }
        }
        
        * normal_states(){
            for(let [r, c, t] of this.states()){
                if(!t) yield [r, c];
            }
        }
        
        * terminal_states(){
            for(let [r, c, t] of this.states()){
                if(t) yield [r, c];
            }
        }
        
        state_meta(){
            const state_meta = [];
            for(let [r, c, t] of this.states()){
                let x = c, y = r;
                state_meta.push({x, y, t});
            }
            return state_meta;
        }
        
        policy_meta(){
            const policy_meta = [];
            for(let [r, c, t] of this.normal_states()){
                let x = c, y = r;
                policy_meta.push({x, y, o: this.policy[r][c].dir});
            }
            return policy_meta;
        }
        
        upto(itr){
            return [
                [...this.normal_states()].map(([r, c]) => this.U[r][c]),
                ...(this.history.slice(0, itr).map(ci => ci.map(e => e.v)))
            ]
        }
        
        state_value_history_meta(){
            let state_values = this.upto(this.num_iter);
            const state_value_history_meta = [...this.normal_states()].map(([r, c], i) => ({
                x:c, y:r, svh: state_values.map(e => e[i])
            }));
            return state_value_history_meta;
        }
        
        svh_upto(itr, stp=0){
            let sv_hist = null;
            if (itr === -1) {
                sv_hist = this.svh_meta.map(({x,y,svh}) => ({x, y, svh:[svh[0]]}));
            } else {
                sv_hist = this.svh_meta.map(({x,y,svh}) => ({x, y, svh: svh.slice(0, itr + 1)}));
                for(let i = 0; i <= stp; i++) {
                    sv_hist[i].svh.push(this.svh_meta[i].svh[itr + 1]);
                }
            }
            for(let [r, c] of this.terminal_states()){
                sv_hist.push({x:c, y:r, svh: [this.U[r][c]]});
            }
            return sv_hist;
        }
        
        action(itr, stp){
            let next_states = this.history[itr][stp].ns;
            return next_states.map(({x,y,p}) => ({x:y, y:x, p}));
        }
    }
    
    return {Model};
    
})(policyEvaluation);