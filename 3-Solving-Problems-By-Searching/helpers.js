var GraphNode = function(x, y, id, text) {
  this.x = x;
  this.y = y;
  this.id = id;
  this.text = text;
  this.state = 'unexplored';
  this.cost = Number.POSITIVE_INFINITY;
  this.parent = null;
};

function getEdgeCostLocation(x1, y1, x2, y2) {
  var midx = (x1 + x2) / 2;
  var midy = (y1 + y2) / 2;
  var angle = Math.atan((x1 - x2) / (y2 - y1));
  var coords = {
    x: midx + 8 * Math.cos(angle),
    y: midy + 8 * Math.sin(angle)
  }
  return coords;
};

var DefaultOptions = function() {
  this.nodes = {
    explored: {
      fill: 'hsl(0,50%,75%)',
      stroke: 'black',
      opacity: 1,
      clickHandler: null,
      onMouseEnter: null,
      onMouseLeave: null
    },
    unexplored: {
      fill: 'hsl(0, 2%, 76%)',
      stroke: 'black',
      opacity: 1,
      clickHandler: null,
      onMouseEnter: null,
      onMouseLeave: null
    },
    frontier: {
      fill: 'hsl(200,50%,70%)',
      stroke: 'black',
      opacity: 1,
      clickHandler: null,
      onMouseEnter: null,
      onMouseLeave: null
    },
    next: {
      fill: 'hsl(200,50%,70%)',
      stroke: 'black',
      opacity: 1,
      clickHandler: null,
      onMouseEnter: null,
      onMouseLeave: null
    },
    nodeRadius: 16,
  };
  this.edges = {
    lineWidth: 2,
    showCost: false,
    visited: {
      lineWidth: 10,
      opacity: 1
    },
    unvisited: {
      lineWidth: 10,
      opacity: 1
    }
  }
}
var DefaultGraph = function() {
  this.nodes = {
    'A': new GraphNode(50, 100, 'A', 'A'),
    'B': new GraphNode(20, 150, 'B', 'B'),
    'C': new GraphNode(75, 180, 'C', 'C'),
    'D': new GraphNode(100, 100, 'D', 'D'),
    'E': new GraphNode(230, 100, 'E', 'E'),
    'F': new GraphNode(180, 160, 'F', 'F'),
    'G': new GraphNode(70, 300, 'G', 'G'),
    'H': new GraphNode(120, 240, 'H', 'H'),
    'I': new GraphNode(300, 150, 'I', 'I'),
    'J': new GraphNode(280, 250, 'J', 'J'),
    'K': new GraphNode(400, 220, 'K', 'K'),
    'L': new GraphNode(200, 280, 'L', 'L'),
    'M': new GraphNode(380, 100, 'M', 'M'),
    'N': new GraphNode(350, 300, 'N', 'N'),
    'O': new GraphNode(450, 320, 'O', 'O')
  };
  this.edges = [
    ['A', 'B', 3],
    ['A', 'D', 6],
    ['B', 'C', 1],
    ['C', 'D', 1],
    ['C', 'G', 5],
    ['C', 'H', 2],
    ['D', 'E', 3],
    ['D', 'F', 1],
    ['E', 'I', 5],
    ['F', 'J', 2],
    ['H', 'L', 8],
    ['I', 'J', 1],
    ['I', 'K', 1],
    ['I', 'M', 3],
    ['J', 'L', 5],
    ['J', 'N', 2],
    ['K', 'N', 2],
    ['L', 'N', 6],
    ['N', 'O', 2]
  ];
};

