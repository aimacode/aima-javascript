import { Filtering } from "./filtering";
import { GodSight } from "./god";
import { Grid } from "./grid";
import { Move } from "./agent";

declare var $: any;

const game: Grid = new Grid();
game.getTile(3, 1).hasPit = true;
game.getTile(3, 3).hasPit = true;
game.getTile(4, 4).hasPit = true;
game.getTile(1, 3).hasWumpus = true;
game.getTile(2, 3).hasGold = true;
game.sensorUpdate();

const god: GodSight = new GodSight(game);
$("#mode-game").on("click", () => { god.hide(); });
$("#mode-god").on("click", () => { god.render(); });

const filter: Filtering = new Filtering(game);
filter.render();

// Binding the Keypress Event
$("html").on("keydown", (e: any) => {
  if (e.which === 37 || e.which === "A".charCodeAt(0)) {
    game.agent.move(Move.Left);
    filter.render();
  } else if (e.which === 38 || e.which === "W".charCodeAt(0)) {
    game.agent.move(Move.Up);
    filter.render();
  } else if (e.which === 39 || e.which === "D".charCodeAt(0)) {
    game.agent.move(Move.Right);
    filter.render();
  } else if (e.which === 40 || e.which === "S".charCodeAt(0)) {
    game.agent.move(Move.Down);
    filter.render();
  }
});
