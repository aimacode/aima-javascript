// Structure of all nodes of a graph
var GraphNode = function(x, y, id, text) {
  this.x = x;
  this.y = y;
  this.id = id;
  this.text = text;
  this.state = 'unexplored';
  this.cost = Number.POSITIVE_INFINITY;
  this.estimatedCost = Number.POSITIVE_INFINITY; // It requires for the aStarSearch
  this.totalCost = Number.POSITIVE_INFINITY; // It requires for the aStarSearch
  this.parent = null;
  this.depth = Number.POSITIVE_INFINITY;
};
// A function that takes as input the coordinates of an edges
// and gives out the coordinates of the location where its cost should be mentioned
// Uses a little trigonometry :)
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
// Default Options that can be used to pass in a graph Draw Agent
var DefaultOptions = function() {
    this.nodes = {
      explored: {
        fill: 'hsl(200,50%,70%)',
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
        fill: 'hsl(0,50%,75%)',
        stroke: 'black',
        opacity: 1,
        clickHandler: null,
        onMouseEnter: null,
        onMouseLeave: null
      },
      highlighted: {
        fill: 'Crimson',
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
  // The default graph that is used in most of the simulation
  // This ensures consistency in the experience of the user
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


// Structure for the graph problem for the simulations
function GraphProblem(nodes, edges, initialKey, nextToExpand) {
  this.nodes = nodes;
  this.edges = edges;
  this.nodes[initialKey].state = 'frontier';
  this.nodes[initialKey].cost = 0;
  this.nodes[initialKey].parent = null;
  this.nodes[initialKey].depth = 0;
  this.initialKey = initialKey;
  this.frontier = [initialKey];
  this.explored = [];
  //Used for BFS,DFS,UCS etc where it is important to show the next node which
  //will be expanded from the graph before actually expanding it.
  this.nextToExpand = nextToExpand;
}
//Takes a node and returns a list of its adjacent nodes
GraphProblem.prototype.getAdjacent = function(nodeKey) {
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
}
//Check if an edge is already visited
GraphProblem.prototype.ifEdgeVisited = function(edge) {
  return this.nodes[edge[0]].state == 'explored' || this.nodes[edge[1]].state == 'explored';
}
GraphProblem.prototype.removeFromFrontier = function(nodeKey) {
  this.frontier = this.frontier.filter(function(e) {
    return e != nodeKey;
  });
}
GraphProblem.prototype.addToFrontier = function(nodeKey) {
  this.frontier.push(nodeKey);
  this.nodes[nodeKey].state = 'frontier';
}
GraphProblem.prototype.addToExplored = function(nodeKey) {
  this.explored.push(nodeKey);
  this.nodes[nodeKey].state = 'explored';
}
GraphProblem.prototype.reset = function() {
  //Reset nodes
  for (i in this.nodes) {
    this.nodes[i].state = 'unexplored';
    this.nodes[i].cost = Number.POSITIVE_INFINITY;
    this.nodes[i].parent = null;
    this.nodes[i].depth = Number.POSITIVE_INFINITY;
  }

  //Initialize first node
  this.nodes[this.initialKey].state = 'frontier';
  this.nodes[this.initialKey].cost = 0;
  this.nodes[this.initialKey].parent = null;
  this.nodes[this.initialKey].depth = 0;

  this.frontier = [this.initialKey];
  this.explored = [];
}

//An agent that can work on the graph by expanding nodes

function GraphAgent (problem, algo) {
  this.problem = problem;
  this.algo = algo;
}
GraphAgent.prototype.expand = function (nodeKey) {
  this.problem.removeFromFrontier(nodeKey);
  this.problem.addToExplored(nodeKey);
  let adjacent = this.problem.getAdjacent(nodeKey);
  for (var i = 0; i < adjacent.length; i++) {
    //For every adjacent node
    let nextNodeKey = adjacent[i].nodeKey;
    let nextNode = this.problem.nodes[nextNodeKey];
    if (nextNode.state == 'unexplored') {
      //If the adjacent node is unexplored,
      this.problem.addToFrontier(nextNodeKey);
      //Add it to frontier and update its properties
      nextNode.cost = adjacent[i].cost + this.problem.nodes[nodeKey].cost;
      nextNode.parent = nodeKey;
      nextNode.depth = this.problem.nodes[nodeKey].depth + 1;
    }
    //In UCS, Some extra logic is involved
    if (this.algo == 'ucs') {
      //If the node which is in frontier has cost lower than the new cost,
      if (nextNode.state == 'frontier' && nextNode.cost > adjacent[i].cost + this.problem.nodes[nodeKey].cost) {
        //Assign the lower cost
        nextNode.cost = adjacent[i].cost + this.problem.nodes[nodeKey].cost;
        nextNode.parent = nodeKey;
      }
    }
  }
}

  // An agent which draws the graphs to the page
var GraphDrawAgent = function(graphProblem, selector, options, h, w) {
  this.canvas = document.getElementById(selector);
  this.canvas.innerHTML = '';
  this.h = h;
  this.w = w;
  this.two = new Two({
    width: '100%',
    height: '100%'
  }).appendTo(this.canvas);
  this.problem = graphProblem;
  this.two.renderer.domElement.setAttribute("viewBox","0 0 " + String(w) + " " + String(h));

  this.options = options;
  this.nodeGroups = {};
  this.edges = [];

  this.reset = function() {
    this.two.clear();
    this.nodeGroups = [];
    this.edges = [];
    this.drawEdges();
    this.drawNodes();
  };
  //Draws the edges
  this.drawEdges = function() {
    let edgeOptions = this.options.edges;
    let edges = this.problem.edges;
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
      //If cost needs to be shown, draw it
      if (edgeOptions.showCost) {
        let coords = getEdgeCostLocation(node1.x, node1.y, node2.x, node2.y);
        this.two.makeText(cost, coords.x, coords.y);
      }
      //two needs to be updated so that it is drawn on the page.
      //Only after it is drawn, we can use the jquery functions on it.
      this.two.update();
      $(line._renderer.elem).attr('node1', node1.id);
      $(line._renderer.elem).attr('node2', node2.id);
      this.edges.push(line);
    }
    this.two.update();
  };
  //Draws the nodes
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
      this.nodeGroups[key] = group;
    }
    this.two.update();
  };
  //Updates the nodes
  this.iterateNodes = function() {
    let nodeOptions = this.options.nodes;
    for (let nodeKey in this.nodeGroups) {
      let group = this.nodeGroups[nodeKey];
      let circle = group._collection[0];
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
      //Special case for cost detail diagram right now, but can be assigned
      //other functions to improve other diagrams too
      group._renderer.elem.onmouseenter = currentOptions.onMouseEnter;
      group._renderer.elem.onmouseleave = currentOptions.onMouseLeave;
      group.opacity = currentOptions.opacity;
      group.linewidth = 1;
    }
    this.two.update();
  };
  //Update the edges
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
  this.highlight = function(nodeKey) {
    this.nodeGroups[nodeKey]._collection[0].fill = options.nodes.highlighted.fill;
    this.two.update();
  }
  this.unhighlight = function(nodeKey) {
    switch(this.problem.nodes[nodeKey].state) {
      case "next": this.nodeGroups[nodeKey]._collection[0].fill = options.nodes.next.fill; break;
      case "explored": this.nodeGroups[nodeKey]._collection[0].fill = options.nodes.explored.fill; break;
      case "unexplored": this.nodeGroups[nodeKey]._collection[0].fill = options.nodes.unexplored.fill; break;
      case "highlighted": this.nodeGroups[nodeKey]._collection[0].fill = options.nodes.highlighted.fill; break;
      case "frontier": this.nodeGroups[nodeKey]._collection[0].fill = options.nodes.frontier.fill; break;
    }
    this.two.update();
  }
  this.reset();
};

