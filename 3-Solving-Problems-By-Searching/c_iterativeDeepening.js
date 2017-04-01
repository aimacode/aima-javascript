$(document).ready(function() {
  $.ajax({
    url: "iterativeDeepening.js",
    dataType: "text",
    success: function(data) {
      $("#iterativeDeepeningCode").html(data);
    }
  });
});
