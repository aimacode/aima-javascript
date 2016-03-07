/*
  Some statements to test the functionality provided by utils.js
  Assuming that we have imported utils.js into this script with name utils

  Author: Raghav Dua
*/

console.log (utils.argmax ([1,2,1.5,1.7,2.1], function (i) { return ( i*Math.random()); }));
console.log (utils.argmin (['hello', 'world', '!'], function (i) { return (i.length); }));
