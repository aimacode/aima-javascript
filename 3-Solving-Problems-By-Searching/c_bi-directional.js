class BidirectionalDiagram {
  constructor(selector, h, w) {
    this.selector = selector;
    this.h = h;
    this.w = w;
    this.selector.select('canvas').remove();
    this.root = this.selector
      .append('canvas')
      .attr('height', this.h)
      .attr('width', this.w)
      .style('width','100%');
    this.context = this.root.node().getContext("2d");
    this.context.clearRect(0, 0, this.w, this.h);
    this.delay = 4;
  }

  init(problem, textElement) {
    this.problem = problem;
    this.nodes = this.problem.graph.nodes;
    this.edges = this.problem.graph.edges;
    this.initial = this.problem.initial;
    this.final = this.problem.final;
    this.textElement = textElement;

    this.initialColor = 'hsl(0, 2%, 76%)';
    this.edgeColor = 'hsl(0, 2%, 80%)';
    this.sourceBFSColor = 'hsl(200,50%,70%)';
    this.destBFSColor = 'hsl(209, 30%, 50%)';
    this.sourceColor = 'hsl(209, 100%, 20%)';
    this.destColor = 'hsl(209, 100%, 20%)';
    this.nodeSize = 3.5;
    this.textColorScale = d3.scaleLinear().domain([0, this.nodes.length / 2])
      .interpolate(d3.interpolateRgb)
      .range([d3.hsl('hsla(102, 100%, 50%, 1)'), d3.hsl('hsla(0, 100%, 50%, 1)')]);

    //Draw all nodes
    for (let i = 0; i < this.nodes.length; i++) {
      this.colorNode(i, this.initialColor);
    }
    //Draw all edges
    for (let i = 0; i < this.edges.length; i++) {
      let d = this.edges[i];
      this.context.beginPath();
      this.context.lineWidth = 1;
      this.context.strokeStyle = this.edgeColor;
      this.context.moveTo(this.nodes[d[0]].x, this.nodes[d[0]].y);
      this.context.lineTo(this.nodes[d[1]].x, this.nodes[d[1]].y);
      this.context.stroke();
      this.context.closePath();
    }

    //Initial Node
    this.context.fillStyle = this.sourceColor;
    this.context.beginPath();
    this.context.arc(this.nodes[this.initial].x, this.nodes[this.initial].y, 1.2 * this.nodeSize, 0, 2 * Math.PI, true);
    this.context.fill();
    this.context.closePath();
    this.steps++;
    this.textElement.text(this.steps);
    //Final Node
    this.context.fillStyle = this.destColor;
    this.context.beginPath();
    this.context.arc(this.nodes[this.final].x, this.nodes[this.final].y, 1.2 * this.nodeSize, 0, 2 * Math.PI, true);
    this.context.fill();
    this.context.closePath();
    this.steps++;
    this.textElement.text(this.steps);
    this.textElement.style('color', this.textColorScale(this.steps));
    this.steps = 0;
    this.bfs();
  }

  colorNode(node, color) {
    //If the given node is not an initial node or final node
    if (node != this.initial && node != this.final) {
      this.context.fillStyle = color;
      this.context.beginPath();
      this.context.arc(this.nodes[node].x, this.nodes[node].y, this.nodeSize, 0, 2 * Math.PI, true);
      this.context.fill();
      this.context.closePath();
      this.steps++;
      //Update steps in the page
      this.textElement.style('color', this.textColorScale(this.steps));
      this.textElement.text(`${this.steps} nodes`);
    }
  }

  bfs() {
    this.intervalFunction = setInterval(() => {
      let next = this.problem.iterate();

      if (next.source) {
        this.colorNode(next.source, this.sourceBFSColor)
      }
      if (next.dest) {
        this.colorNode(next.dest, this.destBFSColor)
      }
      if (next.done) {
        clearInterval(this.intervalFunction)
      }
    }, this.delay);
  }

  destroy() {
    clearInterval(this.intervalFunction);
  }
}

class BFSDiagram extends BidirectionalDiagram {
  constructor(selector, h, w) {
    super(selector, h, w);
  }

  bfs() {
    this.bfsAgent = new BreadthFirstSearch(this.problem.graph, this.initial);
    this.intervalFunction = setInterval(() => {
      let node = this.bfsAgent.step();
      this.colorNode(node, this.sourceBFSColor);
      if (node == this.final) {
        clearInterval(this.intervalFunction)
      }
    }, this.delay);
  }
}

$(document).ready(function() {
  let bidirectionalDiagram = new BidirectionalDiagram(d3.select('#bi-directional').select('#biCanvas'), 500, 550);
  let bfsDiagram = new BFSDiagram(d3.select('#bi-directional').select('#bfsCanvas'), 500, 550)

  function init() {
    bidirectionalDiagram = new BidirectionalDiagram(d3.select('#bi-directional').select('#biCanvas'), 500, 550);
    bfsDiagram = new BFSDiagram(d3.select('#bi-directional').select('#bfsCanvas'), 500, 550)
    let graph = new Graph(500, 530, 1500);
    let problem = new BidirectionalProblem(graph);
    bidirectionalDiagram.init(problem, d3.select('#bi-directional').select('#biStepCount'));
    bfsDiagram.init(problem, d3.select('#bi-directional').select('#bfsStepCount'));
  }

  function restart() {
    bidirectionalDiagram.destroy();
    bfsDiagram.destroy();
    init();
  }

  init();
  $('#bi-directional .restart-button').click(restart);
});
