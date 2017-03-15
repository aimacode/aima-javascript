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
      this.frontierCanvas = document.getElementById('frontierCanvas');
      this.frontierCanvas.innerHTML = '';
      this.frontierTwo = new Two().appendTo(frontierCanvas);
      this.frontierNodes = this.agent.getExpandables();
      for(var i=0;i<this.frontierNodes.length;i++){
        node = this.nodes[this.frontierNodes[i]];
        var x = (i%4)*50+40;
        var y = (Math.floor(i/4))*50 + 20;
        var circle = this.frontierTwo.makeCircle(x,y,this.nodeRadius);
        var text = this.frontierTwo.makeText(node.text,x,y);
        circle.fill = this.drawCode[1].color;
      }
      this.frontierTwo.update();
    }

    visGraph.extraIterate = function(){
      this.frontierTwo.clear();
      this.frontierNodes = this.agent.getExpandables();
      for(var i=0;i<this.frontierNodes.length;i++){
        node = this.nodes[this.frontierNodes[i]];
        var x = (i%4)*50+40;
        var y = (Math.floor(i/4))*50 + 20;
        var circle = this.frontierTwo.makeCircle(x,y,this.nodeRadius);
        var text = this.frontierTwo.makeText(node.text,x,y);
        circle.fill = this.frontierColor;
      }
      this.frontierTwo.update();
    }


    visGraph.init();
    $('#legendExpanded').css('background-color',visGraph.expandedColor);
    $('#legendFrontier').css('background-color',visGraph.frontierColor);
    $('#legendUnexplored').css('background-color',visGraph.unvisitedColor);
  };
  $('#nodeRestartButton').click(init);
  init();
});
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
    canvas = document.getElementById('agentViewCanvas');
    agent = new nodeExpansionAgent(adjMatrix,Math.floor(Math.random()*15));
    visGraph = new visualGraph(canvas,h,w,agent,nodes,adjMatrix);
    visGraph.init = function(){
      var self = visGraph;
      visGraph.canvas.innerHTML = '';
      visGraph.two = new Two({height:h,width:w}).appendTo(canvas);
      //Draw edges first so they appear behind nodes.
      for(var i=0; i < visGraph.adjMatrix.length; i++){
        for(var j=0; j< visGraph.adjMatrix[i].length; j++){
          if(visGraph.adjMatrix[i][j]){
            var line = visGraph.two.makeLine(visGraph.nodes[i].x,visGraph.nodes[i].y,visGraph.nodes[j].x , visGraph.nodes[j].y);
            line.linewidth = 2;
            this.edges.push(line);
            visGraph.two.update();
            $(line._renderer.elem).attr('nodesIndices',i+"_"+j);

            if(visGraph.agent.getState(i) == 0 || visGraph.agent.getState(j) == 0){
              line.visible = false;
            }
          }
        }
      }
      //Draw Nodes

      for(var i = 0; i < visGraph.nodes.length; i++){
        node = visGraph.nodes[i];
        var circle = visGraph.two.makeCircle(node.x,node.y,visGraph.nodeRadius);
        circle.fill = visGraph.drawCode[visGraph.agent.getState(i)].color;
        var text = visGraph.two.makeText(node.text,node.x,node.y);
        var group = visGraph.two.makeGroup(circle,text);
        visGraph.nodeGroups.push(group);
        visGraph.two.update();
        $(group._renderer.elem).attr('nodeIndex',i);
        if(visGraph.agent.getState(i) == 0){
          group.visible = false;
        }
        if(visGraph.agent.getState(i) == 1){
          $(group._renderer.elem).css('cursor','pointer');
          group._renderer.elem.onclick = function(){
            index = $(this).attr('nodeIndex');
            self.agent.expand(index);
            self.iterate();
          }
        }
      }
      if(visGraph.extraDraw){
        visGraph.extraDraw();
      }
      visGraph.two.update();
    };

    visGraph.iterate = function(callback){
      var self = visGraph;

      for(var i = 0; i < visGraph.nodeGroups.length; i++){
        f_node = visGraph.nodeGroups[i];
        node = visGraph.nodes[i];
        state = visGraph.agent.getState(i);
        f_node._collection[0].fill = visGraph.drawCode[state].color;
        if(state > 0){
          f_node.visible = true;
        }
        if(state == 1){
          $(f_node._renderer.elem).css('cursor','pointer');
          f_node._renderer.elem.onclick = function(){
            index = $(this).attr('nodeIndex');
            self.agent.expand(index);
            self.iterate();
          }
        }else{
          f_node._renderer.elem.onclick = null;
        }
      }

      for(var i = 0;i < visGraph.edges.length;i++){
        edge = visGraph.edges[i];
        x = $(edge._renderer.elem).attr('nodesIndices');
        ar = x.split('_');
        a = ar[0];
        b = ar[1];
        if(visGraph.agent.getState(a) > 0 && visGraph.agent.getState(b) > 0){
          edge.visible = true;
        }else{
          edge.visible = false;
        }
      }


      visGraph.two.update();
    };


    visGraph.init();
  };
  $('#agentViewRestartButton').click(init);
  init();
});
