$(document).ready(function() {
  var w = 600,
    h = 350;
  var intervalFunction = null;

  function init() {
    var options = new DefaultOptions();
    options.nodes.next.fill = 'hsla(126, 100%, 69%, 1)';

    var drawState = function(n) {
      var graph = new DefaultGraph();
      var graphProblem = new GraphProblem(graph.nodes, graph.edges, 'A', 'A');
      var graphAgent = new GraphAgent(graphProblem);

      var graphDrawAgent = new GraphDrawAgent(graphProblem, 'breadthFirstSearchCanvas', options, h, w);
      var queueDrawAgent = new QueueDrawAgent('fifoQueueCanvas', h, w, graphProblem, options);

      while (n--) {
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
        } else {
          break;
        }
      }
      graphDrawAgent.iterate();
      queueDrawAgent.iterate();
    }

    let ac = new AnimationController({
      selector: '#bfsAC',
      min: 0,
      max: 15,
      renderer: drawState
    });
    ac.renderFirst();
  };

  $('#bfsRestartButton').click(init);
  $('#fifoWaiting').css('background-color', 'hsl(0,50%,75%)');
  $('#fifoNextNode').css('background-color', 'hsl(126, 100%, 69%)');
  init();
});
