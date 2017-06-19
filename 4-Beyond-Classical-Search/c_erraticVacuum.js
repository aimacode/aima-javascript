class MovesRecorder {

  constructor(element) {
    this.list = element;
    //Clears the existing elements
    this.clear();
    this.moves = [];
  }

  clear() {
    this.moves = [];
    this.list.selectAll('*').remove();
  }

  addLeft() {
    this.moves.push('left');
    this.list.append('li')
      .attr('class', 'list-group-item text-center moves-list-item waiting-move')
      .text('Left');
  }

  addRight() {
    this.moves.push('right');
    this.list.append('li')
      .attr('class', 'list-group-item text-center moves-list-item waiting-move')
      .text('Right');
  }

  addSuck() {
    this.moves.push('suck');
    this.list.append('li')
      .attr('class', 'list-group-item text-center moves-list-item waiting-move')
      .text('Suck');
  }

  markUndone() {
    this.list.selectAll('*')
      .classed('done-move', false)
      .classed('active', false)
      .classed('waiting-move', true);
  }

  markDone(i) {
    if (i - 1 > 0) {
      this.list.select('li:nth-child(' + (i) + ')')
        .classed('active', false)
        .classed('done-move', true);
    }
  }

  * getMoves() {
    for (let i = 0; i < this.moves.length; i++) {
      this.list.select('li:nth-child(' + (i + 1) + ')')
        .classed('waiting-move', false)
        .classed('active', true);
      yield this.moves[i];
      this.list.select('li:nth-child(' + (i + 1) + ')')
        .classed('active', false)
        .classed('done-move', true);
    }
  }

};

class VacuumWorldDiagram {
  constructor(selector, h, w) {
    this.h = h;
    this.w = w;
    this.selector = selector;
    this.root = selector;
    this.padding = 25;
    this.floorCount = 5;
    this.floorWidth = Math.floor(((this.w - this.padding) / this.floorCount) - this.padding);
    this.floorHeight = this.h / 10;
    this.robotHeight = this.h / 3;
    this.robotWidth = this.floorWidth;
    this.delay = 800;
    this.svg = this.root.html("")
      .append('svg')
      .attr('height', this.h)
      .attr('width', this.w);
    this.xScale = state => this.padding + state * (this.padding + this.floorWidth);
    this.yScale = state => (2 * this.h) / 3;
    this.robotY = this.yScale(0) - this.floorHeight - this.robotHeight / 2 - this.h / 20;
  }

  init(movesRecorder) {
    this.svg.selectAll('*').remove();
    this.world = new ErraticWorld(this.floorCount);
    this.world.randomize();
    this.initialStates = [];
    for (let i = 0; i < this.world.dirt.length; i++) {
      this.initialStates.push(this.world.dirt[i]);
    }
    this.initialLocation = this.world.robotLocation;
    this.movesRecorder = movesRecorder;
    this.floors = [];

    this.drawAll();
  }

  drawAll() {
    this.dirt = this.world.dirt;
    for (let i = 0; i < this.floorCount; i++) {
      this.floors[i] = this.svg
        .append('rect')
        .attr('class', 'floor')
        .attr('x', this.xScale(i))
        .attr('y', this.yScale(i))
        .attr('width', this.floorWidth)
        .attr('height', this.floorHeight)
        .attr('stroke', 'black')
        .classed('dirty', this.dirt[i]);
    }

    this.robot = this.svg.append('g')
      .attr('class', 'cleaner')
      .append('svg:image')
      .attr('xlink:href', '../third-party/vacuum-cleaner.svg')
      .attr('height', this.robotHeight)
      .attr('width', this.robotWidth)
      .attr('x', this.xScale(this.world.robotLocation))
      .attr('y', this.robotY)
      .on('click', () => {
        this.suckAction()
      });
  }

  reset() {
    this.stopMoves();
    this.world.robotLocation = this.initialLocation;
    this.world.dirt = [];
    for (let i = 0; i < this.initialStates.length; i++) {
      this.world.dirt.push(this.initialStates[i]);
    }
    this.robot.remove();
    for (let i = 0; i < this.floors.length; i++) {
      this.floors[i].remove();
    }
    this.drawAll();
  }


  playMoves() {
    this.moveList = this.movesRecorder.getMoves();
    this.stopMoves();
    this.intervalFunction = setInterval(() => {
      let next = this.moveList.next();
      switch (next.value) {
        case 'left':
          this.moveRobotLeft();
          break;
        case 'right':
          this.moveRobotRight();
          break;
        case 'suck':
          this.suckAction();
          break;
      }
      if (next.done) {
        this.stopMoves();
      }
    }, this.delay)
  }

  stopMoves() {
    clearInterval(this.intervalFunction, this.delay);
  }

  moveRobotLeft() {
    this.world.moveLeft();
    this.robot.transition()
      .duration(300)
      .attr('x', this.xScale(this.world.robotLocation))
      .attr('y', this.robotY);

  }

  moveRobotRight() {
    this.world.moveRight();
    this.robot.transition()
      .duration(300)
      .attr('x', this.xScale(this.world.robotLocation))
      .attr('y', this.robotY);
  }

  suckAction() {
    this.world.suck();
    for (let i = 0; i < this.floorCount; i++) {
      this.floors[i].classed('dirty', this.dirt[i]);
    }
  }

}
class ErraticWorldDiagram extends VacuumWorldDiagram {

  constructor(selector, h, w) {
      super(selector.select('.canvas'), h, w);
      this.selector = selector;
      this.bindClicks();
    }
    //Overwrite Suck Action
  suckAction() {
    this.world.erraticSuck();
    for (let i = 0; i < this.floorCount; i++) {
      this.floors[i].classed('dirty', this.dirt[i]);
    }
  }

  bindClicks() {
    this.selector.select('.left-button').on('click', () => {
      this.movesRecorder.addLeft()
    });
    this.selector.select('.right-button').on('click', () => {
      this.movesRecorder.addRight()
    });
    this.selector.select('.suck-button').on('click', () => {
      this.movesRecorder.addSuck()
    });
    this.selector.select('.play-button').on('click', () => {
      this.reset();
      this.movesRecorder.markUndone();
      this.playMoves();
    });

    this.selector.select('.clear-button').on('click', () => {
      this.reset();
      this.movesRecorder.clear();
    });
  }
}

$(document).ready(function() {


  var init = function() {
    var worldDiagram = new ErraticWorldDiagram(d3.select('#erraticVacuum'), 300, 600);
    var movesRecorder = new MovesRecorder(d3.select('#erraticVacuum .movesList'));
    worldDiagram.init(movesRecorder);
  }

  $('#erraticVacuum  .restart-button').on('click', init)
  init();
})
