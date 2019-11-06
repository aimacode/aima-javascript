var findShortestPath = function(nextNodeFunction, final) {
  var shortestPath = {
    path: [],
    cost: 0
  }
  let graph = new DefaultGraph();
  problem = new GraphProblem(graph.nodes, graph.edges, 'A', null);
  //Make a new problem fromt the graph and solve it using the given nextNodeFunction
  let agent = new GraphAgent(problem, 'ucs');
  while (problem.frontier.length > 0) {
    let next = nextNodeFunction(problem);
    agent.expand(next);
    //Exit if final node reached
    if (next == final) {
      break;
    }
  }
  shortestPath.cost = problem.nodes[final].cost;
  var current = final;
  //Iterate from the final to initial node using parent property to find the path
  while (current != problem.initialKey) {
    let prev = problem.nodes[current].parent;
    currentCost = problem.nodes[current].cost - problem.nodes[prev].cost;
    shortestPath.path.push({
      node: current,
      cost: currentCost
    });
    current = prev;
  }
  //Push the initial node to the path array
  shortestPath.path.push({
    node: problem.initialKey,
    cost: 0
  })
  return shortestPath;
}
