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
        if (typeof global.Lowlight === "undefined")
            global.Lowlight = {}
        if ((typeof module === "object")&&(typeof module.exports === "object"))
            module.exports = global.Lowlight

    //Includes
        
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

        
/**
 * Utilitary method to create graphs and subgraphs from 2D Arrays.
 * @param {Object[]} array - Array
 * @param {Object} [options] - Global options
 * @param {String} [options.order="yx"] - Array access order, accepted values are "xy" and "yx"
 * @param {Object} [options.cost=Graph.fromArray.cost] - Cost function which takes as arguments vertex A data (source) and vertex B data (destination)
 * @param {Boolean} [options.torus=false] - If enabled, map will be treated as a torus (wrapped map)
 * @param {Boolean} [options.diagonals=false] - If enabled, diagonals movements are allowed
 * @param {Boolean|String} [options.cutting=false] - If enabled, diagonals movements between two blocking cells are allowed. If set to "null", diagonals movements with a blocking cell is not allowed.
 * @param {Object[]} [options.layers] - An array of object which can override "cost", "diagonals" and "cutting" general options. Each object corresponds to one layer, vertices will be reused
 * @return {Graph} Graph generated from array
 * @see {Graph}
 * @static
 * @example <caption>Creating a graph from an Array structure</caption>
 * //Assume with have this map
 *   const map = [
 *     [0, 1, 0],
 *     [0, 2, 1],
 *     [0, 0, 0],
 *   ]
 *
 * //Define options
 *   const options = {
 *     //To access a member of our array, we use following notation : map[y][x]
 *       order:"yx",
 *
 *     //Define cost function (returns NaN to prevent links between two cells)
 *       cost = (a, b) => {
 *         return [0, 1].includes(b.data.v) ? 1 : NaN
 *         //Usually, vertex B (destination) is the one you'll need the most
 *         //However, you still have access to vertex A (source) if needed
 *         //In this example, only "0" and "1" are valid destinations (and costs one to move) from source vertex A
 *         //Note : by default, values of non-object array are stored in "v" member.
 *       },
 *
 *     //Tell if map is torus (map wrapped on itself)
 *       torus:true,
 *
 *     //Tell if cells must be linked diagonally
 *       diagonals:true,
 *
 *     //Tell if squares must be linked diagonally between two blocking squares
 *       cutting:null,
 *
 *     //Tell the numbers of layers to be created, and which options should be overriden
 *     //Note that nodes are shared between layers, this means that editing data on a single nodes will affect all layers
 *       layers: [
 *         {}, //Use default options for layer 0
 *         {diagonals:false}, // Override "diagonals" option value for layer 1
 *         {cost(a, b) { return b.data.water ? 1 : NaN }} // Override "cost" option for layer 2
 *       ]
 *   }
 *
 * //Create graph
 *   const graph = Graph.fromArray(map, options)
 *
 * @example <caption>Creating a graph from an Array structure</caption>
 * //Assume with have this map
 *   const map = [
 *     [{type:"ground"}, {type:"water"}],
 *     [{type:"ground"}, {type:"air"}],
 *   ]
 *
 * //Define options
 *   const options = {
 *     //Define cost function (returns NaN to prevent links between two cells)
 *       cost = (a, b) => {
 *         if ((a.data.type === "ground")&&(b.data.type === "ground"))
 *           return 1
 *         if ((a.data.type === "water")&&(b.data.type === "ground"))
 *           return 1
 *        return NaN
 *        //In this example, going from "ground" or "water" to "ground" is valid
 *        //However, all other types of links are invalid
 *       }
 *   }
 *
 * //Create graph
 *   const graph = Graph.fromArray(map, options)
 *
 */
    Graph.fromArray = function (array, data = {}) {
      //Order and layers
        const {order = "yx", layers = [{}]} = data
      //Size of map
        const X = order === "xy" ? array.length : array[0].length
        const Y = order === "xy" ? array[0].length : array.length
      //Graphs
        const graphs = []
      //Accessor (coordinates)
        const at = (x, y) => (order === "xy") ? array[x][y] : array[y][x]

      //Create graphs
        for (let layer of layers) {
          //Create graph
            const options = {...data, ...layer}
            const graph = new Graph()
            graph.meta = {...options, X, Y, torus:options.torus}
            graphs.push(graph)

          //Accessor (id), cost and linker
            const id = (x, y) => Graph.fromArray.id(x, y, graph.meta)
            const cost = options.cost||((a, b) => 1)
            const edge = (a, b) => b ? graph.edge(a, b, {ab:cost(a, b), ba:cost(b, a)}) : null

          //Build graph
            for (let x = 0; x < X; x++)
              for (let y = 0; y < Y; y++) {
                //Create vertex
                  const data = typeof at(x, y) === "object" ? at(x, y) : {v:at(x, y)}
                  const vertex = graph.add(graphs.length > 1 ? graphs[0].get(x, y) : new Vertex(id(x, y), {x, y, ...data})).get(id(x, y))
                //Link direct neighbors
                  edge(vertex, graph.get(id(x-1, y)))
                  edge(vertex, graph.get(id(x+1, y)))
                  edge(vertex, graph.get(id(x, y-1)))
                  edge(vertex, graph.get(id(x, y+1)))
              }

          //Link diagonals (if enabled)
            if (options.diagonals)
              for (let x = 0; x < X; x++)
                for (let y = 0; y < Y; y++) {
                //Check adjacent vertices
                  const vertex = graph.get(id(x, y))
                  const lx = graph.adjacent(vertex, graph.get(id(x-1, y))), rx = graph.adjacent(vertex, graph.get(id(x+1, y)))
                  const oy = graph.adjacent(vertex, graph.get(id(x, y-1))), uy = graph.adjacent(vertex, graph.get(id(x, y+1)))
                //Link strict diagonals neighbors
                  if (options.cutting === null) {
                    if (lx && oy)
                      edge(vertex, graph.get(id(x-1, y-1)))
                    if (lx && uy)
                      edge(vertex, graph.get(id(x-1, y+1)))
                    if (rx && oy)
                      edge(vertex, graph.get(id(x+1, y-1)))
                    if (rx && uy)
                      edge(vertex, graph.get(id(x+1, y+1)))
                  }
                //Link loose diagonals neighbors
                  else {
                    if ((lx||oy)||(options.cutting))
                      edge(vertex, graph.get(id(x-1, y-1)))
                    if ((lx||uy)||(options.cutting))
                      edge(vertex, graph.get(id(x-1, y+1)))
                    if ((rx||oy)||(options.cutting))
                      edge(vertex, graph.get(id(x+1, y-1)))
                    if ((rx||uy)||(options.cutting))
                      edge(vertex, graph.get(id(x+1, y+1)))
                  }
                }

          //Connectivity computing and id overriding
            graph.connect()
            graph.get = function (x, y) {
              //Handle special cases
                if (arguments.length === 1) {
                  //Id
                    if (typeof arguments[0] === "number") {
                      const id = arguments[0]
                      return this.vertices.get(id)||null
                    }
                  //Vertex
                    if (typeof arguments[0] === "object") {
                      const node = arguments[0]
                      return this.vertices.get(Graph.fromArray.id(node.data.x, node.data.y, this.meta))||null
                    }
                }
              //Coordinates
                return this.vertices.get(Graph.fromArray.id(x, y, this.meta))||null
            }
        }

    //Return
      return (arguments[1] && ("layers" in arguments[1])) ? graphs : graphs[0]
  }

  Graph.fromArray.id = function (x, y, {X, Y, torus = false}) {
    return torus ? ((y+Y)%Y)*X + (x+X)%X : (x>=0)&&(x<X)&&(y>=0)&&(y<Y) ? y*X + x : null
  }

        
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


        
/**
 * Data structure used as priority queue.
 * In JavaScript A*, it allows better performances as it acts like a sorted array for the open list.
 * @category structures
 */
  class BinaryHeap {
    /**
     * Binary heap.
     * @constructor
     * @param {Function} [score] - Score function
     */
        constructor(score = node => Number(node)) {
          /**
           * Nodes.
           * @readonly
           * @type {Object[]}
           */
            this.nodes = []

          /**
           * Score function. Used to map a node to a numerical value which will be used in comparaisons.
           * @type {Function}
           * @example <caption>Usage</caption>
           * heap.score = node => node.value
           */
            this.score = score
        }

    /**
     * Heap size.
     * @readonly
     * @type {Number}
     */
      get size() {
        return this.nodes.length
      }

    /**
     * Add nodes to heap.
     * @param {...Object} nodes - Nodes to add
     * @return {BinaryHeap} Instance
     */
      add(...nodes) {
        //Add nodes and bubble up
          nodes.forEach(node => {
            this.nodes.push(node)
            this.bubble(this.size - 1)
          })
        return this
      }

    /**
     * Remove nodes from heap.
     * @param {...Object} nodes - Nodes to remove
     * @return {BinaryHeap} Instance
     */
      delete(...nodes) {
        //Delete nodes and rebuild heap
          nodes.forEach(node => {
            //Search index of given node
              const i = this.nodes.indexOf(node)
            //Check if node is found
              if (~i) {
                //Pop last node
                  const end = this.nodes.pop()
                //Update position
                  if (i < this.size)
                    this.update(this.nodes[i] = end)
              }
          })
        return this
      }

    /**
     * Update nodes positions after external changes.
     * If a node isn't part of heap, it will be added.
     * @param {Object} nodes - Nodes to update
     * @return {BinaryHeap} Instance
     */
      update(...nodes) {
        //Update nodes
          nodes.forEach(node => {
            //Search index of given node
              const i = this.nodes.indexOf(node)
            //Check if node is found, and recompute its position
              if (~i)
                this.bubble(i).sink(i)
            //If node is not found, add node
              else
                this.add(node)
          })
        return this
      }

    /**
     * Pop root.
     * @return {Object} Previous root
     */
      pop() {
        //Get root
          const root = this.top()
        //Delete root
          this.delete(root)
        return root
      }

    /**
     * Return root.
     * @return {Object|null} Current root
     */
      top() {
        return this.nodes[0] || null
      }

    /**
     * Bubble up.
     * @protected
     * @param {Number} n - Start index
     * @return {BinaryHeap} Instance
     */
      bubble(n) {
        //Bubble up
          while (n > 0) {
            //Compute parent index and score
              const m = Math.floor((n + 1) / 2) - 1
              const score = this.score(this.nodes[n])
            //Check if node must bubble up
              //No need to bubble up
                if (score >= this.score(this.nodes[m]))
                  break
            //Swap parent with current node
              [this.nodes[n], this.nodes[m]] = [this.nodes[m], this.nodes[n]]
              n = m
          }
        return this
      }

    /**
     * Sink down.
     * @protected
     * @param {Number} n - Start index
     * @return {BinaryHeap} Instance
     */
      sink(n) {
        //Sink down
          while (1) {
            //Compute child indexes and score
              let m = null
              const r = (n+1)*2, l = r-1
              const score = this.score(this.nodes[n])
            //Check if node must sink down
              //Left child test
                if ((l < this.size)&&(this.score(this.nodes[l]) < score))
                  m = l
              //Right child test
                if ((r < this.size)&&(this.score(this.nodes[r]) < (m ? this.score(this.nodes[m]) : score)))
                  m = r
              //No need to sink down
                if (m === null)
                  break
            //Swap child with current node
              [this.nodes[n], this.nodes[m]] = [this.nodes[m], this.nodes[n]]
              n = m
          }
        return this
      }

    /**
     * Symbol iterator.
     */
      *[Symbol.iterator]() {
        return this.nodes
      }
  }


        
