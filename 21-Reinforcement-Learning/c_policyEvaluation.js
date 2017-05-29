const VIS = (function(MDP, Two, policyEvaluation) {
    const
        /* Thanks to Alfred Yi Zhang for visual support */
        TerminalStateColor = '#B2B2B2', // gray
        NormalStateColor = '#DDDDDD',   // lightgray
        PolicyColor = '#FFFFFF',        // white
        StateStrokeColor = '#FFFFFF',   // white
        NSC1 = '#FFE65E',
        NSC2 = '#FFEBA0',
        TerminalTextStyle = {
            family: 'sans-serif',
            size: 40,
            weight: 900,
            fill: '#FFFFFF'
        },
        PolicyTextStyle = {
            family: 'sans-serif',
            size: 20,
            fill: '#000000'
        };
        
    
    class GridWorld{
        constructor({canvas, env_args, scale}){
            this.env_args = env_args; // Init params of grid world
            this.scale = scale; // The width of states in pixel
            this.two = new Two({
                width: env_args.grid[0].length * scale,
                height: env_args.grid.length * scale
            }).appendTo(document.getElementById(canvas)); // canvas
            this.add_grid(); // Initialize the grid
        }
        
        add_grid(){
            this._S = {}; // Keeps a refrence to the squares
            this.env = new MDP.GridWorld(this.env_args);
            
            for(let i = 0; i < this.env.rows; i++){
                this._S[i]={};
                for(let j = 0; j < this.env.cols; j++){
                    let x = this.scale/2 + j*this.scale, y = this.scale/2 + i*this.scale;
                    
                    if(this.env.grid[i][j] === null){
                        // unreachable state do nothing
                        continue;
                    }
                    
                    this._S[i][j] = this.two.makeRectangle(x, y, this.scale, this.scale);
                    if(this.env.terminals[i] !== undefined && this.env.terminals[i][j] === true){
                        // terminal state
                        this._S[i][j].fill = TerminalStateColor;
                    } else {
                        // normal state
                        this._S[i][j].fill = NormalStateColor;
                    }
                }
            }
        }
    }
        
    
    class PolicyEvaluationVisualizer extends GridWorld{
        constructor({canvas, env_args, policy, U, scale}){
            super({canvas, env_args, scale});
            this.policy=policy, this.U=U;
            this.init();
        }
        
        init(){
            this._ci = 0, this._cs = 0, this._cu = 0; // current iteration, current state, current update
            this.promise = new Promise((resolve, reject) => { resolve();});
            this.add_policy();
            this.add_state_values();
            this.two.update();
            const {U, history} = policyEvaluation({pi:this.policy, U:this.U, mdp:this.env});
            this.history = history;
        }
        
        reset(){
            this.promise = this.promise.then((res) => {
                return new Promise((resolve, reject)=>{
                    this._ci = 0, this._cs = 0, this._cu = 0;
                    this.two.clear();
                    this.add_grid();
                    this.add_policy();
                    this.add_state_values();
                    this.two.update();
                    resolve();
                });
            });
        }
        
        add_policy(){
            this._P={};
            for(let i = 0; i < this.env.rows; i++){
                this._P[i]={};
                this._PG = this.two.makeGroup();
                for(let j = 0; j < this.env.cols; j++){
                    let x = this.scale/2 + j*this.scale, y = this.scale/2 + i*this.scale;
                    
                    if(this.env.grid[i][j] === null){
                        // unreachable state do nothing
                        continue;
                    }
                    
                    if(this.env.terminals[i] === undefined || this.env.terminals[i][j] === undefined){
                        // policy (triangle)
                        this._P[i][j] = this.two.makePolygon(x, y, this.scale/4, 3);
                        this._P[i][j].fill = PolicyColor;
                        this._P[i][j].rotation = (Math.PI/2)*(1 - this.policy[i][j].dir);
                        this._P[i][j].noStroke();
                        this._PG.add(this._P[i][j]);
                    }
                }
            }
            
        }
        
        add_state_values(){
            this._U={};
            this._UG = this.two.makeGroup();
            for(let i = 0; i < this.env.rows; i++){
                this._U[i]={};
                for(let j = 0; j < this.env.cols; j++){
                    let x = this.scale/2 + j*this.scale, y = this.scale/2 + i*this.scale;
                    
                    if(this.env.grid[i][j] === null){
                        // unreachable state do nothing
                        continue;
                    }
                    
                    if(this.env.terminals[i] !== undefined && this.env.terminals[i][j] === true){
                        // terminal state
                        this._U[i][j] = this.two.makeText(this.U[i][j], x, y, TerminalTextStyle);
                    } else {
                        this._U[i][j] = this.two.makeText('0', x, y, PolicyTextStyle);
                    }
                    this._UG.add(this._U[i][j]);
                }
            }
        }
        
        
        step(){
            this.promise = this.promise
                .then((res) => {
                    return this.take_step()
                        .then((res) => {
                            return new Promise((resolve, reject) => {
                                this._cu += 1;
                                if(this._cu === 3){
                                    this._cu=0, this._cs += 1;
                                    if(this._cs === this.history.iteration[0].length){
                                        this._cs=0, this._ci += 1;
                                    }
                                }
                                resolve();
                            });
                        })
            });
        }
        
        take_step(){
            return new Promise((resolve, reject) => {
                if(this._ci < this.history.iteration.length){
                    const {s, ns, v} = this.history.iteration[this._ci][this._cs];
                    const to = 1000;
                    if(this._cu === 0){
                        this._highlight_next_states(s,ns,to).then( resolve() );
                    } else if(this._cu === 1){
                        this._update_value(s,v,to).then( resolve() );
                    } else if(this._cu === 2){
                        this._revert(ns,to).then( resolve() );
                    }
                } else {
                    resolve();
                }
            });
        }
        
        
        _highlight_next_states(cs, ns){
            return new Promise((resolve, reject) => {
                for(let {p, next_state:s} of ns){
                    if(p > 0.5){
                        this._S[s.x][s.y].fill = NSC1;
                        if(this.env.terminals[s.x] === undefined || this.env.terminals[s.x][s.y] !== true){
                            this._P[s.x][s.y].fill = NSC1;
                        }
                    } else {
                        this._S[s.x][s.y].fill = NSC2;
                        if(this.env.terminals[s.x] === undefined || this.env.terminals[s.x][s.y] !== true){
                            this._P[s.x][s.y].fill = NSC2;
                        }
                    }
                }
                this._U[cs.x][cs.y].size = 34;
                this.two.update();
                resolve();
            });
        }
        
        _update_value(s, v){
            return new Promise((resolve, reject) => {
                this._U[s.x][s.y].value = v.toFixed(2);
                this.two.update();
                resolve();
            });
        }
        
        _revert(ns){
            return new Promise((resolve, reject) => {
                for(let {p, next_state:s} of ns){
                    if(this.env.terminals[s.x] !== undefined && this.env.terminals[s.x][s.y] === true){
                        this._S[s.x][s.y].fill = TerminalStateColor;
                    } else {
                        this._S[s.x][s.y].fill = NormalStateColor;
                        this._P[s.x][s.y].fill = PolicyColor;
                        this._U[s.x][s.y].size = PolicyTextStyle.size;
                    }
                }
                this.two.update();
                resolve();
            });
        }
    }
    
    return {
        GridWorld: GridWorld,
        PolicyEvaluationVisualizer: PolicyEvaluationVisualizer
    }
})(MDP, Two, policyEvaluation);

