declare var $: any;
declare var SVG: any;

class Grid {

  public agent: Agent;
  public tiles: Tile[][] = [];
  protected canvas: any;
  protected GRID_SIZE: number = 4;
  protected UX_SIZE: number = 600;

  constructor() {
    for (let i = 0; i < this.GRID_SIZE; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < this.GRID_SIZE; j++) {
        this.tiles[i][j] = new Tile(i + 1, this.GRID_SIZE - j,
          this.UX_SIZE / this.GRID_SIZE);
      }
    }
    this.render();
    this.agent = new Agent(this);
    // Binding the Keypress Event
    $("html").on("keydown", (e: any) => {
      if (e.which === 37 || e.which === "A".charCodeAt(0)) {
        this.agent.move(Move.Left);
      } else if (e.which === 38 || e.which === "W".charCodeAt(0)) {
        this.agent.move(Move.Up);
      } else if (e.which === 39 || e.which === "D".charCodeAt(0)) {
        this.agent.move(Move.Right);
      } else if (e.which === 40 || e.which === "S".charCodeAt(0)) {
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

  public reset(): void {
    for (let i = 0; i < this.GRID_SIZE; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        this.tiles[i][j].reset();
      }
    }
    this.getTile(1, 1).measured = true;
    this.agent.reset();
  }

  public render() {
    this.canvas = SVG("drawing").size(this.UX_SIZE, this.UX_SIZE);
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

  constructor(x, y, blockSize = 100) {
    this.mX = x;
    this.mY = y;
    this.mWumpus = false;
    this.mPit = false;
    this.mGold = false;
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

  public reset() {
    this.measured = false;
  }

  public render(): void {
    const rOut = this.mCanvas.rect(this.BLOCK_SIZE * 0.98, this.BLOCK_SIZE * 0.98);
    const rInn = this.mCanvas.rect(this.BLOCK_SIZE * 0.75, this.BLOCK_SIZE * 0.75);
    if (this.mMeasured) {
      rOut.fill({ color: this.mMeasurement });
    } else {
      rOut.fill({ color: "#ccc" });
    }
    rInn.fill({ color: "#ddd" });
    rOut.center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2);
    rInn.center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2);
  }
}

enum Measurement {
  Stench = "#ff0000",
  Breeze = "#000000",
  StenchyBreeze = "#660000",
  Safe = "#55ff66",
}

class Agent {

  protected mX;
  protected mY;
  private mGame;
  private ux;
  private mScore;

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

  public score(): void {
    const tile = this.mGame.getTile(this.mX, this.mY);
    if (tile.hasWumpus) {
      // Add text and a Rectangle behind it
      this.ux.animate().fill("#000000").radius(5);
      const rect = this.mGame.canvas
        .rect(this.mGame.UX_SIZE, this.mGame.UX_SIZE / this.mGame.GRID_SIZE)
        .center(this.mGame.UX_SIZE / 2, this.mGame.UX_SIZE / 2).fill("#000000");
      const text = this.mGame.canvas.text("Wumpus ate you.")
        .font({ family: "Helvetica", size: 60, fill: "white" })
        .center(this.mGame.UX_SIZE / 2, this.mGame.UX_SIZE / 2);
      // Reset the game 2 seconds later
      setTimeout(() => {
        this.mGame.reset();
        rect.remove();
        text.remove();
      }, 2500);
    } else if (tile.hasPit) {
      this.ux.animate().fill("#000000").radius(5);
      // Add text and a Rectangle behind it
      const rect = this.mGame.canvas
        .rect(this.mGame.UX_SIZE, this.mGame.UX_SIZE / this.mGame.GRID_SIZE)
        .center(this.mGame.UX_SIZE / 2, this.mGame.UX_SIZE / 2).fill("#000000");
      const text = this.mGame.canvas.text("Oops, you fell in a Pit.")
        .font({ family: "Helvetica", size: 60, fill: "white" })
        .center(this.mGame.UX_SIZE / 2, this.mGame.UX_SIZE / 2);
      // Reset the game 2 seconds later
      setTimeout(() => {
        this.mGame.reset();
        rect.remove();
        text.remove();
      }, 2500);
    } else if (tile.hasGold) {
      this.ux.animate().fill("#FFD000").radius(25);
      // Add text and a Rectangle behind it
      const rect = this.mGame.canvas
        .rect(this.mGame.UX_SIZE, this.mGame.UX_SIZE / this.mGame.GRID_SIZE)
        .center(this.mGame.UX_SIZE / 2, this.mGame.UX_SIZE / 2).fill("#FFD000");
      const text = this.mGame.canvas.text("You Won GOLD!.")
        .font({ family: "Helvetica", size: 60, fill: "black" })
        .center(this.mGame.UX_SIZE / 2, this.mGame.UX_SIZE / 2);
      // Reset the game 2 seconds later
      setTimeout(() => {
        this.mGame.reset();
        rect.remove();
        text.remove();
      }, 2500);
    }
  }

  public reset(): void {
    this.mX = 1;
    this.mY = 1;
    this.render();
    this.ux.finish();
    this.ux.fill("#f06");
    this.ux.radius(10);
  }

  public render(): void {
    this.ux.finish();
    const BLOCK_SIZE = this.mGame.UX_SIZE / this.mGame.GRID_SIZE;
    this.ux.animate().center(BLOCK_SIZE * this.mX - BLOCK_SIZE / 2,
      this.mGame.UX_SIZE - BLOCK_SIZE * this.mY + BLOCK_SIZE / 2);
  }
}

enum Move {
  Left, Right, Up, Down,
}

const game: Grid = new Grid();
game.getTile(3, 1).hasPit = true;
game.getTile(3, 3).hasPit = true;
game.getTile(4, 4).hasPit = true;
game.getTile(1, 3).hasWumpus = true;
game.getTile(2, 3).hasGold = true;
game.sensorUpdate();