/**
 * Data structure used as priority queue.
 * @category structures
 */
  class ExternalPromise {

    /**
     * External Promise.
     * @constructor
     */
      constructor() {
        /**
         * Solver function.
         * @readonly
         * @type {Function}
         */
          this.solve = () => null

        /**
         * Rejecter function.
         * @readonly
         * @type {Function}
         */
          this.reject = () => null

        /**
         * Promise manager.
         * @readonly
         * @type {Function}
         */
          this.promise = new Promise((solver, rejecter) => {
            this.solve = solver
            this.reject = rejecter
          })
      }
  }

        /**
         * Heuristics functions libraries.
         * @category astar
         * @class Heuristic
         */
            const Heuristics = {}

        
/**
 * Manahattan Heuristic.
 * @static
 * @memberof Heuristic
 * @param {Vertex} a - Vertex a
 * @param {Vertex} b - Vertex b
 * @param {Object} [options] - Options
 * @param {Number} [options.multiplier=1] - Base multiplier
 * @param {Boolean} [options.torus=false] - Use Torus version
 * @param {Number} [options.X=0] - Map size on X axis
 * @param {Number} [options.Y=0] - Map size on Y axis
 * @return {Number} Heuristic value
 */
  Heuristics.manhattan = function (a, b, {multiplier = 1, torus = false, X = 0, Y = 0} = {}) {
    //Classic version
      let dx = Math.abs(b.data.x - a.data.x)
      let dy = Math.abs(b.data.y - a.data.y)

    //Torus version
      if (torus) {
        dx = Math.min(dx, b.data.x - a.data.x + X, a.data.x - b.data.x + X)
        dy = Math.min(dy, b.data.y - a.data.y + Y, a.data.y - b.data.y + Y)
      }

    return multiplier*(dx + dy)
  }
        
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
        
