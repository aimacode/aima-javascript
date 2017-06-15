$(document).ready(function() {


  class MovesRecorder {

    constructor(selector) {
      this.list = $(selector);
      //Clears the existing elements
      this.clear();
      this.moves = [];
    }

    clear() {
      this.moves = [];
      this.list.empty();
    }

    addLeft() {
      this.moves.push('left');
      this.list.append(
        $('<li>').attr('class', 'list-group-item text-center moves-list-item waiting-move').append('Left')
      )
    }

    addRight() {
      this.moves.push('right');
      this.list.append(
        $('<li>').attr('class', 'list-group-item text-center moves-list-item waiting-move').append('Right')
      )
    }

    addSuck() {
      this.moves.push('suck');
      this.list.append(
        $('<li>').attr('class', 'list-group-item text-center moves-list-item waiting-move').append('Suck')
      );
    }

    markUndone() {
      this.list.find('*').each(function() {
        $(this).removeClass('done-move').removeClass('active').addClass('waiting-move')
      });
    }

    markDone(i) {
      if (i - 1 > 0) {
        this.list.find('li:nth-child(' + (i) + ')').removeClass('active').addClass('done-move');
      }
    }

    * getMoves() {
      for (let i = 0; i < this.moves.length; i++) {
        this.list.find('li:nth-child(' + (i + 1) + ')').removeClass('waiting-move').addClass('active');
        yield this.moves[i];
        this.list.find('li:nth-child(' + (i + 1) + ')').removeClass('active').addClass('done-move');
      }
    }

  };

  class ErraticWorldDiagram {
    constructor(selector, h, w) {
      this.h = h;
      this.w = w;
      this.padding = 25;
      this.floorCount = 5;
      this.floorWidth = Math.floor(((this.w - this.padding) / this.floorCount) - this.padding);
      this.floorHeight = 40;
      this.robotHeight = 100;
      this.robotWidth = this.floorWidth;
      this.delay = 800;
      this.svg = d3.select(selector).html("")
        .append('svg')
        .attr('height', this.h)
        .attr('width', this.w);
      this.xScale = state => this.padding + state * (this.padding + this.floorWidth);
      this.yScale = state => 200;
    }

    init() {
      this.svg.selectAll('*').remove();
      this.erraticWorld = new ErraticWorld(this.floorCount);
      this.erraticWorld.randomize();
      this.initialStates = [];
      for (let i = 0; i < this.erraticWorld.dirt.length; i++) {
        this.initialStates.push(this.erraticWorld.dirt[i]);
      }
      this.initialLocation = this.erraticWorld.robotLocation;
      this.movesRecorder = new MovesRecorder('#movesList');
      this.floors = [];

      this.drawAll();
    }

    drawAll() {
      this.dirt = this.erraticWorld.dirt;
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

      this.robot = this.robot = this.svg.append('g')
        .attr('class', 'cleaner')
        .append('svg:image')
        .attr('xlink:href', '../third-party/vacuum-cleaner.svg')
        .attr('height', this.robotHeight)
        .attr('width', this.robotWidth)
        .attr('x', this.xScale(this.erraticWorld.robotLocation))
        .attr('y', this.yScale(0) - this.floorHeight - this.robotHeight / 2 - 10)
        .on('click', () => {
          this.suckAction()
        });
      this.bindClicks();
    }

    reset() {
      this.stopMoves();
      this.erraticWorld.robotLocation = this.initialLocation;
      this.erraticWorld.dirt = [];
      for (let i = 0; i < this.initialStates.length; i++) {
        this.erraticWorld.dirt.push(this.initialStates[i]);
      }
      this.robot.remove();
      for (let i = 0; i < this.floors.length; i++) {
        this.floors[i].remove();
      }
      this.drawAll();
    }

    bindClicks() {
      d3.select('#erraticMoveLeft').on('click', () => {
        this.movesRecorder.addLeft()
      });
      d3.select('#erraticMoveRight').on('click', () => {
        this.movesRecorder.addRight()
      });
      d3.select('#erraticVacuum').on('click', () => {
        this.movesRecorder.addSuck()
      });
      d3.select('#movesPlayBtn').on('click', () => {
        this.reset();
        this.movesRecorder.markUndone();
        this.playMoves();
      });

      d3.select('#movesClearBtn').on('click', () => {
        this.reset();
        this.movesRecorder.clear();
      });
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
      this.erraticWorld.moveLeft();
      this.robot.transition()
        .duration(300)
        .attr('x', this.xScale(this.erraticWorld.robotLocation))
        .attr('y', this.yScale(0) - this.floorHeight - this.robotHeight / 2 - 10);
    }

    moveRobotRight() {
      this.erraticWorld.moveRight();
      this.robot.transition()
        .duration(300)
        .attr('x', this.xScale(this.erraticWorld.robotLocation))
        .attr('y', this.yScale(0) - this.floorHeight - this.robotHeight / 2 - 10);
    }

    suckAction() {
      this.erraticWorld.erraticSuck();
      for (let i = 0; i < this.floorCount; i++) {
        this.floors[i].classed('dirty', this.dirt[i]);
      }
    }

  }

  var init = function() {
    var erraticWorldDiagram = new ErraticWorldDiagram('#erraticVacuumCanvas', 300, 600);
    erraticWorldDiagram.init();
  }

  $('#erraticVacuumRestart').on('click', init)
  init();
})
