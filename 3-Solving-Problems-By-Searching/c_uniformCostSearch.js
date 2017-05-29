$(document).ready(function() {
  var w = 600,
    h = 350;
  var DELAY = 2000;
  var intervalFunction = null;

  function init() {
    clearInterval(intervalFunction, DELAY);
    var priorityQueueCanvas = document.getElementById('priorityQueueCanvas');
    var exploredQueueCanvas = document.getElementById('exploredPriorityQueueCanvas');
    priorityQueueCanvas.innerHTML = '';
    exploredQueueCanvas.innerHTML = '';
    var priorityTwo = new Two({
      height: h,
      width: w
    }).appendTo(priorityQueueCanvas);
    var exploredTwo = new Two({
      height: h,
      width: w
    }).appendTo(exploredQueueCanvas);
    //Intial value for separation is 0
    $('.ucsSeparation').html(0);
    var graph = new DefaultGraph();
    //Precompute costs of all nodes from the initial node
    var costMap = precomputedCosts();
    var graphProblem = new GraphProblem(graph.nodes, graph.edges, 'A', 'A');
    //Change the text of all the nodes to its cost
    for (key in graphProblem.nodes) {
      graphProblem.nodes[key].text = costMap[graphProblem.nodes[key].id];
    }
    var graphAgent = new GraphAgent(graphProblem, 'ucs');
    var options = new DefaultOptions();
    options.nodes.next.fill = 'hsla(126, 100%, 69%, 1)';
    options.edges.showCost = true;
    var graphDrawAgent = new GraphDrawAgent(graphProblem, 'uniformCostSearchCanvas', options, h, w);
    drawList(priorityTwo, graphProblem.frontier, graphProblem, options, costMap);
    drawList(exploredTwo, graphProblem.explored, graphProblem, options, costMap);
    var updateFunction = function() {
      if (graphProblem.frontier.length > 0) {
        var nextNode = uniformCostSearch(graphProblem);
        graphAgent.expand(nextNode);
        if (graphProblem.frontier.length > 0) {
          graphProblem.nextToExpand = uniformCostSearch(graphProblem);
        } else {
          graphProblem.nextToExpand = null;
        }
        graphDrawAgent.iterate();
        drawList(priorityTwo, graphProblem.frontier, graphProblem, options, costMap);
        drawList(exploredTwo, graphProblem.explored, graphProblem, options, costMap);
        let maxCost = 0;
        //Find the max cost which separates the explored from frontier nodes
        if (graphProblem.nextToExpand) {
          maxCost = graphProblem.nodes[graphProblem.nextToExpand].cost;
        }
        //Draw it in the front end
        $('.ucsSeparation').html(maxCost);
      } else {
        clearInterval(intervalFunction, DELAY);
      }
    }
    intervalFunction = setInterval(updateFunction, DELAY);
  };
  $('#ucsRestartButton').click(init);
  $('#ucsWaiting').css('background-color', 'hsl(200,50%,70%)');
  $('#ucsNextNode').css('background-color', 'hsla(126, 100%, 69%, 1)');
  $('#ucsExploredNode').css('background-color', 'hsl(0,50%,75%)');
  init();
});
//Function to draw the list of nodes for both canvas
function drawList(two, list, problem, options, costMap) {
  two.clear();
  for (var i = 0; i < list.length; i++) {
    let node = problem.nodes[list[i]];
    let state = node.state;
    if (node.id == problem.nextToExpand) {
      state = 'next';
    }
    let x = (i % 4) * 50 + 40;
    let y = (Math.floor(i / 4)) * 50 + 20;
    let circle = two.makeCircle(x, y, 15);
    let text = two.makeText(costMap[node.id], x, y);
    let fillColor = options.nodes[state].fill;
    circle.fill = fillColor;

  }
  two.update();
}
