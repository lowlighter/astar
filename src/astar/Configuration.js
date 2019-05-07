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
