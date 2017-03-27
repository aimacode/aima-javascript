// Adds CONTAINS prototype to normal Array object and returns as Frontier
function frontier() {
  frontier = Array;
  frontier.prototype.CONTAINS = function(obj) {
    for (var i = 0; i < this.length; i++) {
      if (this[i].STATE == obj.STATE) {
        return true;
      }
    }
    return false;
  }
  return frontier();
}
// Default Graph for visualizations
function makeDefaultGraph() {
  defaultGraph = {}
  defaultGraph.nodes = [{
    x: 50,
    y: 100,
    text: "A"
  }, {
    x: 20,
    y: 150,
    text: "B"
  }, {
    x: 75,
    y: 180,
    text: "C"
  }, {
    x: 100,
    y: 100,
    text: "D"
  }, {
    x: 230,
    y: 100,
    text: "E"
  }, {
    x: 180,
    y: 160,
    text: "F"
  }, {
    x: 70,
    y: 300,
    text: "G"
  }, {
    x: 120,
    y: 240,
    text: "H"
  }, {
    x: 300,
    y: 150,
    text: "I"
  }, {
    x: 280,
    y: 250,
    text: "J"
  }, {
    x: 400,
    y: 220,
    text: "K"
  }, {
    x: 200,
    y: 280,
    text: "L"
  }, {
    x: 380,
    y: 100,
    text: "M"
  }, {
    x: 350,
    y: 300,
    text: "N"
  }, {
    x: 450,
    y: 320,
    text: "O"
  }];
  defaultGraph.adjMatrix = [
    // a, b, c, d, e, f, g, h, i, j, k, l, m, n, o
    [0, 3, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 0, 5, 2, 0, 0, 0, 0, 0, 0, 0],
    [6, 0, 1, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0],
    [0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 5, 0, 0, 0, 0, 1, 1, 0, 3, 0, 0],
    [0, 0, 0, 0, 0, 8, 0, 0, 1, 0, 0, 5, 0, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 6, 0],
    [0, 0, 0, 0, 0, 0, 0, 2, 0, 5, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 6, 0, 0, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0]
  ];
  return defaultGraph;
}

// Class for drawing frontier nodes for first visualization
function drawQueue(canvas, h, w, agent, nodes, showCost) {
  this.canvas = canvas;
  this.h = h;
  this.w = w;
  this.two = null;
  this.agent = agent;
  this.nodeRadius = 25;
  this.waitingColor = 'hsl(200,50%,70%)';
  this.expandedColor = 'hsl(0,50%,75%)';
  this.nodes = nodes;
  this.indexOfLastElement = 0;
  this.rectangles = [];
  this.showCost = (typeof showCost != 'undefined') ? showCost : false;

  this.init = function() {
    this.canvas.innerHTML = '';
    this.two = new Two({
      height: this.h,
      width: this.w
    }).appendTo(this.canvas);
    this.iterate();
  }
  this.iterate = function() {
    this.two.clear();
    this.rectangles = [];
    var frontier = this.agent.getExpandables();
    var costs;
    if (this.showCost) {
      costs = this.agent.getCosts();
    }
    if (frontier.length > 0) {
      for (var i = 0; i < frontier.length; i++) {
        node = this.nodes[frontier[i]];
        var x = (i) * 30 + 40;
        var y = 20;
        var rect = this.two.makeRectangle(x, y, this.nodeRadius, this.nodeRadius);
        rect.fill = this.waitingColor;
        this.rectangles.push(rect);
        var text = this.two.makeText(node.text, x, y);
        var group = this.two.makeGroup(rect, text);

        if (this.showCost) {
          t = this.two.makeText(costs[i], x, y + 30);
        }
        this.two.update();
      }
    }
    this.two.update();
    this.indexOfLastElement = frontier.length - 1;
  }
};

function drawFrontierNodes(canvas, h, w, agent, nodes) {
  this.canvas = canvas;
  this.h = h;
  this.w = w;
  this.two = null;
  this.agent = agent;
  this.nodeRadius = 15;
  this.frontierColor = 'hsl(200,50%,70%)';
  this.nodes = nodes;
  this.init = function() {
    this.canvas.innerHTML = '';
    this.two = new Two({
      height: this.h,
      width: this.w
    }).appendTo(this.canvas);
    this.iterate();
  }
  this.iterate = function() {
    this.two.clear();
    frontierNodes = this.agent.getExpandables();
    for (var i = 0; i < frontierNodes.length; i++) {
      node = this.nodes[frontierNodes[i]];
      var x = (i % 4) * 50 + 40;
      var y = (Math.floor(i / 4)) * 50 + 20;
      var circle = this.two.makeCircle(x, y, this.nodeRadius);
      var text = this.two.makeText(node.text, x, y);
      circle.fill = this.frontierColor;
    }
    this.two.update();
  }
}
// Class to render graph on the canvas
function getEdgeText(x1, y1, x2, y2) {
  var midx = (x1 + x2) / 2;
  var midy = (y1 + y2) / 2;
  var angle = Math.atan((x1 - x2) / (y2 - y1));
  var coords = {
    x: midx + 8 * Math.cos(angle),
    y: midy + 8 * Math.sin(angle)
  }
  return coords;
};

