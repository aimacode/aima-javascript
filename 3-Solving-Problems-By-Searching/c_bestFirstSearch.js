$(document).ready(function() {
  $.ajax({
    url: "bestFirstSearch.js",
    dataType: "text",
    success: function(data) {
      $("#bestFirstSearchCode").html(data);
    }
  });
});
