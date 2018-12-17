function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function banner() {
    let fps = 17
    let canvas = document.getElementById("banner")
    let w = 5
    let cw = 300
    let ch = 90
    let nc = 'hsl(0, 0%, 30%)'
    let bc = 'hsl(0, 0%, 20%)'
    let tc = 'hsl(0, 0%, 30%)'
    function makeNode(cx, cy, id) {
        let g = document.createElementNS("http://www.w3.org/2000/svg", 'g')
        canvas.appendChild(g)
        g.setAttribute('class', 'node')

        let b = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
        g.appendChild(b)
        
        b.setAttribute('x', cx-w/2)
        b.setAttribute('y', cy-w/2)
        b.setAttribute('width', w)
        b.setAttribute('height', w)

        let node = {}
        node.element = g
        node.x = cx
        node.y = cy
        node.children = []
        node.parent = undefined
        node.active = false
        node.responces = 0
        node.propagate = async ()=>{
            return new Promise(async resolve => { 
                if (node.active == false) {
                    node.active = true
                    g.setAttribute('class', '')
                    let result = []
                    for(let i = 0; i < node.children.length; i++) {
                        result.push(node.children[i]())
                    }
                    await Promise.all(result)
                }
                else {
                    while(node.active == true){
                        await sleep(500)
                    }
                }
                g.setAttribute('class', 'node')
                resolve()
            })
        }
        b.onmouseover = node.propagate
        return node
    }
    function makeBranch(from, to) {
        if (to.parent != undefined)
            throw to + " already has a parent";
        let x1 = from.x
        let y1 = from.y
        let x2 = to.x
        let y2 = to.y
        let mag = Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2))
        let xn = (x2-x1)/mag
        let yn = (y2-y1)/mag
        let line = document.createElementNS("http://www.w3.org/2000/svg", 'line')
        line.setAttribute('x1', x1+xn*w/2)
        line.setAttribute('y1', y1+yn*w/2)
        line.setAttribute('x2', x2-xn*w/2)
        line.setAttribute('y2', y2-yn*w/2)
        line.setAttribute('stroke', bc)
        line.setAttribute('stroke-width', '0.1')
        
        let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle')
        
        circle.setAttribute('cx', x1)
        circle.setAttribute('cy', y1)
        circle.setAttribute('r', '0')
        circle.setAttribute('stroke', tc)
        circle.setAttribute('stroke-width', '1')
        circle.setAttribute('fill', tc)

        canvas.appendChild(line)
        canvas.appendChild(circle)

        async function propagate() {
            return new Promise(async resolve => { 
                circle.setAttribute('r', '1')
                let curx = x1
                let cury = y1

                while(Math.sqrt(Math.pow((x2-curx), 2) + Math.pow((y2-cury), 2)) > 1) {
                    curx += xn*1
                    cury += yn*1
                    circle.setAttribute('cx', curx)
                    circle.setAttribute('cy', cury)
                    await sleep(fps)
                }
                
                if (to.children.length != 0) {
                    circle.setAttribute('r', '0')
                    await to.propagate()
                    circle.setAttribute('r', '1')

                }
                while(Math.sqrt(Math.pow((x1-curx), 2) + Math.pow((y1-cury), 2)) > 1) {
                    curx -= xn*1
                    cury -= yn*1
                    circle.setAttribute('cx', curx)
                    circle.setAttribute('cy', cury)
                    await sleep(fps)
                }
                circle.setAttribute('r', '0')
                from.active = false
                resolve()
            })
        }
        from.children.push(propagate)
    }
    function makeTree(lx, ux, y, inc, d, b, c) {
        if (0 == d)
            return undefined;

        
        let parent = makeNode((ux - lx)/2 + lx, y)
        for(let i = 0; i < b; i++) {
           
            let child = makeTree((ux - lx)/b*(i+1)+lx, (ux - lx)/b*i+lx, y - inc, inc*1.3, d-1, (c == true ? 2 : b-1), (c == false && b == 3 ? true : false))
            if (child != undefined) {
                makeBranch(parent, child)
            }
        }
        
        return parent
    }
    makeTree(0, cw, ch-w, 10, 6, 4, false)

    function makeText() {
        let textele = document.createElementNS('http://www.w3.org/2000/svg','text')
        let textnode = document.createTextNode("Adversarial Search")
        textele.setAttribute('x', '150')
        textele.setAttribute('y', '50')
        textele.setAttribute('alignment-baseline', 'middle')
        textele.setAttribute('text-anchor', 'middle')
        textele.setAttribute('id', 'htext')
        textele.appendChild(textnode)
        canvas.appendChild(textele)
    }

    makeText()
    let state = true
    let brk = 1.5
    function resize(){
        if(state) {
            if (window.innerWidth /  window.innerHeight < brk) {
                state = false
                canvas.setAttribute("viewBox", "80 15 140 75")
                canvas.removeChild(document.getElementById("htext"));
                makeText()
            }
        }
        else {
            if (window.innerWidth /  window.innerHeight >= brk) {
                state = true
                canvas.setAttribute("viewBox", "0 0 300 90")
            }
        }
        
    }
    window.addEventListener("resize", resize)
    resize()

}