var findShortestPath = function(adjMatrix, initial, final, ucs) {
  var shortestPath = {
    path: [],
    cost: 0
  }
  var agent = new nodeExpansionAgent(adjMatrix, initial);
  while (agent.frontier.length > 0) {
    if (ucs) {
      next = agent.frontier[uniformCostSearch(agent.frontier, agent.getCosts())];
    } else {
      next = breadthFirstSearch(agent.frontier);
    }
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
    if (next == current) {
      break;
    }
  }
  shortestPath.cost = agent.nodes[final].cost;
  var current = final;
  var runningCost = 0
  shortestPath.path.push({
    node: final,
    cost: runningCost
  });
  while (current != initial) {
    runningCost = runningCost + adjMatrix[current][agent.nodes[current].parent];
    current = agent.nodes[current].parent;
    shortestPath.path.push({
      node: current,
      cost: runningCost
    });
  }

  return shortestPath;
}
