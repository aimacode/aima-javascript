$(document).ready(function() {
  var w = 600,
    h = 350;
  var visGraph = null;
  var visQueue = null;
  var exploredVisQueue = null;
  var agent = null;
  var initial = 0;
  var end = 16;
  var canvas = null;
  var queueCanvas = null;
  var exploredQueueCanvas = null;
  var DELAY = 2000;
  var updateFunction = null;
  var intervalFunction = null;
  var nextNodeColor = 'hsl(108, 96%, 50%)';


  var drawUcsQueue = function() {
    this.two.clear();
    this.rectangles = [];
    var frontier = this.agent.getExpandables();
    var costs;
    if (this.showCost) {
      costs = this.agent.getCosts();
    }
    if (frontier.length > 0) {
      for (var i = 0; i < frontier.length; i++) {
        node = this.nodes[frontier[i]];
        var x = (i % 4) * 50 + 40;
        var y = Math.floor(i / 4) * 40 + 50;
        var rect = this.two.makeRectangle(x, y, this.nodeRadius, this.nodeRadius);
        rect.fill = this.waitingColor;
        this.rectangles.push(rect);
        var text = this.two.makeText(node.text, x, y);
        var group = this.two.makeGroup(rect, text);
        this.two.update();
      }
    }
    this.two.update();
    this.indexOfLastElement = frontier.length - 1;
  }

  var drawExploredQueue = function() {
    this.two.clear();
    this.rectangles = [];
    var frontier = this.agent.getExpanded();
    var costs;
    if (this.showCost) {
      costs = this.agent.getCosts();
    }
    if (frontier.length > 0) {
      for (var i = 0; i < frontier.length; i++) {
        node = this.nodes[frontier[i]];
        var x = (i % 4) * 50 + 40;
        var y = Math.floor(i / 4) * 40 + 50;
        var rect = this.two.makeRectangle(x, y, this.nodeRadius, this.nodeRadius);
        rect.fill = this.expandedColor;
        this.rectangles.push(rect);
        var text = this.two.makeText(node.text, x, y);
        var group = this.two.makeGroup(rect, text);
        this.two.update();
      }
    }
    this.two.update();
    this.indexOfLastElement = frontier.length - 1;
  }

  function init() {
    canvas = document.getElementById('uniformCostSearchCanvas');
    queueCanvas = document.getElementById('priorityQueueCanvas');
    exploredQueueCanvas = document.getElementById('exploredPriorityQueueCanvas');

    graph = new makeDefaultGraph();
    var costs = getUcsCosts(graph.adjMatrix, initial);
    for (var i = 0; i < costs.length; i++) {
      graph.nodes[i].text = costs[i];
    }
    agent = new nodeExpansionAgent(graph.adjMatrix, initial);
    visGraph = new drawGraph(canvas, h, w, agent, graph.nodes, graph.adjMatrix, true);
    visQueue = new drawQueue(queueCanvas, h, w, agent, graph.nodes, false);
    exploredVisQueue = new drawQueue(exploredQueueCanvas, h, w, agent, graph.nodes, false);
    visQueue.iterate = drawUcsQueue;
    exploredVisQueue.iterate = drawExploredQueue;
    visGraph.init();
    visQueue.init();
    exploredVisQueue.init();
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
        exploredVisQueue.iterate();
        if (agent.frontier.length > 0) {
          index = uniformCostSearch(agent.frontier, agent.getCosts());
          next = agent.frontier[index];
          visGraph.nodeGroups[next].children[0].fill = nextNodeColor;
          visQueue.rectangles[index].fill = nextNodeColor;
          visGraph.two.update();
          visQueue.two.update();
          separationCost = agent.nodes[next].cost;
          $('.ucsSeparation').html(separationCost);
        }
      }
    };
    intervalFunction = setInterval(updateFunction, DELAY);
    $('#ucsWaiting').css('background-color', visQueue.waitingColor);
    $('#ucsNextNode').css('background-color', nextNodeColor);
    $('#ucsExploredNode').css('background-color', 'hsl(0,50%,75%)');
  };
  init();
  $('#ucsRestartButton').click(function() {
    clearInterval(intervalFunction, DELAY);
    init();
  })
})
