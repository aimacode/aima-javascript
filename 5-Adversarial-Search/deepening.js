function deepening() {
	let scale = 600;
	let div = document.getElementById("deepeningCanvas");
    let canvas = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    canvas.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale*0.30 + ' ');
	div.appendChild(canvas);
	let textele = document.createElementNS('http://www.w3.org/2000/svg','text');
	{
		canvas.appendChild(textele);
		textele.appendChild(document.createTextNode("Iterative Deepening"));
		textele.setAttribute('x', '400');
		textele.setAttribute('y', '10');
		textele.setAttribute('id', 'htext');
	}
	let tree = new Tree(new Board([0,0,-1,1,0,0,1,-1,1], -1), 5);
	equip_graphics(tree, 0, scale, 12, 5, canvas);

	let d = draw_line(0, 60, scale, 60, canvas, 10);

	function setup(tree, depth) {
		let color = 'hsl(0,0%,50%)';
		for (let i = 0; i < 9; i++) {
			tree.graphic.cross_marks[i].setAttribute('stroke', color);
			tree.graphic.circle_marks[i].setAttribute('stroke', color);
		}
		tree.graphic.rect.setAttribute('stroke', color);
		tree.graphic.l1.setAttribute('stroke', color);
		tree.graphic.l2.setAttribute('stroke', color);
		tree.graphic.l3.setAttribute('stroke', color);
		tree.graphic.l4.setAttribute('stroke', color);
		if (depth == 0) {
			return;
		}
		for (let i = 0; i < tree.children.length; i++) {
			setup(tree.children[i], depth-1);
			tree.branches[i].setAttribute('stroke', color);
		}
	}
	setup(tree, 100);
	function reset(tree, depth, opacity) {
		tree.graphic.group.setAttribute('opacity', opacity);
		tree.graphic.message.setAttribute('class', 'board_status');
		if (depth == 0) {
			return;
		}
		for (let i = 0; i < tree.children.length; i++) {
			reset(tree.children[i], depth-1, opacity);
			tree.branches[i].setAttribute('opacity', opacity);
		}
	}
	function apply_state(state, s) {
		reset(tree, 100, 0.2);
		if (s < 7) {
			d.setAttribute('y1', 65);
			d.setAttribute('y2', 65);
		} else if (s < 25) {
			d.setAttribute('y1', 100);
			d.setAttribute('y2', 100);
		} else if (s < 49) {
			d.setAttribute('y1', 135);
			d.setAttribute('y2', 135);
		} else {
			d.setAttribute('y1', 170);
			d.setAttribute('y2', 170);
		}
		
		for (let i = 0; i < state.length; i++) {
			let s = tree.search(state[i][0]);
			s.graphic.group.setAttribute('opacity', 1);
			s.graphic.rect.setAttribute('fill', 'none');
			if (s.pbranch != undefined) {
				s.pbranch.setAttribute('opacity', 1);
			}
			switch(state[i][1]) {
			case null:
				s.graphic.message.innerHTML = (s.board.turn == -1 ? "X Turn" : "O Turn");
				s.graphic.message.setAttribute('class', 'undecided_status board_status_active');
				break;
			case 0:
				s.graphic.message.innerHTML = "X Won";
				s.graphic.message.setAttribute('class', 'cross_status board_status_active');
				break;
			case 1:
				s.graphic.message.innerHTML = "Draw";
				s.graphic.message.setAttribute('class', 'draw_status board_status_active');
				break;
			case 2:
				s.graphic.message.innerHTML = "O Won";
				s.graphic.message.setAttribute('class', 'circle_status board_status_active');
				break;
			case 4:
				s.graphic.group.setAttribute('opacity', '0.0');
				s.pbranch.setAttribute('opacity', '0.0');
                break;
            case 5:
                s.graphic.message.innerHTML = "";
				s.graphic.group.setAttribute('opacity', '0.6');
				s.graphic.rect.setAttribute('fill', 'red');
				if (s.pbranch) {
					s.pbranch.setAttribute('opacity', '0.6');
				}
				break;
			}
			
		}
	}
	let container = document.getElementById("deepeningContainer");
	let last_state = 0;
	document.addEventListener('parallax1event',  ()=> {
		if (window.scrollY > container.offsetTop - (window.innerHeight - div.clientHeight)/2 && 
			window.scrollY < container.offsetTop + container.clientHeight - window.innerHeight + (window.innerHeight - div.clientHeight)/2) {
			div.setAttribute('style', 'position: fixed; left: 0%; top: '+ (window.innerHeight - div.clientHeight)/2 +'px; width: 100%;');
			let s = Math.floor((window.scrollY-container.offsetTop + (window.innerHeight - div.clientHeight)/2)/Math.floor(container.clientHeight/iabstates.length));
			if (s != last_state) {
				apply_state(iabstates[s], s);
				last_state = s;
			}
		} else if (window.scrollY > container.offsetTop -  (window.innerHeight - div.clientHeight)/2) {
			div.setAttribute('style', 'transform: translate(0px,'+ (container.clientHeight-div.clientHeight) +'px);');
			if (s != last_state) {
				apply_state(iabstates[iabstates.length-1], iabstates.length-1);
				last_state = s;
			}
		} else {
			if (s != last_state) {
				div.setAttribute('style', '');
				apply_state(iabstates[0], 0);
			}
		}
	}, false);
}