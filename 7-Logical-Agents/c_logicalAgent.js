// global variables
var world;
var world_status = {};
var squares;
var gameController = {};

$(document).ready(function(){
  // $.ajax({
  //   url : "logicalAgent.js",
  //   dataType: "text",
  //   success : function (data) {
  //     $("#codearea").html(data);
  //   }
  // });

  // Constants
  const WUMPUS_WORLD_SIZE = 4;
  const WUMPUS_WORLD_UI_WIDTH = 300;
  const SQUARE_SIZE = WUMPUS_WORLD_UI_WIDTH / WUMPUS_WORLD_SIZE;

  // initialize locations of wumpus, squares, etc
  function initWorldStatus(){
    var squares = []
    for (var i = 1; i <= WUMPUS_WORLD_SIZE; i++) {
      for (var j = 1; j <= WUMPUS_WORLD_SIZE; j++) {
        squares.push({x: i, y: j});
      }
    };
    world_status.squares = squares;
  }

  // initialize UI of wumpus world
  function initWumpusWorld(){
    world = d3.select('#wumpus_world').append('svg')
              .attr('width', WUMPUS_WORLD_UI_WIDTH)
              .attr('height', WUMPUS_WORLD_UI_WIDTH);

    var background = world.append('rect')
                          .classed('background', true)
                          .attr('width', WUMPUS_WORLD_UI_WIDTH)
                          .attr('height', WUMPUS_WORLD_UI_WIDTH);
    
    squares = world.selectAll('g.square').data(world_status.squares)
                   .enter()
                   .append('g')
                   .attr('transform', d => 'translate(' + (d.x-1) * SQUARE_SIZE + ',' + (4-d.y) * SQUARE_SIZE + ')')
    
    squares_rect = squares.append('rect')
                       .attr('width', SQUARE_SIZE)
                       .attr('height', SQUARE_SIZE)
                       .classed('square', true);

    squares_text = squares.append('text')
                          .text(d => '(' + d.x + ',' + d.y + ')')
                          .attr('x', 10)
                          .attr('y', 15)
  }

  // initilize wumpus position
  function initWumpus() {
    // init wumpus location
    wumpus = randomChoice(squares.slice(1));
    world_status.wumpus = wumpus;

    wumpus = world.selectAll('g.wumpus').data([world_status.wumpus])
                  .enter()
                  .append('g')
                  .classed('wumpus', true)
                  .attr('transform', d => 'translate(' + (d.x-1) * SQUARE_SIZE + ',' + (4-d.y) * SQUARE_SIZE + ')');

    wumpus.append('circle')
          .attr('cx', SQUARE_SIZE / 2)
          .attr('cy', SQUARE_SIZE / 2)
          .attr('r', 15)
          .classed('wumpus', true)
  }



  // initialize game player position
  function initPlayer(){
    player = { 
      x: 1,
      y: 1
    }
    world_status.player = player;

    player = world.selectAll('g.player').data([world_status.player])
                  .enter()
                  .append('g')
                  .classed('player', true)
                  .attr('transform', d => 'translate(' + (d.x-1) * SQUARE_SIZE + ',' + (4-d.y) * SQUARE_SIZE + ')');

    player.append('circle')
          .attr('cx', SQUARE_SIZE / 2)
          .attr('cy', SQUARE_SIZE / 2)
          .attr('r', 10)
          .classed('player', true)
  }

  // local functions
  function movePlayer(x, y) {
    world_status.player.x = new_position.x;
    world_status.player.y = new_position.y;
    
    world.select('g.player').transition()
         .attr('transform', d => 'translate(' + (d.x-1) * SQUARE_SIZE + ',' + (4-d.y) * SQUARE_SIZE + ')');
  }

  // global functions (interfact of game)
  gameController.playerMove = function (direction) {
    switch (direction) {
      case 'up':
        offset = [0, 1];
        break
      case 'down':
        offset = [0, -1];
        break
      case 'right':
        offset = [1, 0];
        break
      case 'left':
        offset = [-1, 0];
        break
      default:
        // invalid input
        console.log('invalid input');
        return
    }
    
    new_position = {x: world_status.player.x + offset[0], y: world_status.player.y + offset[1]};

    // invalid move
    if (new_position.x < 1 || new_position.x > WUMPUS_WORLD_SIZE || new_position.y < 1 || new_position.y > WUMPUS_WORLD_SIZE) {
      console.log('invalid move');
      return
    }

    movePlayer(new_position.x, new_position.y);
  };

  // keyboard binding
  Mousetrap.bind('right', function () { gameController.playerMove('right'); return false; });
  Mousetrap.bind('left', function () { gameController.playerMove('left'); return false; });
  Mousetrap.bind('up', function () { gameController.playerMove('up'); return false; });
  Mousetrap.bind('down', function () { gameController.playerMove('down'); return false; });

  // enter point
  initWorldStatus();
  initWumpusWorld();
  initPlayer();

});

///////// util functions

// return a random element from the array
function randomChoice (arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
