/* The general structure is to put the AI code in xyz.js and the visualization
   code in c_xyz.js. Create a diagram object that contains all the information
   needed to draw the diagram, including references to the environment&agents.
   Then use a draw function to update the visualization to match the data in
   the environment & agent objects. Use a separate function if possible for 
   controlling the visualization (whether through interaction or animation). 
   Chapter 2 has minimal AI and is mostly animations. */

const SIZE = 100;
const colors = {
    dirtyFloor: 'hsl(0,50%,50%)',
    vacuumFloor: 'hsl(60,50%,50%)',
    cleanFloor: 'hsl(240,10%,90%)',
    perceptBackground: 'hsl(240,10%,85%)',
    perceptHighlight: 'hsl(60,100%,90%)',
    actionBackground: 'hsl(0,0%,100%)',
    actionHighlight: 'hsl(150,50%,80%)'
};


/* Create a diagram object that includes the world (model) and the svg
   elements (view) */
function makeDiagram(selector) {
    let diagram = {}, world = new World(2);
    diagram.world = world;
    diagram.xPosition = (floorNumber) => 150 + floorNumber * 600 / diagram.world.floors.length;

    diagram.root = d3.select(selector);
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


/* Animate the agent's percept and actions when the agent takes an action */
const STEP_TIME_MS = 2500;
function animate(diagram, dirty, action) {
    let currentStateLabel = dirty? "It's dirty" : "It's clean";
    switch (action) {
    case 'SUCK':
        diagram.text.text(currentStateLabel)
            .transition().delay(0.3 * STEP_TIME_MS).text('Vacuuming');
        diagram.floors[diagram.world.location]
            .transition().duration(0.1 * STEP_TIME_MS)
            .attr('fill', colors.vacuumFloor)
            .transition().delay(0.6 * STEP_TIME_MS).duration(0.3 * STEP_TIME_MS)
            .attr('fill', colors.cleanFloor);
        break;
    case 'LEFT':
        diagram.text.text(currentStateLabel)
            .transition().delay(0.3 * STEP_TIME_MS).text('Going left');
        break;
    case 'RIGHT':
        diagram.text.text(currentStateLabel)
            .transition().delay(0.3 * STEP_TIME_MS).text('Going right');
        break;
    default:
        diagram.text.text('Waiting');
    }

    diagram.robot.transition().delay(0.3 * STEP_TIME_MS).duration(0.7 * STEP_TIME_MS)
        .attr('transform', `translate(${diagram.xPosition(diagram.world.location)},100)`);
}



/* Control the diagram by letting the AI agent choose the action. This
   controller is simple. Every STEP_TIME_MS milliseconds choose an
   action, simulate the action in the world, and draw the action on
   the page. */
function makeAgentControlledDiagram() {
    let diagram = makeDiagram('#agent-controlled-diagram svg');

    function update() {
        let location = diagram.world.location;
        let percept = diagram.world.floors[location].dirty;
        let action = reflexVacuumAgent(diagram.world);
        diagram.world.simulate(action);
        animate(diagram, percept, action);
    }
    update();
    setInterval(update, STEP_TIME_MS);
}


/* Control the diagram by letting the reader choose the action. This
   diagram is tricky.
 
   1. If there's an animation already playing and the reader chooses
      an action then *wait* for the animation to finish playing. While
      waiting the reader may choose a different action. Replace the
      previously chosen action with the new one. (An alternative
      design would be to queue up all the actions.)
   2. If there's not an animation already playing then when the reader
      chooses an action then run it right away, without waiting.
   3. Show the connection between the percept and the resulting action
      by highlighting the percepts in the accompanying table, pausing,
      and then highlighting the action.
*/
function makeReaderControlledDiagram() {
    let diagram = makeDiagram('#reader-controlled-diagram svg');
    let nextAction = null;
    let animating = false; // either false or a setTimeout intervalID

    function makeButton(action, label, x) {
        let button = d3.select('#reader-controlled-diagram .buttons')
            .append('button')
            .attr('class', 'btn btn-default')
            .style('position', 'absolute')
            .style('left', x + 'px')
            .style('width', '100px')
            .text(label)
            .on('click', () => {
                setAction(action);
                updateButtons();
            });
        button.action = action;
        return button;
    }

    let buttons = [
        makeButton('LEFT', 'Move left', 150),
        makeButton('SUCK', 'Vacuum', 300),
        makeButton('RIGHT', 'Move right', 450),
    ];

    function updateButtons() {
        for (let button of buttons) {
            button.classed('btn-warning', button.action == nextAction);
        }
    }

    function setAction(action) {
        nextAction = action;
        if (!animating) { update(); }
    }
    
    function update() {
        let percept = diagram.world.floors[diagram.world.location].dirty;
        if (nextAction !== null) {
            diagram.world.simulate(nextAction);
            animate(diagram, percept, nextAction);
            // TODO: highlight current percept/location and then the action
            nextAction = null;
            updateButtons();
            animating = setTimeout(update, STEP_TIME_MS);
        } else {
            animating = false;
            animate(diagram, null, null);
        }
    }
}


/* Control the diagram by letting the reader choose the rules that
   the AI agent should follow. The animation flow is similar to the
   first agent controlled diagram but there is an additional table
   UI that lets the reader view the percepts and actions being followed
   as well as change the rules followed by the agent. */
function makeTableControlledDiagram() {
    let diagram = makeDiagram('#table-controlled-diagram svg');

    function update() {
        let location = diagram.world.location;
        let percept = diagram.world.floors[location].dirty;
        let action = reflexVacuumAgent(diagram.world);
        diagram.world.simulate(action);
        animate(diagram, percept, action);
        show_percept_and_action(location, percept, action);
    }
    update();
    setInterval(update, STEP_TIME_MS);
    
    // TODO: click on this table to change it
    
    function show_percept_and_action(location, percept, action) {
        let locationMarker = location? 'right' : 'left';
        let perceptMarker = percept? 'dirty' : 'clean';
        
        d3.selectAll('#table-controlled-diagram th')
            .filter(function() {
                let marker = d3.select(this).attr('data-input');
                return marker == perceptMarker || marker == locationMarker;
            })
            .transition().duration(0.1 * STEP_TIME_MS)
            .style('background-color', colors.perceptHighlight)
            .transition().delay(0.3 * STEP_TIME_MS).duration(0.3 * STEP_TIME_MS)
            .style('background-color', colors.perceptBackground);
        
        d3.selectAll('#table-controlled-diagram td')
            .filter(function() {
                let marker = d3.select(this).attr('data-action');
                return marker == locationMarker + '-' + perceptMarker;
            })
            .transition().delay(0.2 * STEP_TIME_MS)
            .style('background-color', colors.actionHighlight)
            .transition().duration(0.9 * STEP_TIME_MS)
            .style('background-color', colors.actionBackground);
    }
}


makeAgentControlledDiagram();
makeReaderControlledDiagram();
makeTableControlledDiagram();
