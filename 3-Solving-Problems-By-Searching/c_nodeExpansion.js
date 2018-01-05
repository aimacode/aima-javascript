$(document).ready(function() {
  var w = 600, h = 350;

  function init() {
    var graph = new DefaultGraph();
    var graphProblem = new GraphProblem(graph.nodes, graph.edges, 'A', null);
    var graphAgent = new GraphAgent(graphProblem);
    var options = new DefaultOptions();
    var frontierNodesAgent = new DrawFrontierAgent('frontierCanvas', 150, 250, graphProblem, options);

    var graphDrawAgent = new GraphDrawAgent(graphProblem, 'nodeExpansionCanvas', options, h, w);

    //Function to execute whenever a node is clicked
    var clickHandler = function() {
      //Find out which node has been clicked
      let nodeKey = $(this).attr('nodeKey');
      //Expand it
      graphAgent.expand(nodeKey);
      graphDrawAgent.iterate();
      frontierNodesAgent.iterate();
      graphDrawAgent.unhighlight(nodeKey);
    };
    options.nodes.frontier.clickHandler = clickHandler;
    options.nodes.next.clickHandler = clickHandler;

    //Functions to detect when you hover over a node
    options.nodes.frontier.onMouseEnter = function() {
      let nodeKey = $(this).attr('nodeKey');
      frontierNodesAgent.highlight(nodeKey);
      graphDrawAgent.highlight(nodeKey);
    };
    options.nodes.frontier.onMouseLeave = function() {
      let nodeKey = $(this).attr('nodeKey');
      frontierNodesAgent.unhighlight(nodeKey);
      graphDrawAgent.unhighlight(nodeKey);
    };

   	graphDrawAgent.nodeGroups['A']._renderer.elem.onmouseenter = options.nodes.frontier.onMouseEnter;
    graphDrawAgent.nodeGroups['A']._renderer.elem.onmouseleave = options.nodes.frontier.onMouseLeave;

    graphDrawAgent.reset();
    frontierNodesAgent.iterate();
  };
  $('#nodeRestartButton').click(init);
  init();
});

$(document).ready(function() {
  var w = 600,
    h = 350;
  var options = new DefaultOptions();

  function init() {
    var graph = new DefaultGraph();
    var graphProblem = new GraphProblem(graph.nodes, graph.edges, String.fromCharCode(65 + Math.random() * 15), null);
    var graphAgent = new GraphAgent(graphProblem);
    var graphDrawAgent = new GraphDrawAgent(graphProblem, 'agentViewCanvas', options, h, w);
    //For this simulation, unexplored nodes and edges needs to be invisible
    options.nodes.unexplored.opacity = 0;
    options.edges.unvisited.opacity = 0;
    var clickHandler = function() {
      let nodeKey = $(this).attr('nodeKey');
      graphAgent.expand(nodeKey);
      graphDrawAgent.iterate();
      graphDrawAgent.unhighlight(nodeKey);
    };
    options.nodes.frontier.clickHandler = clickHandler;
    options.nodes.next.clickHandler = clickHandler;
    options.nodes.frontier.onMouseEnter = function() {
      let nodeKey = $(this).attr('nodeKey');
      graphDrawAgent.highlight(nodeKey);
    }
    options.nodes.frontier.onMouseLeave = function() {
      let nodeKey = $(this).attr('nodeKey');
      graphDrawAgent.unhighlight(nodeKey);
    }

    graphDrawAgent.reset();
  };
  $('#agentViewRestartButton').click(init);
  $('#legendExpanded').css('background-color', options.nodes.explored.fill);
  $('#legendFrontier').css('background-color', options.nodes.frontier.fill);
  $('#legendUnexplored').css('background-color', options.nodes.unexplored.fill);
  init();
});

//Function to draw the frontier nodes
function DrawFrontierAgent(selector, h, w, problem, options) {
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
    this.nodeDict = {};
    frontierNodes = this.problem.frontier;
    for (var i = 0; i < frontierNodes.length; i++) {
      node = this.problem.nodes[frontierNodes[i]];
      var x = (i % 4) * 50 + 40;
      var y = (Math.floor(i / 4)) * 50 + 20;
      var circle = this.two.makeCircle(x, y, this.nodeRadius);
      var text = this.two.makeText(node.text, x, y);
      circle.fill = options.nodes.frontier.fill;
      var group = this.two.makeGroup(circle, text);
      this.two.update();
      $(group._renderer.elem).attr('nodeKey', node.id);
      group._renderer.elem.onmouseenter = options.nodes.frontier.onMouseEnter;
      group._renderer.elem.onmouseleave = options.nodes.frontier.onMouseLeave;
      this.nodeDict[node.text] = group;
    }
  }

  this.highlight = function(nodeKey) {
    this.nodeDict[nodeKey]._collection[0].fill = options.nodes.highlighted.fill;
    this.two.update();
  }

  this.unhighlight = function(nodeKey) {
    let node = this.nodeDict[nodeKey];
    if (node == this.problem.nextToExpand)
     node._collection[0].fill = options.nodes.next.fill;  
    else
      node._collection[0].fill = options.nodes.frontier.fill;

    this.two.update();
  }
}
