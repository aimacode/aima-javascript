// Standard Code Style -- https://github.com/standard/standard
// ESLint Config -- http://eslint.org/docs/user-guide/configuring

/* eslint-env browser */

/* global GraphAStarSearch */
/* global GraphProblemAStarSearch */
/* global GraphAgentAStarSearch */
/* global DefaultOptions */
/* global GraphDrawAgent */

function AStarSearchRenderer() {
  this.dom = {};
  this.dom.root = document.querySelector("#aStarSearchBox");
  this.dom.startNode = document.querySelector("#aStarSearchBox-startNode");
  this.dom.goalNode = document.querySelector("#aStarSearchBox-goalNode");
  this.dom.slider = document.querySelector("#aStarSearchBox-slider");
  this.dom.stepBackward = document.querySelector(
    "#aStarSearchBox-stepBackward"
  );
  this.dom.stepForward = document.querySelector("#aStarSearchBox-stepForward");
  this.dom.reset = document.querySelector("#aStarSearchBox-reset");
  this.dom.legendFrontier = document.querySelector(
    "#aStarSearchBox-legendFrontier"
  );
  this.dom.legendNext = document.querySelector("#aStarSearchBox-legendNext");
  this.dom.legendExplored = document.querySelector(
    "#aStarSearchBox-legendExplored"
  );
  this.dom.pathContainer = document.querySelector(
    "#aStarSearchBox-pathContainer"
  );
  this.dom.priorityQueueContainer = document.querySelector(
    "#aStarSearchBox-priorityQueueContainer"
  );
  this.dom.unexploredNodesContainer = document.querySelector(
    "#aStarSearchBox-unexploredNodesContainer"
  );
  this.dom.exploredNodesContainer = document.querySelector(
    "#aStarSearchBox-exploredNodesContainer"
  );

  // Graph's options
  this.options = new DefaultOptions();
  this.options.nodes.next.fill = "hsla(126, 100%, 69%, 1)";
  this.options.edges.showCost = true;

  // Two.js' options
  this.canvasOptions = {
    width: 600,
    height: 350
  };

  // defines initial state
  this.state = {
    initialKey: "A",
    goalKey: "O",
    iterationsCount: 0,
    maxIterationsCount: Number.POSITIVE_INFINITY // should be precalculated
  };

  this.initializeProblemAndAgents();
  this.attachEventListeners();
  this.reset();
  this.render();
}
AStarSearchRenderer.prototype.initializeProblemAndAgents = function() {
  this.graphProblem = this.createGraphProblem();
  this.graphAgent = new GraphAgentAStarSearch(this.graphProblem);
  this.graphDrawAgent = new GraphDrawAgent(
    this.graphProblem, // it is solved graphProblem
    "aStarSearchCanvas",
    this.options,
    this.canvasOptions.height,
    this.canvasOptions.width
  );
};
AStarSearchRenderer.prototype.createGraphProblem = function() {
  // The default graph
  var graph = new GraphAStarSearch();
  var graphProblem = new GraphProblemAStarSearch(
    graph.nodes,
    graph.edges,
    this.state.initialKey,
    this.state.initialKey,
    this.state.goalKey
  );
  // It should color this node as "next" one
  graphProblem.nodes[graphProblem.initialKey].state = "next";
  return graphProblem;
};
AStarSearchRenderer.prototype.attachEventListeners = function() {
  this.dom.startNode.addEventListener(
    "change",
    this.onChangeStartNode.bind(this)
  );
  this.dom.goalNode.addEventListener(
    "change",
    this.onChangeGoalNode.bind(this)
  );
  this.dom.slider.addEventListener("input", this.onInputSlider.bind(this));
  this.dom.stepBackward.addEventListener(
    "click",
    this.onClickStepBackward.bind(this)
  );
  this.dom.stepForward.addEventListener(
    "click",
    this.onClickStepForward.bind(this)
  );
  this.dom.reset.addEventListener("click", this.onClickReset.bind(this));

  this.options.nodes.frontier.onMouseEnter = function() {
    let nodeKey = $(this).attr('nodeKey');
    astar.graphDrawAgent.highlight(nodeKey);
    $("#" + nodeKey + "a").css('background-color', astar.options.nodes.highlighted.fill);
    $("#" + nodeKey + "p").css('background-color', astar.options.nodes.highlighted.fill);
    $("#" + nodeKey + "e").css('background-color', astar.options.nodes.highlighted.fill);
  };
  this.options.nodes.frontier.onMouseLeave = function() {
    let nodeKey = $(this).attr('nodeKey');
    astar.graphDrawAgent.unhighlight(nodeKey);
    let node = astar.graphProblem.nodes[nodeKey];
    var backgroundObject = AStarSearchRenderer.helpers.getNodeStyle(astar.graphProblem, astar.options, node);
    var backgroundColor = backgroundObject.backgroundColor;
    $("#" + nodeKey + "a").css('background-color', backgroundColor);
    $("#" + nodeKey + "p").css('background-color', backgroundColor);
    $("#" + nodeKey + "e").css('background-color', backgroundColor);
  };

  this.options.nodes.next.onMouseEnter = this.options.nodes.frontier.onMouseEnter;
  this.options.nodes.next.onMouseLeave = this.options.nodes.frontier.onMouseLeave;

  this.options.nodes.explored.onMouseEnter = this.options.nodes.frontier.onMouseEnter;
  this.options.nodes.explored.onMouseLeave = this.options.nodes.frontier.onMouseLeave;

  this.options.nodes.unexplored.onMouseEnter = this.options.nodes.frontier.onMouseEnter;
  this.options.nodes.unexplored.onMouseLeave = this.options.nodes.frontier.onMouseLeave;
};
AStarSearchRenderer.prototype.onChangeStartNode = function() {
  var el = this.dom.startNode;
  this.state.initialKey = el.options[el.selectedIndex].value;
  this.reset();
  this.render();
};
AStarSearchRenderer.prototype.onChangeGoalNode = function() {
  var node = this.dom.goalNode;
  this.state.goalKey = node.options[node.selectedIndex].value;
  this.reset();
  this.render();
};
AStarSearchRenderer.prototype.onInputSlider = function() {
  var el = this.dom.slider;
  this.state.iterationsCount = Number(el.value);
  this.render();
};
AStarSearchRenderer.prototype.onClickStepBackward = function() {
  this.state.iterationsCount = Math.max(this.state.iterationsCount - 1, 0);
  this.render();
};
AStarSearchRenderer.prototype.onClickStepForward = function() {
  this.state.iterationsCount = Math.min(
    this.state.iterationsCount + 1,
    this.state.maxIterationsCount
  );
  this.render();
};
AStarSearchRenderer.prototype.onClickReset = function() {
  this.reset();
  this.render();
};
/**
 * Resets a graphProblem
 */