/**
 * Euclidian Heuristic.
 * @static
 * @memberof Heuristic
 * @param {Vertex} a - Vertex a
 * @param {Vertex} b - Vertex b
 * @param {Object} [options] - Options
 * @param {Number} [options.multiplier=1] - Base multiplier
 * @param {Boolean} [options.torus=false] - Use Torus version
 * @param {Number} [options.X=0] - Map size on X axis
 * @param {Number} [options.Y=0] - Map size on Y axis
 * @return {Number} Heuristic value
 */
  Heuristics.euclidian = function (a, b, {multiplier = 1, torus = false, X = 0, Y = 0} = {}) {
    //Classic version
      let dx = Math.abs(b.data.x - a.data.x)
      let dy = Math.abs(b.data.y - a.data.y)

    //Torus version
      if (torus) {
        dx = Math.min(dx, b.data.x - a.data.x + X, a.data.x - b.data.x + X)
        dy = Math.min(dy, b.data.y - a.data.y + Y, a.data.y - b.data.y + Y)
      }

    return multiplier * Math.sqrt(dx*dx + dy*dy)
  }

        
class Configuration {
  /**
   * This library works with reusable configurations.
   * Once data is initialized, just call the <span class="bold">path</span> method to compute a path.
   * If you need to partially update your graphs, it is possible to do it manually.
   * If your graphs need to be totally updated, it may be better to just create a new configuration.
   * <div class="alert info">
   * Use <span class="bold">options.worker</span> to relieve main thread from heavy computations and be able to perform others tasks during calculations.
   * This options uses [Web Workers]{@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API}.
   * Note however, that it comes with several constraints (such as the configuration cannot be edited directly, etc.).
   * In most cases, the default usage (i.e. not using <span class="bold">options.worker</span> should be enough).
   * </div>
   * @example <caption>Simple usage</caption>
   * //Define some variables
   * let map = [], X = 30, Y = 30
   *
   * //Define a biome function (optional)
   * let biome = (x, y) => {
   *    let e = noise(x, y) //Elevation
   *    if (e <= 0.1) return -1.0 //Sea
   *    if (e <= 0.2) return  1.1 //Beach
   *    if (e <= 0.4) return  1.0 //Plains
   *    if (e <= 0.5) return  1.2 //Forest
   *    if (e <= 0.7) return  1.4 //Hills
   *    if (e <= 0.9) return  1.6 //Mountains
   *    if (e <= 1.0) return  2.0 //Snow mountains
   * }
   *
   * //Create map
   * for (let x = 0; x < X; x++) { map[x] = []
   *    for (let y = 0; y < Y; y++) {
   *        map[x][y] = biome(x, y)
   *    }
   * }
   *
   * //Define configurations options
   * let options = {
   *     order:"xy",
   *     diagonals:<span class="code-diagonals">true</span>,
   *     cutting:<span class="code-cutting">false</span>,
   *     torus:<span class="code-torus">false</span>,
   *     heuristic:<span class="code-heuristic">Lowlight.Astar.Heuristics.euclidian</span>
   * }
   *
   * //Create a new configuration
   * //You can define multiples layers with differents parameters and/or cost functions while using the same map
   * let astar = new Lowlight.Astar.Configuration(map,
   *    {...options, cost() { return m >= 0 ? m : NaN }}, //Only terrestrial fields accepted
   *    {...options, cost() { return m < 0 ? -m : NaN }}, //Only aquatic fields accepted
   *    {...options, cost() { return Math.abs(m) }} //All fields types accepted
   * )
   *
   * //Compute a path
   * astar.path({x:<span class="code-start-x">0</span>, y:<span class="code-start-y">0</span>}, {x:<span class="code-goal-x">0</span>, y:<span class="code-goal-y">0</span>}, {
   *    callback(path, scores) { path.map(n => console.log(n)) },
   *    layer:<span class="code-profil">0</span> //<span class="code-profil-name">Terrestrial</span>
   * })
   * @category astar
   * @param {Object} map - Map
   * @param {Object} [options] - See below
   * @param {String} [options.heuristic=Heuristics.manhattan] - Heuristic function. Accepted values are defined in {@link Heuristic} object
   * @param {Object} [options.heuristicOptions={}] - Default options for heuristic options
   * @param {Object} [options.cost=function] - Cost function. Parameters are nodes' data
   * @param {Boolean} [options.diagonals=false] - Enable or disable diagonals movement
   * @param {Boolean} [options.cutting=false] - If enabled, diagonals movements between two blocking cells are allowed
   * @param {Boolean} [options.torus=false] - If enabled, map will be considered as a torus (map is wrapped on itself)
   * @param {String} [options.order="yx"] - Order of array access value (in arrays structure). Accepted values are "xy" and "yx"
   * @param {String} [options.worker=""] - If enabled, methods will be computed in a separate thread. Pass file's source as parameter to enable
   */
    constructor(map, options = {}, worker = "") {
      /**
       * Raw data used for instantiation.
       * @readonly
       * @private
       * @type {Array}
       */
        this.raw = [map, options, worker]

      /**
       * List of graphs used by this configuration.
       * @readonly
       * @type {Graph[]}
       */
        this.graphs = []

      //Convert array to graph (if necessary)
        if (Array.isArray(map))
          this.graphs = [Graph.fromArray.call(null, map, options)].flat()

      //Create worker if needed
        this.worker = worker
    }

