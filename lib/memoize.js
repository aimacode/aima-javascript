/**
 *
 * @param fn
 * @param slot
 * @returns {Function}
 */
export function memoize(fn, slot = null) {
    if (slot != null) {
        return function (obj, ...arg) {
            if (!obj.hasOwnProperty(slot)) {
                var new_val = fn(obj, ...arg);
                obj[slot] = new_val;
                return new_val;
                
            }
            return obj[slot];
        }
    }
    else {
        var cache = {};
        return function (...arg) {
            if (!cache.hasOwnProperty(arg)) {
                var new_val = fn(...arg)
                cache[arg] = new_val;
                return new_val;
            }
            return cache[arg];
        }
    }
}