$(document).ready(function() {


  //Class to draw the hills
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
        })
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
        .style('fill', 'hsl(217,61.2%,53.5%)')
        .style('border', '1px solid');
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
        .style('fill', (d) => {
          if (d.maxima) {
            if (d.visited) {
              return 'hsl(110, 100%, 38%)';
            } else {
              return 'hsl(102, 100%, 56%)';
            }
          } else {
            return 'hsl(217,61.2%,53.5%)';
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

  //Wrapper class for the entire diagram
  class HillClimbingDiagram {
    constructor(selector, h, w) {
      this.h = h;
      this.w = w;
      this.svg = d3.select(selector).html("")
        .append('svg')
        .attr('height', this.h)
        .attr('width', this.w)
        .attr('border', 2);

      this.hill = new Hill();
      this.hillClimber = new HillClimber(this.hill);
      this.hillDiagram = new HillDiagram(this.hill, this.svg, this.h, this.w);
      this.hillClimberDiagram = new HillClimberDiagram(this.hill, this.svg, this.h, this.w, this.hillDiagram, this.hillClimber);
      this.bindClicks();

      this.borderPath = this.svg.append('rect')
        .attr('x', this.hillDiagram.padding)
        .attr('y', 0)
        .attr('height', this.h)
        .attr('width', this.w - 2 * this.hillDiagram.padding)
        .style('stroke', 'black')
        .style('fill', 'none')
        .style('stroke-width', 1);

      this.moves = 0;
      this.maxMoves = 25;
      this.moveAllowed = true;
      this.updateMoves();
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
    var diagram = new HillClimbingDiagram('#hillCanvas', 500, 1000);
  }
  init();
  $('#hillClimbRestart').click(init);
});
