//Function to clone a object
function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

class SmallAustraliMap {
  constructor(selector, h, w) {
    this.selector = selector;
    this.h = h;
    this.w = w;
  }

  init(problem) {
    this.map = new AustraliaMapDiagram(this.selector, this.h, this.w);
    this.map.territories = [
      ['WA', '#WA', 1 / 8, 1 / 4],
      ['NT', '#NT', 1 / 3.75, 1 / 6],
      ['SA', '#SA', 1 / 3.75, 1 / 3.5],
      ['Q', '#Q', 1 / 2.25, 1 / 5.5],
      ['NSW', '#NSW', 1 / 2.25, 1 / 3],
      ['V', '#V', 1 / 2.45, 1 / 2.45],
      ['T', '#T', 1 / 2.20, 1 / 2]
    ];
    this.map.colors = {
      'r': 'Red',
      'g': 'Green',
      'b': 'Blue'
    };
    this.map.init(problem);
    this.hidePalette();
    this.removeClick();
    this.selector.select('svg').append('text')
      .attr('class', 'assigned-value')
      .attr('x', 0)
      .attr('y', this.h / 1.5)
      .style('font-size', '22')
      .text(``);
  }

  color(assignment) {
    for (let state in assignment) {
      this.map.activeColor = assignment[state];
      this.map.colorState(state);
    }
  }

  updateAssignment(variable, value) {
      this.selector.select('.assigned-value').text(`Assigned ${this.map.colors[value]} to ${variable}`);
    }
    //Palette is unnecessary for the small maps
  hidePalette() {
    this.selector.select('.palette').remove();
  }

  removeClick() {
    this.selector.selectAll('.clickable').classed('clickable', false);
  }

  highlightState(state) {
    if (state) {
      this.selector.select(`#${state}`).style('stroke', 'black').style('stroke-width', '2px');
    }
  }

  showInconsistentStatus() {
    let textElement = this.selector.select('.status text').attr('fill', 'red').text('');
    textElement.append('tspan').text('Impossible to')
      .attr('dy', 0)
      .attr('dx', 0)
    textElement.append('tspan').text('make assignment')
      .attr('dy', 20)
      .attr('x', 0);
  }
}


class BacktrackingDiagram {
  constructor(selector, h, w) {
    this.selector = selector;
    this.h = h;
    this.w = w;
  }

  init(svgElement, problem) {
    this.problem = problem;
    this.svgElement = svgElement;
    this.backtracker = new BackTrackingAlgorithm(this.problem);
    this.maps = [];
    this.mapElements = [];
    this.updateStepsCounter();
    //Heuristics are
    let heuristics = {
      'mrv': false,
      'degree': false,
      'lcv': false
    };
    //Run the algorithm and record frames
    this.recordFrames(heuristics);
    this.addAssignmentTable(this.backtracker.variables);
    //Create AnimationController
    let ac = new AnimationController({
      selector: '#backtrackingAC',
      min: 0,
      max: this.frames.length - 1,
      renderer: (n) => this.loadFrame(n)
    });
    ac.renderFirst();
  }

  addNewMap(assignment) {
    let mapElement = this.selector.select('.maps').append('div').attr('class', 'map');
    mapElement.node().appendChild(this.svgElement.cloneNode(true));
    mapElement.select('svg').attr('viewBox', "-0.4 -0.4 300 300")
      .attr('width', 160)
      .attr('height', 250);
    let map = new SmallAustraliMap(mapElement, this.h, this.w);
    this.problem.assignment = assignment;
    map.init(this.problem);

    this.maps.push(map);
    this.mapElements.push(mapElement);
  }

  addAssignmentTable(assignmentOrder) {
    //Remove Previous table
    this.selector.select('.assign-table').html('');
    let data = assignmentOrder;
    let colors = [
      ['Red', 'r'],
      ['Blue', 'b'],
      ['Green', 'g']
    ];
    let table = this.selector.select('.assign-table')
      .append('table')
      .attr('class', 'assignment-table');
    let thead = table.append('thead');
    let tbody = table.append('tbody');
    this.tableHeading = thead.append('tr').selectAll('th')
      .data(assignmentOrder)
      .enter()
      .append('th')
      .style('width', '160px')
      .text(d => d);
    let rows = tbody.selectAll('tr')
      .data(colors)
      .enter()
      .append('tr');
    this.tableCells = rows.selectAll('td')
      .data((row) => {
        return data.map((assignment) => {
          return {
            variable: assignment,
            value: row[1],
            color: row[0],
            isDomain: this.problem.isInDomain(assignment, row[1])
          }
        })
      })
      .enter()
      .append('td')
      .text(d => d.color);
  }

