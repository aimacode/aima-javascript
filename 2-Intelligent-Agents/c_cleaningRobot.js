const SIZE = 100;
const colors = {
    dirtyFloor: 'hsl(0,50%,50%)',
    vacuumFloor: 'hsl(60,50%,50%)',
    cleanFloor: 'hsl(240,10%,90%)'
};


// Create a diagram object that includes the world (model) and the svg
// elements (view)
function makeDiagram(id) {
    let diagram = {}, world = new World(2);
    diagram.world = world;
    diagram.xPosition = (floorNumber) => 150 + floorNumber * 600 / diagram.world.floors.length;
    
    diagram.root = d3.select('#' + id);
    diagram.robot = diagram.root.append('g')
            .attr('transform', `translate(${diagram.xPosition(world.location)},100)`);
    diagram.robot.append('rect')
        .attr('width', SIZE)
        .attr('height', SIZE)
        .attr('fill', 'hsl(120,25%,50%)');
    diagram.text = diagram.robot.append('text')
        .attr('x', SIZE/2)
        .attr('y', -10)
        .attr('text-anchor', 'middle');

    diagram.floors = [];
    for (let floorNumber = 0; floorNumber < world.floors.length; floorNumber++) {
        diagram.floors[floorNumber] =
            diagram.root.append('rect')
            .attr('class', 'floor') // for css
            .attr('x', diagram.xPosition(floorNumber))
            .attr('y', 225)
            .attr('width', SIZE)
            .attr('height', SIZE/4)
            .attr('fill', colors.cleanFloor)
            .attr('stroke', 'black')
            .on('click', function() {
                world.markFloorDirty(floorNumber);
                diagram.floors[floorNumber].transition().duration(100)
                    .attr('fill', colors.dirtyFloor);
            });
    }
    return diagram;
}


// When the world changes, animate the changes over some time period
const STEP_TIME_MS = 2500;
function animate(diagram, action) {
    switch (action) {
    case 'SUCK':
        diagram.text.text('It\'s dirty')
            .transition().delay(0.3 * STEP_TIME_MS).text('Vacuuming');
        diagram.floors[diagram.world.location]
            .transition().duration(0.1 * STEP_TIME_MS)
            .attr('fill', colors.vacuumFloor)
            .transition().delay(0.6 * STEP_TIME_MS).duration(0.3 * STEP_TIME_MS)
            .attr('fill', colors.cleanFloor);
        break;
    case 'LEFT':
        diagram.text.text('It\'s clean')
            .transition().delay(0.3 * STEP_TIME_MS).text('Going left');
        break;
    case 'RIGHT':
        diagram.text.text('It\'s clean')
            .transition().delay(0.3 * STEP_TIME_MS).text('Going right');
        break;
    }

    diagram.robot.transition().delay(0.3 * STEP_TIME_MS).duration(0.7 * STEP_TIME_MS)
        .attr('transform', `translate(${diagram.xPosition(diagram.world.location)},100)`);
}


// There's one diagram on the page, simulated at a regular interval
let diagram = makeDiagram('robotCanvas');

function update() {
    let action = diagram.world.simulate();
    animate(diagram, action);
}

update();
setInterval(update, STEP_TIME_MS);
