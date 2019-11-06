$(document).ready(function() {

  $.ajax({
    url : "minConflicts.js",
    dataType: "text",
    success : function (data) {
      $("#minConflictsCode").html(data);
    }
  });

}); 