  updateAssignmentTable(assignment, inferredDomain, lastAssignment) {
    this.tableCells.classed('assigned-cell', d => {
        return (assignment[d.variable] == d.value);
      })
      .text(d => {
        if (inferredDomain[d.variable].includes(d.value)) {
          return d.color;
        } else {
          return '';
        }
      });
    this.tableCells.style('background-color', d => {
      if (inferredDomain[d.variable].length == 0) {
        return 'hsla(7, 100%, 80%, 1)'
      } else {
        return null;
      }
    })
    this.tableHeading
      .filter(d => d == lastAssignment)
      .style('background-color', 'hsl(44, 100%, 50%)')
      .transition()
      .duration(800)
      .style('background-color', null)
  }

  updateStepsCounter(steps) {
    this.selector.select('.counter').html(steps);
  }

  recordFrames(heuristics) {
    this.frames = [];
    this.depth = 0;
    this.iterator = this.backtracker.backtrack(this.depth, heuristics);
    this.steps = 0;
    this.assignmentOrder = [];
    this.frames.push({
      depth: this.depth,
      assignment: [],
      inferedDomains: this.problem.domains,
      steps: this.steps,
      assignmentOrder: this.assignmentOrder.slice()
    });
    while (true) {
      let next = this.iterator.next();
      if (next.done) {
        break;
      }
      this.steps++;
      if (next.value.finished) {
        if (next.value.success) {
          break;
        } else {
          if (next.value.backtrack) {
            this.depth--;
            this.assignmentOrder.pop();
            this.frames.push({
              depth: this.depth,
              steps: this.steps,
              inferedDomains: cloneObject(next.value.inferedDomains),
              assignment: this.problem.getAssignments(),
              assignmentOrder: this.assignmentOrder.slice(),
              backtrack: true
            });
          } else {
            this.steps--;
          }
          continue;
        }
      }
      let currentAssignment = {
        variable: next.value.variable,
        value: next.value.value
      }
      if (this.depth < next.value.depth) {
        this.depth++;
      } else {
        this.assignmentOrder.pop();
      }
      this.assignmentOrder.push(currentAssignment);
      this.frames.push({
        depth: this.depth,
        steps: this.steps,
        inferedDomains: cloneObject(next.value.inferedDomains),
        assignment: this.problem.getAssignments(),
        assignmentOrder: this.assignmentOrder.slice()
      });
    }
  }

  //Given a frame, load it into the diagram.
  loadFrame(frameIndex) {
    let frame = this.frames[frameIndex];
    this.selector.selectAll('.map').remove();
    this.maps = [];
    this.mapElements = [];
    let totalMaps = frame.depth + 1;
    //Empty the assignment
    let assignment = {};
    for (let i = 0; i < this.problem.variables.length; i++) {
      assignment[this.problem.variables[i]] = this.problem.noAssignment;
    }
    for (let i = 0; i < totalMaps; i++) {
      this.addNewMap(assignment);
      if (frame.assignmentOrder.length > 0) {
        let variable = frame.assignmentOrder[i].variable;
        let value = frame.assignmentOrder[i].value;
        assignment[variable] = value;
        this.maps[i].updateAssignment(variable, value);
      }
      this.maps[i].color(assignment);
    }
    this.updateStepsCounter(frame.steps);
    let lastAssignment = '';
    if (frame.assignmentOrder.length > 0) {
      lastAssignment = frame.assignmentOrder[frame.assignmentOrder.length - 1].variable;
    }
    this.updateAssignmentTable(frame.assignment, frame.inferedDomains, lastAssignment);
    this.maps[this.maps.length - 1].highlightState(lastAssignment);

    //See if next assignment is backtracking

    //Check if a next frame exists
    if (frameIndex < this.frames.length - 1) {
      let nextFrame = this.frames[frameIndex + 1];
      // Check if next frame is backtrack frame
      if (nextFrame.backtrack) {
        this.maps[this.maps.length - 1].showInconsistentStatus('Impossible to make assignment');
      }
    }
  }
}

$(document).ready(function() {
  var backtrackingDiagram = new BacktrackingDiagram(d3.select('#backtracking'), 500, 500);

  function init() {
    //Load external SVG async
    d3.xml('../third-party/australia.svg', (xml) => {
      let svgElement = xml.documentElement;
      //Map Coloring Problem for Australia
      var australiaMapColoringProblem = new mapColoringProblem(
        ["WA", "NT", "Q", "SA", "NSW", "V", "T"], {
          "WA": ["r", "g", "b"],
          "NT": ["g", "r", "b"],
          "Q": ["b", "g", "r"],
          "SA": ["b", "g", "r"],
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
      backtrackingDiagram.init(svgElement, australiaMapColoringProblem);
      d3.selectAll('#mrvOption, #degreeOption, #lcvOption, #fcOption, #macOption').on('change', init)
    })
  }

  init();
  $('#backtracking .restart-button').click(init);
});