  /**
   * WebWorker associated to current configuration.
   * <div class="alert warning">
   *   An exception can be thrown if specified file path (i.e. lowlight.astar.js path) cannot be opened.<br>
   *   Note that some browsers may not allow the usage of local WebWorkers, which will also results in an exception.
   * </div>
   * @type {Worker}
   */
    set worker(url) {
      //Quit if already in a worker scope
        if (Configuration.isWorker)
          return

      //Create worker events map if needed
        if (!this._worker_events)
          this._worker_events = new Map()

      //Remove worker
        if ((url === null)||(!url.length)) {
          //Terminate worker if needed
            if (this._worker)
              this._worker.terminate()
          this._worker = null
          return
        }

      //Create worker
        this._worker = new Worker(url)

      //Worker messages handler
        this._worker.onmessage = ({data}) => {
          //Parsing data
            const {method, id, output, error} = Configuration.parse(data)
          //Resolve promise
            const promise = this._worker_events.get(id)
            if (promise)
              error ? promise.reject(error) : promise.solve(output)
        }

      //Configurate worker
        this.thread({method:"constructor", input:this.raw})
    }
    get worker() {
      return this._worker || null
    }

  /**
   * Send a request to worker.
   * @param {Object} options - Options
   * @param {String} options.method - Name of method
   * @param {Array} options.input - Arguments
   */
    async thread({method, input}) {
      //Prepare request
        const promise = new ExternalPromise()
        const id = Math.random().toString(36).substr(2, 9)
      //Send request
        this._worker_events.set(id, promise)
        this._worker.postMessage(Configuration.stringify({method, id, input:Array.from(input)}))
      return promise.promise
    }

