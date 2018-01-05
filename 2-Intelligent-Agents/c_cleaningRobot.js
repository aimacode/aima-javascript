/* The general structure is to put the AI code in xyz.js and the visualization
   code in c_xyz.js. Create a diagram object that contains all the information
   needed to draw the diagram, including references to the environment&agents.
   Then use a draw function to update the visualization to match the data in
   the environment & agent objects. Use a separate function if possible for 
   controlling the visualization (whether through interaction or animation). 
   Chapter 2 has minimal AI and is mostly animations. */

const SIZE = 100;
const colors = {
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
        .attr('class', 'robot')
        .style('transform', `translate(${diagram.xPosition(world.location)}px,100px)`);
    diagram.robot.append('rect')
        .attr('width', SIZE)
        .attr('height', SIZE)
        .attr('fill', 'hsl(120,25%,50%)');
    diagram.perceptText = diagram.robot.append('text')
        .attr('x', SIZE/2)
        .attr('y', -25)
        .attr('text-anchor', 'middle');
    diagram.actionText = diagram.robot.append('text')
        .attr('x', SIZE/2)
        .attr('y', -10)
        .attr('text-anchor', 'middle');

    diagram.floors = [];
    for (let floorNumber = 0; floorNumber < world.floors.length; floorNumber++) {
        diagram.floors[floorNumber] =
            diagram.root.append('rect')
            .attr('class', 'clean floor') // for css
            .attr('x', diagram.xPosition(floorNumber))
            .attr('y', 225)
            .attr('width', SIZE)
            .attr('height', SIZE/4)
            .attr('stroke', 'black')
            .on('click', function() {
                world.markFloorDirty(floorNumber);
                diagram.floors[floorNumber].attr('class', 'dirty floor');
            });
    }
    return diagram;
}


/* Rendering functions read from the state of the world (diagram.world) 
   and write to the state of the diagram (diagram.*). For most diagrams
   we only need one render function. For the vacuum cleaner example, to
   support the different styles (reader driven, agent driven) and the
   animation (agent perceives world, then pauses, then agent acts) I've
   broken up the render function into several. */

function renderWorld(diagram) {
    for (let floorNumber = 0; floorNumber < diagram.world.floors.length; floorNumber++) {
        diagram.floors[floorNumber].attr('class', diagram.world.floors[floorNumber].dirty? 'dirty floor' : 'clean floor');

    }
    diagram.robot.style('transform', `translate(${diagram.xPosition(diagram.world.location)}px,100px)`);
}

function renderAgentPercept(diagram, dirty) {
    let perceptLabel = {false: "It's clean", true: "It's dirty"}[dirty];
    diagram.perceptText.text(perceptLabel);
}

function renderAgentAction(diagram, action) {
    let actionLabel = {null: 'Waiting', 'SUCK': 'Vacuuming', 'LEFT': 'Going left', 'RIGHT': 'Going right'}[action];
    diagram.actionText.text(actionLabel);
}


/* Control the diagram by letting the AI agent choose the action. This
   controller is simple. Every STEP_TIME_MS milliseconds choose an
   action, simulate the action in the world, and draw the action on
   the page. */

const STEP_TIME_MS = 2500;
function makeAgentControlledDiagram() {
    let diagram = makeDiagram('#agent-controlled-diagram svg');

    function update() {
        let location = diagram.world.location;
        let percept = diagram.world.floors[location].dirty;
        let action = reflexVacuumAgent(diagram.world);
        diagram.world.simulate(action);
        renderWorld(diagram);
        renderAgentPercept(diagram, percept);
        renderAgentAction(diagram, action);
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
            renderWorld(diagram);
            renderAgentPercept(diagram, percept);
            renderAgentAction(diagram, nextAction);
            nextAction = null;
            updateButtons();
            animating = setTimeout(update, STEP_TIME_MS);
        } else {
            animating = false;
            renderWorld(diagram);
            renderAgentPercept(diagram, percept);
            renderAgentAction(diagram, null);
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
        let table = getRulesFromPage();
        let location = diagram.world.location;
        let percept = diagram.world.floors[location].dirty;
        let action = tableVacuumAgent(diagram.world, table);
        diagram.world.simulate(action);
        renderWorld(diagram);
        renderAgentPercept(diagram, percept);
        renderAgentAction(diagram, action);
        showPerceptAndAction(location, percept, action);
    }
    update();
    setInterval(update, STEP_TIME_MS);
    
    function getRulesFromPage() {
        let table = d3.select("#table-controlled-diagram table");
        let left_clean = table.select("[data-action=left-clean] select").node().value;
        let left_dirty = table.select("[data-action=left-dirty] select").node().value;
        let right_clean = table.select("[data-action=right-clean] select").node().value;
        let right_dirty = table.select("[data-action=right-dirty] select").node().value;
        return [[left_clean, left_dirty], [right_clean, right_dirty]];
    }

    function showPerceptAndAction(location, percept, action) {
        let locationMarker = location? 'right' : 'left';
        let perceptMarker = percept? 'dirty' : 'clean';
        
        d3.selectAll('#table-controlled-diagram th')
            .filter(function() {
                let marker = d3.select(this).attr('data-input');
                return marker == perceptMarker || marker == locationMarker;
            })
            .style('background-color', (d) => colors.perceptHighlight);
        
        d3.selectAll('#table-controlled-diagram td')
            .style('padding', '5px')
            .filter(function() {
                let marker = d3.select(this).attr('data-action');
                return marker == locationMarker + '-' + perceptMarker;
            })
            .transition().duration(0.05 * STEP_TIME_MS)
            .style('background-color', colors.actionHighlight)
            .transition().duration(0.9 * STEP_TIME_MS)
            .style('background-color', colors.actionBackground);
    }
}

