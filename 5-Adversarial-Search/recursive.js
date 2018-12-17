function recurive() {
    let scale = 200
	let div = document.getElementById("recursiveCanvas")
    let canvas = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
    canvas.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale/2 + ' ')
    div.appendChild(canvas)
	let tree = new Tree(new Board([1,-1,0,1,-1,-1,0,1,0], -1), 2)
    equip_graphics(tree, 0+10, scale-10, 12, 3, canvas)
    function setup(tree) {
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
		for (let i = 0; i < tree.children.length; i++) {
			setup(tree.children[i])
			tree.branches[i].setAttribute('stroke', color)
		}
    }
    setup(tree)
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
    for (let i = 0; i < tree.children.length; i++) {
        reset(tree.children[i], 100, 0.2)
        tree.branches[i].setAttribute('opacity', 0.2)
    }

    let button1 = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
    canvas.appendChild(button1)
    {
        button1.setAttribute('x', 103.7)
        button1.setAttribute('y', 2.3)
        button1.setAttribute('width', 6)
        button1.setAttribute('height', 6)
        button1.setAttribute('fill', 'hsl(60,100%,50%)')
        button1.setAttribute('class', 'recursive_button')
        button1.setAttribute('style', 'opacity: 0;')
    }
    let button2 = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
    canvas.appendChild(button2)
    {
        button2.setAttribute('x', 103.7)
        button2.setAttribute('y', 15.4)
        button2.setAttribute('width', 6)
        button2.setAttribute('height', 6)
        button2.setAttribute('fill', 'hsl(60,100%,50%)')
        button2.setAttribute('class', 'recursive_button')
        button2.setAttribute('style', 'opacity: 0;')
    }
    let button3 = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
    canvas.appendChild(button3)
    {
        button3.setAttribute('x', 90.3)
        button3.setAttribute('y', 15.4)
        button3.setAttribute('width', 6)
        button3.setAttribute('height', 6)
        button3.setAttribute('fill', 'hsl(60,100%,50%)')
        button3.setAttribute('class', 'recursive_button')
        button3.setAttribute('style', 'opacity: 0;')
    }

    let buttons = [button1, button3, button2]
    function choose(tree) {
        let best = (tree.board.turn == 1 ? -1 : -4)
        //console.log('best: ', best)
        let result = 0
        for(let i = 0; i < tree.children.length; i++) {
            if (tree.board.turn == 1 ? tree.children[i].value >= best : tree.children[i].value <= best)
            {
                best = tree.children[i].value
                result = i 
            }
        }
        
        switch(best){
            case 0:
                tree.graphic.message.setAttribute('class', 'draw_status board_status_active')
                tree.graphic.message.innerHTML = "Draw!"
                break
            case 1:
                tree.graphic.message.setAttribute('class', 'cross_status board_status_active')
                tree.graphic.message.innerHTML= "X won!"
                break
            case 2:
                tree.graphic.message.setAttribute('class', 'circle_status board_status_active')
                tree.graphic.message.innerHTML = "O won!";
                break
        }
       
        for(let i = 0; i < tree.children.length; i++) {
            if (i == result)
            {
                continue
            }
            reset(tree.children[i], 100, 0.2)
            tree.branches[i].setAttribute('opacity', 0.2)
        }
    }
    function evaluate(tree) {
        switch (tree.board.gameState) {
            case 1: return 2
            case 2: return 0
            case 3: return 1
            case 0: return 0
            default: return 0
        }
    }
    async function propigate(tree) {
    return new Promise(async resolve => {
        let fps = 1000/30
        tree.circle.setAttribute('r', '1')

        for (let child = 0; child < tree.children.length; child ++) {
            let x1 = Number(tree.branches[child].getAttribute('x1'))
            let x2 = Number(tree.branches[child].getAttribute('x2'))
            let y1 = Number(tree.branches[child].getAttribute('y1'))
            let y2 = Number(tree.branches[child].getAttribute('y2'))
            let mag = Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2))
            let xn = (x2-x1)/mag
            let yn = (y2-y1)/mag
            let curx = x1
            let cury = y1
            tree.branches[child].setAttribute('opacity', 1)
            while(Math.sqrt(Math.pow((x2-curx), 2) + Math.pow((y2-cury), 2)) > 1) {
                curx = curx+xn
                cury = cury+yn
                tree.circle.setAttribute('cx', curx)
                tree.circle.setAttribute('cy', cury)
                await sleep(fps)
            }
            tree.children[child].graphic.group.setAttribute('opacity', 1)
            //tree.children[child].graphic.message.setAttribute('class', 'board_status board_status_active')

            switch(evaluate(tree.children[child])){
                case 0:
                    tree.children[child].graphic.message.setAttribute('class', 'draw_status board_status_active')
                    //tree.graphic.message.innerHTML = "Draw!"
                    break
                case 1:
                    tree.children[child].graphic.message.setAttribute('class', 'cross_status board_status_active')
                    //tree.graphic.message.innerHTML= "X won!"
                    break
                case 2:
                    tree.children[child].graphic.message.setAttribute('class', 'circle_status board_status_active')
                    //tree.graphic.message.innerHTML = "O won!";
                    break
            }

            if (tree.children[child].children.length != 0) {
                tree.circle.setAttribute('r', '0')
                await propigate(tree.children[child], 0)
                tree.circle.setAttribute('r', '1')
                //choose(tree.children[child])
            }
            else
            {
               // console.log("eval: ", evaluate(tree.children[child]))
                tree.children[child].value = evaluate(tree.children[child])
            }
            while(Math.sqrt(Math.pow((x1-curx), 2) + Math.pow((y1-cury), 2)) > 1) {
                curx -= xn*1
                cury -= yn*1
                tree.circle.setAttribute('cx', curx)
                tree.circle.setAttribute('cy', cury)
                await sleep(fps)
            }
        }
        
        tree.circle.setAttribute('r', '0')
        resolve()
    })}

    let circles = []

    for (let i = 0; i < 3; i++) {
        circles.push(document.createElementNS("http://www.w3.org/2000/svg", 'circle'))
        canvas.appendChild(circles[i])
        circles[i].setAttribute('cx', scale/2)
        circles[i].setAttribute('cy', 22)
        circles[i].setAttribute('r', '0')
        circles[i].setAttribute('fill', 'red')
    }

    let activity = [true, true, true]
    async function mouseover(tree, child) {
        if (activity[child] == false)
            return
        activity[child] = false
        buttons[child].setAttribute('class', '')

        let fps = 1000/60
        circles[child].setAttribute('r', '1')
        let x1 = Number(tree.branches[child].getAttribute('x1'))
        let x2 = Number(tree.branches[child].getAttribute('x2'))
        let y1 = Number(tree.branches[child].getAttribute('y1'))
        let y2 = Number(tree.branches[child].getAttribute('y2'))
        let mag = Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2))
        let xn = (x2-x1)/mag
        let yn = (y2-y1)/mag
        let curx = x1
        let cury = y1
        tree.branches[child].setAttribute('opacity', 1)
        while(Math.sqrt(Math.pow((x2-curx), 2) + Math.pow((y2-cury), 2)) > 1) {
            curx = curx+xn
            cury = cury+yn
            circles[child].setAttribute('cx', curx)
            circles[child].setAttribute('cy', cury)
            await sleep(fps)
        }
        tree.children[child].graphic.group.setAttribute('opacity', 1)
        if (tree.children[child].children.length != 0) {
            circles[child].setAttribute('r', '0')
            await propigate(tree.children[child])
            circles[child].setAttribute('r', '1')
            choose(tree.children[child])
        }
        else
        {
            tree.children[child].value = evaluate(tree.children[child])
        }
        while(Math.sqrt(Math.pow((x1-curx), 2) + Math.pow((y1-cury), 2)) > 1) {
            curx -= xn*1
            cury -= yn*1
            circles[child].setAttribute('cx', curx)
            circles[child].setAttribute('cy', cury)
            await sleep(fps)
        }
        circles[child].setAttribute('r', '0')

        await sleep(1000)
        buttons[child].setAttribute('class', 'recursive_button')
        activity[child] = true
        tree.branches[child].setAttribute('opacity', 0.2)
        reset(tree.children[child], 100, 0.2)

    }
    
    button1.onmouseover = async ()=> { mouseover(tree, 0) }
    button2.onmouseover = async ()=> { mouseover(tree, 2) }
    button3.onmouseover = async ()=> { mouseover(tree, 1) }
}