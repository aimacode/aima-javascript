const MDP = (function() {
    class BaseEnv {
        /*
        mapped from the python implementation of MDP class.
        ref: https://github.com/aimacode/aima-python/blob/master/mdp.py
        */
        constructor({init, actlist, terminals, gamma}){
            /*
            Inputs:
            - init: The initial state of the agent. Ex. {x:0, y:0}.
            - actlist: The list of all possible actions. Ex. [new heading(0), ...]
            - terminals: The list of all terminal states. Ex. [{x:1, y:4}, ...]
            - gamma: The reward decay rate. Ex. 0.9
            */
            this.init = init;
            this.actlist = actlist;
            
            this.terminals = {};
            for(let t of terminals){
                if(this.terminals[t.x] === undefined){ this.terminals[t.x] = {}; }
                this.terminals[t.x][t.y] = true;
            }
            
            if (0 <= gamma <= 1) {
                this.gamma = gamma;
            } else {
                this.gamma = 0.9;
            }
            
            this.states = {};
            this.reward = {};
        }
        
        get_all_reachable_non_terminal_states(){
            // returns a list of all states in the env
            const states = [];
            for(let x in this.states){
                for(let y in this.states[x]){
                    if(this.terminals[x] !== undefined && this.terminals[x][y] === true){ continue; }
                    states.push({x: parseInt(x), y: parseInt(y)});
             	}
            }
            return states;
        }
        
        R(state){
            /*
            Inputs:
            - state: An environment state. Ex. {x:0, y:0}.
            */
            return this.reward[state.x][state.y];
        }
        
        T(state, action){
            /*
            Inputs:
            - state: An environment state. Ex. {x:0, y:0}.
            - action: A single action. Ex. new Heading(0)
            */
            throw new Error('Not Implemented');
        }
        
        actions(state){
             /*
            Inputs:
            - state: An environment state. Ex. {x:0, y:0}.
            */
            if(this.terminals[state.x] !== undefined && this.terminals[state.x][state.y] === true){
                return [];
            } else {
                return this.actlist;
            }
        }
    }
    
    class GridWorld extends BaseEnv {
        /*
        mapped from the python implementation of GridMDP class.
        ref: https://github.com/aimacode/aima-python/blob/master/mdp.py
        */
        constructor({grid, orientations, terminals, init, gamma}){
            /*
            Inputs:
            - grid: A 2d list of rewards for each state. 
            - init: The initial state of the agent. Ex. {x:0, y:0}.
            - orientations: The list of all possible actions. Ex. [new heading(0), ...]
            - terminals: The list of all terminal states. Ex. [{x:1, y:4}, ...]
            - gamma: The reward decay rate. Ex. 0.9
            */
            super({init, actlist:orientations, terminals, gamma});
            
            this.grid = grid;
            this.rows = grid.length;
            this.cols = grid[0].length;
            
            for(let x=0; x < this.rows; x++){
                this.reward[x] = {};
                for(let y=0; y < this.cols; y++){
                    this.reward[x][y] = grid[x][y];
                    if (grid[x][y] !== null){
                        if(this.states[x] === undefined) { this.states[x] = {}; }
                        this.states[x][y] = true;
                    }
                }
            }
        }
        
        T(state, action) {
            /*
            Inputs:
            - state: An environment state. Ex. {x:0, y:0}.
            - action: A single action. Ex. new Heading(0)
            */
            if(action === null) {
                return [1.0, state];
            } else {
                return [
                    {p: 0.8, s: this.go(state, action)},
                    {p: 0.1, s: this.go(state, action.left())},
                    {p: 0.1, s: this.go(state, action.right())},
                ];
            }
        }
        
        go(state, direction) {
            /*
            Inputs:
            - state: An environment state. Ex. {x:0, y:0}.
            - direction: a Heading object.
            */
            const dir_vec = direction.to_vec();
            const nextState = {x: (state.x + dir_vec.x), y: (state.y + dir_vec.y)};
            if(this.states[nextState.x] !== undefined && this.states[nextState.x][nextState.y] === true){
                return nextState;
            } else {
                return state;
            }
        }
        
        to_grid(mapping){
            /*
            Inputs:
            - mapping: a nested json object mapping states to a string value.
            */
            const grid = [];
            for(let x=0; x<this.rows; x++){
                grid.push([]);
                for(let y=0; y<this.cols; y++){
                    grid[x].push(mapping[x][y]);
                }
            }
            return grid;
        }
    }
    
    
    class Heading{
        /*
        Imitating grid.py
        ref: https://github.com/aimacode/aima-python/blob/master/grid.py
        */
        constructor(direction){
            // right(0), up(1), left(2), down(3)
            this.dir = direction;
        }
        
        to_arrow(){
            return {0: '>', 1: '^', 2: '<', 3: 'v'}[this.dir];
        }
        
        left(){
            return new Heading((this.dir + 1) % 4);
        }
        
        right(){
            return new Heading((this.dir + 3) % 4);
        }
        
        to_vec(){
            return {0:{x:0, y:1}, 1:{x:-1, y:0}, 2:{x:0, y:-1}, 3:{x:1, y:0}}[this.dir];
        }
    }
    
    return {
        BaseEnv: BaseEnv,
        GridWorld: GridWorld,
        Heading: Heading
    };
    
})();