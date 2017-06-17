const PEView = (function(d3, Chart){
    class StaticView {
        constructor(data, root, params){
            this.data = data;
            this.collection = this.init(root, params);
            this.update(params);
            this.data = null;
        }
        
        init(){
            throw 'You must implement the init method';
        }
        
        update(){
            throw 'You must implement the update method';
        }
        
        exit(){
            this.collection.data([]).exit().remove();
        }
    }
    
    class Grid extends StaticView {
        constructor(data, root, params){
            // data: [{ x: x_index, y: y_index, t: state_type }]
            super(data, root, params);
        }
        
        init(root, {state_size}){
            return root.selectAll('.state')
                .data(this.data).enter().append('rect')
                .attr('class', d => 'state ' + (d.t ? 'terminal' : 'normal'))
                .attr('width', state_size)
                .attr('height', state_size);
        }
        
        update({x, y, state_size}){
            this.collection
                .attr('width', state_size)
                .attr('height', state_size)
                .attr('x', d => x(d.x))
                .attr('y', d => y(d.y));
        }
    }
    
    class Policy extends StaticView {
        constructor(data, root, params){
            //data: [{ x: x_index, y: y_index, o: orientation }]
            super(data, root, params);
        }
        
        init(root, {state_size}){
            return root.selectAll('.policy')
                .data(this.data).enter().append('path')
                .attr('class', 'policy')
                .attr('d', d3.symbol().type(d3.symbolTriangle).size(state_size * 5));
        }
        
        update({x, y, state_size}){
            this.collection
                .attr('d', d3.symbol().type(d3.symbolTriangle).size(state_size * 5))
                .attr('transform', d => 
                    'translate(' +
                    (x(d.x) + state_size / 2) + ',' +
                    (y(d.y) + state_size / 2) + ')' +
                    'rotate(' + [1,0,-1][d.o] * 90 + ')'
                );
        }
    }
    
    class XAxis extends StaticView {
        constructor(data, root, params){
            // data: [{ x: x_index, y: y_index, v: value }]
            super(data, root, params);
        }
        
        init(root, {}){
            return root.selectAll('.x_axis')
                .data(this.data).enter().append('text')
                .attr('class', 'axis x_axis')
                .text(d => d.v);
        }
        
        update({x, y, state_size, margin, height}){
            this.collection
                .attr('x', d => margin.left + x(d.x) + state_size / 2)
                .attr('y', d => height + margin.bottom / 2)
        }
    }
    
    class YAxis extends StaticView {
        constructor(data, root, params){
            // data: [{ x: x_index, y: y_index, v: value }]
            super(data, root, params);
        }
        
        init(root, {}){    
            return root.selectAll('.y_axis')
                .data(this.data).enter().append('text')
                .attr('class', 'axis y_axis')
                .text(d => d.v);
        }
        
        update({x, y, state_size, margin, height}){
            this.collection
                .attr('x', d => margin.left / 2)
                .attr('y', d => height - y(d.y) - state_size / 2)
        }
    }
    
    class StateValue {
        constructor(data, root, params){
            this.num_iter = params.num_iter;
            this.data = data;
            this.collection = this.init(root, params);
            this.update(params);
            this.data = null;
        }
        
        init(){
            throw 'You must implement the init method';
        }
        
        update(){
            throw 'You must implement the update method';
        }
        
        exit(){
            this.collection.data([]).exit().remove();
        }
        
        height(d, state_size){
            return Math.abs(state_size * d / 2);
        }
        
        width(state_size){
            return state_size / (this.num_iter + 1);
        }
        
        x(i, state_size){
            return i * state_size / (this.num_iter + 1);
        }
        
        y(d, state_size){
             if(d < 0){
                 return state_size / 2;
            } else {
                return state_size * (1 - d) / 2;
            }
        }
    }
    
    class SVHistory extends StateValue {
        constructor(data, root, params){
            // data: [{ x: x_index, y: y_index, svh: state_value_history }]
            super(data, root, params);
        }
        init(root, {x, y, state_size}){
            const states = root.selectAll('.state_value_history')
                .data(this.data).enter().append('g')
                .attr('class', d => 'state_value_history');
                
            const bar = states.selectAll('.bar')
                    .data(d => d.svh).enter().append('rect')
                    .attr('class', d => 'bar ' + (d > 0 ? 'pos' : 'neg'))
                    .attr('width', this.width(state_size))
                    .attr('height', d => this.height(d, state_size));
                
            return states;
        }
        update({x, y, state_size}){
            this.collection
                .attr('transform', d => 'translate(' + x(d.x) + ',' + y(d.y) + ')')
                .selectAll('.bar')
                    .attr('width', this.width(state_size))
                    .attr('height', d => this.height(d, state_size))
                    .attr('x', (d, i) => this.x(i, state_size))
                    .attr('y', d => this.y(d, state_size));
        }
        step(data, {x, y, state_size}){
            const coll = this.collection.data(data).selectAll('.bar').data(d => d.svh);
            
            coll.enter()
                .append('rect').attr('class', d => 'bar ' + (d > 0 ? 'pos' : 'neg'))
                .attr('width', this.width(state_size))
                .attr('height', d => this.height(d, state_size));
                
            coll.exit().remove();
            
            this.update({x, y, state_size});
        }
    }
    
    class SVHighlight extends StateValue{
        constructor(data, root, params){
            // data: [{ x: x_index, y: y_index, sv: state_value, t: terminal?, itr: iteration, inf: influential? }]
            super(data, root, params);
        }
        init(root, {x, y, state_size}){
            return root.selectAll('.sv_highlight')
                .data(this.data).enter().append('rect')
                .attr('class', d => 'sv_highlight' + (d.inf ? ' imp' : ' nor'))
                .attr('width', this.width(state_size))
                .attr('height', d => this.height(d.sv, state_size));
        }
        update({x, y, state_size}){
            this.collection
                .attr('width', this.width(state_size))
                .attr('height', d => this.height(d.sv, state_size))
                .attr('x', d => x(d.x) + (d.t ? 0 : this.x(d.itr, state_size)))
                .attr('y', d => y(d.y) + this.y(d.sv, state_size));
        }
    }
    
    return {Grid, Policy, SVHistory, SVHighlight, XAxis, YAxis}
})(d3);