/**
 * Data structure which can belong to multiple Graph instances.
 * @category structures
 * @see Graph
 */
  class Vertex {
    /**
     * Vertex.
     * @constructor
     * @param {Number|String} [id] - Vertex id (can be inherited from data)
     * @param {Object} [data] - Data object
     */
      constructor(id, data = {}) {
        //Inherit id from data
          if (typeof arguments[0] === "object") {
            data = arguments[0]
            id = data.id
          }

        /**
         * Vertex id.
         * @readonly
         * @type {Number|String}
         */
          this.id = id

        /**
         * Map of graphs where this vertex belongs, mapped to its respective neighbors and costs.
         * @readonly
         * @type {Map<Graph, Map<Number|String, Number>>}
         */
          this.graphs = new Map()

        /**
         * Vertex data.
         * @type {Object}
         */
          this.data = data

      }

    /**
     * Retrieve neighbors of current vertex from a specific graph.
     * @return {Vertex[]} Neighbors
     */
      neighbors(graph) {
        //If vertex is not a member of graph, return
          if (!this.graphs.has(graph))
            return []
        //Get neighbors
          const ids = [...this.graphs.get(graph).keys()]
          const neighbors = ids.map(id => graph.get(id))
        return neighbors
      }

  }
