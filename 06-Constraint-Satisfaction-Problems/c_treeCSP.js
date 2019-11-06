$(document).ready(function(){
	$.ajax({
		url : "treeCSP.js",
		dataType: "text",
		success : function (data) {
			$("#treeCSPCode").html(data);
		}
	});
});
