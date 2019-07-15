var AC3CSP = function(){
	this.variables = [0,1,2,3];
	this.varNames = ['X','Y','Z','W'];
	this.neighbours =
	[[1]
	,[0,2,3]
	,[1,3]
	,[1,2]];
	this.domains =
	[[1,2,4,5,6,7,9,10,11],
	[3,5,7,8,9],
	[0,5,6,3,8,10,11],
	[10,11,4,5,6,7]];
	this.binaryConstraint = function(xi,xj,x,y){
		// Y = X + 1
		if(xi == 0 && xj == 1)
		return y == x + 1;
		if(xi == 1 && xj == 0)
		return x == y + 1;

		// Z >= Y + 1
		if(xi == 1 && xj == 2)
		return y >= x + 1;
		if(xi == 2 && xj == 1)
		return x >= y + 1;

		// W != Y
		if(xi == 1 && xj == 3)
		return x != y;
		if(xi == 3 && xj == 1)
		return y != x;

		// W != Z
		if(xi == 2 && xj == 3)
		return x != y;
		if(xi == 3 && xj == 2)
		return y != x;
	};
};

var ac3 = new ArcConsistency();
var ac3csp = new AC3CSP();
var domainsCopy = new Array(ac3csp.domains.length);
for(var i = 0; i < ac3csp.domains.length; i++){
	domainsCopy[i] = new Array(ac3csp.domains[i].length);
	for(var j = 0; j < ac3csp.domains[i].length; j++){
		domainsCopy[i][j] = ac3csp.domains[i][j];
	}
}
ac3.ac3(ac3csp);
$(document).ready(function(){
	$.ajax({
		url : "AC3.js",
		dataType: "text",
		success : function (data) {
			$("#AC3Code").html(data);
		}
	});


	var two;
	var ac3Canvas;
	var w,h;
	var DELAY = 120;
	var CHECK_COLOR = "#eeee33";
	var SAT_COLOR = "#33ee33";
	var UNSAT_COLOR = "#ee3333";
	var SIZE = 40;

	var index;
	var cells = [];
	function init(){
		ac3Canvas = document.getElementById('ac3Canvas');
		ac3Canvas.addEventListener("click", handleClick, false);
		w = ac3Canvas.offsetWidth,h = 300;
		two = new Two({ width: w, height: h }).appendTo(ac3Canvas);
		index = 0;

		drawBackground();
		two.update();
	}
	init();

	var m_frame = DELAY;
	two.bind('update', function(frameCount) {
		//console.log(m_frame);
		if(m_frame == DELAY){
			m_frame = 0;
			if(index < timeline.length){
				switch(timeline[index][0]){
					case ARC: /*TODO*/ break;
					case SATISFIED:
					colorGreen(timeline[index][1],
						timeline[index][2],
						timeline[index][3],
						timeline[index][4]);
						break;
						case UNSATISFIED:
						colorRed(timeline[index][1],
							timeline[index][2]);
							break;
						}
						index++;
					}
				} else if (m_frame == DELAY/2){
					m_frame++;
					switch(timeline[index][0]){
						case ARC: /*TODO*/ break;
						case SATISFIED:
						colorYellow(timeline[index][1],
							timeline[index][2],
							timeline[index][3],
							timeline[index][4]);
							break;
							case UNSATISFIED:
							colorYellow(timeline[index][1],-1,
								timeline[index][2],-1);
								break;
							}
						} else {
							m_frame++;
						}

					}).play();

					function colorGreen(xi,xj,i,j){
						cells[xi][i].fill = SAT_COLOR;
						cells[xj][j].fill = SAT_COLOR;
					}

					function colorRed(xi,i){
						cells[xi][i].fill = UNSAT_COLOR;
					}

					function colorYellow(xi,xj,i,j){
						cells[xi][i].fill = CHECK_COLOR;
						if(xj != -1)
						cells[xj][j].fill = CHECK_COLOR;
					}

					function drawBackground(){
						cells = new Array(domainsCopy.length);
						for(var i = 0; i < domainsCopy.length; i++){
							cells[i] = new Array(domainsCopy[i].length);
							var y = i * SIZE + SIZE;
							two.makeText(""+ac3csp.varNames[i],SIZE/4,y,'normal');
							for(var j = 0; j < domainsCopy[i].length; j++){
								var x = j * SIZE + SIZE;
								cells[i][j] = two.makeRectangle(x,y,SIZE,SIZE);
								cells[i][j].stroke = "#3333dd";
								two.makeText(""+domainsCopy[i][j],x,y,'normal');
							}
						}
					}

					function handleClick(){
						index = 0;
						for(var i = 0; i < domainsCopy.length; i++){
							for(var j = 0; j < domainsCopy[i].length; j++){
								cells[i][j].fill = "#ffffff";
							}
						}
					}

				});