$(document).ready(function(){
    
    $.ajax({
        url : "policyEvaluation.js",
        dataType: "text",
        success : function (data) {
            $("#policyEvaluationCode").html(data);
        }
    });

    // Init Env
    const env_args = {
        grid: [
            [-0.04, -0.04, -0.04, +1],
            [-0.04, null,  -0.04, -1],
            [-0.04, -0.04, -0.04, -0.04]
        ],
        orientations: [0, 1, 2, 3].map(d => new MDP.Heading(d)),
        terminals: [{x:0, y:3}, {x:1, y:3}],
        init: {x:0, y:0},
        gamma: 1.0
    }
    
    // Init Policy
    const policy  = {
        2: {0:new MDP.Heading(1),1:new MDP.Heading(2),2:new MDP.Heading(2),3:new MDP.Heading(2)},
        1: {0:new MDP.Heading(1),2:new MDP.Heading(1)},
        0: {0:new MDP.Heading(0),1:new MDP.Heading(0),2:new MDP.Heading(0)}
    }
    
    // state value
    const U = [
        [0,0,0,+1],
        [0, null,0,-1],
        [0,0,0,0]
    ]
    
    // Visualize
    const PEV = new VIS.PolicyEvaluationVisualizer({canvas:'canvas', env_args, policy, U, scale:100});
    
    // add step handler
    $('#canvas').on('click tap', () => {
        PEV.step();
    });
    
    // reset the values
    $('#reset-btn').on('click tap', () => {
        PEV.reset();
    });
});