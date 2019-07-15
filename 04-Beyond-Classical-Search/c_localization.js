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
                              .attr('x',this.mazeDiagram.xScale(this.j) + this.cellWidth/2)
                              .attr('y',this.mazeDiagram.yScale(this.i) + this.cellHeight/2)
                              .attr('height',0)
                              .attr('width',0)
                              .attr('fill','blue');

    this.robot.transition().duration(200)
                              .attr('x',this.mazeDiagram.xScale(this.j) + this.cellWidth/2 - this.w/2)
                              .attr('y',this.mazeDiagram.yScale(this.i) + this.cellHeight/2 - this.h/2)
                              .attr('height',this.h)
                              .attr('width',this.w);
  }

  destroy() {
    this.robot.transition().duration(200)
              .attr('x',this.mazeDiagram.xScale(this.j) + this.cellWidth/2)
              .attr('y',this.mazeDiagram.yScale(this.i) + this.cellHeight/2)
              .attr('height',0)
              .attr('width',0)
              .remove();
  }

  move() {
    this.i = this.mazeBot.currLocation[0];
    this.j = this.mazeBot.currLocation[1];
    this.robot.transition().duration(700)
              .attr('x',this.mazeDiagram.xScale(this.j) + this.cellWidth/2 - this.w/2)
              .attr('y',this.mazeDiagram.yScale(this.i) + this.cellHeight/2 - this.h/2);
  }

  highlightIncorrect() {
    this.robot.style('fill','red');
  }
}

