$(document).ready(function() {

  //Wrapper class for the diagram
  class SimulatedAnnealingDiagram extends HillWorld {
    constructor(selector, h, w, sliderSelector) {
      super(selector, h, w);
      this.sliderElement = $(sliderSelector);
    }

    init(delay, k) {
      this.delay = delay;
      this.initial = this.hillClimber.getCurrentState();
      this.simulatedAnnealing = new SimulatedAnnealing(this.hill, this.initial, k);
      this.colorScale = d3.scaleLinear().domain([0, 50]).range([70, 30]).clamp(true);
      this.showAllStates();
      this.bindListeners();
      this.paintGlobalMaxima();
      this.showTemperature(100);
      this.sliderElement.val(100);
      this.startAnnealing();
    }

    showAllStates() {
      this.hillDiagram.svgRects.transition()
        .duration(200)
        .style('opacity', 1);
    }

    paintGlobalMaxima() {
      this.hillDiagram.svgRects.classed('hill-maxima', (d) => d.maxima);
    }

    teleportRobot(currentState) {
      let robotLocation = currentState;
      let robotStateValue = this.hill.getStates()[currentState];
      this.hillClimberDiagram.robot
        .attr('x', this.hillClimberDiagram.xScale(robotLocation) - this.hillClimberDiagram.xOffset)
        .attr('y', this.h - this.hillClimberDiagram.yScale(robotStateValue) - this.hillClimberDiagram.yOffset);
    }

    updateAnnealRegion(currentState) {
      this.hillDiagram.svgRects.classed('hill-anneal-current-state', d => d.state == currentState);
    }

    showTemperature(t) {
      this.svgTemp = this.hillDiagram.svg.append('text')
        .attr('x', this.w - 180)
        .attr('y', this.h - 470)
        //Displaying temperature with 2 digit precision
        .text(`Temperature : ${Math.round(t*100)/100}`);
    }

    updateTemperature(t) {
      this.svgTemp.text(`Temperature : ${Math.round(t*100)/100}`);
    }

    nextMove(temp) {
      let nextNode = this.simulatedAnnealing.anneal(temp);
      if (nextNode.temp <= 0) {
        this.updateTemperature(0);
        return false;
      } else {
        let nextState = nextNode.state;
        this.hillClimber.changeState(nextState);
        this.teleportRobot(nextState);
        this.updateAnnealRegion(nextState);
        return true;
      }
    }

    startAnnealing() {
      //Stop annealing if already running.
      this.stopAnnealing();
      this.annealIntervalFunction = setInterval(() => {
        if (!this.nextMove(this.sliderElement.val())) {
          this.stopAnnealing();
        }
      }, this.delay);
    }

    stopAnnealing() {
      clearInterval(this.annealIntervalFunction, this.delay);
    }

    destroy() {
      this.stopAnnealing();
    }

    bindListeners() {
      this.sliderElement.mouseup(() => {
        if (this.sliderElement.val() > 0) {
          this.startAnnealing();
        }
      });
      this.sliderElement.mousemove(() => {
        this.updateTemperature(this.sliderElement.val())
      })
    }
  }

  var simulatedAnnealingDiagram;

  function init() {
    simulatedAnnealingDiagram = new SimulatedAnnealingDiagram('#annealingCanvas', 500, 1000, '#tempSelector');

    let delay = 20;

    let k = 0.3;
    simulatedAnnealingDiagram.init(delay, k);
  };

  function restart() {
    simulatedAnnealingDiagram.destroy();
    init();
  }

  init();
  $('#annealingRestart').click(restart);
});