  /**
   * Compute a path from start to end.
   * The heuristic used by this method must be stored in {@link Heuristic}.
   * Values in scores are the sum of total cost from start to current node and heuristic cost from current node to goal.
   * Scores aren't available when <span class="bold">options.worker</span> is enabled.
   * <div class="alert info">
   * You must use an admissible heuristic function to find the shortest past.
   * </div>
   * <div class="alert danger">
   * When <span class="bold">options.jps</span> is enabled, movements cost should be uniform, as JPS makes assumptions on them to prevent nodes expansions.
   * </div>
   * @param {Object} start - Start vertex
   * @param {Object} goal - Goal vertex
   * @param {Object} [options] - Options
   * @param {Number} [options.layer=0] - Layer to use (if multiple graphs)
   * @param {Function} [options.heuristic=Heuristics.manhattan] - Heuristic function to use
   * @param {Boolean} [options.jps=false] - Execute A* JPS (Jump Point Search) to speed up computation (only work on uniform cost graphs)
   * @param {Boolean} [options.fail=false] - Throw an error if no path was found
   * @param {Boolean} [options.thread=false] - Use worker instead of main thread
   * @return {Promise<Vertex[]>} Path
   */
    async path(start, goal, {jps = false, heuristic = Heuristics.manhattan, fail = false, layer = 0, thread = false}) {
      //Jump Point Search variant
        if (jps)
          return this.jps.apply(this, arguments)
        if ((thread)&&(!Configuration.isWorker)) {
          const {path, scores} = await this.thread({method:"path", input:arguments})
          return {path:path.map(vertex => this.graphs[layer].get(vertex)), scores}
        }

      //Promise
        return new Promise((solve, reject) => {
          //Discovered vertices and total scores
            const open = new BinaryHeap(node => node.estimated)
            const scores = new Map()
            const graph = this.graphs[layer]
            const heuristics = {estimate:heuristic, options:graph.meta}

          //Initialization
            start = graph.get(start)
            goal = graph.get(goal)
            open.add({vertex:start, estimated:0})
            scores.set(start, {score:0, from:null})

          //Compute path
            if (graph.connected(start, goal)) {
              while (open.size) {
                //Current vertex
                  const current = open.pop().vertex
                  if (current === goal)
                    break

                //Retrieve neighbors
                  current.neighbors(graph).map(vertex => {
                    //Compute new score
                      const score = (scores.has(current) ? scores.get(current).score : 0) + graph.cost(current, vertex)

                    //Save new score if it's better, and add it to discovered vertices
                      if (score < (scores.has(vertex) ? scores.get(vertex).score : Infinity)) {
                        scores.set(vertex, {score, from:current})
                        open.update({vertex, estimated:(score + heuristics.estimate(vertex, goal, heuristic.options))})
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
                path.push(goal)
                while ((current = scores.get(current).from) !== null)
                  path.push(current)
                path = path.reverse()
            }

          //Resolve promise
            if ((!path.length)&&(fail))
              reject("No path found")
            else
              solve({path, scores})
        })
    }

  /**
   * Parser for serialized object.
   * @param {String} object - Object to deserialize
   * @return {Object} Deserialized object
   */
    static parse(object) {
      return JSON.parse(object, (key, value) => {
        //Handle function serialization
          if (/^@function#([\s\S]+)$/.test(value)) {
            value = value.match(/^@function#([\s\S]+)$/)[1]
            //Arrow function
              if (/^\((.*?)\)\s*=>\s*{/.test(value))
                return eval(value)
            //Implicit function
              if (/^function\s*\(/.test(value))
                return eval(`(${value})`)
            //Implicit named function
              if (/^[_a-zA-Z0-9]+\s*\(/.test(value))
                return eval(`function ${value}`)
            //Explicit named function
              if (/^function\s*[_a-zA-Z0-9]+\s*\(/.test(value))
                return eval(value)
            throw new Error(`Unsupported scheme of function serialization : ${value}`)
          }
        //Handle map serialization
          if (/^@map#([\s\S]+)$/.test(value)) {
            value = value.match(/^@map#([\s\S]+)$/)[1]
            return new Map(JSON.parse(value))
          }
        return value
      })
    }

  /**
   * Serializer for object.
   * @param {Object} object - Object to serialize
   * @return {String} Serialized object
   */
    static stringify(object) {
      return JSON.stringify(object, (key, value) => {
        //Handle function serialization
          if (typeof value === "function")
            return `@function#${value.toString()}`
        //Handle map serialization
          if (value instanceof Map)
            return `@map#${JSON.stringify([...value.entries()])}`
        return value
      })
    }

  /**
   * Tell if currently in a worker scope.
   * @return {Boolean} True if in worker scope
   */
    static get isWorker() {
      return (typeof WorkerGlobalScope !== "undefined")&&(self instanceof WorkerGlobalScope)
    }
}

        
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

        
/**
 * Code below is only executed when in a worker scope.
 */
//=========================================================================================
  if (Configuration.isWorker) {
    //Instance
      let instance

    //Worker controller
      onmessage = async function ({data}) {
        //Parsing data
          const {method, id, input} = Configuration.parse(data)
        //Treating orders
          switch (method) {

            //Constructor
              case "constructor":{
                try {
                  instance = new Configuration(...input)
                  return postMessage(Configuration.stringify({method, id, output:true, error:null}))
                }
                catch (error) {
                  return postMessage(Configuration.stringify({method, id, output:null, error}))
                }
              }

            //Path method
              case "path":{
                try {
                  const output = await instance.path(...input)
                  return postMessage(Configuration.stringify({method, id, output, error:null}))
                }
                catch (error) {
                  return postMessage(Configuration.stringify({method, id, output:null, error}))
                }
              }

          }
      }

  }
//=========================================================================================

        global.Lowlight.Astar = {Graph, Vertex, BinaryHeap, Heuristics, Configuration}

})(typeof window !== "undefined" ? window : this)
