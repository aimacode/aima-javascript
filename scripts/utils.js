'use strict';

/*
  utilities for other scripts for algorithms from the book
  "Artificial Intelligence: A modern approach (3rd Ed.) by Russel & Norvig"
  Author: Raghav Dua
*/

(function () {
  var min, argmin, argmax, exportedVariables;

  /*
    min () is a python-like function which accepts a sequence followed by an evaluation function to return the minimum value in the sequence.
    evaluation function is not necessary. If not provided, we simple return Math.min (sequence)
  */
  min = function (sequence, evalFunc) {
    var minItem = null, minItemVal = Infinity;

    if (typeof evalFunc == 'undefined') {
      return (Math.min (sequence));
    }
    for (var i in sequence) {
      var currentItemVal = evalFunc (sequence [i]);
      minItem = currentItemVal < minItemVal ? sequence [i] : minItem;
      minItemVal = Math.min (currentItemVal, minItemVal);
    }
    return (minItem);
  }

  argmin = function (sequence, fn) { return (min (sequence, fn)); };
  argmax = function (sequence, fn) {
    fn = fn || function (i) { return (i); };
    return (min (sequence, function (i) {
      return (-fn (i));
    }));
  };

  /*
    Below is the object being exposed.
    Assuming that you call utils.js Utils upon importing it, usage is:

    1. Utils.argmax ([10, 20, 30]); ==> 30
    2. Utils.argmin (['hello', 'world', '!'], function (i) { return (i.length); });  ==> '!'
  */

  exportedVariables = {
    argmin: argmin,
    argmax: argmax
  };

  (function(root, factory) {
    return (typeof define === 'function' && define.amd ? define([], factory) : null);
  }) (this, function() {
    return (exportedVariables);
  });

}).call (this);
