import * as memoize from '../lib/memoize';
import * as BFGS from 'bestFirstGraphSearch';
/**
 * A* search is best-first graph search with f(n) = g(n)+h(n).
 * You need to specify the h function when you call astar_search, or
 * else in your Problem subclass.
 * @param problem
 * @param h
 * @returns {*}
 */
export function aStarSearch(problem, h = null) {
    h = memoize.memoize(h || problem.h, 'h');
    return BFGS.bestFirstGraphSearch(problem, n => n.pathCost() + h(n));
}