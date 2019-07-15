class SudokuPuzzle {
  constructor(puzzle, maxRow, maxCol, blockSize, domainSet) {
    this.puzzle = puzzle;
    this.maxRow = maxRow;
    this.maxCol = maxCol;
    this.blockSize = blockSize;
    this.domainSet = domainSet;
  }

  assign(i, j, val) {
    this.puzzle[i][j] = val;
  }

  isFilled(i, j) {
    return (this.puzzle[i][j] != 0);
  }

  isValid(i, j) {
      return (i >= 0 && i < this.maxRow && j >= 0 && j < this.maxCol);
    }
    //Returns a set of numbers present in the column

  getColumn(row, column) {
      let columnSet = new Set();
      for (let i = 0; i < this.maxRow; i++) {
        if (this.puzzle[i][column]) {
          columnSet.add(this.puzzle[i][column]);
        }
      }
      return columnSet;
    }
    //Returns a set of numbers present in the row

  getRow(row, column) {
      let rowSet = new Set();
      for (let i = 0; i < this.maxCol; i++) {
        if (this.puzzle[row][i]) {
          rowSet.add(this.puzzle[row][i]);
        }
      }
      return rowSet;
    }
    //Returns a set of numbers present in the block

  getBlock(row, column) {
      let blockSet = new Set();
      for (let i = (row - (row % this.blockSize)); i < (row + this.blockSize - (row % this.blockSize)); i++) {
        for (let j = (column - (column % this.blockSize)); j < (column + this.blockSize - (column % this.blockSize)); j++) {
          if (this.puzzle[i][j]) {
            blockSet.add(this.puzzle[i][j]);
          }
        }
      }
      return blockSet;
    }
    //Eliminate row,column and block are defined as separate functions to be used
    //by the diagram separately.

  eliminateRow(row, column) {
    let rowSet = this.getRow(row, column)
    return new Set([...this.domainSet].filter(x => !rowSet.has(x)));
  }

  eliminateColumn(row, column) {
    let columnSet = this.getColumn(row, column)
    return new Set([...this.domainSet].filter(x => !columnSet.has(x)));
  }

  eliminateBlock(row, column) {
    let blockSet = this.getBlock(row, column)
    return new Set([...this.domainSet].filter(x => !blockSet.has(x)));
  }

  getDomain(row, column) {
    let rowSet = this.getRow(row, column);
    let columnSet = this.getColumn(row, column);
    let blockSet = this.getBlock(row, column);
    return new Set([...this.domainSet].filter(x => !rowSet.has(x) && !columnSet.has(x) && !blockSet.has(x)))
  }

  getAllDomains() {
      let matrix = [];
      for (let i = 0; i < this.maxRow; i++) {
        let row = []
        for (let j = 0; j < this.maxCol; j++) {
          row.push(this.getDomain(i, j));
        }
        matrix.push(row);
      }
      return matrix;
    }
    //Checks if there is only 1 possible assignment
    //Returns false if more than 1 and the value otherwise

  checkSingle(i, j) {
    let domain = this.getDomain(i, j);
    if (domain.size > 1) {
      return false;
    } else {
      return [...domain][0];
    }
  }

  solve() {
    let solved = false;
    while (!solved) {
      let matrix = this.getAllDomains();
      solved = true;
      for (let i = 0; i < this.maxRow; i++) {
        for (let j = 0; j < this.maxCol; j++) {
          if (this.puzzle[i][j] == 0) {
            if (matrix[i][j].size == 0) {
              return false;
            } else if (matrix[i][j].size > 1) {
              solved = false;
            } else {
              //Assign the single element present
              this.puzzle[i][j] = [...matrix[i][j]][0];
            }
          }
        }
      }
    }
  }

}
