Configuration.JPS = class JPS {

  /**
   * Parts of Jump Point Search algorithm.
   * These methods shouldn't be used other than by [Configuration.path]{@link Configuration#path}.
   *
   * Based on the work of Daniel Harabor and Alban Grastien.
   * See [explanations]{@link http://users.cecs.anu.edu.au/~dharabor/data/papers/harabor-grastien-aaai11.pdf}.
   * @category astar
   * @abstract
   * @private
   */
    constructor() {
      throw new Error("Cannot instantiate abstract class Configuration.JPS")
    }

  /**
   * Compute differential vertices.
   * @param {Graph} graph - Graph
   * @param {Vertex} vertex - Vertex
   * @param {Object} d - Differential coordinates
   * @return {Object} Differential vertices.
   * @private
   */
    static around(graph, vertex, parent) {
      const {x, y} = vertex.data
      const d = {x:Math.sign(x-parent.data.x), y:Math.sign(y-parent.data.y)}
      return {
        //Vertex
          vertex:graph.get(vertex),
        //Differential X
          x:d.x,
        //Differential Y
          y:d.y,

        //Left
          left:graph.get({data:{x:x-1, y}}),
        //Right
          right:graph.get({data:{x:x+1, y}}),
        //Up
          up:graph.get({data:{x, y:y-1}}),
        //Down
          down:graph.get({data:{x, y:y+1}}),


        //Next vertices
          next:{
            //Projected on X
              x:{
                //Next vertex
                  vertex:graph.get({data:{x:x+d.x, y}}),
                //Next vertex's upward vertex,
                  up:graph.get({data:{x:x+d.x, y:y-1}}),
                //Next vertex's downward vertex
                  down:graph.get({data:{x:x+d.x, y:y+1}}),
                //Previous
                  previous:{
                    //Projected on Y
                      y:{
                        //Previous vertex
                          vertex:graph.get({data:{x:x+d.x, y:y-d.y}}),
                      }
                  },
              },
            //Projected on Y
              y:{
                //Next vertex
                  vertex:graph.get({data:{x, y:y+d.y}}),
                //Next vertex's upward vertex,
                  left:graph.get({data:{x:x-1, y:y+d.y}}),
                //Next vertex's downward vertex
                  right:graph.get({data:{x:x+1, y:y+d.y}}),
                //Previous
                  previous:{
                    //Projected on X
                      x:{
                        //Previous vertex
                          vertex:graph.get({data:{x:x-d.x, y:y+d.y}}),
                      }
                  }
              },
            //Vertex
              vertex:graph.get({data:{x:x+d.x, y:y+d.y}}),
          },
        //Previous vertices
          previous:{
            //Projected on X
              x:{
                //Previous vertex
                  vertex:graph.get({data:{x:x-d.x, y}}),
                //Previous vertex's upward vertex,
                  up:graph.get({data:{x:x-d.x, y:y-1}}),
                //Previous vertex's downward vertex
                  down:graph.get({data:{x:x-d.x, y:y+1}}),
                //Next
                  next:{
                    //Projected on Y
                      y:{
                        //Next vertex
                          vertex:graph.get({data:{x:x-d.x, y:y+d.y}}),
                      }
                  },
              },
            //Projected on Y
              y:{
                //Previous vertex
                  vertex:graph.get({data:{x, y:y-d.y}}),
                //Previous vertex's upward vertex,
                  left:graph.get({data:{x:x-1, y:y-d.y}}),
                //Previous vertex's downward vertex
                  right:graph.get({data:{x:x+1, y:y-d.y}}),
                //Next
                  next:{
                    //Projected on X
                      x:{
                        //Next vertex
                          vertex:graph.get({data:{x:x+d.x, y:y-d.y}}),
                      }
                  },
              },
            //Previous vertex
              vertex:graph.get({data:{x:x-d.x, y:y-d.y}}),
          },
      }
    }

  /**
   * Compute JPS neighbors.
   * First two arguments should be bound.
   * @param {Graph} graph - Graph
   * @param {Map} scores - Scores
   * @param {Vertex} vertex - Vertex
   * @return {Vertex[]} List of JPS neighbors
   * @private
   */
    static neighborhood(graph, scores, vertex) {
      //Initialization
        const neighbors = new Set()
        const parent = scores.get(vertex).from||null

      //No pruning available (if no movements)
        if (parent === null)
          vertex.neighbors(graph).forEach(neighbor => neighbors.add(neighbor))
      //Prune according to movement
        else {
          //Differential coordinates
            const d = Configuration.JPS.around(graph, vertex, parent)
          //Diagonal pruning
            if ((d.x)&&(d.y)) {
              //Check next linear nodes
                const nx = graph.adjacent(d.vertex, d.next.x.vertex)
                const ny = graph.adjacent(d.vertex, d.next.y.vertex)
              //Add next diagonal node
                if (((nx)||(ny))&&(d.next.vertex))
                  neighbors.add(d.next.vertex)
              //Add dx node
                if (nx) {
                  if (d.next.x.vertex)
                    neighbors.add(d.next.x.vertex)
                  if ((!graph.adjacent(d.vertex, d.previous.y.vertex))&&(d.next.x.previous.y.vertex))
                    neighbors.add(d.next.x.previous.y.vertex)
                }
              //Add dy node
                if (ny) {
                  if (d.next.y.vertex)
                    neighbors.add(d.next.y.vertex)
                  if ((!graph.adjacent(d.vertex, d.previous.x.vertex))&&(d.next.y.previous.x.vertex))
                    neighbors.add(d.next.y.previous.x.vertex)
                }
            }
          //Linear pruning
            else if (graph.adjacent(d.vertex, d.next.vertex)) {
              //Next node
                if (d.next.vertex)
                  neighbors.add(d.next.vertex)
              //Horizontal pruning
                if (d.x) {
                  //Add next top node if accessible
                    if ((!graph.adjacent(d.vertex, d.up))&&(d.next.x.up))
                      neighbors.add(d.next.x.up)
                  //Add next bottom node if accessible
                    if ((!graph.adjacent(d.vertex, d.down))&&(d.next.x.down))
                      neighbors.add(d.next.x.down)
                }
              //Vertical pruning
                else if (d.y) {
                  //Add next left node if accessible
                    if ((!graph.adjacent(d.vertex, d.left))&&(d.next.y.left))
                      neighbors.add(d.next.y.left)
                  //Add next right node if accessible
                    if ((!graph.adjacent(d.vertex, d.right))&&(d.next.y.right))
                      neighbors.add(d.next.y.right)
                }
            }
        }
      return [...neighbors]
    }

  /**
   * Main function to perform Jump Point Search.
   *
   * @param {Graph} graph - Graph
   * @param {Map} scores - Scores
   * @param {Vertex} goal - Goal vertex
   * @param {Vertex} vertex - Current vertex
   * @param {Vertex} parent - Parent vertex
   * @return {?Vertex} Jump vertex
   * @private
   */
      static jump(graph, scores, goal, vertex, parent) {
        //Jumping
          while (1) {
            //Special cases (node isn't accessible or goal is reached)
              if (!graph.adjacent(parent, vertex))
                return null
              else if ((vertex.data.x === goal.data.x)&&(vertex.data.y === goal.data.y))
                return vertex
            //Differential coordinates
              const d = Configuration.JPS.around(graph, vertex, parent)
            //Diagonal forced neighbors
              if ((d.x)&&(d.y)) {
                //Check diagonals
                  if (((!graph.adjacent(d.vertex, d.previous.x.vertex))&&(graph.adjacent(d.vertex, d.previous.x.next.y.vertex)))||((!graph.adjacent(d.vertex, d.previous.y.vertex))&&(graph.adjacent(d.vertex, d.previous.y.next.x.vertex))))
                    return vertex
                //Jump
                  const jump = (a, b) => Configuration.JPS.jump(graph, scores, goal, a, b)
                  if ((jump(d.next.x.vertex, d.vertex) !== null)||(jump(d.next.y.vertex, d.vertex) !== null))
                    return vertex
              }
            //Lateral forced neighbors
              else {
                //Horizontal
                  if (d.x) {
                    if (((!graph.adjacent(d.vertex, d.up))&&(graph.adjacent(d.vertex, d.next.x.up)))||((!graph.adjacent(d.vertex, d.down))&&(graph.adjacent(d.vertex, d.next.x.down))))
                      return vertex
                  }
                //Vertical
                  else if (d.y) {
                    if (((!graph.adjacent(d.vertex, d.left))&&(graph.adjacent(d.vertex, d.next.y.left)))||((!graph.adjacent(d.vertex, d.right))&&(graph.adjacent(d.vertex, d.next.y.right))))
                      return vertex
                  }
              }

            //Next node
              parent = d.vertex
              vertex = d.next.vertex
          }
        return null
      }

      static cost(graph, current, jumped) {
        //
          let cost = 0, next = null
          const d = {x:Math.sign(jumped.data.x-current.data.x), y:Math.sign(jumped.data.y-current.data.y)}

          while (((current.data.x !== jumped.data.x)&&(current.data.y !== jumped.data.y))||(next === null)) {
            next = graph.get({data:{x:current.data.x+d.x, y:current.data.y+d.y}})
            cost += graph.cost(current, next)
            current = next
          }
          return cost
      }
}

