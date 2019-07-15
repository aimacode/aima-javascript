class Board {
	constructor(b, t) {
		this.tiles = b.slice(0);
		this.turn = t;
	}
	pickTile(tile) {
		let result = new Board(this.tiles, this.turn);
		if (result.tiles[tile] == 0) {
			result.tiles[tile] = this.turn;
		}
		else if (result.turn != result.tiles[tile]) {
			result.tiles[tile] = 0;
		}
		result.turn = -1 * this.turn;
		return result;
	}
	next(child) {
		if (this.gameState != 0) {
			return undefined;
		}
		let skips = child;
		for (let i = 0; i < 9; i++) {
			if (this.tiles[i] == 0) {
				if (skips == 0) {
					let r = new Board(this.tiles, this.turn);
					return r.pickTile(i);
				}
				else {
					skips--;
				}
			}
		}
		return undefined;
	}
	get gameState() {
		//check if O has won
		let p = 1;
		if ((this.tiles[0] == p && this.tiles[1] == p && this.tiles[2] == p) || // Row 1
			(this.tiles[3] == p && this.tiles[4] == p && this.tiles[5] == p) || // Row 2
			(this.tiles[6] == p && this.tiles[7] == p && this.tiles[8] == p) || // Row 3
			(this.tiles[0] == p && this.tiles[3] == p && this.tiles[6] == p) || // Column 1
			(this.tiles[1] == p && this.tiles[4] == p && this.tiles[7] == p) || // Column 2
			(this.tiles[2] == p && this.tiles[5] == p && this.tiles[8] == p) || // Column 3
			(this.tiles[2] == p && this.tiles[4] == p && this.tiles[6] == p) || // Diagonal 1
			(this.tiles[0] == p && this.tiles[4] == p && this.tiles[8] == p))   // Diagonal 2
			return 1;

		//check if X has won
		p = -1;
		if ((this.tiles[0] == p && this.tiles[1] == p && this.tiles[2] == p) || // Row 1
			(this.tiles[3] == p && this.tiles[4] == p && this.tiles[5] == p) || // Row 2
			(this.tiles[6] == p && this.tiles[7] == p && this.tiles[8] == p) || // Row 3
			(this.tiles[0] == p && this.tiles[3] == p && this.tiles[6] == p) || // Column 1
			(this.tiles[1] == p && this.tiles[4] == p && this.tiles[7] == p) || // Column 2
			(this.tiles[2] == p && this.tiles[5] == p && this.tiles[8] == p) || // Column 3
			(this.tiles[2] == p && this.tiles[4] == p && this.tiles[6] == p) || // Diagonal 1
			(this.tiles[0] == p && this.tiles[4] == p && this.tiles[8] == p))   // Diagonal 2
			return 2;

		//check if there are any open spots left, if there are, the game is in progress
		for (let i = 0; i < 9; i++)
			if (this.tiles[i] == 0) return 0;

		//otherwise the game is over as a draw
		return 3;
	}
	get value() {
		switch (this.gameState) {
			case 0: return undefined; // game in progress
			case 1: return 2; // O wins
			case 2: return 0; // X wins
			case 3: return 1; // Draw
		}
	}
}

class Tree {
	constructor(board, depth, id, parent) {
		if (id == undefined) {
			id = [1];
		}
		this.parent = parent;
		this.board = new Board(board.tiles, board.turn);
		this._value = board.value;
		this.children = new Array();
		this.id = id[0]++;
		let i = 0;
		if (parent != undefined) {
			for(let i = 0; i < this.board.tiles.length; i++) {
				if (this.board.tiles[i] != parent.board.tiles[i]) {
					this.board.dif = i;
					break;
				}
			}
		}
		if (depth > 0) {
			while(this.board.next(i)) {
				this.children.push(new Tree(this.board.next(i++), depth-1, id, this));
			}
		}
	}
	search(id) {
		if (this.id == id) {
			return this;
		}
		for(let i = 0; i < this.children.length; i++) {
			if (i == this.children.length-1) {
				return this.children[i].search(id);
			}
			else if (this.children[i].id <= id && this.children[i+1].id > id) {
				return this.children[i].search(id);
			}
		}
	}
	best() {
		// If computer's move then initialize best to -infinity, otherwise to +infinity
		let best = (this.board.turn == 1 ? Number.MIN_VALUE : Number.MAX_VALUE);
		let move = 0;
		// Iterate through all possible moves / child states
		for (let i = 0; i < this.children.length; i++) {
			let result = this.children[i].value();
			// select the state with the highest value if computer's move, else with lowest value
			if (this.board.turn == 1 ? result >= best : result <= best) {
				best = result;
				move = i;
			}
		}
		return move;
	}
	value (alpha = Number.MIN_VALUE, beta = Number.MAX_VALUE) {
		if (this._value != undefined) {
			return this._value;
		}
		// If the move is of the Computer then initialize to -infinity, else to +infinity
		this._value = (this.board.turn == 1 ? Number.MIN_VALUE : Number.MAX_VALUE);
		for (let i = 0; i < this.children.length; i++) {
			let result = this.children[i].value(alpha, beta);
			if (this.board.turn == 1) {
				this._value = Math.max(this._value, result);
				if (this._value > beta) return this._value;
				alpha = Math.max(alpha, result);
			} else {
				this._value = Math.min(this._value, result);
				if (this._value <= alpha) return this._value;
				beta = Math.min(beta, result);
			}
		}
		return this._value;
	}
}

