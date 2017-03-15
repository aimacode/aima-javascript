$(document).ready(function(){
  var w = 600, h = 350;
  var initial = 0;
  var visGraph = null;
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

  function init(){
    canvas = document.getElementById('nodeExpansionCanvas');
    agent = new nodeExpansionAgent(adjMatrix,0);
    visGraph = new visualGraph(canvas,h,w,agent,nodes,adjMatrix);
    visGraph.extraDraw = function(){
      
    }
    visGraph.init();
    $('#legendExpanded').css('background-color',visGraph.expandedColor);
    $('#legendFrontier').css('background-color',visGraph.frontierColor);
    $('#legendUnexplored').css('background-color',visGraph.unvisitedColor);
  };
  $('#nodeRestartButton').click(init);
  init();
});
