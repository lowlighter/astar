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