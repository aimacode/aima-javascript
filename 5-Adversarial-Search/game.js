function game(){
	let tree = new Tree(new Board([0,0,0,0,0,0,0,0,0], 1), 100)
	
	let clickable = true
	let cross_marks = [] // Gamestate: List of positions where crosses are
	let circle_marks = [] // Gamestate: List of positions where circles are
	let scale = 100
	let bc1 = 'hsl(0,0%,20%)'
	let width = 2
	// Draw the Game Board on the Canvas
	let div = document.getElementById("gameCanvas")
	let canvas = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
	canvas.setAttribute('style', 'width: 40%; float: right; margin: 0% 5% 5% 5%;')
    div.appendChild(canvas)
    canvas.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale + ' ')
	let textele = document.createElementNS('http://www.w3.org/2000/svg','text')
    let textnode = document.createTextNode("Make a move!")
    textele.setAttribute('x', '50%')
    textele.setAttribute('y', '50%')
    textele.setAttribute('alignment-baseline', 'middle')
    textele.setAttribute('text-anchor', 'middle')
    textele.setAttribute('id', 'wintext')

	function draw_line(x1, y1, x2, y2) {
		let l1 = document.createElementNS("http://www.w3.org/2000/svg", 'line')
		canvas.appendChild(l1)
		l1.setAttribute('x1', x1)
		l1.setAttribute('y1', y1)
		l1.setAttribute('x2', x2)
		l1.setAttribute('y2', y2)
		l1.setAttribute('stroke', bc1)
		l1.setAttribute('stroke-width', width)
		l1.setAttribute('stroke-linecap' , 'round')
	}

	async function reset() {
		return new Promise(async (resolve) => {
			textnode.nodeValue = (tree.board.gameState == 2 ? "X Wins" : tree.board.gameState == 1 ? "O wins" : "Draw")
			await sleep(2000)
			tree = new Tree(new Board([0,0,0,0,0,0,0,0,0], 1), 100)
			for(let i = 0; i < 9; i++) {
				cross_marks[i].setAttribute('class','')
				circle_marks[i].setAttribute('class','')
			}
			textnode.nodeValue = ""
			clickable = true
			resolve('reset');
		})
	}

	// Loop over each of the moves unless the game ends early
	for(let i = 0; i < 9; i++) {
		let button = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
		canvas.appendChild(button)
		button.setAttribute('x', i%3*scale/3)
		button.setAttribute('y', Math.floor(i/3)*scale/3)
		button.setAttribute('width', scale/3)
		button.setAttribute('height', scale/3)
		button.setAttribute('stroke', 'none')
		button.setAttribute('fill', 'hsl(60,5%,95%)')
		button.setAttribute('style', 'cursor:pointer;')
		// Initialize Circle and Cross Objects
		let circle = document.createElementNS("http://www.w3.org/2000/svg", 'path')
		canvas.appendChild(circle)
		let r = scale/8
		let place = "M " + (i%3*scale/3 + scale/6) + ", " + ((Math.floor(i/3)*scale/3) + (scale/6)) + " m " + (-1*r) + ", 0 a "+r+", "+r+" 0 1, 0 "+ ( 2 * r) + ", 0 a "+r+", "+r+" 0 1,0 " + ( -2 * r) + ",0"
		circle.setAttribute('d', place)
		circle.setAttribute('fill', 'none')
		circle.setAttribute('stroke', 'hsl(120, 50%, 50%)')
		circle.setAttribute('style', 'stroke-dasharray: 1000; stroke-dashoffset: 1000;  pointer-events: none;')
		circle.setAttribute('stroke-width', width)
		circle_marks.push(circle)
		let cross = document.createElementNS("http://www.w3.org/2000/svg", 'path')
		canvas.appendChild(cross)
		let off = 14
		place = "M " + (i%3*scale/3 + scale/off) + ", " + (Math.floor(i/3)*scale/3 + scale/off) +" L " + ((i%3*scale/3) + scale/3 - scale/off) + ", " + (Math.floor(i/3)*scale/3 + scale/3 - scale/off)+" M " + (i%3*scale/3 + scale/3 - scale/off)+ " " + (Math.floor(i/3)*scale/3 + scale/off) +" L " + (i%3*scale/3 + scale/off) + " " + (Math.floor(i/3)*scale/3 + scale/3 - scale/off)
		cross.setAttribute('d', place)
		cross.setAttribute('stroke', 'hsl(0, 50%, 50%)')
		cross.setAttribute('style', 'stroke-dasharray: 1000; stroke-dashoffset: 1000;  pointer-events: none;')
		cross.setAttribute('stroke-width', width)
		cross_marks.push(cross)
		// The Click Event Listener on the board
		button.onclick = async ()=> {
			if (tree.board.tiles[i] != 0 || clickable == false) {
				return;
			}
			clickable = false;
			textnode.nodeValue = "";
			let count = 0;
			for(let j = 0; j < i; j++) {
				if (tree.board.tiles[j] == 0) {
					count++;
				}
			}
			circle.setAttribute('class','gameapp')
			tree = tree.children[count];
			if(tree.board.gameState != 0) {
				await reset()
				return
			}
			let move = tree.best(); // Call to find the optimal move

			let location = 0
			count = -1;
			for(let j = 0; j < 9; j++) {
				if (tree.board.tiles[j] == 0)
					count++;
				if(count == move) {
					location = j;
					break
				}
			}
			await sleep(1000)
			cross_marks[location].setAttribute('class','gameapp')
			tree = tree.children[move];
			// Reset the board for the next game
			if(tree.board.gameState != 0) {
				await reset()
			}
			clickable = true
		}
	}

	draw_line(scale/3, width/2, scale/3, scale-width/2)
	draw_line(scale/3*2, width/2, scale/3*2, scale-width/2)
	draw_line(width/2, scale/3, scale-width/2, scale/3)
	draw_line(width/2, scale/3*2, scale-width/2, scale/3*2)
	textele.appendChild(textnode)
	canvas.appendChild(textele)
}

