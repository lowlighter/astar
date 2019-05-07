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