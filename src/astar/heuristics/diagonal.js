/**
 * Diagonal Heuristic.
 * @static
 * @memberof Heuristic
 * @param {Vertex} a - Vertex a
 * @param {Vertex} b - Vertex b
 * @param {Object} [options] - Options
 * @param {Number} [options.multiplier=1] - Base multiplier
 * @param {Number} [options.diagonalMultiplier=1.4]  - Diagonal multiplier
 * @param {Boolean} [options.torus=false] - Use Torus version
 * @param {Number} [options.X=0] - Map size on X axis
 * @param {Number} [options.Y=0] - Map size on Y axis
 * @return {Number} Heuristic value
 */
  Heuristics.diagonal = function (a, b, {multiplier = 1, diagonalMultiplier = 1.4, torus = false, X = 0, Y = 0} = {}) {
    //Classic version
      let dx = Math.abs(b.data.x - a.data.x)
      let dy = Math.abs(b.data.y - a.data.y)

    //Torus version
      if (torus) {
        dx = Math.min(dx, b.data.x - a.data.x + X, a.data.x - b.data.x + X)
        dy = Math.min(dy, b.data.y - a.data.y + Y, a.data.y - b.data.y + Y)
      }

    return multiplier*(dx + dy) + (diagonalMultiplier - 2*multiplier) * Math.min(dx, dy)
  }