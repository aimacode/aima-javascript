
// ESLint Config -- http://eslint.org/docs/user-guide/configuring

/* eslint-env browser */
/* global DefaultGraph */
/* global GraphProblem */
/* global GraphAgent */
/* global euclideanDistance */

// The default graph that is used in most of the simulation
// This ensures consistency in the experience of the user
class GraphAStarSearch extends DefaultGraph {
  constructor() {
    super();
    // It adapts the default graph data for using h(n) heuristic
    // this.nodes['J'].y -= 25
    GraphAStarSearch.reWeightEdges(this);
  }
  static reWeightEdges(graph) {
    for (let edge of graph.edges) {
      const nodeKeyA = edge[0];
      const nodeKeyB = edge[1];
      const nodeA = graph.nodes[nodeKeyA];
      const nodeB = graph.nodes[nodeKeyB];
      const pointA = [nodeA.x, nodeA.y];
      const pointB = [nodeB.x, nodeB.y];
      const distance = euclideanDistance(pointA, pointB);
      const cost = Math.round(distance);
      // console.log('%s -> %s, distance=%s, cost=%s', nodeKeyA, nodeKeyB, distance, cost)
      edge[2] = cost;
    }
  }
}

// Code for A Star Search

class GraphProblemAStarSearch extends GraphProblem {
  /**
   * @see https://github.com/nervgh/astar-algorithm
   * @param {Object} nodes
   * @param {Object} edges
   * @param {String} initialKey
   * @param {String} nextToExpand
   * @param {String} goalKey
   */
  constructor(nodes, edges, initialKey, nextToExpand, goalKey) {
    super(nodes, edges, initialKey, nextToExpand);
    this.goalKey = goalKey;
  }
  /**
   * It should check: is a node is the goal?
   * @param {String} nodeKey
   * @return {Boolean}
   */
  isGoal(nodeKey) {
    return this.goalKey === nodeKey;
  }
  /**
   * g(x). It should return the cost of path between two nodes
   * @param {String} nodeKeyA
   * @param {String} nodeKeyB
   * @return {Number}
   */
  distance(nodeKeyA, nodeKeyB) {
    for (const [keyA, keyB, cost] of this.edges) {
      if (
        GraphProblemAStarSearch.isEqualNodeKeyPair(
          nodeKeyA,
          nodeKeyB,
          keyA,
          keyB
        )
      ) {
        return cost;
      }
    }
    return Number.POSITIVE_INFINITY;
  }
  /**
   * h(x). It should return the cost of path from a node to the goal
   * @param {String} nodeKey
   * @param {String} [goalKey]
   * @return {Number}
   */
  estimate(nodeKey, goalKey = this.goalKey) {
    const nodeA = this.nodes[nodeKey];
    const nodeB = this.nodes[goalKey];
    const point1 = [nodeA.x, nodeA.y];
    const point2 = [nodeB.x, nodeB.y];
    const estimated = euclideanDistance(point1, point2);
    return Math.round(estimated);
  }
  /**
   * @param {String} nodeKey
   * @return {Array.<GraphNode>}
   */
  getSuccessors(nodeKey) {
    return this.getAdjacent(nodeKey).map(item => this.nodes[item.nodeKey]);
  }
  /**
   * Resets problem
   */
  reset() {
    super.reset();
    for (const node of GraphProblemAStarSearch.toArray(this.nodes)) {
      node.totalCost = 0;
    }
  }
  /**
   * @param {String} nodeKey
   * @return {Boolean}
   */
  isQueuedNode(nodeKey) {
    return this.frontier.indexOf(nodeKey) !== -1;
  }
  /**
   * @param {String} nodeKey
   * @return {Boolean}
   */
  isExploredNode(nodeKey) {
    return this.explored.indexOf(nodeKey) !== -1;
  }
  /**
   * @param {String} nodeKeyA1
   * @param {String} nodeKeyB1
   * @param {String} nodeKeyA2
   * @param {String} nodeKeyB2
   * @return {Boolean}
   */
  static isEqualNodeKeyPair(nodeKeyA1, nodeKeyB1, nodeKeyA2, nodeKeyB2) {
    return (
      (nodeKeyA1 === nodeKeyA2 && nodeKeyB1 === nodeKeyB2) ||
      (nodeKeyA1 === nodeKeyB2 && nodeKeyB1 === nodeKeyA2)
    );
  }
  /**
   * Turns an object to an array of objects
   * @param {Object} obj
   * @return {Array.<Object>}
   */
  static toArray(obj) {
    let stack = [];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        stack.push(obj[key]);
      }
    }
    return stack;
  }
}

class GraphAgentAStarSearch extends GraphAgent {
  /**
   * The function that expands a node from the graph
   * @see https://github.com/nervgh/astar-algorithm
   * @param {String} nodeKey
   */
  expand(nodeKey) {
    const parentNode = this.problem.nodes[nodeKey];

    if (this.problem.isGoal(parentNode.id)) {
      return;
    }

    this.problem.removeFromFrontier(parentNode.id);
    this.problem.addToExplored(parentNode.id);

    for (const successorNode of this.problem.getSuccessors(parentNode.id)) {
      if (this.problem.isExploredNode(successorNode.id)) {
        continue;
      }

      successorNode.depth = parentNode.depth + 1;
      successorNode.parent = parentNode.id;

      // The distance from start to a successor
      const tentativeGScore =
        parentNode.cost +
        this.problem.distance(parentNode.id, successorNode.id);

      // This is not a better path
      if (tentativeGScore >= successorNode.cost) {
        continue;
      }

      // This path is the best until now. We should save it.
      successorNode.cost = tentativeGScore;
      successorNode.estimatedCost = this.problem.estimate(successorNode.id);
      successorNode.totalCost =
        successorNode.cost + successorNode.estimatedCost;

      if (!this.problem.isQueuedNode(successorNode.id)) {
        this.problem.addToFrontier(successorNode.id);
      }
    }

    // We should prioritize the queue items
    this.problem.frontier.sort((keyA, keyB) => {
      return (
        this.problem.nodes[keyA].totalCost - this.problem.nodes[keyB].totalCost
      );
    });
  }
  /**
   * Solves a problem and returns how many iterations it takes
   * @param {Number} [iterationsCount=Number.POSITIVE_INFINITY]
   * @returns {Number}
   */
  solve(iterationsCount = Number.POSITIVE_INFINITY) {
    let k = 0;

    while (
      iterationsCount > 0 &&
      !this.problem.isGoal(this.problem.frontier[0])
    ) {
      // Expands next node
      this.expand(this.problem.frontier[0]);
      this.problem.nextToExpand = this.problem.frontier[0];
      // Highlights a node which will be expanded at next iteration
      const nextIterationNodeKey = this.problem.frontier[0];
      const nextIterationNode = this.problem.nodes[nextIterationNodeKey];
      nextIterationNode.state = "next";

      iterationsCount -= 1;
      k += 1;
    }

    return k;
  }
}
