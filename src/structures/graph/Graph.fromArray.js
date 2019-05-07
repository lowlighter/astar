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
