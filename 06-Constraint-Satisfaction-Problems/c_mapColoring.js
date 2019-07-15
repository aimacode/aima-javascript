class AustraliaMapDiagram {
  constructor(selector, h, w) {
    this.w = w;
    this.h = h;
    this.root = selector;
    this.territories = [
      ['WA','#WA',1/16,1/4],
      ['NT','#NT',1/7.5,1/6],
      ['SA','#SA',1/7,1/3.5],
      ['Q','#Q',1/4.5,1/4.5],
      ['NSW','#NSW',1/4.5,1/3],
      ['V','#V',1/5,1/2.45],
      ['T','#T',1/4.4,1/2]
    ];
    this.colors = [
      ['nc'],
      ['r','.r',this.h/50,this.w/4],
      ['g','.g',this.h/50,this.w/4+30],
      ['b','.b',this.h/50,this.w/4+60]
    ];
  }

  init(problem) {
    this.problem = problem;
    this.activeColor = 'nc';
    this.drawText();
    this.bindClicks();
    this.drawPalette();
    this.drawStatus();
  }

  drawStatus() {
    this.status = this.root.select('#states')
      .append('g')
      .classed('status', true);
    this.statusText = this.status.append('text')
      .attr('y', this.h / 2.2)
      .attr('x', this.w / 50)
      .text('7 uncolored states');
  }

  updateStatus() {
    let unassigned = this.problem.countUnassigned();
    if (unassigned > 0) {
      this.statusText.attr('fill', 'black').text(`${unassigned} uncolored states`);
    } else {
      this.statusText.attr('fill', 'green').text(`Correct Assignment \u2714`);
    }
  }

  checkConsistency() {
    //Remove any previous highlights for inconsistencies
    this.root.selectAll('.inconsistent-state').classed('inconsistent-state', false);
    let result = this.problem.checkConsistency();
    //If not consistent, highlight the inconsistent states.
    if (!result.consistent) {
      for (let i = 0; i < result.inconsistencies.length; i++) {
        this.root.select(`#${result.inconsistencies[i][0]}`).classed('inconsistent-state', true);
        this.root.select(`#${result.inconsistencies[i][1]}`).classed('inconsistent-state', true);
      }
      this.statusText.attr('fill', 'red').text('Inconsistent \u2718');
    } else {
      this.updateStatus();
    }
  }

  drawPalette() {
    this.palette = this.root.select('#states')
      .append('g')
      .classed('palette', true);
    for(let i = 1; i < this.colors.length; i++) {
      let color = this.colors[i];
      this.palette
        .append('circle')
        .attr('r', 10)
        .attr('cy', color[2])
        .attr('cx', color[3])
        .classed('palette-color', true)
        .classed(color[0], true)
        .classed('clickable', true)
        .on('mousedown', () => {
          this.palette.selectAll('.active-palette').classed('active-palette',false);
          this.palette.select(color[1]).classed('active-palette',true);
          this.activeColor = color[0];
        });
    }
  }

  removeColor(state) {
    this.root.select(`#${state}`)
      .classed('nc', false)
      .classed('r', false)
      .classed('g', false)
      .classed('b', false)
  }

  colorState(state) {
    //Remove previous colors
    this.removeColor(state);
    this.root.select(`#${state}`)
      .classed(this.activeColor, true);
    this.problem.assign(state, this.activeColor);
    this.checkConsistency();
  }

  bindClicks() {
    for(let i = 0; i < this.territories.length; i++) {
      let territory = this.territories[i];
      this.root.select(territory[1]).classed('clickable', true).on('mousedown', () => {
        this.colorState(territory[0]);
      });
    }
  }

  drawText() {
    for(let i = 0; i < this.territories.length; i++) {
      let territory = this.territories[i];
      this.root.select(territory[1])
        .append('text')
        .classed('territory-text',true)
        .attr('x', this.w *territory[2])
        .attr('y', this.h *territory[3])
        .text(territory[0]);
    }
  }
}

$(document).ready(function() {
  function init() {
    //Load external SVG async
    d3.xml('../third-party/australia.svg', (xml) => {
      $('#mapColoring .canvas').html(xml.documentElement);
      var australiaMapDiagram = new AustraliaMapDiagram(d3.select('#mapColoring').select('.canvas'), 500, 1000);
      //Map Coloring Problem for Australia
      var australiaMapColoringProblem = new mapColoringProblem(
        ["WA", "NT", "SA", "Q", "NSW", "V", "T"], {
          "WA": ["r", "g", "b"],
          "NT": ["r", "g", "b"],
          "SA": ["r", "g", "b"],
          "Q": ["r", "g", "b"],
          "NSW": ["r", "g", "b"],
          "V": ["r", "g", "b"],
          "T": ["r", "g", "b"]
        }, {
          "WA": ["NT", "SA"],
          "NT": ["WA", "SA", "Q"],
          "SA": ["WA", "NT", "Q", "NSW", "V"],
          "Q": ["NT", "SA", "NSW"],
          "NSW": ["Q", "SA", "V"],
          "V": ["SA", "NSW"],
          "T": []
        },
        function(A, a, B, b) {
          //If no color
          if (a == 'nc' || b == 'nc') {
            return true;
          }
          return a != b;
        });
      australiaMapColoringProblem.emptyAssignment();
      australiaMapDiagram.init(australiaMapColoringProblem);
    })
  }
  init();
  $('#mapColoring .restart-button').click(init);
});
