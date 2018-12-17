import { Grid } from "./grid";

export class Tile {

  protected mWumpus: boolean;
  protected mPit: boolean;
  protected mGold: boolean;
  protected mCanvas: any;
  private readonly BLOCK_SIZE: number;
  private readonly mX: number;
  private readonly mY: number;
  private mMeasurement: Measurement;
  private mMeasured: boolean;

  constructor(x: number, y: number, blockSize: number = 100) {
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

export enum Measurement {
  Stench = "#ff0000",
  Breeze = "#000000",
  StenchyBreeze = "#660000",
  Safe = "#55ff66",
}