/*Control the daigram based on the performance parameters set 
by the reader that the AI is supposed to follow.The animation flow 
is similar to the first agent controlled diagram but there is an 
additional table UI that lets the reader view the percepts and actions 
being followed as well as change the rules followed by the agent.
*/
function makePerformanceControlledDaigram(){
    //variable declarations for the agents
    let diagram_agent1 = makeDiagram('#performance-controlled-diagram-agent1 svg');
    let diagram_agent2 = makeDiagram('#performance-controlled-diagram-agent2 svg');
    var parameters = getRulesFromPage(); //reader defined agent parameters
    var score_agent1 = 0;
    var score_agent2 = 0;
    var performance_agent1 = [];
    var performance_agent2 = [];
    var agent2_interval;    

    //update agent1's environment
    function update_agent1() {
        let location = diagram_agent1.world.location;
        let percept = diagram_agent1.world.floors[location].dirty;
        let table = getRulesFromPage();
        let action = reflexVacuumAgent(diagram_agent1.world, table);
        setTimeout(function(){  if(action=='SUCK'){ score_agent1 = score_agent1+50; }
                                else{ score_agent1 = score_agent1-10; }
                                if(diagram_agent1.world.floors[0].dirty || diagram_agent1.world.floors[1].dirty)
                                  { score_agent1 = score_agent1-5; }
                                performance_agent1.push(score_agent1);      
                                diagram_agent1.world.simulate(action);        
                                renderWorld(diagram_agent1);
                                renderAgentPercept(diagram_agent1, percept);
                                renderAgentAction(diagram_agent1, action);},table[1]*1000);
    }
    
    //update agent2's environment
    function update_agent2() {
        let location = diagram_agent2.world.location;
        let percept = diagram_agent2.world.floors[location].dirty;
        let table = getRulesFromPage();
        let action = reflexVacuumAgent(diagram_agent2.world, table);
        setTimeout(function(){  if(action=='SUCK'){ score_agent2 = score_agent2+50; }
                                else{ score_agent2 = score_agent2-10; }
                                if(diagram_agent2.world.floors[0].dirty || diagram_agent2.world.floors[1].dirty)
                                  { score_agent2 = score_agent2-5-parseInt(parameters[0]); }
                                // extra score reduction due to agent2 working for a shorter duration
                                performance_agent2.push(score_agent2);
                                diagram_agent2.world.simulate(action);
                                renderWorld(diagram_agent2);
                                renderAgentPercept(diagram_agent2, percept);
                                renderAgentAction(diagram_agent2, action);},table[1]*1000);
        }

    //print performace scores
    //setInterval(plotPerformance(performance_agent1, performance_agent2),STEP_TIME_MS);
    setInterval(function(){ plotPerformance(performance_agent1, performance_agent2); },STEP_TIME_MS);

    //get reader defined parameters
    function getRulesFromPage() {
        let table = d3.select("#performance-controlled-diagram table");
        let dirt_freq = table.select("[data-action=dirt-freq] select").node().value;
        let speed_agent1 = table.select("[data-action=speed-agent1] select").node().value;
        let speed_agent2 = table.select("[data-action=speed-agent2] select").node().value;
        let interval_agent2 = table.select("[data-action=interval-agent2] select").node().value;
        return [dirt_freq, speed_agent1, speed_agent2, interval_agent2]
    }

    function makefloordirty() {
        floorNumber = Math.floor(Math.random() * 2);
        diagram_agent1.world.markFloorDirty(floorNumber);
        diagram_agent1.floors[floorNumber].attr('class', 'dirty floor');
        diagram_agent2.world.markFloorDirty(floorNumber);
        diagram_agent2.floors[floorNumber].attr('class', 'dirty floor');
    }
    setInterval(makefloordirty,parameters[0]*1000);
    
    //control agent1's state
    update_agent1();
    setInterval(update_agent1, STEP_TIME_MS);

    //control agent2's state
    function controlAgent2(){     
        clearInterval(agent2_interval);
        setTimeout(function(){ agent2_interval = setInterval(update_agent2,1000); },5000);
            
    }
    controlAgent2();
    setInterval(controlAgent2,5000+parameters[3]*1000) //parameter[3] defines the working interval of agent2

}   

//Plotting the performance of the agents on a dynamic line chart
var label = [0,1,2,3]; 
var index = 3;
function plotPerformance(performanceAgent1, performanceAgent2){
    var performance_agent1 = performanceAgent1;
    var performance_agent2 = performanceAgent2;

    if(performance_agent1.length != 0  && performance_agent2.length != 0){
        var ctx = document.getElementById('chartContainer').getContext('2d');
        var chart = new Chart(ctx, {
            type: 'line',
            
            data: {
                labels: label,
                datasets: [{
                    label: "Performance Agent1",
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(255, 99, 132)',
                    data: performance_agent1,
                    fill: false,
                },
                {
                    label: "Performance Agent2",
                    backgroundColor: 'rgb(0, 99, 132)',
                    borderColor: 'rgb(0, 99, 132)',
                    data: performance_agent2,
                    fill: false,
                }
                ]
            },

        
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
        index++;
        label.push(index);
    }

}

makeAgentControlledDiagram();
makeReaderControlledDiagram();
makeTableControlledDiagram();
makePerformanceControlledDaigram();
