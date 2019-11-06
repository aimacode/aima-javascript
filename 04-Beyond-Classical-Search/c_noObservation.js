class NoObservationDiagram {
  constructor(selector, h, w, count) {
    this.h = h;
    this.w = w;
    this.selector = d3.select(selector);
    this.count = count;
    this.worlds = [];
    this.movesRecorder = new MovesRecorder(this.selector.select('.movesList'));

    var diagramHeight = this.h / (count / 2);
    var diagramWidth = this.w / 2;

    this.selector.select('#canvasWrapper').selectAll('.canvas')
      .data(new Array(count))
      .enter()
      .append('div')
      .attr('class', (d, i) => {
        return 'canvas' + i
      })
      .attr('height', diagramHeight)
      .attr('width', diagramWidth)
      .style('float', 'left')
      .style('margin-right', '6%');

    for (let i = 0; i < count; i++) {
      this.worlds.push(new VacuumWorldDiagram(this.selector.select('.canvas' + i), diagramHeight, diagramWidth));
      this.worlds[i].init(this.movesRecorder);
    }
    this.bindClicks();
  }

  reset() {
    for (let i = 0; i < this.worlds.length; i++) {
      this.worlds[i].reset();
    }
  }

  playMoves() {
    for (let i = 0; i < this.worlds.length; i++) {
      this.worlds[i].playMoves();
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
    var noObservationDiagram = new NoObservationDiagram('#noObservation', 400, 600, 8);
  }

  $('#noObservation .restart-button').on('click', init)
  init();
})
