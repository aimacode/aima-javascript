$(document).ready(function(){
	$.ajax({
		url : "hillClimbing.js",
		dataType: "text",
		success : function (data) {
			$("#hillCode").html(data);
		}
	});

	var two;
	var hillClimber;
	var climberHandle;
	var terrain;
	var hillCanvas;
	var w,h;

	var positionX;
	var positionY;
	var terrainSize;

	var DELAY = 60 * 1; // 60FPS
	var SIZE = 20; // Size of the square

	function init(){
		// Initialize variables
		hillCanvas = document.getElementById("hillCanvas");
		hillCanvas.addEventListener("click", handleClick, false);
		w = hillCanvas.offsetWidth,h = 300;
		two = new Two({ width: w, height: h }).appendTo(hillCanvas);
		hillClimber = new HillClimber();
		terrainSize = w/SIZE;
		seaLevel = h/SIZE/2;

		// Generate terrain and draw background
		terrain = generateTerrain(seaLevel,terrainSize);
		drawBackground(terrain);

		// The robot starts from position 1
		// The height depends on the terrain
		positionX = 1;
		positionY = terrain[positionX];

		// Handle for the square drawn on the screen
		// Y axis is inverted
		climberHandle = two.makeRectangle(positionX * SIZE,
			h - positionY * SIZE,
			SIZE,SIZE);
			climberHandle.noStroke()
			climberHandle.fill = 'rgb(213, 0, 11)';

			two.update();
		}

		init();

		var m_frame = DELAY;
		var direction;
		two.bind('update', function(frameCount) {
			if(m_frame == DELAY){
				direction = hillClimber.decide(terrain[positionX-1],
					terrain[positionX],
					terrain[positionX+1]);
					//console.log("Direction = " + direction);
					//console.log(terrain[positionX-1] + " " + terrain[positionX+1]);
					positionX += direction;
					m_frame = 0;
				} else {
					m_frame++;
					var t = m_frame/DELAY; // Interpolation factor
					animateClimber(t,direction);
				}

			}).play();

			function animateClimber(t,direction){
				// If not moving then return
				if(!direction)
				return;

				var x,y;
				var curX = positionX - direction;
				var curY = terrain[curX];
				var newX = curX + direction;
				var newY = terrain[newX];

				if(t < .5){
					// Go up
					t1 = t * 2;
					x = curX;
					y = t1 * newY + (1-t1) * curY;
				} else {
					// Go in the direction
					t1 = (t-.5) * 2;
					y = newY;
					x = t1 * newX + (1-t1) * curX;
				}

				// Translate the climber
				climberHandle.translation.set(x*SIZE,h - y*SIZE);
			}

			function drawBackground(terrain){
				for(var x = 0; x < terrain.length; x++){
					y = terrain[x];
					two.makeRectangle(x * SIZE,
						h - (y-1) * SIZE,
						SIZE,SIZE)
						.noStroke()
						.fill = 'rgb(100, 155, 100)';
					}
				}

				function generateTerrain(seaLevel,terrainSize){
					/*
					var terrain = [seaLevel];
					for(var i = 0; i < terrainSize; i++){
					index = terrain.length-1;
					if(Math.random() >= .5){
					terrain.push(terrain[index]+1);
				} else {
				terrain.push(terrain[index]-1);
			}
		}

		return terrain;*/

		// Handcrafted terrain
		return [2,3,4,5,4,3,2,3,4,5,6,7,6,5,4,3,2,3,4,5,6,5,4,3,2,3,4,5,6,7,6,5,4,3,2,1];
	}

	var offset = $('#hillCanvas').offset();
	function handleClick(evt){
		m_frame = DELAY;
		var x = (evt.pageX - offset.left);
		//var y = (evt.pageY - offset.top);

		positionX = parseInt((x+SIZE/2)/SIZE);
		//console.log(parseInt(x) + " " +positionX);
		positionY = terrain[positionX];

		climberHandle.translation.set(positionX*SIZE,
			h - positionY*SIZE);
		}

	});
