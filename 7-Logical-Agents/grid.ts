declare var SVG: any;

class Grid {

  public tiles: Tile[][] = [];
  protected canvas: any;
  protected GRID_SIZE: number = 4;
  protected UX_SIZE: number = 400;

  constructor() {
    for (let i = 0; i < this.GRID_SIZE; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < this.GRID_SIZE; j++) {
        this.tiles[i][j] = new Tile(i, j);
      }
    }
    this.render();
  }

  protected render() {
    this.canvas = SVG("drawing").size(400, 400);
    const BLOCK_SIZE: number = this.UX_SIZE / this.GRID_SIZE;
    for (let i = 0; i < this.GRID_SIZE; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        const subfigure: any = this.canvas.nested(100, 100)
          .attr({x: BLOCK_SIZE * i, y: BLOCK_SIZE * j});
        this.tiles[i][j].setCanvas(subfigure);
        this.tiles[i][j].render();
      }
    }
  }
}

class Tile {

  public x: number;
  public y: number;
  public wumpus: boolean;
  public pit: boolean;
  public gold: boolean;
  protected stench: boolean;
  protected breeze: boolean;
  protected canvas: any;
  private readonly BLOCK_SIZE: number;
  private measurementColor: MeasurementColor;

  constructor(x, y, gold = false, wumpus = false, pit = false,
              stench = false, breeze = false, blockSize = 100) {
    this.x = x;
    this.y = y;
    this.wumpus = wumpus;
    this.pit = pit;
    this.gold = gold;
    this.stench = stench;
    this.breeze = breeze;
    this.BLOCK_SIZE = blockSize;
    this.measurementColor = MeasurementColor.Unknown;
  }

  public setCanvas(canvas: any): void {
    this.canvas = canvas;
  }

  public render(): void {
    const rOut = this.canvas.rect(this.BLOCK_SIZE, this.BLOCK_SIZE);
    const rInn = this.canvas.rect(this.BLOCK_SIZE * 0.8, this.BLOCK_SIZE * 0.8);
    rOut.fill({ color: this.measurementColor });
    rInn.fill({ color: "#ddd" });
    rInn.center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2);
  }

  public setMeasurementColor(stench: boolean, breeze: boolean,
                             reset: boolean = false): void {
    this.stench = stench;
    this.breeze = breeze;
    if (reset) {
      this.measurementColor = MeasurementColor.Unknown;
    } else if (this.stench && this.breeze) {
      this.measurementColor = MeasurementColor.StenchyBreeze;
    } else if (this.stench) {
      this.measurementColor = MeasurementColor.Stench;
    } else if (this.breeze) {
      this.measurementColor = MeasurementColor.Breeze;
    } else {
      this.measurementColor = MeasurementColor.Safe;
    }
    this.render();
  }
}

enum MeasurementColor {
  Stench = "#fd6",
  Breeze = "#8d6",
  StenchyBreeze = "#000",
  Safe = "#f06",
  Unknown = "#ccc",
}

const game: Grid = new Grid();
game.tiles[2][1].setMeasurementColor(true, false);
game.tiles[3][2].setMeasurementColor(false, false);
game.tiles[1][2].setMeasurementColor(true, true);
game.tiles[0][1].setMeasurementColor(false, true);
