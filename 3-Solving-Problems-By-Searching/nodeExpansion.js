function nodeExpansionAgent(adjMatrix, initial) {
  this.adjMatrix = adjMatrix;

  this.UNEXPLORED = 0;
  this.EXPANDABLE = 1;
  this.EXPLORED = 2;

  this.frontier = [initial];

  this.nodes = new Array(adjMatrix.length);
  for (var i = 0; i < this.nodes.length; i++) {
    this.nodes[i] = {
      state: this.UNEXPLORED,
      cost: Number.POSITIVE_INFINITY,
      parent: null
    };
  }
  this.nodes[initial] = {
    state: this.EXPANDABLE,
    cost: 0
  };
  this.getState = function(node) {
    return this.nodes[node].state;
  };
  this.getExpanded = function() {
    var expanded = [];
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].state == this.EXPLORED) {
        expanded.push(i);
      }
    }
    return expanded;
  }
  this.getNeighbors = function(node) {
    var neighbors = []
    for (var i = 0; i < this.adjMatrix[node].length; i++) {
      if (this.adjMatrix[node][i] > 0) {
        neighbors.push(i);
      }
    }
    return neighbors;
  };

  this.expand = function(node) {
    this.nodes[node].state = this.EXPLORED;
    //Remove node from the frontier
    this.frontier = this.frontier.filter(function(e) {
      return e != node
    });
    for (var i = 0; i < this.adjMatrix[node].length; i++) {
      if (this.adjMatrix[node][i] > 0) {
        neighbor = i;
        if (this.nodes[neighbor].state == this.UNEXPLORED) {
          this.nodes[neighbor].state = this.EXPANDABLE;
          this.nodes[neighbor].cost = this.nodes[node].cost + this.adjMatrix[node][neighbor];
          this.nodes[neighbor].parent = node;
          this.frontier.push(neighbor);
        }
      }
    }
  };

  this.getCosts = function() {
    var costs = [];
    for (var i = 0; i < this.frontier.length; i++) {
      costs.push(this.nodes[this.frontier[i]].cost)
    }
    return costs;
  };

  this.getExpandables = function() {
    return this.frontier;
  }
};
