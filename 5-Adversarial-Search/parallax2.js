function parallax2() {
	let scale = 150
	let text = document.getElementById("parallax2Text")
	let div = document.getElementById("parallax2Canvas")
	let canvas = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
	let color = 'hsl(0,0%,50%)'
	div.appendChild(canvas)
	canvas.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale/1.5 + ' ')
	let tree = new Tree(new Board([0,-1,-1,1,0,0,1,-1,1], 1), 2)
	tree.children.pop() 
	equip_graphics(tree, 0, scale, 12, 8, canvas)
	function clean(tree){
		tree.graphic.l1.setAttribute("opacity", 0.0)
		tree.graphic.l2.setAttribute("opacity", 0.0)
		tree.graphic.l3.setAttribute("opacity", 0.0)
		tree.graphic.l4.setAttribute("opacity", 0.0)
		
		for(let i = 0; i < 9; i++) {
			tree.graphic.cross_marks[i].setAttribute("opacity", 0.0)
			tree.graphic.circle_marks[i].setAttribute("opacity", 0.0)
		}
		for(let i = 0; i < tree.children.length; i++) {
			clean(tree.children[i])
		}

		if (tree.board.gameState == 0) {
			let x = parseInt(tree.graphic.message.getAttribute('x'))
			let y = parseInt(tree.graphic.message.getAttribute('y'))
			tree.graphic.message = undefined
			tree.graphic.alpha = draw_text(x, y-5, "", 'abp', canvas)
			tree.graphic.beta = draw_text(x, y+5, "", 'abp', canvas)
		}
	}
	clean(tree)
	let text1 = document.getElementById("parallax2_text1")
	let text2 = document.getElementById("parallax2_text2")
	let text3 = document.getElementById("parallax2_text3")
	let text4 = document.getElementById("parallax2_text4")
	let text5 = document.getElementById("parallax2_text5")
	let text6 = document.getElementById("parallax2_text6")
	let gra1 = s = tree.search(1)
	let gra2 = s = tree.search(2)
	let gra3 = s = tree.search(3)
	let gra4 = s = tree.search(4)
	let gra5 = s = tree.search(5)
	
    let active = false
	let last_state = undefined
	
	function display(state) {
		text1.setAttribute("class", "parallax_inactive")
		text2.setAttribute("class", "parallax_inactive")
		text3.setAttribute("class", "parallax_inactive")
		text4.setAttribute("class", "parallax_inactive")
		text5.setAttribute("class", "parallax_inactive")
		text6.setAttribute("class", "parallax_inactive")
		gra1.graphic.alpha.innerHTML = ""
		gra1.graphic.beta.innerHTML = ""
		gra2.graphic.message.innerHTML = ""
		gra3.graphic.alpha.innerHTML = ""
		gra3.graphic.beta.innerHTML = ""
		gra4.graphic.message.innerHTML = ""

		let s = undefined
		switch(state){
			case 1:
				text1.setAttribute("class", "parallax_active")
				gra1.graphic.alpha.innerHTML = "α: -∞"
				gra1.graphic.beta.innerHTML = "β: ∞"
				break
			case 2:
				text2.setAttribute("class", "parallax_active")
				gra1.graphic.alpha.innerHTML = "α: -∞"
				gra1.graphic.beta.innerHTML = "β: ∞"
				gra2.graphic.message.innerHTML = "1"
				gra2.graphic.message.setAttribute('class', 'draw_status board_status_active')
				break
			case 3:
				text3.setAttribute("class", "parallax_active")
				gra1.graphic.alpha.innerHTML = "α: 1"
				gra1.graphic.beta.innerHTML = "β: ∞"
				gra2.graphic.message.innerHTML = "1"
				gra2.graphic.message.setAttribute('class', 'draw_status board_status_active')
				break
			case 4:
				text4.setAttribute("class", "parallax_active")
				gra1.graphic.alpha.innerHTML = "α: 1"
				gra1.graphic.beta.innerHTML = "β: ∞"
				gra2.graphic.message.innerHTML = "1"
				gra2.graphic.message.setAttribute('class', 'draw_status board_status_active')
				gra3.graphic.alpha.innerHTML = "α: 1"
				gra3.graphic.beta.innerHTML = "β: ∞"
				break
			case 5:
				text5.setAttribute("class", "parallax_active")				
				gra1.graphic.alpha.innerHTML = "α: 1"
				gra1.graphic.beta.innerHTML = "β: ∞"
				gra2.graphic.message.innerHTML = "1"
				gra2.graphic.message.setAttribute('class', 'draw_status board_status_active')
				gra3.graphic.alpha.innerHTML = "α: 1"
				gra3.graphic.beta.innerHTML = "β: ∞"
				gra4.graphic.message.innerHTML = "0"
				gra4.graphic.message.setAttribute('class', 'draw_status board_status_active')
				break
			case 6:
				text6.setAttribute("class", "parallax_active")
				gra1.graphic.alpha.innerHTML = "α: 1"
				gra1.graphic.beta.innerHTML = "β: ∞"
				gra2.graphic.message.innerHTML = "1"
				gra2.graphic.message.setAttribute('class', 'draw_status board_status_active')
				gra3.graphic.alpha.innerHTML = "α: 1"
				gra3.graphic.beta.innerHTML = "β: 0"
				gra4.graphic.message.innerHTML = "0"
				gra4.graphic.message.setAttribute('class', 'draw_status board_status_active')
				break
		}
	}
	function calc_pos() {
        if (window.scrollY > text.offsetTop - window.innerHeight/2 + div.clientHeight/2  &&
            window.scrollY < text.offsetTop + text.clientHeight - div.clientHeight -  ((window.innerHeight/2 - div.clientHeight/2)*0.8)) {

            if (active == false) {
				active = true
				div.setAttribute('style', 'position: fixed; width: 35%; left: ' + (text.offsetLeft + text.clientWidth) +'px; top: ' + (window.innerHeight/2 - div.clientHeight/2) +'px;')
            }
			let cur_state = undefined
			
			if (window.scrollY < text1.offsetTop - div.clientHeight/2) {
				cur_state = 1
			}
			else if (window.scrollY < text2.offsetTop - div.clientHeight/2) {
				cur_state = 2
			}
			else if (window.scrollY < text3.offsetTop - div.clientHeight/2) {
				cur_state = 3
			}
			else if (window.scrollY < text4.offsetTop - div.clientHeight/2) {
				cur_state = 4
			}
			else if (window.scrollY < text5.offsetTop - div.clientHeight/2) {
				cur_state = 5
			}
			else if (window.scrollY < text6.offsetTop - div.clientHeight/2) {
				cur_state = 6
			}
            if (cur_state != last_state) {
                display(cur_state)
            }
            last_state = cur_state
        }
        else if (active == true) {
			active = false
			if (window.scrollY > text.offsetTop - window.innerHeight/2 + div.clientHeight/2) {
				div.setAttribute('style', 'position: absolute; width: 35%; left: ' + (text.offsetLeft + text.clientWidth) +'px; top: ' + (text.offsetTop + text.clientHeight - div.clientHeight) +'px;')
				bot = false
			}
			else {
				div.setAttribute('style', 'position: absolute; width: 35%; left: ' + (text.offsetLeft + text.clientWidth) +'px; top: ' + text.offsetTop +'px;')
				bot = true
			}
        }
	}
	function recalc_pos() {
		div.setAttribute('style', 'position: absolute; width: 35%; left: ' + (text.offsetLeft + text.clientWidth) +'px; top: ' + text.offsetTop +'px;')
		display(1)
		active = false
		last_state = undefined
		bot = true
		calc_pos()
	}

	document.addEventListener('parallax1event',  calc_pos, false)
	window.addEventListener('resize', recalc_pos, false)
	recalc_pos()
}