//==============================================================================
/*
  To define how your game would behave, use the template provided below

  Once defined, to create a new Game Object, use:
  var myGame = new Game ();

  then, assuming you are at a state currentState, use minimax as:
  minimaxDecision (currentState, game);

  Author: Raghav Dua
*/

var Game = function () {};
Game.prototype.actions = function (state) {
  //Return an Array of allowable moves from the state provided
};
Game.prototype.result = function (state, move) {
  //Return the new state that results from making a move from the current state
};
Game.prototype.utility = function (state, player) {
  //Return the value of this final state to player
};
Game.prototype.terminalTest = function (state) {
  //Return True if this is the final state, i.e., no more actions can take place, False otherwise
  return (!this.actions (state));
};
Game.prototype.toMove = function (state) {
  //Return the player whose move it is in the given state
  return (state.toMove);
};
Game.prototype.display = function (state) {
  //Print / Display the given state
  console.log (state);
};

//==============================================================================
