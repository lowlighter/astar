/**
 * Copyright 2017, Lecoq Simon (lowlight.fr)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function (global) {
    //Registering
        if (typeof global.Lowlight === "undefined") { global.Lowlight = {} }
        if ((typeof module === "object")&&(typeof module.exports === "object")) { module.exports = global.Lowlight }

    //Includes
        
/**
 * Graph structure.
 * It allows to store generic data which allow this library to be flexible.
 * Although only <span class="bold">Graph.fromArray</span> is currently defined to create Graphs from existing data, you're free to add new methods to
 * @category structures
 * @see Node
 * @author Lecoq Simon
 * @requires Node
 */
    class Graph {
        /**
         * Create a new graph.
         */
            constructor() {
                /**
                 * List of nodes belonging to graph.
                 * @readonly
                 * @type {Map<Object, Node>}
                 */
                    this.nodes = new Map()
            }

        /**
         * <pre>
         * Convert an object to a node id.
         * This method should be overridden when you create a graph from an existing structure.
         * </pre>
         * @param {Object} id - Id to convert
         * @return {Number} Id
         * @abstract
         * @example <caption>Overriding Graph.id method</caption>
         * // Graph definition
         * let graph = new Graph()
         * let node = graph.add(new Node(3))
         * graph.id = (coordinates) => { return coordinates.x % 2 + coordinates.y * 2 }
         * // Nodes can now be accessed with id others than numbers
         * graph.id({x:1, y:1})
         */
            id(id) {
                return id
            }

        /**
         * <pre>
         * Return node associated to id.
         * You should access nodes only through this method.
         * </pre>
         * @param {Number|Object} id - Id
         * @param {Boolean} [convert=false] - If enabled, {@link Graph.id} method will be called on first argument
         * @return {Node} Node
         */
            node(id, convert = false) {
                return convert ? this.nodes.get(this.id(arguments[0])) : this.nodes.get(id)
            }

        /**
         * <pre>
         * Return node data from associated graph.
         * Note that whilst nodes can be associated to multiples graphs, node data is specific to each graph.
         * </pre>
         * @param {Node} node - Node
         * @return {Object} Node data
         */
            data(node) {
                return node.graph.get(this)._data
            }

        /**
         * <pre>
         * Test if there is an edge between two nodes.
         * Note that order may be important for graph with directed edges.
         * </pre>
         * @param {Node} a - Node a
         * @param {Node} b - Node b
         * @return {Boolean} True if a is adjacent to b
         */
            adjacent(a, b) {
                return a.graph.get(this).has(b)
            }

        /**
         * <pre>
         * Return neighbors of a node.
         * </pre>
         * @param {Node} node - Node
         * @return {Array<Node>} Neighbors list
         */
            neighbors(node) {
                return Array.from(node.graph.get(this).keys())
            }

        /**
         * <pre>
         * Test if two nodes are connected.
         * </pre>
         * @param {Node} a - Node a
         * @param {Node} b - Node b
         * @return {Boolean} True if a is connected to b
         */
            connected(a, b) {
                return a.graph.get(this)._connectivity === b.graph.get(this)._connectivity
            }

        /**
         * <pre>
         * Compute connectivity between node.
         * </pre>
         * <div class="alert info">
         * This method isn't called automatically after each update and should be called manually.
         * </div>
         * <div class="alert warning">
         * Arguments are reserved for recursive usage and are documented only for developper's usage.
         * </div>
         * @param {Node} [node] - Node to mark (used by recursive calls)
         * @param {Number} [marker] - Mark (used by recursive calls)
         */
            connect(node, marker) {
                //Connect
                    if (arguments.length === 0) { this.nodes.forEach((node, marker) => { setTimeout(() => { this.connect(node, marker) }, 0) }) }
                //Mark if isn't marked and spread
                    else if (node.graph.get(this)._connectivity === undefined) {
                        node.graph.get(this)._connectivity = marker
                        this.neighbors(node).map(neighbor => {
                            setTimeout(() => {
                                this.connect(neighbor, marker)
                            }, 0)
                        })
                    }
            }

        /**
         * <pre>
         * Add a new node to this graph and return it. As nodes are stored in a Set structure, it isn't possible to have duplicate nodes.
         * Multiples nodes can be added by passing more than one argument. In that case, an array containing added nodes will be returned instead.
         * </pre>
         * @param {...Node} node - Node to add
         * @return {Node|Array<Node>} Added node
         */
            add(node) {
                if (arguments.length > 1) { return Array.from(arguments).map(n => this.add(n)) }
                node.graph.set(this, new Map())
                this.nodes.set(node.id, node)
                return node;
            }

        /**
         * <pre>
         * Remove a node from this graph and return it. No errors will be thrown if passed node isn't in graph.
         * Multiples nodes can be removed by passing more than one argument. In that case, an array containing removed nodes will be returned instead.
         * </pre>
         * @param {...Node} node - Node to remove
         * @return {Node|Array<Node>} Removed node
         */
            delete(node) {
                if (arguments.length > 1) { return Array.from(arguments).map(n => this.delete(n)) }
                node.graph.delete(this)
                this.nodes.delete(node.id)
                return node
            }

        /**
         * <pre>
         * Create an edge between two nodes.
         * Set null on one edge cost value to mark a directed edge.
         * Set null on both edge value to remove edge.
         * </pre>
         * @param {Node} a - Node a
         * @param {Node} b - Node b
         * @param {?Number} [a_to_b=1] - Edge cost from node a to node b
         * @param {?Number} [b_to_a=1] - Edge cost from node b to node a
         * @return {Graph} Instance
         * @throws {Error} Nodes must be on the same graph
         * @example <caption>Create a directed edge</caption>
         * // Graph definition
         * let graph = new Graph()
         * let a = graph.add(new Node()), b = graph.add(new Node())
         * graph.edge(a, b, 1, null)
         * // Going from a to b cost 1 whereas it isn't possible to go from b to a
         * graph.adjacent(a, b) //True
         * graph.adjacent(b, a) //False
         */
            edge(a, b, a_to_b = 1, b_to_a = 1) {
                //Check if nodes are on the same graph
                    if ((!a.graph.has(this))||(!b.graph.has(this))) { throw new Error("Nodes must be on the same graph") }
                //Link nodes
                    if (a_to_b === null) { a.graph.get(this).delete(b) } else { a.graph.get(this).set(b, a_to_b) }
                    if (b_to_a === null) { b.graph.get(this).delete(a) } else { b.graph.get(this).set(a, b_to_a) }
                return this
            }

        /**
         * <pre>
         * Edge cost from node a to node b.
         * null will be returned if nodes aren't connected together.
         * </pre>
         * @param {Node} a - Node a
         * @param {Node} b - Node b
         * @return {Number|null} Edge cost
         */
            cost(a, b) {
                return this.adjacent(a, b) ? a.graph.get(this).get(b) : null
            }
    }

        
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

        
/**
 * <pre>
 * Node element.
 * These structure are reusable and can belong to multiple Graph.
 * @category structures
 * @see Graph
 * @author Lecoq Simon
 * @requires Graph
 */
    class Node {
        /**
         * Create a new Node.
         * Note that you have to keep consistency between types for nodes id.
         * </pre>
         * <div class="alert info">
         * <span class="bold">id</span> and <span class="bold">graph</span> are reserved names and won't be copied when giving a <span class="bold">data</span> argument.
         * </div>
         * <div class="alert info">
         * This page refers to <span class="bold">Lowlight.Astar.Node</span>.<br>
         * Not to be confused with native class Node which may be defined in some browsers.
         * </div>
         * @constructor
         * @param {Object} id - Node id
         * @param {Object} [data] - List of properties to be added to node
         */
            constructor(id, data) {
                /**
                 * Node id.
                 * @readonly
                 * @type {Object}
                 */
                    this.id = id
                /**
                 * List of graphs where this node belongs.
                 * @readonly
                 * @type {Map<Graph, Map>}
                 */
                    this.graph = new Map()

                //Synchronize data
                    for (let i in data) {
                        if ((i === "id")||(i === "graph")) { continue }
                        this[i] = data[i]
                    }
            }
    }


        
