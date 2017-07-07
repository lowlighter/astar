/**
 * Manahattan Heuristic.
 * @static
 * @memberof Heuristic
 * @param {Node} a - Node a
 * @param {Node} b - Node b
 * @param {Object} [options] - Options
 * @param {Number} [options.multiplier=1] - Base multiplier
 * @return {Number} Heuristic value
 */
    Heuristic.manhattan = function (a, b, options = {}) {
        let dx = Math.abs(b.x - a.x), dy = Math.abs(b.y - a.y)
        return (options.multiplier||1)*(dx + dy)
    }

/**
 * Manahattan Heuristic (Torus version).
 * @static
 * @memberof Heuristic
 * @param {Node} a - Node a
 * @param {Node} b - Node b
 * @param {Object} [options] - Options
 * @param {Number} [options.multiplier=1] - Base multiplier
 * @param {Number} [options.x=0] - Map size on X axis
 * @param {Number} [options.y=0] - Map size on Y axis
 * @return {Number} Heuristic value
 */
    Heuristic.manhattanTorus = function (a, b, options = {}) {
        let dx = Math.min(Math.abs(b.x - a.x), (b.x+(options.x||0)) - a.x, (a.x+(options.x||0)) - b.x)
        let dy = Math.min(Math.abs(b.y - a.y), (b.y+(options.y||0)) - a.y, (a.y+(options.y||0)) - b.y)
        return (options.multiplier||1)*(dx + dy)
    }
    
