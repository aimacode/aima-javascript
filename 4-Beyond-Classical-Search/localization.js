class MazeMap {
  constructor() {
    this.rows = 4;
    this.cols = 16;

    this.maze = [
      [1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
      [0,0,1,1,0,1,0,0,1,0,1,0,1,0,0,0],
      [0,1,1,1,0,1,0,0,1,1,1,1,1,0,0,1],
      [1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,1]
    ];

    this.robot = [0,0];
  }

  getShape() {
    return [this.rows,this.cols];
  }

  inBound(coords) {
    if(coords[0] < 0 || coords[0] >= this.rows || coords[1] < 0 || coords[1] >= this.cols) {
      return false;
    }
    return true;
  }

  isBlocked(coords) {
    return (!this.inBound(coords) || this.maze[coords[0]][coords[1]] == 0);
  }

  getPercept(coords) {
    let walls = {
      'N' : false,
      'S' : false,
      'E' : false,
      'W' : false
    };
    let up = [coords[0]-1,coords[1]],
        down = [coords[0]+1,coords[1]],
        left = [coords[0],coords[1]-1],
        right = [coords[0],coords[1]+1];

    if(this.isBlocked(up)) {
      walls['N'] = true;
    }
    if(this.isBlocked(down)) {
      walls['S'] = true;
    }
    if(this.isBlocked(left)) {
      walls['W'] = true;
    }
    if(this.isBlocked(right)) {
      walls['E'] = true;
    }
    return walls;
  }

  stringifyPercept(percept) {
    if(typeof percept == "string"){
      return percept
    }
    let str = '';
    if(percept.N) str += 'N';
    if(percept.S) str += 'S';
    if(percept.W) str += 'W';
    if(percept.E) str += 'E';
    return str;
  }

  getCellsFromPercept(percept) {
    let perceptText = this.stringifyPercept(percept);
    let cells = [];
    for(let i = 0; i < this.rows; i++) {
      for(let j = 0; j < this.cols; j++) {
        if(this.maze[i][j] && perceptText == this.stringifyPercept(this.getPercept([i,j]))) {
          cells.push([i,j])
        }
      }
    }
    return cells;
  }

  getRandomLocation() {
    let found = false;
    while(!found) {
      let i = Math.floor(Math.random()*(this.rows));
      let j = Math.floor(Math.random()*(this.cols));
      if(!this.isBlocked([i,j])) {
        return [i,j];
      }
    }
  }

  //Receives a list of robot positions and a percept.
  //Returns an obj containing list of robots that do not match the percept
  //and a list of locations that match the percept but do not have a robot
  getWrongRobots(robots,percept) {
    let correctPositions = this.getCellsFromPercept(percept);
    let obj = {
      wrongRobotsIndices : Array.from(Array(robots.length).keys()),
      unoccupiedPositions: correctPositions.slice()
    };

    obj.wrongRobotsIndices = obj.wrongRobotsIndices.filter((index) => {
      let pos = robots[index].currLocation;
      for(let i = 0; i < correctPositions.length; i++) {
        let correctPosition = correctPositions[i];
        if(correctPosition[0] == pos[0] && correctPosition[1] == pos[1]) {
          return false;
        }
      }
      return true;
    })

    obj.unoccupiedPositions = obj.unoccupiedPositions.filter((x) => {
      for(let i = 0; i < robots.length; i++) {
        let pos = robots[i].currLocation;
        if(x[0] == pos[0] && x[1] == pos[1]) {
          return false;
        }
      }
      return true;
    })

    return obj;
  }

}

class MazeBot {
  constructor(start,map) {
    this.currLocation = start;
    this.map = map;
    this.percept = this.map.getPercept(this.currLocation);
  }

  move(direction) {
    switch(direction) {
      case 'left' : let left = [this.currLocation[0],this.currLocation[1]-1];
                    if(this.map.isBlocked(left)) {
                      return false;
                    }
                    this.currLocation = left;
                    this.percept = this.map.getPercept(this.currLocation);
                    return true;
      case 'right' : let right = [this.currLocation[0],this.currLocation[1]+1];
                    if(this.map.isBlocked(right)) {
                      return false;
                    }
                    this.currLocation = right;
                    this.percept = this.map.getPercept(this.currLocation);
                    return true;
      case 'up' : let up = [this.currLocation[0]-1,this.currLocation[1]];
                    if(this.map.isBlocked(up)) {
                      return false;
                    }
                    this.currLocation = up;
                    this.percept = this.map.getPercept(this.currLocation);
                    return true;
      case 'down' : let down = [this.currLocation[0]+1,this.currLocation[1]];
                    if(this.map.isBlocked(down)) {
                      return false;
                    }
                    this.currLocation = down;
                    this.percept = this.map.getPercept(this.currLocation);
                    return true;
    }
  }

}

let map = new MazeMap();
let bot = new MazeBot([0,0],map);
