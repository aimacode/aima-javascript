import { GameTile, Measurement } from "./GameTile";
import { GodSight } from "./GodSight";
import { ModelFiltering } from "./ModelFiltering";
import { UserAgent } from "./UserAgent";

declare var SVG: any;

export class GameGrid {

  public readonly GRID_SIZE: number = 4;
  public readonly UX_SIZE: number = 600;
  public readonly ELEMENT: string = "drawing";
  public canvas: any;
  public agent: UserAgent;
  public modelFilter: ModelFiltering;
  public tiles: GameTile[][] = [];
  public godSight: GodSight;

  /**
   * Generates and assigns portions of the canvas to each of the tiles.
   * Initializes the UserAgent and the ModelFiltering.
   * @constructor
   */
  constructor() {
    for (let i = 0; i < this.GRID_SIZE; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < this.GRID_SIZE; j++) {
        this.tiles[i][j] = new GameTile(i + 1, this.GRID_SIZE - j,
          this.UX_SIZE / this.GRID_SIZE);
      }
    }
    this.render();
    this.agent = new UserAgent(this);
    this.modelFilter = new ModelFiltering(this);
    this.godSight = new GodSight(this);
  }

  /**
   * Gets the tile at index (i,j) on the game grid.
   *
   * @param {number} i - x-coordinate to tile queried
   * @param {number} j - y-coordinate to tile queried
   *
   * @returns {GameTile} - Tile at location (i,j)
   */
  public getTile(i: number, j: number): GameTile {
    i = i - 1;
    j = this.GRID_SIZE - j;
    if (i < 0 || j < 0 || i >= this.GRID_SIZE || j >= this.GRID_SIZE) {
      throw new Error("Accessing invalid tile index (" + i + "," + j + ")");
    }
    return this.tiles[i][j];
  }

  /**
   * Get tiles that are directly adjacent to the tile given
   *
   * @param {GameTile} tile - tile whose neighbors we are searching for
   *
   * @returns {GameTile[]} - list of at most 4 tiles that are adjacent to tile
   */
  public getNeighbors(tile: GameTile): GameTile[] {
    const result: GameTile[] = [];
    if (tile.x > 1) {
        result.push(this.getTile(tile.x - 1, tile.y));
    }
    if (tile.x < this.GRID_SIZE) {
      result.push(this.getTile(tile.x + 1, tile.y));
    }
    if (tile.y > 1) {
      result.push(this.getTile(tile.x, tile.y - 1));
    }
    if (tile.y < this.GRID_SIZE) {
      result.push(this.getTile(tile.x, tile.y + 1));
    }
    return result;
  }

  /**
   * Computes the stenches and breezes in all tiles based on where pits and
   * wumpus are present.
   */
  public sensorUpdate() {
    // Loop over all tiles
    for (let i = 0; i < this.GRID_SIZE; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        // Check if tile[i][j] has a breeze/stench due to a neighbors.
        let stench: boolean = false;
        let breeze: boolean = false;
        for (const neighbor of this.getNeighbors(this.tiles[i][j])) {
          stench = neighbor.hasWumpus || stench;
          breeze = neighbor.hasPit || breeze;
        }
        // Set the measurement of the tile based on it's neighbors and render.
        this.tiles[i][j].measurement = breeze
          ? (stench ? Measurement.StenchyBreeze : Measurement.Breeze)
          : (stench ? Measurement.Stench : Measurement.Safe);
        this.tiles[i][j].render();
      }
    }
  }

  /**
   * Resets all the tiles, the agent, and the modelFiltering.
   */
  public reset(): void {
    for (let i = 0; i < this.GRID_SIZE; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        this.tiles[i][j].reset();
      }
    }
    this.getTile(1, 1).measured = true;
    this.agent.reset();
    this.modelFilter.render();
  }

  /**
   * Distributes the canvas space to all the tiles and renders all of them.
   */
  public render() {
    this.canvas = SVG(this.ELEMENT).size(this.UX_SIZE, this.UX_SIZE);
    const BLOCK_SIZE: number = this.UX_SIZE / this.GRID_SIZE;
    for (let i = 0; i < this.GRID_SIZE; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        this.tiles[i][j].canvas = this.canvas.nested()
          .attr({ x: BLOCK_SIZE * i, y: BLOCK_SIZE * j });
        this.tiles[i][j].render();
      }
    }
  }
}
