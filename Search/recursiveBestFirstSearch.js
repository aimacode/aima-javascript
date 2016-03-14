import * as memoize from '../lib/memoize';
/**
 * FIG 3.26
 * @param problem
 * @param h
 */
export function recursiveBestFirstSearch(problem, h = null) {
    h = memoize.memoize(h || problem.h, 'h');

    function RBFS(problem, node, flimit) {

        if (problem.goalTest(node.state())) {
            return [node, 0];
        }

        var successor = node.expand(problem);

        if (successor.length == 0) {
            return [null, Infinity]
        }

        for (var s in successor) {
            s.f = Math.max(s.pathCost() + h(s), node.f);

        }

        while (true) {
            successor.sort((x, y)=>(x.f > y.f) ? 1 : ( (y.f > x.f) ? -1 : 0));
            var best = successor[0];
            if (best.f > flimit) {
                return [null, best.f];
            }
            if (successor.length > 1) {
                var alternative = successor[1].f;
            }
            else {
                var alternative = Infinity;
            }
            var results = RBFS(problem, best, Math.min(flimit, alternative))
            var result = results[0];
            best.f = results[1];

            if (result != null) {
                return (result, best.f);
            }
        }
    }
}