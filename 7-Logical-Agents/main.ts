import { GodSight } from "./god";
import { Grid } from "./grid";

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
