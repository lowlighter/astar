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
