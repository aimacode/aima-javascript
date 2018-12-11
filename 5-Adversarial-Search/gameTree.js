function gameTree() {
	let tree = new Tree(new Board([0,0,0,0,0,0,0,0,0], 1), 100);

	let div = document.getElementById("gameTreeCanvas");
	let canvas = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
	div.appendChild(canvas);
	let curBranches = undefined;
	let curChildren = undefined;
	let offx = 0;
	let offy = 0;
	let group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
	canvas.appendChild(group);
	canvas.setAttribute('style', 'cursor:move;');
	function make_cur() {
		curChildren = [];
		curBranches = [];
		//console.log(offx, offy)
		for(let i = 0; i < tree.children.length; i++) {
			let inc_x = 120/ ( tree.children.length == 1 ? 1 : (tree.children.length-1));
			let base_x = (tree.children.length == 1 ? 130 : 70)-offx;
			curChildren.push(new BoardGraphic(
				tree.children[i].board,
				base_x + i * inc_x, 50-offy,
				group, 7));
			curBranches.push(draw_line(
				130-offx, 30-offy+7/2,
				base_x + i * inc_x, 50-offy-7/2,
				group, 7));
			curChildren[i].group.setAttribute('opacity', 0.2);
			curBranches[i].setAttribute('opacity', 0.2);
		}
		//console.log(tree, curBranches, curChildren)
	}	
	{
		let clickable = true
		let cross_marks = []
		let circle_marks = []
		let scale = 60
		let bc1 = 'hsl(0,0%,20%)'
		let width = 2 * (scale/100)
		canvas.setAttribute('viewBox', '0 0 ' + 200 + ' ' + 70 + ' ')
		let textele = document.createElementNS('http://www.w3.org/2000/svg','text')
		let textnode = document.createTextNode("")
		textele.setAttribute('x', 30)
		textele.setAttribute('y', 30)
		textele.setAttribute('alignment-baseline', 'middle')
		textele.setAttribute('text-anchor', 'middle')
		textele.setAttribute('id', 'wintextgt')
	
		function draw_line_alt(x1, y1, x2, y2) {
			let l1 = document.createElementNS("http://www.w3.org/2000/svg", 'line');
			canvas.appendChild(l1);
			l1.setAttribute('x1', x1);
			l1.setAttribute('y1', y1);
			l1.setAttribute('x2', x2);
			l1.setAttribute('y2', y2);
			l1.setAttribute('stroke', bc1);
			l1.setAttribute('stroke-width', width);
			l1.setAttribute('stroke-linecap' , 'round');
			l1.setAttribute('style', 'cursor: default;');

		}
		async function reset() {
			return new Promise(async (resolve) => {
				textnode.nodeValue = (tree.board.gameState == 2 ? "X Wins" : "Draw")
				await sleep(2000)
				tree = new Tree(new Board([0,0,0,0,0,0,0,0,0], 1), 100)
				for(let i = 0; i < 9; i++) {
					cross_marks[i].setAttribute('class','')
					circle_marks[i].setAttribute('class','')
				}
				group.innerHTML = ""
				offx = 0
				offy = 0
				group.setAttribute('transform', 'translate(' + offx + ', ' + offy + ')')
				tree = new Tree(new Board([0,0,0,0,0,0,0,0,0], 1), 100)
				let bg = new BoardGraphic(tree.board, 130-offx, 30-offy, group, 7)
				make_cur()
				textnode.nodeValue = ""
				clickable = true
				resolve('reset');
			})
		}
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
			button.onclick = async ()=> {
				if (tree.board.tiles[i] != 0 || clickable == false)
					return
				clickable = false
				let count = 0;
				for(let j = 0; j < i; j++) {
					if (tree.board.tiles[j] == 0)
						count++;
				}
				circle.setAttribute('class','gameapp')
				tree = tree.children[count]
				let f = 250/17
				let childx = Number(curChildren[count].rect.getAttribute('x')) + 7/2
				let childy = Number(curChildren[count].rect.getAttribute('y')) + 7/2
				let incx = ((130 - offx - (((tree.children.length)/2-count)*0.28)) - childx)/f
				let incy = ((30  - offy + 0.4) - childy)/f

				for(let j = 0; j < f; j++) {
					offx += incx
					offy += incy
					group.setAttribute('transform', 'translate(' + offx + ', ' + offy + ')')
					await sleep(17)
				}
				make_cur()
				if(tree.board.gameState != 0) {
					await reset()
					return
				}
					
				let move = tree.best();

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
				textnode.nodeValue ="Thinking..."
				await sleep(1000)
				textnode.nodeValue = ""
				cross_marks[location].setAttribute('class','gameapp')
				tree = tree.children[move]

				curBranches[count].setAttribute('opacity', 1)
				curChildren[count].group.setAttribute('opacity', 1)

				childx = Number(curChildren[count].rect.getAttribute('x')) + 7/2
				childy = Number(curChildren[count].rect.getAttribute('y')) + 7/2
				//console.log(childx, childy)
				incx = ((130 - offx - (((tree.children.length)/2-count)*0.28)) - childx)/f
				incy = ((30  - offy + 0.4) - childy)/f

				for(let j = 0; j < f; j++) {
					offx += incx
					offy += incy
					group.setAttribute('transform', 'translate(' + offx + ', ' + offy + ')')
					await sleep(17)
				}
				make_cur()
				if(tree.board.gameState != 0) {
					await reset()
				}
				clickable = true
			}
			button.onmouseover = ()=> {
				if (clickable == false) {
					return;
				}
				if (tree.board.tiles[i] != 0) {
					return;
				}
				let count = 0;
				for(let j = 0; j < i; j++) {
					if (tree.board.tiles[j] == 0) {
						count++;
					}
				}
				if (curBranches.length != 0) {
					curBranches[count].setAttribute('opacity', 1);
				}
				if (curChildren.length != 0) {
					curChildren[count].group.setAttribute('opacity', 1)
				}
			}
			button.onmouseout = ()=> {
				if (clickable == false) {
					return;
				}
				if (tree.board.tiles[i] != 0) {
					return;
				}
				let count = 0;
				for(let j = 0; j < i; j++) {
					if (tree.board.tiles[j] == 0) {
						count++;
					}
				}
				if (curBranches.length != 0) {
					curBranches[count].setAttribute('opacity', 0.2)
				}
				if (curChildren.length != 0) {
					curChildren[count].group.setAttribute('opacity', 0.2)
				}
			}
		}
		draw_line_alt(scale/3, width/2, scale/3, scale-width/2)
		draw_line_alt(scale/3*2, width/2, scale/3*2, scale-width/2)
		draw_line_alt(width/2, scale/3, scale-width/2, scale/3)
		draw_line_alt(width/2, scale/3*2, scale-width/2, scale/3*2)
		textele.appendChild(textnode)
		canvas.appendChild(textele)
		//dragging
		{
			function xdlmao(e) {
				if (clickable == true &&
					e.buttons == 1 &&
					e.pageX > div.offsetLeft &&
					e.pageX < div.offsetLeft + div.clientWidth &&
					e.pageY > div.offsetTop &
					e.pageY < div.offsetTop + div.clientHeight) {
						offy += parseInt((e.movementY/4));
						offx += parseInt((e.movementX/4)); 
						group.setAttribute('transform', 'translate(' + offx + ', ' + offy + ')');
				}
			}
			document.addEventListener("mousemove", xdlmao);
		}
	}

	let bg = new BoardGraphic(tree.board, 130-offx, 30-offy, group, 7)
	make_cur()
}