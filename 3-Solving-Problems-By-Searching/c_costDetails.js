$(document).ready(function() {
  var w = 600,
    h = 350;
  var costVisGraph = null;
  var noCostVisGraph = null;
  var agent = null;
  var initial = 0;
  var costCanvas = null;
  var costDetailCanvas = null;
  var noCostCanvas = null;
  var noCostDetailCanvas = null;
  var costDetailListTwo = null;
  var noCostDetailListTwo = null;

  var DELAY = 2000;
  var markNodeColor = 'hsl(108, 96%, 80%)';
  var markEdgeColor = 'hsla(179, 100%, 38%, 1)';
  var detailColor = 'hsla(179, 100%, 38%, 1)';


  function init() {
    costCanvas = document.getElementById('costGraphCanvas');
    noCostCanvas = document.getElementById('no-costGraphCanvas');
    costDetailCanvas = document.getElementById('lowestCostDetailCanvas');
    noCostDetailCanvas = document.getElementById('bfsCostDetailCanvas');
    graph = new makeDefaultGraph();
    agent = new nodeExpansionAgent(graph.adjMatrix, initial);
    costVisGraph = new drawGraph(costCanvas, h, w, agent, graph.nodes, graph.adjMatrix, true);
    noCostVisGraph = new drawGraph(noCostCanvas, h, w, agent, graph.nodes, graph.adjMatrix, true);
    costDetailListTwo = new Two({
      height: h,
      width: w
    }).appendTo(costDetailCanvas);
    noCostDetailListTwo = new Two({
      height: h,
      width: w
    }).appendTo(noCostDetailCanvas);

    costVisGraph.init();
    noCostVisGraph.init();
    costVisGraph.iterate();
    noCostVisGraph.iterate();
    var findPath = function(final) {
      //Cost graph
      ucs = true;
      pathObj = findShortestPath(graph.adjMatrix, final, initial, ucs);
      for (var i = 0; i < pathObj.path.length; i++) {
        costVisGraph.nodeGroups[pathObj.path[i].node].children[0].fill = markNodeColor;
      }
      for (var i = 0; i < pathObj.path.length - 1; i++) {
        var line = costVisGraph.edgeMap[pathObj.path[i].node + '_' + pathObj.path[i + 1].node];
        line.stroke = markEdgeColor;
        line.linewidth = 6;
      }
      costVisGraph.two.update();
      //Cost path Detail
      costDetailListTwo.clear();
      for (var i = 0; i < pathObj.path.length - 1; i++) {
        var node1 = graph.nodes[pathObj.path[i].node];
        var node2 = graph.nodes[pathObj.path[i + 1].node];
        var cost = graph.adjMatrix[pathObj.path[i].node][pathObj.path[i + 1].node];
        var x1 = i * 70 + 20;
        var x2 = (i + 1) * 70 + 20;
        var y = 35;
        var line = costDetailListTwo.makeLine(x1, y, x2, y);
        line.linewidth = 2;
        var midx = (x1 + x2) / 2;
        costDetailListTwo.makeText(cost, midx, y - 10);
      }
      var lastText = null;
      for (var i = 0; i < pathObj.path.length; i++) {
        node = graph.nodes[pathObj.path[i].node];
        cost = pathObj.path[i].cost;
        var x = (i) * 70 + 20;
        var y = 35;
        var rectangle = costDetailListTwo.makeRectangle(x, y, 25, 25);
        rectangle.fill = markNodeColor;
        costDetailListTwo.makeText(node.text, x, y);
        lastText = costDetailListTwo.makeText(cost, x, y + 30);
      }
      lastText.size = 25;
      lastText.stroke = 'hsla(210, 100%, 51%, 1)';
      costDetailListTwo.update();

      //Bfs Graph
      ucs = false
      pathObj = findShortestPath(graph.adjMatrix, final, initial, ucs);
      for (var i = 0; i < pathObj.path.length; i++) {
        noCostVisGraph.nodeGroups[pathObj.path[i].node].children[0].fill = markNodeColor;
      }
      for (var i = 0; i < pathObj.path.length - 1; i++) {
        var line = noCostVisGraph.edgeMap[pathObj.path[i].node + '_' + pathObj.path[i + 1].node];
        line.stroke = markEdgeColor;
        line.linewidth = 6;
      }
      noCostVisGraph.two.update();

      //bfs path detail
      noCostDetailListTwo.clear();
      for (var i = 0; i < pathObj.path.length - 1; i++) {
        var node1 = graph.nodes[pathObj.path[i].node];
        var node2 = graph.nodes[pathObj.path[i + 1].node];
        var cost = graph.adjMatrix[pathObj.path[i].node][pathObj.path[i + 1].node];
        var x1 = i * 70 + 20;
        var x2 = (i + 1) * 70 + 20;
        var y = 35;
        var line = noCostDetailListTwo.makeLine(x1, y, x2, y);
        line.linewidth = 2;
        var midx = (x1 + x2) / 2;
        noCostDetailListTwo.makeText(cost, midx, y - 10);
      }
      var lastText = null;
      for (var i = 0; i < pathObj.path.length; i++) {
        node = graph.nodes[pathObj.path[i].node];
        cost = pathObj.path[i].cost;
        var x = (i) * 70 + 20;
        var y = 35;
        var rectangle = noCostDetailListTwo.makeRectangle(x, y, 25, 25);
        rectangle.fill = markNodeColor;
        noCostDetailListTwo.makeText(node.text, x, y);
        lastText = noCostDetailListTwo.makeText(cost, x, y + 30);
      }
      lastText.size = 25;
      lastText.stroke = 'hsla(210, 100%, 51%, 1)';
      noCostDetailListTwo.update();

    };



    var onMouseEnterHandler = function() {
      findPath(parseInt($(this).attr('nodeIndex')));
    };
    var onMouseLeaveHandler = function() {
      costVisGraph.iterate();
      costDetailListTwo.clear();
      costDetailListTwo.update();
      noCostVisGraph.iterate();
      noCostDetailListTwo.clear();
      noCostDetailListTwo.update();
    };

    for (var i = 0; i < costVisGraph.nodeGroups.length; i++) {
      var edgeElement1 = costVisGraph.nodeGroups[i]._renderer.elem;
      var edgeElement2 = noCostVisGraph.nodeGroups[i]._renderer.elem;

      $(edgeElement1).css('cursor', 'pointer');
      $(edgeElement2).css('cursor', 'pointer');
      edgeElement1.onmouseenter = onMouseEnterHandler;
      edgeElement1.onmouseleave = onMouseLeaveHandler;
      edgeElement2.onmouseenter = onMouseEnterHandler;
      edgeElement2.onmouseleave = onMouseLeaveHandler;
    }
    costVisGraph.two.update();
  };

  init();
});