/**
 * Structure data.
 * It serves as priority queue in this context.
 * This allow to gain time performances.
 * @category structures
 * @author Lecoq Simon
 */
    class BinaryHeap {
        /**
         * <pre>
         * Create a new binary heap.
         * Score function is mandatory if this heap will contain objects other than numbers.
         * </pre>
         * @constructor
         * @param {Function} [score] - Score function
         * @property {Map} nodes - List of nodes belonging to graph
         */
            constructor(score) {
                /**
                 * <pre>
                 * List of nodes.
                 * </pre>
                 * @readonly
                 * @type {Object[]}
                 */
                    this.nodes = []

                /**
                 * <pre>
                 * Score function.
                 * One node will be passed as argument and this function should return a number from it.
                 * </pre>
                 * @type {Function}
                 * @example  <caption>Usage</caption>
                 * heap.score = function (node) { return node.value }
                 */
                    this.score = (typeof score === "function") ? score : (a) => { return Number(a) ; }
            }

        /**
         * Heap size.
         * @type {Number}
         * @return {Number} Size
         */
            get size() { return this.nodes.length }

        /**
         * <pre>
         * Add nodes to this heap and place them accordingly to their respective scores.
         * </pre>
         * @param {...Object} node - Nodes to add
         * @return {BinaryHeap} Instance
         */
            add(node) {
                if (arguments.length > 1) { for (let i = 0; i < arguments.length; i++) { this.add(arguments[i]) } return this }
                this.nodes.push(node)
                return this.bubble(this.size - 1)
            }

        /**
         * <pre>
         * Update the value of a registered node and replace it accordingly to its new score.
         * If node isn't part of heap, it will be added.
         * </pre>
         * @param {Object} node - Node to update
         * @return {BinaryHeap} Instance
         */
            set(node) {
                let i = this.nodes.indexOf(node)
                if (~i) {
                    return (this.score(node) <= this.score(this.nodes[i])) ? this.bubble(this.nodes.indexOf(node)) : this.sink(this.nodes.indexOf(node))
                } else { return this.add(node) }
            }

        /**
         * <pre>
         * Pop heap's root and sort heap again.
         * </pre>
         * @return {Object} Previous root
         */
            pop() {
                let r = this.nodes[0], end = this.nodes.pop()
                if (this.size > 0) { this.nodes[0] = end ; this.sink(0) }
                return r
            }

        /**
         * <pre>
         * Return heap's root without popping it.
         * </pre>
         * @return {Object} Current root
         */
            top() {
                return this.nodes[0]
            }

        /**
         * <pre>
         * Remove nodes from heap.
         * Update the rest of the heap accordingly.
         * </pre>
         * @param {...Object} node - Nodes to remove (multiple arguments supported)
         * @return {BinaryHeap} Instance
         */
            delete(node) {
                //Multiple deletes
                    if (arguments.length > 1) { for (let i = 0; i < arguments.length; i++) { this.delete(arguments[i]) } return this }
                //Seeking node to remove
                    for (let i = 0; i < this.size; i++) {
                        //Searching item
                            if (this.nodes[i] != node) { continue }
                        //Removing item
                            let end = this.nodes.pop();
                            if (i == this.size - 1) { return this }
                            this.nodes[i] = end
                        //Rebuilding heap
                            return this.bubble(i).sink(i)
                    }
            }

        /**
         * Bubble up.
         * @protected
         * @param {Number} n - Start index
         * @return {BinaryHeap} Instance
         */
            bubble(n) {
                //Bubbling up
                    let node = this.nodes[n], score = this.score(node)
                    while (n > 0) {
                        //Checking if node must bubble up
                            let m = Math.floor((n + 1) / 2) - 1
                            let parent = this.nodes[m]
                            if (score >= this.score(parent)) { break }
                        //Swap parent with current node
                            this.nodes[m] = node
                            this.nodes[n] = parent
                            n = m
                    }
                //Return
                    return this
            }

        /**
         * Sink down.
         * @protected
         * @param {Number} n - Start index
         * @return {BinaryHeap} Instance
         */
            sink(n) {
                //Sinking down
                    let node = this.nodes[n], score = this.score(node)
                    while (1) {
                        //Child index
                            let r = (n+1)*2, l = r-1, m = null
                        //Checking if node must sink down
                            if ((l < this.size)&&(this.score(this.nodes[l]) < score)) { m = l }
                            if ((r < this.size)&&(this.score(this.nodes[r]) < (m ? this.score(this.nodes[m]) : score))) { m = r }
                            if (m === null) { break }
                        //Swap child with current node
                            this.nodes[n] = this.nodes[m]
                            this.nodes[m] = node
                            n = m
                    }
                //Return
                    return this
            }
    }


        /**
         * Heuristics functions libraries.
         * @category astar
         * @class Heuristic
         */
            let Heuristic = {}

        
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
    

        
/**
 * Diagonal Heuristic.
 * @static
 * @memberof Heuristic
 * @param {Node} a - Node a
 * @param {Node} b - Node b
 * @param {Object} [options] - Options
 * @param {Number} [options.multiplier=1] - Base multiplier
 * @param {Number} [options.diagonalMultiplier=1.4]  - Diagonal multiplier
 * @return {Number} Heuristic value
 */
    Heuristic.diagonal = function(a, b, options = {}) {
        let dx = Math.abs(b.x - a.x), dy = Math.abs(b.y - a.y)
        return m*(dx + dy) + (dm - 2*m) * Math.min(dx, dy) ;
    }

