class SudokuDiagram {
  constructor(selector, h, w) {
    this.selector = selector;
    this.h = h;
    this.w = w;
    this.root = this.selector.html('') // Remove all previous elements
      .append('svg')
      .attr('height', this.h)
      .attr('width', this.w);
  }

  init(problem, cellDetails) {
    this.problem = problem;
    this.cellDetails = cellDetails;
    this.maxRow = this.problem.maxRow;
    this.maxCol = this.problem.maxCol;
    this.blockSize = this.problem.blockSize;
    this.padding = 10;
    this.xScale = d3.scaleLinear()
      .domain([0, this.maxCol])
      .range([this.padding, this.w - this.padding]);
    this.yScale = d3.scaleLinear()
      .domain([0, this.maxRow])
      .range([this.padding, this.h - this.padding]);
    this.cellHeight = (this.h - (2 * this.padding)) / this.maxRow;
    this.cellWidth = (this.w - (2 * this.padding)) / this.maxCol;

    this.highlights = [{
      name: 'Row',
      color: 'green',
      x: (i, j) => {
        return this.padding
      },
      y: (i, j) => {
        return this.padding + i * this.cellHeight
      },
      height: (i, j) => {
        return this.cellHeight
      },
      width: (i, j) => {
        return this.cellWidth * this.maxCol
      },
      show: (i, j) => {
        this.cellDetails.showConstraints('green', this.problem.getRow(i, j))
      }
    }, {
      name: 'Column',
      color: 'blue',
      x: (i, j) => {
        return this.padding + j * this.cellWidth
      },
      y: (i, j) => {
        return this.padding
      },
      height: (i, j) => {
        return this.cellHeight * this.maxRow
      },
      width: (i, j) => {
        return this.cellWidth
      },
      show: (i, j) => {
        this.cellDetails.showConstraints('blue', this.problem.getColumn(i, j))
      }
    }, {
      name: 'Block',
      color: 'red',
      x: (i, j) => {
        return this.padding + (j - (j % this.blockSize)) * this.cellWidth
      },
      y: (i, j) => {
        return this.padding + (i - (i % this.blockSize)) * this.cellWidth
      },
      height: (i, j) => {
        return this.cellHeight * this.blockSize
      },
      width: (i, j) => {
        return this.cellWidth * this.blockSize
      },
      show: (i, j) => {
        this.cellDetails.showConstraints('red', this.problem.getBlock(i, j))
      }
    }];
    this.drawAll();
  }

  drawAll() {
    this.matrixDiv = this.root.append('g')
      .attr('class', 'matrix');
    this.borders = this.root.append('g').attr('class', 'border');
    this.drawCells();
    this.findDigitsAndDots();
    this.fillCells();
  }

  highlight(i, j) {
    for (let k = 0; k < this.highlights.length; k++) {
      let highlight = this.highlights[k];
      this.borders.append('rect')
        .attr('class', 'highlight-border')
        .attr('x', highlight.x(i, j))
        .attr('y', highlight.y(i, j))
        .attr('height', highlight.height(i, j))
        .attr('width', highlight.width(i, j))
        .style('stroke', highlight.color);
      highlight.show(i, j)
    }
    let domain = this.problem.getDomain(i, j);

    this.cellDetails.showReducedDomain(domain);
  }

  clearHighlight() {
    this.borders.selectAll('*').remove();
  }