/**
 * <pre>
 * Compute a path from start to end.
 * The heuristic used by this method must be stored in {@link Heuristic}.
 * Values in scores are the sum of total cost from start to current node and heuristic cost from current node to goal. Scores aren't available when <span class="bold">options.thread</span> is enabled.
 * </pre>
 * <div class="alert info">
 * You must use an admissible heuristic function to find the shortest past.
 * </div>
 * @param {Object} start - Start vertex
 * @param {Object} goal - Goal vertex
 * @param {Object} [options] - Options
 * @param {Number} [options.layer=0] - Layer to use (if multiple graphs)
 * @param {Function} [options.heuristic=Heuristics.manhattan] - Heuristic function to use
 * @param {Boolean} [options.fail=false] - Throw an error if no path was found
 * @return {Promise<Vertex[]>} Path
 */
  Configuration.prototype.jps = function (start, goal, {heuristic = Heuristics.manhattan, fail = false, layer = 0}) {
    //Promise
      return new Promise((solve, reject) => {
        //Discovered nodes and total scores
          const open = new BinaryHeap(node => node.estimated)
          const scores = new Map()
          const graph = this.graphs[layer]
          const heuristics = {estimate:heuristic, options:graph.meta}

        //TODO : Implement torus support
          if (graph.meta.torus)
            throw new Error("JPS does not support torus map for now")

        //Initialization
          let jumped = null
          start = graph.get(start)
          goal = graph.get(goal)
          open.add({vertex:start, estimated:0})
          scores.set(start, {score:0, from:null})

        //Sub-functions
          const neighborhood = (vertex) => Configuration.JPS.neighborhood(graph, scores, vertex)
          const jump = (vertex, parent) => Configuration.JPS.jump(graph, scores, goal, vertex, parent)
          const cost = (current, jumped) => Configuration.JPS.cost(graph, current, jumped)

        //Computing path
          if (graph.connected(start, goal)) {
            while (open.size) {
              //Current node
                const current = open.pop().vertex
                if ((current.data.x === goal.data.x)&&(current.data.y === goal.data.y))
                  break

              //Retrieve neighbors
                neighborhood(current).map(vertex => {
                  if ((jumped = jump(vertex, current)) !== null) {
                    //Compute new score
                      const score = (scores.has(current) ? scores.get(current).score : 0) + cost(current, jumped)

                    //Save new score if it's better, and add it to discovered vertices
                      if (score < (scores.has(jumped) ? scores.get(jumped).score : Infinity)) {
                        scores.set(jumped, {score, from:current, jumped:true})
                        open.update({vertex:jumped, estimated:(score + heuristics.estimate(jumped, goal, heuristics.options))})
                      }
                  }
                })

              //Set current vertex as evaluated
                open.delete(current)
            }
          }

        //Check if path found
          let path = []
          if (scores.has(goal)) {
            //Rebuild path
              let current = goal
            //Fill gap between jumps points
              while ((current.data.x != start.data.x)||(current.data.y != start.data.y)) {
                const parent = scores.get(current).from
                while ((current.data.x != parent.data.x)||(current.data.y != parent.data.y)) {
                  path.push(current)
                  current = graph.get({data:{x:current.data.x + Math.sign(parent.data.x - current.data.x), y:current.data.y + Math.sign(parent.data.y - current.data.y)}})
                }
              }
            //Reverse path
              path.push(current)
              path.reverse()
          }

        //Resolve promise
          if ((!path.length)&&(fail))
            reject("No path found")
          else
            solve({path, scores})
      })
  }