/**
 * Diagonal Heuristic (Torus version).
 * @static
 * @memberof Heuristic
 * @param {Node} a - Node a
 * @param {Node} b - Node b
 * @param {Object} [options] - Options
 * @param {Number} [options.multiplier=1] - Base multiplier
 * @param {Number} [options.diagonalMultiplier=1.4]  - Diagonal multiplier
 * @param {Number} [options.x=0] - Map size on X axis
 * @param {Number} [options.y=0] - Map size on Y axis
 * @return {Number} Heuristic value
 */
    Heuristic.diagonalTorus = function(a, b, options = {}) {
        let dx = Math.min(Math.abs(b.x - a.x), (b.x+(options.x||0)) - a.x, (a.x+(options.x||0)) - b.x)
        let dy = Math.min(Math.abs(b.y - a.y), (b.y+(options.y||0)) - a.y, (a.y+(options.y||0)) - b.y)
        return (options.multiplier||1)*(dx + dy) + ((options.diagonalMultiplier||1.4) - 2*(options.multiplier||1)) * Math.min(dx, dy) ;
    }

        
/**
 * Euclidian Heuristic.
 * @static
 * @memberof Heuristic
 * @param {Node} a - Node a
 * @param {Node} b - Node b
 * @param {Object} [options] - Options
 * @param {Number} [options.multiplier=1] - Base multiplier
 * @return {Number} Heuristic value
 */
    Heuristic.euclidian = function (a, b, options = {}) {
        let dx = Math.abs(b.x - a.x), dy = Math.abs(b.y - a.y)
        return (options.multiplier||1) * Math.sqrt(dx*dx + dy*dy)
    }

