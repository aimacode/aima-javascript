export class GameTile {

  protected mWumpus: boolean;
  protected mPit: boolean;
  protected mGold: boolean;
  protected mCanvas: any;
  private readonly BLOCK_SIZE: number;
  private readonly mX: number;
  private readonly mY: number;
  private mMeasurement: Measurement;
  private mMeasured: boolean;

  /**
   * Initializes the tile, assuming it has nothing, no Wumpus, no Pit, no Gold
   * @constructor
   *
   * @param x
   * @param y
   * @param blockSize
   */
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

  /**
   * Sets the canvas element over which the tile will be drawn
   *
   * @param {SVGElement} canvas - nested element on the SVG canvas
   */
  set canvas(canvas: any) {
    this.mCanvas = canvas;
  }

  /**
   * Returns the x-coordinate of the tile.
   *
   * @returns {number} x-coordinate of the tile
   */
  get x(): number {
    return this.mX;
  }

  /**
   * Returns the y-coordinate of the tile.
   *
   * @returns {number} y-coordinate of the tile
   */
  get y(): number {
    return this.mY;
  }

  /**
   * Sets the tile to have gold in it.
   *
   * @param {boolean} wumpus - true if the tile should have wumpus in it, false otherwise
   */
  set hasWumpus(wumpus: boolean) {
    this.mWumpus = wumpus;
  }

  /**
   * Returns if the tile has Wumpus.
   *
   * @returns {boolean} true if the tile has Wumpus, false otherwise
   */
  get hasWumpus(): boolean {
    return this.mWumpus;
  }

  /**
   * Sets the tile to have a pit in it.
   *
   * @param {boolean} pit - true if the tile should have a pit in it, false otherwise
   */
  set hasPit(pit: boolean) {
    this.mPit = pit;
  }

  /**
   * Returns if the tile has a Pit.
   *
   * @returns {boolean} true if the tile has a Pit, false otherwise
   */
  get hasPit(): boolean {
    return this.mPit;
  }

  /**
   * Sets the tile to have gold in it.
   *
   * @param {boolean} gold - true if the tile should have gold in it, false otherwise
   */
  set hasGold(gold: boolean) {
    this.mGold = gold;
  }

  /**
   * Returns if the tile has gold in it.
   *
   * @returns {boolean} true if the tile has gold in it, false otherwise
   */
  get hasGold(): boolean {
    return this.mGold;
  }

  /**
   * Changes the measurement in the tile to the supplied value and re-renders it.
   *
   * @param {Measurement} measurement - value of the measurement at the tile
   */
  set measurement(measurement: Measurement) {
    this.mMeasurement = measurement;
    this.render();
  }

  /**
   * Returns if the tile has been measured
   *
   * @returns {boolean} true if the tile has already been measured, false otherwise
   */
  get measurement(): Measurement {
    return this.mMeasurement;
  }

  /**
   * Sets the tile to be measured and re-renders the tile.
   *
   * @param {boolean} measured - true if the tile has been measured (visited)
   */
  set measured(measured: boolean) {
    this.mMeasured = measured;
    this.render();
  }

  /**
   * Returns if the tile has been measured
   *
   * @returns {boolean} true if the tile has already been measured, false otherwise
   */
  get measured(): boolean {
    return this.mMeasured;
  }

  /**
   * Adds a breeze to the tile if not already present.
   *
   * @param {boolean} breeze- true if there is a breeze, false otherwise
   */
  set hasBreeze(breeze: boolean) {
    if (breeze && this.mMeasurement === Measurement.Stench) {
      this.mMeasurement = Measurement.StenchyBreeze;
    } else if (breeze && this.mMeasurement === Measurement.Safe) {
      this.mMeasurement = Measurement.Breeze;
    } else if (!breeze && this.mMeasurement === Measurement.StenchyBreeze) {
      this.mMeasurement = Measurement.Stench;
    } else if (!breeze && this.mMeasurement === Measurement.Breeze) {
      this.mMeasurement = Measurement.Safe;
    }
  }

  /**
   * Checks the the tile has a breeze.
   *
   * @returns {boolean} - true if the tile has breeze, false otherwise
   */
  get hasBreeze(): boolean {
    return this.mMeasurement === Measurement.Breeze
      || this.mMeasurement === Measurement.StenchyBreeze;
  }

  /**
   * Adds a stench to the tile if not already present.
   *
   * @param {boolean} stench - true if there is a stench, false otherwise
   */
  set hasStench(stench: boolean) {
    if (stench && this.mMeasurement === Measurement.Breeze) {
      this.mMeasurement = Measurement.StenchyBreeze;
    } else if (stench && this.mMeasurement === Measurement.Safe) {
      this.mMeasurement = Measurement.Stench;
    } else if (!stench && this.mMeasurement === Measurement.StenchyBreeze) {
      this.mMeasurement = Measurement.Stench;
    } else if (!stench && this.mMeasurement === Measurement.Stench) {
      this.mMeasurement = Measurement.Safe;
    }
  }

  /**
   * Checks the the tile has a stench.
   *
   * @returns {boolean} - true if the tile has stench, false otherwise
   */
  get hasStench(): boolean {
    return this.mMeasurement === Measurement.Stench
      || this.mMeasurement === Measurement.StenchyBreeze;
  }

  /**
   * Renders out the tile, as two squares.
   *
   * @remarks
   * Tile is displayed as two squares on behind the other.
   * Outer rim shows the color denoting the measurement.
   */
  public render(forceVisibility: boolean = false): void {
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
    
    if (this.mMeasured || forceVisibility) {
      // Rendering the Icons
      if (this.hasWumpus) {
        this.mCanvas.image('img/wumpus.png',
          this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.6)
          .center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2);
      }
      else if (this.hasPit) {
        this.mCanvas.image('img/pit.png',
          this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.6)
          .center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2);
      }
      else {
        if (this.hasGold) {
          this.mCanvas.image('img/gold.png',
            this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.2)
            .center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2);
        }
        if (this.hasBreeze) {
          this.mCanvas.image('img/breeze.png',
            this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.2)
            .center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2 + this.BLOCK_SIZE * 0.25);
        }
        if (this.hasStench) {
          this.mCanvas.image('img/stench.png',
            this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.2)
            .center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2 - this.BLOCK_SIZE * 0.25);
        }
      }
    }
  }

  /**
   * Resets the tile to stop showing its measurement.
   */
  public reset(): void {
    this.measured = false;
  }
}

export enum Measurement {
  Stench = "#ff0000",
  Breeze = "#000000",
  StenchyBreeze = "#660000",
  Safe = "#55ff66",
}
