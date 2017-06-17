const PEController = (function(PEView, PEModel, Interactive, d3){
    class Controller extends Interactive{
        constructor({canvas, policy, U, env, sliderbar, callbacks=[], margin={top: 0, right: 0, bottom: 30, left: 30}}){
            const model = new PEModel.Model(policy, U, env);
            const num_vis = 3;
            const max_step = model.num_iter * model.num_steps * num_vis - 1;
            super(max_step, -1, sliderbar, callbacks);
            
            this.model = model;
            this.num_vis = num_vis;

            this.canvas = canvas, this.margin = margin;
            this.svg = this.canvas.append('svg');
            
            this.update();
            this.add_layers();
            this.update_layers();
        }
        
        update(){
            this.width = Math.floor(this.canvas.node().getBoundingClientRect().width) - this.margin.left;
            this.state_size = Math.floor(this.width / this.model.num_cols);
            this.height = this.state_size * this.model.num_rows;
            
            this.svg
                .attr('width', this.width + this.margin.left + this.margin.right)
                .attr('height', this.height + this.margin.top + this.margin.bottom);
                
            this.x = d3.scaleBand().domain([...Array(this.model.num_cols).keys()]).rangeRound([0, this.width]);
            this.y = d3.scaleBand().domain([...Array(this.model.num_rows).keys()]).rangeRound([0, this.height]);
        }
        
        add_layers(){
            const x_axis_data = [...Array(this.model.num_cols).keys()].map(c => ({v:c + 1, x:c, y:0}));
            const y_axis_data = [...Array(this.model.num_rows).keys()].map(r => ({v:r + 1, x:0, y:r}));
            
            this.g = this.svg.append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
                
            const p = this.params();
            this.grid = new PEView.Grid(this.model.s_meta, this.g, p);
            this.policy = new PEView.Policy(this.model.p_meta, this.g, p);
            this.sv_hist = new PEView.SVHistory(this.model.svh_upto(-1), this.g, p);
            this.xaxis = new PEView.XAxis(x_axis_data, this.svg, p);
            this.yaxis = new PEView.YAxis(y_axis_data, this.svg, p);
        }
        
        params(){
            return {
                x: this.x, y: this.y,
                state_size: this.state_size,
                margin: this.margin,
                height: this.height,
                width: this.width,
                num_iter: this.model.num_iter
            };
        }
        
        resize(){
            this.update();
            this.update_layers();
        }
        
        update_layers(){
            const p = this.params();
            
            this.grid.update(p);
            this.policy.update(p);
            this.sv_hist.update(p);
            this.xaxis.update(p);
            this.yaxis.update(p);
            
            if(this.highlight) this.highlight.update(p);
        }
        
        decode_step(step){
            const c = this.model.num_steps * this.num_vis;
            const
                itr = Math.floor(step / c),
                stp = Math.floor((step % c) / this.num_vis),
                vis = step % this.num_vis;
            return {itr, stp, vis};
        }
        
        prev_step(itr, stp){
            if(stp > 0){
                return [itr, stp - 1];
            } else {
                return [itr - 1, this.model.num_steps - 1];
            }
        }
        
        move(step){
            this.step = step;
            super.move();
            if(this.highlight) this.highlight.exit();
            
            const {itr, stp, vis} = this.decode_step(step);
            const sv_hist = this.model.svh_upto(itr, stp);
            const [_itr, _stp] = this.prev_step(itr, stp);
            const _sv_hist = this.model.svh_upto(_itr, _stp);
            const params = this.params();
            
            const next_states = this.model.action(itr, stp);
            const highlight_data = this.highlight_data(next_states, _sv_hist);

            if(vis === 0) { // relax (no highlight)
                this.sv_hist.step(_sv_hist, params);
            } else if (vis === 1) { // highlight
                this.sv_hist.step(_sv_hist, params);
                this.highlight = new PEView.SVHighlight(highlight_data, this.g, params);
            } else if (vis === 2) { // highlight + update
                this.sv_hist.step(sv_hist, params);
                this.highlight = new PEView.SVHighlight(highlight_data, this.g, params);
            }
        }
        
        highlight_data(ns, sv_hist){
            const data = [];
            for(let i in ns){
                let {x,y,p} = ns[i];
                let sv, t, itr;
                for(let s of sv_hist){
                    if(s.x === x && s.y === y){
                        sv = s.svh[s.svh.length - 1];
                        itr = s.svh.length - 1;
                        t = s.svh.length === 1;
                        break;
                    }
                }
                data.push({x, y, inf: p > 0.5, itr, sv, t});
            }
            return data;
        }
        
    }
    
    return {Controller};
    
})(PEView, PEModel, Interactive, d3);