$(document).ready(function() {
  var w = 600,
    h = 350;
  var DELAY = 2000;
  var intervalFunction = null;

  function init() {
    clearInterval(intervalFunction, DELAY);
    var graph = new DefaultGraph();
    var graphProblem = new GraphProblem(graph.nodes, graph.edges, 'A', 'A');
    var graphAgent = new GraphAgent(graphProblem);
    var options = new DefaultOptions();
    options.nodes.next.fill = 'hsla(126, 100%, 69%, 1)';
    var graphDrawAgent = new GraphDrawAgent(graphProblem, 'breadthFirstSearchCanvas', options, h, w);
    var queueDrawAgent = new QueueDrawAgent('fifoQueueCanvas', h, w, graphProblem, options);
    //Update handler is the function that would be executed every DELAY ms.
    var updateFunction = function() {
      if (graphProblem.frontier.length > 0) {
        var nextNode = breadthFirstSearch(graphProblem);
        graphAgent.expand(nextNode);
        //If frontier is still present, find the next node to be expanded so it
        //could be colored differently
        if (graphProblem.frontier.length > 0) {
          graphProblem.nextToExpand = breadthFirstSearch(graphProblem);
        } else {
          graphProblem.nextToExpand = null;
        }
        graphDrawAgent.iterate();
        queueDrawAgent.iterate();
      } else {
        clearInterval(intervalFunction, DELAY);
      }
    }
    intervalFunction = setInterval(updateFunction, DELAY);
  };
  $('#bfsRestartButton').click(init);
  $('#fifoWaiting').css('background-color', 'hsl(200,50%,70%)');
  $('#fifoNextNode').css('background-color', 'hsla(126, 100%, 69%, 1)');
  init();
});