var GraphProblem = function(nodes, edges, initialKey, nextToExpand) {
  this.nodes = nodes;
  this.edges = edges;
  this.nodes[initialKey].state = 'frontier';
  this.nodes[initialKey].cost = 0;
  this.nodes[initialKey].parent = null;
  this.initialKey = initialKey;
  this.frontier = [initialKey];
  this.explored = [];
  this.nextToExpand = nextToExpand;

  this.getAdjacent = function(nodeKey) {
    var edges = this.edges.filter((edge) => edge[0] == nodeKey || edge[1] == nodeKey);
    var adjacent = [];
    for (var i = 0; i < edges.length; i++) {
      if (edges[i][0] == nodeKey) {
        adjacent.push({
          nodeKey: edges[i][1],
          cost: edges[i][2]
        });
      } else {
        adjacent.push({
          nodeKey: edges[i][0],
          cost: edges[i][2]
        });
      }
    }
    return adjacent;
  };

  this.ifEdgeVisited = function(edge) {
    return this.nodes[edge[0]].state == 'explored' || this.nodes[edge[1]].state == 'explored';
  }

  this.removeFromFrontier = function(nodeKey) {
    this.frontier = this.frontier.filter(function(e) {
      return e != nodeKey;
    });
  };
  this.addToFrontier = function(nodeKey) {
    this.frontier.push(nodeKey);
    this.nodes[nodeKey].state = 'frontier';
  };
  this.addToExplored = function(nodeKey) {
    this.explored.push(nodeKey);
    this.nodes[nodeKey].state = 'explored';
  };
};

var GraphAgent = function(problem) {
  this.problem = problem;

  this.expand = function(nodeKey) {
    this.problem.removeFromFrontier(nodeKey);
    this.problem.addToExplored(nodeKey);

    let adjacent = this.problem.getAdjacent(nodeKey);
    for (var i = 0; i < adjacent.length; i++) {
      let nextNodeKey = adjacent[i].nodeKey;
      let nextNode = this.problem.nodes[nextNodeKey];
      if (nextNode.state == 'unexplored') {
        this.problem.addToFrontier(nextNodeKey);
        nextNode.cost = adjacent[i].cost + this.problem.nodes[nodeKey].cost;
        nextNode.parent = nodeKey;
      }
      if (nextNode.state == 'frontier' && nextNode.cost > adjacent[i].cost + this.problem.nodes[nodeKey].cost) {
        nextNode.cost = adjacent[i].cost + this.problem.nodes[nodeKey].cost;
        nextNode.parent = nodeKey;
      }
    }
  };

}

