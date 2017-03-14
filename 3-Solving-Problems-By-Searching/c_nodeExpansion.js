$(document).ready(function(){
  var two,frontierTwo,canvas,frontierCanvas;
  var w = 600, h = 350;
  var initial = 0;

  var unvisitedColor = 'hsl(0, 2%, 76%)';
  var frontierColor = 'hsl(200,50%,70%)';
  var expandedColor = 'hsl(0,50%,75%)';
  var nodeRadius = 15;
  var nodes = [
    {x:50,y:100,text:"A"},
    {x:20,y:150,text:"B"},
    {x:75,y:180,text:"C"},
    {x:100,y:100,text:"D"},
    {x:230,y:100,text:"E"},
    {x:180,y:160,text:"F"},
    {x:70,y:300,text:"G"},
    {x:120,y:240,text:"H"},
    {x:300,y:150,text:"I"},
    {x:280,y:250,text:"J"},
    {x:400,y:220,text:"K"},
    {x:200,y:280,text:"L"},
    {x:380,y:100,text:"M"},
    {x:350,y:300,text:"N"},
    {x:450,y:320,text:"O"}
  ];
  var adjMatrix = [
  // a,b,c,d,e,f,g,h,i,j,k,l,m,n,o
    [0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,1,0,0,1,1,0,0,0,0,0,0,0],
    [1,0,1,0,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,0,0,1,0,0,0,0,1,1,0,1,0,0],
    [0,0,0,0,0,1,0,0,1,0,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,0,0,0,0,0,0,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0]
  ];

  var nodeGroups = [];

  function getColor(state){
    if(state == 0){
      return unvisitedColor;
    }
    if(state == 1){
      return frontierColor;
    }
    return expandedColor;
  }

  function iterateGraph(){
    for(var i = 0; i < nodeGroups.length; i++){
      f_node = nodeGroups[i];
      node = nodes[i];
      state = problem.getState(i);
      f_node._collection[0].fill = getColor(state);
      if(state == 1){
        $(f_node._renderer.elem).css('cursor','pointer');
        f_node._renderer.elem.onclick = function(){
          index = $(this).attr('nodeIndex');
          problem.expand(index);
          iterateGraph();
        }
      }else{
        f_node._renderer.elem.onclick = null;
      }
    }
    frontierTwo.clear();
    var frontierNodes = problem.getExpandables();
    for(var i=0;i<frontierNodes.length;i++){
      node = nodes[frontierNodes[i]];
      var x = (i%4)*50+40;
      var y = (Math.floor(i/4))*50 + 20;
      var circle = frontierTwo.makeCircle(x,y,nodeRadius);
      var text = frontierTwo.makeText(node.text,x,y);
      circle.fill = frontierColor;
    }
    frontierTwo.update();
    two.update();
  }
  function drawGraph(){
    //Draw Edges
    for(var i=0; i < adjMatrix.length; i++){
      for(var j=0; j< adjMatrix[i].length; j++){
        if(adjMatrix[i][j]){
          var line = two.makeLine(nodes[i].x,nodes[i].y,nodes[j].x , nodes[j].y);
          $(line._renderer.elem).attr('nodesIndices',i+"_"+j)
          line.linewidth = 2;
        }
      }
    }
    //Draw Nodes
    for(var i = 0; i < nodes.length; i++){
      node = nodes[i];
      var circle = two.makeCircle(node.x,node.y,nodeRadius);
      circle.fill = getColor(problem.getState(i));
      var text = two.makeText(node.text,node.x,node.y);
      var group = two.makeGroup(circle,text);
      nodeGroups.push(group);
      two.update();
      $(group._renderer.elem).attr('nodeIndex',i);
      if(problem.getState(i) == 1){
        $(group._renderer.elem).css('cursor','pointer');
        group._renderer.elem.onclick = function(){
          index = $(this).attr('nodeIndex');
          problem.expand(index);
          iterateGraph();
        }
      }
    }
    //Draw nodes in frontier block
    frontierCanvas = document.getElementById('frontierCanvas');
    frontierCanvas.innerHTML = '';
    frontierTwo = new Two().appendTo(frontierCanvas);
    var frontierNodes = problem.getExpandables();
    for(var i=0;i<frontierNodes.length;i++){
      node = nodes[frontierNodes[i]];
      var x = (i%4)*50+40;
      var y = (Math.floor(i/4))*50 + 20;
      var circle = frontierTwo.makeCircle(x,y,nodeRadius);
      var text = frontierTwo.makeText(node.text,x,y);
      circle.fill = frontierColor;
    }
    frontierTwo.update();
  }

  function init(){
    canvas = document.getElementById('nodeExpansionCanvas');
    canvas.innerHTML = '';
    nodeGroups = [];
    two = new Two({height:h,width:w}).appendTo(canvas);
    problem = new nodeExpansionProblem(adjMatrix,0);
    $('#legendExpanded').css('background-color',expandedColor);
    $('#legendFrontier').css('background-color',frontierColor);
    $('#legendUnexplored').css('background-color',unvisitedColor);
    drawGraph();
  };
  $('#nodeRestartButton').click(init);
  init();
});