  drawCells() {
    this.cells = [];
    for (let i = 0; i < this.maxRow; i++) {
      let row = [];
      for (let j = 0; j < this.maxCol; j++) {
        let cell = this.matrixDiv.append('g')
          .attr('class', 'cell clickable')
          .classed('grey', (Math.floor(i / this.blockSize) + Math.floor(j / this.blockSize)) % 2 == 0)
          .on('mousedown', () => {
            //If not already filled
            if (!this.problem.isFilled(i, j)) {
              let n = this.problem.checkSingle(i, j);
              //If only single element in domain
              if (n) {
                //Assing the number to the cell
                this.problem.assign(i, j, n);
                //Remove the dots corresponding to the number
                this.cellDots.filter((d) => {
                    let x = (n - 1) % 3;
                    let y = Math.floor((n - 1) / 3);

                    let sameRow = (d.i == i);
                    let sameCol = (d.j == j);
                    let sameBlock = ((Math.floor(i / 3) == Math.floor(d.i / 3)) && (Math.floor(j / 3) == Math.floor(d.j / 3)))
                    return (x == d.x && y == d.y && (sameRow || sameCol || sameBlock));
                  })
                  .transition()
                  .duration(200)
                  .attr('r', 0)
                  .remove();
                //Update the dataset for numbers
                this.numbers.push({
                  x: this.xScale(j) + this.cellWidth / 2,
                  y: this.yScale(i) + this.cellHeight / 2,
                  i: i,
                  j: j,
                  text: this.problem.puzzle[i][j]
                });
                //Append new number
                this.dotsWrapper.selectAll('.cell-number')
                  .data(this.numbers)
                  .enter()
                  .append('text')
                  .attr('class', 'cell-number new-number')
                  .attr('x', d => d.x)
                  .attr('y', d => d.y)
                  .text(d => d.text);
              }
            }
          })
          .on('mouseover', () => {
            //Highlight the cell
            this.cells[i][j].classed('active-cell', true);
            //If not filled
            if (!this.problem.isFilled(i, j)) {
              this.cellDetails.showDomain(this.problem.getDomain(i, j));
              //Highlight borders
              this.highlight(i, j);
              let n = this.problem.checkSingle(i, j);
              //Check if single value in the domain
              if (n) {
                //Highlight the dots that will be removed
                this.cellDots.filter((d) => {
                    let x = (n - 1) % 3;
                    let y = Math.floor((n - 1) / 3);

                    let sameRow = (d.i == i);
                    let sameCol = (d.j == j);
                    let sameBlock = ((Math.floor(i / 3) == Math.floor(d.i / 3)) && (Math.floor(j / 3) == Math.floor(d.j / 3)))
                    return (x == d.x && y == d.y && (sameRow || sameCol || sameBlock));
                  })
                  .classed('highlight-dot', true)
                  .attr('r', 4);
              }
            }
          })
          .on('mouseout', () => {
            //Remove borders
            this.clearHighlight();
            //Remove highlight cell
            this.cells[i][j].classed('active-cell', false);
            //Remove domains from the cell Description
            this.cellDetails.removeDomain();
            //Remove highlight from dots
            this.cellDots.attr('r', 2).classed('highlight-dot', false);
          });
        cell.append('rect')
          .attr('height', this.cellHeight)
          .attr('width', this.cellWidth)
          .attr('x', this.xScale(j))
          .attr('y', this.yScale(i));

        row.push(cell);
      }
      this.cells.push(row);
    }
  }

  findDigitsAndDots() {
    this.numbers = [];
    this.dots = [];
    //padding between dots and border of cells
    let padding = 15;

    //Prepare the data
    for (let i = 0; i < this.maxRow; i++) {
      for (let j = 0; j < this.maxCol; j++) {
        if (this.problem.puzzle[i][j]) {
          this.numbers.push({
            x: this.xScale(j) + this.cellWidth / 2,
            y: this.yScale(i) + this.cellHeight / 2,
            i: i,
            j: j,
            text: this.problem.puzzle[i][j]
          })
        } else {
          let domain = this.problem.getDomain(i, j);
          for (let item of domain) {
            let x = (item - 1) % 3;
            let y = Math.floor((item - 1) / 3);
            this.dots.push({
              r: 2,
              cx: this.xScale(j) + ((this.cellWidth - 2 * padding) * x) / 2 + padding,
              cy: this.yScale(i) + ((this.cellHeight - 2 * padding) * y) / 2 + padding,
              i: i,
              j: j,
              x: x,
              y: y
            })
          }
        }
      }
    }
  }

