// In this simple problem the world includes both the environment and the robot
// but in most problems the environment and world would be separate
class World {
    constructor(numFloors) {
        this.location = 0;
        this.floors = [];
        for (let i = 0; i < numFloors; i++) {
            this.floors.push({dirty: false});
        }
    }

    markFloorDirty(floorNumber) {
        this.floors[floorNumber].dirty = true;
    }

    simulate(action) {
        switch(action) {
        case 'SUCK':
            this.floors[this.location].dirty = false;
            break;
        case 'LEFT':
            this.location = 0;
            break;
        case 'RIGHT':
            this.location = 1;
            break;
        }

        return action;
    }
}


// In this simple problem the agent can see everything about the environment
function reflexVacuumAgent(world) {
    if (world.floors[world.location].dirty) { return 'SUCK'; }
    else if (world.location == 0)           { return 'RIGHT'; }
    else if (world.location == 1)           { return 'LEFT'; }
}
