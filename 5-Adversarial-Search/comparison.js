class GraphNode {
    constructor(x, y, size, win, self, leaf) {
        this.x = x;
        this.y = y;
        this.children = [];
        if (leaf) {
            this.value = Math.sqrt(Math.pow(win[0] - self[0], 2) + Math.pow(win[1] - self[1], 2)) / Math.sqrt(Math.pow(size, 2) + Math.pow(size, 2));
        } else {
            this.value = undefined;
        }
    }
    draw(ctx, x, y) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.arc(this.x+x,
            this.y+y,
            3.5,
            0,2*Math.PI);
        ctx.fillStyle = 'hsl(0,0%,75%)';
        ctx.fill();
        ctx.strokeStyle = 'hsl(0,0%,75%)';
        ctx.stroke();

        for(let i = 0; i < this.children.length; i++) {
            ctx.beginPath();
            ctx.lineWidth = 0.7;
            ctx.moveTo(this.x+x,this.y+y);
            ctx.lineTo(this.children[i].x+x,this.children[i].y+y);
            ctx.stroke();
        }
    }
    add(other) {
        this.children.push(other);
    }

    mark(ctx, x, y, color = 'hsl(0,50%,65%)') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.1;
        ctx.beginPath();
        ctx.arc(this.x+x,
            this.y+y,
            3.5,
            0,2*Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 0;
        ctx.stroke();
    }
}
class Graph {
    constructor(scale, nodes) {
        //construct nodes
        this.buckets = [];
        let xd = Math.floor(Math.sqrt(nodes));
        let win = [Math.floor(Math.random() * xd), Math.floor(Math.random() * xd)];
        let res = (scale*0.97)/xd;
        let off = (scale*0.03)/2;
        for(let i = 0; i < xd; i++) {
            let row = [];
            for(let j = 0; j < xd; j++) {
                row.push(new GraphNode(i*res + 5 + Math.random()*(res-5)+off, j*res + 5 + Math.random()*(res-5)+off, xd, win, [i, j], (i == 0 ||  i == xd-1 || j == 0 || j == xd-1)));
            }
            this.buckets.push(row);
        }
        this.start = this.buckets[xd/2][xd/2];
        this.buckets[xd/2][xd/2].children.push(this.buckets[xd/2-1][xd/2-1]);
        this.buckets[xd/2][xd/2].children.push(this.buckets[xd/2-1][xd/2]);
        this.buckets[xd/2][xd/2].children.push(this.buckets[xd/2-1][xd/2+1]);
        this.buckets[xd/2][xd/2].children.push(this.buckets[xd/2][xd/2+1]);
        this.buckets[xd/2][xd/2].children.push(this.buckets[xd/2+1][xd/2+1]);
        this.buckets[xd/2][xd/2].children.push(this.buckets[xd/2+1][xd/2]);
        this.buckets[xd/2][xd/2].children.push(this.buckets[xd/2+1][xd/2-1]);
        this.buckets[xd/2][xd/2].children.push(this.buckets[xd/2][xd/2-1]);

        this.buckets[xd/2-1][xd/2+1].children.push(this.buckets[xd/2-2][xd/2+1]);
        
        //add their branches
        for(let i = 0; i < this.buckets.length; i++) {
            for(let j = 0; j < this.buckets[i].length; j++) {
                if (i == xd/2 && j == xd/2) {
                    continue;
                }
                if (i > xd/2 && i < xd-1) {
                    if (j > xd/2 && j < xd-1) { //bottom right
                        if (i/j > 1) {
                            this.buckets[i][j].add(this.buckets[i+1][j+1]);
                            this.buckets[i][j].add(this.buckets[i+1][j]);
                        } else {
                            this.buckets[i][j].add(this.buckets[i][j+1]);
                            this.buckets[i][j].add(this.buckets[i+1][j+1]);
                        }
                    } else if (j > 0) { //top right
                        
                        if ((i-xd/2)/(xd/2-j) > 1) {
                            this.buckets[i][j].add(this.buckets[i+1][j]);
                            this.buckets[i][j].add(this.buckets[i+1][j-1]);
                        } else {
                            this.buckets[i][j].add(this.buckets[i+1][j-1]);
                            this.buckets[i][j].add(this.buckets[i][j-1]);
                        }
                    }
                } else if (i > 0) {
                    if (j > xd/2 && j < xd-1) { //bottom left
                        
                        if ((i-xd/2)/(xd/2-j) > 1) {
                            this.buckets[i][j].add(this.buckets[i-1][j]);
                            this.buckets[i][j].add(this.buckets[i-1][j+1]);
                        } else {
                            this.buckets[i][j].add(this.buckets[i-1][j+1]);
                            this.buckets[i][j].add(this.buckets[i][j+1]);
                        }
                    } else if (j > 0) { // top left
                        if (i/j < 1) {
                            this.buckets[i][j].add(this.buckets[i-1][j-1]);
                            this.buckets[i][j].add(this.buckets[i-1][j]);
                        } else {
                            this.buckets[i][j].add(this.buckets[i][j-1]);
                            this.buckets[i][j].add(this.buckets[i-1][j-1]);
                        }
                        
                    }
                }
                
                
            }
        }
        this.buckets[xd/2+1][xd/2+1].children.push(this.buckets[xd/2+2][xd/2+1]);
        
        //compute heruristic
        function heruristic(node) {
            if (node.value != undefined) {
                return node.value;
            }
            let sum = 0;
            for(let i = 0; i < node.children.length; i++) {
                sum += heruristic(node.children[i]);
            }
            node.heruristic = sum/node.children.length;
            return node.heruristic;
        }
        
        heruristic(this.start);
    }
    draw(ctx, x, y) {
        ctx.fillStyle = 'hsl(60,5%,95%)';
        let off = 5;
        ctx.fillRect(x+off,y+off,500-off,500-off);
        for(let i = 0; i < this.buckets.length; i++) {
            for(let j = 0; j < this.buckets[i].length; j++) {
                this.buckets[i][j].draw(ctx, x, y);
            }
        }
    }
}
function* comp_minimax(node, ctx, x, y) {
    if (node.minimax == true) {
        return;
    }
    node.minimax = true;
    node.mark(ctx, x, y);
    yield;
    for(let i = 0; i < node.children.length; i++) {
        yield *comp_minimax(node.children[i], ctx, x, y);
    }
}
function* comp_alphabeta(node, ctx, x, y, turn = true, alpha = Number.MIN_VALUE, beta = Number.MAX_VALUE) {
     if (node.ab == true) {
        return undefined;
    }
    node.ab = true;
    node.mark(ctx, x, y);
    yield;
    if (node.value != undefined) {
        return node.value;
    }

    let value = undefined;

    for(let i = 0; i < node.children.length; i++) {
        if (alpha >= beta) {
            break;
        }
        
        let result = yield *comp_alphabeta(node.children[i], ctx, x, y, !turn, alpha, beta);

        if (result != undefined &&
            (value == undefined ||
            (turn == true ? result >= value : result <= value))) {
            value = result;
            if (turn == true) {
                alpha = Math.max(value, alpha);
            } else {
                beta  = Math.min(value, beta);
            }
        }
    }
    return value; 
}
function* comp_alphabetar(node, ctx, x, y, turn = true, alpha = Number.MIN_VALUE, beta = Number.MAX_VALUE) {
    if (node.abr == true) {
        return undefined;
    }
    node.abr = true;
    node.mark(ctx, x, y);
    yield;
    if (node.value != undefined) {
        return node.value;
    }

    let value = undefined;

    for(let i = node.children.length-1; i >= 0; i--) {
        if (alpha >= beta) {
            break;
        }
        
        let result = yield *comp_alphabetar(node.children[i], ctx, x, y, !turn, alpha, beta);

        if (result != undefined &&
            (value == undefined ||
            (turn == true ? result >= value : result <= value))) {
            value = result;
            if (turn == true) {
                alpha = Math.max(value, alpha);
            } else {
                beta  = Math.min(value, beta);
            }
        }
    }
    return value;
}
function* comp_alphabetai(graph, ctx, x, y) {
    function* helper(depth, node = graph.start, turn = true, alpha = Number.MIN_VALUE, beta = Number.MAX_VALUE) {
        //don't allow loops
        if (node.abi == true) {
            //debugger;
            return undefined;
        }
        node.abi = true;
        //mark the node we've visited
        node.mark(ctx, x, y);
        yield;
        //if the node is a leaf, we return the value
        if (node.value != undefined) {
            return node.value;
        }
        //we have reached the end, we give up
        if (depth == 0) {
            return node.heruristic;
        }

        let value = undefined;

        //check if a best move has already been found
		if (node.best != undefined) {
            //debugger;
            let result = yield *helper(depth-1, node.children[node.best], !turn, alpha, beta);
            if (result != undefined) {
                value = result;
                if (turn == true) {
                    alpha = Math.max(value, alpha);
                } else {
                    beta  = Math.min(value, beta);
                }
            }
        }
        
        for(let i = 0; i < node.children.length; i++) {
            if (alpha >= beta) {
				break;
			}
			if (i == node.best) {
				continue;
            }
            
            let result = yield *helper(depth-1, node.children[i], !turn, alpha, beta);

            if (result != undefined &&
                (value == undefined ||
                (turn == true ? result >= value : result <= value))) {
                //debugger;
                value = result;
                node.best = i;
                if (turn == true) {
                    alpha = Math.max(value, alpha);
                } else {
                    beta  = Math.min(value, beta);
                }
            }
        }
		return value; 
    }
    function clearVisited(depth, node = graph.start) {
        node.abi = false;
        if (depth == 0) {
            return;
        }
        for(let i = 0; i < node.children.length; i++) {
            clearVisited(depth-1, node.children[i]);
        }
    }
	for(let i = 1; i < graph.buckets.length/2+1; i++) {
        graph.draw(ctx, x, y);
        yield *helper(i);
        clearVisited(i);
    }
    //yield *helper(graph.buckets.length/2+1);
}
function comparison() {
    let canvas = document.getElementById("comparisonCanvas");
    let canvasWidth = 1030;
    let canvasHeight = 1030;
    canvas.setAttribute("height", canvasHeight + "px");
    canvas.setAttribute("width",  canvasWidth+"px");
    canvas.setAttribute("style", "width: 80%; height: 45vw; margin: auto; display:block; cursor:pointer;");
    let ctx = canvas.getContext("2d");

    let int;
    function setup() {
        clearInterval(int);
        
        ctx.fillStyle = 'hsl(0,0%,35%)';
        ctx.fillRect(0,0,1030,1030)
        
        let graph = new Graph(500, 800);
        graph.draw(ctx, 9, 9);
        graph.draw(ctx, 9, 517);
        graph.draw(ctx, 517, 517);
        graph.draw(ctx, 517, 9);
        
        let mini = comp_minimax(graph.start, ctx, 9, 9);
        let ab   = comp_alphabeta(graph.start, ctx, 9, 517);
        let abr  = comp_alphabetar(graph.start, ctx, 517, 517);
        let abi  = comp_alphabetai(graph, ctx, 517, 9);

        int = setInterval(()=>{
            mini.next();
            ab.next();
            abr.next();
            abi.next();
            ctx.font = "3.1em Arial";
            ctx.textAlign = "left";
            ctx.fillStyle = "hsl(0,0%,20%)";
            ctx.strokeStyle = "hsl(0,0%,20%)";
            ctx.lineWidth = 1;
            ctx.fillText("Minimax", 20,500);
            ctx.strokeText("Minimax", 20,500);
            ctx.fillText("Iterative Deepening", 530,500);
            ctx.strokeText("Iterative Deepening", 530,500);
            ctx.fillText("Alpha-Beta", 20,1005);
            ctx.strokeText("Alpha-Beta", 20,1005);
            ctx.fillText("Alpha-Beta Reversed", 530,1005);
            ctx.strokeText("Alpha-Beta Reversed", 530,1005);
        }, 10);
    }
    canvas.onclick = setup;
    let running = false;
    function calc_pos() {
        if ( running == false &&
            window.scrollY > canvas.offsetTop - window.innerHeight &&
            window.scrollY < canvas.offsetTop + canvas.clientHeight
        ) {
            running = true;
            setup();
        } else if (running == true &&
            (window.scrollY < canvas.offsetTop - window.innerHeight ||
            window.scrollY > canvas.offsetTop + canvas.clientHeight)) {
            running = false;
            clearInterval(int);
        }

    }
    document.addEventListener('parallax1event',  calc_pos, false);
}