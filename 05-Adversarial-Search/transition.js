function transition() {
	let scale = 600
	let div = document.getElementById("transitionCanvas")
    let canvas = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
    canvas.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale*0.30 + ' ')
    div.appendChild(canvas)
	let tree = new Tree(new Board([0,0,-1,1,0,0,1,-1,1], -1), 5)
	equip_graphics(tree, 0, scale, 12, 5, canvas)

	function setup(tree, depth) {
		let color = 'hsl(0,0%,50%)'
		for (let i = 0; i < 9; i++) {
			tree.graphic.cross_marks[i].setAttribute('stroke', color)
			tree.graphic.circle_marks[i].setAttribute('stroke', color)
		}
		tree.graphic.rect.setAttribute('stroke', color)
		tree.graphic.l1.setAttribute('stroke', color)
		tree.graphic.l2.setAttribute('stroke', color)
		tree.graphic.l3.setAttribute('stroke', color)
		tree.graphic.l4.setAttribute('stroke', color)
		if (depth == 0)
			return
		for (let i = 0; i < tree.children.length; i++) {
			setup(tree.children[i], depth-1)
			tree.branches[i].setAttribute('stroke', color)
		}
	}
	setup(tree, 100)
	function reset(tree, depth, opacity) {
		tree.graphic.group.setAttribute('opacity', opacity)
		tree.graphic.message.setAttribute('class', 'board_status')
		if (depth == 0)
			return
		for (let i = 0; i < tree.children.length; i++) {
			reset(tree.children[i], depth-1, opacity)
			tree.branches[i].setAttribute('opacity', opacity)
		}
	}

	function apply_state(state) {
		reset(tree, 100, 0.2)
		for (let i = 0; i < state.length; i++) {
			let s = tree.search(state[i][0])
			s.graphic.group.setAttribute('opacity', 1)
			if (s.pbranch != undefined)
					s.pbranch.setAttribute('opacity', 1)
			switch(state[i][1]) {
			case null:
				s.graphic.message.innerHTML = (s.board.turn == -1 ? "X Turn" : "O Turn")
				s.graphic.message.setAttribute('class', 'undecided_status board_status_active')
				break
			case 0:
				s.graphic.message.innerHTML = "X Won"
				s.graphic.message.setAttribute('class', 'cross_status board_status_active')
				break
			case 1:
				s.graphic.message.innerHTML = "Draw"
				s.graphic.message.setAttribute('class', 'draw_status board_status_active')
				break
			case 2:
				s.graphic.message.innerHTML = "O Won"
				s.graphic.message.setAttribute('class', 'circle_status board_status_active')
				break
			case 4:
				s.graphic.group.setAttribute('opacity', '0.0')
				s.pbranch.setAttribute('opacity', '0.0')
				break
			}
		}
	}

	apply_state(states[24])

	function setred(tree, color, opacity) {
		tree.graphic.group.setAttribute('opacity', opacity)
		for (let i = 0; i < 9; i++) {
			tree.graphic.cross_marks[i].setAttribute('stroke', color)
			tree.graphic.circle_marks[i].setAttribute('stroke', color)
		}
		tree.graphic.rect.setAttribute('stroke', color)
		tree.graphic.l1.setAttribute('stroke', color)
		tree.graphic.l2.setAttribute('stroke', color)
		tree.graphic.l3.setAttribute('stroke', color)
		tree.graphic.l4.setAttribute('stroke', color)
		for (let i = 0; i < tree.children.length; i++) {
			setred(tree.children[i], color, opacity)
			tree.branches[i].setAttribute('stroke', color)
		}
	}

	let transitionButton = document.getElementById("transitionButton")
	transitionButton.onmouseover = ()=>{
		setred(tree.search(18), 'hsl(0,50%,50%)', 1)
		setred(tree.search(22), 'hsl(0,50%,50%)', 1)
		
	}
	transitionButton.onmouseout = ()=>{
		setred(tree.search(18), 'hsl(0,0%,50%)', 0.2)
		setred(tree.search(22), 'hsl(0,0%,50%)', 0.2)

	}
}