import { GameGrid } from "./GameGrid";
import { Move } from "./UserAgent";

declare var $: any;

const game: GameGrid = new GameGrid();
game.getTile(3, 1).hasPit = true;
game.getTile(3, 3).hasPit = true;
game.getTile(4, 4).hasPit = true;
game.getTile(1, 3).hasWumpus = true;
game.getTile(2, 3).hasGold = true;
game.sensorUpdate();

// Binding the click events
$("#mode-game").on("click", () => { game.godSight.hide(); });
$("#mode-god").on("click", () => { game.godSight.render(); });

// Binding the Keypress Event
$("html").on("keydown", (e: any) => {
  if (e.which === 37 || e.which === "A".charCodeAt(0)) {
    game.agent.move(Move.Left);
    game.modelFilter.render();
  } else if (e.which === 38 || e.which === "W".charCodeAt(0)) {
    game.agent.move(Move.Up);
    game.modelFilter.render();
  } else if (e.which === 39 || e.which === "D".charCodeAt(0)) {
    game.agent.move(Move.Right);
    game.modelFilter.render();
  } else if (e.which === 40 || e.which === "S".charCodeAt(0)) {
    game.agent.move(Move.Down);
    game.modelFilter.render();
  }
});
