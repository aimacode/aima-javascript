


// Class for drawing graphs on the page
var visualGraph = function(canvas,h,w,agent,nodes,adjMatrix) {
  this.canvas = canvas;
  this.h = h;
  this.w = w;
  this.two = null;
  this.agent = agent;
  this.nodeRadius = 15;
  this.nodeGroups = [];
  this.edges = [];
  this.nodes = nodes;
  this.adjMatrix = adjMatrix;
  this.unvisitedColor = 'hsl(0, 2%, 76%)';
  this.frontierColor = 'hsl(200,50%,70%)';
  this.expandedColor = 'hsl(0,50%,75%)';
  this.extraDraw = null;
  this.extraIterate = null;

  this.drawCode = {
    0:{
      color:this.unvisitedColor
    },
    1:{
      color:this.frontierColor
    },
    2:{
      color:this.expandedColor
    }
  };

  this.init = function(){
    var self = this;
    this.canvas.innerHTML = '';
    this.two = new Two({height:h,width:w}).appendTo(canvas);
    //Draw edges first so they appear behind nodes.
    for(var i=0; i < this.adjMatrix.length; i++){
      for(var j=0; j< this.adjMatrix[i].length; j++){
        if(this.adjMatrix[i][j]){
          var line = this.two.makeLine(this.nodes[i].x,this.nodes[i].y,this.nodes[j].x , this.nodes[j].y);
          line.linewidth = 2;
          this.edges.push(line);
          this.two.update();
          $(line._renderer.elem).attr('nodesIndices',i+"_"+j)
        }
      }
    }
    //Draw Nodes

    for(var i = 0; i < this.nodes.length; i++){
      node = this.nodes[i];
      var circle = this.two.makeCircle(node.x,node.y,this.nodeRadius);
      circle.fill = this.drawCode[this.agent.getState(i)].color;
      var text = this.two.makeText(node.text,node.x,node.y);
      var group = this.two.makeGroup(circle,text);
      this.nodeGroups.push(group);
      this.two.update();
      $(group._renderer.elem).attr('nodeIndex',i);
      if(this.agent.getState(i) == 1){
        $(group._renderer.elem).css('cursor','pointer');
        group._renderer.elem.onclick = function(){
          index = $(this).attr('nodeIndex');
          self.agent.expand(index);
          self.iterate();
        }
      }
    }
    if(this.extraDraw){
      this.extraDraw();
    }
    this.two.update();
  };

  this.iterate = function(){
    var self = this;

    for(var i = 0; i < this.nodeGroups.length; i++){
      f_node = this.nodeGroups[i];
      node = this.nodes[i];
      state = this.agent.getState(i);
      f_node._collection[0].fill = this.drawCode[state].color;
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
    if(this.extraIterate){
      this.extraIterate();
    }
    this.two.update();
  };

};