function drawGraph(canvas, h, w, agent, nodes, adjMatrix, showCost) {
  this.canvas = canvas;
  this.h = h;
  this.w = w;
  this.two = null;
  this.agent = agent;
  this.nodeRadius = 15;
  this.nodeGroups = [];
  this.edges = [];
  this.edgeMap = {};

  this.nodes = nodes;
  this.adjMatrix = adjMatrix;
  this.unvisitedColor = 'hsl(0, 2%, 76%)';
  this.frontierColor = 'hsl(200,50%,70%)';
  this.expandedColor = 'hsl(0,50%,75%)';
  this.defaultEdgeColor = 'black';
  this.defaultLineWidth = 2;
  this.clickHandler = null;
  this.showCost = (typeof showCost != 'undefined') ? showCost : false;
  this.drawCode = {
    0: {
      color: this.unvisitedColor,
      opacity: 1
    },
    1: {
      color: this.frontierColor,
      opacity: 1
    },
    2: {
      color: this.expandedColor,
      opacity: 1
    }
  };

  this.init = function() {
    var self = this;
    this.canvas.innerHTML = '';
    this.two = new Two({
      height: h,
      width: w
    }).appendTo(canvas);
    //Draw edges first so they appear behind nodes.
    for (var i = 0; i < this.adjMatrix.length; i++) {
      for (var j = i; j < this.adjMatrix[i].length; j++) {
        if (this.adjMatrix[i][j]) {
          var line = this.two.makeLine(this.nodes[i].x, this.nodes[i].y, this.nodes[j].x, this.nodes[j].y);
          if (this.showCost) {
            var coords = getEdgeText(this.nodes[i].x, this.nodes[i].y, this.nodes[j].x, this.nodes[j].y);
            var cost = this.two.makeText(this.adjMatrix[i][j], coords.x, coords.y);
          }
          line.linewidth = 2;
          if (this.agent.getState(i) == 0 || this.agent.getState(j) == 0) {
            line.opacity = this.drawCode[0].opacity;
          } else {
            line.opacity = 1
          }
          this.edges.push(line);
          this.edgeMap[i + '_' + j] = line;
          this.edgeMap[j + '_' + i] = line;
          this.two.update();
          $(line._renderer.elem).attr('nodesIndices', i + "_" + j)
        }
      }
    }
    //Draw Nodes

    for (var i = 0; i < this.nodes.length; i++) {
      node = this.nodes[i];
      var circle = this.two.makeCircle(node.x, node.y, this.nodeRadius);

      circle.fill = this.drawCode[this.agent.getState(i)].color;

      var text = this.two.makeText(node.text, node.x, node.y);
      var group = this.two.makeGroup(circle, text);
      if (this.agent.getState(i) == 0) {
        group.opacity = this.drawCode[0].opacity;
      } else {
        group.opacity = 1;
      }
      this.two.update();
      $(group._renderer.elem).attr('nodeIndex', i);
      if (this.agent.getState(i) == 1) {
        $(group._renderer.elem).css('cursor', 'pointer');
        group._renderer.elem.onclick = this.clickHandler;
      }
      this.nodeGroups.push(group);
    }
    this.two.update();
  };

  this.iterate = function() {
    var self = this;

    for (var i = 0; i < this.nodeGroups.length; i++) {
      f_node = this.nodeGroups[i];
      node = this.nodes[i];
      state = this.agent.getState(i);
      if (state == 0) {
        f_node.opacity = this.drawCode[0].opacity;
      } else {
        f_node.opacity = 1;
      }
      f_node._collection[0].fill = this.drawCode[state].color;
      if (state == 1) {
        $(f_node._renderer.elem).css('cursor', 'pointer');
        f_node._renderer.elem.onclick = this.clickHandler;
      } else {
        f_node._renderer.elem.onclick = null;
      }
    }
    for (var i = 0; i < this.edges.length; i++) {
      edge = this.edges[i];
      x = $(edge._renderer.elem).attr('nodesIndices').split('_')[0];
      y = $(edge._renderer.elem).attr('nodesIndices').split('_')[1];
      edge.opacity = Math.min(this.nodeGroups[x].opacity, this.nodeGroups[y].opacity);
      edge.stroke = this.defaultEdgeColor;
      edge.linewidth = this.defaultLineWidth;
    }
    this.two.update();
  };
};
