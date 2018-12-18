import { Grid } from "./grid";
import { Measurement } from "./tile";

export class Agent {

  protected mX: number;
  protected mY: number;
  private mGame: Grid;
  private ux: any;
  private disabled: boolean = false;

  constructor(grid: Grid) {
    this.mX = 1;
    this.mY = 1;
    this.mGame = grid;
    this.measure();
    this.disabled = false;
    this.ux = this.mGame.canvas.circle(20);
    this.ux.fill("#f06");
    this.ux.center(this.mGame.UX_SIZE / (2 * this.mGame.GRID_SIZE),
      this.mGame.UX_SIZE - (this.mGame.UX_SIZE / (2 * this.mGame.GRID_SIZE)));
  }

  get x(): number { return this.mX; }
  get y(): number { return this.mY; }

  public move(move: Move): void {
    if (this.disabled) {
      return;
    }
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
      this.disabled = true;
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
      this.disabled = true;
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
      this.disabled = true;
    }
  }

  public reset(): void {
    this.mX = 1;
    this.mY = 1;
    this.render();
    this.ux.finish();
    this.ux.fill("#f06");
    this.ux.radius(10);
    this.disabled = false;
  }

  public render(): void {
    this.ux.finish();
    const BLOCK_SIZE = this.mGame.UX_SIZE / this.mGame.GRID_SIZE;
    this.ux.animate().center(BLOCK_SIZE * this.mX - BLOCK_SIZE / 2,
      this.mGame.UX_SIZE - BLOCK_SIZE * this.mY + BLOCK_SIZE / 2);
    this.console();
  }

  private console(): void {
    const pos = this.mGame.getTile(this.mX, this.mY);
    if (pos.hasGold) {
      $("#agent-console").html("Thank you for helping me find all this gold");
    } else if (pos.hasPit || pos.hasWumpus) {
      $("#agent-console").html("You were supposed to help me, I am dead now.");
    } else if (pos.hasStench && pos.hasBreeze) {
      $("#agent-console").html("There is a <strong>stench</strong> and there is a <strong>breeze</strong>!!!");
    } else if (pos.hasStench) {
      $("#agent-console").html("What's that <strong>stench?</strong> Wumpus must be around.");
    } else if (pos.hasBreeze) {
      $("#agent-console").html("There is a <strong>breeze</strong>. Careful not to fall in a pit.");
    } else {
      $("#agent-console").html("I feel <strong>safe</strong> here, nothing around.");
    }
  }
}

export enum Move {
  Left, Right, Up, Down,
}
