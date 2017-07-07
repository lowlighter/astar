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