  fillCells() {
    this.numberWrapper = this.root.append('g')
      .attr('class', 'numbers');
    this.cellNumbers = this.numberWrapper
      .selectAll('.cell-number')
      .data(this.numbers)
      .enter()
      .append('text')
      .attr('class', 'cell-number')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .text(d => d.text);
    this.dotsWrapper = this.root.append('g')
      .attr('class', 'dots');
    this.cellDots = this.dotsWrapper
      .selectAll('.cell-dots')
      .data(this.dots)
      .enter()
      .append('circle')
      .attr('class', 'cell-dots')
      .attr('r', d => d.r)
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy);
  }

}

class CellDetails {
  constructor(selector, h, w) {
    this.selector = selector;
    this.h = h;
    this.w = w;
    this.selector.select('svg').remove();
    this.root = this.selector.append('svg')
      .attr('height', this.h)
      .attr('width', this.w);
  }

  init(problem) {
      this.problem = problem;
      this.gap = 60;
      this.padding = 40;
      this.border = this.root.append('rect')
        .attr('x', this.w / 3 - this.padding)
        .attr('y', this.h / 10 - this.padding)
        .attr('height', 2 * this.gap + 2 * this.padding)
        .attr('width', 2 * this.gap + 2 * this.padding)
        .style('fill', 'hsla(150, 0%, 83%, 1)');

      this.domainWrapper = this.root.append('g').attr('class', 'domain');

    }
    //Fills the Xs

  showConstraints(color, set) {
      for (let i = 0; i < 9; i++) {
        if (set.has(i + 1)) {
          this.originalDomain.append('text')
            .attr('class', 'original-domain')
            .attr('x', this.w / 3 + (i % 3) * this.gap)
            .attr('y', this.h / 10 + Math.floor(i / 3) * this.gap)
            .style('font-size', 30)
            .style('fill', color)
            .text('X');
        }
      }
    }
    //Shows the 1-9

  showDomain() {
      this.originalDomain = this.domainWrapper.append('g');
      this.domainElements = [];
      for (let i = 0; i < 9; i++) {
        this.domainElements.push(this.originalDomain.append('text')
          .attr('class', 'original-domain')
          .attr('x', this.w / 3 + (i % 3) * this.gap)
          .attr('y', this.h / 10 + Math.floor(i / 3) * this.gap)
          .style('font-size', 30)
          .text(i + 1));
      }

    }
    //Shows the reduced domain below

  showReducedDomain(set) {
      if (set.size > 0) {
        let str = `Reduced Domain : (${[...set].toString()})`;
        this.domainWrapper.append('text')
          .attr('class', 'domain-text')
          .attr('x', this.w / 2)
          .attr('y', this.h / 1.5)
          .text(str);
      }
    }
    //Remove everything

  removeDomain() {
    this.domainWrapper.selectAll('*').remove();
  }
}

function init() {
  var puzzle = [
    [0, 0, 3, 0, 2, 0, 6, 0, 0],
    [9, 0, 0, 3, 0, 5, 0, 0, 1],
    [0, 0, 1, 8, 0, 6, 4, 0, 0],
    [0, 0, 8, 1, 0, 2, 9, 0, 0],
    [7, 0, 0, 0, 0, 0, 0, 0, 8],
    [0, 0, 6, 7, 0, 8, 2, 0, 0],
    [0, 0, 2, 6, 0, 9, 5, 0, 0],
    [8, 0, 0, 2, 0, 3, 0, 0, 9],
    [0, 0, 5, 0, 1, 0, 3, 0, 0]
  ];
  var sudokuPuzzle = new SudokuPuzzle(puzzle, 9, 9, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  var cellDetails = new CellDetails(d3.select('#sudoku').select('.cellDetails'), 500, 500);
  cellDetails.init(sudokuPuzzle);
  var sudokuDiagram = new SudokuDiagram(d3.select('#sudoku').select('.canvas'), 500, 500);
  sudokuDiagram.init(sudokuPuzzle, cellDetails);
}

$(document).ready(function() {
  init();
  $('#sudoku .restart-button').click(init);
});
