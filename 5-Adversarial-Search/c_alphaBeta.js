function P_ALPHA_BETA_SEARCH(state, STEP) {

	var largest_value = P_MAX_ALPHA_BETA_VALUE(state, 0, Number.MAX_SAFE_INTEGER, STEP-1);
	var action_list = actions(state);
	if (largest_value[1] ==  0)
		return;
	for (var action = 0; action < action_list.length; action++) {
		if  (largest_value[0] == abUtillity(RESULT(state, action_list[action]))) {
			abTree.lines[action].stroke = '#ff33cc';
			return action;
		}
	}
}
function P_MAX_ALPHA_BETA_VALUE(state, alpha, beta, STEP) {
	if (STEP == 0)
		return [0,0];
	if (terminal(state)) {
		abTree.triangles[state].fill = 'red';
		return [abUtillity(state), STEP];
	}
	abTree.triangles[state].fill = 'green';
	var v = 0;
	var al = actions(state);
	for (var i = 0; i < al.length; i++) {
		var r = P_MIN_ALPHA_BETA_VALUE(RESULT(state, al[i]), alpha, beta, STEP-1);
		if (r[1] == 0)
			return [0,0];
		STEP = r[1];
		v = Math.max(v, r[0]);
		if (v >= beta) {
			abTree.values[state].value = v;
			abTree.triangles[state].fill = 'red';
			abTree.nodes[state] = v;
			return [v, STEP];
		}
		alpha = Math.max(alpha, v);
	}
	STEP -= 1;
	if (STEP == 0)
		return [0,0];
	abTree.values[state].value = v;
	abTree.nodes[state] = v;
	abTree.triangles[state].fill = 'red';
	return [v, STEP];
}
function P_MIN_ALPHA_BETA_VALUE(state, alpha, beta, STEP) {
	if (STEP == 0)
		return [0,0];
	if (terminal(state)) {
		abTree.triangles[state].fill = 'red';
		return [abUtillity(state), STEP];
	}
	abTree.triangles[state].fill = 'green';
	var v = Number.MAX_SAFE_INTEGER;
	var al = actions(state);
	for (var i = 0; i < al.length; i++) {
		var r = P_MAX_ALPHA_BETA_VALUE(RESULT(state, al[i]), alpha, beta, STEP-1);
		if (r[1] == 0)
			return [0,0];
		STEP = r[1];
		v = Math.min(v, r[0]);
		if (v <= alpha){
			abTree.values[state].value = v;
			abTree.triangles[state].fill = 'red';
			abTree.nodes[state] = v;
			return [v, STEP];
		}
		beta = Math.min(beta, v);
	}
	STEP -= 1;
	if (STEP == 0)
		return [0,0];
	abTree.values[state].value = v;
	abTree.triangles[state].fill = 'red';
	abTree.nodes[state] = v;
	return [v, STEP];
}
function abUtillity(state) {
	return (abTree.nodes[state] == undefined ? 0 : abTree.nodes[state]);
};
var abTree = {
	slider : undefined,
	two : undefined,
	styles : {
		family: 'proxima-nova, sans-serif',
		size: 20,
		leading: 50,
		weight: 900
	},
	nodes : [],
	triangles : [],
	lines : [],
	values : [],
	input : undefined,
	defaultNodes : undefined,
	init : ()=> {
		//bind the progress slider to function
		abTree.slider = document.getElementById("alphaBetaProgress");
		abTree.slider.oninput = abTree.update;

		//bind the input box to the array
		abTree.input = document.getElementById("alphaBetaInput");
		
		var getInput = ()=> {
			var dd = abTree.input.value.match(/\d+/g);
			var ddd = [];
			for (var i = 0; i < 9; i++)
				ddd.push(((dd == null) || (i >= dd.length)) ? 0 : dd[i]);
			abTree.defaultNodes = [undefined, undefined, undefined, undefined].concat(ddd);
		};

		getInput();
		abTree.nodes = Object.assign([], abTree.defaultNodes);

		abTree.input.onblur = ()=> {
			getInput();
			abTree.fresh();
			abTree.two.update();
		}; 

		//set up and draw the graph
		var elem = document.getElementById('alphaBetaCanvas');
		var params = { width: 600, height: 400 };
		abTree.two = new Two(params).appendTo(elem);

		var depth = 1;
		var start = 0;
		var depth_nodes = 1;
		while(start < abTree.nodes.length) {
			for (var i = start; i < start + depth_nodes; i++) {
				var tri_x = (params.width/depth_nodes)*(i-start) + (params.width/depth_nodes/2);
				var tri_y = ((depth % 2 == 0) ? 100*depth-15 : 100*depth);
				var line_x_1 = (params.width/depth_nodes)*(i-start) + (params.width/depth_nodes/2);
				var line_y_1 = ((depth % 2 == 0) ? 100*depth-30 : 100*depth-30);
				var line_x_2 = (params.width/(depth_nodes/3))*(Math.floor((i-start)/3)) + (params.width/(depth_nodes/3)/2);
				var line_y_2 = line_y_1 - 55;
				abTree.triangles.push(abTree.two.makePolygon(tri_x, tri_y, 30, 3));
				if (depth != 1) abTree.lines.push(abTree.two.makeLine(line_x_1,line_y_1,line_x_2,line_y_2));
				abTree.values.push(abTree.two.makeText(abTree.nodes[i], tri_x, tri_y, abTree.styles));

				abTree.triangles[abTree.triangles.length-1].fill = '#FF8000';
				abTree.triangles[abTree.triangles.length-1].stroke = 'orangered';
				abTree.triangles[abTree.triangles.length-1].rotation = (depth-1) * Math.PI;
			}
			depth += 1;
			start += depth_nodes;
			depth_nodes *= 3;
		}
		abTree.two.update();
	},
	fresh : ()=> {
		var depth = 1;
		var start = 0;
		var depth_nodes = 1;
		abTree.nodes = Object.assign([], abTree.defaultNodes);
		while(start < abTree.nodes.length) {
			for (var i = start; i < start + depth_nodes; i++) {
				abTree.values[i].value = abTree.nodes[i];
				abTree.triangles[i].fill = '#FF8000';
				abTree.triangles[i].stroke = 'orangered';
				if (depth != 1) abTree.lines[i-1].stroke = 'black';
			}
			depth += 1;
			start += depth_nodes;
			depth_nodes *= 3;
		}
	},
	update : ()=> {
		abTree.fresh();	
		P_ALPHA_BETA_SEARCH(0, abTree.slider.value);
		abTree.two.update();

	}
};
$(document).ready(function(){
	$.ajax({
		url : "alphaBeta.js",
		dataType: "text",
		success : function (data) {
			$("#alphaBetaCode").html(data);
			abTree.init();
		}
	});
});