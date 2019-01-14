import { GameGrid } from "./GameGrid";

declare var SVG: any;

export class ModelFiltering {

  protected canvas: any[] = [];
  protected game: GameGrid;
  private canvasParent: any;
  private readonly ELEMENT = "drawing-models";
  private readonly UX_SIZE = 450;

  /**
   * Generates a new analysis space, makes 8 boards, and 2 text-outputs
   * and stores them as nested SVG in this.canvas[].
   * @constructor
   *
   * @param {GameGrid} game - game object that we are analyzing
   *
   * @remarks
   *
   * The space on the X-axis of canvas is allotted as follows:
   *  1.00 * UX_SIZE * 2: Models for Each possible move
   *  0.01 * UX_SIZE * 2: separator space
   *  =======================================================
   *  TOTAL: 2.02 * UX_SIZE on the X Axis
   *
   * The space on the Y-axis of canvas is allotted as follows:
   *  0.25 * UX_SIZE: Banner of what move it is
   *  1.00 * UX_SIZE: Models for Left Move
   *  0.01 * UX_SIZE: Separator space
   *  0.25 * UX_SIZE: Conclusions for the move

   *  0.25 * UX_SIZE: Banner of what move it is
   *  1.00 * UX_SIZE: Models for Right Move
   *  0.01 * UX_SIZE: Separator space
   *  0.25 * UX_SIZE: Conclusions for the move

   *  0.25 * UX_SIZE: Banner of what move it is
   *  1.00 * UX_SIZE: Models for Up Move
   *  0.01 * UX_SIZE: Separator space
   *  0.25 * UX_SIZE: Conclusions for the move

   *  0.25 * UX_SIZE: Banner of what move it is
   *  1.00 * UX_SIZE: Models for Down Move
   *  0.01 * UX_SIZE: Separator space
   *  0.25 * UX_SIZE: Conclusions for the move
   *  =======================================================
   *  TOTAL: 6.04 * UX_SIZE on the Y Axis
   */
  constructor(game: GameGrid) {
    this.game = game;
    // Initializing the 8 nested SVG canvases for each future move
    this.canvasParent = SVG(this.ELEMENT).size(this.UX_SIZE * 2.02, this.UX_SIZE * 6.04);
    const moveTexts = ["Right", "Up", "Left", "Down"];
    for (let i = 0; i < 4; i++) {
      // Banners at for Wumpus
      this.canvasParent.rect(this.UX_SIZE, 0.25 * this.UX_SIZE)
        .center(0.5 * this.UX_SIZE, (1.51 * i + 0.125) * this.UX_SIZE)
      this.canvasParent.text("Checking Wumpus on the " + moveTexts[i])
        .center(0.5 * this.UX_SIZE, (1.51 * i + 0.125) * this.UX_SIZE)
        .font({ weight: "bold", fill: "white" });
      // Generate Models for Wumpus
      this.canvas[i] = this.canvasParent.nested().size(this.UX_SIZE, this.UX_SIZE);
      this.canvas[i].center(0.50 * this.UX_SIZE, (1.51 * i + 0.75) * this.UX_SIZE);
      // Banners at for Wumpus
      this.canvasParent.rect(this.UX_SIZE, 0.25 * this.UX_SIZE)
        .center(1.51 * this.UX_SIZE, (1.51 * i + 0.125) * this.UX_SIZE)
      this.canvasParent.text("Checking Wumpus on the " + moveTexts[i])
        .center(1.51 * this.UX_SIZE, (1.51 * i + 0.125) * this.UX_SIZE)
        .font({ weight: "bold", fill: "white" });
      // Generate Models for Pits
      this.canvas[i + 4] = this.canvasParent.nested().size(this.UX_SIZE, this.UX_SIZE);
      this.canvas[i + 4].center(1.51 * this.UX_SIZE, (1.51 * i + 0.75) * this.UX_SIZE);
      // Results
      this.canvas[i + 8] = this.canvasParent.nested().size(2 * this.UX_SIZE, 0.25 * this.UX_SIZE);
      this.canvas[i + 8].center(1.0 * this.UX_SIZE, (1.51 * i + 1.375) * this.UX_SIZE);
    }
    this.render();
  }

