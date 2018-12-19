import { Grid } from "./grid";

declare var SVG: any;

export class Filtering {

  protected canvas: any[] = [];
  protected game: Grid;
  private canvasParent: any;
  private readonly ELEMENT = "drawing-models";
  private readonly UX_SIZE = 250;

  constructor(game: Grid) {
    this.game = game;
    // Initializing the 8 nested SVG canvases for each future move
    this.canvasParent = SVG(this.ELEMENT).size(this.UX_SIZE * 4.04, this.UX_SIZE * 2.02);
    for (let i = 0; i < 4; i++) {
      this.canvas[i] = this.canvasParent.nested().size(this.UX_SIZE, this.UX_SIZE);
      this.canvas[i].center((i + 0.5) * this.UX_SIZE * 1.01, (0.5) * this.UX_SIZE * 1.01);
    }
    for (let i = 0; i < 4; i++) {
      this.canvas[i + 4] = this.canvasParent.nested().size(this.UX_SIZE, this.UX_SIZE);
      this.canvas[i + 4].center((i + 0.5) * this.UX_SIZE * 1.01, (1.5) * this.UX_SIZE * 1.01);
    }
  }

  public render(): void {
    for (let x = 0; x < 8; x++) {
      for (let i = 1; i <= 4; i++) {
        for (let j = 1; j <= 4; j++) {
          // Generate the tile
          const r = this.canvas[x]
            .rect((0.25) * this.UX_SIZE, (0.25) * this.UX_SIZE )
            .center((i - 0.5) * this.UX_SIZE / 4, (4.5 - j) * this.UX_SIZE / 4);
          const s = this.canvas[x]
            .rect((0.15) * this.UX_SIZE, (0.15) * this.UX_SIZE )
            .center((i - 0.5) * this.UX_SIZE / 4, (4.5 - j) * this.UX_SIZE / 4);
          // Copying the measurement colors
          if (this.game.getTile(i, j).measured) {
            r.fill({ color: this.game.getTile(i, j).measurement });
          } else {
            r.fill({ color: "#dddddd" });
          }
          // Inner measurement color
          s.fill({ color: "#ffffff" });
        }
      }
    }
  }
}
