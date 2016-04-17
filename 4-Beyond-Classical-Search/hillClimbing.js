/*
Logic for the hill climber robot
Author: Souradeep Nanda
*/

var HillClimber = function(){
	// Should the robot go left, right or stay where it is
	this.DECISIONS = {
		LEFT:-1,
		RIGHT:1,
		STAY:0
	};
	// Decide where to go based on height
	this.decide = function(left,current,right){
		if(left == right && left > current){
			this.currentDecision = Math.random() > 0.5 ?
			this.DECISIONS.LEFT: this.DECISIONS.RIGHT;

		} else if(right == null || left > right){
			this.currentDecision = this.DECISIONS.LEFT;
		} else if (left == null || right > left) {
			this.currentDecision = this.DECISIONS.RIGHT;
		} else {
			this.currentDecision = this.DECISIONS.STAY;
		}
		return this.currentDecision;
	}
}
