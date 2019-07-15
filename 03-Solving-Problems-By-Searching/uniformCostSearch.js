// Code for Uniform Cost Search
var uniformCostSearch = function(problem) {
  var frontier = problem.frontier;
  var minNode = frontier[0];
  var minCost = Number.POSITIVE_INFINITY;
  for (var i = 0; i < frontier.length; i++) {
    if (problem.nodes[frontier[i]].cost < minCost) {
      minCost = problem.nodes[frontier[i]].cost;
      minNode = frontier[i];
    }
  }
  return minNode;
}

//Calculate the costs of the default graph and return a dictionary
//with the costs of all the nodes
var precomputedCosts = function() {
  var graph = new DefaultGraph();
  var problem = new GraphProblem(graph.nodes, graph.edges, 'A', 'A');
  var agent = new GraphAgent(problem);
  while (problem.frontier.length > 0) {
    let next = uniformCostSearch(problem);
    agent.expand(next);
  }
  var costMap = {};
  for (key in problem.nodes) {
    let node = problem.nodes[key];
    costMap[key] = node.cost;
  }
  return costMap;
}
