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
         * Thanks to [NoiSek]{@link https://github.com/NoiSek} for seeing stack issues on larger grid size.
         * </pre>
         * <div class="alert info">
         * This method isn't called automatically after each update and should be called manually.
         * </div>
         * <div class="alert info">
         * This method used to be recursive, but caused Stack Memory issues on some browsers.
         * It is now iterative.
         * </div>
         */
            connect() {
                //Initialization and reset connectivity markers
                    let nodes = Array.from(this.nodes.values()), marker = 0
                    for (let i = 0; i < nodes.length; i++) { nodes[i].graph.get(this)._connectivity = undefined }

                //Mark nodes connectivity
                    for (let i = 0; i < nodes.length; i++) {
                        //Pass if already treated
                            if (nodes[i].graph.get(this)._connectivity !== undefined) { continue }

                        //Start a new subset marking
                            let stack = [nodes[i]]
                            marker++
                        //Stack processing
                            while (stack.length) {
                                //Mark current node
                                    let node = stack.shift()
                                    node.graph.get(this)._connectivity = marker
                                //Add neighbor if it hasn't be treated
                                    this.neighbors(node).map(neighbor => {
                                        if ((neighbor.graph.get(this)._connectivity === undefined)&&(stack.indexOf(neighbor) < 0)) { stack.push(neighbor) }
                                    })
                            }
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
