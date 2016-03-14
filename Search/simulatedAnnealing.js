import {expSchedule} from 'expSchedule';
import {Node} from '../node';
/**
 * "[Fig. 4.5]"
 * @param problem
 * @param schedule
 * @returns {Node}
 */
export function simulatedAnnealing(problem, schedule = expSchedule()) {
    var current = new Node(problem.initial);
    for (var t = 0; t < Number.MAX_VALUE; t++) {
        var T = schedule(t);
        if (T == 0) {
            return current;
        }
        var neighbours = current.expand(problem);
        if (neighbours.length == 0) {
            return current;
        }
        var next = neighbours[Math.floor(Math.random() * neighbours.length)];
        var delta_e = problem.value(next.state()) - problem.value(current.state());
        if (delta_e > 0 || (Math.exp(delta_e / T) > Math.random())) {
            current = next;
        }
    }
}