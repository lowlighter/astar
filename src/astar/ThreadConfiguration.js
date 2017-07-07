//==================================================================================
//==================================================================================
//Code executed only if threads are enabled and scope is Worker
//==================================================================================
    //WebWorker
        if ((typeof WorkerGlobalScope !== "undefined")&&(self instanceof WorkerGlobalScope)) {
            //Instance
                let instance;
            //Worker controller
                onmessage = function (e) {
                    //Parsing data
                        let args = e.data
                    //Treating orders
                        switch (args[0]) {
                            //Construction
                                case "constructor":
                                    //Deserialize function
                                        if ("cost" in args[2]) {
                                            //Check if arrow function or explicit
                                                let arrow = /^\((.*?)\)\s*=>\s*{/.test(args[2].cost)
                                                let explicit = /^function /.test(args[2].cost)
                                            //Eval
                                                args[2].cost = eval(`(${(!arrow)&&(!explicit) ? "function " : ""}${args[2].cost})`)
                                        }
                                    //Creating instance
                                        instance = new Configuration(args[1], args[2])
                                        break
                            //Path method
                                case "path" : postMessage(JSON.stringify(["path", instance.path(args[1], args[2], args[3])]))
                                    break
                        }
                }
        }
//==================================================================================
//==================================================================================
