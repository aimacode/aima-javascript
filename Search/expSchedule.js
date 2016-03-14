/**
 *One possible schedule function for simulated annealing
 * @param k
 * @param lam
 * @param limit
 * @returns {Function}
 */
export function expSchedule(k = 20, lam = 0.005, limit = 100) {
    return t => t < limit ? k * Math.exp(-lam * t) : 0;
}
