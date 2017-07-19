/**
 * Utilitary method to create graph and subgraph from 2D Arrays.
 * @param {Object[]} array - Array
 * @param {...Object} [options] - Options, specifying multiple options object will create subgraph with reused nodes
 * @param {String} [options.order="yx"] - Array access order, accepted values are "xy" and "yx"
 * @param {Object} [options.cost=Graph.fromArray.cost] - Cost function
 * @param {Boolean} [options.torus=false] - If enabled, map will be treated as a torus
 * @param {Boolean} [options.diagonals=false] - If enabled, diagonals movements are allowed
 * @param {Boolean} [options.cutting=false] - If enabled, diagonals movements between two blocking cells are allowed
 * @return {Graph} Graph generated from array
 * @see {Graph}
 * @author Lecoq Simon
 * @memberof Graph
 * @static
 * @example <caption>Creating a graph from an Array structure</caption>
 * // Assume with have this map
 * let map = [
 *      [0, 1, 0],
 *      [0, 2, 1],
 *      [0, 0, 0]
 * ]
 *
 * // Define options
 * let options = { }
 *
 * // To access a member of our array, we use following notation : map[y][x]
 * options.order = "yx"
 *
 * // Define cost function
 * // Return null to prevent links between two squares
 * options.cost = (a, b) => { return b >= 0 ? b : null }
 *
 * // Tell if map is torus (map wrapper on itself)
 * options.torus = true
 *
 * // Tell if squares must be linked diagonally
 * options.diagonals = true
 * // Tell if squares must be linked diagonally between two blocking squares
 * options.cutting = false
 *
 * // Start by defining options
 * let graph = Graph.fromArray(map, options)
 */
    Graph.fromArray = function (array, options = {}) {
                //Initialize
                    let X = Graph.fromArray.X(array, options.order)
                    let Y = Graph.fromArray.Y(array, options.order)
                    let at = Graph.fromArray.at.bind(null, array, options.order)
                    let graphs = []
                    let nodes = null

                //Create graphs
                    for (let i = 1; i < Math.max(2, arguments.length); i++) {
                        //Create graph
                            let graph = new Graph()
                            graphs.push(graph)
                            options = arguments[i]||{}
                        //Accessor, cost and linker
                            let id = Graph.fromArray.id.bind(null, X, Y, options.torus)
                            let cost = options.cost||Graph.fromArray.cost
                            let edge = Graph.fromArray.edge.bind(null, graph, cost)

                        //Build graph
                            for (let x = 0; x < X; x++) { for (let y = 0; y < Y; y++) {
                                //New node
                                    let node = graph.add(nodes ? nodes.get(id(x, y)) : new Node(id(x, y)) )
                                    node.x = x ; node.y = y
                                    node.graph.get(graph)._data = at(x, y)
                                //Link neighbors
                                    edge(node, graph.nodes.get(id(x-1, y)))
                                    edge(node, graph.nodes.get(id(x+1, y)))
                                    edge(node, graph.nodes.get(id(x, y-1)))
                                    edge(node, graph.nodes.get(id(x, y+1)))
                            } }

                        //Link diagonals (if enabled)
                            if (options.diagonals) { for (let x = 0; x < X; x++) { for (let y = 0; y < Y; y++) {
                                //Check nodes
                                    let node = graph.nodes.get(id(x, y))
                                    let lx = graph.adjacent(node, graph.nodes.get(id(x-1, y))), rx = graph.adjacent(node, graph.nodes.get(id(x+1, y)))
                                    let oy = graph.adjacent(node, graph.nodes.get(id(x, y-1))), uy = graph.adjacent(node, graph.nodes.get(id(x, y+1)))
                                //Link neighbors
                                    if ((lx||oy)||(options.cutting)) { edge(node, graph.nodes.get(id(x-1, y-1))) }
                                    if ((lx||uy)||(options.cutting)) { edge(node, graph.nodes.get(id(x-1, y+1))) }
                                    if ((rx||oy)||(options.cutting)) { edge(node, graph.nodes.get(id(x+1, y-1))) }
                                    if ((rx||uy)||(options.cutting)) { edge(node, graph.nodes.get(id(x+1, y+1))) }
                            } } }

                        //Connectivity computing and id overriding
                            Object.defineProperty(graph, "id", {enumerable:false, configurable:false, writable:true, value(c) { return id(c.x, c.y) }})
                            graph.connect()
                            graph.X = X, graph.Y = Y, graph.DIAGONALS = options.diagonals, graph.TORUS = options.torus
                            if (!nodes) { nodes = graph.nodes }
                    }
                //Return
                    return graphs.length > 1 ? graphs : graphs[0]
            }

/**
 * Give X size of an array.
 * @param {Object[]} array - Array
 * @param {String} [order="yx"] - Array access order
 * @return {Number} X size
 */
    Graph.fromArray.X = function (array, order = "yx") {
        switch (order) {
            case "xy": return array.length
            case "yx": return array[0].length
        }
        return 0
    },

/**
 * Give Y size of an array.
 * @param {Object[]} array - Array
 * @param {String} [order="yx"] - Array access order
 * @return {Number} Y size
 */
    Graph.fromArray.Y = function (array, order = "yx") {
        switch (order) {
            case "xy": return array[0].length
            case "yx": return array.length
        }
        return 0
    },

/**
 * Array accessor. <br>
 * This method shall have its first 2 arguments binded.
 * @param {Object[]} array - Array
 * @param {String} [order="yx"] - Array access order
 * @param {Number} x - X coordinate
 * @param {Number} y - Y coordinate
 * @return {Object} Object located at specified cell
 */
    Graph.fromArray.at = function (array, order = "yx", x, y) {
        return (order === "xy") ? array[x][y] : array[y][x]
    },

/**
 * Cell coordinate to node id. <br>
 * This method shall have its first 3 arguments binded.
 * @param {Number} [X=0] - X size
 * @param {Number} [Y=0] - Y size
 * @param {Boolean} [torus=false] - If enabled, map will be considered as a torus
 * @param {Number} x - X coordinate
 * @param {Number} y - Y coordinate
 * @return {Number} Node id
 */
    Graph.fromArray.id = function (X = 0, Y = 0, torus = false, x, y) {
        return torus ? ((y+Y)%Y)*X + (x+X)%X : (x>=0)&&(x<X)&&(y>=0)&&(y<Y) ? y*X + x : null
    },

/**
 * Evaluate cost between two nodes.
 * @param {Node} a - Node a
 * @param {Node} b - Node b
 * @return {Number} Cost between a and b
 */
    Graph.fromArray.cost = function (a, b) {
        return 1
    },

/**
 * Edge creator. <br>
 * This method shall have its first 2 arguments binded.
 * @param {Graph} graph - Graph
 * @param {Function} cost - Cost function
 * @param {Node} a - Node a
 * @param {Node} b - Node b
 */
    Graph.fromArray.edge = function (graph, cost, a, b) {
        if (b) { graph.edge(a, b, cost(graph.data(a), graph.data(b)), cost(graph.data(b), graph.data(a))) }
    }
