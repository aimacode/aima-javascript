var nodeExpansionAgent= function(adjMatrix,initial){
  this.adjMatrix = adjMatrix;

  this.UNEXPLORED = 0;
  this.EXPANDABLE = 1;
  this.EXPLORED = 2;

  this.frontier = [initial];

  this.nodes = new Array(adjMatrix.length);
  for(var i=0;i < this.nodes.length; i++){
    this.nodes[i] = {
      state : this.UNEXPLORED
    };
  }
  this.nodes[initial] = {state:this.EXPANDABLE}
  this.getState = function(node){
    return this.nodes[node].state;
  };

  this.getNeighbors = function(node){
    var neighbors = []
    for(var i=0; i < this.adjMatrix[node] ; i++){
      if(this.adjMatrix[node][i]){
        neighbors.push(i);
      }
    }
    return neighbors;
  };

  this.expand = function(node){
    this.nodes[node].state = this.EXPLORED;
    //Remove node from the frontier
    this.frontier = this.frontier.filter(function(e){ return e!= node});
    for(var i=0;i < this.adjMatrix[node].length; i++){
      if(this.adjMatrix[node][i] == 1){
        neighbor = i;
        if(this.nodes[neighbor].state == this.UNEXPLORED){
          this.nodes[neighbor].state = this.EXPANDABLE;
          this.frontier.push(neighbor);
        }
      }
    }
  };

  this.getExpandables = function(){
    return this.frontier;
  }
};
