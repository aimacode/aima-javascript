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

    info_g = world.append('g')
                    .classed('info', true)
                    .attr('width', WUMPUS_WORLD_UI_WIDTH)
                    .attr('height', WUMPUS_WORLD_UI_WIDTH)
                    .attr('id', 'info');

    info_g.append('rect')
          .attr('width', WUMPUS_WORLD_UI_WIDTH)
          .attr('height', WUMPUS_WORLD_UI_WIDTH)

    info_g.append('text')
          .classed('msg', true)
          .attr('x', WUMPUS_WORLD_UI_WIDTH / 2)
          .attr('y', WUMPUS_WORLD_UI_WIDTH / 2)
          .attr('dy', -10)
          .attr('text-anchor', 'middle')
          .attr('font-size', 30);
    
    info_g.append('text')
          // .classed('helping')
          .attr('x', WUMPUS_WORLD_UI_WIDTH / 2)
          .attr('y', WUMPUS_WORLD_UI_WIDTH / 2)
          .attr('dy', 20)
          .attr('text-anchor', 'middle')
          .attr('font-size', 20)
          .attr('fill', 'black')
          .text('press "Enter" to restart');

    
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
    wumpus = randomChoice(world_status.squares.slice(1));
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

  // initilize gold position
  function initGold() {
    // init gold location
    gold = randomChoice(world_status.squares.slice(1).filter(pos => !samePosition(pos, world_status.wumpus)));
    world_status.gold = gold;

    gold = world.selectAll('g.gold').data([world_status.gold])
                  .enter()
                  .append('g')
                  .classed('gold', true)
                  .attr('transform', d => 'translate(' + (d.x-1) * SQUARE_SIZE + ',' + (4-d.y) * SQUARE_SIZE + ')');

    gold.append('circle')
          .attr('cx', SQUARE_SIZE / 2)
          .attr('cy', SQUARE_SIZE / 2)
          .attr('r', 15)
          .classed('gold', true)
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

  function showInfo(info) {
    // re-append the info g to bring it to the front on the page
    world.append(function(){return world.select('g#info').remove().node()});

    switch (info) {
      case 'Win':
        info_g.select('text.msg').text('You Win!').attr("fill", "black");
        info_g.select('rect').attr('fill', '#ddd').style("opacity", 0.5);
        info_g.transition().style('opacity', 1)
        break
      case 'Lose':
        info_g.select('text.msg').text('You Lose!').attr("fill", "black");
        info_g.select('rect').attr('fill', '#000').style("opacity", 0.1);
        info_g.transition().style('opacity', 1)
      default:
    }
    
  }

  // global functions (interfact of game)
  gameController.status = 'Playing'
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

    // check game status
    if (samePosition(world_status.player, world_status.wumpus)) {
      gameController.gameStatusChange('Lose');
    }
    else if (samePosition(world_status.player, world_status.gold)) {
      gameController.gameStatusChange('Win'); 
    }
  };

  gameController.gameStatusChange = function (status) {
    switch (status) {
      case 'Lose':
        gameController.status = 'Lose';
        showInfo('Lose');
        break
      case 'Win':
        gameController.status = 'Win';
        showInfo('Win');
        break
      default:
    }
  }

  gameController.gameRestart = function () {
    // remove previous game 
    d3.select('g.wumpus').remove();
    d3.select('g.gold').remove();
    d3.select('g.player').remove();

    gameController.status = 'Playing';
    info_g.style('opacity', 0);
    initWumpus();
    initGold();
    initPlayer();
  }

  // keyboard binding
  Mousetrap.bind('right', function () {if(gameController.status === 'Playing'){gameController.playerMove('right');} return false;}); // return false to prevent default events
  Mousetrap.bind('left', function () {if(gameController.status === 'Playing'){gameController.playerMove('left');} return false;}); // return false to prevent default events
  Mousetrap.bind('up', function () {if(gameController.status === 'Playing'){gameController.playerMove('up');} return false;}); // return false to prevent default events
  Mousetrap.bind('down', function () {if(gameController.status === 'Playing'){gameController.playerMove('down');} return false;}); // return false to prevent default events
  Mousetrap.bind('enter', function () {gameController.gameRestart(); return false;})

  // enter point
  initWorldStatus();
  initWumpusWorld();
  initWumpus();
  initGold();
  initPlayer();

});

///////// util functions

// return a random element from the array
function randomChoice (arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// return true if x and y attributes are equal
function samePosition(o1, o2) {
  return o1.x == o2.x && o1.y == o2.y;
}
