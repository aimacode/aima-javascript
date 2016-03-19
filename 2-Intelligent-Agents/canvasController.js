/* 
Canvas controller and visualizations
Chapter 1.2 Intelligent Agents
Author: Souradeep Nanda
Date: 18-3-2016
*/

//require('cleaningRobot.js');

$(document).ready(function(){

// Constants
const SIZE = 100;
const SPEED = 1;
const WAIT = 1 * 60; // 60 FPS

var robotCanvas;
var robot;
var left,right;
var robotMarker;
var robotGroup;
var floorLeft;
var floorRight;
var two;
var w = $("#robotCanvas").width(),h = 300;
var text;
var isDirty = [false,false];
var msg = "Cleaning";

function init(){
	// Initialize vars required by the cleaning robot
	robotCanvas = document.getElementById('robotCanvas');
	two = new Two({ width: w, height: h }).appendTo(robotCanvas);
	
	// Initialize the leftmost and rightmost positions the robot moves to
	left = [two.width/4,3*two.height/4];
	right = [3*two.width/4,3*two.height/4];	
	
	// Initialize the robot, the text above it and group it together
	robot = new Robot(left[0],two.height/2);
	robotMarker = two.makeRectangle(0, 0, SIZE, SIZE);	
	robotMarker.noStroke().fill = 'rgb(100, 155, 100)';	
	text = two.makeText(msg,0,-SIZE/2-20,'normal');
	robotGroup = two.makeGroup(text,robotMarker);
	
	// Draw the floors
	floorLeft = two.makeRectangle(left[0],left[1], SIZE, SIZE/4);
	floorRight = two.makeRectangle(right[0],right[1],  SIZE, SIZE/4);
	
	// Call the update to draw the svg on the screen
	two.update();
}

init();

// Called when the left floor is clicked
floorLeft._renderer.elem.addEventListener('click', function() {
    floorLeft.fill = '#d00';
	isDirty[0] = true;
}, false);

// Called when the right floor is clicked
floorRight._renderer.elem.addEventListener('click', function() {
    floorRight.fill = '#d00';
	isDirty[1] = true;
}, false);


var counter = 0;
var nextState = 0;
var previousState = 1;

two.bind('update', function(frameCount) {
	if(robot.state == robot.STATES.LEFT){		
		if(robot.x <= left[0]){
			// If the robot has reached the left most position then
			// wait and change directions	
			robot.state = robot.STATES.WAIT;
			nextState = robot.STATES.RIGHT;
			previousState = robot.STATES.LEFT;
			floorLeft.fill = '#fff'; // Clear floor color
		} else {
			// Otherwise move left
			robot.x-=SPEED;
			msg = "Going left";
		}
	} else if (robot.state == robot.STATES.RIGHT){		
		if(robot.x >= right[0]){	
			// If the robot has reached the right most position then
			// wait and change directions	
			robot.state = robot.STATES.WAIT;
			nextState = robot.STATES.LEFT;
			previousState = robot.STATES.RIGHT;
			floorRight.fill = '#fff'; // Clear floor color
		} else {
			// Otherwise move right
			msg = "Going right";
			robot.x+=SPEED;
		}
	} else {
		counter++;
		// Clean the floor if dirty
		if(isDirty[previousState])
			msg = "Cleaning";
		else
			msg = "Idle";
	}
	
	// When waiting period is over, 
	// go to next state
	if(counter == WAIT){
		counter = 0;		
		isDirty[previousState] = false;
		robot.state = nextState;
	}
	
	// Update message and position of robot 
	text.value = msg;	
	robotGroup.translation.set(robot.x,robot.y);
}).play();

});