function P_ALPHA_BETA_SEARCH(state, STEP) {

	var largest_value = P_MAX_ALPHA_BETA_VALUE(state, 0, Number.MAX_SAFE_INTEGER, STEP-1);
	var action_list = actions(state);
	if (largest_value[1] ==  0)
		return [-1,largest_value[1]];
	for (var action = 0; action < action_list.length; action++) {
		if  (largest_value[0] == abUtillity(RESULT(state, action_list[action]))) {
			abTree.lines[action].stroke = '#ff33cc';
			return [action, largest_value[1]];
		}
	}
	return [-1,largest_value[1]];
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
	on : true,
	toggle : undefined,
	slider : undefined,
	range : 0,
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
		abTree.slider.oninput = ()=> {
			abTree.on = false;
			abTree.toggle.textContent = "Start Simulation";
			abTree.update();
		}
		abTree.slider.value = 1;
		setInterval(()=> {
			if (abTree.on == false)
				return;
			if (abTree.slider.value == abTree.range)
				abTree.slider.value = 1;
			else
				abTree.slider.value = +abTree.slider.value + 1;
			abTree.update();
		}, 1000);

		//bind the on/off buton
		abTree.toggle = document.getElementById("alphaBetaToggle");
		abTree.toggle.onclick = ()=> {
			if (abTree.on == true){
				abTree.on = false;
				abTree.toggle.textContent = "Start Simulation";
			}
			else {
				abTree.on = true;
				abTree.toggle.textContent = "Stop Simulation";
			}
		};

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

		var resetRange = ()=> {
			var res = P_ALPHA_BETA_SEARCH(0, -1);
			abTree.slider.max = Math.abs(res[1]);
			abTree.range = Math.abs(res[1]);
		}
		abTree.input.onblur = ()=> {
			abTree.slider.value = 1;
			getInput();
			abTree.update();
			abTree.fresh();
			resetRange();
		}; 

		//set up and draw the graph
		var elem = document.getElementById('alphaBetaCanvas');
		var params = { width: 800, height: 400 };
		abTree.two = new Two(params).appendTo(elem);

		var depth = 1;
		var start = 0;
		var depth_nodes = 1;
		while(start < abTree.nodes.length) {
			for (var i = start; i < start + depth_nodes; i++) {
				var tri_x = ((params.width-200)/depth_nodes)*(i-start) + ((params.width-200)/depth_nodes/2);
				var tri_y = ((depth % 2 == 0) ? 100*depth-15 : 100*depth);
				var line_x_1 = ((params.width-200)/depth_nodes)*(i-start) + ((params.width-200)/depth_nodes/2);
				var line_y_1 = ((depth % 2 == 0) ? 100*depth-30 : 100*depth-30);
				var line_x_2 = ((params.width-200)/(depth_nodes/3))*(Math.floor((i-start)/3)) + ((params.width-200)/(depth_nodes/3)/2);
				var line_y_2 = line_y_1 - 55;
				abTree.triangles.push(abTree.two.makePolygon(tri_x, tri_y, 30, 3));
				if (depth != 1) abTree.lines.push(abTree.two.makeLine(line_x_1,line_y_1,line_x_2,line_y_2));
				abTree.values.push(abTree.two.makeText(((abTree.nodes[i] != undefined) ? abTree.nodes[i] : " "), tri_x, tri_y, mmTree.styles));

				abTree.triangles[abTree.triangles.length-1].fill = '#FF8000';
				abTree.triangles[abTree.triangles.length-1].stroke = 'orangered';
				abTree.triangles[abTree.triangles.length-1].rotation = (depth-1) * Math.PI;
			}
			depth += 1;
			start += depth_nodes;
			depth_nodes *= 3;
		}
		abTree.two.makeText("maximize", 700, 100, mmTree.styles);
		abTree.two.makeText("minimize", 700, 200, mmTree.styles);
		abTree.two.update();

		//set up the slider range based on how the thing will run
		resetRange();
	},
	fresh : ()=> {
		var depth = 1;
		var start = 0;
		var depth_nodes = 1;
		abTree.nodes = Object.assign([], abTree.defaultNodes);
		while(start < abTree.nodes.length) {
			for (var i = start; i < start + depth_nodes; i++) {
				abTree.values[i].value = (abTree.nodes[i] != undefined ? abTree.nodes[i] : " ");
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
	abTree.init();
});