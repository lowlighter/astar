# A* Pathfinding
This library is another implementation in JavaScript of the famous **A&ast; algorithm**.

* [Live demo](https://lowlighter.github.io/astar/demo/)
* [Documentation](https://lowlighter.github.io/astar/docs/)

# Features
* Based on **Graph theory** for more flexibility
    * **Multiple graphs** support, use the same nodes instances for differents graph instances
* Graph builder helper for **2D Arrays**
    * **Any access order** supported ([x][y] or [y][x])
    * **Diagonals move** support, with or without corner-cutting
    * **Toric** maps support (maps wrapped on itself)
    * **Jump Point Search** (JPS) support for faster computations on uniform cost grids.  _(NB: Toric support isn't yet supported with JPS)_
* **3 heuristics** functions availables : Manhattan, Diagonals or Euclidian
    * **Custom** heuristic function also supported
* **Variable cost** support
* **Multi-threading** support (with Web Workers)
* Use of Binary Heaps and Connectivity to **speed up** calculations

## Getting Started
First of all, you need to include the library :
```html
    <script src="./bin/lowlight.astar.js"></script>
```

Then you may want create an alias for convenience :
```javascript
    let Astar = Lowlight.Astar
```

## Preparing a map

### Create a graph
If you're using a custom data structure, you'll need to convert it into a Graph struture. Don't worry, it's quite easy.

Assume your datas look like this :
```javascript
    let a = {id:"pallet-town", gym:null}
    let b = {id:"viridian-city", gym:"Earth badge"}
    let c = {id:"cinnabar-island", gym:"Volcano badge"}
```

First, start by creating a new Graph and some nodes :
```javascript
    let graph = new Astar.Graph()
    a = new Astar.Node(a.id, a) //Datas are synchronized :
    b = new Astar.Node(b.id, b) //b.gym = "Earth badge"
    c = new Astar.Node(c.id, c) //c.gym = "Volcano badge"
```

Then you'll need to override **graph.id** method because graphs instances only use numbers as identifiers.
```javascript
    //Override graph.id method
    graph.id = function (name) {
        return ["pallet-town", "viridian-city", "cinnabar-island"].indexOf(name)
    }

    //This way, graph.id will be compatible with any id type
    graph.id("pallet-town") //Return 0
```

Finally link different nodes :
```javascript
    graph.edge(a, b, 1, 2) //Going from a to b cost 1 whereas going from b to a cost 2
    graph.edge(a, c, 1, null) //Going from a to b cost 1 whereas it's not possible to go from b to a
```

### Create a graph from an array structure
For convenience, you may also create directly a graph from an array structure without specific order :

#### YX Order
```javascript
    let map =  [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ]
```
#### XY Order
```javascript
    let map =  []
    for (let x = 0; x < 3; x++) { map[x] = []
        for (let y = 0; y < 3; y++) {
            map[x][y] = Math.random() > 0.5
    }   }
```

## Create a configuration
To create a new **Configuration**, just type the following code :
```javascript
    let astar = new Astar.Configuration(map)
```

If you want to specify options, you can pass a second argument to instanciation :
```javascript
    let graph = new Astar.Configuration(map, {
        order:"yx", //Access order for 2D Array
        torus:false, //Tell if 2D Array is wrapped on itself
        diagonals:true, //Tell if diagonals moves are allowed (2D Array)
        cutting:false, //Tell if diagonals moves between two blocking squares are allowed (2D Array)
        heuristic:"euclidian", //Heuristic function name
        cost(a, b) { return b == 1 ? null : 1 }, //Cost function definition
        thread:"./bin/lowlight.astar.min.js", //If script's source is specified, multi-threading will be enabled
    })
```

If you want to reuse same map but with different option, just create instance with multiple **options** objects.
```javascript
    let graph = new Astar.Configuration(map, layer1, layer2, layer3)
```


### Cost function
Cost function takes will be called with two **Node** instances : source node and destination node.
It must returns a number or `null`.

While it's possible to use `Infinity` and negatives values, it isn't recommanded because it can leads to suspicious behaviour.

Most of the time, you'll only need the second argument, but you may want to use the first one to detect transitions.
For example, going from plains to mountains may cost 2 whereas going from mountains to mountains may cost only 1.
```javascript
    let cost = function(a, b) {
        if (b === "sea") { return null }
        if (b === "plains") { return 1 }
        if ((a === "mountains")&&(b === "mountains")) { return 1 }
        if ((a === "plains")&&(b === "mountains")) { return 2 }
        return null
    }
```

### Heuristic function
By default, only two-dimensional heuristic functions are defined.

To add a new one, just type the following code :
```javascript
    Astar.Heuristic["myHeuristic"] = function (a, b, options) {
        return Math.abs(b.x - a.x) + Math.abs(b.y - a.y) + Math.abs(b.z - a.z)
    }
```

The first two arguments are source node and destination node (remember that you can store anything in a node instance).
The third one is optional and may be specified as `heuristicOptions` in `astar.path` method.

## Computing a path
To compute a path, you'll just need to pass a **start** node and a **goal** node.

```javascript
    let path = astar.path({x:0, y:0}, {x:2, y:2})
```

If multi-threading option is enabled, you'll be need to specify a **callback** function.
```javascript
    astar.path({x:0, y:0}, {x:2, y:2}, {callback(path, scores) { path.map(n => console.log(n)) }})
```

Note that if you're using a multiple layers graph, you may specify the layer you want to use, the default one being 0.
```javascript
    astar.path({x:0, y:0}, {x:2, y:2}, {layer:1})
```

## Project content
|            |                            |
| ---------- | -------------------------- |
| **/bin**   | Production and test files  |
| **/src**   | Source files               |
| **/demo**  | Demo and codes examples    |
| **/docs**  | Library's documentations   |

### Rebuild project

If you need to rebuild project, just run the following command :
```
npm run build
# /bin will be updated with /src scripts files
# /docs will be updated
```

Don't forget to install dependencies before running the previous command.
```
npm install
```

## License
This project is licensed under the MIT License. See [LICENSE.md](https://github.com/lowlighter/astar/blob/master/LICENSE.md) file for details.
