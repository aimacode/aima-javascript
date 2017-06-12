const VIS = (function(MDP, policyEvaluation, d3) {
    class GridWorld {
        constructor({canvas, env_args, policy, U, callback}){
            this.env_args = env_args;
            this.policy = policy;
            this.U = U;
            this.canvas = canvas;
            this.callback = callback;
            this.env = new MDP.GridWorld(this.env_args);
            
            this.margin = {top: 0, right: 0, bottom: 30, left: 30};
            this.width = Math.floor(document.getElementById(canvas).getBoundingClientRect().width) - this.margin.left;
            this.state_size = Math.floor(this.width / this.env.cols);
            this.height = this.state_size * this.env.rows;
            this.svg = d3.select('#' + canvas)
                .append('svg')
                .attr('width', this.width + this.margin.left + this.margin.right)
                .attr('height', this.height + this.margin.top + this.margin.bottom);
                
            this.g = this.svg.append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
            
            this.x = d3.scaleBand().domain([...Array(this.env.cols).keys()]).rangeRound([0, this.width]);
            this.y = d3.scaleBand().domain([...Array(this.env.rows).keys()]).rangeRound([0, this.height]);
            
            const {s, p, sv} = this.init_data();
            this.add_states(s);
            this.add_policy(p);
            this.add_state_value(sv);
            this.add_axis();
            
            const {_, history} = policyEvaluation({pi:this.policy, U:this.U, mdp:this.env});
            this.history = history;
            
            this.num_iter = this.history.iteration.length;
            this.num_states = this.history.iteration[0].length;
            this.num_vis = 3;
            this.max_step = this.num_iter * this.num_states * this.num_vis;
            d3.select("#history").attr('max', this.max_step);
            this.step = -1;
            
            this._sv = this.g.selectAll('.state_value.normal');
            this.sv = new Array(this.num_states).fill(0);
            
            this.timer = null;
        }
        
        init_data(){
            const is_terminal = (i, j) => {
                if(this.env.terminals[i] !== undefined && this.env.terminals[i][j] === true){ return true; }
                return false;
            };
            this.init_state_values = [];
            const s = [], p = [], sv = [];
            for(let i = 0; i < this.env.rows; i++){
                for(let j = 0; j < this.env.cols; j++){
                    if(this.env_args.grid[i][j] !== null){
                        let t = is_terminal(i, j) ? 'terminal' : 'normal';
                        s.push({ x: j, y: i, t: t});
                        if(!is_terminal(i, j)){
                            p.push({ x: j, y: i, p: this.policy[i][j].dir });
                            this.init_state_values.push(this.U[i][j]);
                        }
                        sv.push({ x: j, y: i, sv: this.U[i][j], t: t});
                    }
                }
            }
            return {s, p, sv};
        }
        
        add_axis(){
            const x_axis = [...Array(this.env.cols).keys()].map(c => ({v:c + 1, x:c, y:0}))
            this.svg.selectAll('.x_axis')
                .data(x_axis).enter().append('text')
                .attr('class', 'axis x_axis')
                .text(d => d.v)
                .attr('x', d => this.margin.left + this.x(d.x) + this.state_size/2)
                .attr('y', d => this.height + this.margin.bottom/2)
            const y_axis = [...Array(this.env.rows).keys()].map(r => ({v:r + 1, x:0, y:r}))
            this.svg.selectAll('.y_axis')
                .data(y_axis).enter().append('text')
                .attr('class', 'axis y_axis')
                .text(d => d.v)
                .attr('x', d => this.margin.left/2)
                .attr('y', d => this.height - this.y(d.y) - this.state_size/2)
        }
        adjust_axis(){
            this.svg.selectAll('.x_axis')
                .attr('x', d => this.margin.left + this.x(d.x) + this.state_size/2)
                .attr('y', d => this.height + this.margin.bottom/2)
                
            this.svg.selectAll('.y_axis')
                .attr('x', d => this.margin.left/2)
                .attr('y', d => this.height - this.y(d.y) - this.state_size/2)
        }
        
        add_states(s){
            this.g.selectAll('.state')
                .data(s).enter().append('rect')
                .attr('width', this.state_size)
                .attr('height', this.state_size)
                .attr('x', (d, i) => this.x(d.x))
                .attr('y', (d, i) => this.y(d.y))
                .attr('class', (d, i) => 'state ' + d.t);
        }
        adjust_states(){
            this.g.selectAll('.state')
                .attr('width', this.state_size)
                .attr('height', this.state_size)
                .attr('x', (d, i) => this.x(d.x))
                .attr('y', (d, i) => this.y(d.y))
        }
        
        add_policy(p){
            this.g.selectAll('.policy')
                .data(p).enter().append('path')
                .attr('d', d3.symbol().type(d3.symbolTriangle).size(this.state_size*5))
                .attr('transform', (d, i) => 
                    'translate(' +
                    (this.x(d.x) +  this.state_size / 2) + ',' +
                    (this.y(d.y) +  this.state_size / 2) + ')' +
                    'rotate(' + [1,0,-1][d.p] * 90 + ')'
                )
                .attr('class', 'policy');
        }
        adjust_policy(){
            this.g.selectAll('.policy')
                .attr('d', d3.symbol().type(d3.symbolTriangle).size(this.state_size*5))
                .attr('transform', (d, i) => 
                    'translate(' +
                    (this.x(d.x) +  this.state_size / 2) + ',' +
                    (this.y(d.y) +  this.state_size / 2) + ')' +
                    'rotate(' + [1,0,-1][d.p] * 90 + ')'
                )
        }
        
        add_state_value(sv){
            this.g.selectAll('.state_value')
                .data(sv).enter().append('text')
                .text((d, i) => d.sv)
                .attr('x', (d, i) => this.x(d.x) + this.state_size / 2)
                .attr('y', (d, i) => this.y(d.y) + this.state_size / 2)
                .attr('class', (d, i) => 'state_value ' + d.t);
        }
        adjust_state_value(){
            this.g.selectAll('.state_value')
                .attr('x', (d, i) => this.x(d.x) + this.state_size / 2)
                .attr('y', (d, i) => this.y(d.y) + this.state_size / 2)
        }
        
        adjust_graph(){
            this.adjust_axis();
            this.adjust_states();
            this.adjust_policy();
            this.adjust_state_value();
            if(-1 < this.step) this.move(this.step);
        }
        resize(){
            this.width = Math.floor(document.getElementById(this.canvas).getBoundingClientRect().width) - this.margin.left;
            this.state_size = Math.floor(this.width / this.env.cols);
            this.height = this.state_size * this.env.rows;
            this.svg
                .attr('width', this.width + this.margin.left + this.margin.right)
                .attr('height', this.height + this.margin.top + this.margin.bottom);
                
            this.x = d3.scaleBand().domain([...Array(this.env.cols).keys()]).rangeRound([0, this.width]);
            this.y = d3.scaleBand().domain([...Array(this.env.rows).keys()]).rangeRound([0, this.height]);
            
            this.adjust_graph();
        }
        
        
        cleanup(){
            if(this.timer !== null){
                clearInterval(this.timer);
                this.timer = null;
            }
        }
        
        next(){
            this.cleanup();
            this.move(Math.min(this.step + 1, this.max_step - 1));
        }
        
        back(){
            this.cleanup();
            this.move(Math.max(this.step - 1, 0));
        }
        
        jump_to(value){
            this.cleanup();
            this.move(value);
        }
        
        animate(){
            if(this.timer !== null){
                clearInterval(this.timer);
                this.timer = null;
            } else {
                this.timer = setInterval(() => {
                    let new_step = Math.min(this.step + 1, this.max_step - 1);
                    this.move(new_step);
                    
                }, 200);
            }
        }
        
        move(step){
            this.step = step;
            d3.select('#history').property('value', this.step);
            const {itr, stp, vis} = this.decode_step();
            let callback_data = [this.init_state_values];
            if(itr === 0){
                this.sv = new Array(this.num_states).fill(0);;
            } else {
                callback_data = callback_data.concat(this.history.iteration.slice(0, itr).map(ci => ci.map(e=> e.v.toFixed(2))));
                this.sv = this.history.iteration[itr-1].map(e => e.v.toFixed(2));
            }
            this.callback(callback_data);
            for(let i = 0; i < stp; i++) { this.sv[i] = this.history.iteration[itr][i].v.toFixed(2); }
            this._sv.text((d, i) => this.sv[i]);

            const {s, v, ns} = this.history.iteration[itr][stp];
            this.g.selectAll('.next_state').data([]).exit().remove();
            if(vis === 0){
                this.highlight(s, ns.map((e) => ({s:e.next_state, p:e.p}) ));
            } else if (vis === 1) {
                this.highlight(s, ns.map((e) => ({s:e.next_state, p:e.p}) ));
                this.sv[stp] = v.toFixed(2);
                this._sv.text((d, i) => this.sv[i]);
            } else {
                this.sv[stp] = v.toFixed(2);
                this._sv.text((d, i) => this.sv[i]);
            }
        }
        
        highlight(s, ns){
            let _ns = this.g.selectAll('.next_state');
            _ns.data(ns).enter().append('rect')
                .attr('width', this.state_size)
                .attr('height', this.state_size)
                .attr('x', (d) => this.x(d.s.y))
                .attr('y', (d) => this.y(d.s.x))
                .attr('class', (d) => {
                    return 'next_state' +
                        (d.p > 0.5 ? ' imp' : ' nor') +
                        (d.s.x === s.x && d.s.y === s.y ? ' selected' : '');
                });
        }
        
        decode_step(){
            const c = this.num_states * this.num_vis;
            const
                itr = Math.floor(this.step / c),
                stp = Math.floor((this.step % c) / this.num_vis),
                vis = this.step % this.num_vis;
            return {itr, stp, vis};
        }
    }
    
    return {
        GridWorld: GridWorld
    };
    
})(MDP, policyEvaluation, d3);


