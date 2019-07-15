var GeneticAlgorithm = function(fitnessFunction,mutationChance){
	this.f = fitnessFunction;
	this.mutationChance = mutationChance;
	this.fitness = [];
	this.fitnessSum = 0;
	this.alphaIndex = 0;
	this.getNextGeneration = function(currentgen){
		nextGen = new Array(currentgen.length);
		// Precalculate fitness to save time
		this.calculateFitness(currentgen,this.f);
		for(var i = 0; i < currentgen.length; i++){
			// Randomly choose both parents
			// Fitter individuals get priority
			parent1 = this.randomSelection(currentgen);
			parent2 = this.randomSelection(currentgen);
			child = this.reproduce(parent1,parent2);
			// There is a small chance of mutation
			if(Math.random() < this.mutationChance)
				child = this.mutate(child);
			nextGen[i] = child;
		}
		return nextGen;
	};
	this.calculateFitness = function(gen,f){
		this.fitness = new Array(gen.length);
		this.fitnessSum = 0;
		var max = 0;
		// Calculate fitness of each individual
		// the sum of fitness and index of alpha
		for(var i = 0; i < gen.length; i++){
			this.fitness[i] = f(gen[i]);	
			this.fitnessSum += this.fitness[i];
			if(this.fitness[i] > max){
				max = this.fitness[i];
				this.alphaIndex = i;
			}
		}
	};
	this.randomSelection = function(gen){
		// Randomly choose an individual
		var value = Math.random() * this.fitnessSum;
		for(var i = 0; i < this.fitness.length; i++){
			value -= this.fitness[i];
			if (value <= 0.0)
			return gen[i];
		}
	};
	this.reproduce = function(parent1,parent2){
		child = new Array(parent1.length);
		// Randomly choose the point of crossover
		var point = parseInt(Math.random() * child.length);
		for(var i = 0; i < point; i++)
			child[i] = parent1[i];
		for(var i = point; i < child.length; i++)
			child[i] = parent2[i];
		return child;
	};
	this.mutate = function(child){
		var point = parseInt(Math.random() * child.length);
		var value = parseInt(Math.random() * 15);
		child[point] = value.toString(16);
		return child;
	};
	this.getAlpha = function(gen){
		return gen[this.alphaIndex];
	};
};