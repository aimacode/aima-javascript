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
    const curX = this.game.agent.x;
    const curY = this.game.agent.y;
    for (let x = 0; x < 8; x++) {
      // delete the old grid
      this.canvas[x].clear();
      // generating the index of the next tile
      let posX = curX;
      let posY = curY;
      if ((x === 0 || x === 4) && (curX < this.game.GRID_SIZE)) {
        posX++;
      } else if ((x === 1 || x === 5) && (curY < this.game.GRID_SIZE)) {
        posY++;
      } else if ((x === 2 || x === 6) && (curX > 1)) {
        posX--;
      } else if ((x === 3 || x === 7) && (curY > 1)) {
        posY--;
      }
      // Quit if there are no valid moves
      if (curX === posX && curY === posY) {
        this.canvas[x].rect(this.UX_SIZE, this.UX_SIZE)
          .fill({ color: "#ddd", opacity: "0.5" })
        this.canvas[x].rect(this.UX_SIZE, this.UX_SIZE * 0.2)
          .fill({ color: "#f00", opacity: "0.5" })
          .center(this.UX_SIZE / 2, this.UX_SIZE / 2);
        this.canvas[x].text("Invalid Move")
          .font({ weight: "bold" })
          .center(this.UX_SIZE / 2, this.UX_SIZE / 2);
        continue;
      }
      // finding the neighbors after the move
      const list: boolean[] = [];
      for (let i = 0; i < this.game.GRID_SIZE * this.game.GRID_SIZE; i++) {
        list[i] = false;
      }
      for (const tile of this.game.getNeighbors(this.game.getTile(posX, posY))) {
        list[this.game.GRID_SIZE * (tile.x - 1) + (tile.y - 1)] = true;
      }
      // creating the full grid
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
          if (x < 4) {
            if (list[this.game.GRID_SIZE * (i - 1) + (j - 1)]) {
              s.fill({ color: "#b40000" });
            } else {
              s.fill({ color: "#176900" });
            }
          } else {
            if (list[this.game.GRID_SIZE * (i - 1) + (j - 1)]) {
              s.fill({ color: "#646464" });
            } else {
              s.fill({ color: "#ffffff" });
            }
          }
        }
      }
    }
  }
}
