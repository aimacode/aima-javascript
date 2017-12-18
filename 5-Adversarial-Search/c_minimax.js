function P_MAX_DECISION(state, STEP) {
	if (STEP == 0)
		return [0,0];
	var action_list = actions(state);
	var final_action = 0;
	var largest_value = 0;
	for (var action = 0; action < action_list.length; action++){
		var res = P_MIN_VALUE(RESULT(state, action_list[action]), STEP-1);
		if (res[1] == 0)
			return;
		STEP = res[1];
		if  (largest_value < res[0]) {
			largest_value = res[0];
			final_action = action;
		}
	}
	STEP -= 1;
	if (STEP == 0)
		return;
	mmTree.triangles[state].fill = '#003399';
	mmTree.values[state].value = largest_value;
	mmTree.values[state].stroke = 'black';
	mmTree.values[state].fill = 'white';
	mmTree.lines[final_action].stroke = '#ff5050';
	return final_action;
}
function P_MAX_VALUE(state, STEP) {
	if (STEP == 0)
		return [0,0];
	if (terminal(state)) {
		mmTree.triangles[state].fill = '#003399';
		mmTree.values[state].stroke = 'black';
		mmTree.values[state].fill = 'white';
		return [utillity(state), STEP];
	}
	mmTree.triangles[state].fill = '#80aaff';
	var v = 0;
	var al = actions(state);
	for (var i = 0; i < al.length; i++) {
		var r = P_MAX_VALUE(RESULT(state, al[i]), STEP-1);
		if (r[1] == 0)
			return [0,0];
		STEP = r[1];
		if (v < +r[0]) {
			a = i;
			v = +r[0];
		}
	}
	STEP -= 1;
	if (STEP == 0)
		return [0,0];
	//mmTree.lines[RESULT(state, al[a])-1].stroke = '#ff33cc';
	mmTree.lines[RESULT(state, al[a])-1].stroke = '#ff5050';
	mmTree.values[state].value = v;
	mmTree.triangles[state].fill = '	#003399';
	mmTree.values[state].stroke = 'black';
	mmTree.values[state].fill = 'white';
	//mmTree.lines[state].stroke = '#ff33cc';
	return [v, STEP];
}
function P_MIN_VALUE(state, STEP) {
	if (STEP == 0)
		return [0,0];
	if (terminal(state)) {
		mmTree.triangles[state].fill = '	#003399';
		mmTree.values[state].stroke = 'black';
		mmTree.values[state].fill = 'white';
		return [utillity(state), STEP];
	}
	mmTree.triangles[state].fill = '#80aaff';
	var v = Number.MAX_SAFE_INTEGER;
	var al = actions(state);
	var a = 0;
	for (var i = 0; i < al.length; i++) {
		var r = P_MAX_VALUE(RESULT(state, al[i]), STEP-1);
		if (r[1] == 0)
			return [0,0];
		STEP = r[1];
		if (v > +r[0]) {
			a = i;
			v = +r[0];
		}
	}
	STEP -= 1;
	if (STEP == 0)
		return [0,0];
	//mmTree.lines[RESULT(state, al[a])-1].stroke = '#ff33cc';
	mmTree.lines[RESULT(state, al[a])-1].stroke = '#ff5050';
	mmTree.values[state].value = v;
	mmTree.triangles[state].fill = '	#003399';
	mmTree.values[state].stroke = 'black';
	mmTree.values[state].fill = 'white';
	return [v, STEP];
}
function terminal(state) {
	/*
		checks to see if the children of the node is out of bounds
		NOTE: the tree is implemented as an array for this example, as such it only works on full trees
	*/
	if (state*3+1 > mmTree.nodes.length-1)
		return true;
	else
		return false;
};
function utillity(state) {
	return (mmTree.nodes[state] == undefined ? 0 : mmTree.nodes[state]);
};
function actions(state) {
	/*
		returns a list of actions
		NOTE: this implementation always has 3 actions, left, middle, right.
	*/
	return ["left", "middle", "right"];
};
function RESULT(s, a) {
	switch(a) {
		case "left": return s*3+1;
		case "middle": return s*3+2;
		case "right": return s*3+3;
	}
};
var mmTree = {
	on : true,
	toggle : undefined,
	slider : undefined,
	two : undefined,
	styles : {
		family: 'proxima-nova, sans-serif',
		size: 20,
		leading: 50,
		weight: 900,
		stroke: 'none',
		fill: 'black'
	},
	nodes : [],
	triangles : [],
	lines : [],
	values : [],
	input : undefined,
	defaultNodes : undefined,
	init : ()=> {
		//bind the progress slider to function
		mmTree.slider = document.getElementById("minimaxProgress");
		mmTree.slider.oninput = ()=> {
			mmTree.on = false;
			mmTree.toggle.textContent = "Start Simulation";
			mmTree.update();
		}
		mmTree.slider.value = 1;
		setInterval(()=> {
			if (mmTree.on == false)
				return;
			if (mmTree.slider.value == 17)
				mmTree.slider.value = 1;
			else
				mmTree.slider.value = +mmTree.slider.value + 1;
			mmTree.update();
		}, 1000);

		//bind the on/off buton
		mmTree.toggle = document.getElementById("minimaxToggle");
		mmTree.toggle.onclick = ()=> {
			if (mmTree.on == true){
				mmTree.on = false;
				mmTree.toggle.textContent = "Start Simulation";
			}
			else {
				mmTree.on = true;
				mmTree.toggle.textContent = "Stop Simulation";
			}
		};

		//bind the input box to the array
		mmTree.input = document.getElementById("minimaxInput");
		
		var getInput = ()=> {
			var dd = mmTree.input.value.match(/\d+/g);
			var ddd = [];
			for (var i = 0; i < 9; i++)
				ddd.push(((dd == null) || (i >= dd.length)) ? 0 : dd[i]);
			mmTree.defaultNodes = [undefined, undefined, undefined, undefined].concat(ddd);
			mmTree.nodes = mmTree.defaultNodes;
		};

		getInput();

		mmTree.input.onblur = ()=> {
			mmTree.slider.value = 1;
			getInput();
			mmTree.two.update();
		}; 

		//set up and draw the graph
		var elem = document.getElementById('minimaxCanvas');
		var params = { width: 800, height: 400 };
		mmTree.two = new Two(params).appendTo(elem);

		var depth = 1;
		var start = 0;
		var depth_nodes = 1;
		while(start < mmTree.nodes.length) {
			for (var i = start; i < start + depth_nodes; i++) {
				var tri_x = ((params.width-200)/depth_nodes)*(i-start) + ((params.width-200)/depth_nodes/2);
				var tri_y = ((depth % 2 == 0) ? 100*depth-15 : 100*depth);
				var line_x_1 = ((params.width-200)/depth_nodes)*(i-start) + ((params.width-200)/depth_nodes/2);
				var line_y_1 = ((depth % 2 == 0) ? 100*depth-30 : 100*depth-30);
				var line_x_2 = ((params.width-200)/(depth_nodes/3))*(Math.floor((i-start)/3)) + ((params.width-200)/(depth_nodes/3)/2);
				var line_y_2 = line_y_1 - 55;
				mmTree.triangles.push(mmTree.two.makePolygon(tri_x, tri_y, 30, 3));
				if (depth != 1) mmTree.lines.push(mmTree.two.makeLine(line_x_1,line_y_1,line_x_2,line_y_2));
				mmTree.values.push(mmTree.two.makeText(((mmTree.nodes[i] != undefined) ? mmTree.nodes[i] : " "), tri_x, tri_y, mmTree.styles));

				mmTree.triangles[mmTree.triangles.length-1].stroke = 'none';
				mmTree.triangles[mmTree.triangles.length-1].fill = '#ccddff';
				mmTree.triangles[mmTree.triangles.length-1].rotation = (depth-1) * Math.PI;
			}
			depth += 1;
			start += depth_nodes;
			depth_nodes *= 3;
		}
		mmTree.two.makeText("maximize", 700, 100, mmTree.styles);
		mmTree.two.makeText("minimize", 700, 200, mmTree.styles);
		mmTree.two.update();
	},
	fresh : ()=> {
		var depth = 1;
		var start = 0;
		var depth_nodes = 1;
		while(start < mmTree.nodes.length) {
			for (var i = start; i < start + depth_nodes; i++) {
				mmTree.values[i].value = (mmTree.nodes[i] != undefined ? mmTree.nodes[i] : " ");
				mmTree.values[i].fill = 'black';
				mmTree.values[i].stroke = 'none';
				mmTree.triangles[i].fill = '#ccddff';
				if (depth != 1) mmTree.lines[i-1].linewidth = 1;
				if (depth != 1) mmTree.lines[i-1].stroke = 'black';
			}
			depth += 1;
			start += depth_nodes;
			depth_nodes *= 3;
		}
	},
	update : ()=> {
		mmTree.fresh();
		P_MAX_DECISION(0, mmTree.slider.value);
		mmTree.two.update();

	}
};
$(document).ready(function(){
	mmTree.init();
});