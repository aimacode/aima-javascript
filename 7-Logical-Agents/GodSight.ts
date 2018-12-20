import { GameGrid } from "./GameGrid";
import { GameTile } from "./GameTile";

export class GodSight {
  private readonly canvas: any;
  private readonly CENTERS: number[] = [];
  private readonly BLOCK_SIZE: number;
  private readonly GRID_SIZE: number;
  private tiles: GameTile[][] = [];
  private displayed: boolean = false;

  /**
   * Copies the relevant data from the game to variables in the object
   * @constructor
   *
   * @param {GameGrid} game - The game which is being annotated
   */
  constructor(game: GameGrid) {
    this.canvas = game.canvas.nested();
    this.BLOCK_SIZE = game.UX_SIZE / game.GRID_SIZE;
    this.GRID_SIZE = game.GRID_SIZE;
    this.tiles = game.tiles;
    for (let i = 0; i < this.GRID_SIZE; i++) {
      this.CENTERS[i] = this.BLOCK_SIZE * i + this.BLOCK_SIZE / 2;
    }
  }

  /**
   * Renders all the labels for Gold, Pit, Wumpus, Breeze and Stench.
   */
  public render(): void {
    if (this.displayed) {
      return;
    }
    for (let i = 0; i < this.GRID_SIZE; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        if (this.tiles[i][j].hasStench) {
          const s1 = this.canvas.rect(this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.15);
          s1.center(this.CENTERS[i], this.CENTERS[j] - this.BLOCK_SIZE * 0.25);
          s1.fill({ color: "#ff0000", opacity: 0.3 });
          const t1 = this.canvas.text("Stench");
          t1.center(this.CENTERS[i], this.CENTERS[j] - this.BLOCK_SIZE * 0.25);
          t1.font({ weight: "bold", fill: "black" });
        }
        if (this.tiles[i][j].hasWumpus) {
          const s2 = this.canvas.rect(this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.15);
          s2.center(this.CENTERS[i], this.CENTERS[j] - this.BLOCK_SIZE * 0.10);
          s2.fill({ color: "#ff0000", opacity: 1.0 });
          const t2 = this.canvas.text("Wumpus");
          t2.center(this.CENTERS[i], this.CENTERS[j] - this.BLOCK_SIZE * 0.10);
          t2.font({ weight: "bold", fill: "white" });
        }
        if (this.tiles[i][j].hasGold) {
          const s5 = this.canvas.rect(this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.15);
          s5.center(this.CENTERS[i], this.CENTERS[j] + this.BLOCK_SIZE * 0.00);
          s5.fill({ color: "#ffff00", opacity: 1.0 });
          const t5 = this.canvas.text("Gold");
          t5.center(this.CENTERS[i], this.CENTERS[j] + this.BLOCK_SIZE * 0.00);
          t5.font({ weight: "bold", fill: "black" });
        }
        if (this.tiles[i][j].hasPit) {
          const s3 = this.canvas.rect(this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.15);
          s3.center(this.CENTERS[i], this.CENTERS[j] + this.BLOCK_SIZE * 0.10);
          s3.fill({ color: "#000000", opacity: 1.0 });
          const t3 = this.canvas.text("Pit");
          t3.center(this.CENTERS[i], this.CENTERS[j] + this.BLOCK_SIZE * 0.10);
          t3.font({ weight: "bold", fill: "white" });
        }
        if (this.tiles[i][j].hasBreeze) {
          const s4 = this.canvas.rect(this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.15);
          s4.center(this.CENTERS[i], this.CENTERS[j] + this.BLOCK_SIZE * 0.25);
          s4.fill({ color: "#000000", opacity: 0.3 });
          const t4 = this.canvas.text("Breeze");
          t4.center(this.CENTERS[i], this.CENTERS[j] + this.BLOCK_SIZE * 0.25);
          t4.font({ weight: "bold", fill: "black" });
        }
      }
    }
    this.displayed = true;
  }

  /**
   * Delete all labels rendered by this module on the canvas
   */
  public hide(): void {
    this.canvas.clear();
    this.displayed = false;
  }
}