class MazeDiagram {
  constructor(selector,h,w) {
    this.selector = selector;
    this.h = h;
    this.w = w;
    this.svg = this.selector.select('.canvas').html("")
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
                          .attr('d',`M ${x1} ${y1}
                                    L ${x2} ${y1}`)
                          .attr('stroke',this.wallColor)
                          .attr('stroke-width',0)
                          .transition().duration(200)
                          .attr('stroke-width',6);
    }
    if(percept.S) {
      this.perceptBoundary.append('path')
                          .attr('d',`M ${x1} ${y2}
                                    L ${x2} ${y2}`)
                          .attr('stroke',this.wallColor)
                          .attr('stroke-width',0)
                          .transition().duration(200)
                          .attr('stroke-width',6);
    }
    if(percept.W) {
      this.perceptBoundary.append('path')
                          .attr('d',`M ${x1} ${y1}
                                    L ${x1} ${y2}`)
                          .attr('stroke',this.wallColor)
                          .attr('stroke-width',0)
                          .transition().duration(200)
                          .attr('stroke-width',6);
    }
    if(percept.E) {
      this.perceptBoundary.append('path')
                          .attr('d',`M ${x2} ${y1}
                                    L ${x2} ${y2}`)
                          .attr('stroke',this.wallColor)
                          .attr('stroke-width',0)
                          .transition().duration(200)
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

  isRobotExist(coords) {
    for(let i = 0; i < this.robots.length; i++) {
      if(this.robots[i].currLocation[0] == coords[0] && this.robots[i].currLocation[1] == coords[1]) {
        return i;
      }
    }
    return -1;
  }

  removeRobot(index) {
    this.robotDiagrams[index].destroy();
    this.robots.splice(index,1);
    this.robotDiagrams.splice(index,1);
    this.highlightPositions();
  }

  addRobot(coords) {
    //Check if robot already added
    let i = this.isRobotExist(coords);
    if(i > -1) {
      this.removeRobot(i);
      return;
    }
    let robot = new MazeBot(coords,this.maze);
    let robotDiagram = new MazeBotDiagram(this,robot);
    this.robots.push(robot);
    this.robotDiagrams.push(robotDiagram);
  }

  bindHover(effects) {
    for(let i = 0; i < this.cells.length; i++) {
      for(let j = 0; j < this.cells[i].length; j++) {
        let cell = this.cells[i][j];
        if(!this.maze.isBlocked([i,j])) {
          cell.on('mouseover',() => {
              this.hoveredCell = [i,j];
              this.cells[i][j].raise().transition().duration(200)
                              .select('rect')
                              .attr('height',this.cellHeight*1.2)
                              .attr('width',this.cellWidth*1.2)
                              .attr('x',this.xScale(j) - this.cellWidth*0.2/2)
                              .attr('y',this.yScale(i) - this.cellHeight*0.2/2);
              if(effects.percept) {
                this.drawPercept([i,j]);
              }
              if(effects.highlightAll) {
                let cells = this.maze.getCellsFromPercept(this.maze.getPercept([i,j]));
                for(let i = 0; i < cells.length; i++) {
                  this.drawPercept(cells[i]);
                }
              }
            })
            .on('mouseout',() => {
              this.cells[i][j].raise().transition().duration(200)
                              .select('rect')
                              .attr('height',this.cellHeight)
                              .attr('width',this.cellWidth)
                              .attr('x',this.xScale(j))
                              .attr('y',this.yScale(i));
              this.perceptBoundary.html('');
            });
        }
      }
    }
  }

  bindClickToAddRobot() {
    for(let i = 0; i < this.cells.length; i++) {
      for(let j = 0; j < this.cells[i].length; j++) {
        let cell = this.cells[i][j];
        if(!this.maze.isBlocked([i,j])) {
          cell.on('click',() => {
            this.addRobot([i,j]);
            this.highlightPositions();
          });
        }
      }
    }
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

  getRandomBot() {
    let location = this.maze.getRandomLocation();
    this.mainRobot = new MazeBot(location,this.maze);
    let perceptText = this.maze.stringifyPercept(this.mainRobot.percept);
    this.updatePercept(perceptText);
  }

  updatePercept(perceptText) {
    if(perceptText == '') {
      perceptText = 'Empty'
    }
    this.selector.select('.sidePanel1').html('').append('h3').text(`Current Percept: ${perceptText}`)
  }

  highlightPositions() {
    let obj = this.maze.getWrongRobots(this.robots,this.mainRobot.percept);
    for(let i = 0; i < obj.wrongRobotsIndices.length; i++) {
      let wrongRobot = this.robotDiagrams[obj.wrongRobotsIndices[i]];
      wrongRobot.highlightIncorrect();
    }
    let text = (obj.unoccupiedPositions.length > 0)?
                            `${obj.unoccupiedPositions.length} positions left.`
                            :`\u2714 All positions found.`
    this.selector.select('.sidePanel2').html('').append('h3').text(text);
  }

  moveAllBots(direction) {
    for(let i = 0; i < this.robots.length; i++) {
      this.robots[i].move(direction);
      this.robotDiagrams[i].move();
    }
    this.mainRobot.move(direction);
    this.updatePercept(this.maze.stringifyPercept(this.mainRobot.percept));
  }
}

class LocalizationDiagram {
  constructor(selector,h,w) {
    this.selector = selector;
    this.h = h;
    this.w = w;
    this.mazeDiagram = new MazeDiagram(this.selector,this.h,this.w);
  }

  init(maze) {
    this.maze = maze;
    this.mazeDiagram.init(this.maze);
    this.mazeDiagram.bindHover({percept:false});
    this.mazeDiagram.getRandomBot();
    this.panel = this.selector.select('.sidePanel2');
    this.panel.select('.up').on('mousedown',() => {
      this.mazeDiagram.moveAllBots('up');
      this.removeInconsistentBots();
    });
    this.panel.select('.down').on('mousedown',() => {
      this.mazeDiagram.moveAllBots('down');
      this.removeInconsistentBots();
    });
    this.panel.select('.left').on('mousedown',() => {
      this.mazeDiagram.moveAllBots('left');
      this.removeInconsistentBots();
    });
    this.panel.select('.right').on('mousedown',() => {
      this.mazeDiagram.moveAllBots('right');
      this.removeInconsistentBots();
    });
    let cells = this.maze.getCellsFromPercept(this.mazeDiagram.mainRobot.percept);
    for(let i = 0; i < cells.length; i++) {
      this.mazeDiagram.addRobot(cells[i]);
    }
  }

  removeInconsistentBots() {
    let obj = this.maze.getWrongRobots(this.mazeDiagram.robots,this.mazeDiagram.mainRobot.percept);
    for(let i = 0; i < obj.wrongRobotsIndices.length; i++) {
      let bot = this.mazeDiagram.robotDiagrams[obj.wrongRobotsIndices[i]];
      bot.robot.transition().duration(700)
              .attr('x',bot.mazeDiagram.xScale(bot.j) + bot.cellWidth/2 - bot.w/2)
              .attr('y',bot.mazeDiagram.yScale(bot.i) + bot.cellHeight/2 - bot.h/2)
              .transition().duration(200)
              .style('fill','red')
              .transition().duration(200)
              .attr('x',bot.mazeDiagram.xScale(bot.j) + bot.cellWidth/2)
              .attr('y',bot.mazeDiagram.yScale(bot.i) + bot.cellHeight/2)
              .attr('height',0)
              .attr('width',0)
              .remove();
    }
    this.mazeDiagram.robots = this.mazeDiagram.robots.filter(function(robot,index){
      return obj.wrongRobotsIndices.indexOf(index) == -1;
    });
    this.mazeDiagram.robotDiagrams = this.mazeDiagram.robotDiagrams.filter(function(robot,index){
      return obj.wrongRobotsIndices.indexOf(index) == -1;
    });
  }

  success() {
    console.log('Completed');
    console.log(this.mazeDiagram.robots);
  }
}

$(document).ready(function() {
  function init() {
    let maze = new MazeMap();
    let mazeDiagram = new MazeDiagram(d3.select('#localization1'),160,628);
    mazeDiagram.init(maze);
    mazeDiagram.bindHover({percept:false});
    mazeDiagram.bindClickToAddRobot();
    mazeDiagram.getRandomBot();
    mazeDiagram.highlightPositions();
  }
  d3.select('#localization1').select('.restart-button').on('click',init);
  init();
});

$(document).ready(function() {
  function init() {
    let maze = new MazeMap();
    let mazeDiagram = new MazeDiagram(d3.select('#localization2'),160,628);
    mazeDiagram.init(maze);
    mazeDiagram.bindHover({percept:true, highlightAll:true});
  }
  init();
});
$(document).ready(function() {
  function init() {
    let maze = new MazeMap();
    let localizationDiagram = new LocalizationDiagram(d3.select('#localization3'),160,628);
    localizationDiagram.init(maze);
  }
  d3.select('#localization3').select('.restart-button').on('click',init);
  init();
});
