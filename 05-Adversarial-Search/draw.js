function draw_line(x1, y1, x2, y2, canvas, scale) {
	let line = document.createElementNS("http://www.w3.org/2000/svg", 'line')
	canvas.appendChild(line)
	line.setAttribute('x1', x1 )
	line.setAttribute('y1', y1)
	line.setAttribute('x2', x2)
	line.setAttribute('y2', y2)
	line.setAttribute('stroke', 'hsl(0,0%,30%)')
	line.setAttribute('stroke-width', (scale == undefined ? 1 : scale/20))
	return line
}
function draw_circle(x, y, scale, canvas, scale) {
	let circle = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	canvas.appendChild(circle);
	let r = scale/10;
	let place = "M " + (x) + ", " + (y) + " m " + (-1*r) + ", 0 a "+r+", "+r+" 0 1, 0 "+ ( 2 * r) + ", 0 a "+r+", "+r+" 0 1,0 " + ( -2 * r) + ",0";
	circle.setAttribute('d', place);
	circle.setAttribute('fill', 'none');
	//circle.setAttribute('stroke', 'hsl(120, 50%, 50%)')
	circle.setAttribute('stroke', 'hsl(0, 0%, 30%)');
	circle.setAttribute('style', 'stroke-dasharray: 1000; stroke-dashoffset: 1000;  pointer-events: none;');
	circle.setAttribute('stroke-width', (scale == undefined ? 1 : scale/20));

	return circle;
}
function draw_cross(x, y, scale, canvas, scale) {
	let cross = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	canvas.appendChild(cross);
	let offset = scale/10;
	let place = "M " + (x - offset) + ", " + (y - offset) +" L " + (x + offset) + ", " + (y + offset)+" M " + (x + offset)+ " " + (y - offset) +" L " + (x - offset) + " " + (y + offset);
	cross.setAttribute('d', place);
	cross.setAttribute('stroke', 'hsl(0, 50%, 50%)');
	cross.setAttribute('stroke', 'hsl(0, 0%, 30%)');
	cross.setAttribute('style', 'stroke-dasharray: 1000; stroke-dashoffset: 1000;  pointer-events: none;');
	cross.setAttribute('stroke-width', scale/20);
	return cross
}
function draw_text(x, y, text, cls, canvas) {
	let textele = document.createElementNS('http://www.w3.org/2000/svg','text')
	let textnode = document.createTextNode(text)
	textele.setAttribute('x', x)
	textele.setAttribute('y', y)
	textele.setAttribute('alignment-baseline', 'middle')
	textele.setAttribute('text-anchor', 'middle')
	//textele.setAttribute('style', ' font-size: ' + size + 'em;')
	textele.setAttribute('class', cls)
	textele.appendChild(textnode)
	canvas.appendChild(textele)
	return textele
}
class BoardGraphic {
	constructor(board, x, y, canvas, size) {
		this.scale = (size == undefined ? 20 : size)
		this.group = document.createElementNS("http://www.w3.org/2000/svg", 'g')
		canvas.appendChild(this.group)
		this.rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
		this.group.appendChild(this.rect)
		{
			this.rect.setAttribute('x', x-this.scale/2)
			this.rect.setAttribute('y', y-this.scale/2)
			this.rect.setAttribute('width', this.scale)
			this.rect.setAttribute('height', this.scale)
			this.rect.setAttribute('height', this.scale)
			this.rect.setAttribute('fill', 'hsl(0,0%,100%)')
			this.rect.setAttribute('stroke', 'hsl(0,0%,30%)')
			this.rect.setAttribute('stroke-width', this.scale/20)
		}
		{
			this.l1 = draw_line((this.scale/3 + x - this.scale/2),
								(0 + y - this.scale/2),
								(this.scale/3 + x - this.scale/2),
								(this.scale + y - this.scale/2),
								this.group,
								this.scale)
			this.l2 = draw_line((this.scale/3*2 + x - this.scale/2),
								(0 + y - this.scale/2),
								(this.scale/3*2 + x - this.scale/2),
								(this.scale + y - this.scale/2),
								this.group,
								this.scale)
			this.l3 = draw_line((0 + x - this.scale/2),
								(this.scale/3 + y - this.scale/2),
								(this.scale + x - this.scale/2),
								(this.scale/3 + y - this.scale/2),
								this.group,
								this.scale)
			this.l4 = draw_line((0+ x - this.scale/2),
								(this.scale/3*2 + y - this.scale/2),
								(this.scale + x - this.scale/2),
								(this.scale/3*2 + y - this.scale/2),
								this.group,
								this.scale)
		}
		this.circle_marks = []
		this.cross_marks = []
		for(let i = 0; i < 9; i++) {
			this.circle_marks.push(draw_circle((i%3*this.scale/3 - this.scale/3 + x),
												(Math.floor(i/3)*this.scale/3 - this.scale/3 + y),
												this.scale,
												this.group,
												this.scale));
			this.cross_marks.push(draw_cross((i%3*this.scale/3 - this.scale/3 + x),
												(Math.floor(i/3)*this.scale/3 - this.scale/3 + y),
												this.scale,
												this.group,
												this.scale));
			if (board.dif == i) {
				this.cross_marks[this.cross_marks.length-1].setAttribute('stroke', 'hsl(230, 50%, 70%)');
				this.circle_marks[this.circle_marks.length-1].setAttribute('stroke', 'hsl(230, 50%, 70%)');
			}					
			switch(board.tiles[i]) {
			case -1: this.cross_marks[i].setAttribute('class', 'gameapp'); break
			case 0: break
			case 1: this.circle_marks[i].setAttribute('class', 'gameapp'); break
			}
		}
		/*
			0 = in progress
			1 = O won
			2 = X won
			3 = draw
		*/
		let msg = undefined
		switch(board.gameState) {
			case 0: msg = "Draw!"; break
			case 1: msg = "O won!"; break
			case 2: msg = "X won!"; break
			case 3: msg = "Draw!"; break
		}
		this.message = draw_text(x, y, msg, 'board_status', canvas)
		this.group.appendChild(this.message)
	}
}
function equip_graphics(tree, lx, ux, y, d, canvas) {
    tree.graphic = new BoardGraphic(tree.board, (ux - lx)/2 + lx, y, canvas)
    if (1 == d)
        return
    tree.branches = []
    for(let i = 0; i < tree.children.length; i++) {
        let new_lx = (ux - lx)/tree.children.length*(i+1)+lx
        let new_ux = (ux - lx)/tree.children.length*i+lx
        equip_graphics(tree.children[i], new_ux, new_lx, y + 35, d-1, canvas)
        let bra = draw_line((ux - lx)/2 + lx, y+10, (new_ux - new_lx)/2 + new_lx, y+25, canvas)
        tree.branches.push(bra)
        tree.children[i].pbranch = bra
    }
    tree.circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle')
    canvas.appendChild(tree.circle)
    tree.circle.setAttribute('cx', (ux - lx)/2 + lx)
    tree.circle.setAttribute('cy', y+10)
    tree.circle.setAttribute('r', '0')
    tree.circle.setAttribute('fill', 'red')
}