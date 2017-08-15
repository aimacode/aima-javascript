class MazeBotDiagram {
  constructor(mazeDiagram,mazeBot) {
    this.mazeDiagram = mazeDiagram;
    this.mazeBot = mazeBot;
    this.cellHeight = this.mazeDiagram.cellHeight;
    this.cellWidth = this.mazeDiagram.cellWidth;
    this.h = this.cellHeight*0.8;
    this.w = this.cellWidth*0.8;
    this.i = this.mazeBot.currLocation[0];
    this.j = this.mazeBot.currLocation[1];
    this.robot = this.mazeDiagram.robotWrapper.append('rect')
                              .attr('x',this.mazeDiagram.xScale(this.j) + this.cellWidth/2 - this.w/2)
                              .attr('y',this.mazeDiagram.yScale(this.i) + this.cellHeight/2 - this.h/2)
                              .attr('height',this.h)
                              .attr('width',this.w)
                              .attr('fill','blue');
  }

  move() {
    this.i = this.mazeBot.currLocation[0];
    this.j = this.mazeBot.currLocation[1];
    this.robot.transition().duration(700)
              .attr('x',this.mazeDiagram.xScale(this.j) + this.cellWidth/2 - this.w/2)
              .attr('y',this.mazeDiagram.yScale(this.i) + this.cellHeight/2 - this.h/2);
  }
}

class MazeDiagram {
  constructor(selector,h,w) {
    this.selector = selector;
    this.h = h;
    this.w = w;
    this.svg = this.selector.html("")
              .append('svg')
              .attr('height',this.h)
              .attr('width',this.w);
  }

  init(maze) {
    this.maze = maze;
    this.padding = 10;
    let shape = this.maze.getShape();
    this.rows = shape[0];
    this.cols = shape[1];
    this.cellWidth = (this.w - 2*this.padding)/this.cols;
    this.cellHeight = (this.h - 2*this.padding)/this.rows;
    this.xScale = x => this.padding + this.cellWidth*x;
    this.yScale = x => this.padding + this.cellHeight*x;
    this.wallColor = 'hsla(360, 70%, 70%, 1)';

    this.drawMaze();
  }

  drawPercept(coords) {
    let percept = this.maze.getPercept(coords);
    let i = coords[0];
    let j = coords[1];
    let perceptText = this.maze.stringifyPercept(percept);
    let x1 = this.xScale(j)- this.cellWidth*0.2/2;
    let x2 = this.xScale(j)- this.cellWidth*0.2/2 + this.cellWidth*1.2;
    let y1 = this.yScale(i)- this.cellHeight*0.2/2;
    let y2 = this.yScale(i)- this.cellHeight*0.2/2 + this.cellHeight*1.2;
    if(i != this.hoveredCell[0] || j != this.hoveredCell[1]) {
      x1 = this.xScale(j);
      x2 = this.xScale(j) + this.cellWidth;
      y1 = this.yScale(i);
      y2 = this.yScale(i)+ this.cellHeight;
    }
    if(percept.N) {
      this.perceptBoundary.append('path')
                          .transition().duration(150)
                          .attr('d',`M ${x1} ${y1}
                                    L ${x2} ${y1}`)
                          .attr('stroke',this.wallColor)
                          .attr('stroke-width',6);
    }
    if(percept.S) {
      this.perceptBoundary.append('path')
                          .transition().duration(150)
                          .attr('d',`M ${x1} ${y2}
                                    L ${x2} ${y2}`)
                          .attr('stroke',this.wallColor)
                          .attr('stroke-width',6);
    }
    if(percept.W) {
      this.perceptBoundary.append('path')
                          .transition().duration(150)
                          .attr('d',`M ${x1} ${y1}
                                    L ${x1} ${y2}`)
                          .attr('stroke',this.wallColor)
                          .attr('stroke-width',6);
    }
    if(percept.E) {
      this.perceptBoundary.append('path')
                          .transition().duration(150)
                          .attr('d',`M ${x2} ${y1}
                                    L ${x2} ${y2}`)
                          .attr('stroke',this.wallColor)
                          .attr('stroke-width',6);
    }
    this.perceptBoundary.append('text')
                        .attr('x',this.xScale(j) + this.cellWidth/2)
                        .attr('y',this.yScale(i) + this.cellHeight/2)
                        .attr('text-anchor','middle')
                        .attr('alignment-baseline','middle')
                        .attr('font-size',10)
                        .text(perceptText)
  }

  addRobot(coords) {
    let robot = new MazeBot([i,j],this.maze);
    let robotDiagram = new MazeBotDiagram(this,robot);
    this.robots.push(robot);
    this.robotDiagrams.push(robotDiagram);
  }

  drawMaze() {
    //Maze Wrapper
    this.mazeSVG = this.svg.append('g')
                            .attr('class','maze');
    //Draw Boundary
    this.svg.append('g')
            .attr('class','boundary')
            .append('rect')
            .attr('height',this.cellHeight*this.rows + this.padding)
            .attr('width', this.cellWidth*this.cols + this.padding)
            .attr('x',this.padding/2)
            .attr('y',this.padding/2)
            .style('stroke-width',this.padding);
    //Percept Boundary Wrapper
    this.perceptBoundary = this.svg.append('g')
                            .attr('class','perceptBoundary')
                            .style('pointer-events','none');

    this.robotWrapper = this.svg.append('g')
                              .attr('class','robotWrapper')
                              .style('pointer-events','none');
    //mouseover function

    //Draw Cells
    this.cells = [];
    this.robots = [];
    this.robotDiagrams = [];
    for(let i = 0; i < this.rows; i++) {
      let row = [];
      for(let j = 0; j < this.cols; j++) {
        let cell = this.mazeSVG.append('g')
          .attr('class','cell clickable');
        if(this.maze.isBlocked([i,j])) {
          cell.classed('blocked',this.maze.isBlocked([i,j]));
        } else {
          cell.on('mouseover',() => {
              this.hoveredCell = [i,j];
              this.cells[i][j].raise().transition().duration(100)
                              .select('rect')
                              .attr('height',this.cellHeight*1.2)
                              .attr('width',this.cellWidth*1.2)
                              .attr('x',this.xScale(j) - this.cellWidth*0.2/2)
                              .attr('y',this.yScale(i) - this.cellHeight*0.2/2);
              this.drawPercept([i,j]);
            })
            .on('mouseout',() => {
              this.cells[i][j].raise().transition().duration(100)
                              .select('rect')
                              .attr('height',this.cellHeight)
                              .attr('width',this.cellWidth)
                              .attr('x',this.xScale(j))
                              .attr('y',this.yScale(i));
              this.perceptBoundary.html('');
            })
            .on('click',() => {
              this.addRobot([i,j]);
            });
        }

        let rect = cell.append('rect')
                      .attr('height',this.cellHeight)
                      .attr('width',this.cellWidth)
                      .attr('x',this.xScale(j))
                      .attr('y',this.yScale(i));
        row.push(cell);
      }
      this.cells.push(row);
    }

  }
}

$(document).ready(function() {
  let maze = new MazeMap();
  let mazeDiagram = new MazeDiagram(d3.select('#localization').select('.canvas'),160,628);
  mazeDiagram.init(maze);
});
