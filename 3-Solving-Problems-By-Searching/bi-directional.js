//Function to clone a object
function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

class Node {
  constructor(id, x, y, adjacent) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.adjacent = (adjacent != undefined) ? adjacent : [];
  }
}
//Generates a random planar graph
function randomPlanarGraph(height, width, totalNodes) {
  let nodes = [],
    edges = [];
  let grid = gitteredGrid(height, width, totalNodes);
  let rowSize = grid.length;
  let columnSize = grid[0].length;
  //Extract the nodes from the grid
  for (let i = 0; i < rowSize; i++) {
    for (let j = 0; j < columnSize; j++) {
      nodes.push(new Node(i * columnSize + j, grid[i][j][0], grid[i][j][1]));
    }
  }
  //Randomly generate edges between nodes.
  let minDistance = 1.6 * Math.sqrt(height * width / totalNodes)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (euclideanDistance([nodes[i].x, nodes[i].y], [nodes[j].x, nodes[j].y]) < minDistance) {
        nodes[i].adjacent.push(j);
        nodes[j].adjacent.push(i);
        edges.push([i, j]);
      }
    }
  }
  return [nodes, edges];
}

class Graph {
  constructor(height, width, totalNodes) {
    this.totalNodes = 20;
    this.nodes = [];
    this.height = height;
    this.width = width;
    this.totalNodes = totalNodes;
    [this.nodes, this.edges] = randomPlanarGraph(this.height, this.width, this.totalNodes);
  }

  getAdjacent(id) {
    return this.nodes[id].adjacent;
  }
}

class BreadthFirstSearch {
  constructor(graph, initial) {
      this.graph = graph;
      this.initial = initial;
      this.frontier = [this.initial];
      //State is true if the node is unexplored and false if explored or in frontier
      this.state = new Array(this.graph.nodes.length).fill(true);
      this.frontierIndex = 0;
    }
    //Expands a node from the frontier and returns that node
  step() {
    if (this.frontier.length <= this.frontierIndex) {
      return undefined;
    } else {
      let nextNode = this.frontier[this.frontierIndex];
      //Remove nextNode from frontier
      this.frontierIndex++;
      //Add to explored
      this.state[nextNode] = false;
      //Get adjacent nodes which are unexplored
      let adjacentNodes = this.graph.getAdjacent(nextNode).filter(x => this.state[x]);
      //Mark each adjacent node
      adjacentNodes.forEach(x => this.state[x] = false);
      //Push to frontier
      adjacentNodes.forEach(x => this.frontier.push(x));
      return nextNode;
    }
  }
}

class BidirectionalProblem {
  constructor(graph) {
    this.graph = graph;
    this.initial = 0;
    //Force the initial node to be around the middle of the canvas.
    for (let i = 0; i < this.graph.nodes.length; i++) {
      if (euclideanDistance([this.graph.width / 2, this.graph.height / 2], [this.graph.nodes[i].x, this.graph.nodes[i].y]) < 50) {
        this.initial = i;
        break;
      }
    }
    //Final node is chosen randomly
    this.final = Math.floor(Math.random() * this.graph.nodes.length);
    this.sourceBFS = new BreadthFirstSearch(this.graph, this.initial);
    this.destBFS = new BreadthFirstSearch(this.graph, this.final);
  }

  iterate() {
    let obj = {
        done: false
      }
      //Iterate Source side BFS
    let nextNode = this.sourceBFS.step();
    obj.source = nextNode;
    if (!this.destBFS.state[nextNode]) {
      obj.done = true;
    }

    //Iterate Destination side BFS
    nextNode = this.destBFS.step();
    obj.dest = nextNode;
    if (!this.sourceBFS.state[nextNode]) {
      obj.done = true;
    }
    return obj;
  }
}