const init_sv_graph = function(canvas, env_args){
    const colors = ['red', 'blue', 'green', 'yellow', 'black', 'orange', 'purple', 'pink', 'gray'];
    const cols = [];
    for(let r = 0; r < env_args.grid.length; r++){
        for(let c = 0; c < env_args.grid[0].length; c++){
            if(env_args.grid[r][c] && !env_args.terminals.some(e => e.x === r && e.y === c)){
                cols.push((env_args.grid.length -  r) + ', ' + (c + 1));
            }
        }
    }
    const config = {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            animation: { duration: 0 },
            legend: {
                position: 'bottom',
                labels: { boxWidth: 8 }
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Iteration'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'State Value'
                    }
                }]
            }
        }
    };
    
    const ctx = document.getElementById(canvas).getContext("2d");
    ctx.canvas.height = 270;
    const sv = new Chart(ctx, config);
    
    const callback = function(data){
        const xLen = data.length
        const dataset = data[0].map((_, col) => ({
            label: cols[col], fill: false, pointRadius: 2,
            backgroundColor: colors[col % colors.length],
            borderColor: colors[col % colors.length],
            data: data.map(row => row[col])
        }));
        config.data.labels = [...Array(xLen).keys()];
        config.data.datasets = dataset;
        sv.update();
    }
    
    return callback;
}

