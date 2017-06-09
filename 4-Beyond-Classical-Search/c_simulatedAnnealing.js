$(document).ready(function() {

  class SimulatedAnnealingDiagram extends HillWorld {
    constructor(selector, h, w) {
      super(selector, h, w);

    }

    init(region, schedule, maxTime, delay, k) {
      this.annealRegion = region;
      this.maxTime = maxTime;
      this.schedule = schedule;
      this.delay = delay;
      this.simulatedAnnealing =
        new SimulatedAnnealing(this.hill, this.hillClimber.getCurrentState(), schedule, this.maxTime, this.annealRegion,k);
      this.showAllStates();
      this.paintGlobalMaxima();
      this.showTemperature(this.schedule(0));
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
      this.hillDiagram.svgRects.classed('hill-anneal-region', (d) => {
        // if (d.state >= Math.max(0, currentState - this.annealRegion) && d.state <= Math.min(this.hill.getStates().length, currentState + this.annealRegion)) {
        if (d.state == currentState) {
          return true;
        } else {
          return false;
        }
      });
    }

    showTemperature(t) {
      this.svgTemp = this.hillDiagram.svg.append('text')
        .attr('x', this.w - 180)
        .attr('y', this.h - 470)
        .text(`Temperature : ${Math.round(t*10000)/10000}`);
    }

    updateTemperature(t) {
      this.svgTemp.text(`Temperature : ${Math.round(t*10000)/10000}`);
    }
    nextMove() {
      let nextNode = this.anneal.next();
      let nextState = nextNode.value.state;
      this.hillClimber.changeState(nextState);
      this.teleportRobot(nextState);
      this.updateAnnealRegion(nextState);
      this.updateTemperature(nextNode.value.temp)
      if (nextNode.done) {
        return false;
      } else {
        return true;
      }
    }
    startAnnealing() {
      this.anneal = this.simulatedAnnealing.anneal();
      this.stopAnnealing();
      this.intervalFunction = setInterval(() => {
        if (!this.nextMove()) {
          this.stopAnnealing();
        }
      }, this.delay);
    }
    stopAnnealing() {
      clearInterval(this.intervalFunction, this.delay);
    }
  }

  var simulatedAnnealingDiagram;
  function init() {
    simulatedAnnealingDiagram = new SimulatedAnnealingDiagram('#annealingCanvas', 500, 1000);

    let delay = 10;

    let maxTime = $('#maxTimeSelector').val();
    $('#maxTimeDisplay').html(maxTime);

    function scheduleExp(t) {
      return Math.exp((-0.005) * t);
    }

    function scheduleLinear(t) {
      return maxTime-t;
    }

    let annealWidth = parseInt($('#annealWidthSelector').val());
    $('#annealWidthDisplay').html(annealWidth);

    let scheduleChoice = $('input:radio[name=scheduleFunction]:checked').val();
    let schedule = (scheduleChoice == 'exp')?scheduleExp:scheduleLinear;

    let k = $('#pConstant').val();
    simulatedAnnealingDiagram.init(annealWidth, schedule, maxTime, delay, k);
  }

  function restart() {

    let delay = 10;

    let maxTime = $('#maxTimeSelector').val();
    $('#maxTimeDisplay').html(maxTime);

    function scheduleExp(t) {
      return Math.exp((-0.005) * t);
    }

    function scheduleLinear(t) {
      return maxTime-t;
    }

    let annealWidth = parseInt($('#annealWidthSelector').val());
    $('#annealWidthDisplay').html(annealWidth);

    let scheduleChoice = $('input:radio[name=scheduleFunction]:checked').val();
    let schedule = (scheduleChoice == 'exp')?scheduleExp:scheduleLinear;

    let k = $('#pConstant').val();
    simulatedAnnealingDiagram.init(annealWidth, schedule, maxTime, delay, k);
  }
  init();
  $('#annealingRestart').click(init);
  $('#maxTimeSelector').on('change input', restart);
  $('#annealWidthSelector').on('change input', restart);
  $('input:radio[name=scheduleFunction]').on('change input',restart);
  $('#pConstant').on('change input',restart);
});
