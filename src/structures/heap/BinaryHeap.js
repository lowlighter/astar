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
