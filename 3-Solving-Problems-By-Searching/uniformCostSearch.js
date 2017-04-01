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

var getUcsCosts = function(adjMatrix, initial) {
  var agent = new nodeExpansionAgent(adjMatrix, initial);
  while (agent.frontier.length > 0) {
    var next = agent.frontier[uniformCostSearch(agent.frontier, agent.getCosts())];
    agent.expand(next);
    for (var i = 0; i < adjMatrix[next].length; i++) {
      if (adjMatrix[next][i] > 0) {
        neighbor = i;
        frontierIndex = agent.frontier.indexOf(neighbor);
        if (frontierIndex > -1) {
          if (agent.nodes[neighbor].cost > agent.nodes[next].cost + adjMatrix[next][neighbor]) {
            agent.nodes[neighbor].cost = agent.nodes[next].cost + adjMatrix[next][neighbor];
            agent.nodes[neighbor].parent = next;
          }
        }
      }
    };
  }
  var costs = [];
  for (var i = 0; i < agent.nodes.length; i++) {
    costs.push(agent.nodes[i].cost)
  }
  return costs;
}
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