const init_vis = function(){
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
    };
    
    // Init Policy
    const policy  = {
        2: {0:new MDP.Heading(1),1:new MDP.Heading(2),2:new MDP.Heading(2),3:new MDP.Heading(2)},
        1: {0:new MDP.Heading(1),2:new MDP.Heading(1)},
        0: {0:new MDP.Heading(0),1:new MDP.Heading(0),2:new MDP.Heading(0)}
    };
    
    // State Values
    const U = [
        [0,0,0,+1],
        [0, null,0,-1],
        [0,0,0,0]
    ];
    
    const callback = init_sv_graph('sv-graph', env_args);
    return new VIS.GridWorld({canvas:'canvas', env_args, policy, U, callback});
}

$(document).ready(function(){
    $.ajax({
        url : "policyEvaluation.js",
        dataType: "text",
        success : function (data) {
            $("#policyEvaluationCode").html(data);
        }
    });
    
    const PEV = init_vis();
    $('#next').on("click tap", () => { PEV.next(); });
    $('#back').on("click tap", () => { PEV.back(); });
    $('#history').on('input onchange', (event) => { PEV.jump_to(parseInt(event.target.value)); });
    $('#animate').on("click tap", () => { PEV.animate(); });
    window.addEventListener('resize', () => { PEV.resize(); });
});