var GraphDrawAgent = function(graphProblem, selector, options, h, w) {
  this.canvas = document.getElementById(selector);
  this.canvas.innerHTML = '';
  this.h = h;
  this.w = w;
  this.two = new Two({
    height: h,
    width: w
  }).appendTo(this.canvas);
  this.problem = graphProblem;

  this.options = options;
  this.nodeGroups = [];
  this.edges = [];

  this.reset = function() {
    this.two.clear();
    this.nodeGroups = [];
    this.edges = [];
    this.drawEdges();
    this.drawNodes();
  };

  this.drawEdges = function() {
    let edgeOptions = this.options.edges;
    let edges = this.problem.edges;;
    for (var i = 0; i < edges.length; i++) {
      let edge = edges[i];
      let node1 = this.problem.nodes[edge[0]];
      let node2 = this.problem.nodes[edge[1]];
      let cost = edge[2];
      var line = this.two.makeLine(node1.x, node1.y, node2.x, node2.y);

      line.linewidth = 1;
      line.stroke = 'black';
      if (!this.problem.ifEdgeVisited(edge)) {
        line.lineWidth = edgeOptions.unvisited.lineWidth;
        line.opacity = edgeOptions.unvisited.opacity;
      } else {
        line.lineWidth = edgeOptions.visited.lineWidth;
        line.opacity = edgeOptions.visited.opacity;
      }
      if (edgeOptions.showCost) {
        let coords = getEdgeCostLocation(node1.x, node1.y, node2.x, node2.y);
        this.two.makeText(cost, coords.x, coords.y);
      }
      this.two.update();
      $(line._renderer.elem).attr('node1', node1.id);
      $(line._renderer.elem).attr('node2', node2.id);
      this.edges.push(line);
    }
    this.two.update();
  };
  this.drawNodes = function() {
    let nodeOptions = this.options.nodes;
    let nodeDict = this.problem.nodes;
    for (key in nodeDict) {
      let currentNode = nodeDict[key];
      let state = currentNode.state;
      if (this.problem.nextToExpand == key) {
        state = 'next';
      }
      let currentOptions = nodeOptions[state];
      var circle = this.two.makeCircle(currentNode.x, currentNode.y, nodeOptions.nodeRadius);
      circle.fill = currentOptions.fill;
      circle.stroke = currentOptions.stroke;

      var text = this.two.makeText(currentNode.text, currentNode.x, currentNode.y);
      var group = this.two.makeGroup(circle, text);

      group.opacity = currentOptions.opacity;
      group.linewidth = 1;
      this.two.update();
      $(group._renderer.elem).attr('nodeKey', currentNode.id);
      if (currentOptions.clickHandler != null) {
        $(group._renderer.elem).css('cursor', 'pointer');
        group._renderer.elem.onclick = currentOptions.clickHandler;
      }
      group._renderer.elem.onmouseenter = currentOptions.onMouseEnter;
      group._renderer.elem.onmouseleave = currentOptions.onMouseLeave;
      this.nodeGroups.push(group);
    }
    this.two.update();
  };

  this.iterateNodes = function() {
    let nodeOptions = this.options.nodes;
    for (var i = 0; i < this.nodeGroups.length; i++) {
      let group = this.nodeGroups[i];
      let circle = group._collection[0];
      let nodeKey = $(group._renderer.elem).attr('nodeKey');
      let currentNode = this.problem.nodes[nodeKey];
      let state = currentNode.state;
      if (this.problem.nextToExpand == nodeKey) {
        state = 'next';
      }
      let currentOptions = nodeOptions[state];

      circle.fill = currentOptions.fill;
      circle.stroke = currentOptions.stroke;

      this.two.update();
      if (currentOptions.clickHandler != null) {
        $(group._renderer.elem).css('cursor', 'pointer');
        group._renderer.elem.onclick = currentOptions.clickHandler;
      } else {
        $(group._renderer.elem).css('cursor', 'auto');
        group._renderer.elem.onclick = null;
      }
      group._renderer.elem.onmouseenter = currentOptions.onMouseEnter;
      group._renderer.elem.onmouseleave = currentOptions.onMouseLeave;
      group.opacity = currentOptions.opacity;
      group.linewidth = 1;
    }
    this.two.update();
  };

  this.iterateEdges = function() {
    let edgeOptions = this.options.edges;
    let edges = this.edges;
    for (edgeKey in edges) {
      let edge = edges[edgeKey];
      let node1 = $(edge._renderer.elem).attr('node1');
      let node2 = $(edge._renderer.elem).attr('node2');
      if (typeof edgeOptions.unvisited != 'undefined' && !this.problem.ifEdgeVisited([node1, node2])) {
        edge.lineWidth = edgeOptions.unvisited.lineWidth;
        edge.opacity = edgeOptions.unvisited.opacity;
      } else {
        edge.linewidth = edgeOptions.lineWidth;
        edge.opacity = edgeOptions.unvisited.opactiy;
      }
      edge.linewidth = 1;
      edge.stroke = 'black';
    }
    this.two.update();
  };
  this.iterate = function() {
    this.iterateEdges();
    this.iterateNodes();
  }
  this.reset();
};






// Class for drawing frontier nodes for first visualization
function QueueDrawAgent(selector, h, w, problem, options) {
  this.canvas = document.getElementById(selector);
  this.canvas.innerHTML = '';
  this.two = new Two({
    height: h,
    width: w
  }).appendTo(this.canvas);
  this.problem = problem;
  this.nodeRadius = 25;
  this.options = options;

  this.iterate = function() {
    this.two.clear();
    var frontier = this.problem.frontier;
    for (var i = 0; i < frontier.length; i++) {
      node = this.problem.nodes[frontier[i]];
      var x = (i) * 30 + 40;
      var y = 20;
      var rect = this.two.makeRectangle(x, y, this.nodeRadius, this.nodeRadius);
      rect.fill = options.nodes.frontier.fill;
      if (frontier[i] == this.problem.nextToExpand) {
        rect.fill = options.nodes.next.fill;
      }
      var text = this.two.makeText(node.text, x, y);
      if (this.options.showCost) {
        t = this.two.makeText(node.cost, x, y + 30);
      }
    }
    this.two.update();
  }
  this.iterate();
};
