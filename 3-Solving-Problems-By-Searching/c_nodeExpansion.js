$(document).ready(function() {
  var w = 600,
    h = 350;


  function init() {
    var graph = new DefaultGraph();
    var graphProblem = new GraphProblem(graph.nodes, graph.edges, 'A', null);
    var graphAgent = new GraphAgent(graphProblem);
    var frontierNodesAgent = new DrawFrontierAgent('frontierCanvas', 150, 250, graphProblem);
    var options = new DefaultOptions();
    //Function to execute whenever a node is clicked
    var clickHandler = function() {
      //Find out which node has been clicked
      let nodeKey = $(this).attr('nodeKey');
      //Expand it
      graphAgent.expand(nodeKey);
      graphDrawAgent.iterate();
      frontierNodesAgent.iterate();
    };
    options.nodes.frontier.clickHandler = clickHandler;
    options.nodes.next.clickHandler = clickHandler
    var graphDrawAgent = new GraphDrawAgent(graphProblem, 'nodeExpansionCanvas', options, h, w);
  };
  $('#nodeRestartButton').click(init);
  init();
});




$(document).ready(function() {
  var w = 600,
    h = 350;

  function init() {
    var graph = new DefaultGraph();
    var graphProblem = new GraphProblem(graph.nodes, graph.edges, String.fromCharCode(65 + Math.random() * 15), null);
    var graphAgent = new GraphAgent(graphProblem);
    var options = new DefaultOptions();
    //For this simulation, unexplored nodes and edges needs to be invisible
    options.nodes.unexplored.opacity = 0;
    options.edges.unvisited.opacity = 0;
    var clickHandler = function() {
      let nodeKey = $(this).attr('nodeKey');
      graphAgent.expand(nodeKey);
      graphDrawAgent.iterate();
    };
    options.nodes.frontier.clickHandler = clickHandler;
    options.nodes.next.clickHandler = clickHandler;

    var graphDrawAgent = new GraphDrawAgent(graphProblem, 'agentViewCanvas', options, h, w);
  };
  $('#agentViewRestartButton').click(init);
  $('#legendExpanded').css('background-color', 'hsl(0,50%,75%)');
  $('#legendFrontier').css('background-color', 'hsl(200,50%,70%)');
  $('#legendUnexplored').css('background-color', 'hsl(0, 2%, 76%)');
  init();
});


//Function to draw the frontier nodes
function DrawFrontierAgent(selector, h, w, problem) {
  this.canvas = document.getElementById(selector);
  this.canvas.innerHTML = '';
  this.two = new Two({
    height: h,
    width: w
  }).appendTo(this.canvas);
  this.problem = problem;
  this.nodeRadius = 15;
  this.iterate = function() {
    this.two.clear();
    frontierNodes = this.problem.frontier;
    for (var i = 0; i < frontierNodes.length; i++) {
      node = this.problem.nodes[frontierNodes[i]];
      var x = (i % 4) * 50 + 40;
      var y = (Math.floor(i / 4)) * 50 + 20;
      var circle = this.two.makeCircle(x, y, this.nodeRadius);
      var text = this.two.makeText(node.text, x, y);
      circle.fill = 'hsl(200,50%,70%)';
    }
    this.two.update();
  }
  this.iterate();
}
