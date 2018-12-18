# Chapter 7 - Logical Agents

## Structure of the Code

* **Grid**: The Game grid, this is the class that runs the whole game.
    * agent
    * getTile(i: number, j: number)
    * GRID_SIZE
    * UX_SIZE
    * ELEMENT
* **Agent**: This is a simple UserAgent that responds to the user and explores the game.
* **Tile**: One Tile in the gird that may have a pit, wumpus, or a pile of gold.
* **GodAgent**: The Agent that can view the status of all the positions.

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