// Code for Uniform Cost Search
var uniformCostSearch = function(frontier,costs){
  var minCost = costs[0];
  var minNode = 0;
  for(var i = 0; i < frontier.length; i++){
    if(costs[i] < minCost){
      minCost = costs[i];
      minNode = i;
    }
  }
  return minNode;
}
