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
     * <div class="alert danger">
     * When <span class="bold">options.jps</span> is enabled, movements cost should be uniform, as JPS makes assumptions on them to prevent nodes expansions.
     * </div>
     * @param {Object} start - Start node id
     * @param {Object} goal - Goal node id
     * @param {Object} [options] - Options
     * @param {Number} [options.layer=0] - Layer to use (if multiple graphs are enabled)
     * @param {String} [options.heuristic] - Name of heuristic function to use (override default heuristic)
     * @param {Object} [options.heuristicOptions] - Options for heuristic options (override default heuristic options)
     * @param {Boolean} [options.jps] - Execute A* JPS (Jump Point Search) to speed up computation
     * @param {Boolean} [options.static] - If enabled, a connectivity check will be performed before processing, thus avoiding useless computations if path doesn't exist.
     *                                     [Graph.connect]{@link Graph#connect} must be called each time you're adding or removing edges in Graph.
     * @param {Function} [options.callback] - Callback (will receive path and scores as arguments)
     * @return {Node[]} Path
     */
        path(start, goal, options = {}) {
            //Jump Point Search
                if (options.jps) { return this.jps(start, goal, options) }

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
                if ((!options.static)||(graph.connected(start, goal))) {
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
