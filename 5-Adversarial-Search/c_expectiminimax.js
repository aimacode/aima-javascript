var chance_values = [];
function P_EXPECT_MAX_DECISION(state, STEP) {
	if (STEP == 0)
		return [0,0];
	var action_list = expect_actions(state);
	var final_action = 0;
	var largest_value = 0;
	for (var action = 0; action < action_list.length; action++){
		var res = P_EXPECT_MAX_VALUE(EXPECT_RESULT(state, action_list[action]), STEP-1);
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
	if(state >= 3 && state <= 6){
		chance_values[state-3] = largest_value;
	}
	emmtree.triangles[state].fill = '#003399';
	if(state == 1 || state == 2){
		if(state == 1) temp = 11;
		else temp = 21;
		emmtree.values[state].value = P_EXPECTED_DECISION(temp);	
	}
	else if(state == 0){
		emmtree.values[state].value = Math.max(chance_values[4], chance_values[5]);	
	}
	else{
	emmtree.values[state].value = largest_value;	
	}
	emmtree.values[state].stroke = 'black';
	emmtree.values[state].fill = 'white';
	emmtree.lines[final_action].stroke = '#ff5050';
	return final_action;
}
function P_EXPECT_MAX_VALUE(state, STEP) {
	if (STEP == 0)
		return [0,0];
	if (expect_terminal(state)) {
		emmtree.triangles[state].fill = '#003399';
		emmtree.values[state].stroke = 'black';
		emmtree.values[state].fill = 'white';
		return [expect_utitillity(state), STEP];
	}
	emmtree.triangles[state].fill = '#80aaff';
	var v = 0;
	var al = expect_actions(state);
	for (var i = 0; i < al.length; i++) {
		var r = P_EXPECT_MIN_VALUE(EXPECT_RESULT(state, al[i]), STEP-1);
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

	if(state >= 3 && state <= 6){
		chance_values[state-3] = v;
	}
	emmtree.lines[EXPECT_RESULT(state, al[a])-1].stroke = '#ff5050';
	if(state == 1 || state == 2){
		if(state == 1) temp = 11;
		else temp = 21;
		emmtree.values[state].value = P_EXPECTED_DECISION(temp);	
	}
	else if(state == 0){
		emmtree.values[state].value = Math.max(chance_values[4], chance_values[5]);	
	}
	else{
	emmtree.values[state].value = v;	
	}
	emmtree.triangles[state].fill = '#003399';
	emmtree.values[state].stroke = 'black';
	emmtree.values[state].fill = 'white';
	return [v, STEP];
}
function P_EXPECT_MIN_VALUE(state, STEP) {
	if (STEP == 0)
		return [0,0];
	if (expect_terminal(state)) {
		emmtree.triangles[state].fill = '#003399';
		emmtree.values[state].stroke = 'black';
		emmtree.values[state].fill = 'white';
		return [expect_utitillity(state), STEP];
	}
	emmtree.triangles[state].fill = '#80aaff';
	var v = Number.MAX_SAFE_INTEGER;
	var al = expect_actions(state);
	var a = 0;
	for (var i = 0; i < al.length; i++) {
		var r = P_EXPECT_MIN_VALUE(EXPECT_RESULT(state, al[i]), STEP-1);
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
	
	if(state >= 3 && state <= 6){
		chance_values[state-3] = v;
	}
	emmtree.lines[EXPECT_RESULT(state, al[a])-1].stroke = '#ff5050';
	if(state == 1 || state == 2){
		if(state == 1) temp = 11;
		else temp = 21;
		emmtree.values[state].value = P_EXPECTED_DECISION(temp);	
	}
	else if(state == 0){
		emmtree.values[state].value = Math.max(chance_values[4], chance_values[5]);	
	}
	else{
	emmtree.values[state].value = v;	
	}
	emmtree.triangles[state].fill = '#003399';
	emmtree.values[state].stroke = 'black';
	emmtree.values[state].fill = 'white';
	return [v, STEP];
}

function P_EXPECTED_DECISION(STEP){
	var value = 0;
	if(STEP == 11){
		value = emmtree.chanceNodes[0]*chance_values[0] + emmtree.chanceNodes[1]*chance_values[1];
		chance_values.push(value); 
	}
	else if(STEP == 21){
		value = emmtree.chanceNodes[2]*chance_values[2] + emmtree.chanceNodes[3]*chance_values[3];
		chance_values.push(value); 
	}
	return value;
}

function expect_terminal(state) {
	/*
		checks to see if the children of the node is out of bounds
		NOTE: the tree is implemented as an array for this example, as such it only works on full trees
	*/
	if (state*2+1 > emmtree.nodes.length-1)
		return true;
	else
		return false;
};
function expect_utitillity(state) {
	return (emmtree.nodes[state] == undefined ? 0 : emmtree.nodes[state]);
};
function expect_actions(state) {
	/*
		returns a list of expect_actions
		NOTE: this implementation has 2 expect_actions, left, right.
	*/
	return ["left", "right"];
};
function EXPECT_RESULT(s, a) {
	switch(a) {
		case "left": return s*2+1;
		case "right": return s*2+2;
	}
};
var emmtree = {
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
	chanceNodes : [],
	triangles : [],
	lines : [],
	values : [],
	//chanceValues : [],
	input : undefined,
	defaultNodes : undefined,
	init : ()=> {
		//bind the progress slider to function
		emmtree.slider = document.getElementById("expectiminimaxProgress");
		emmtree.slider.oninput = ()=> {
			emmtree.on = false;
			emmtree.toggle.textContent = "Start Simulation";
			emmtree.update();
		}
		emmtree.slider.value = 1;
		setInterval(()=> {
			if (emmtree.on == false)
				return;
			if (emmtree.slider.value == 22){
				//alert("i ran");
				emmtree.slider.value = 1;
			}
			else
				emmtree.slider.value = +emmtree.slider.value + 1;
			emmtree.update();
		}, 1000);

		//bind the on/off buton
		emmtree.toggle = document.getElementById("expectiminimaxToggle");
		emmtree.toggle.onclick = ()=> {
			if (emmtree.on == true){
				emmtree.on = false;
				emmtree.toggle.textContent = "Start Simulation";
			}
			else {
				emmtree.on = true;
				emmtree.toggle.textContent = "Stop Simulation";
			}
		};

		//bind the input box to the array
		emmtree.input = document.getElementById("expectiminimaxInput");
		emmtree.chanceInput = document.getElementById("expectiminimaxChanceInput");
		var getInput = ()=> {
			var dd = emmtree.input.value.match(/\d+/g);
			var ddd = [];
			var cc = emmtree.chanceInput.value.match(/\d+/g);
			for (var i =0; i<4; i++)
				emmtree.chanceNodes.push(cc[i]/(10*(cc[i].length)));
			for (var i = 0; i < 8; i++)
				ddd.push(((dd == null) || (i >= dd.length)) ? 0 : dd[i]);

			emmtree.defaultNodes = [undefined, undefined, undefined, undefined, undefined, undefined, undefined].concat(ddd);
			emmtree.nodes = emmtree.defaultNodes;
		};

		getInput();

		emmtree.input.onblur = ()=> {
			emmtree.slider.value = 1;
			getInput();
			emmtree.two.update();
		}; 

		//set up and draw the graph
		var elem = document.getElementById('expectiminimaxCanvas');
		var params = { width: 800, height: 400 };
		emmtree.two = new Two(params).appendTo(elem);

		var depth = 1;
		var start = 0;
		var depth_nodes = 1;
		while(start < emmtree.nodes.length) {

			if(depth==2){
				// make decision nodes.
				for(var i = start; i< start + depth_nodes; i++){
					var circle_x = ((params.width-200)/depth_nodes)*(i-start) + ((params.width-200)/depth_nodes/2);
					var circle_y = ((depth % 2 == 0) ? 100*depth-15 : 100*depth);
					var line_x_1 = ((params.width-200)/(depth_nodes))*(i-start) + ((params.width-200)/depth_nodes/2);
					var line_y_1 = ((depth % 2 == 0) ? 100*depth-30 : 100*depth-30);
					var line_x_2 = ((params.width-200)/(depth_nodes/2))*(Math.floor((i-start)/3)) + ((params.width-200)/(depth_nodes/2)/2);
					var line_y_2 = line_y_1 - 55;
					if (depth != 1) emmtree.lines.push(emmtree.two.makeLine(line_x_1,line_y_1,line_x_2,line_y_2));
					
					emmtree.triangles.push(emmtree.two.makeCircle(circle_x, circle_y, 30))
					emmtree.values.push(emmtree.two.makeText(((emmtree.nodes[i] != undefined) ? emmtree.nodes[i] : " "), circle_x, circle_y, emmtree.styles));
					emmtree.triangles[emmtree.triangles.length-1].stroke = 'none';
					emmtree.triangles[emmtree.triangles.length-1].fill = '#ccddff';
				}
			}
			else{
				var j = 0;
				for (var i = start; i < start + depth_nodes; i++) {
					if(depth == 3){
						var tri_y = ((depth % 2 == 0) ? 100*depth-15 : 100*depth-15);
					}
					else{
						var tri_y = ((depth % 2 == 0) ? 100*depth-15 : 100*depth);
					}
					var tri_x = ((params.width-200)/depth_nodes)*(i-start) + ((params.width-200)/depth_nodes/2);
					var line_x_1 = ((params.width-200)/depth_nodes)*(i-start) + ((params.width-200)/depth_nodes/2);
					if(depth == 4){
						var line_y_1 = ((depth % 2 == 0) ? 100*depth-35 : 100*depth-30);
					}
					else{
						var line_y_1 = ((depth % 2 == 0) ? 100*depth-30 : 100*depth-30);
					}
					var line_x_2 = ((params.width-200)/(depth_nodes/2))*(Math.floor((i-start)/2)) + ((params.width-200)/(depth_nodes/2)/2);
					var line_y_2 = line_y_1 - 55;
					

					emmtree.triangles.push(emmtree.two.makePolygon(tri_x, tri_y, 30, 3));
					if (depth != 1){ 
						emmtree.lines.push(emmtree.two.makeLine(line_x_1,line_y_1,line_x_2,line_y_2));
						if(depth == 3){
							emmtree.lines[i-1].linewidth = 2;
						}	
					}
					emmtree.values.push(emmtree.two.makeText(((emmtree.nodes[i] != undefined) ? emmtree.nodes[i] : " "), tri_x, tri_y, emmtree.styles));

					emmtree.triangles[emmtree.triangles.length-1].stroke = 'none';
					emmtree.triangles[emmtree.triangles.length-1].fill = '#ccddff';
					if(depth>2){
						emmtree.triangles[emmtree.triangles.length-1].rotation = (depth-2) * Math.PI;
					}
					else{
						emmtree.triangles[emmtree.triangles.length-1].rotation = (depth-1) * Math.PI;
					}
				}
			}
			depth += 1;
			start += depth_nodes;
			depth_nodes *= 2;
		}
		emmtree.two.makeText("maximize", 700, 100, emmtree.styles);
		emmtree.two.makeText("chance", 700, 200, emmtree.styles);
		emmtree.two.makeText("minimize", 700, 300, emmtree.styles);
		emmtree.two.update();
	},
	fresh : ()=> {
		var depth = 1;
		var start = 0;
		var depth_nodes = 1;
		while(start < emmtree.nodes.length) {
			for (var i = start; i < start + depth_nodes; i++) {
				emmtree.values[i].value = (emmtree.nodes[i] != undefined ? emmtree.nodes[i] : " ");
				emmtree.values[i].fill = 'black';
				emmtree.values[i].stroke = 'none';
				emmtree.triangles[i].fill = '#ccddff';
				if (depth != 1){
					emmtree.lines[i-1].linewidth = 1;
					if(depth == 3){
							emmtree.lines[i-1].linewidth = 2;
					}
				}
				if (depth != 1){ 
					emmtree.lines[i-1].stroke = 'black';
				}
			}
			depth += 1;
			start += depth_nodes;
			depth_nodes *= 2;
			}				
	},
	update : ()=> {
		emmtree.fresh();
		P_EXPECT_MAX_DECISION(0, emmtree.slider.value);
		emmtree.two.update();

	}
};
$(document).ready(function(){
	emmtree.init();
});