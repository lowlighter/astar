/**
 * Woker Error
 * Thrown when web worker couldn't be initialzed
 * @ignore
 */
    class WorkerError extends Error {
        constructor(message) {
            super(message)
            this.name = "WorkerError";
        }
    }
