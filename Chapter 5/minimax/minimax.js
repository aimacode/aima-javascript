'use strict';

/*
  ENTRY POINT for Minimax Decision Algorithm,
  Author: Raghav Dua
*/

requirejs (['../../scripts/utils'], function (utils) {

  //==============================================================================
  /*Minimax Search
    Calculate the best move from the given (current) state by searching
    all the way down to the terminal states
  */

  function minimaxDecision (state, game) {
    var player = game.toMove (state);
    return (utils.argmax (game.actions (state)), function (a) {
      return (minValue (game.result (state, a)));
    });

    function maxValue (state) {
      if (game.terminalTest (state)) {
        return (game.utility (state, player));
      }

      var v = -Infinity,
        possibleActions = game.actions (state);

      for (var a in possibleActions) {
        v = Math.max (v, minValue (game.result (state, possibleActions [a])));
      }

      return (v);
    }

    function minValue (state) {
      if (game.terminalTest (state)) {
        return (game.utility (state, player));
      }

      var v = Infinity,
        possibleActions = game.actions (state);

      for (var a in possibleActions) {
        v = Math.min (v, maxValue (game.result (state, possibleActions [a])));
      }

      return (v);
    }
  }
});
//==============================================================================
