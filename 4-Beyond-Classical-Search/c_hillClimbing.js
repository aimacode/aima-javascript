class HillDiagram {
  constructor(hill, svg, h, w) {
    this.padding = 20;
    this.hill = hill
    this.h = h;
    this.w = w;
    this.svg = svg;
    this.states = this.hill.getStates();
    this.hillData = [];
    for (let i = 0; i < this.states.length; i++) {
      this.hillData.push({
        state: i,
        objective: this.states[i],
        visited: false,
        maxima: false
      });
    }

    let maximas = this.hill.getBestStates();
    for (let i = 0; i < maximas.length; i++) {
      this.hillData[maximas[i]].maxima = true;
    }


    this.xScale = d3.scaleLinear()
      .domain([0, this.states.length])
      .range([this.padding, this.w - this.padding]);
    this.blockWidth = (this.xScale(this.states.length) - this.xScale(0)) / this.states.length;
    this.yScale = d3.scaleLinear()
      .domain([0, d3.max(this.states)])
      .range([this.padding, this.h - this.padding]);
    this.renderHill();

  }

  renderHill() {
    this.svgHill = this.svg.selectAll('.block')
      .data(this.hillData)
      .enter()
      .append('g')
      .attr('class', 'block');
    this.svgRects = this.svgHill
      .append('rect')
      .attr('height', d => this.yScale(d.objective))
      .attr('width', this.blockWidth)
      .attr('x', (d) => this.xScale(d.state))
      .attr('y', (d) => this.h - this.yScale(d.objective))
      .style('opacity', (d) => (d.visited) ? 1 : 0)
      .classed('hill', true);
  }

  visit(state) {
    this.hillData[state].visited = true;
    this.svgRects.filter((d) => d.state == state)
      .transition()
      .duration(100)
      .style('opacity', 1);
  }

  showAll() {
    this.svgRects.transition()
      .duration(100)
      .style('opacity', (d) => {
        return (d.visited) ? 1 : 0.6;
      })
      .attr('class', (d) => {
        if (d.maxima) {
          if (d.visited) {
            return 'hill-maxima';
          } else {
            return 'hill-unvisitedmaxima';
          }
        } else {
          return 'hill';
        }
      })
  }
}

//Class to draw the robot
class HillClimberDiagram {
  constructor(hill, svg, h, w, hillDiagram, hillClimber) {
    this.h = h;
    this.w = w;
    this.hill = hill;
    this.hillDiagram = hillDiagram;
    this.hillClimber = hillClimber;
    this.states = this.hill.getStates();
    this.svg = svg;
    this.xScale = this.hillDiagram.xScale;
    this.yScale = this.hillDiagram.yScale;
    this.blockWidth = this.hillDiagram.blockWidth;
    this.botHeight = 50;
    this.botWidth = this.blockWidth + 20;
    this.xOffset = 10;
    this.yOffset = 40;
    this.renderHillClimber();
  }
  renderHillClimber() {
    let robotLocation = this.hillClimber.getCurrentState();
    let robotStateValue = this.states[robotLocation];
    this.robot = this.svg.append('g')
      .attr('class', 'robot')
      .append('svg:image')
      .attr('xlink:href', '../third-party/robot.png')
      .attr('height', this.botHeight)
      .attr('width', this.botWidth)
      .attr('x', this.xScale(robotLocation) - this.xOffset)
      .attr('y', this.h - this.yScale(robotStateValue) - this.yOffset);
    this.hillDiagram.visit(robotLocation);

  }
  move(state) {
    let robotLocation = state;
    let robotStateValue = this.states[state];
    this.robot.transition()
      .duration(100)
      .attr('x', this.xScale(robotLocation) - this.xOffset)
      .attr('y', this.h - this.yScale(robotStateValue) - this.yOffset);
  }
}

class HillWorld {
  constructor(selector, h, w) {
    this.h = h;
    this.w = w;
    this.svg = d3.select(selector).html("")
      .append('svg')
      .attr('height', this.h)
      .attr('width', this.w);

    this.hill = new Hill();
    this.hillClimber = new HillClimber(this.hill);
    this.hillDiagram = new HillDiagram(this.hill, this.svg, this.h, this.w);
    this.hillClimberDiagram = new HillClimberDiagram(this.hill, this.svg, this.h, this.w, this.hillDiagram, this.hillClimber);

    this.borderPath = this.svg.append('rect')
      .attr('x', this.hillDiagram.padding)
      .attr('y', 0)
      .attr('height', this.h)
      .attr('width', this.w - 2 * this.hillDiagram.padding)
      .style('stroke', 'black')
      .style('fill', 'none')
      .style('stroke-width', 1);

  }
}

