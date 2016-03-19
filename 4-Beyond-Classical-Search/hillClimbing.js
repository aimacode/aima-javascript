/*
Logic for the hill climber robot
Author: Souradeep Nanda
Date: 18-03-2016
*/

var HillClimber = function(x,y,blockSize){
	// Should the robot go left, right or stay where it is
	this.DECISIONS = {
		LEFT:-1,
		RIGHT:1,
		STAY:0
	};
	
	// Store current position
	this.current.x = x;
	this.current.y = y;
	this.blockSize = blockSize;
	
	// Decide where to go based on height
	this.decide = function(left,right){
		if(left > right){
			this.currentDecision = this.DECISIONS.LEFT;
		} else if (right > left) {
			this.currentDecision = this.DECISIONS.RIGHT;
		} else {
			this.currentDecision = this.DECISIONS.STAY;
		}
		return this.currentDecision;
	}
	
	// This function is used to calculate the intermediate
	// values of x and y, while the robot is jumping
	this.jump = function(t){
		if(this.currentDecision == this.DECISIONS.LEFT)
			t = -t;
		
		// Linearly interpolate x and sinosoidally y
		var intermediate = 
		[this.current.x + t*blockSize,
		 this.current.y + sin((3+3*t)*3.14/2)*blockSize];
		
		// When jump is complete, update position
		if(t == 1){
			this.current.y+=blockSize;
			if(this.currentDecision == this.DECISIONS.LEFT)
				this.current.x-=blockSize;
			else
				this.current.x+=blockSize;
		}
		
		return intermediate;
	}	
}














