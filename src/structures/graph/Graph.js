/**
 * Graph structure.
 * It allows to store generic data into vertices.
 * @category structures
 * @see Vertex
 */
  class Graph {
    /**
     * Graph.
     * @constructor
     * @param {...Vertex} [vertices] - Vertices to add
     */
      constructor(...vertices) {
        /**
         * Vertices belonging to this graph.
         * @readonly
         * @type {Map<Number|String, Vertex>}
         */
          this.vertices = new Map()

        /**
         * Metadata.
         * @type {Object}
         */
          this.meta = {}

        //Add initial vertices
          if (vertices.length)
            this.add(...vertices)
      }

    /**
     * Graph size (number of vertices).
     * @readonly
     * @type {Number}
     */
      get size() {
        return this.vertices.size
      }

    /**
     * Add vertices to Graph (ignore duplicated vertices).
     * @param {...Vertex} vertices - Vertices to add
     * @return {Graph} Instance
     */
      add(...vertices) {
        //Add vertices
          vertices.forEach(vertex => {
            //Register this graph to vertex
              if (!this.vertices.has(this))
                vertex.graphs.set(this, new Map())
            //Register vertex to this graph
              if (!this.vertices.has(vertex.id))
                this.vertices.set(vertex.id, vertex)
          })
        return this
      }

    /**
     * Retrieve a specific vertex.
     * @param {Number|String} id - Vertex id
     * @return {Vertex|null} Vertex
     */
      get(id) {
        return this.vertices.get(id) || null
      }

    /**
     * Remove vertices from Graph.
     * No errors will be thrown if a given vertex isn't part of the graph.
     * @param {...Vertex} vertices - Vertices to remove
     * @return {Graph} Instance
     */
      delete(...vertices) {
        //Delete vertices
          vertices.forEach(vertex => {
            //Delete this vertex from its neighbors
              vertex.neighbors(this).forEach(neighbor => neighbor.graphs.get(this) && neighbor.graphs.get(this).delete(vertex.id))
            //Delete this graph from vertex
              vertex.graphs.delete(this)
            //Delete vertex from this graph
              this.vertices.delete(vertex.id)
          })
        return this
      }

    /**
     * Create an edge between two vertices.
     * Set NaN on one edge cost to mark it as a directed edge.
     * Set NaN on both edge to remove edge.
     * @param {Vertex} a - Vertex A
     * @param {Vertex} b - Vertex B
     * @param {Object} [cost] - Edge costs for vertices A and B
     * @param {Number} [cost.ab=1] - Edge cost from vertex A to vertex B
     * @param {Number} [cost.ba=1] - Edge cost from vertex B to vertex A
     * @return {Graph} Instance
     * @throws {Error} Vertices must be on the same graph
     * @example <caption>Create a directed edge</caption>
     * //Graph definition
     *   const graph = new Graph()
     *   const a = graph.add(new Vertex()), b = graph.add(new Vertex())
     *   graph.edge(a, b, {ab:1, ba:NaN})
     * //Going from A to B cost 1 whereas it isn't possible to go from B to A
     *   graph.adjacent(a, b) //True
     *   graph.adjacent(b, a) //False
     * @example <caption>Create a directed edge</caption>
     * //Remove edge
     *   graph.edge(a, b, {ab:NaN, ba:NaN})
     */
      edge(a, b, {ab = 1, ba = 1} = {}) {
        //Check if vertices are on the same graph
          if ((!a.graphs.has(this))||(!b.graphs.has(this)))
            throw new Error("Vertices must be on the same graph")
        //Link or unlink vertex A to B
          if (isNaN(ab))
            a.graphs.get(this).delete(b.id)
          else
            a.graphs.get(this).set(b.id, ab)
        //Link or unlink vertex B to A
          if (isNaN(ba))
            b.graphs.get(this).delete(a.id)
          else
            b.graphs.get(this).set(a.id, ba)
        return this
      }

    /**
     * Get edge cost from vertex A to vertex B.
     * NaN will be returned if vertices aren't connected together.
     * @param {Vertex} a - Vertex A
     * @param {Vertex} b - Vertex B
     * @return {Number} Edge cost
     */
      cost(a, b) {
        return this.adjacent(a, b) ? a.graphs.get(this).get(b.id) : NaN
      }

    /**
     * Test if two vertices are adjacent.
     * Order is important for directed graphs.
     * @param {Vertex} a - Vertex A
     * @param {Vertex} b - Vertex B
     * @return {Boolean} True if A is adjacent to B
     */
      adjacent(a, b) {
        return b ? a.graphs.get(this).has(b.id) : false
      }

    /**
     * Test if two vertices are connected.
     * A BFS may be required to validate connectivity check if graph is directed, but it may cost additional time to compute.
     * @param {Vertex} a - Vertex A
     * @param {Vertex} b - Vertex B
     * @param {Boolean} bfs - Perform a BFS if connectivity check is positive
     * @return {Boolean} True if A is connected to B
     */
      connected(a, b, bfs = false) {
        const connectivity = (a.graphs.get(this).__connectivity === b.graphs.get(this).__connectivity)
        //If connectivity check, perform a BFS if needed
          if ((bfs)&&(connectivity)) {
            let found = false
            const stack = [a], visited = new WeakSet([a]), marker = a.graphs.get(this).__connectivity
            while (stack.length) {
              //Get neighbors
                const vertex = stack.shift()
                const neighbors = vertex.neighbors(this)
              //Iterate through neighbors to find second node
                for (let neighbor of neighbors) {
                  //Check if second node
                    if (neighbor.id === b.id) {
                      found = true
                      break
                    }
                  //Add neighbor if to stack if same connectivity
                    if ((!visited.has(neighbor))&&(neighbor.graphs.get(this).__connectivity === marker)) {
                      stack.push(neighbor)
                      visited.add(neighbor)
                    }
                }
            }
            return found
          }
        return connectivity
      }

    /**
     * Precompute connectivity between node.
     * @return {Graph} Instance
     * <div class="alert info">
     *   This method is not called automatically after you update the graph.
     *   You'll need to call this method manually if you want to rebuild the connectivity markers.
     * </div>
     * <div class="alert danger">
     *  If you have a directed graph, you may need to use the BFS parameter when calling {@link Graph#connected}
     * </div>
     */
      connect() {
        //Initialization and reset connectivity markers
          let marker = 0
          const vertices = [...this.vertices.values()]
          vertices.forEach(vertex => vertex.graphs.get(this).__connectivity = NaN)

        //Precompute connectivity
          for (let vertex of vertices) {
            //Pass if already treated
              if (!isNaN(vertex.graphs.get(this).__connectivity))
                continue
            //Start marking
              const stack = [vertex]
              marker++
            //Stack processing
              while (stack.length) {
                //Mark vertex
                  const cvertex = stack.shift()
                  cvertex.graphs.get(this).__connectivity = marker
                //Check its neighbors
                  cvertex.neighbors(this).forEach(neighbor => {
                    if ((isNaN(neighbor.graphs.get(this).__connectivity))&&(stack.indexOf(neighbor) < 0))
                      stack.push(neighbor)
                  })
              }
          }
        return this
      }

    /**
     * Print graph for debug.
     */
      debug() {
        console.log(`${"ID".padEnd(8)} | ${"Neighbors".padEnd(32)} | Data`)
        for (let vertex of this.vertices.values())
          console.log(`${vertex.id.toString().padEnd(8)} | ${vertex.neighbors(this).map(n => n.id).join(", ").padEnd(32)} | ${JSON.stringify(vertex.data)}`)
      }
  }
