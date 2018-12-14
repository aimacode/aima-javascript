window.onload = function() {
    var grid = getGrid(3, 4),
        $container = document.querySelector("div.container");
    grid.renderGridDOM($container);
    // you can pass integer codes or names of the things
    // for setinference there's an optional argument of the certainty (defaults to 1)
    grid[1][1].setMeasurement(2);
    grid[1][0].setInference("wumpus", 1);
};
