$(document).ready(function(){
  var geneticCanvas;
  var w,h;
  var ga;
  var gen;

  var genIndex = 0;

  var MUTATION = 0.01; // Mutation chance
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
