$(document).ready(function() {
  var w = 600,
    h = 350;
  var visGraph = null;
  var visQueue = null;
  var agent = null;
  var initial = 0;
  var end = 16;
  var canvas = null;
  var queueCanvas = null;
  var DELAY = 2000;
  var updateFunction = null;
  var intervalFunction = null;
  var nextNodeColor = 'hsl(108, 96%, 50%)';

  function init() {
    canvas = document.getElementById('uniformCostSearchCanvas');
    queueCanvas = document.getElementById('priorityQueueCanvas')
    graph = new makeDefaultGraph();
    agent = new nodeExpansionAgent(graph.adjMatrix, initial);
    visGraph = new drawGraph(canvas, h, w, agent, graph.nodes, graph.adjMatrix, true);
    visQueue = new drawQueue(queueCanvas, h, w, agent, graph.nodes, true);
    visGraph.init();
    visQueue.init();
    visGraph.nodeGroups[initial].children[0].fill = nextNodeColor;
    visQueue.rectangles[0].fill = nextNodeColor;
    visGraph.two.update();
    visQueue.two.update();
    updateFunction = function() {
      var frontier = agent.frontier;
      var costs = agent.getCosts();
      if (frontier.length == 0) {
        clearInterval(intervalFunction, DELAY);
      } else {
        var x = frontier[uniformCostSearch(frontier, costs)];
        agent.expand(x);
        //Extra code for Unifrom Cost Search involving replacing node from the frontier
        // if its cost can be lowered.
        for (var i = 0; i < agent.adjMatrix[x].length; i++) {
          if (agent.adjMatrix[x][i] > 0) {
            neighbor = i;
            frontierIndex = agent.frontier.indexOf(neighbor);
            if (frontierIndex > -1) {
              if (agent.nodes[neighbor].cost > agent.nodes[x].cost + agent.adjMatrix[x][neighbor]) {
                agent.nodes[neighbor].cost = agent.nodes[x].cost + agent.adjMatrix[x][neighbor];
                agent.nodes[neighbor].parent = x;
              }
            }
          }
        }
        visGraph.iterate();
        visQueue.iterate();
        if (agent.frontier.length > 0) {
          index = uniformCostSearch(agent.frontier, agent.getCosts());
          next = agent.frontier[index];
          visGraph.nodeGroups[next].children[0].fill = nextNodeColor;
          visQueue.rectangles[index].fill = nextNodeColor;
          visGraph.two.update();
          visQueue.two.update();
        }
      }
    };
    intervalFunction = setInterval(updateFunction, DELAY);
    $('#ucsWaiting').css('background-color', visQueue.waitingColor);
    $('#ucsNextNode').css('background-color', nextNodeColor);
  };
  init();
  $('#ucsRestartButton').click(function() {
    clearInterval(intervalFunction, DELAY);
    init();
  })
})
