$(document).ready(function() {
  $.ajax({
    url: "depthLimitedSearch.js",
    dataType: "text",
    success: function(data) {
      $("#depthLimitedSearchCode").html(data);
    }
  });
});
