/*
Logic for the genetic algorithm
Author: Souradeep Nanda
*/

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
	}
	
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
	}
	
	this.randomSelection = function(gen){		
		// Randomly choose an individual
		var value = Math.random() * this.fitnessSum;
		for(var i = 0; i < this.fitness.length; i++){
			value -= this.fitness[i];        
			if (value <= 0.0)
				return gen[i];	
		}			
	}
	
	this.reproduce = function(parent1,parent2){
		child = new Array(parent1.length);
		// Randomly choose the point of crossover
		var point = parseInt(Math.random() * child.length);
		for(var i = 0; i < point; i++)
			child[i] = parent1[i];
		for(var i = point; i < child.length; i++)
			child[i] = parent2[i];
		return child;
	}
	
	this.mutate = function(child){
		var point = parseInt(Math.random() * child.length);
		var value = parseInt(Math.random() * 15);
		child[point] = value.toString(16);
		return child;		
	}
	
	this.getAlpha = function(gen){
		return gen[this.alphaIndex];
	}
}

$(document).ready(function(){	
	var geneticCanvas;
	var w,h;
	var ga;
	var gen;
	
	var genIndex = 0;
	
	var MUTATION = .01; // Mutation chance
	var TARGET = parseInt('87BC5E',16); // Background color
	var WHITE = parseInt('FFFFFF',16); // White color
	var POPULATION_SIZE = 10; // Number of criters per generation
	var RADIUS = 20; // Radius of circle
	var MAX_GEN = 6; // Maximum number of generations before the simulation starts over
	var SKIP_GEN = 2; // Number of gens to skip drawing each time canvas is clicked
	
	function init(){
		geneticCanvas = document.getElementById('geneticCanvas');
		geneticCanvas.addEventListener("click", handleClick, false);
		w = geneticCanvas.offsetWidth;
		h = 300;
		two = new Two({ width: w, height: h }).appendTo(geneticCanvas);
		ga = new GeneticAlgorithm(fitness,MUTATION);
		gen = createProgeny();
		drawGen(gen,genIndex++);
	}
	init();
	
	function handleClick(){
		if(genIndex < MAX_GEN) { 
			for(var i = 0; i < SKIP_GEN; i++)
				gen = ga.getNextGeneration(gen);
			drawGen(gen,genIndex++);
		} else {
			// Clear the screen and start afresh
			genIndex = 0;
			two.clear();
			two.update();
			gen = createProgeny();
		}
	}
	
	function drawGen(gen,index){
		var spacing = w/POPULATION_SIZE;
		for(var i = 0; i < POPULATION_SIZE; i++){
			var temp = two.makeCircle(spacing/2 + i * spacing,
							RADIUS*1.5 + index * RADIUS * 2.5,
							RADIUS);			
			var color = '#'+(gen[i].join(''));
			temp.fill = color;
			temp.lineWidth = 5;
		}				
		two.update();
	}
	
	function createProgeny(){
		var gen = new Array(POPULATION_SIZE);
		for(var i = 0; i < POPULATION_SIZE; i++){
			// Get a random color
			var value = parseInt(Math.random() * parseInt('ffffff',16));
			// Split the string into char array
			var individual = value.toString(16).split('');
			gen[i] = individual;
		}
		return gen;
	}
	
	function fitness(individual){
		// The further the color is away from target color
		// the lower is the fitness
		var genome = parseInt(individual.join(''),16);
		var x = Math.abs(TARGET - genome)/WHITE; // Normalize the value
		return 1-x;
	}
});