# Chapter 7 - Logical Agents

## Structure of the Code

* **GameGrid**: The Game grid, this is the class that runs the whole game.
    * constructor()
    * getTile(i: number, j: number)
    * getNeighbors(tile: GameTile)
    * sensorUpdate()
    * reset()
    * render()
    * agent
    * modelFilter
    * tiles
    * canvas
    * GRID_SIZE
    * UX_SIZE
    * ELEMENT
* **UserAgent**: This is a simple UserAgent that responds to the user and explores the game.
    * constructor(game: GameGrid)
    * x (get)
    * y (get)
    * move(move: Move)
    * measure()
    * render()
* **GameTile**: One GameTile in the gird that may have a pit, wumpus, or a pile of gold.
    * constructor(x: number, y: number, blockSize: number = 100)
    * x: number (get)
    * y: number (get)
    * canvas: SVG (set)
    * hasWumpus: boolean (get-set)
    * hasPit: boolean (get-set)
    * hasGold: boolean (get-set)
    * hasBreeze: boolean (get-set)
    * hasStench: boolean (get-set)
    * measurement: (get-set)
    * measured: boolean (get-set)
* **GodSight**: The UserAgent that can view the status of all the positions.
    * constructor(game: GameGrid)
    * render()
    * hide()
* **ModelFiltering**: Thinking of all possible futures and evaluating which moves are safe.
    * constructor(game: GameGrid)
    * render()

## Possible Errors

#### Max number of watchers exceeded

If you get the following error, its due to the maximum number of watchers being exceeded.

*Error: watch ./node_modules/typescript/lib/lib.d.ts ENOSPC*

Type in the following command to fix this issue into your shell.

```shell
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
sudo sysctl --system
```

And then rerun Gulp to start watching the files.