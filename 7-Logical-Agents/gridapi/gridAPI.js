// needs to be transpiled before being able to use in browsers
// like IE (all), Opera Mini, Blackberry browser, IE Mobile, QQ, Baidu
// source: caniuse.com

/**
 * object deep copy
 * @param {Object} obj
 */
function copyObject(obj) {
    var o2 = {};
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            o2[i] = obj[i];
        }
    }

    return o2;
}

/**
 * array deep copy
 * @param {Array} arr
 */
function copyArray(arr) {
    var a2 = arr.slice(0);
    for (var i = 0, len = a2.length, x; i < len; i++) {
        x = a2[i];
        if (Array.isArray(x)) a2[i] = copyArray(x);
        else if (typeof x == "object" && x != null) a2[i] = copyObject(x);
    }
    return a2;
}

/**
 *
 * @param {Number} rows
 * @param {Number} cols
 */
function generate2DGrid(rows, cols) {
    var count = 0;
    return [...new Array(rows)].map(x => [...new Array(cols)].map(y => new Square(count++)));
}

/**
 * a single square object in the grid
 * @param {Number} number positional count of the square object on the grid
 */
function Square(number) {
    /** assumes measurement can't be fractional
     * string/number
     * A - type of thing (string name or numeric code)
     */
    var measurement = Square.MEASUREMENTS.safe,
        /**
         * assumes inferences can be fractional
         * A(string/number) + " " + B (number)
         * A - type of thing (string name or numeric code)
         * B - value to assign to that thing (defaults to 1)
         */
        inference = [Square.INFERENCES.none, 1];

    this.getMeasurement = function() {
        return measurement;
    };

    this.getInference = function() {
        return inference;
    };

    /**
     * sets new value of the measurement
     * @param {Number|String} newVal string, it must be a valid key in Square.MEASUREMENTS
     * else if number, it must be a valid value in Square.MEASUREMENTS
     * @throws Error if anything else
     */
    this.setMeasurement = function(newVal) {
        if (typeof newVal === "string" && Object.keys(Square.MEASUREMENTS).includes(newVal)) {
            measurement = Square.MEASUREMENTS[newVal];
        } else if (typeof newVal === "number" && Object.values(Square.MEASUREMENTS).includes(newVal)) {
            measurement = newVal;
        } else {
            throw new Error("Attempt to set invalid value to measurement of square number " + number);
        }
        updateDOMElement();
    };

    /**
     * sets new value of the inference
     * @param {String} newVal if string, it must be (a valid key in Square.INFERENCES) + " " + (value for that key (defaults to 1))
     *     example "wumpus 1" or "pit", or "3" (=="both 1")
     * OR it must be (a valid value in Square.INFERENCES) + " " + (value for that key (defaults to 1))
     *     example "1 1" (corresponds to "wumpus 1")
     * @throws Error if anything else
     */
    this.setInference = function(newVal, certainty) {
        if (typeof newVal !== "string") {
            throw new Error("New value must be string/number");
        }
        if (typeof certainty != "undefined" && typeof certainty != "number") {
            throw new Error("Optional argument certainty must be a number");
        }

        if (Object.keys(Square.INFERENCES).includes(newVal)) {
            inference = [Square.INFERENCES[newVal], typeof certainty == "undefined" ? "1" : certainty];
        } else if (Object.values(Square.INFERENCES).includes(+type)) {
            inference = [newVal, certainty];
        } else {
            throw new Error(`Attempt to set invalid value to inference of square number: ${newVal} and ${certainty}`);
        }
        updateDOMElement();
    };

    var $td = document.createElement("td");
    $td.classList.add("grid-square");

    function updateDOMElement() {
        $td.innerText = inference;
        $td.style.border = `1px solid ${Square.getColorBasedOnMeasurement(measurement)}`;
    }

    this.getDOMElement = function() {
        updateDOMElement();
        return $td;
    };

    this.getNumber = function() {
        return number;
    };
}

/**
 * a single square object in the grid
 * @param {Number} number positional count of the square object on the grid
 * @returns {Square}
 */
function getSquare(number) {
    return new Square(number);
}
// assign integer codes to each type
// of thing
// for easy extensibility later
Square.MEASUREMENTS = {
    stinch: 1,
    breeze: 2,
    both: 3,
    safe: 4
};

Square.INFERENCES = {
    wumpus: 1,
    pit: 2,
    both: 3,
    none: 4
};

Square.getColorBasedOnMeasurement = function(measurement) {
    var colorValue = 40 * measurement; // random number for testing
    return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
};

/**
 * constructs a Grid object
 * @param {Number} rows
 * @param {Number} cols
 * @param {Array.<Array.<Number>} arr grid of rowsXcols if passed will be used
 */
function Grid(rows, cols, arr) {
    this.grid = arr ? arr : generate2DGrid(rows, cols);

    this.getDOMElement = function() {
        var $table = document.createElement("table");

        for (let i = 0; i < rows; i++) {
            let $row = document.createElement("tr");
            for (let j = 0; j < cols; j++) {
                $row.appendChild(this.grid[i][j].getDOMElement());
            }
            $row.classList.add("grid-row");
            $table.appendChild($row);
        }
        $table.classList.add("grid-container");

        return $table;
    };

    /**
     * @param {Element} $container the container in which grid must be put.
     * @param {Boolean} appendToContainer when true, $container is not reset to empty before being used, and new grid is simply
     * appended to $container.
     */
    this.renderGridDOM = function($container, appendToContainer) {
        if (!appendToContainer) {
            while ($container.firstChild) $container.removeChild($container.firstChild);
        }
        $container.appendChild(this.getDOMElement());
    };
}

/**
 * constructs and returns a custom Grid object
 * that is more accessible
 * @param {Number} rows
 * @param {Number} cols
 */
function getGrid(rows, cols) {
    var obj = generate2DGrid(rows, cols);
    Grid.call(obj, rows, cols, obj);
    return obj;
}

window.Square = Square;
window.getSquare = getSquare;
window.Grid = Grid;
window.getGrid = getGrid;