AStarSearchRenderer.prototype.reset = function() {
  this.graphProblem.reset();
  this.graphProblem.initialKey = this.state.initialKey;
  this.graphProblem.nextToExpand = this.state.initialKey;
  this.graphProblem.goalKey = this.state.goalKey;

  this.state.iterationsCount = 0;
  this.state.maxIterationsCount = this.graphAgent.solve();
  // We have to reset graphProblem because it is already solved in the line above
  this.graphProblem.reset();
  this.graphProblem.initialKey = this.state.initialKey;
  this.graphProblem.nextToExpand = this.state.initialKey;
  this.graphProblem.goalKey = this.state.goalKey;
};
/**
 * Renders some state of graphProblem
 */
AStarSearchRenderer.prototype.render = function() {
  var helpers = AStarSearchRenderer.helpers;
  var templates = AStarSearchRenderer.templates;
  var nodes = this.graphProblem.nodes;
  var state = this.state;

  // start's select options
  this.dom.startNode.innerHTML = "";
  helpers.forEach(
    nodes,
    function(node) {
      var isSelected = node.id === state.initialKey;
      var elementOption = new Option(node.id, node.id, isSelected, isSelected);
      this.dom.startNode.appendChild(elementOption);
    },
    this
  );

  // goal's select options
  this.dom.goalNode.innerHTML = "";
  helpers.forEach(
    nodes,
    function(node) {
      var isSelected = node.id === state.goalKey;
      var elementOption = new Option(node.id, node.id, isSelected, isSelected);
      this.dom.goalNode.appendChild(elementOption);
    },
    this
  );

  // slider
  this.dom.slider.max = this.state.maxIterationsCount;
  this.dom.slider.value = this.state.iterationsCount;

  // stepBackward
  this.dom.stepBackward.disabled = this.state.iterationsCount === 0;
  // stepForward
  this.dom.stepForward.disabled =
    this.state.iterationsCount === this.state.maxIterationsCount;

  // legends
  this.dom.legendFrontier.style.backgroundColor = this.options.nodes.frontier.fill;
  this.dom.legendNext.style.backgroundColor = this.options.nodes.next.fill;
  this.dom.legendExplored.style.backgroundColor = this.options.nodes.explored.fill;

  // -------------------
  this.graphProblem.reset();
  this.graphProblem.initialKey = this.state.initialKey;
  this.graphProblem.nextToExpand = this.state.initialKey;
  this.graphProblem.goalKey = this.state.goalKey;
  this.graphProblem.nodes[this.state.initialKey].state = "next";
  this.graphAgent.solve(this.state.iterationsCount);
  // It renders the graph (Two.js)
  this.graphDrawAgent.iterate();
  // -------------------

  // templates
  var pathNodesInnerHtml = "";
  helpers.forEach(
    helpers.getPathNodes(this.graphProblem),
    function(node) {
      pathNodesInnerHtml += templates.renderNodeToString(
        this.graphProblem,
        this.options,
        node
      );
    },
    this
  );
  this.dom.pathContainer.innerHTML = pathNodesInnerHtml;

  var priorityQueueNodesInnerHtml = "";
  helpers.forEach(
    helpers.frontierNodes(this.graphProblem),
    function(node) {
      priorityQueueNodesInnerHtml += templates.renderPriorityQueryNodeToString(
        this.graphProblem,
        this.options,
        node
      );
    },
    this
  );
  this.dom.priorityQueueContainer.innerHTML = priorityQueueNodesInnerHtml;

  var unexploredNodesInnerHtml = "";
  helpers.forEach(
    helpers.unexploredNodes(this.graphProblem),
    function(node) {
      unexploredNodesInnerHtml += templates.renderNodeToString(
        this.graphProblem,
        this.options,
        node
      );
    },
    this
  );
  this.dom.unexploredNodesContainer.innerHTML = unexploredNodesInnerHtml;

  var exploredNodesInnerHtml = "";
  helpers.forEach(
    helpers.exploredNodes(this.graphProblem),
    function(node) {
      exploredNodesInnerHtml += templates.renderExploredNodeToString(
        this.graphProblem,
        this.options,
        node
      );
    },
    this
  );
  this.dom.exploredNodesContainer.innerHTML = exploredNodesInnerHtml;

  for (node in this.graphProblem.explored){
    let ele = document.getElementById(this.graphProblem.explored[node]+"e");
    if (ele != null) {
      ele.onmouseenter = this.options.nodes.frontier.onMouseEnter;
      ele.onmouseleave = this.options.nodes.frontier.onMouseLeave;
    }
  }
  for (node in this.graphProblem.frontier){
    let ele = document.getElementById(this.graphProblem.frontier[node]+"p");
    if (ele != null) {
      ele.onmouseenter = this.options.nodes.frontier.onMouseEnter;
      ele.onmouseleave = this.options.nodes.frontier.onMouseLeave;
    }
  }
  for (key in this.graphProblem.nodes) {
    let ele = document.getElementById(key+"a");
    if (ele != null) {
      ele.onmouseenter = this.options.nodes.frontier.onMouseEnter;
      ele.onmouseleave = this.options.nodes.frontier.onMouseLeave;
    }
  }
};
AStarSearchRenderer.helpers = {
  /**
   * @param {GraphProblem} graphProblem
   * @return {Array.<Object>}
   */
  unexploredNodes: function(graphProblem) {
    return GraphProblemAStarSearch.toArray(graphProblem.nodes).filter(function(
      node
    ) {
      return node.state === "unexplored";
    });
  },
  /**
   * @param {GraphProblem} graphProblem
   * @return {Array.<Object>}
   */
  frontierNodes: function(graphProblem) {
    return graphProblem.frontier.map(function(nodeKey) {
      return graphProblem.nodes[nodeKey];
    });
  },
  /**
   * @param {GraphProblem} graphProblem
   * @return {Array.<Object>}
   */
  exploredNodes: function(graphProblem) {
    return graphProblem.explored.map(function(nodeKey) {
      return graphProblem.nodes[nodeKey];
    });
  },
  /**
   * @param {GraphProblem} graphProblem
   * @return {Array.<Object>}
   */
  getPathNodes: function(graphProblem) {
    var currentKey = graphProblem.frontier[0];
    var node = graphProblem.nodes[currentKey];
    var stack = [];
    while (node) {
      stack.push(node);
      var parentKey = node.parent;
      node = graphProblem.nodes[parentKey];
    }
    return stack.reverse();
  },
  /**
   * @param {GraphProblem} graphProblem
   * @param {DefaultOptions} options
   * @param {GraphNode} node
   * @return {{backgroundColor: string}}
   */
  getNodeStyle: function(graphProblem, options, node) {
    return {
      backgroundColor: options.nodes[node.state].fill
    };
  },
  /**
   * @param {Array|Object} iterable
   * @param {Function} cb
   * @param {*} that
   */
  forEach: function(iterable, cb, that) {
    if (Array.isArray(iterable)) {
      Array.prototype.forEach.call(iterable, cb, that);
    } else {
      for (var key in iterable) {
        cb.call(that, iterable[key], key);
      }
    }
  }
};
AStarSearchRenderer.templates = {
  renderNodeToString: function(graphProblem, options, node) {
    var helpers = AStarSearchRenderer.helpers;
    var backgroundObject = helpers.getNodeStyle(graphProblem, options, node);
    var backgroundColor = backgroundObject["backgroundColor"];
    return (
      "<li " +
      'style="margin: 16px 16px 0 0; background-color:' +
      backgroundColor +
      ' ;"' +
      'class="graph-node pull-left" nodeKey="' + 
      node.id +
      '" id="' +
      node.id +
      'a">' +
      node.id + 
      "</li>"
    );
  },
  renderExploredNodeToString: function(graphProblem, options, node) {
    var helpers = AStarSearchRenderer.helpers;
    var backgroundObject = helpers.getNodeStyle(graphProblem, options, node);
    var backgroundColor = backgroundObject["backgroundColor"];
    return (
      "<li " +
      'style="margin: 16px 16px 0 0; background-color:' +
      backgroundColor +
      ' ;"' +
      'class="graph-node pull-left" nodeKey="' + 
      node.id +
      '" id="' +
      node.id +
      'e">' +
      node.id + 
      "</li>"
    );
  },
  renderPriorityQueryNodeToString: function(graphProblem, options, node) {
    var helpers = AStarSearchRenderer.helpers;
    var backgroundObject = helpers.getNodeStyle(graphProblem, options, node);
    var backgroundColor = backgroundObject["backgroundColor"];
    return (
      "<tr>" +
      '<td><span style="background-color:' +
      backgroundColor +
      ' ;" ' +
      'class="graph-node" id="' +
      node.id +
      'p" nodeKey="' + 
      node.id +
      '">' +
      node.id +
      "</span></td>" +
      "<td><span>" +
      node.totalCost +
      "</span></td>" +
      "<td><span>" +
      node.cost +
      "</span></td>" +
      "<td><span>" +
      node.estimatedCost +
      "</span></td>" +
      "<td><span>" +
      node.depth +
      "</span></td>" +
      "</tr>"
    );
  }
};

var astar = new AStarSearchRenderer();
