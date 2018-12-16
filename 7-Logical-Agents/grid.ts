declare var $: any;
declare var SVG: any;

class Grid {

  public agent: Agent;
  public tiles: Tile[][] = [];
  protected canvas: any;
  protected GRID_SIZE: number = 4;
  protected UX_SIZE: number = 400;

  constructor() {
    for (let i = 0; i < this.GRID_SIZE; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < this.GRID_SIZE; j++) {
        this.tiles[i][j] = new Tile(i + 1, this.GRID_SIZE - j);
      }
    }
    this.render();
    this.agent = new Agent(this);
    // Binding the Keypress Event
    $("html").on("keydown", (e: any) => {
      if (e.which === 37) {
        this.agent.move(Move.Left);
      } else if (e.which === 38) {
        this.agent.move(Move.Up);
      } else if (e.which === 39) {
        this.agent.move(Move.Right);
      } else if (e.which === 40) {
        this.agent.move(Move.Down);
      }
    });
  }

  public getTile(i: number, j: number): Tile {
    i = i - 1;
    j = this.GRID_SIZE - j;
    if (i < 0 || j < 0 || i >= this.GRID_SIZE || j >= this.GRID_SIZE) {
      throw new Error("Accessing invalid tile index (" + i + "," + j + ")");
    }
    return this.tiles[i][j];
  }

  public getNeighbors(tile: Tile): Tile[] {
    const result: Tile[] = [];
    if (tile.x > 1) {
        result.push(this.getTile(tile.x - 1, tile.y));
    }
    if (tile.x < this.GRID_SIZE) {
      result.push(this.getTile(tile.x + 1, tile.y));
    }
    if (tile.y > 1) {
      result.push(this.getTile(tile.x, tile.y - 1));
    }
    if (tile.y < this.GRID_SIZE) {
      result.push(this.getTile(tile.x, tile.y + 1));
    }
    return result;
  }

  public sensorUpdate() {
    // Loop over all tiles
    for (let i = 0; i < this.GRID_SIZE; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        // Check if tile[i][j] has a breeze/stench due to a neighbors.
        let stench: boolean = false;
        let breeze: boolean = false;
        for (const neighbor of this.getNeighbors(this.tiles[i][j])) {
          stench = neighbor.hasWumpus || stench;
          breeze = neighbor.hasPit || breeze;
        }
        // Set the measurement of the tile based on it's neighbors and render.
        this.tiles[i][j].measurement = breeze
          ? (stench ? Measurement.StenchyBreeze : Measurement.Breeze)
          : (stench ? Measurement.Stench : Measurement.Safe);
        this.tiles[i][j].render();
      }
    }
  }

  protected render() {
    this.canvas = SVG("drawing").size(400, 400);
    const BLOCK_SIZE: number = this.UX_SIZE / this.GRID_SIZE;
    for (let i = 0; i < this.GRID_SIZE; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        this.tiles[i][j].canvas = this.canvas.nested()
          .attr({ x: BLOCK_SIZE * i, y: BLOCK_SIZE * j });
        this.tiles[i][j].render();
      }
    }
  }
}

class Tile {

  protected mWumpus: boolean;
  protected mPit: boolean;
  protected mGold: boolean;
  protected mCanvas: any;
  private readonly BLOCK_SIZE: number;
  private readonly mX: number;
  private readonly mY: number;
  private mMeasurement: Measurement;
  private mMeasured: boolean;

  constructor(x, y, gold = false, wumpus = false, pit = false,
              stench = false, breeze = false, blockSize = 100) {
    this.mX = x;
    this.mY = y;
    this.mWumpus = wumpus;
    this.mPit = pit;
    this.mGold = gold;
    this.BLOCK_SIZE = blockSize;
    this.mMeasurement = Measurement.Safe;
    this.mMeasured = false;
  }

  set canvas(canvas: any) { this.mCanvas = canvas; }
  get x(): number { return this.mX; }
  get y(): number { return this.mY; }
  set hasWumpus(wumpus: boolean) { this.mWumpus = wumpus; }
  get hasWumpus(): boolean { return this.mWumpus; }
  set hasPit(pit: boolean) { this.mPit = pit; }
  get hasPit(): boolean { return this.mPit; }
  set hasGold(gold: boolean) { this.mGold = gold; }
  get hasGold(): boolean { return this.mGold; }

  set measurement(measurement: Measurement) {
    this.mMeasurement = measurement;
    this.render();
  }
  set measured(measured: boolean) {
    this.mMeasured = measured;
    this.render();
  }

  public render(): void {
    const rOut = this.mCanvas.rect(this.BLOCK_SIZE, this.BLOCK_SIZE);
    const rInn = this.mCanvas.rect(this.BLOCK_SIZE * 0.8, this.BLOCK_SIZE * 0.8);
    if (this.mMeasured) {
      rOut.fill({ color: this.mMeasurement });
    } else {
      rOut.fill({ color: "#ccc" });
    }
    rInn.fill({ color: "#ddd" });
    rInn.center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2);
  }
}

enum Measurement {
  Stench = "#fd6",
  Breeze = "#7af",
  StenchyBreeze = "#8d6",
  Safe = "#f06",
}

class Agent {

  public ux;
  protected mX;
  protected mY;
  private mGame;

  constructor(grid: Grid) {
    this.mX = 1;
    this.mY = 1;
    this.mGame = grid;
    this.measure();
    this.ux = this.mGame.canvas.circle(20);
    this.ux.fill("#f06");
    this.ux.center(this.mGame.UX_SIZE / (2 * this.mGame.GRID_SIZE),
      this.mGame.UX_SIZE - (this.mGame.UX_SIZE / (2 * this.mGame.GRID_SIZE)));
  }

  get x(): number { return this.mX; }
  get y(): number { return this.mY; }

  public move(move: Move): void {
    if (move === Move.Up && this.mY < this.mGame.GRID_SIZE) {
      this.mY += 1;
    } else if (move === Move.Down && this.mY > 1) {
      this.mY -= 1;
    } else if (move === Move.Right && this.mX < this.mGame.GRID_SIZE) {
      this.mX += 1;
    } else if (move === Move.Left && this.mX > 1) {
      this.mX -= 1;
    }
    this.render();
    this.measure();
    this.score();
  }

  public measure(): Measurement {
    this.mGame.getTile(this.x, this.y).measured = true;
    return this.mGame.getTile(this.x, this.y).measurement;
  }

  public render(): void {
    this.ux.finish();
    const BLOCK_SIZE = this.mGame.UX_SIZE / this.mGame.GRID_SIZE;
    this.ux.animate().center(BLOCK_SIZE * this.mX - BLOCK_SIZE / 2,
      this.mGame.UX_SIZE - BLOCK_SIZE * this.mY + BLOCK_SIZE / 2);
  }

  public score(): void {
    if (this.mGame.getTile(this.mX, this.mY).hasWumpus) {
      this.ux.animate().fill("#000000");
    } else if (this.mGame.getTile(this.mX, this.mY).hasPit) {
      this.ux.animate().fill("#000000");
    } else if (this.mGame.getTile(this.mX, this.mY).hasGold) {
      this.ux.animate().fill("#FFD700");
    }
  }
}

enum Move {
  Left, Right, Up, Down, Reset,
}

const game: Grid = new Grid();
game.getTile(3, 1).hasPit = true;
game.getTile(3, 3).hasPit = true;
game.getTile(4, 4).hasPit = true;
game.getTile(1, 3).hasWumpus = true;
game.getTile(2, 3).hasGold = true;
game.sensorUpdate();