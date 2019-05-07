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
        /* #include <structures/graph/Graph.js> */
        /* #include <structures/graph/Graph.fromArray.js> */
        /* #include <structures/graph/Vertex.js> */

        /* #include <structures/heap/BinaryHeap.js> */

        /* #include <structures/promises/ExternalPromise.js> */

        /**
         * Heuristics functions libraries.
         * @category astar
         * @class Heuristic
         */
            const Heuristics = {}

        /* #include <astar/heuristics/manhattan.js> */
        /* #include <astar/heuristics/diagonal.js> */
        /* #include <astar/heuristics/euclidian.js> */

        /* #include <astar/Configuration.js> */
        /* #include <astar/variants/JumpSearchPoint.js> */
        /* #include <astar/workers/Workers.js> */

        global.Lowlight.Astar = {Graph, Vertex, BinaryHeap, Heuristics, Configuration}

})(typeof window !== "undefined" ? window : this)
