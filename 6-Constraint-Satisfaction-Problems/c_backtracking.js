$(document).ready(function() {

  $.ajax({
    url : "backtracking.js",
    dataType: "text",
    success : function (data) {
      $("#backtrackingCode").html(data);
    }
  });

}); 