//First Diagram (interactive hill world)
$(document).ready(function() {

  class InteractiveHillWorld extends HillWorld {
    constructor(selector, h, w) {
      super(selector, h, w);
      this.bindClicks();

      this.moves = 0;
      this.maxMoves = 25;
      this.moveAllowed = true;
      this.updateMoves();

    }
    updateMoves() {
      let leftMoves = this.maxMoves - this.moves;
      if (leftMoves >= 0) {
        d3.select('#hillMoves').html('Moves Left :' + (this.maxMoves - this.moves));
      }
    }

    bindClicks() {
      this.clickHandler = () => {
        if (this.moveAllowed) {
          let state = Math.floor(this.hillDiagram.xScale.invert(d3.mouse(this.svg.node())[0]));
          if (state >= 0 && state < 100) {
            this.hillClimber.changeState(state);
            this.hillDiagram.visit(state);
            this.hillClimberDiagram.move(state);
            this.moves++;
            this.updateMoves();
            if (this.moves >= this.maxMoves) {
              this.moveAllowed = false;
              this.hillDiagram.showAll();
            }
          }
        }
      };

      this.svg.on('mousedown', this.clickHandler);
    }

    updateMoves() {
      let leftMoves = this.maxMoves - this.moves;
      if (leftMoves >= 0) {
        d3.select('#hillMoves').html('Moves Left :' + (this.maxMoves - this.moves));
      }
    }
    finish() {
      this.hillDiagram.showAll();
    }
  }

  function init() {
    var diagram = new InteractiveHillWorld('#hillCanvas', 500, 1000);
  }
  init();
  $('#hillClimbRestart').click(init);
});

//Second diagram (Hill climbing Search)
$(document).ready(function() {
  class HCSearchDiagram extends HillWorld {
    constructor(selector, h, w) {
      super(selector, h, w);
      this.getGMRAreas();
      this.colorGlobalRegions();
      this.bindClicks();
      this.startClimbing();
    }

    //GMRAreas => Global Maxima Reachable Areas
    //Areas from where the globam maxima is reachable
    getGMRAreas() {
      let hillData = this.hillDiagram.hillData;
      //Initialize to false
      for (let i = 0; i < hillData.length; i++) {
        hillData[i].isGMRA = false;
      }

      let bestStates = this.hill.getBestStates();
      let states = this.hill.states;
      //For every global maxima,
      for (let i = 0; i < bestStates.length; i++) {
        //Go right side
        let j = bestStates[i] + 1;
        while (j + 1 < states.length && states[j - 1] > states[j + 1]) {
          hillData[j].isGMRA = true;
          j++;
        }
        //corner case for the last state in the diagram
        if (j == states.length - 1 && states[j - 1] > states[j]) {
          hillData[j].isGMRA = true;
        }
        //Go left side
        j = bestStates[i] - 1;
        while (j - 1 >= 0 && states[j + 1] > states[j - 1]) {
          hillData[j].isGMRA = true;
          j--;
        }
        //corner case for the first state in the diagram
        if (j == 0 && states[j + 1] > states[j]) {
          hillData[j].isGMRA = true;
        }
      }
    }

    colorGlobalRegions() {
      let svgRects = this.hillDiagram.svgRects;
      svgRects.transition()
        .duration(200)
        .style('opacity', 1)
        .attr('class', (d) => {
          if (d.maxima) {
            return 'hill-maxima';
          } else {
            if (d.isGMRA) {
              return 'hill-gmra';
            } else {
              return 'hill';
            }
          }
        });
    }

    startClimbing() {
      this.climber = this.hillClimber.climb();
      this.stopClimbing();
      this.intervalFunction = setInterval(() => {
        if (!this.climb()) {
          this.stopClimbing();
        }
      }, 500);
    }
    stopClimbing() {
      clearInterval(this.intervalFunction);
    }

    climb() {
      let next = this.climber.next();
      this.hillClimber.changeState(next.value);
      this.hillClimberDiagram.move(next.value);
      if (next.done) {
        return false;
      } else {
        return true;
      }
    }

    bindClicks() {
      this.clickHandler = () => {
        let state = Math.floor(this.hillDiagram.xScale.invert(d3.mouse(this.svg.node())[0]));
        if (state >= 0 && state < 100) {
          this.hillClimber.changeState(state);
          this.hillClimberDiagram.move(state);
          this.startClimbing();
        }
      };
      this.svg.on('mousedown', this.clickHandler);
    }

  }

  function init() {
    var diagram = new HCSearchDiagram('#hillSearchCanvas', 500, 1000);
  }
  init();
  $('#hillSearchRestart').click(init);
})
