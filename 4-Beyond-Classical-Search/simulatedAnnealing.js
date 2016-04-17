/*
Logic for the simulated annealing
Author: Souradeep Nanda
*/

var SimulatedAnnealing = function(x,k,T){
	this.x = x; // Starting state
	this.k = k; // Boltzmann constant
	this.T = T; // Initial temperature
	this.anneal = function(f){
		if(this.T == 0) return x;
		var new_x = this.getRandomInt(0,f.length);
		if(f[new_x] > f[x]){
			// If the new chosen value is better
			// then just move to new state
			x = new_x;
		} else {
			// Calculate probability of transfer
			var p = Math.exp((f[new_x] - f[x])/(k * T));
			// If a randomly chosen value is within p
			// then move to the new state
			if(Math.random() < p)
			x = new_x;
		}
		this.T--;
		return x;
	}

	this.getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}
}
