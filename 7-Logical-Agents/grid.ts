import { Agent, Move } from "./agent";
import { Measurement, Tile } from "./tile";
import { Filtering } from "./filtering";

declare var $: any;
declare var SVG: any;

export class Grid {

  public readonly GRID_SIZE: number = 4;
  public readonly UX_SIZE: number = 600;
  public readonly ELEMENT: string = "drawing";
  public canvas: any;
  public agent: Agent;
  public modelFilter: Filtering;
  public tiles: Tile[][] = [];

  constructor() {
    for (let i = 0; i < this.GRID_SIZE; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < this.GRID_SIZE; j++) {
        this.tiles[i][j] = new Tile(i + 1, this.GRID_SIZE - j,
          this.UX_SIZE / this.GRID_SIZE);
      }
    }
    this.render();
    this.agent = new Agent(this);
    this.modelFilter = new Filtering(this);
  }

  public getTile(i: number, j: number): Tile {
    i = i - 1;
    j = this.GRID_SIZE - j;
    if (i < 0 || j < 0 || i >= this.GRID_SIZE || j >= this.GRID_SIZE) {
      throw new Error("Accessing invalid tile index (" + i + "," + j + ")");
    }
    return this.tiles[i][j];
  }

  public getNeighbors(tile: Tile): Tile[] {
    const result: Tile[] = [];
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
