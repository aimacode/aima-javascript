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
    canvas = document.getElementById('depthFirstSearchCanvas');
    queueCanvas = document.getElementById('lifoQueueCanvas')
    graph = new makeDefaultGraph();
    agent = new nodeExpansionAgent(graph.adjMatrix, initial);
    visGraph = new drawGraph(canvas, h, w, agent, graph.nodes, graph.adjMatrix);
    visQueue = new drawQueue(queueCanvas, h, w, agent, graph.nodes);
    visGraph.init();
    visQueue.init();
    visGraph.nodeGroups[initial].children[0].fill = nextNodeColor;
    visQueue.rectangles[0].fill = nextNodeColor;
    visGraph.two.update();
    visQueue.two.update();
    updateFunction = function() {
      frontier = agent.frontier;
      if (frontier.length == 0) {
        clearInterval(intervalFunction, DELAY);
      } else {
        var x = depthFirstSearch(frontier);
        agent.expand(x);
        visGraph.iterate();
        visQueue.iterate();
        if (agent.frontier.length != 0) {
          visGraph.nodeGroups[agent.frontier[agent.frontier.length - 1]].children[0].fill = nextNodeColor;
          visGraph.two.update();
          visQueue.rectangles[visQueue.rectangles.length - 1].fill = nextNodeColor;
          visQueue.two.update();
        }
      }
    };
    intervalFunction = setInterval(updateFunction, DELAY);
    $('#lifoWaiting').css('background-color', visQueue.waitingColor);
    $('#lifoNextNode').css('background-color', nextNodeColor);
  };
  init();
  $('#dfsRestartButton').click(function() {
    clearInterval(intervalFunction, DELAY);
    init();
  })
})
