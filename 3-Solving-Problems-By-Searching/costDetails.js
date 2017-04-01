var findShortestPath = function(nextNodeFunction, final) {
  var shortestPath = {
    path: [],
    cost: 0
  }
  let graph = new DefaultGraph();
  problem = new GraphProblem(graph.nodes, graph.edges, 'A', null);
  let agent = new GraphAgent(problem);
  while (problem.frontier.length > 0) {
    let next = nextNodeFunction(problem);
    agent.expand(next);
    if (next == final) {
      break;
    }
  }
  shortestPath.cost = problem.nodes[final].cost;
  var current = final;

  while (current != problem.initialKey) {
    let prev = problem.nodes[current].parent;
    currentCost = problem.nodes[current].cost - problem.nodes[prev].cost;
    shortestPath.path.push({
      node: current,
      cost: currentCost
    });
    current = prev;
  }
  shortestPath.path.push({
    node: problem.initialKey,
    cost: 0
  })
  return shortestPath;
}
