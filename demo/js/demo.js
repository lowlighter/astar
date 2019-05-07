window.onload = function () {
  //Create application
    //Create view
      const app = new PIXI.Application(400, 400, {transparent:true})
    //Create controller
      app.controller = new Vue({
        el:"#app",
        mounted() {
          document.querySelector(".app-view").appendChild(app.view)
          hljs.highlightBlock(document.querySelector("pre code"))
        },
        data:{
          meta:{
            name:"A* Pathfinding library",
            docs:{
              link:"https://lowlight.fr/astar/docs",
            },
            site:{
              link:"https://lecoq.io",
              name:"lecoq.io",
            },
            repo:{
              link:"https://github.com/lowlighter/astar",
              name:"lowlighter/astar",
            },
            location:{
              protocol:window.location.protocol,
            },
            local:/file/.test(window.location.protocol),
          },
          torus:0,
          diagonals:1,
          heuristic:"euclidian",
          profil:0,
          scores:1,
          cutting:0,
          jps:0,
          start:{data:{x:0, y:0}},
          goal:{data:{x:0, y:0}},
          X:NaN,
          Y:NaN,
          demo:() => null,
          results:null,
        }
      })

  //Load textures
    PIXI.loader.add("src/sprites.json").load(function () {
      //Initialization
        const map = []
        const size = 8, X = app.view.width/size, Y = app.view.height/size
        const params = app.controller.$data
        let astar, taps = 0
        params.X = X
        params.Y = Y

      //Layers
        const fields = app.stage.addChild(new PIXI.Container())
        const results = app.stage.addChild(new PIXI.Container())
        const ui = app.stage.addChild(new PIXI.Container())

      //Users interactions
        const interactions = ui.addChild(new PIXI.Sprite.fromFrame("black.png"))
        interactions.alpha = 0

      //Create a new sprite
        function Sprite({x, y, texture, alpha, anchor}) {
          const sprite = new PIXI.Sprite.fromFrame(texture)
          sprite.width = sprite.height = size
          sprite.position.set(x, y)
          if (typeof alpha === "number")
            sprite.alpha = alpha
          if (typeof anchor === "number")
            sprite.anchor.set(anchor)
          return sprite
        }

      //Biome generation
      //See http://www.redblobgames.com/maps/terrain-from-noise/ for more informations
        function biome(x, y) {
          //Rescaling
            x /= X
            y /= Y
          //Elevation
            const e = Math.pow(0.5*(1 + 1*noise.simplex2(1 * x, 1 * y) + 0.5*noise.simplex2(2 * x, 2 * y) + 0.25*noise.simplex2(4 * x, 4 * y)), 2)
          //Biomes
            if (e < 0.1)
              return {cost:-1, sprite:"sea.png"}
            else if (e < 0.2)
              return {cost:1.1, sprite:"beach.png"}
            else if (e < 0.4)
              return {cost:1, sprite:"plains.png"}
            else if (e < 0.5)
              return {cost:1.2, sprite:"forest.png"}
            else if (e < 0.7)
              return {cost:1.4, sprite:"hills.png"}
            else if (e < 0.9)
              return {cost:1.6, sprite:"mountains.png"}
            else
              return {cost:2, sprite:"snow.png"}
        }

        function XY(that, event) {
          const data = event.data.getLocalPosition(that)
          if ((data.x < 0)||(data.y < 0)||(data.x >= 400)||(data.y >= 400))
            return null
          return {x:~~(data.x/size), y:~~(data.y/size)}
        }

      //Compute new path on mouse move
        interactions.mousemove = async function (event) {
          //Get coordinates
            params.goal = {data:XY(this, event)}
            results.removeChildren()
            if (params.goal.data === null)
              return
          //Path computation
            const {path, scores} = await astar.path(params.start, params.goal, {layer:params.profil, jps:[false, true][params.jps], heuristic:Lowlight.Astar.Heuristics[params.heuristic], heuristicOptions:{torus:[false, true][params.torus]}, thread:false})
          //Display scores
            if (params.scores)
              scores.forEach((score, node) => {
                //Computed node
                  results.addChild(Sprite({texture:"computed.png", x:node.data.x*size, y:node.data.y*size}))
                //Direction
                  if (score.from) {
                    const arrow = results.addChild(Sprite({texture:"arrow.png", x:node.data.x*size + size/2, y:node.data.y*size + size/2, anchor:0.5}))
                    arrow.rotation = Math.atan2(Math.sign(node.data.y-score.from.data.y), Math.sign(node.data.x-score.from.data.x))
                  }
              })
          //Display path
            path.forEach(node => results.addChild(Sprite({texture:"path.png", x:node.data.x*size, y:node.data.y*size, alpha:0.5})))
          //No path found
            if (!path.length) {
              const bg = results.addChild(new PIXI.Sprite.fromFrame("black.png"))
              bg.alpha = 0.5
              const t = results.addChild(new PIXI.Text("No path found :(", {fontSize:20, fill:"white", fontWeight:400}))
              t.position.set((app.view.width-t.width)/2, (app.view.height-t.height)/2)
            }
          //Start and goal node
            results.addChild(Sprite({texture:"start.png", x:params.start.data.x*size, y:params.start.data.y*size}))
            results.addChild(Sprite({texture:"goal.png", x:params.goal.data.x*size, y:params.goal.data.y*size}))
          //Results
            params.results = {length:path.length, cost:path.reduce((a, b, i) => a + (i ? astar.graphs[params.profil].cost(path[i-1], b) : 0), 0)}
        }

      //Set start point
        interactions.click = function (event) {
          //Get coordinates
            params.start = {data:XY(this, event)}
            results.removeChildren()
            if (params.start.data === null)
              return
          //Start node
            results.addChild(Sprite({texture:"start.png", x:params.start.x*size, y:params.start.y*size}))
        }

      //Mobile support
        interactions.touchstart = function (event) {
          if (taps%2)
            interactions.mousemove(event)
          else
            interactions.click(event)
          taps++
        }

      //Demo function
        function demo(regenerate) {
          //Build map
            if (regenerate) {
                noise.seed()
                for (let x = 0; x < X; x++) {
                  map[x] = []
                  for (let y = 0; y < Y; y++) {
                      const b = biome(x, y)
                      map[x][y] = b.cost
                      fields.addChild(Sprite({texture:b.sprite, x:x*size, y:y*size}))
                  }
                }
            }
          //Create new configuration
            astar = new Lowlight.Astar.Configuration(map, {
              order:"xy",
              torus:[false, true][params.torus],
              diagonals:[false, true][params.diagonals],
              cutting:[false, true, null][params.cutting],
              heuristic:Lowlight.Astar.Heuristics[params.heuristic],
              layers:[
                {cost(n, m) { return m.data.v >= 0 ? m.data.v : NaN }},
                {cost(n, m) { return m.data.v < 0 ? -m.data.v : NaN }},
                {cost(n, m) { return Math.abs(m.data.v) }}
              ]
            }, "/bin/lowlight.astar.js")
            window.astar = astar
        }

      //Interactivity
        demo(true)
        interactions.interactive = true
        params.demo = demo
    })
}