$(document).ready(function() {
  var w = 600,
    h = 350;
  var initial = 0;
  var visGraph = null;

  function init() {
    canvas = document.getElementById('nodeExpansionCanvas');
    frontierCanvas = document.getElementById('frontierCanvas');
    graph = makeDefaultGraph();
    agent = new nodeExpansionAgent(graph.adjMatrix, 0);
    visGraph = new drawGraph(canvas, h, w, agent, graph.nodes, graph.adjMatrix);
    frontierGraph = new drawFrontierNodes(frontierCanvas, h, w, agent, graph.nodes);
    visGraph.clickHandler = function() {
      index = $(this).attr('nodeIndex');
      visGraph.agent.expand(index);
      visGraph.iterate();
      frontierGraph.iterate();
    };

    visGraph.init();
    frontierGraph.init();
    $('#legendExpanded').css('background-color', visGraph.expandedColor);
    $('#legendFrontier').css('background-color', visGraph.frontierColor);
    $('#legendUnexplored').css('background-color', visGraph.unvisitedColor);
  };
  $('#nodeRestartButton').click(init);
  init();
});




$(document).ready(function() {
  var w = 600,
    h = 350;
  var initial = 0;
  var visGraph = null;

  function init() {
    canvas = document.getElementById('agentViewCanvas');
    graph = makeDefaultGraph();

    agent = new nodeExpansionAgent(graph.adjMatrix, Math.floor(Math.random() * 15));
    visGraph = new drawGraph(canvas, h, w, agent, graph.nodes, graph.adjMatrix);
    visGraph.drawCode = {
      0: {
        color: visGraph.unvisitedColor,
        opacity: 0.0
      },
      1: {
        color: visGraph.frontierColor,
        opacity: 0.0
      },
      2: {
        color: visGraph.expandedColor,
        opacity: 0.0
      }
    };

    visGraph.clickHandler = function() {
      index = $(this).attr('nodeIndex');
      visGraph.agent.expand(index);
      visGraph.iterate();
    };

    visGraph.init();
  };
  $('#agentViewRestartButton').click(init);
  init();
});
