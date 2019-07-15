$(document).ready(function() {
  var DELAY = 2000;
  var intervalFunction = null;

  //Restart the simulation when limit is changed
  function init() {
    agent = new dlsDrawAgent('iterativeDeepeningCanvas');
    //Restart the simulation when limit is changed
    $('#idlimitSelector').change(function() {
      let limit = $(this).val();
      agent.iterate(limit);
    });
    //Draws graph for the first time
    agent.iterate($('#idlimitSelector').val());

    intervalFunction = setInterval(function() {
      let limit = parseInt($('#idlimitSelector').val());
      if (limit <= 4) {
        $('#idlimitSelector').val(limit + 1);
        $('#idlimitSelector').trigger('change');
      } else {
        clearInterval(intervalFunction, DELAY);
      }
    }, DELAY)
  }

  $('#idExpanded').css('background-color', 'hsl(200,50%,70%)');
  $('#idFrontier').css('background-color', 'hsl(0,50%,75%)');
  $('#idUnexplored').css('background-color', 'hsl(0, 2%, 76%)');
  $('#idRestartButton').click(function() {
    clearInterval(intervalFunction);
    $('#idlimitSelector').val(0);
    $('#idlimitSelector').trigger('change');
    init();
  });
  init();
  $('#idlimitSelector').on('input change', function() {
    $('#idlimitSelectorText').text($(this).val());
  });
});
