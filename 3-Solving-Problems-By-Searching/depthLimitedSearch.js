// Same as depht first search but with limit
var depthLimitedSearch = function(problem, limit) {
    // Traverse the frontier queue from behind and choose the deepest node
    // whose depth is lower than the limit
    for (var i = problem.frontier.length - 1; i >= 0; i--) {
      let nextNodeKey = problem.frontier[i];
      if (problem.nodes[nextNodeKey].depth <= limit) {
        return nextNodeKey;
      }
    }
    //If no such node found, return null to denote traversal should stop
    return null;
  }
  //New Graph for DLS to behave as a tree
var DLSGraph = function() {
  this.nodes = {
    'A': new GraphNode(20, 170, 'A', 'A'),
    'B': new GraphNode(100, 120, 'B', 'B'),
    'C': new GraphNode(100, 220, 'C', 'C'),
    'D': new GraphNode(180, 80, 'D', 'D'),
    'E': new GraphNode(180, 150, 'E', 'E'),
    'F': new GraphNode(180, 190, 'F', 'F'),
    'G': new GraphNode(180, 270, 'G', 'G'),
    'H': new GraphNode(260, 40, 'H', 'H'),
    'I': new GraphNode(260, 120, 'I', 'I'),
    'J': new GraphNode(260, 165, 'J', 'J'),
    'K': new GraphNode(260, 210, 'K', 'K'),
    'L': new GraphNode(260, 260, 'L', 'L'),
    'M': new GraphNode(340, 170, 'M', 'M'),
    'N': new GraphNode(340, 250, 'N', 'N'),
    'O': new GraphNode(420, 300, 'O', 'O')
  };
  this.edges = [
    ['A', 'B', 3],
    ['A', 'C', 6],
    ['B', 'D', 2],
    ['B', 'E', 2],
    ['C', 'F', 2],
    ['C', 'G', 2],
    ['D', 'H', 2],
    ['D', 'I', 2],
    ['E', 'J', 2],
    ['F', 'K', 2],
    ['F', 'L', 2],
    ['K', 'M', 2],
    ['K', 'N', 2],
    ['N', 'O', 2]
  ];
};
