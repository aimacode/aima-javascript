$(document).ready(function() {

  var agent = null;

  function init() {
    agent = new dlsDrawAgent('depthLimitedSearchCanvas');
    //Restart the simulation when limit is changed
    $('#limitSelector').on('input', function() {
      let limit = $(this).val();
      agent.iterate(limit);
    });
    //Draws graph for the first time
    agent.iterate($('#limitSelector').val());
  }


  $('#dlsExpanded').css('background-color', 'hsl(200,50%,70%)');
  $('#dlsFrontier').css('background-color', 'hsl(0,50%,75%)');
  $('#dlsUnexplored').css('background-color', 'hsl(0, 2%, 76%)');
  init();
  $('#limitSelector').on('input change', function() {
    $('#limitSelectorText').text($(this).val());
  });
});
