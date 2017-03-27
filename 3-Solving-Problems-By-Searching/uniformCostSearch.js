// Code for Uniform Cost Search
var uniformCostSearch = function(frontier, costs) {
  var minCost = costs[0];
  var minNode = 0;
  for (var i = 0; i < frontier.length; i++) {
    if (costs[i] < minCost) {
      minCost = costs[i];
      minNode = i;
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
