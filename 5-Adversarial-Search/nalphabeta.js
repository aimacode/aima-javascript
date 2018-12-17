function alphabeta() {
	let scale = 600;
	let div = document.getElementById("alphabetaCanvas");
    let canvas = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    canvas.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale*0.30 + ' ');
    div.appendChild(canvas);
	let tree = new Tree(new Board([0,0,-1,1,0,0,1,-1,1], -1), 5);
	equip_graphics(tree, 0, scale, 12, 5, canvas);

	let textele = document.createElementNS('http://www.w3.org/2000/svg','text')
	let textnode = document.createTextNode("Alpha-Beta Pruning")
	textele.setAttribute('x', '400')
	textele.setAttribute('y', '10')
	textele.setAttribute('alignment-baseline', 'right')
	textele.setAttribute('text-anchor', 'right')
	textele.setAttribute('id', 'htext')
	textele.appendChild(textnode)
	canvas.appendChild(textele)
		
	function setup(tree, depth) {
		tree.graphic.group.setAttribute('opacity', '0.2');
		tree.graphic.message.setAttribute('class', 'board_status');
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
		
		if (tree.pbranch != undefined) {
			tree.pbranch.setAttribute('opacity', '0.2');
			tree.pbranch.setAttribute('stroke', color);
		}
	
		if (depth == 0) {
			return;
		}
		for (let i = 0; i < tree.children.length; i++) {
			setup(tree.children[i], depth-1);
		}
	}
	function apply_state(state) {
		setup(tree, 100);
		for (let i = 0; i < state.length; i++) {
			let s = tree.search(state[i][0]);
			switch(state[i][1]) {
			case null:
				s.graphic.message.innerHTML = (s.board.turn == -1 ? "X Turn" : "O Turn");
				s.graphic.message.setAttribute('class', 'undecided_status board_status_active');
				s.graphic.group.setAttribute('opacity', 1);
				if (s.pbranch != undefined) {
					s.pbranch.setAttribute('opacity', 1);
				}
				break;
			case 0:
				s.graphic.message.innerHTML = "X Won";
				s.graphic.message.setAttribute('class', 'cross_status board_status_active');
				s.graphic.group.setAttribute('opacity', 1);
				if (s.pbranch != undefined) {
					s.pbranch.setAttribute('opacity', 1);
				}
				break;
			case 1:
				s.graphic.message.innerHTML = "Draw";
				s.graphic.message.setAttribute('class', 'draw_status board_status_active');
				s.graphic.group.setAttribute('opacity', 1);
				if (s.pbranch != undefined) {
					s.pbranch.setAttribute('opacity', 1);
				}
				break;
			case 2:
				s.graphic.message.innerHTML = "O Won";
				s.graphic.message.setAttribute('class', 'circle_status board_status_active');
				s.graphic.group.setAttribute('opacity', 1);
				if (s.pbranch != undefined) {
					s.pbranch.setAttribute('opacity', 1);
				}
				break;
			case 3:
				s.graphic.message.innerHTML = "X Won";
				s.graphic.message.setAttribute('class', 'cross_status board_status_active');
				s.graphic.group.setAttribute('opacity', '0.2');
				s.pbranch.setAttribute('opacity', '0.2');
				if (s.pbranch != undefined) {
					s.pbranch.setAttribute('opacity', 0.2);
				}
				break;
			case 4:
				s.graphic.message.innerHTML = "Draw";
				s.graphic.message.setAttribute('class', 'draw_status board_status_active');
				s.graphic.group.setAttribute('opacity', '0.2');
				s.pbranch.setAttribute('opacity', '0.2');
				if (s.pbranch != undefined) {
					s.pbranch.setAttribute('opacity', 0.2);
				}
				break;
			case 5:
				s.graphic.message.innerHTML = "O Won";
				s.graphic.message.setAttribute('class', 'circle_status board_status_active');
				s.graphic.group.setAttribute('opacity', '0.2');
				s.pbranch.setAttribute('opacity', '0.2');
				if (s.pbranch != undefined) {
					s.pbranch.setAttribute('opacity', 0.2);
				}
				break;
			case 6:
				let color = 'hsl(0,50%,50%)';
				s.graphic.group.setAttribute('opacity', '0.2');
				for (let i = 0; i < 9; i++) {
					s.graphic.cross_marks[i].setAttribute('stroke', color);
					s.graphic.circle_marks[i].setAttribute('stroke', color);
				}
				s.graphic.rect.setAttribute('stroke', color);
				s.graphic.l1.setAttribute('stroke', color);
				s.graphic.l2.setAttribute('stroke', color);
				s.graphic.l3.setAttribute('stroke', color);
				s.graphic.l4.setAttribute('stroke', color);
				s.pbranch.setAttribute('opacity', '0.2');
				break;
			}
			
		}
	}
	let container = document.getElementById("abparaContainer");
	let last_state = 0;
	document.addEventListener('parallax1event',  ()=> {
		if (window.scrollY > container.offsetTop - (window.innerHeight - div.clientHeight)/2 && 
			window.scrollY < container.offsetTop + container.clientHeight - window.innerHeight + (window.innerHeight - div.clientHeight)/2) {
			div.setAttribute('style', 'position: fixed; left: 0%; top: '+ (window.innerHeight - div.clientHeight)/2 +'px; width: 100%;');
			let s = Math.floor((window.scrollY-container.offsetTop + (window.innerHeight - div.clientHeight)/2)/Math.floor(container.clientHeight/abstates.length));
			if (s != last_state) {
				apply_state(abstates[s]);
				last_state = s;
			}
		} else if (window.scrollY > container.offsetTop -  (window.innerHeight - div.clientHeight)/2) {
			div.setAttribute('style', 'transform: translate(0px,'+ (container.clientHeight-div.clientHeight) +'px);');
			if (s != last_state) {
				apply_state(abstates[abstates.length-1]);
				last_state = s;
			}
		} else {
			if (s != last_state) {
				div.setAttribute('style', '');
				apply_state(abstates[0]);
			}
		}
	}, false);
}