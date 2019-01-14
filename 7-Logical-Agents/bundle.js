(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameTile_1 = require("./GameTile");
var ModelFiltering_1 = require("./ModelFiltering");
var UserAgent_1 = require("./UserAgent");
var GameGrid = /** @class */ (function () {
    /**
     * Generates and assigns portions of the canvas to each of the tiles.
     * Initializes the UserAgent and the ModelFiltering.
     * @constructor
     */
    function GameGrid() {
        this.GRID_SIZE = 4;
        this.UX_SIZE = 600;
        this.ELEMENT = "drawing";
        this.tiles = [];
        this.canvas = SVG(this.ELEMENT).size(this.UX_SIZE, this.UX_SIZE);
        for (var i = 0; i < this.GRID_SIZE; i++) {
            this.tiles[i] = [];
            for (var j = 0; j < this.GRID_SIZE; j++) {
                this.tiles[i][j] = new GameTile_1.GameTile(i + 1, this.GRID_SIZE - j, this.UX_SIZE / this.GRID_SIZE);
            }
        }
        this.render();
        this.agent = new UserAgent_1.UserAgent(this);
        this.godSight = false;
        this.modelFilter = new ModelFiltering_1.ModelFiltering(this);
    }
    Object.defineProperty(GameGrid.prototype, "godsight", {
        set: function (godSight) {
            this.godSight = godSight;
            console.log("GodSight: " + godSight);
            this.render();
            this.agent.render();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the tile at index (i,j) on the game grid.
     *
     * @param {number} i - x-coordinate to tile queried
     * @param {number} j - y-coordinate to tile queried
     *
     * @returns {GameTile} - Tile at location (i,j)
     */
    GameGrid.prototype.getTile = function (i, j) {
        i = i - 1;
        j = this.GRID_SIZE - j;
        if (i < 0 || j < 0 || i >= this.GRID_SIZE || j >= this.GRID_SIZE) {
            throw new Error("Accessing invalid tile index (" + i + "," + j + ")");
        }
        return this.tiles[i][j];
    };
    /**
     * Get tiles that are directly adjacent to the tile given
     *
     * @param {GameTile} tile - tile whose neighbors we are searching for
     *
     * @returns {GameTile[]} - list of at most 4 tiles that are adjacent to tile
     */
    GameGrid.prototype.getNeighbors = function (tile) {
        var result = [];
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
    };
    /**
     * Computes the stenches and breezes in all tiles based on where pits and
     * wumpus are present.
     */
    GameGrid.prototype.sensorUpdate = function () {
        // Loop over all tiles
        for (var i = 0; i < this.GRID_SIZE; i++) {
            for (var j = 0; j < this.GRID_SIZE; j++) {
                // Check if tile[i][j] has a breeze/stench due to a neighbors.
                var stench = false;
                var breeze = false;
                for (var _i = 0, _a = this.getNeighbors(this.tiles[i][j]); _i < _a.length; _i++) {
                    var neighbor = _a[_i];
                    stench = neighbor.hasWumpus || stench;
                    breeze = neighbor.hasPit || breeze;
                }
                // Set the measurement of the tile based on it's neighbors and render.
                this.tiles[i][j].measurement = breeze
                    ? (stench ? GameTile_1.Measurement.StenchyBreeze : GameTile_1.Measurement.Breeze)
                    : (stench ? GameTile_1.Measurement.Stench : GameTile_1.Measurement.Safe);
                this.tiles[i][j].render();
            }
        }
    };
    /**
     * Resets all the tiles, the agent, and the modelFiltering.
     */
    GameGrid.prototype.reset = function () {
        for (var i = 0; i < this.GRID_SIZE; i++) {
            for (var j = 0; j < this.GRID_SIZE; j++) {
                this.tiles[i][j].reset();
            }
        }
        this.getTile(1, 1).measured = true;
        this.agent.reset();
        this.modelFilter.render();
    };
    /**
     * Distributes the canvas space to all the tiles and renders all of them.
     */
    GameGrid.prototype.render = function () {
        var BLOCK_SIZE = this.UX_SIZE / this.GRID_SIZE;
        for (var i = 0; i < this.GRID_SIZE; i++) {
            for (var j = 0; j < this.GRID_SIZE; j++) {
                this.tiles[i][j].canvas = this.canvas.nested()
                    .attr({ x: BLOCK_SIZE * i, y: BLOCK_SIZE * j });
                this.tiles[i][j].render(this.godSight);
            }
        }
    };
    return GameGrid;
}());
exports.GameGrid = GameGrid;

},{"./GameTile":2,"./ModelFiltering":3,"./UserAgent":4}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameTile = /** @class */ (function () {
    /**
     * Initializes the tile, assuming it has nothing, no Wumpus, no Pit, no Gold
     * @constructor
     *
     * @param x
     * @param y
     * @param blockSize
     */
    function GameTile(x, y, blockSize) {
        if (blockSize === void 0) { blockSize = 100; }
        this.mX = x;
        this.mY = y;
        this.mWumpus = false;
        this.mPit = false;
        this.mGold = false;
        this.BLOCK_SIZE = blockSize;
        this.mMeasurement = Measurement.Safe;
        this.mMeasured = false;
    }
    Object.defineProperty(GameTile.prototype, "canvas", {
        /**
         * Sets the canvas element over which the tile will be drawn
         *
         * @param {SVGElement} canvas - nested element on the SVG canvas
         */
        set: function (canvas) {
            this.mCanvas = canvas;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTile.prototype, "x", {
        /**
         * Returns the x-coordinate of the tile.
         *
         * @returns {number} x-coordinate of the tile
         */
        get: function () {
            return this.mX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTile.prototype, "y", {
        /**
         * Returns the y-coordinate of the tile.
         *
         * @returns {number} y-coordinate of the tile
         */
        get: function () {
            return this.mY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTile.prototype, "hasWumpus", {
        /**
         * Returns if the tile has Wumpus.
         *
         * @returns {boolean} true if the tile has Wumpus, false otherwise
         */
        get: function () {
            return this.mWumpus;
        },
        /**
         * Sets the tile to have gold in it.
         *
         * @param {boolean} wumpus - true if the tile should have wumpus in it, false otherwise
         */
        set: function (wumpus) {
            this.mWumpus = wumpus;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTile.prototype, "hasPit", {
        /**
         * Returns if the tile has a Pit.
         *
         * @returns {boolean} true if the tile has a Pit, false otherwise
         */
        get: function () {
            return this.mPit;
        },
        /**
         * Sets the tile to have a pit in it.
         *
         * @param {boolean} pit - true if the tile should have a pit in it, false otherwise
         */
        set: function (pit) {
            this.mPit = pit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTile.prototype, "hasGold", {
        /**
         * Returns if the tile has gold in it.
         *
         * @returns {boolean} true if the tile has gold in it, false otherwise
         */
        get: function () {
            return this.mGold;
        },
        /**
         * Sets the tile to have gold in it.
         *
         * @param {boolean} gold - true if the tile should have gold in it, false otherwise
         */
        set: function (gold) {
            this.mGold = gold;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTile.prototype, "measurement", {
        /**
         * Returns if the tile has been measured
         *
         * @returns {boolean} true if the tile has already been measured, false otherwise
         */
        get: function () {
            return this.mMeasurement;
        },
        /**
         * Changes the measurement in the tile to the supplied value and re-renders it.
         *
         * @param {Measurement} measurement - value of the measurement at the tile
         */
        set: function (measurement) {
            this.mMeasurement = measurement;
            this.render();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTile.prototype, "measured", {
        /**
         * Returns if the tile has been measured
         *
         * @returns {boolean} true if the tile has already been measured, false otherwise
         */
        get: function () {
            return this.mMeasured;
        },
        /**
         * Sets the tile to be measured and re-renders the tile.
         *
         * @param {boolean} measured - true if the tile has been measured (visited)
         */
        set: function (measured) {
            this.mMeasured = measured;
            this.render();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTile.prototype, "hasBreeze", {
        /**
         * Checks the the tile has a breeze.
         *
         * @returns {boolean} - true if the tile has breeze, false otherwise
         */
        get: function () {
            return this.mMeasurement === Measurement.Breeze
                || this.mMeasurement === Measurement.StenchyBreeze;
        },
        /**
         * Adds a breeze to the tile if not already present.
         *
         * @param {boolean} breeze- true if there is a breeze, false otherwise
         */
        set: function (breeze) {
            if (breeze && this.mMeasurement === Measurement.Stench) {
                this.mMeasurement = Measurement.StenchyBreeze;
            }
            else if (breeze && this.mMeasurement === Measurement.Safe) {
                this.mMeasurement = Measurement.Breeze;
            }
            else if (!breeze && this.mMeasurement === Measurement.StenchyBreeze) {
                this.mMeasurement = Measurement.Stench;
            }
            else if (!breeze && this.mMeasurement === Measurement.Breeze) {
                this.mMeasurement = Measurement.Safe;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameTile.prototype, "hasStench", {
        /**
         * Checks the the tile has a stench.
         *
         * @returns {boolean} - true if the tile has stench, false otherwise
         */
        get: function () {
            return this.mMeasurement === Measurement.Stench
                || this.mMeasurement === Measurement.StenchyBreeze;
        },
        /**
         * Adds a stench to the tile if not already present.
         *
         * @param {boolean} stench - true if there is a stench, false otherwise
         */
        set: function (stench) {
            if (stench && this.mMeasurement === Measurement.Breeze) {
                this.mMeasurement = Measurement.StenchyBreeze;
            }
            else if (stench && this.mMeasurement === Measurement.Safe) {
                this.mMeasurement = Measurement.Stench;
            }
            else if (!stench && this.mMeasurement === Measurement.StenchyBreeze) {
                this.mMeasurement = Measurement.Stench;
            }
            else if (!stench && this.mMeasurement === Measurement.Stench) {
                this.mMeasurement = Measurement.Safe;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Renders out the tile, as two squares.
     *
     * @remarks
     * Tile is displayed as two squares on behind the other.
     * Outer rim shows the color denoting the measurement.
     */
    GameTile.prototype.render = function (forceVisibility) {
        if (forceVisibility === void 0) { forceVisibility = false; }
        var rOut = this.mCanvas.rect(this.BLOCK_SIZE * 0.98, this.BLOCK_SIZE * 0.98);
        var rInn = this.mCanvas.rect(this.BLOCK_SIZE * 0.75, this.BLOCK_SIZE * 0.75);
        if (this.mMeasured) {
            rOut.fill({ color: this.mMeasurement });
        }
        else {
            rOut.fill({ color: "#ccc" });
        }
        rInn.fill({ color: "#ddd" });
        rOut.center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2);
        rInn.center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2);
        if (this.mMeasured || forceVisibility) {
            // Rendering the Icons
            if (this.hasWumpus) {
                this.mCanvas.image('img/wumpus.png', this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.6)
                    .center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2);
            }
            else if (this.hasPit) {
                this.mCanvas.image('img/pit.png', this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.6)
                    .center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2);
            }
            else {
                if (this.hasGold) {
                    this.mCanvas.image('img/gold.png', this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.2)
                        .center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2);
                }
                if (this.hasBreeze) {
                    this.mCanvas.image('img/breeze.png', this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.2)
                        .center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2 + this.BLOCK_SIZE * 0.25);
                }
                if (this.hasStench) {
                    this.mCanvas.image('img/stench.png', this.BLOCK_SIZE * 0.6, this.BLOCK_SIZE * 0.2)
                        .center(this.BLOCK_SIZE / 2, this.BLOCK_SIZE / 2 - this.BLOCK_SIZE * 0.25);
                }
            }
        }
    };
    /**
     * Resets the tile to stop showing its measurement.
     */
    GameTile.prototype.reset = function () {
        this.measured = false;
    };
    return GameTile;
}());
exports.GameTile = GameTile;
var Measurement;
(function (Measurement) {
    Measurement["Stench"] = "#ff0000";
    Measurement["Breeze"] = "#000000";
    Measurement["StenchyBreeze"] = "#660000";
    Measurement["Safe"] = "#55ff66";
})(Measurement = exports.Measurement || (exports.Measurement = {}));

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ModelFiltering = /** @class */ (function () {
    /**
     * Generates a new analysis space, makes 8 boards, and 2 text-outputs
     * and stores them as nested SVG in this.canvas[].
     * @constructor
     *
     * @param {GameGrid} game - game object that we are analyzing
     *
     * @remarks
     *
     * The space on the X-axis of canvas is allotted as follows:
     *  1.00 * UX_SIZE * 2: Models for Each possible move
     *  0.01 * UX_SIZE * 2: separator space
     *  =======================================================
     *  TOTAL: 2.02 * UX_SIZE on the X Axis
     *
     * The space on the Y-axis of canvas is allotted as follows:
     *  0.25 * UX_SIZE: Banner of what move it is
     *  1.00 * UX_SIZE: Models for Left Move
     *  0.01 * UX_SIZE: Separator space
     *  0.25 * UX_SIZE: Conclusions for the move
  
     *  0.25 * UX_SIZE: Banner of what move it is
     *  1.00 * UX_SIZE: Models for Right Move
     *  0.01 * UX_SIZE: Separator space
     *  0.25 * UX_SIZE: Conclusions for the move
  
     *  0.25 * UX_SIZE: Banner of what move it is
     *  1.00 * UX_SIZE: Models for Up Move
     *  0.01 * UX_SIZE: Separator space
     *  0.25 * UX_SIZE: Conclusions for the move
  
     *  0.25 * UX_SIZE: Banner of what move it is
     *  1.00 * UX_SIZE: Models for Down Move
     *  0.01 * UX_SIZE: Separator space
     *  0.25 * UX_SIZE: Conclusions for the move
     *  =======================================================
     *  TOTAL: 6.04 * UX_SIZE on the Y Axis
     */
    function ModelFiltering(game) {
        this.canvas = [];
        this.ELEMENT = "drawing-models";
        this.UX_SIZE = 450;
        this.game = game;
        // Initializing the 8 nested SVG canvases for each future move
        this.canvasParent = SVG(this.ELEMENT).size(this.UX_SIZE * 2.02, this.UX_SIZE * 6.04);
        var moveTexts = ["Right", "Up", "Left", "Down"];
        for (var i = 0; i < 4; i++) {
            // Banners at for Wumpus
            this.canvasParent.rect(this.UX_SIZE, 0.25 * this.UX_SIZE)
                .center(0.5 * this.UX_SIZE, (1.51 * i + 0.125) * this.UX_SIZE);
            this.canvasParent.text("Checking Wumpus on the " + moveTexts[i])
                .center(0.5 * this.UX_SIZE, (1.51 * i + 0.125) * this.UX_SIZE)
                .font({ weight: "bold", fill: "white" });
            // Generate Models for Wumpus
            this.canvas[i] = this.canvasParent.nested().size(this.UX_SIZE, this.UX_SIZE);
            this.canvas[i].center(0.50 * this.UX_SIZE, (1.51 * i + 0.75) * this.UX_SIZE);
            // Banners at for Wumpus
            this.canvasParent.rect(this.UX_SIZE, 0.25 * this.UX_SIZE)
                .center(1.51 * this.UX_SIZE, (1.51 * i + 0.125) * this.UX_SIZE);
            this.canvasParent.text("Checking Wumpus on the " + moveTexts[i])
                .center(1.51 * this.UX_SIZE, (1.51 * i + 0.125) * this.UX_SIZE)
                .font({ weight: "bold", fill: "white" });
            // Generate Models for Pits
            this.canvas[i + 4] = this.canvasParent.nested().size(this.UX_SIZE, this.UX_SIZE);
            this.canvas[i + 4].center(1.51 * this.UX_SIZE, (1.51 * i + 0.75) * this.UX_SIZE);
            // Results
            this.canvas[i + 8] = this.canvasParent.nested().size(2 * this.UX_SIZE, 0.25 * this.UX_SIZE);
            this.canvas[i + 8].center(1.0 * this.UX_SIZE, (1.51 * i + 1.375) * this.UX_SIZE);
        }
        this.render();
    }
    /**
     * Renders all possible models of the future and why they hold true or false.
     * Currently tries to filter utilizing the features of this space.
     */
    ModelFiltering.prototype.render = function () {
        var curX = this.game.agent.x;
        var curY = this.game.agent.y;
        var valid = [];
        for (var x = 0; x < 8; x++) {
            // delete the old grid and assume model is valid
            this.canvas[x].clear();
            valid[x] = true;
            // generating the index of the next tile
            var posX = curX;
            var posY = curY;
            if ((x === 0 || x === 4) && (curX < this.game.GRID_SIZE)) {
                posX++;
            }
            else if ((x === 1 || x === 5) && (curY < this.game.GRID_SIZE)) {
                posY++;
            }
            else if ((x === 2 || x === 6) && (curX > 1)) {
                posX--;
            }
            else if ((x === 3 || x === 7) && (curY > 1)) {
                posY--;
            }
            // Quit if there are no valid moves
            if (curX === posX && curY === posY) {
                this.canvas[x].rect(this.UX_SIZE, this.UX_SIZE)
                    .fill({ color: "#ddd", opacity: "0.5" });
                this.canvas[x].rect(this.UX_SIZE, this.UX_SIZE * 0.2)
                    .fill({ color: "#f00", opacity: "0.2" })
                    .center(this.UX_SIZE / 2, this.UX_SIZE / 2);
                this.canvas[x].text("Invalid Move")
                    .font({ weight: "bold" })
                    .center(this.UX_SIZE / 2, this.UX_SIZE / 2);
                continue;
            }
            // check if model contradicts the current knowledge base
            if (this.game.getTile(posX, posY).measured) {
                valid[x] = false;
            }
            // finding the neighbors after the move
            var list = [];
            for (var i = 0; i < this.game.GRID_SIZE * this.game.GRID_SIZE; i++) {
                list[i] = false;
            }
            for (var _i = 0, _a = this.game.getNeighbors(this.game.getTile(posX, posY)); _i < _a.length; _i++) {
                var tile = _a[_i];
                list[this.game.GRID_SIZE * (tile.x - 1) + (tile.y - 1)] = true;
            }
            // creating the full grid
            for (var i = 1; i <= 4; i++) {
                for (var j = 1; j <= 4; j++) {
                    // Generate the tile
                    var r = this.canvas[x]
                        .rect((0.245) * this.UX_SIZE, (0.245) * this.UX_SIZE)
                        .center((i - 0.5) * this.UX_SIZE / 4, (4.5 - j) * this.UX_SIZE / 4);
                    var s = this.canvas[x]
                        .rect((0.15) * this.UX_SIZE, (0.15) * this.UX_SIZE)
                        .center((i - 0.5) * this.UX_SIZE / 4, (4.5 - j) * this.UX_SIZE / 4);
                    // Copying the measurement colors
                    if (this.game.getTile(i, j).measured) {
                        r.fill({ color: this.game.getTile(i, j).measurement });
                    }
                    else {
                        r.fill({ color: "#dddddd" });
                    }
                    if (x < 4) {
                        // Dealing with Wumpus here
                        if (list[this.game.GRID_SIZE * (i - 1) + (j - 1)]) {
                            s.fill({ color: "#ff3837" });
                            if (this.game.getTile(i, j).measured && !this.game.getTile(i, j).hasStench) {
                                valid[x] = false;
                                this.canvas[x].text("x").font({ fill: "#ffffff", weight: "bold", size: "large" })
                                    .center((i - 0.5) * this.UX_SIZE / 4, (4.5 - j) * this.UX_SIZE / 4);
                            }
                        }
                        else {
                            s.fill({ color: "#4e9d36" });
                            if (this.game.getTile(i, j).measured && this.game.getTile(i, j).hasStench) {
                                valid[x] = false;
                                this.canvas[x].text("x").font({ fill: "#ffffff", weight: "bold", size: "large" })
                                    .center((i - 0.5) * this.UX_SIZE / 4, (4.5 - j) * this.UX_SIZE / 4);
                            }
                        }
                    }
                    else if (x < 8) {
                        // Dealing with Pits here
                        if (list[this.game.GRID_SIZE * (i - 1) + (j - 1)]) {
                            s.fill({ color: "#646464" });
                            if (this.game.getTile(i, j).measured && !this.game.getTile(i, j).hasBreeze) {
                                valid[x] = false;
                                this.canvas[x].text("x").font({ fill: "#ffffff", weight: "bold", size: "large" })
                                    .center((i - 0.5) * this.UX_SIZE / 4, (4.5 - j) * this.UX_SIZE / 4);
                            }
                        }
                        else {
                            s.fill({ color: "#ffffff" });
                        }
                    }
                    // Render the agent itself
                    if (posX === i && posY === j) {
                        this.canvas[x].circle(10).fill({ color: "#ff0066" })
                            .center((i - 0.5) * this.UX_SIZE / 4, (4.5 - j) * this.UX_SIZE / 4);
                    }
                }
            }
            // Check and label if the model was valid or not
            if (!valid[x]) {
                this.canvas[x].rect(this.UX_SIZE, this.UX_SIZE * 0.2)
                    .fill({ color: "#f00", opacity: "0.2" })
                    .center(this.UX_SIZE / 2, this.UX_SIZE / 2);
                this.canvas[x].text("Model Invalid, Square Safe")
                    .font({ weight: "bold" })
                    .center(this.UX_SIZE / 2, this.UX_SIZE / 2);
            }
            else if (valid[x]) {
                this.canvas[x].rect(this.UX_SIZE, this.UX_SIZE * 0.2)
                    .fill({ color: "#00ff00", opacity: "0.2" })
                    .center(this.UX_SIZE / 2, this.UX_SIZE / 2);
                this.canvas[x].text("Model is Correct, Move is Risky.")
                    .font({ weight: "bold" })
                    .center(this.UX_SIZE / 2, this.UX_SIZE / 2);
            }
        }
        // Label for each move whether it should be played or not
        for (var i = 0; i < 4; i++) {
            this.canvas[i + 8].clear();
            if (valid[i] || valid[i + 4]) {
                this.canvas[i + 8].rect(this.UX_SIZE * 2.01, this.UX_SIZE * 0.20)
                    .fill({ color: "#ff7b69" });
                this.canvas[i + 8].text("We ain't doing this.")
                    .center(this.UX_SIZE * 1.05, this.UX_SIZE * 0.10)
                    .font({ weight: "bold" });
            }
            else {
                this.canvas[i + 8].rect(this.UX_SIZE * 2.01, this.UX_SIZE * 0.20)
                    .fill({ color: "#89ff4f" });
                this.canvas[i + 8].text("This is Safe, Good to Go.")
                    .center(this.UX_SIZE * 1.05, this.UX_SIZE * 0.10)
                    .font({ weight: "bold" });
            }
        }
    };
    return ModelFiltering;
}());
exports.ModelFiltering = ModelFiltering;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UserAgent = /** @class */ (function () {
    /**
     * Initialize the UserAgent in the game.
     * @constructor
     *
     * @param {GameGrid} grid - game to which the agent belongs
     */
    function UserAgent(grid) {
        this.disabled = false;
        this.mX = 1;
        this.mY = 1;
        this.mGame = grid;
        this.measure();
        this.disabled = false;
        this.ux = this.mGame.canvas.circle(20);
        this.ux.fill("#f06");
        this.ux.center(this.mGame.UX_SIZE / (2 * this.mGame.GRID_SIZE), this.mGame.UX_SIZE - (this.mGame.UX_SIZE / (2 * this.mGame.GRID_SIZE)));
    }
    Object.defineProperty(UserAgent.prototype, "x", {
        /**
         * Get the current position along X.
         *
         * @returns {number} - x coordinate
         */
        get: function () { return this.mX; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserAgent.prototype, "y", {
        /**
         * Get the current position along Y.
         *
         * @returns {number} - y coordinate
         */
        get: function () { return this.mY; },
        enumerable: true,
        configurable: true
    });
    /**
     * Moves the UserAgent Up, Down, Left or Right.
     *
     * @param {Move} move - direction in which to move to
     *
     * @event onkeydown - 'w', 's', 'a', 'd', 'up', 'down', 'left', 'right'
     */
    UserAgent.prototype.move = function (move) {
        if (this.disabled) {
            return;
        }
        if (move === Move.Up && this.mY < this.mGame.GRID_SIZE) {
            this.mY += 1;
        }
        else if (move === Move.Down && this.mY > 1) {
            this.mY -= 1;
        }
        else if (move === Move.Right && this.mX < this.mGame.GRID_SIZE) {
            this.mX += 1;
        }
        else if (move === Move.Left && this.mX > 1) {
            this.mX -= 1;
        }
        this.render();
        this.measure();
        this.checkResult();
    };
    /**
     * Inform the current tile that it has been measured and should render
     * said measurement in color.
     */
    UserAgent.prototype.measure = function () {
        this.mGame.getTile(this.x, this.y).measured = true;
        return this.mGame.getTile(this.x, this.y).measurement;
    };
    /**
     * Resets the agent to the starting position (1, 1), returns to default color.
     */
    UserAgent.prototype.reset = function () {
        this.mX = 1;
        this.mY = 1;
        this.render();
        this.ux.finish();
        this.ux.fill("#f06");
        this.ux.radius(10);
        this.disabled = false;
    };
    /**
     * Animates the movement of the agent from the old position to the current
     * coordinates using the given (x,y).
     */
    UserAgent.prototype.render = function () {
        this.ux.finish();
        var BLOCK_SIZE = this.mGame.UX_SIZE / this.mGame.GRID_SIZE;
        this.ux.animate().center(BLOCK_SIZE * this.mX - BLOCK_SIZE / 2, this.mGame.UX_SIZE - BLOCK_SIZE * this.mY + BLOCK_SIZE / 2);
        this.ux.front();
        this.console();
    };
    /**
     * Checks the game has terminated. If yes, then invalidates future moves and
     * displays a banner saying that Wumpus / Gold / Pit was met.
     */
    UserAgent.prototype.checkResult = function () {
        var _this = this;
        var tile = this.mGame.getTile(this.mX, this.mY);
        if (tile.hasWumpus) {
            // Add text and a Rectangle behind it
            this.ux.animate().fill("#000000").radius(5);
            var rect_1 = this.mGame.canvas
                .rect(this.mGame.UX_SIZE, this.mGame.UX_SIZE / this.mGame.GRID_SIZE)
                .center(this.mGame.UX_SIZE / 2, this.mGame.UX_SIZE / 2).fill("#000000");
            var text_1 = this.mGame.canvas.text("Wumpus ate you.")
                .font({ family: "Helvetica", size: 60, fill: "white" })
                .center(this.mGame.UX_SIZE / 2, this.mGame.UX_SIZE / 2);
            // Reset the game 2 seconds later
            setTimeout(function () {
                _this.mGame.reset();
                rect_1.remove();
                text_1.remove();
            }, 2500);
            this.disabled = true;
        }
        else if (tile.hasPit) {
            this.ux.animate().fill("#000000").radius(5);
            // Add text and a Rectangle behind it
            var rect_2 = this.mGame.canvas
                .rect(this.mGame.UX_SIZE, this.mGame.UX_SIZE / this.mGame.GRID_SIZE)
                .center(this.mGame.UX_SIZE / 2, this.mGame.UX_SIZE / 2).fill("#000000");
            var text_2 = this.mGame.canvas.text("Oops, you fell in a Pit.")
                .font({ family: "Helvetica", size: 60, fill: "white" })
                .center(this.mGame.UX_SIZE / 2, this.mGame.UX_SIZE / 2);
            // Reset the game 2 seconds later
            setTimeout(function () {
                _this.mGame.reset();
                rect_2.remove();
                text_2.remove();
            }, 2500);
            this.disabled = true;
        }
        else if (tile.hasGold) {
            this.ux.animate().fill("#FFD000").radius(25);
            // Add text and a Rectangle behind it
            var rect_3 = this.mGame.canvas
                .rect(this.mGame.UX_SIZE, this.mGame.UX_SIZE / this.mGame.GRID_SIZE)
                .center(this.mGame.UX_SIZE / 2, this.mGame.UX_SIZE / 2).fill("#FFD000");
            var text_3 = this.mGame.canvas.text("You Won GOLD!.")
                .font({ family: "Helvetica", size: 60, fill: "black" })
                .center(this.mGame.UX_SIZE / 2, this.mGame.UX_SIZE / 2);
            // Reset the game 2 seconds later
            setTimeout(function () {
                _this.mGame.reset();
                rect_3.remove();
                text_3.remove();
            }, 2500);
            this.disabled = true;
        }
    };
    /**
     * Prints out the current measurement to the Agent Console.
     */
    UserAgent.prototype.console = function () {
        var pos = this.mGame.getTile(this.mX, this.mY);
        if (pos.hasGold) {
            $("#agent-console").html("Thank you for helping me find all this gold");
        }
        else if (pos.hasPit || pos.hasWumpus) {
            $("#agent-console").html("You were supposed to help me, I am dead now.");
        }
        else if (pos.hasStench && pos.hasBreeze) {
            $("#agent-console").html("There is a <strong>stench</strong> and there is a <strong>breeze</strong>!!!");
        }
        else if (pos.hasStench) {
            $("#agent-console").html("What's that <strong>stench?</strong> Wumpus must be around.");
        }
        else if (pos.hasBreeze) {
            $("#agent-console").html("There is a <strong>breeze</strong>. Careful not to fall in a pit.");
        }
        else {
            $("#agent-console").html("I feel <strong>safe</strong> here, nothing around.");
        }
    };
    return UserAgent;
}());
exports.UserAgent = UserAgent;
var Move;
(function (Move) {
    Move[Move["Left"] = 0] = "Left";
    Move[Move["Right"] = 1] = "Right";
    Move[Move["Up"] = 2] = "Up";
    Move[Move["Down"] = 3] = "Down";
})(Move = exports.Move || (exports.Move = {}));

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameGrid_1 = require("./GameGrid");
var UserAgent_1 = require("./UserAgent");
var game = new GameGrid_1.GameGrid();
game.getTile(3, 1).hasPit = true;
game.getTile(3, 3).hasPit = true;
game.getTile(4, 4).hasPit = true;
game.getTile(1, 3).hasWumpus = true;
game.getTile(2, 3).hasGold = true;
game.sensorUpdate();
// Binding the click events
$("#mode-game").on("click", function () { game.godsight = false; });
$("#mode-god").on("click", function () { game.godsight = true; });
// Binding the Keypress Event
$("html").on("keydown", function (e) {
    if (e.which === 37 || e.which === "A".charCodeAt(0)) {
        game.agent.move(UserAgent_1.Move.Left);
        game.modelFilter.render();
    }
    else if (e.which === 38 || e.which === "W".charCodeAt(0)) {
        game.agent.move(UserAgent_1.Move.Up);
        game.modelFilter.render();
    }
    else if (e.which === 39 || e.which === "D".charCodeAt(0)) {
        game.agent.move(UserAgent_1.Move.Right);
        game.modelFilter.render();
    }
    else if (e.which === 40 || e.which === "S".charCodeAt(0)) {
        game.agent.move(UserAgent_1.Move.Down);
        game.modelFilter.render();
    }
});

},{"./GameGrid":1,"./UserAgent":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJHYW1lR3JpZC50cyIsIkdhbWVUaWxlLnRzIiwiTW9kZWxGaWx0ZXJpbmcudHMiLCJVc2VyQWdlbnQudHMiLCJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSx1Q0FBbUQ7QUFDbkQsbURBQWtEO0FBQ2xELHlDQUF3QztBQUl4QztJQWtCRTs7OztPQUlHO0lBQ0g7UUFyQmdCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFDdEIsWUFBTyxHQUFXLEdBQUcsQ0FBQztRQUN0QixZQUFPLEdBQVcsU0FBUyxDQUFDO1FBSXJDLFVBQUssR0FBaUIsRUFBRSxDQUFDO1FBZ0I5QixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN2QyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksbUJBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUN2RCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNsQztTQUNGO1FBQ0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2QsSUFBSSxDQUFDLEtBQUss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LENBQUMsZ0JBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQzNCO1NBQU0sSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDMUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQzNCO0FBQ0gsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBHYW1lVGlsZSwgTWVhc3VyZW1lbnQgfSBmcm9tIFwiLi9HYW1lVGlsZVwiO1xuaW1wb3J0IHsgTW9kZWxGaWx0ZXJpbmcgfSBmcm9tIFwiLi9Nb2RlbEZpbHRlcmluZ1wiO1xuaW1wb3J0IHsgVXNlckFnZW50IH0gZnJvbSBcIi4vVXNlckFnZW50XCI7XG5cbmRlY2xhcmUgdmFyIFNWRzogYW55O1xuXG5leHBvcnQgY2xhc3MgR2FtZUdyaWQge1xuXG4gIHB1YmxpYyByZWFkb25seSBHUklEX1NJWkU6IG51bWJlciA9IDQ7XG4gIHB1YmxpYyByZWFkb25seSBVWF9TSVpFOiBudW1iZXIgPSA2MDA7XG4gIHB1YmxpYyByZWFkb25seSBFTEVNRU5UOiBzdHJpbmcgPSBcImRyYXdpbmdcIjtcbiAgcHVibGljIGNhbnZhczogYW55O1xuICBwdWJsaWMgYWdlbnQ6IFVzZXJBZ2VudDtcbiAgcHVibGljIG1vZGVsRmlsdGVyOiBNb2RlbEZpbHRlcmluZztcbiAgcHVibGljIHRpbGVzOiBHYW1lVGlsZVtdW10gPSBbXTtcbiAgcHJpdmF0ZSBnb2RTaWdodDogYm9vbGVhbjtcblxuICBzZXQgZ29kc2lnaHQoZ29kU2lnaHQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmdvZFNpZ2h0ID0gZ29kU2lnaHQ7XG4gICAgY29uc29sZS5sb2coXCJHb2RTaWdodDogXCIgKyBnb2RTaWdodCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICB0aGlzLmFnZW50LnJlbmRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlcyBhbmQgYXNzaWducyBwb3J0aW9ucyBvZiB0aGUgY2FudmFzIHRvIGVhY2ggb2YgdGhlIHRpbGVzLlxuICAgKiBJbml0aWFsaXplcyB0aGUgVXNlckFnZW50IGFuZCB0aGUgTW9kZWxGaWx0ZXJpbmcuXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jYW52YXMgPSBTVkcodGhpcy5FTEVNRU5UKS5zaXplKHRoaXMuVVhfU0laRSwgdGhpcy5VWF9TSVpFKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuR1JJRF9TSVpFOyBpKyspIHtcbiAgICAgIHRoaXMudGlsZXNbaV0gPSBbXTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5HUklEX1NJWkU7IGorKykge1xuICAgICAgICB0aGlzLnRpbGVzW2ldW2pdID0gbmV3IEdhbWVUaWxlKGkgKyAxLCB0aGlzLkdSSURfU0laRSAtIGosXG4gICAgICAgICAgdGhpcy5VWF9TSVpFIC8gdGhpcy5HUklEX1NJWkUpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHRoaXMuYWdlbnQgPSBuZXcgVXNlckFnZW50KHRoaXMpO1xuICAgIHRoaXMuZ29kU2lnaHQgPSBmYWxzZTtcbiAgICB0aGlzLm1vZGVsRmlsdGVyID0gbmV3IE1vZGVsRmlsdGVyaW5nKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHRpbGUgYXQgaW5kZXggKGksaikgb24gdGhlIGdhbWUgZ3JpZC5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGkgLSB4LWNvb3JkaW5hdGUgdG8gdGlsZSBxdWVyaWVkXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBqIC0geS1jb29yZGluYXRlIHRvIHRpbGUgcXVlcmllZFxuICAgKlxuICAgKiBAcmV0dXJucyB7R2FtZVRpbGV9IC0gVGlsZSBhdCBsb2NhdGlvbiAoaSxqKVxuICAgKi9cbiAgcHVibGljIGdldFRpbGUoaTogbnVtYmVyLCBqOiBudW1iZXIpOiBHYW1lVGlsZSB7XG4gICAgaSA9IGkgLSAxO1xuICAgIGogPSB0aGlzLkdSSURfU0laRSAtIGo7XG4gICAgaWYgKGkgPCAwIHx8IGogPCAwIHx8IGkgPj0gdGhpcy5HUklEX1NJWkUgfHwgaiA+PSB0aGlzLkdSSURfU0laRSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWNjZXNzaW5nIGludmFsaWQgdGlsZSBpbmRleCAoXCIgKyBpICsgXCIsXCIgKyBqICsgXCIpXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50aWxlc1tpXVtqXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGlsZXMgdGhhdCBhcmUgZGlyZWN0bHkgYWRqYWNlbnQgdG8gdGhlIHRpbGUgZ2l2ZW5cbiAgICpcbiAgICogQHBhcmFtIHtHYW1lVGlsZX0gdGlsZSAtIHRpbGUgd2hvc2UgbmVpZ2hib3JzIHdlIGFyZSBzZWFyY2hpbmcgZm9yXG4gICAqXG4gICAqIEByZXR1cm5zIHtHYW1lVGlsZVtdfSAtIGxpc3Qgb2YgYXQgbW9zdCA0IHRpbGVzIHRoYXQgYXJlIGFkamFjZW50IHRvIHRpbGVcbiAgICovXG4gIHB1YmxpYyBnZXROZWlnaGJvcnModGlsZTogR2FtZVRpbGUpOiBHYW1lVGlsZVtdIHtcbiAgICBjb25zdCByZXN1bHQ6IEdhbWVUaWxlW10gPSBbXTtcbiAgICBpZiAodGlsZS54ID4gMSkge1xuICAgICAgICByZXN1bHQucHVzaCh0aGlzLmdldFRpbGUodGlsZS54IC0gMSwgdGlsZS55KSk7XG4gICAgfVxuICAgIGlmICh0aWxlLnggPCB0aGlzLkdSSURfU0laRSkge1xuICAgICAgcmVzdWx0LnB1c2godGhpcy5nZXRUaWxlKHRpbGUueCArIDEsIHRpbGUueSkpO1xuICAgIH1cbiAgICBpZiAodGlsZS55ID4gMSkge1xuICAgICAgcmVzdWx0LnB1c2godGhpcy5nZXRUaWxlKHRpbGUueCwgdGlsZS55IC0gMSkpO1xuICAgIH1cbiAgICBpZiAodGlsZS55IDwgdGhpcy5HUklEX1NJWkUpIHtcbiAgICAgIHJlc3VsdC5wdXNoKHRoaXMuZ2V0VGlsZSh0aWxlLngsIHRpbGUueSArIDEpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgc3RlbmNoZXMgYW5kIGJyZWV6ZXMgaW4gYWxsIHRpbGVzIGJhc2VkIG9uIHdoZXJlIHBpdHMgYW5kXG4gICAqIHd1bXB1cyBhcmUgcHJlc2VudC5cbiAgICovXG4gIHB1YmxpYyBzZW5zb3JVcGRhdGUoKSB7XG4gICAgLy8gTG9vcCBvdmVyIGFsbCB0aWxlc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5HUklEX1NJWkU7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLkdSSURfU0laRTsgaisrKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIHRpbGVbaV1bal0gaGFzIGEgYnJlZXplL3N0ZW5jaCBkdWUgdG8gYSBuZWlnaGJvcnMuXG4gICAgICAgIGxldCBzdGVuY2g6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgbGV0IGJyZWV6ZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBmb3IgKGNvbnN0IG5laWdoYm9yIG9mIHRoaXMuZ2V0TmVpZ2hib3JzKHRoaXMudGlsZXNbaV1bal0pKSB7XG4gICAgICAgICAgc3RlbmNoID0gbmVpZ2hib3IuaGFzV3VtcHVzIHx8IHN0ZW5jaDtcbiAgICAgICAgICBicmVlemUgPSBuZWlnaGJvci5oYXNQaXQgfHwgYnJlZXplO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNldCB0aGUgbWVhc3VyZW1lbnQgb2YgdGhlIHRpbGUgYmFzZWQgb24gaXQncyBuZWlnaGJvcnMgYW5kIHJlbmRlci5cbiAgICAgICAgdGhpcy50aWxlc1tpXVtqXS5tZWFzdXJlbWVudCA9IGJyZWV6ZVxuICAgICAgICAgID8gKHN0ZW5jaCA/IE1lYXN1cmVtZW50LlN0ZW5jaHlCcmVlemUgOiBNZWFzdXJlbWVudC5CcmVlemUpXG4gICAgICAgICAgOiAoc3RlbmNoID8gTWVhc3VyZW1lbnQuU3RlbmNoIDogTWVhc3VyZW1lbnQuU2FmZSk7XG4gICAgICAgIHRoaXMudGlsZXNbaV1bal0ucmVuZGVyKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyBhbGwgdGhlIHRpbGVzLCB0aGUgYWdlbnQsIGFuZCB0aGUgbW9kZWxGaWx0ZXJpbmcuXG4gICAqL1xuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLkdSSURfU0laRTsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuR1JJRF9TSVpFOyBqKyspIHtcbiAgICAgICAgdGhpcy50aWxlc1tpXVtqXS5yZXNldCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmdldFRpbGUoMSwgMSkubWVhc3VyZWQgPSB0cnVlO1xuICAgIHRoaXMuYWdlbnQucmVzZXQoKTtcbiAgICB0aGlzLm1vZGVsRmlsdGVyLnJlbmRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3RyaWJ1dGVzIHRoZSBjYW52YXMgc3BhY2UgdG8gYWxsIHRoZSB0aWxlcyBhbmQgcmVuZGVycyBhbGwgb2YgdGhlbS5cbiAgICovXG4gIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgY29uc3QgQkxPQ0tfU0laRTogbnVtYmVyID0gdGhpcy5VWF9TSVpFIC8gdGhpcy5HUklEX1NJWkU7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLkdSSURfU0laRTsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuR1JJRF9TSVpFOyBqKyspIHtcbiAgICAgICAgdGhpcy50aWxlc1tpXVtqXS5jYW52YXMgPSB0aGlzLmNhbnZhcy5uZXN0ZWQoKVxuICAgICAgICAgIC5hdHRyKHsgeDogQkxPQ0tfU0laRSAqIGksIHk6IEJMT0NLX1NJWkUgKiBqIH0pO1xuICAgICAgICB0aGlzLnRpbGVzW2ldW2pdLnJlbmRlcih0aGlzLmdvZFNpZ2h0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBHYW1lVGlsZSB7XG5cbiAgcHJvdGVjdGVkIG1XdW1wdXM6IGJvb2xlYW47XG4gIHByb3RlY3RlZCBtUGl0OiBib29sZWFuO1xuICBwcm90ZWN0ZWQgbUdvbGQ6IGJvb2xlYW47XG4gIHByb3RlY3RlZCBtQ2FudmFzOiBhbnk7XG4gIHByaXZhdGUgcmVhZG9ubHkgQkxPQ0tfU0laRTogbnVtYmVyO1xuICBwcml2YXRlIHJlYWRvbmx5IG1YOiBudW1iZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgbVk6IG51bWJlcjtcbiAgcHJpdmF0ZSBtTWVhc3VyZW1lbnQ6IE1lYXN1cmVtZW50O1xuICBwcml2YXRlIG1NZWFzdXJlZDogYm9vbGVhbjtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHRpbGUsIGFzc3VtaW5nIGl0IGhhcyBub3RoaW5nLCBubyBXdW1wdXMsIG5vIFBpdCwgbm8gR29sZFxuICAgKiBAY29uc3RydWN0b3JcbiAgICpcbiAgICogQHBhcmFtIHhcbiAgICogQHBhcmFtIHlcbiAgICogQHBhcmFtIGJsb2NrU2l6ZVxuICAgKi9cbiAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIGJsb2NrU2l6ZTogbnVtYmVyID0gMTAwKSB7XG4gICAgdGhpcy5tWCA9IHg7XG4gICAgdGhpcy5tWSA9IHk7XG4gICAgdGhpcy5tV3VtcHVzID0gZmFsc2U7XG4gICAgdGhpcy5tUGl0ID0gZmFsc2U7XG4gICAgdGhpcy5tR29sZCA9IGZhbHNlO1xuICAgIHRoaXMuQkxPQ0tfU0laRSA9IGJsb2NrU2l6ZTtcbiAgICB0aGlzLm1NZWFzdXJlbWVudCA9IE1lYXN1cmVtZW50LlNhZmU7XG4gICAgdGhpcy5tTWVhc3VyZWQgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjYW52YXMgZWxlbWVudCBvdmVyIHdoaWNoIHRoZSB0aWxlIHdpbGwgYmUgZHJhd25cbiAgICpcbiAgICogQHBhcmFtIHtTVkdFbGVtZW50fSBjYW52YXMgLSBuZXN0ZWQgZWxlbWVudCBvbiB0aGUgU1ZHIGNhbnZhc1xuICAgKi9cbiAgc2V0IGNhbnZhcyhjYW52YXM6IGFueSkge1xuICAgIHRoaXMubUNhbnZhcyA9IGNhbnZhcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB4LWNvb3JkaW5hdGUgb2YgdGhlIHRpbGUuXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IHgtY29vcmRpbmF0ZSBvZiB0aGUgdGlsZVxuICAgKi9cbiAgZ2V0IHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5tWDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIHRpbGUuXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IHktY29vcmRpbmF0ZSBvZiB0aGUgdGlsZVxuICAgKi9cbiAgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5tWTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB0aWxlIHRvIGhhdmUgZ29sZCBpbiBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSB3dW1wdXMgLSB0cnVlIGlmIHRoZSB0aWxlIHNob3VsZCBoYXZlIHd1bXB1cyBpbiBpdCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAqL1xuICBzZXQgaGFzV3VtcHVzKHd1bXB1czogYm9vbGVhbikge1xuICAgIHRoaXMubVd1bXB1cyA9IHd1bXB1cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIHRoZSB0aWxlIGhhcyBXdW1wdXMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSB0aWxlIGhhcyBXdW1wdXMsIGZhbHNlIG90aGVyd2lzZVxuICAgKi9cbiAgZ2V0IGhhc1d1bXB1cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5tV3VtcHVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHRpbGUgdG8gaGF2ZSBhIHBpdCBpbiBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBwaXQgLSB0cnVlIGlmIHRoZSB0aWxlIHNob3VsZCBoYXZlIGEgcGl0IGluIGl0LCBmYWxzZSBvdGhlcndpc2VcbiAgICovXG4gIHNldCBoYXNQaXQocGl0OiBib29sZWFuKSB7XG4gICAgdGhpcy5tUGl0ID0gcGl0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgdGhlIHRpbGUgaGFzIGEgUGl0LlxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgdGlsZSBoYXMgYSBQaXQsIGZhbHNlIG90aGVyd2lzZVxuICAgKi9cbiAgZ2V0IGhhc1BpdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5tUGl0O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHRpbGUgdG8gaGF2ZSBnb2xkIGluIGl0LlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGdvbGQgLSB0cnVlIGlmIHRoZSB0aWxlIHNob3VsZCBoYXZlIGdvbGQgaW4gaXQsIGZhbHNlIG90aGVyd2lzZVxuICAgKi9cbiAgc2V0IGhhc0dvbGQoZ29sZDogYm9vbGVhbikge1xuICAgIHRoaXMubUdvbGQgPSBnb2xkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgdGhlIHRpbGUgaGFzIGdvbGQgaW4gaXQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSB0aWxlIGhhcyBnb2xkIGluIGl0LCBmYWxzZSBvdGhlcndpc2VcbiAgICovXG4gIGdldCBoYXNHb2xkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm1Hb2xkO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdGhlIG1lYXN1cmVtZW50IGluIHRoZSB0aWxlIHRvIHRoZSBzdXBwbGllZCB2YWx1ZSBhbmQgcmUtcmVuZGVycyBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtNZWFzdXJlbWVudH0gbWVhc3VyZW1lbnQgLSB2YWx1ZSBvZiB0aGUgbWVhc3VyZW1lbnQgYXQgdGhlIHRpbGVcbiAgICovXG4gIHNldCBtZWFzdXJlbWVudChtZWFzdXJlbWVudDogTWVhc3VyZW1lbnQpIHtcbiAgICB0aGlzLm1NZWFzdXJlbWVudCA9IG1lYXN1cmVtZW50O1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBpZiB0aGUgdGlsZSBoYXMgYmVlbiBtZWFzdXJlZFxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgdGlsZSBoYXMgYWxyZWFkeSBiZWVuIG1lYXN1cmVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICovXG4gIGdldCBtZWFzdXJlbWVudCgpOiBNZWFzdXJlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMubU1lYXN1cmVtZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHRpbGUgdG8gYmUgbWVhc3VyZWQgYW5kIHJlLXJlbmRlcnMgdGhlIHRpbGUuXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gbWVhc3VyZWQgLSB0cnVlIGlmIHRoZSB0aWxlIGhhcyBiZWVuIG1lYXN1cmVkICh2aXNpdGVkKVxuICAgKi9cbiAgc2V0IG1lYXN1cmVkKG1lYXN1cmVkOiBib29sZWFuKSB7XG4gICAgdGhpcy5tTWVhc3VyZWQgPSBtZWFzdXJlZDtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgdGhlIHRpbGUgaGFzIGJlZW4gbWVhc3VyZWRcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIHRpbGUgaGFzIGFscmVhZHkgYmVlbiBtZWFzdXJlZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAqL1xuICBnZXQgbWVhc3VyZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubU1lYXN1cmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBicmVlemUgdG8gdGhlIHRpbGUgaWYgbm90IGFscmVhZHkgcHJlc2VudC5cbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBicmVlemUtIHRydWUgaWYgdGhlcmUgaXMgYSBicmVlemUsIGZhbHNlIG90aGVyd2lzZVxuICAgKi9cbiAgc2V0IGhhc0JyZWV6ZShicmVlemU6IGJvb2xlYW4pIHtcbiAgICBpZiAoYnJlZXplICYmIHRoaXMubU1lYXN1cmVtZW50ID09PSBNZWFzdXJlbWVudC5TdGVuY2gpIHtcbiAgICAgIHRoaXMubU1lYXN1cmVtZW50ID0gTWVhc3VyZW1lbnQuU3RlbmNoeUJyZWV6ZTtcbiAgICB9IGVsc2UgaWYgKGJyZWV6ZSAmJiB0aGlzLm1NZWFzdXJlbWVudCA9PT0gTWVhc3VyZW1lbnQuU2FmZSkge1xuICAgICAgdGhpcy5tTWVhc3VyZW1lbnQgPSBNZWFzdXJlbWVudC5CcmVlemU7XG4gICAgfSBlbHNlIGlmICghYnJlZXplICYmIHRoaXMubU1lYXN1cmVtZW50ID09PSBNZWFzdXJlbWVudC5TdGVuY2h5QnJlZXplKSB7XG4gICAgICB0aGlzLm1NZWFzdXJlbWVudCA9IE1lYXN1cmVtZW50LlN0ZW5jaDtcbiAgICB9IGVsc2UgaWYgKCFicmVlemUgJiYgdGhpcy5tTWVhc3VyZW1lbnQgPT09IE1lYXN1cmVtZW50LkJyZWV6ZSkge1xuICAgICAgdGhpcy5tTWVhc3VyZW1lbnQgPSBNZWFzdXJlbWVudC5TYWZlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIHRoZSB0aWxlIGhhcyBhIGJyZWV6ZS5cbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gdHJ1ZSBpZiB0aGUgdGlsZSBoYXMgYnJlZXplLCBmYWxzZSBvdGhlcndpc2VcbiAgICovXG4gIGdldCBoYXNCcmVlemUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubU1lYXN1cmVtZW50ID09PSBNZWFzdXJlbWVudC5CcmVlemVcbiAgICAgIHx8IHRoaXMubU1lYXN1cmVtZW50ID09PSBNZWFzdXJlbWVudC5TdGVuY2h5QnJlZXplO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBzdGVuY2ggdG8gdGhlIHRpbGUgaWYgbm90IGFscmVhZHkgcHJlc2VudC5cbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBzdGVuY2ggLSB0cnVlIGlmIHRoZXJlIGlzIGEgc3RlbmNoLCBmYWxzZSBvdGhlcndpc2VcbiAgICovXG4gIHNldCBoYXNTdGVuY2goc3RlbmNoOiBib29sZWFuKSB7XG4gICAgaWYgKHN0ZW5jaCAmJiB0aGlzLm1NZWFzdXJlbWVudCA9PT0gTWVhc3VyZW1lbnQuQnJlZXplKSB7XG4gICAgICB0aGlzLm1NZWFzdXJlbWVudCA9IE1lYXN1cmVtZW50LlN0ZW5jaHlCcmVlemU7XG4gICAgfSBlbHNlIGlmIChzdGVuY2ggJiYgdGhpcy5tTWVhc3VyZW1lbnQgPT09IE1lYXN1cmVtZW50LlNhZmUpIHtcbiAgICAgIHRoaXMubU1lYXN1cmVtZW50ID0gTWVhc3VyZW1lbnQuU3RlbmNoO1xuICAgIH0gZWxzZSBpZiAoIXN0ZW5jaCAmJiB0aGlzLm1NZWFzdXJlbWVudCA9PT0gTWVhc3VyZW1lbnQuU3RlbmNoeUJyZWV6ZSkge1xuICAgICAgdGhpcy5tTWVhc3VyZW1lbnQgPSBNZWFzdXJlbWVudC5TdGVuY2g7XG4gICAgfSBlbHNlIGlmICghc3RlbmNoICYmIHRoaXMubU1lYXN1cmVtZW50ID09PSBNZWFzdXJlbWVudC5TdGVuY2gpIHtcbiAgICAgIHRoaXMubU1lYXN1cmVtZW50ID0gTWVhc3VyZW1lbnQuU2FmZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSB0aGUgdGlsZSBoYXMgYSBzdGVuY2guXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIHRydWUgaWYgdGhlIHRpbGUgaGFzIHN0ZW5jaCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAqL1xuICBnZXQgaGFzU3RlbmNoKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm1NZWFzdXJlbWVudCA9PT0gTWVhc3VyZW1lbnQuU3RlbmNoXG4gICAgICB8fCB0aGlzLm1NZWFzdXJlbWVudCA9PT0gTWVhc3VyZW1lbnQuU3RlbmNoeUJyZWV6ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXJzIG91dCB0aGUgdGlsZSwgYXMgdHdvIHNxdWFyZXMuXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIFRpbGUgaXMgZGlzcGxheWVkIGFzIHR3byBzcXVhcmVzIG9uIGJlaGluZCB0aGUgb3RoZXIuXG4gICAqIE91dGVyIHJpbSBzaG93cyB0aGUgY29sb3IgZGVub3RpbmcgdGhlIG1lYXN1cmVtZW50LlxuICAgKi9cbiAgcHVibGljIHJlbmRlcihmb3JjZVZpc2liaWxpdHk6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgIGNvbnN0IHJPdXQgPSB0aGlzLm1DYW52YXMucmVjdCh0aGlzLkJMT0NLX1NJWkUgKiAwLjk4LCB0aGlzLkJMT0NLX1NJWkUgKiAwLjk4KTtcbiAgICBjb25zdCBySW5uID0gdGhpcy5tQ2FudmFzLnJlY3QodGhpcy5CTE9DS19TSVpFICogMC43NSwgdGhpcy5CTE9DS19TSVpFICogMC43NSk7XG4gICAgaWYgKHRoaXMubU1lYXN1cmVkKSB7XG4gICAgICByT3V0LmZpbGwoeyBjb2xvcjogdGhpcy5tTWVhc3VyZW1lbnQgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJPdXQuZmlsbCh7IGNvbG9yOiBcIiNjY2NcIiB9KTtcbiAgICB9XG4gICAgcklubi5maWxsKHsgY29sb3I6IFwiI2RkZFwiIH0pO1xuICAgIHJPdXQuY2VudGVyKHRoaXMuQkxPQ0tfU0laRSAvIDIsIHRoaXMuQkxPQ0tfU0laRSAvIDIpO1xuICAgIHJJbm4uY2VudGVyKHRoaXMuQkxPQ0tfU0laRSAvIDIsIHRoaXMuQkxPQ0tfU0laRSAvIDIpO1xuICAgIFxuICAgIGlmICh0aGlzLm1NZWFzdXJlZCB8fCBmb3JjZVZpc2liaWxpdHkpIHtcbiAgICAgIC8vIFJlbmRlcmluZyB0aGUgSWNvbnNcbiAgICAgIGlmICh0aGlzLmhhc1d1bXB1cykge1xuICAgICAgICB0aGlzLm1DYW52YXMuaW1hZ2UoJ2ltZy93dW1wdXMucG5nJyxcbiAgICAgICAgICB0aGlzLkJMT0NLX1NJWkUgKiAwLjYsIHRoaXMuQkxPQ0tfU0laRSAqIDAuNilcbiAgICAgICAgICAuY2VudGVyKHRoaXMuQkxPQ0tfU0laRSAvIDIsIHRoaXMuQkxPQ0tfU0laRSAvIDIpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAodGhpcy5oYXNQaXQpIHtcbiAgICAgICAgdGhpcy5tQ2FudmFzLmltYWdlKCdpbWcvcGl0LnBuZycsXG4gICAgICAgICAgdGhpcy5CTE9DS19TSVpFICogMC42LCB0aGlzLkJMT0NLX1NJWkUgKiAwLjYpXG4gICAgICAgICAgLmNlbnRlcih0aGlzLkJMT0NLX1NJWkUgLyAyLCB0aGlzLkJMT0NLX1NJWkUgLyAyKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5oYXNHb2xkKSB7XG4gICAgICAgICAgdGhpcy5tQ2FudmFzLmltYWdlKCdpbWcvZ29sZC5wbmcnLFxuICAgICAgICAgICAgdGhpcy5CTE9DS19TSVpFICogMC42LCB0aGlzLkJMT0NLX1NJWkUgKiAwLjIpXG4gICAgICAgICAgICAuY2VudGVyKHRoaXMuQkxPQ0tfU0laRSAvIDIsIHRoaXMuQkxPQ0tfU0laRSAvIDIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmhhc0JyZWV6ZSkge1xuICAgICAgICAgIHRoaXMubUNhbnZhcy5pbWFnZSgnaW1nL2JyZWV6ZS5wbmcnLFxuICAgICAgICAgICAgdGhpcy5CTE9DS19TSVpFICogMC42LCB0aGlzLkJMT0NLX1NJWkUgKiAwLjIpXG4gICAgICAgICAgICAuY2VudGVyKHRoaXMuQkxPQ0tfU0laRSAvIDIsIHRoaXMuQkxPQ0tfU0laRSAvIDIgKyB0aGlzLkJMT0NLX1NJWkUgKiAwLjI1KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5oYXNTdGVuY2gpIHtcbiAgICAgICAgICB0aGlzLm1DYW52YXMuaW1hZ2UoJ2ltZy9zdGVuY2gucG5nJyxcbiAgICAgICAgICAgIHRoaXMuQkxPQ0tfU0laRSAqIDAuNiwgdGhpcy5CTE9DS19TSVpFICogMC4yKVxuICAgICAgICAgICAgLmNlbnRlcih0aGlzLkJMT0NLX1NJWkUgLyAyLCB0aGlzLkJMT0NLX1NJWkUgLyAyIC0gdGhpcy5CTE9DS19TSVpFICogMC4yNSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIHRoZSB0aWxlIHRvIHN0b3Agc2hvd2luZyBpdHMgbWVhc3VyZW1lbnQuXG4gICAqL1xuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5tZWFzdXJlZCA9IGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBlbnVtIE1lYXN1cmVtZW50IHtcbiAgU3RlbmNoID0gXCIjZmYwMDAwXCIsXG4gIEJyZWV6ZSA9IFwiIzAwMDAwMFwiLFxuICBTdGVuY2h5QnJlZXplID0gXCIjNjYwMDAwXCIsXG4gIFNhZmUgPSBcIiM1NWZmNjZcIixcbn1cbiIsImltcG9ydCB7IEdhbWVHcmlkIH0gZnJvbSBcIi4vR2FtZUdyaWRcIjtcblxuZGVjbGFyZSB2YXIgU1ZHOiBhbnk7XG5cbmV4cG9ydCBjbGFzcyBNb2RlbEZpbHRlcmluZyB7XG5cbiAgcHJvdGVjdGVkIGNhbnZhczogYW55W10gPSBbXTtcbiAgcHJvdGVjdGVkIGdhbWU6IEdhbWVHcmlkO1xuICBwcml2YXRlIGNhbnZhc1BhcmVudDogYW55O1xuICBwcml2YXRlIHJlYWRvbmx5IEVMRU1FTlQgPSBcImRyYXdpbmctbW9kZWxzXCI7XG4gIHByaXZhdGUgcmVhZG9ubHkgVVhfU0laRSA9IDQ1MDtcblxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgbmV3IGFuYWx5c2lzIHNwYWNlLCBtYWtlcyA4IGJvYXJkcywgYW5kIDIgdGV4dC1vdXRwdXRzXG4gICAqIGFuZCBzdG9yZXMgdGhlbSBhcyBuZXN0ZWQgU1ZHIGluIHRoaXMuY2FudmFzW10uXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAcGFyYW0ge0dhbWVHcmlkfSBnYW1lIC0gZ2FtZSBvYmplY3QgdGhhdCB3ZSBhcmUgYW5hbHl6aW5nXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqXG4gICAqIFRoZSBzcGFjZSBvbiB0aGUgWC1heGlzIG9mIGNhbnZhcyBpcyBhbGxvdHRlZCBhcyBmb2xsb3dzOlxuICAgKiAgMS4wMCAqIFVYX1NJWkUgKiAyOiBNb2RlbHMgZm9yIEVhY2ggcG9zc2libGUgbW92ZVxuICAgKiAgMC4wMSAqIFVYX1NJWkUgKiAyOiBzZXBhcmF0b3Igc3BhY2VcbiAgICogID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICogIFRPVEFMOiAyLjAyICogVVhfU0laRSBvbiB0aGUgWCBBeGlzXG4gICAqXG4gICAqIFRoZSBzcGFjZSBvbiB0aGUgWS1heGlzIG9mIGNhbnZhcyBpcyBhbGxvdHRlZCBhcyBmb2xsb3dzOlxuICAgKiAgMC4yNSAqIFVYX1NJWkU6IEJhbm5lciBvZiB3aGF0IG1vdmUgaXQgaXNcbiAgICogIDEuMDAgKiBVWF9TSVpFOiBNb2RlbHMgZm9yIExlZnQgTW92ZVxuICAgKiAgMC4wMSAqIFVYX1NJWkU6IFNlcGFyYXRvciBzcGFjZVxuICAgKiAgMC4yNSAqIFVYX1NJWkU6IENvbmNsdXNpb25zIGZvciB0aGUgbW92ZVxuXG4gICAqICAwLjI1ICogVVhfU0laRTogQmFubmVyIG9mIHdoYXQgbW92ZSBpdCBpc1xuICAgKiAgMS4wMCAqIFVYX1NJWkU6IE1vZGVscyBmb3IgUmlnaHQgTW92ZVxuICAgKiAgMC4wMSAqIFVYX1NJWkU6IFNlcGFyYXRvciBzcGFjZVxuICAgKiAgMC4yNSAqIFVYX1NJWkU6IENvbmNsdXNpb25zIGZvciB0aGUgbW92ZVxuXG4gICAqICAwLjI1ICogVVhfU0laRTogQmFubmVyIG9mIHdoYXQgbW92ZSBpdCBpc1xuICAgKiAgMS4wMCAqIFVYX1NJWkU6IE1vZGVscyBmb3IgVXAgTW92ZVxuICAgKiAgMC4wMSAqIFVYX1NJWkU6IFNlcGFyYXRvciBzcGFjZVxuICAgKiAgMC4yNSAqIFVYX1NJWkU6IENvbmNsdXNpb25zIGZvciB0aGUgbW92ZVxuXG4gICAqICAwLjI1ICogVVhfU0laRTogQmFubmVyIG9mIHdoYXQgbW92ZSBpdCBpc1xuICAgKiAgMS4wMCAqIFVYX1NJWkU6IE1vZGVscyBmb3IgRG93biBNb3ZlXG4gICAqICAwLjAxICogVVhfU0laRTogU2VwYXJhdG9yIHNwYWNlXG4gICAqICAwLjI1ICogVVhfU0laRTogQ29uY2x1c2lvbnMgZm9yIHRoZSBtb3ZlXG4gICAqICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAqICBUT1RBTDogNi4wNCAqIFVYX1NJWkUgb24gdGhlIFkgQXhpc1xuICAgKi9cbiAgY29uc3RydWN0b3IoZ2FtZTogR2FtZUdyaWQpIHtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgIC8vIEluaXRpYWxpemluZyB0aGUgOCBuZXN0ZWQgU1ZHIGNhbnZhc2VzIGZvciBlYWNoIGZ1dHVyZSBtb3ZlXG4gICAgdGhpcy5jYW52YXNQYXJlbnQgPSBTVkcodGhpcy5FTEVNRU5UKS5zaXplKHRoaXMuVVhfU0laRSAqIDIuMDIsIHRoaXMuVVhfU0laRSAqIDYuMDQpO1xuICAgIGNvbnN0IG1vdmVUZXh0cyA9IFtcIlJpZ2h0XCIsIFwiVXBcIiwgXCJMZWZ0XCIsIFwiRG93blwiXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgLy8gQmFubmVycyBhdCBmb3IgV3VtcHVzXG4gICAgICB0aGlzLmNhbnZhc1BhcmVudC5yZWN0KHRoaXMuVVhfU0laRSwgMC4yNSAqIHRoaXMuVVhfU0laRSlcbiAgICAgICAgLmNlbnRlcigwLjUgKiB0aGlzLlVYX1NJWkUsICgxLjUxICogaSArIDAuMTI1KSAqIHRoaXMuVVhfU0laRSlcbiAgICAgIHRoaXMuY2FudmFzUGFyZW50LnRleHQoXCJDaGVja2luZyBXdW1wdXMgb24gdGhlIFwiICsgbW92ZVRleHRzW2ldKVxuICAgICAgICAuY2VudGVyKDAuNSAqIHRoaXMuVVhfU0laRSwgKDEuNTEgKiBpICsgMC4xMjUpICogdGhpcy5VWF9TSVpFKVxuICAgICAgICAuZm9udCh7IHdlaWdodDogXCJib2xkXCIsIGZpbGw6IFwid2hpdGVcIiB9KTtcbiAgICAgIC8vIEdlbmVyYXRlIE1vZGVscyBmb3IgV3VtcHVzXG4gICAgICB0aGlzLmNhbnZhc1tpXSA9IHRoaXMuY2FudmFzUGFyZW50Lm5lc3RlZCgpLnNpemUodGhpcy5VWF9TSVpFLCB0aGlzLlVYX1NJWkUpO1xuICAgICAgdGhpcy5jYW52YXNbaV0uY2VudGVyKDAuNTAgKiB0aGlzLlVYX1NJWkUsICgxLjUxICogaSArIDAuNzUpICogdGhpcy5VWF9TSVpFKTtcbiAgICAgIC8vIEJhbm5lcnMgYXQgZm9yIFd1bXB1c1xuICAgICAgdGhpcy5jYW52YXNQYXJlbnQucmVjdCh0aGlzLlVYX1NJWkUsIDAuMjUgKiB0aGlzLlVYX1NJWkUpXG4gICAgICAgIC5jZW50ZXIoMS41MSAqIHRoaXMuVVhfU0laRSwgKDEuNTEgKiBpICsgMC4xMjUpICogdGhpcy5VWF9TSVpFKVxuICAgICAgdGhpcy5jYW52YXNQYXJlbnQudGV4dChcIkNoZWNraW5nIFd1bXB1cyBvbiB0aGUgXCIgKyBtb3ZlVGV4dHNbaV0pXG4gICAgICAgIC5jZW50ZXIoMS41MSAqIHRoaXMuVVhfU0laRSwgKDEuNTEgKiBpICsgMC4xMjUpICogdGhpcy5VWF9TSVpFKVxuICAgICAgICAuZm9udCh7IHdlaWdodDogXCJib2xkXCIsIGZpbGw6IFwid2hpdGVcIiB9KTtcbiAgICAgIC8vIEdlbmVyYXRlIE1vZGVscyBmb3IgUGl0c1xuICAgICAgdGhpcy5jYW52YXNbaSArIDRdID0gdGhpcy5jYW52YXNQYXJlbnQubmVzdGVkKCkuc2l6ZSh0aGlzLlVYX1NJWkUsIHRoaXMuVVhfU0laRSk7XG4gICAgICB0aGlzLmNhbnZhc1tpICsgNF0uY2VudGVyKDEuNTEgKiB0aGlzLlVYX1NJWkUsICgxLjUxICogaSArIDAuNzUpICogdGhpcy5VWF9TSVpFKTtcbiAgICAgIC8vIFJlc3VsdHNcbiAgICAgIHRoaXMuY2FudmFzW2kgKyA4XSA9IHRoaXMuY2FudmFzUGFyZW50Lm5lc3RlZCgpLnNpemUoMiAqIHRoaXMuVVhfU0laRSwgMC4yNSAqIHRoaXMuVVhfU0laRSk7XG4gICAgICB0aGlzLmNhbnZhc1tpICsgOF0uY2VudGVyKDEuMCAqIHRoaXMuVVhfU0laRSwgKDEuNTEgKiBpICsgMS4zNzUpICogdGhpcy5VWF9TSVpFKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXJzIGFsbCBwb3NzaWJsZSBtb2RlbHMgb2YgdGhlIGZ1dHVyZSBhbmQgd2h5IHRoZXkgaG9sZCB0cnVlIG9yIGZhbHNlLlxuICAgKiBDdXJyZW50bHkgdHJpZXMgdG8gZmlsdGVyIHV0aWxpemluZyB0aGUgZmVhdHVyZXMgb2YgdGhpcyBzcGFjZS5cbiAgICovXG4gIHB1YmxpYyByZW5kZXIoKTogdm9pZCB7XG4gICAgY29uc3QgY3VyWCA9IHRoaXMuZ2FtZS5hZ2VudC54O1xuICAgIGNvbnN0IGN1clkgPSB0aGlzLmdhbWUuYWdlbnQueTtcbiAgICBjb25zdCB2YWxpZDogYm9vbGVhbltdID0gW107XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCA4OyB4KyspIHtcbiAgICAgIC8vIGRlbGV0ZSB0aGUgb2xkIGdyaWQgYW5kIGFzc3VtZSBtb2RlbCBpcyB2YWxpZFxuICAgICAgdGhpcy5jYW52YXNbeF0uY2xlYXIoKTtcbiAgICAgIHZhbGlkW3hdID0gdHJ1ZTtcbiAgICAgIC8vIGdlbmVyYXRpbmcgdGhlIGluZGV4IG9mIHRoZSBuZXh0IHRpbGVcbiAgICAgIGxldCBwb3NYID0gY3VyWDtcbiAgICAgIGxldCBwb3NZID0gY3VyWTtcbiAgICAgIGlmICgoeCA9PT0gMCB8fCB4ID09PSA0KSAmJiAoY3VyWCA8IHRoaXMuZ2FtZS5HUklEX1NJWkUpKSB7XG4gICAgICAgIHBvc1grKztcbiAgICAgIH0gZWxzZSBpZiAoKHggPT09IDEgfHwgeCA9PT0gNSkgJiYgKGN1clkgPCB0aGlzLmdhbWUuR1JJRF9TSVpFKSkge1xuICAgICAgICBwb3NZKys7XG4gICAgICB9IGVsc2UgaWYgKCh4ID09PSAyIHx8IHggPT09IDYpICYmIChjdXJYID4gMSkpIHtcbiAgICAgICAgcG9zWC0tO1xuICAgICAgfSBlbHNlIGlmICgoeCA9PT0gMyB8fCB4ID09PSA3KSAmJiAoY3VyWSA+IDEpKSB7XG4gICAgICAgIHBvc1ktLTtcbiAgICAgIH1cbiAgICAgIC8vIFF1aXQgaWYgdGhlcmUgYXJlIG5vIHZhbGlkIG1vdmVzXG4gICAgICBpZiAoY3VyWCA9PT0gcG9zWCAmJiBjdXJZID09PSBwb3NZKSB7XG4gICAgICAgIHRoaXMuY2FudmFzW3hdLnJlY3QodGhpcy5VWF9TSVpFLCB0aGlzLlVYX1NJWkUpXG4gICAgICAgICAgLmZpbGwoeyBjb2xvcjogXCIjZGRkXCIsIG9wYWNpdHk6IFwiMC41XCIgfSk7XG4gICAgICAgIHRoaXMuY2FudmFzW3hdLnJlY3QodGhpcy5VWF9TSVpFLCB0aGlzLlVYX1NJWkUgKiAwLjIpXG4gICAgICAgICAgLmZpbGwoeyBjb2xvcjogXCIjZjAwXCIsIG9wYWNpdHk6IFwiMC4yXCIgfSlcbiAgICAgICAgICAuY2VudGVyKHRoaXMuVVhfU0laRSAvIDIsIHRoaXMuVVhfU0laRSAvIDIpO1xuICAgICAgICB0aGlzLmNhbnZhc1t4XS50ZXh0KFwiSW52YWxpZCBNb3ZlXCIpXG4gICAgICAgICAgLmZvbnQoeyB3ZWlnaHQ6IFwiYm9sZFwiIH0pXG4gICAgICAgICAgLmNlbnRlcih0aGlzLlVYX1NJWkUgLyAyLCB0aGlzLlVYX1NJWkUgLyAyKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICAvLyBjaGVjayBpZiBtb2RlbCBjb250cmFkaWN0cyB0aGUgY3VycmVudCBrbm93bGVkZ2UgYmFzZVxuICAgICAgaWYgKHRoaXMuZ2FtZS5nZXRUaWxlKHBvc1gsIHBvc1kpLm1lYXN1cmVkKSB7XG4gICAgICAgIHZhbGlkW3hdID0gZmFsc2U7XG4gICAgICB9XG4gICAgICAvLyBmaW5kaW5nIHRoZSBuZWlnaGJvcnMgYWZ0ZXIgdGhlIG1vdmVcbiAgICAgIGNvbnN0IGxpc3Q6IGJvb2xlYW5bXSA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdhbWUuR1JJRF9TSVpFICogdGhpcy5nYW1lLkdSSURfU0laRTsgaSsrKSB7XG4gICAgICAgIGxpc3RbaV0gPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgdGlsZSBvZiB0aGlzLmdhbWUuZ2V0TmVpZ2hib3JzKHRoaXMuZ2FtZS5nZXRUaWxlKHBvc1gsIHBvc1kpKSkge1xuICAgICAgICBsaXN0W3RoaXMuZ2FtZS5HUklEX1NJWkUgKiAodGlsZS54IC0gMSkgKyAodGlsZS55IC0gMSldID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIC8vIGNyZWF0aW5nIHRoZSBmdWxsIGdyaWRcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDQ7IGkrKykge1xuICAgICAgICBmb3IgKGxldCBqID0gMTsgaiA8PSA0OyBqKyspIHtcbiAgICAgICAgICAvLyBHZW5lcmF0ZSB0aGUgdGlsZVxuICAgICAgICAgIGNvbnN0IHIgPSB0aGlzLmNhbnZhc1t4XVxuICAgICAgICAgICAgLnJlY3QoKDAuMjQ1KSAqIHRoaXMuVVhfU0laRSwgKDAuMjQ1KSAqIHRoaXMuVVhfU0laRSApXG4gICAgICAgICAgICAuY2VudGVyKChpIC0gMC41KSAqIHRoaXMuVVhfU0laRSAvIDQsICg0LjUgLSBqKSAqIHRoaXMuVVhfU0laRSAvIDQpO1xuICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLmNhbnZhc1t4XVxuICAgICAgICAgICAgLnJlY3QoKDAuMTUpICogdGhpcy5VWF9TSVpFLCAoMC4xNSkgKiB0aGlzLlVYX1NJWkUgKVxuICAgICAgICAgICAgLmNlbnRlcigoaSAtIDAuNSkgKiB0aGlzLlVYX1NJWkUgLyA0LCAoNC41IC0gaikgKiB0aGlzLlVYX1NJWkUgLyA0KTtcbiAgICAgICAgICAvLyBDb3B5aW5nIHRoZSBtZWFzdXJlbWVudCBjb2xvcnNcbiAgICAgICAgICBpZiAodGhpcy5nYW1lLmdldFRpbGUoaSwgaikubWVhc3VyZWQpIHtcbiAgICAgICAgICAgIHIuZmlsbCh7IGNvbG9yOiB0aGlzLmdhbWUuZ2V0VGlsZShpLCBqKS5tZWFzdXJlbWVudCB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgci5maWxsKHsgY29sb3I6IFwiI2RkZGRkZFwiIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoeCA8IDQpIHtcbiAgICAgICAgICAgIC8vIERlYWxpbmcgd2l0aCBXdW1wdXMgaGVyZVxuICAgICAgICAgICAgaWYgKGxpc3RbdGhpcy5nYW1lLkdSSURfU0laRSAqIChpIC0gMSkgKyAoaiAtIDEpXSkge1xuICAgICAgICAgICAgICBzLmZpbGwoeyBjb2xvcjogXCIjZmYzODM3XCIgfSk7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmdhbWUuZ2V0VGlsZShpLCBqKS5tZWFzdXJlZCAmJiAhdGhpcy5nYW1lLmdldFRpbGUoaSwgaikuaGFzU3RlbmNoKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRbeF0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1t4XS50ZXh0KFwieFwiKS5mb250KHsgZmlsbDogXCIjZmZmZmZmXCIsIHdlaWdodDogXCJib2xkXCIsIHNpemU6IFwibGFyZ2VcIiB9KVxuICAgICAgICAgICAgICAgICAgLmNlbnRlcigoaSAtIDAuNSkgKiB0aGlzLlVYX1NJWkUgLyA0LCAoNC41IC0gaikgKiB0aGlzLlVYX1NJWkUgLyA0KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcy5maWxsKHsgY29sb3I6IFwiIzRlOWQzNlwiIH0pO1xuICAgICAgICAgICAgICBpZiAodGhpcy5nYW1lLmdldFRpbGUoaSwgaikubWVhc3VyZWQgJiYgdGhpcy5nYW1lLmdldFRpbGUoaSwgaikuaGFzU3RlbmNoKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRbeF0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc1t4XS50ZXh0KFwieFwiKS5mb250KHsgZmlsbDogXCIjZmZmZmZmXCIsIHdlaWdodDogXCJib2xkXCIsIHNpemU6IFwibGFyZ2VcIiB9KVxuICAgICAgICAgICAgICAgICAgLmNlbnRlcigoaSAtIDAuNSkgKiB0aGlzLlVYX1NJWkUgLyA0LCAoNC41IC0gaikgKiB0aGlzLlVYX1NJWkUgLyA0KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoeCA8IDgpIHtcbiAgICAgICAgICAgIC8vIERlYWxpbmcgd2l0aCBQaXRzIGhlcmVcbiAgICAgICAgICAgIGlmIChsaXN0W3RoaXMuZ2FtZS5HUklEX1NJWkUgKiAoaSAtIDEpICsgKGogLSAxKV0pIHtcbiAgICAgICAgICAgICAgcy5maWxsKHsgY29sb3I6IFwiIzY0NjQ2NFwiIH0pO1xuICAgICAgICAgICAgICBpZiAodGhpcy5nYW1lLmdldFRpbGUoaSwgaikubWVhc3VyZWQgJiYgIXRoaXMuZ2FtZS5nZXRUaWxlKGksIGopLmhhc0JyZWV6ZSkge1xuICAgICAgICAgICAgICAgIHZhbGlkW3hdID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNbeF0udGV4dChcInhcIikuZm9udCh7IGZpbGw6IFwiI2ZmZmZmZlwiLCB3ZWlnaHQ6IFwiYm9sZFwiLCBzaXplOiBcImxhcmdlXCIgfSlcbiAgICAgICAgICAgICAgICAgIC5jZW50ZXIoKGkgLSAwLjUpICogdGhpcy5VWF9TSVpFIC8gNCwgKDQuNSAtIGopICogdGhpcy5VWF9TSVpFIC8gNCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHMuZmlsbCh7IGNvbG9yOiBcIiNmZmZmZmZcIiB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUmVuZGVyIHRoZSBhZ2VudCBpdHNlbGZcbiAgICAgICAgICBpZiAocG9zWCA9PT0gaSAmJiBwb3NZID09PSBqKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc1t4XS5jaXJjbGUoMTApLmZpbGwoeyBjb2xvcjogXCIjZmYwMDY2XCIgfSlcbiAgICAgICAgICAgICAgLmNlbnRlcigoaSAtIDAuNSkgKiB0aGlzLlVYX1NJWkUgLyA0LCAoNC41IC0gaikgKiB0aGlzLlVYX1NJWkUgLyA0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIENoZWNrIGFuZCBsYWJlbCBpZiB0aGUgbW9kZWwgd2FzIHZhbGlkIG9yIG5vdFxuICAgICAgaWYgKCF2YWxpZFt4XSkge1xuICAgICAgICB0aGlzLmNhbnZhc1t4XS5yZWN0KHRoaXMuVVhfU0laRSwgdGhpcy5VWF9TSVpFICogMC4yKVxuICAgICAgICAgIC5maWxsKHsgY29sb3I6IFwiI2YwMFwiLCBvcGFjaXR5OiBcIjAuMlwiIH0pXG4gICAgICAgICAgLmNlbnRlcih0aGlzLlVYX1NJWkUgLyAyLCB0aGlzLlVYX1NJWkUgLyAyKTtcbiAgICAgICAgdGhpcy5jYW52YXNbeF0udGV4dChcIk1vZGVsIEludmFsaWQsIFNxdWFyZSBTYWZlXCIpXG4gICAgICAgICAgLmZvbnQoeyB3ZWlnaHQ6IFwiYm9sZFwiIH0pXG4gICAgICAgICAgLmNlbnRlcih0aGlzLlVYX1NJWkUgLyAyLCB0aGlzLlVYX1NJWkUgLyAyKTtcbiAgICAgIH0gZWxzZSBpZiAodmFsaWRbeF0pIHtcbiAgICAgICAgdGhpcy5jYW52YXNbeF0ucmVjdCh0aGlzLlVYX1NJWkUsIHRoaXMuVVhfU0laRSAqIDAuMilcbiAgICAgICAgICAuZmlsbCh7IGNvbG9yOiBcIiMwMGZmMDBcIiwgb3BhY2l0eTogXCIwLjJcIiB9KVxuICAgICAgICAgIC5jZW50ZXIodGhpcy5VWF9TSVpFIC8gMiwgdGhpcy5VWF9TSVpFIC8gMik7XG4gICAgICAgIHRoaXMuY2FudmFzW3hdLnRleHQoXCJNb2RlbCBpcyBDb3JyZWN0LCBNb3ZlIGlzIFJpc2t5LlwiKVxuICAgICAgICAgIC5mb250KHsgd2VpZ2h0OiBcImJvbGRcIiB9KVxuICAgICAgICAgIC5jZW50ZXIodGhpcy5VWF9TSVpFIC8gMiwgdGhpcy5VWF9TSVpFIC8gMik7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIExhYmVsIGZvciBlYWNoIG1vdmUgd2hldGhlciBpdCBzaG91bGQgYmUgcGxheWVkIG9yIG5vdFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICB0aGlzLmNhbnZhc1tpICsgOF0uY2xlYXIoKTtcbiAgICAgIGlmICh2YWxpZFtpXSB8fCB2YWxpZFtpICsgNF0pIHtcbiAgICAgICAgdGhpcy5jYW52YXNbaSArIDhdLnJlY3QodGhpcy5VWF9TSVpFICogMi4wMSwgdGhpcy5VWF9TSVpFICogMC4yMClcbiAgICAgICAgICAuZmlsbCh7IGNvbG9yOiBcIiNmZjdiNjlcIiB9KTtcbiAgICAgICAgdGhpcy5jYW52YXNbaSArIDhdLnRleHQoXCJXZSBhaW4ndCBkb2luZyB0aGlzLlwiKVxuICAgICAgICAgIC5jZW50ZXIodGhpcy5VWF9TSVpFICogMS4wNSwgdGhpcy5VWF9TSVpFICogMC4xMClcbiAgICAgICAgICAuZm9udCh7IHdlaWdodDogXCJib2xkXCIgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNhbnZhc1tpICsgOF0ucmVjdCh0aGlzLlVYX1NJWkUgKiAyLjAxLCB0aGlzLlVYX1NJWkUgKiAwLjIwKVxuICAgICAgICAgIC5maWxsKHsgY29sb3I6IFwiIzg5ZmY0ZlwiIH0pO1xuICAgICAgICB0aGlzLmNhbnZhc1tpICsgOF0udGV4dChcIlRoaXMgaXMgU2FmZSwgR29vZCB0byBHby5cIilcbiAgICAgICAgICAuY2VudGVyKHRoaXMuVVhfU0laRSAqIDEuMDUsIHRoaXMuVVhfU0laRSAqIDAuMTApXG4gICAgICAgICAgLmZvbnQoeyB3ZWlnaHQ6IFwiYm9sZFwiIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgR2FtZUdyaWQgfSBmcm9tIFwiLi9HYW1lR3JpZFwiO1xuaW1wb3J0IHsgTWVhc3VyZW1lbnQgfSBmcm9tIFwiLi9HYW1lVGlsZVwiO1xuXG5kZWNsYXJlIHZhciAkOiBhbnk7XG5cbmV4cG9ydCBjbGFzcyBVc2VyQWdlbnQge1xuXG4gIHByb3RlY3RlZCBtWDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgbVk6IG51bWJlcjtcbiAgcHJpdmF0ZSBtR2FtZTogR2FtZUdyaWQ7XG4gIHByaXZhdGUgdXg6IGFueTtcbiAgcHJpdmF0ZSBkaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHRoZSBVc2VyQWdlbnQgaW4gdGhlIGdhbWUuXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAcGFyYW0ge0dhbWVHcmlkfSBncmlkIC0gZ2FtZSB0byB3aGljaCB0aGUgYWdlbnQgYmVsb25nc1xuICAgKi9cbiAgY29uc3RydWN0b3IoZ3JpZDogR2FtZUdyaWQpIHtcbiAgICB0aGlzLm1YID0gMTtcbiAgICB0aGlzLm1ZID0gMTtcbiAgICB0aGlzLm1HYW1lID0gZ3JpZDtcbiAgICB0aGlzLm1lYXN1cmUoKTtcbiAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XG4gICAgdGhpcy51eCA9IHRoaXMubUdhbWUuY2FudmFzLmNpcmNsZSgyMCk7XG4gICAgdGhpcy51eC5maWxsKFwiI2YwNlwiKTtcbiAgICB0aGlzLnV4LmNlbnRlcih0aGlzLm1HYW1lLlVYX1NJWkUgLyAoMiAqIHRoaXMubUdhbWUuR1JJRF9TSVpFKSxcbiAgICAgIHRoaXMubUdhbWUuVVhfU0laRSAtICh0aGlzLm1HYW1lLlVYX1NJWkUgLyAoMiAqIHRoaXMubUdhbWUuR1JJRF9TSVpFKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBwb3NpdGlvbiBhbG9uZyBYLlxuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIHggY29vcmRpbmF0ZVxuICAgKi9cbiAgZ2V0IHgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubVg7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IHBvc2l0aW9uIGFsb25nIFkuXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0geSBjb29yZGluYXRlXG4gICAqL1xuICBnZXQgeSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tWTsgfVxuXG4gIC8qKlxuICAgKiBNb3ZlcyB0aGUgVXNlckFnZW50IFVwLCBEb3duLCBMZWZ0IG9yIFJpZ2h0LlxuICAgKlxuICAgKiBAcGFyYW0ge01vdmV9IG1vdmUgLSBkaXJlY3Rpb24gaW4gd2hpY2ggdG8gbW92ZSB0b1xuICAgKlxuICAgKiBAZXZlbnQgb25rZXlkb3duIC0gJ3cnLCAncycsICdhJywgJ2QnLCAndXAnLCAnZG93bicsICdsZWZ0JywgJ3JpZ2h0J1xuICAgKi9cbiAgcHVibGljIG1vdmUobW92ZTogTW92ZSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChtb3ZlID09PSBNb3ZlLlVwICYmIHRoaXMubVkgPCB0aGlzLm1HYW1lLkdSSURfU0laRSkge1xuICAgICAgdGhpcy5tWSArPSAxO1xuICAgIH0gZWxzZSBpZiAobW92ZSA9PT0gTW92ZS5Eb3duICYmIHRoaXMubVkgPiAxKSB7XG4gICAgICB0aGlzLm1ZIC09IDE7XG4gICAgfSBlbHNlIGlmIChtb3ZlID09PSBNb3ZlLlJpZ2h0ICYmIHRoaXMubVggPCB0aGlzLm1HYW1lLkdSSURfU0laRSkge1xuICAgICAgdGhpcy5tWCArPSAxO1xuICAgIH0gZWxzZSBpZiAobW92ZSA9PT0gTW92ZS5MZWZ0ICYmIHRoaXMubVggPiAxKSB7XG4gICAgICB0aGlzLm1YIC09IDE7XG4gICAgfVxuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgdGhpcy5tZWFzdXJlKCk7XG4gICAgdGhpcy5jaGVja1Jlc3VsdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluZm9ybSB0aGUgY3VycmVudCB0aWxlIHRoYXQgaXQgaGFzIGJlZW4gbWVhc3VyZWQgYW5kIHNob3VsZCByZW5kZXJcbiAgICogc2FpZCBtZWFzdXJlbWVudCBpbiBjb2xvci5cbiAgICovXG4gIHB1YmxpYyBtZWFzdXJlKCk6IE1lYXN1cmVtZW50IHtcbiAgICB0aGlzLm1HYW1lLmdldFRpbGUodGhpcy54LCB0aGlzLnkpLm1lYXN1cmVkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5tR2FtZS5nZXRUaWxlKHRoaXMueCwgdGhpcy55KS5tZWFzdXJlbWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIGFnZW50IHRvIHRoZSBzdGFydGluZyBwb3NpdGlvbiAoMSwgMSksIHJldHVybnMgdG8gZGVmYXVsdCBjb2xvci5cbiAgICovXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLm1YID0gMTtcbiAgICB0aGlzLm1ZID0gMTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHRoaXMudXguZmluaXNoKCk7XG4gICAgdGhpcy51eC5maWxsKFwiI2YwNlwiKTtcbiAgICB0aGlzLnV4LnJhZGl1cygxMCk7XG4gICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuaW1hdGVzIHRoZSBtb3ZlbWVudCBvZiB0aGUgYWdlbnQgZnJvbSB0aGUgb2xkIHBvc2l0aW9uIHRvIHRoZSBjdXJyZW50XG4gICAqIGNvb3JkaW5hdGVzIHVzaW5nIHRoZSBnaXZlbiAoeCx5KS5cbiAgICovXG4gIHB1YmxpYyByZW5kZXIoKTogdm9pZCB7XG4gICAgdGhpcy51eC5maW5pc2goKTtcbiAgICBjb25zdCBCTE9DS19TSVpFID0gdGhpcy5tR2FtZS5VWF9TSVpFIC8gdGhpcy5tR2FtZS5HUklEX1NJWkU7XG4gICAgdGhpcy51eC5hbmltYXRlKCkuY2VudGVyKEJMT0NLX1NJWkUgKiB0aGlzLm1YIC0gQkxPQ0tfU0laRSAvIDIsXG4gICAgICB0aGlzLm1HYW1lLlVYX1NJWkUgLSBCTE9DS19TSVpFICogdGhpcy5tWSArIEJMT0NLX1NJWkUgLyAyKTtcbiAgICB0aGlzLnV4LmZyb250KCk7XG4gICAgdGhpcy5jb25zb2xlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBnYW1lIGhhcyB0ZXJtaW5hdGVkLiBJZiB5ZXMsIHRoZW4gaW52YWxpZGF0ZXMgZnV0dXJlIG1vdmVzIGFuZFxuICAgKiBkaXNwbGF5cyBhIGJhbm5lciBzYXlpbmcgdGhhdCBXdW1wdXMgLyBHb2xkIC8gUGl0IHdhcyBtZXQuXG4gICAqL1xuICBwcml2YXRlIGNoZWNrUmVzdWx0KCk6IHZvaWQge1xuICAgIGNvbnN0IHRpbGUgPSB0aGlzLm1HYW1lLmdldFRpbGUodGhpcy5tWCwgdGhpcy5tWSk7XG4gICAgaWYgKHRpbGUuaGFzV3VtcHVzKSB7XG4gICAgICAvLyBBZGQgdGV4dCBhbmQgYSBSZWN0YW5nbGUgYmVoaW5kIGl0XG4gICAgICB0aGlzLnV4LmFuaW1hdGUoKS5maWxsKFwiIzAwMDAwMFwiKS5yYWRpdXMoNSk7XG4gICAgICBjb25zdCByZWN0ID0gdGhpcy5tR2FtZS5jYW52YXNcbiAgICAgICAgLnJlY3QodGhpcy5tR2FtZS5VWF9TSVpFLCB0aGlzLm1HYW1lLlVYX1NJWkUgLyB0aGlzLm1HYW1lLkdSSURfU0laRSlcbiAgICAgICAgLmNlbnRlcih0aGlzLm1HYW1lLlVYX1NJWkUgLyAyLCB0aGlzLm1HYW1lLlVYX1NJWkUgLyAyKS5maWxsKFwiIzAwMDAwMFwiKTtcbiAgICAgIGNvbnN0IHRleHQgPSB0aGlzLm1HYW1lLmNhbnZhcy50ZXh0KFwiV3VtcHVzIGF0ZSB5b3UuXCIpXG4gICAgICAgIC5mb250KHsgZmFtaWx5OiBcIkhlbHZldGljYVwiLCBzaXplOiA2MCwgZmlsbDogXCJ3aGl0ZVwiIH0pXG4gICAgICAgIC5jZW50ZXIodGhpcy5tR2FtZS5VWF9TSVpFIC8gMiwgdGhpcy5tR2FtZS5VWF9TSVpFIC8gMik7XG4gICAgICAvLyBSZXNldCB0aGUgZ2FtZSAyIHNlY29uZHMgbGF0ZXJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLm1HYW1lLnJlc2V0KCk7XG4gICAgICAgIHJlY3QucmVtb3ZlKCk7XG4gICAgICAgIHRleHQucmVtb3ZlKCk7XG4gICAgICB9LCAyNTAwKTtcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAodGlsZS5oYXNQaXQpIHtcbiAgICAgIHRoaXMudXguYW5pbWF0ZSgpLmZpbGwoXCIjMDAwMDAwXCIpLnJhZGl1cyg1KTtcbiAgICAgIC8vIEFkZCB0ZXh0IGFuZCBhIFJlY3RhbmdsZSBiZWhpbmQgaXRcbiAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLm1HYW1lLmNhbnZhc1xuICAgICAgICAucmVjdCh0aGlzLm1HYW1lLlVYX1NJWkUsIHRoaXMubUdhbWUuVVhfU0laRSAvIHRoaXMubUdhbWUuR1JJRF9TSVpFKVxuICAgICAgICAuY2VudGVyKHRoaXMubUdhbWUuVVhfU0laRSAvIDIsIHRoaXMubUdhbWUuVVhfU0laRSAvIDIpLmZpbGwoXCIjMDAwMDAwXCIpO1xuICAgICAgY29uc3QgdGV4dCA9IHRoaXMubUdhbWUuY2FudmFzLnRleHQoXCJPb3BzLCB5b3UgZmVsbCBpbiBhIFBpdC5cIilcbiAgICAgICAgLmZvbnQoeyBmYW1pbHk6IFwiSGVsdmV0aWNhXCIsIHNpemU6IDYwLCBmaWxsOiBcIndoaXRlXCIgfSlcbiAgICAgICAgLmNlbnRlcih0aGlzLm1HYW1lLlVYX1NJWkUgLyAyLCB0aGlzLm1HYW1lLlVYX1NJWkUgLyAyKTtcbiAgICAgIC8vIFJlc2V0IHRoZSBnYW1lIDIgc2Vjb25kcyBsYXRlclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMubUdhbWUucmVzZXQoKTtcbiAgICAgICAgcmVjdC5yZW1vdmUoKTtcbiAgICAgICAgdGV4dC5yZW1vdmUoKTtcbiAgICAgIH0sIDI1MDApO1xuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XG4gICAgfSBlbHNlIGlmICh0aWxlLmhhc0dvbGQpIHtcbiAgICAgIHRoaXMudXguYW5pbWF0ZSgpLmZpbGwoXCIjRkZEMDAwXCIpLnJhZGl1cygyNSk7XG4gICAgICAvLyBBZGQgdGV4dCBhbmQgYSBSZWN0YW5nbGUgYmVoaW5kIGl0XG4gICAgICBjb25zdCByZWN0ID0gdGhpcy5tR2FtZS5jYW52YXNcbiAgICAgICAgLnJlY3QodGhpcy5tR2FtZS5VWF9TSVpFLCB0aGlzLm1HYW1lLlVYX1NJWkUgLyB0aGlzLm1HYW1lLkdSSURfU0laRSlcbiAgICAgICAgLmNlbnRlcih0aGlzLm1HYW1lLlVYX1NJWkUgLyAyLCB0aGlzLm1HYW1lLlVYX1NJWkUgLyAyKS5maWxsKFwiI0ZGRDAwMFwiKTtcbiAgICAgIGNvbnN0IHRleHQgPSB0aGlzLm1HYW1lLmNhbnZhcy50ZXh0KFwiWW91IFdvbiBHT0xEIS5cIilcbiAgICAgICAgLmZvbnQoeyBmYW1pbHk6IFwiSGVsdmV0aWNhXCIsIHNpemU6IDYwLCBmaWxsOiBcImJsYWNrXCIgfSlcbiAgICAgICAgLmNlbnRlcih0aGlzLm1HYW1lLlVYX1NJWkUgLyAyLCB0aGlzLm1HYW1lLlVYX1NJWkUgLyAyKTtcbiAgICAgIC8vIFJlc2V0IHRoZSBnYW1lIDIgc2Vjb25kcyBsYXRlclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMubUdhbWUucmVzZXQoKTtcbiAgICAgICAgcmVjdC5yZW1vdmUoKTtcbiAgICAgICAgdGV4dC5yZW1vdmUoKTtcbiAgICAgIH0sIDI1MDApO1xuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByaW50cyBvdXQgdGhlIGN1cnJlbnQgbWVhc3VyZW1lbnQgdG8gdGhlIEFnZW50IENvbnNvbGUuXG4gICAqL1xuICBwcml2YXRlIGNvbnNvbGUoKTogdm9pZCB7XG4gICAgY29uc3QgcG9zID0gdGhpcy5tR2FtZS5nZXRUaWxlKHRoaXMubVgsIHRoaXMubVkpO1xuICAgIGlmIChwb3MuaGFzR29sZCkge1xuICAgICAgJChcIiNhZ2VudC1jb25zb2xlXCIpLmh0bWwoXCJUaGFuayB5b3UgZm9yIGhlbHBpbmcgbWUgZmluZCBhbGwgdGhpcyBnb2xkXCIpO1xuICAgIH0gZWxzZSBpZiAocG9zLmhhc1BpdCB8fCBwb3MuaGFzV3VtcHVzKSB7XG4gICAgICAkKFwiI2FnZW50LWNvbnNvbGVcIikuaHRtbChcIllvdSB3ZXJlIHN1cHBvc2VkIHRvIGhlbHAgbWUsIEkgYW0gZGVhZCBub3cuXCIpO1xuICAgIH0gZWxzZSBpZiAocG9zLmhhc1N0ZW5jaCAmJiBwb3MuaGFzQnJlZXplKSB7XG4gICAgICAkKFwiI2FnZW50LWNvbnNvbGVcIikuaHRtbChcIlRoZXJlIGlzIGEgPHN0cm9uZz5zdGVuY2g8L3N0cm9uZz4gYW5kIHRoZXJlIGlzIGEgPHN0cm9uZz5icmVlemU8L3N0cm9uZz4hISFcIik7XG4gICAgfSBlbHNlIGlmIChwb3MuaGFzU3RlbmNoKSB7XG4gICAgICAkKFwiI2FnZW50LWNvbnNvbGVcIikuaHRtbChcIldoYXQncyB0aGF0IDxzdHJvbmc+c3RlbmNoPzwvc3Ryb25nPiBXdW1wdXMgbXVzdCBiZSBhcm91bmQuXCIpO1xuICAgIH0gZWxzZSBpZiAocG9zLmhhc0JyZWV6ZSkge1xuICAgICAgJChcIiNhZ2VudC1jb25zb2xlXCIpLmh0bWwoXCJUaGVyZSBpcyBhIDxzdHJvbmc+YnJlZXplPC9zdHJvbmc+LiBDYXJlZnVsIG5vdCB0byBmYWxsIGluIGEgcGl0LlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJChcIiNhZ2VudC1jb25zb2xlXCIpLmh0bWwoXCJJIGZlZWwgPHN0cm9uZz5zYWZlPC9zdHJvbmc+IGhlcmUsIG5vdGhpbmcgYXJvdW5kLlwiKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGVudW0gTW92ZSB7XG4gIExlZnQsIFJpZ2h0LCBVcCwgRG93bixcbn1cbiIsImltcG9ydCB7IEdhbWVHcmlkIH0gZnJvbSBcIi4vR2FtZUdyaWRcIjtcbmltcG9ydCB7IE1vdmUgfSBmcm9tIFwiLi9Vc2VyQWdlbnRcIjtcblxuZGVjbGFyZSB2YXIgJDogYW55O1xuXG5jb25zdCBnYW1lOiBHYW1lR3JpZCA9IG5ldyBHYW1lR3JpZCgpO1xuZ2FtZS5nZXRUaWxlKDMsIDEpLmhhc1BpdCA9IHRydWU7XG5nYW1lLmdldFRpbGUoMywgMykuaGFzUGl0ID0gdHJ1ZTtcbmdhbWUuZ2V0VGlsZSg0LCA0KS5oYXNQaXQgPSB0cnVlO1xuZ2FtZS5nZXRUaWxlKDEsIDMpLmhhc1d1bXB1cyA9IHRydWU7XG5nYW1lLmdldFRpbGUoMiwgMykuaGFzR29sZCA9IHRydWU7XG5nYW1lLnNlbnNvclVwZGF0ZSgpO1xuXG4vLyBCaW5kaW5nIHRoZSBjbGljayBldmVudHNcbiQoXCIjbW9kZS1nYW1lXCIpLm9uKFwiY2xpY2tcIiwgKCkgPT4geyBnYW1lLmdvZHNpZ2h0ID0gZmFsc2U7IH0pO1xuJChcIiNtb2RlLWdvZFwiKS5vbihcImNsaWNrXCIsICgpID0+IHsgZ2FtZS5nb2RzaWdodCA9IHRydWU7IH0pO1xuXG4vLyBCaW5kaW5nIHRoZSBLZXlwcmVzcyBFdmVudFxuJChcImh0bWxcIikub24oXCJrZXlkb3duXCIsIChlOiBhbnkpID0+IHtcbiAgaWYgKGUud2hpY2ggPT09IDM3IHx8IGUud2hpY2ggPT09IFwiQVwiLmNoYXJDb2RlQXQoMCkpIHtcbiAgICBnYW1lLmFnZW50Lm1vdmUoTW92ZS5MZWZ0KTtcbiAgICBnYW1lLm1vZGVsRmlsdGVyLnJlbmRlcigpO1xuICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDM4IHx8IGUud2hpY2ggPT09IFwiV1wiLmNoYXJDb2RlQXQoMCkpIHtcbiAgICBnYW1lLmFnZW50Lm1vdmUoTW92ZS5VcCk7XG4gICAgZ2FtZS5tb2RlbEZpbHRlci5yZW5kZXIoKTtcbiAgfSBlbHNlIGlmIChlLndoaWNoID09PSAzOSB8fCBlLndoaWNoID09PSBcIkRcIi5jaGFyQ29kZUF0KDApKSB7XG4gICAgZ2FtZS5hZ2VudC5tb3ZlKE1vdmUuUmlnaHQpO1xuICAgIGdhbWUubW9kZWxGaWx0ZXIucmVuZGVyKCk7XG4gIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gNDAgfHwgZS53aGljaCA9PT0gXCJTXCIuY2hhckNvZGVBdCgwKSkge1xuICAgIGdhbWUuYWdlbnQubW92ZShNb3ZlLkRvd24pO1xuICAgIGdhbWUubW9kZWxGaWx0ZXIucmVuZGVyKCk7XG4gIH1cbn0pO1xuIl19
