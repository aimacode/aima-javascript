$(document).ready(function() {
  $.ajax({
    url: "aStarSearch.js",
    dataType: "text",
    success: function(data) {
      $("#aStarSearchCode").html(data);
    }
  });

});