/**
 * Euclidian Heuristic (Torus version).
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
    Heuristic.euclidianTorus = function(a, b, options = {}) {
        let dx = Math.min(Math.abs(b.x - a.x), (b.x+(options.x||0)) - a.x, (a.x+(options.x||0)) - b.x)
        let dy = Math.min(Math.abs(b.y - a.y), (b.y+(options.y||0)) - a.y, (a.y+(options.y||0)) - b.y)
        return (options.multiplier||1)*(dx + dy) + ((options.diagonalMultiplier||1.4) - 2*(options.multiplier||1)) * Math.min(dx, dy) ;
    }


        
/**
 * Woker Error
 * Thrown when web worker couldn't be initialzed
 * @ignore
 */
    class WorkerError extends Error {
        constructor(message) {
            super(message)
            this.name = "WorkerError";
        }
    }

        
class Configuration {
    /**
     * <pre>
     * Even is Graphs structures are really convenients, it can be quite costly to create them.
     * That's why this library works with reusable configurations. It will create graphs adpated to the data you provided.
     * Then, you'll just have to call the <span class="bold">path</span> method to compute a path. If you need to partially update your graphs, you can do it manually.
     * If your graphs must be totally updated, it may be better to just create a new configuration.
     * </pre>
     * <div class="alert info">
     * Due to JavaScript being monothread, each time you compute a path, you'll need to wait until completition before the rest of your code is executed.
     * When <span class="bold">options.thread</span> is enabled, [Web Workers]{@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API} will be used to prevent paths calculations from blocking your main thread.
     * It means that you'll be able to perform others tasks during calculations.
     * However, it comes with certains constraints : none of the instance's members can be edited directly.
     * </div>
     * @example <caption>Simple usage</caption>
     * //Define some variables
     * let map = [], X = 30, Y = 30
     *
     * //Define a biome function (optional)
     * let biome = (x, y) => {
     *      let e = noise(x, y) //Elevation
     *      if (e <= 0.1) { return -1.0 } //Sea
     *      if (e <= 0.2) { return  1.1 } //Beach
     *      if (e <= 0.4) { return  1.0 } //Plains
     *      if (e <= 0.5) { return  1.2 } //Forest
     *      if (e <= 0.7) { return  1.4 } //Hills
     *      if (e <= 0.9) { return  1.6 } //Mountains
     *      if (e <= 1.0) { return  2.0 } //Snow mountains
     * }
     *
     * //Create map
     * for (let x = 0; x < X; x++) { map[x] = []
     *      for (let y = 0; y < Y; y++) {
     *          map[x][y] = biome(x, y)
     *      }
     * }
     *
     * //Define configurations options
     * let options = {
     *       order:"xy",
     *       diagonals:<span class="code-diagonals">true</span>,
     *       cutting:<span class="code-cutting">false</span>,
     *       torus:<span class="code-torus">false</span>,
     *       heuristic:<span class="code-heuristic">"euclidian"</span>
     * }
     *
     * //Create a new configuration
     * //You can define multiples layers with differents parameters and/or cost functions while using the same map
     * let astar = new Lowlight.Astar.Configuration(map,
     *      $.extend({cost() { return m >= 0 ? m : null }}, options), //Only terrestrial fields accepted
     *      $.extend({cost() { return m < 0 ? -m : null }}, options), //Only aquatic fields accepted
     *      $.extend({cost() { return Math.abs(m) }}, options) //All fields types accepted
     * )
     *
     * //Compute a path
     * astar.path({x:<span class="code-start-x">0</span>, y:<span class="code-start-y">0</span>}, {x:<span class="code-goal-x">0</span>, y:<span class="code-goal-y">0</span>}, {
     *      callback(path, scores) { path.map(n => console.log(n)) },
     *      layer:<span class="code-profil">0</span> //<span class="code-profil-name">Terrestrial</span>
     * })
     * @category astar
     * @param {Object} map - Map
     * @param {Object} [options] - See below
     * @param {String} [options.heuristic="manhattan"] - Heuristic function. Accepted values are defined in {@link Heuristic} object
     * @param {Object} [options.heuristicOptions={}] - Default options for heuristic options
     * @param {Object} [options.cost=function] - Cost function. Parameters are nodes' data
     * @param {Boolean} [options.diagonals=false] - Enable or disable diagonals movement
     * @param {Boolean} [options.cutting=false] - If enabled, diagonals movements between two blocking cells are allowed
     * @param {Boolean} [options.torus] - If enabled, map will be considered as a torus (map is wrapped on itself)
     * @param {String} [options.order="yx"] - Order of array access value (in arrays structure). Accepted values are "xy" and "yx"
     * @param {String} [options.thread=false] - If enabled, methods will be computed in a separate thread. Pass file's source as parameter to enable
     */
        constructor(map, options = {}) {
            /**
             * <pre>
             * List of graphs used by this configuration.
             * </pre>
             * @readonly
             * @type {Graph[]}
             */
                this.graphs = []

            /**
             * <pre>
             * Name of heuristic to be used.
             * You can use custom heuristics by giving their names but heuristic function definition must be stored in Heuristics library.
             * </pre>
             * @type {String}
             */
                this.heuristic = options.heuristic||"manhattan"

            /**
             * <pre>
             * Default heuristics options.
             * </pre>
             * @type {Object}
             */
                this.heuristicOptions = options.heuristicOptions||{}

            //Converting array into graph
                if (Array.isArray(map)) {
                    //Default heuristic
                        this.heuristic = (options.heuristic in Heuristic) ? options.heuristic : options.diagonals ? options.torus ? "diagonalTorus" : "diagonal" : options.torus ? "manhattanTorus" : "manhattan"
                        this.heuristicOptions.x = Graph.fromArray.X(map, options.order)
                        this.heuristicOptions.y = Graph.fromArray.Y(map, options.order)
                    //Building graph
                        this.graphs = Graph.fromArray.apply(this, arguments)
                        if (!Array.isArray(this.graphs)) { this.graphs = [this.graphs] }
                }

            //=========================================================================================
            //Code executed only if threads are enabled and scope is Worker
                if ((options.thread)&&((typeof WorkerGlobalScope === "undefined")||(!(self instanceof WorkerGlobalScope)))) {
                    /**
                     * <pre>
                     * WebWorker associated to current configuration.
                     * </pre>
                     * <div class="alert info">
                     * This member is defined only when instance has been instanciated with <span class="bold">options.thread</span> set to true.<br>
                     * </div>
                     * <div class="alert warning">
                     * A <span class="bold">WorkerError</span> exception can be thrown if specified file path (i.e. lowlight.astar.js path) can't be opened.<br>
                     * Note that some browsers may not allow the usage of local WebWorkers, which will also results in a <span class="bold">WorkerError</span> exception.
                     * </div>
                     * @readonly
                     * @private
                     * @type {Worker}
                     */
                        this.worker = null
                        try { this.worker = new Worker(options.thread) } catch (e) {
                            if (window.location.protocol === "file:") { console.warn("WebWorkers in local files may not be supported by your browser.") }
                            throw new WorkerError(`${options.thread} couldn't be opened.`)
                        }
                        if ("cost" in options) { options.cost = options.cost.toString() }
                        this.worker.postMessage(["constructor", map, options])
                    //Path method redefinition
                        this.path = (start, goal, options = {}) => {
                            //Remove callback from serialization
                                this._worker_path_callback = options.callback
                                delete options.callback
                            //Computing
                                this.worker.postMessage(["path", start, goal, options])
                        }
                    //Worker messages handler
                        this.worker.onmessage = (e) => {
                            //Parsing data
                                let args = JSON.parse(e.data);
                            //Treating orders
                                switch (args[0]) {
                                    case "path" : this._worker_path_callback(args[1]); break;
                                }
                        }
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
     * @param {Function} [options.callback] - Callback
     * @return {Node[]} Path
     */
        path(start, goal, options = {}) {
            //Discovered nodes and total scores
                let open = new BinaryHeap((node) => { return node.estimated; })
                let scores = new Map()
                let graph = this.graphs[options.layer||0]

            //Initialization
                start = graph.node(start, true)
                goal = graph.node(goal, true)
                open.add({node:start, estimated:0})
                scores.set(start, {score:0, from:null})

            //Computing path (check if nodes are connected before computing)
                if (graph.connected(start, goal)) {
                    while (open.size) {
                        //Current node
                            let current = open.pop().node
                            if (current === goal) { break }

                        //Retrieving neighbors nodes
                            graph.neighbors(current).map(node => {
                                //Calculating new score
                                    let score = (scores.has(current) ? scores.get(current).score : 0) + graph.cost(current, node)

                                //Saving new score if it's a better path and adding it to discovered nodes
                                    if (score < (scores.has(node) ? scores.get(node).score : Infinity)) {
                                        scores.set(node, {score, from:current})
                                        open.set({node, estimated:(score + Heuristic[options.heuristic||this.heuristic](node, goal, options.heuristicOptions||this.heuristicOptions))})
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
                        let current = goal ; path.push(goal)
                        while ((current = scores.get(current).from) !== null) { path.push(current) }
                        path = path.reverse()
                }
            //Callback and return
                if (options.callback) { options.callback(path, scores) }
                return path
        }
}

        
//==================================================================================
//==================================================================================
//Code executed only if threads are enabled and scope is Worker
//==================================================================================
    //WebWorker
        if ((typeof WorkerGlobalScope !== "undefined")&&(self instanceof WorkerGlobalScope)) {
            //Instance
                let instance;
            //Worker controller
                onmessage = function (e) {
                    //Parsing data
                        let args = e.data
                    //Treating orders
                        switch (args[0]) {
                            //Construction
                                case "constructor":
                                    //Deserialize function
                                        if ("cost" in args[2]) {
                                            //Check if arrow function or explicit
                                                let arrow = /^\((.*?)\)\s*=>\s*{/.test(args[2].cost)
                                                let explicit = /^function /.test(args[2].cost)
                                            //Eval
                                                args[2].cost = eval(`(${(!arrow)&&(!explicit) ? "function " : ""}${args[2].cost})`)
                                        }
                                    //Creating instance
                                        instance = new Configuration(args[1], args[2])
                                        break
                            //Path method
                                case "path" : postMessage(JSON.stringify(["path", instance.path(args[1], args[2], args[3])]))
                                    break
                        }
                }
        }
//==================================================================================
//==================================================================================


        global.Lowlight.Astar = {Graph, Node, BinaryHeap, Heuristic, Configuration, WorkerError}

})(typeof window !== "undefined" ? window : this)
