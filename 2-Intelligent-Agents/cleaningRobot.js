/* 
Class for cleaning robot Chapter 1.2 Intelligent Agents
Author: Souradeep Nanda
Date: 18-3-2016
*/

var Robot = function(x,y){		
	// We have three states, 
	// going left, going right or waiting
	this.STATES = {
		LEFT:0,
		RIGHT:1,
		WAIT: 2
	};
	
	// Store the x and y coordinate used to draw the robot
	this.x = x;
	this.y = y;
	
	// We start as left state
	this.state = this.STATES.LEFT;
	
	return this;		
}