  /**
   * Renders all possible models of the future and why they hold true or false.
   * Currently tries to filter utilizing the features of this space.
   */
  public render(): void {
    const curX = this.game.agent.x;
    const curY = this.game.agent.y;
    const valid: boolean[] = [];
    for (let x = 0; x < 8; x++) {
      // delete the old grid and assume model is valid
      this.canvas[x].clear();
      valid[x] = true;
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
          .fill({ color: "#ddd", opacity: "0.5" });
        this.canvas[x].rect(this.UX_SIZE, this.UX_SIZE * 0.2)
          .fill({ color: "#f00", opacity: "0.2" })
          .center(this.UX_SIZE / 2, this.UX_SIZE / 2);
        this.canvas[x].text("Invalid Move")
          .font({ weight: "bold" })
          .center(this.UX_SIZE / 2, this.UX_SIZE / 2);
        continue;
      }
      // check if model contradicts the current knowledge base
      if (this.game.getTile(posX, posY).measured) {
        valid[x] = false;
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
            .rect((0.245) * this.UX_SIZE, (0.245) * this.UX_SIZE )
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
            // Dealing with Wumpus here
            if (list[this.game.GRID_SIZE * (i - 1) + (j - 1)]) {
              s.fill({ color: "#ff3837" });
              if (this.game.getTile(i, j).measured && !this.game.getTile(i, j).hasStench) {
                valid[x] = false;
                this.canvas[x].text("x").font({ fill: "#ffffff", weight: "bold", size: "large" })
                  .center((i - 0.5) * this.UX_SIZE / 4, (4.5 - j) * this.UX_SIZE / 4);
              }
            } else {
              s.fill({ color: "#4e9d36" });
              if (this.game.getTile(i, j).measured && this.game.getTile(i, j).hasStench) {
                valid[x] = false;
                this.canvas[x].text("x").font({ fill: "#ffffff", weight: "bold", size: "large" })
                  .center((i - 0.5) * this.UX_SIZE / 4, (4.5 - j) * this.UX_SIZE / 4);
              }
            }
          } else if (x < 8) {
            // Dealing with Pits here
            if (list[this.game.GRID_SIZE * (i - 1) + (j - 1)]) {
              s.fill({ color: "#646464" });
              if (this.game.getTile(i, j).measured && !this.game.getTile(i, j).hasBreeze) {
                valid[x] = false;
                this.canvas[x].text("x").font({ fill: "#ffffff", weight: "bold", size: "large" })
                  .center((i - 0.5) * this.UX_SIZE / 4, (4.5 - j) * this.UX_SIZE / 4);
              }
            } else {
              s.fill({ color: "#ffffff" });
            }
          }
          // Render the agent itself
          if (posX === i && posY === j) {
            this.canvas[x].circle(10).fill({ color: "#ff0066" })
              .center((i - 0.5) * this.UX_SIZE / 4, (4.5 - j) * this.UX_SIZE / 4);
          }
        }
      }
      // Check and label if the model was valid or not
      if (!valid[x]) {
        this.canvas[x].rect(this.UX_SIZE, this.UX_SIZE * 0.2)
          .fill({ color: "#f00", opacity: "0.2" })
          .center(this.UX_SIZE / 2, this.UX_SIZE / 2);
        this.canvas[x].text("Model Invalid, Square Safe")
          .font({ weight: "bold" })
          .center(this.UX_SIZE / 2, this.UX_SIZE / 2);
      } else if (valid[x]) {
        this.canvas[x].rect(this.UX_SIZE, this.UX_SIZE * 0.2)
          .fill({ color: "#00ff00", opacity: "0.2" })
          .center(this.UX_SIZE / 2, this.UX_SIZE / 2);
        this.canvas[x].text("Model is Correct, Move is Risky.")
          .font({ weight: "bold" })
          .center(this.UX_SIZE / 2, this.UX_SIZE / 2);
      }
    }
    // Label for each move whether it should be played or not
    for (let i = 0; i < 4; i++) {
      this.canvas[i + 8].clear();
      if (valid[i] || valid[i + 4]) {
        this.canvas[i + 8].rect(this.UX_SIZE * 2.01, this.UX_SIZE * 0.20)
          .fill({ color: "#ff7b69" });
        this.canvas[i + 8].text("We ain't doing this.")
          .center(this.UX_SIZE * 1.05, this.UX_SIZE * 0.10)
          .font({ weight: "bold" });
      } else {
        this.canvas[i + 8].rect(this.UX_SIZE * 2.01, this.UX_SIZE * 0.20)
          .fill({ color: "#89ff4f" });
        this.canvas[i + 8].text("This is Safe, Good to Go.")
          .center(this.UX_SIZE * 1.05, this.UX_SIZE * 0.10)
          .font({ weight: "bold" });
      }
    }
  }
}