// An agent to draw queues for bfs and dfs
function QueueDrawAgent(selector, h, w, problem, options) {
  this.canvas = document.getElementById(selector);
  this.canvas.innerHTML = '';
  this.two = new Two({
    height: h,
    width: w
  }).appendTo(this.canvas);
  this.problem = problem;
  this.nodeRadius = options.nodes.nodeRadius;
  this.options = options;

  this.highlight = function(nodeKey) {
    this.nodeDict[nodeKey]._collection[0].fill = this.options.nodes.highlighted.fill;
    this.two.update();
  }
  this.unhighlight = function(nodeKey) {
    switch(this.problem.nodes[nodeKey].state) {
      case "next": this.nodeDict[nodeKey]._collection[0].fill = options.nodes.next.fill; break;
      case "explored": this.nodeDict[nodeKey]._collection[0].fill = options.nodes.explored.fill; break;
      case "unexplored": this.nodeDict[nodeKey]._collection[0].fill = options.nodes.unexplored.fill; break;
      case "highlighted": this.nodeDict[nodeKey]._collection[0].fill = options.nodes.highlighted.fill; break;
      case "frontier": this.nodeDict[nodeKey]._collection[0].fill = options.nodes.frontier.fill; break;
    }
    this.two.update();
  }
  this.iterate = function() {
    this.two.clear();
    this.nodeDict = {};
    var frontier = this.problem.frontier;
    for (var i = 0; i < frontier.length; i++) {
      node = this.problem.nodes[frontier[i]];
      var x = (i) * (this.nodeRadius+20) + 40;
      var y = 20;
      var circle = this.two.makeCircle(x, y, this.nodeRadius);
      circle.fill = options.nodes.frontier.fill;
      if (frontier[i] == this.problem.nextToExpand) {
        circle.fill = options.nodes.next.fill;
      }
      var text = this.two.makeText(node.text, x, y);
      if (this.options.showCost) {
        t = this.two.makeText(node.cost, x, y + 30);
      }
      var group = this.two.makeGroup(circle, text);
      this.two.update();
      $(group._renderer.elem).attr('nodeKey', node.id);
      group._renderer.elem.onmouseenter = options.nodes.frontier.onMouseEnter;
      group._renderer.elem.onmouseleave = options.nodes.frontier.onMouseLeave;
      this.nodeDict[node.text] = group;
    }
    this.two.update();
  }
  this.iterate();
};

var dlsDrawAgent = function(selector) {
  this.h = 350;
  this.w = 600;
  this.limit = 2;
  this.graph = new DLSGraph();
  this.initial = 'A';
  this.selector = selector;
  this.graphProblem = new GraphProblem(this.graph.nodes, this.graph.edges, this.initial, null);
  this.graphAgent = new GraphAgent(this.graphProblem);
  this.options = new DefaultOptions();
  this.graphDrawAgent = new GraphDrawAgent(this.graphProblem, this.selector, this.options, this.h, this.w);
  //Expand nodes for the current limit
  this.iterate = function(limit) {
    this.limit = limit;
    this.graphProblem.reset();
    let previous = this.initial;
    while (this.graphProblem.frontier.length > 0 && previous != null) {
      let nextNode = depthLimitedSearch(this.graphProblem, this.limit);
      previous = nextNode;
      if (nextNode != null) {
        this.graphAgent.expand(nextNode);
      }
    }
    this.graphDrawAgent.iterate();
  }
}

// Function to calculate euclidean distance
// It is used by bi-directional and a-star algorithms
function euclideanDistance(point1, point2) {
  return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
}
