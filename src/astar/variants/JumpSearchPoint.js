Configuration.JPS = class JPS {
    /**
     * <pre>
     * Parts of Jump Point Search algorithm.
     * These methods shouldn't be used other than by [Configuration.path]{@link Configuration#path}.
     *
     * Based on the work of Daniel Harabor and Alban Grastien.
     * See [explanations]{@link http://users.cecs.anu.edu.au/~dharabor/data/papers/harabor-grastien-aaai11.pdf}.
     * </pre>
     * @category astar
     * @abstract
     * @private
     */
        constructor() {}

    /**
     * Tell if it's possible to access node b from node a.<br>
     * First argument should be bound.
     * @param {Graph} graph - Graph (bound)
     * @param {Node} a - Departing node
     * @param {Node} b - Destination node
     * @param {Boolean} [convert] - Convert b to a node
     * @return {Boolean} Access exists
     * @private
     */
        static access(graph, a, b, convert) {
            return (graph.adjacent(a, convert ? graph.node(b, true) : b))
        }

    /**
     * Compute JPS neighbors.<br>
     * First two arguments should be bound.
     * @param {Function} access - Access method (bound)
     * @param {Graph} graph - Graph (bound)
     * @param {Map} scores - Scores (bound)
     * @param {Node} n - Node
     * @return {Node[]} List of JPS neighbors
     * @private
     */
        static neighborhood(access, graph, scores, n) {
            //Initialization
                let neighbors = []
                let parent = scores.get(n).from||null

            //Prune according to movement
                if (parent !== null) {
                    //Differential coordinates
                        let d = {x:Math.sign(n.x-parent.x), y:Math.sign(n.y-parent.y)}
                    //Diagonal pruning
                        if ((d.x != 0)&&(d.y != 0)) {
                            //Next linear nodes
                                let n1 = access(n, {x:n.x+d.x, y:n.y}, true), n2 = access(n, {x:n.x, y:n.y+d.y}, true)
                                if (n1 || n2) {
                                    //Next node (diagonal)
                                        neighbors.push(graph.node({x:n.x+d.x, y:n.y+d.y}, true))
                                        if (n1) {
                                            neighbors.push(graph.node({x:n.x+d.x, y:n.y}, true))
                                            if (!access(n, {x:n.x, y:n.y-d.y}, true)) { neighbors.push(graph.node({x:n.x+d.x, y:n.y-d.y}, true)) }
                                        }
                                        if (n2) {
                                            neighbors.push(graph.node({x:n.x, y:n.y+d.y}, true))
                                            if (!access(n, {x:n.x-d.x, y:n.y}, true)) { neighbors.push(graph.node({x:n.x-d.x, y:n.y+d.y}, true)) }
                                        }
                                }
                    //Linear pruning
                        } else {
                            if (access(n, {x:n.x+d.x, y:n.y+d.y}, true)) {
                                //Next node
                                    neighbors.push(graph.node({x:n.x+d.x, y:n.y+d.y}, true))
                                //Horizontal pruning
                                    if (d.x != 0) {
                                        if (!access(n, {x:n.x, y:n.y-1}, true)) { neighbors.push(graph.node({x:n.x+d.x, y:n.y-1}, true)) }
                                        if (!access(n, {x:n.x, y:n.y+1}, true)) { neighbors.push(graph.node({x:n.x+d.x, y:n.y+1}, true)) }
                                    } else
                                //Vertical pruning
                                    if (d.y != 0) {
                                        if (!access(n, {x:n.x-1, y:n.y}, true)) { neighbors.push(graph.node({x:n.x-1, y:n.y+d.y}, true)) }
                                        if (!access(n, {x:n.x+1, y:n.y}, true)) { neighbors.push(graph.node({x:n.x+1, y:n.y+d.y}, true)) }
                                    }
                            }
                        }
                } else { return graph.neighbors(n) }
                return neighbors.filter(n => n)
        }

    /**
     * Main function to perform Jump Point Search.
     * @param {Function} access - Access method (bound)
     * @param {Graph} graph - Graph (bound)
     * @param {Map} scores - Scores (bound)
     * @param {Node} goal - Goal node (bound)
     * @param {Node} n - Current node
     * @param {Node} p - Parent node
     * @return {?Node} Jump node
     * @private
     */
        static jump(access, graph, scores, goal, n, p) {
            //Jumping
                while (1) {
                    //Special cases (node isn't accessible or goal is reached)
                        if (!access(p, n)) { return null } else if ((n.x === goal.x)&&(n.y === goal.y)) { return n }
                        let d = {x:Math.sign(n.x-p.x), y:Math.sign(n.y-p.y)}

                    //Diagonal forced neighbors
                        if ((d.x != 0)&&(d.y != 0)) {
                            if (((!access(n, {x:n.x-d.x, y:n.y}, true))&&(access(n, {x:n.x-d.x, y:n.y+d.y}, true)))||
                                ((!access(n, {x:n.x, y:n.y-d.y}, true))&&(access(n, {x:n.x+d.x, y:n.y-d.y}, true))))
                                { return n }
                            let jump = Configuration.JPS.jump.bind(this, access, graph, scores, goal)
                            if ((jump(graph.node({x:n.x+d.x, y:n.y}, true), n) !== null)||(jump(graph.node({x:n.x, y:n.y+d.y}, true), n) !== null)) { return n }
                        }
                    //Lateral forced neighbors
                        else {

                            //Horizontal
                                if (d.x != 0) {
                                    if (((!access(n, {x:n.x, y:n.y-1}, true))&&(access(n, {x:n.x+d.x, y:n.y-1}, true)))||
                                        ((!access(n, {x:n.x, y:n.y+1}, true))&&(access(n, {x:n.x+d.x, y:n.y+1}, true))))
                                        { return n }
                                }
                            //Vertical
                                else if (d.y != 0) {
                                    if (((!access(n, {x:n.x-1, y:n.y}, true))&&(access(n, {x:n.x-1, y:n.y+d.y}, true)))||
                                        ((!access(n, {x:n.x+1, y:n.y}, true))&&(access(n, {x:n.x+1, y:n.y+d.y}, true))))
                                        { return n }
                                }
                        }

                    //Next node
                        p = n
                        n = graph.node({x:n.x+d.x, y:n.y+d.y}, true)
                }
                return null
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
* @param {Object} start - Start node id
* @param {Object} goal - Goal node id
* @param {Object} [options] - Options
* @param {Number} [options.layer=0] - Layer to use (if multiple graphs are enabled)
* @param {String} [options.heuristic] - Name of heuristic function to use (override default heuristic)
* @param {Object} [options.heuristicOptions] - Options for heuristic options (override default heuristic options)
* @param {Function} [options.callback] - Callback (will receive path and scores as arguments)
* @param {Boolean} [options.static] - If enabled, a connectivity check will be performed before processing, thus avoiding useless computations if path doesn't exist.
*                                     [Graph.connect]{@link Graph#connect} must be called each time you're adding or removing edges in Graph.
* @return {Node[]} Path
*/
Configuration.prototype.jps = function (start, goal, options = {}) {
    //TODO========================================
        if (this.graphs[options.layer||0].TORUS) {
            console.warn("Torus map aren't yet supported by JPS")
            if (options.callback) { options.callback([], new Map()) }
            return []
        }
    //============================================

    //Discovered nodes and total scores
        let open = new BinaryHeap((node) => { return node.estimated; })
        let scores = new Map()
        let graph = this.graphs[options.layer||0]

    //Initialization
        let jumped = null
        start = graph.node(start, true)
        goal = graph.node(goal, true)
        open.add({node:start, estimated:0})
        scores.set(start, {score:0, from:null})

    //Sub-functions
        let access = Configuration.JPS.access.bind(this, graph)
        let neighborhood = Configuration.JPS.neighborhood.bind(this, access, graph, scores)
        let jump = Configuration.JPS.jump.bind(this, access, graph, scores, goal)

    //Computing path (check if nodes are connected before computing)
        if ((!options.static)||(graph.connected(start, goal))) {
            while (open.size) {
                //Current node
                    let current = open.pop().node
                    if (current === goal) { break }
                //Retrieving neighbors nodes
                    neighborhood(current).map(node => {
                        if ((jumped = jump(node, current)) !== null) {
                            //Calculating new score
                                let score = (scores.has(current) ? scores.get(current).score : 0) + graph.cost(current, jumped)

                            //Saving new score if it's a better path and adding it to discovered nodes
                                if (score < (scores.has(jumped) ? scores.get(jumped).score : Infinity)) {
                                    scores.set(jumped, {score, from:current, jumped:true})
                                    open.set({node:jumped, estimated:(score + Heuristic[options.heuristic||this.heuristic](jumped, goal, options.heuristicOptions||this.heuristicOptions))})
                                }
                        }
                    })
                //Setting current node as evaluated
                    open.delete(current)
            }
        }

    //If path was found
        let path = []
        if (scores.has(goal)) {
            //Rebuilding path
                let current = goal
            //Filling gap between jumps points
                while ((current.x != start.x)||(current.y != start.y)) {
                    let parent = scores.get(current).from
                    while ((current.x != parent.x)||(current.y != parent.y)) {
                        path.push(current)
                        current = graph.node({
                            x:current.x + Math.sign(parent.x - current.x),
                            y:current.y + Math.sign(parent.y - current.y)
                        }, true)
                    }
                }
            //Reverse
                path.push(current)
                path.reverse()
        }
    //Callback and return
        if (options.callback) { options.callback(path, scores) }
        return path
}
