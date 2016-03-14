import {Node} from '../node';
/**
 * From the initial node, keep choosing the neighbor with highest value,
 * stopping when no neighbor is better. [Fig. 4.2]
 * @param problem
 * @returns {the}
 */
export function hillClimbing(problem) {
    var current = new Node(problem.initial);

    while (true) {
        var neighbours = current.expand(problem);
        if (neighbours.length == 0) {
            break;
        }
        var neighbour = argmax_random_tie(neighbours, node => problem.value(node.state));

        if (problem.value(neighbour.state()) <= problem.value(current.state())) {
            break;
        }
        current = neighbour;
    }
    return current.state();
}