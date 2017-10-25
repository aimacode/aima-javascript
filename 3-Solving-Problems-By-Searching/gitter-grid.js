function gitteredGrid(height, width, totalNodes) {
  let cellSize = Math.sqrt(height * width / totalNodes);
  let columnSize = Math.floor(width / cellSize);
  let rowSize = Math.floor(height / cellSize);
  let grid = [];

  for (let i = 0; i < rowSize; i++) {
    grid.push(new Array(columnSize));
  }

  for (let i = 0; i < rowSize; i++) {
    for (let j = 0; j < columnSize; j++) {
      grid[i][j] = [cellSize * j + cellSize / 6 + Math.random() * cellSize * 2 / 3, cellSize * i + cellSize / 6 + Math.random() * cellSize * 2 / 3];
    }
  }
  return grid;
}
