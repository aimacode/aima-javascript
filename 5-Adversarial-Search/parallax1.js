function parallax1() {
	let scale = 100;
	let text = document.getElementById("parallax1Text");
	let div = document.getElementById("parallax1Canvas");
	let canvas = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
	canvas.setAttribute('style', 'width: 80%; margin: auto;');
	let color = 'hsl(0,0%,50%)';
	let br1 = draw_line(50, 43, 25, 56, canvas);
	let br2 = draw_line(50, 43, 75, 56, canvas);
	br1.setAttribute('stroke', color);
	br2.setAttribute('stroke', color);
	let bg1 = new BoardGraphic(new Board([-1,1,1,1,-1,0,1,-1,0], -1), 50, 33, canvas);
	let bg2 = new BoardGraphic(new Board([-1,1,1,1,-1,-1,1,-1,0], -1), 25, 66, canvas);
	let bg3 = new BoardGraphic(new Board([-1,1,1,1,-1,0,1,-1,-1], -1), 75, 66, canvas);
	let label1 = draw_text(25, 90, "Value: 0", "para_label", canvas);
	let label2 = draw_text(75, 90, "Value: 1", "para_label", canvas);
	div.appendChild(canvas);
	canvas.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale + ' ');
	let text1 = document.getElementById("parallax_text1");
	let text2 = document.getElementById("parallax_text2");
	let text3 = document.getElementById("parallax_text3");
	let text4 = document.getElementById("parallax_text4");
	let text5 = document.getElementById("parallax_text5");
	let text6 = document.getElementById("parallax_text6");
	let text7 = document.getElementById("parallax_text7");

	function set_board(board) {
		for (let i = 0; i < 9; i++) {
			board.cross_marks[i].setAttribute('stroke', color);
			board.circle_marks[i].setAttribute('stroke', color);
		}
		board.rect.setAttribute('stroke', color);
		board.l1.setAttribute('stroke', color);
		board.l2.setAttribute('stroke', color);
		board.l3.setAttribute('stroke', color);
		board.l4.setAttribute('stroke', color);
	}
	
	set_board(bg1);
	set_board(bg2);
	set_board(bg3);
    let active = false;
	let last_state = undefined;
	function display(state) {
		

		text1.setAttribute("class", "parallax_inactive");
		text2.setAttribute("class", "parallax_inactive");
		text3.setAttribute("class", "parallax_inactive");
		text4.setAttribute("class", "parallax_inactive");
		text5.setAttribute("class", "parallax_inactive");
		text6.setAttribute("class", "parallax_inactive");
		text7.setAttribute("class", "parallax_inactive");
		switch(state){
			case 1:
				bg2.message.setAttribute("class", "board_status");
				bg3.message.setAttribute("class", "board_status");
				text1.setAttribute("class", "parallax_active")
				br1.setAttribute('opacity', 1);
				br2.setAttribute('opacity', 1);
				bg1.group.setAttribute('opacity', 1);
				bg2.group.setAttribute('opacity', 1);
				bg3.group.setAttribute('opacity', 1);
				label1.setAttribute('opacity', 0.0);
				label2.setAttribute('opacity', 0.0);
				break;
			case 2:
				bg2.message.setAttribute("class", "board_status");
				bg3.message.setAttribute("class", "board_status");
				text2.setAttribute("class", "parallax_active");
				br1.setAttribute('opacity', 0.2);
				br2.setAttribute('opacity', 0.2);
				bg1.group.setAttribute('opacity', 0.2);
				bg2.group.setAttribute('opacity', 1.0);
				bg3.group.setAttribute('opacity', 0.2);
				label1.setAttribute('opacity', 0.0);
				label2.setAttribute('opacity', 0.0);
				break;
			case 3:
		
				bg2.message.setAttribute("class", "draw_status board_status_active");
				bg3.message.setAttribute("class", "board_status");
				text3.setAttribute("class", "parallax_active");
				br1.setAttribute('opacity', 0.2);
				br2.setAttribute('opacity', 0.2);
				bg1.group.setAttribute('opacity', 0.2);
				bg2.group.setAttribute('opacity', 1.0);
				bg3.group.setAttribute('opacity', 0.2);
				label1.setAttribute('opacity', 1.0);
				label2.setAttribute('opacity', 0.0);
				break;
			case 4:
				bg2.message.setAttribute("class", "draw_status board_status_active");
				bg3.message.setAttribute("class", "board_status");
				text4.setAttribute("class", "parallax_active");
				br1.setAttribute('opacity', 0.2);
				br2.setAttribute('opacity', 0.2);
				bg1.group.setAttribute('opacity', 1);
				bg2.group.setAttribute('opacity', 0.2);
				bg3.group.setAttribute('opacity', 0.2);
				label1.setAttribute('opacity', 0.2);
				label2.setAttribute('opacity', 0.0);
				break;
			case 5:
			
				bg2.message.setAttribute("class", "draw_status board_status_active");
				bg3.message.setAttribute("class", "cross_status board_status_active");
				text5.setAttribute("class", "parallax_active");
				br1.setAttribute('opacity', 0.2);
				br2.setAttribute('opacity', 0.2);
				bg1.group.setAttribute('opacity', 0.2);
				bg2.group.setAttribute('opacity', 0.2);
				bg3.group.setAttribute('opacity', 1);
				label1.setAttribute('opacity', 0.2);
				label2.setAttribute('opacity', 1.0);
				break;
			case 6:
				
				bg2.message.setAttribute("class", "draw_status board_status_active");
				bg3.message.setAttribute("class", "cross_status board_status_active");
				text6.setAttribute("class", "parallax_active");
				br1.setAttribute('opacity', 0.2);
				br2.setAttribute('opacity', 0.2);
				bg1.group.setAttribute('opacity', 1);
				bg2.group.setAttribute('opacity', 0.2);
				bg3.group.setAttribute('opacity', 0.2);
				label1.setAttribute('opacity', 0.2);
				label2.setAttribute('opacity', 0.2);
				break;
			case 7:
				bg2.message.setAttribute("class", "draw_status board_status_active");
				bg3.message.setAttribute("class", "cross_status board_status_active");
				text7.setAttribute("class", "parallax_active");
				br1.setAttribute('opacity', 0.1);
				br2.setAttribute('opacity', 1);
				bg1.group.setAttribute('opacity', 1);
				bg2.group.setAttribute('opacity', 0.1);
				bg3.group.setAttribute('opacity', 1);
				label1.setAttribute('opacity', 0.1);
				label2.setAttribute('opacity', 1);
				break;
		}
	}
	function calc_pos() {
        if (window.scrollY > text.offsetTop - window.innerHeight/2 + div.clientHeight/2  &&
            window.scrollY < text.offsetTop + text.clientHeight - div.clientHeight -  ((window.innerHeight/2 - div.clientHeight/2)*0.8)) {

            if (active == false) {
				active = true;
				div.setAttribute('style', 'position: fixed; width: 35%; left: ' + (text.offsetLeft + text.clientWidth + text.clientWidth/10) +'px; top: ' + (window.innerHeight/2 - div.clientHeight/2) +'px;');
            }
			let cur_state = undefined;
			
			if (window.scrollY < text1.offsetTop - div.clientHeight/2) {
				cur_state = 1;
			}
			else if (window.scrollY < text2.offsetTop - div.clientHeight/2) {
				cur_state = 2;
			}
			else if (window.scrollY < text3.offsetTop - div.clientHeight/2) {
				cur_state = 3;
			}
			else if (window.scrollY < text4.offsetTop - div.clientHeight/2) {
				cur_state = 4;
			}
			else if (window.scrollY < text5.offsetTop - div.clientHeight/2) {
				cur_state = 5;
			}
			else if (window.scrollY < text6.offsetTop - div.clientHeight/2) {
				cur_state = 6;
			}
			else {
				cur_state = 7;
			}
            
            if (cur_state != last_state) {
                display(cur_state);
            }
            last_state = cur_state;
        }
        else if (active == true) {
			active = false
			if (window.scrollY > text.offsetTop - window.innerHeight/2 + div.clientHeight/2) {
				div.setAttribute('style', 'position: absolute; width: 35%; left: ' + (text.offsetLeft + text.clientWidth + text.clientWidth/10) +'px; top: ' + (text.offsetTop + text.clientHeight - div.clientHeight) +'px;');
				bot = false;
			}
			else {
				div.setAttribute('style', 'position: absolute; width: 35%; left: ' + (text.offsetLeft + text.clientWidth + text.clientWidth/10) +'px; top: ' + text.offsetTop +'px;');
				bot = true;
			}
        }
	}
	function recalc_pos() {
		div.setAttribute('style', 'position: absolute; width: 35%; left: ' + (text.offsetLeft + text.clientWidth + text.clientWidth/10) +'px; top: ' + text.offsetTop +'px;');
		display(1);
		active = false;
		last_state = undefined;
		bot = true;
		calc_pos();
	}

	document.addEventListener('parallax1event',  calc_pos, false);
	window.addEventListener('resize', recalc_pos, false);
	recalc_pos();
}