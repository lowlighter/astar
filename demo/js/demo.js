$(function () {
    //Create PIXI View
        let app = new PIXI.Application(400, 400, {transparent:true})
        $(".app-view").append(app.view)
    //Load textures
        let size = 8
        PIXI.loader.add("src/sprites.json").load(function () {
            //Biome generation
            //See http://www.redblobgames.com/maps/terrain-from-noise/ for more informations
                function biome(x, y) {
                    //Eleveation
                        x /= X ; y /= Y
                        let e = Math.pow(0.5*(1 + 1*noise.simplex2(1 * x, 1 * y) + 0.5*noise.simplex2(2 * x, 2 * y) + 0.25*noise.simplex2(4 * x, 4 * y)), 2)
                    //Biomes
                        if (e < 0.1 + biome.sea_variations) { return biome.config.SEA }
                        else if (e < 0.2) { return biome.config.BEACH }
                        else if (e < 0.4) { return biome.config.PLAINS }
                        else if (e < 0.5) { return biome.config.FOREST }
                        else if (e < 0.7) { return biome.config.HILLS }
                        else if (e < 0.9) { return biome.config.MOUNTAINS }
                        else { return biome.config.SNOW }
                }
            //Biome config
                biome.config = {
                    SEA:{cost:-1, sprite:"sea.png"},
                    BEACH:{cost:1.1, sprite:"beach.png"},
                    PLAINS:{cost:1, sprite:"plains.png"},
                    FOREST:{cost:1.2, sprite:"forest.png"},
                    HILLS:{cost:1.4, sprite:"hills.png"},
                    MOUNTAINS:{cost:1.6, sprite:"mountains.png"},
                    SNOW:{cost:2, sprite:"snow.png"},
                }
                biome.sea_variations = 0

            //Layers
                let fields = app.stage.addChild(new PIXI.Container())
                let results = app.stage.addChild(new PIXI.Container())
                let ui = app.stage.addChild(new PIXI.Container())
                window.results = results

            //Declarations
                let map = [], X = app.view.width/size, Y = app.view.height/size;
                let astar, start = {x:0, y:0}
                let param = {torus:0, diagonals:1, heuristic:"euclidian", profil:0, scores:1, cutting:0, jps:0}, taps = 0, ticker = null

            //Users interactions
                let interactions = ui.addChild(new PIXI.Sprite.fromFrame("black.png"))
                interactions.alpha = 0
            //Compute new path on mouse move
                interactions.mousemove = function (e) {
                    //Get coordinates
                        let data = e.data.getLocalPosition(this)
                        if ((data.x < 0)||(data.y < 0)||(data.x >= 400)||(data.y >= 400)) { return }
                        let x = ~~(data.x/size), y = ~~(data.y/size)

                    //Code update
                        $(".code-goal-x").find("*").text(x)
                        $(".code-goal-y").find("*").text(y)
                    //Path computation
                        results.removeChildren()
                        astar.path(start, {x, y}, {layer:param.profil, jps:param.jps, callback(path, scores) {
                            //Display scores
                                if (param.scores) {
                                    scores.forEach((a, n) => {
                                        //Show as computed node
                                            let ss = results.addChild(new PIXI.Sprite.fromFrame("computed.png"))
                                            ss.width = ss.height = size
                                            ss.position.set(n.x*size, n.y*size)
                                        //Show direction
                                            if (a.from) {
                                                let ar = results.addChild(new PIXI.Sprite.fromFrame("arrow.png"))
                                                ar.anchor.set(0.5)
                                                ar.width = ar.height = size
                                                ar.position.set(n.x*size, n.y*size)
                                                ar.x += size/2, ar.y += size/2
                                                ar.rotation = Math.atan2(Math.sign(n.y-a.from.y), Math.sign(n.x-a.from.x))
                                            }
                                    })
                                }
                            //Display path
                                path.map((n, i) => {
                                    let ss = results.addChild(new PIXI.Sprite.fromFrame("path.png"))
                                    ss.width = ss.height = size
                                    ss.position.set(n.x*size, n.y*size)
                                    ss.alpha = 0.5
                                })
                            //No path found
                                if (!path.length) {
                                    let bg = results.addChild(new PIXI.Sprite.fromFrame("black.png"))
                                    bg.alpha = 0.5
                                    let t = results.addChild(new PIXI.Text($(".text-no-path-found").text(), {fontSize:20, fill:"white", fontWeight:400}))
                                    t.position.set((app.view.width-t.width)/2, (app.view.height-t.height)/2)
                                }
                            //Start and goal node
                                let st = results.addChild(new PIXI.Sprite.fromFrame("start.png"))
                                st.width = st.height = size
                                st.position.set(start.x*size, start.y*size)
                                let en = results.addChild(new PIXI.Sprite.fromFrame("goal.png"))
                                en.width = en.height = size
                                en.position.set(x*size, y*size)
                        } })
                }
            //Set start point
                interactions.click = function (e) {
                    //Get coordinates
                        let data = e.data.getLocalPosition(this)
                        if ((data.x < 0)||(data.y < 0)||(data.x >= 400)||(data.y >= 400)) { return }
                        let x = ~~(data.x/size), y = ~~(data.y/size)
                    //Define start
                        start = {x, y}
                        $(".code-start-x").find("*").text(x)
                        $(".code-start-y").find("*").text(y)
                        results.removeChildren()
                        let st = results.addChild(new PIXI.Sprite.fromFrame("start.png"))
                        st.width = st.height = size
                        st.position.set(start.x*size, start.y*size)
                }
            //Mobile support
                interactions.touchstart = function (e) {
                    if (taps%2) { interactions.mousemove(e) } else { interactions.click(e) }
                    taps++
                }

        //Demo function
            function demo(regenerate) {
                //Build map
                    if (regenerate) {
                        app.ticker.remove(ticker)
                        noise.seed(Math.random())
                        fields.removeChildren()
                        biome.sea_variations = 0
                        for (let x = 0; x < X; x++) { map[x] = []; for (let y = 0; y < Y; y++) {
                            //Biome
                                let b = biome(x, y)
                                map[x][y] = b.cost
                            //Sprite
                                let s = fields.addChild(new PIXI.Sprite.fromFrame(b.sprite))
                                s.width = s.height = size
                                s.position.set(x*size, y*size)
                        } }
                        //
                        ticker = function () {
                            if (app.ticker.lastTime + 1000 < ticker.lastTime) { return } else { ticker.lastTime = app.ticker.lastTime }
                            biome.sea_variations = Math.sin(ticker.iterations++/70)*0.01
                            for (let x = 0; x < X; x++) { for (let y = 0; y < Y; y++) {
                                //Biome
                                    let b = biome(x, y)
                                    map[x][y] = b.cost
                                //Sprite
                                    fields.children[y + x*Y].texture = new PIXI.Texture.fromFrame(b.sprite)
                            } }
                        }
                        ticker.lastTime = 0
                        ticker.iterations = 0
                        app.ticker.add(ticker)
                    }

                //Create new configuration
                    astar = new Lowlight.Astar.Configuration(map, {
                        order:"xy",
                        torus:param.torus,
                        diagonals:param.diagonals,
                        cutting:param.cutting,
                        heuristic:param.heuristic+(param.torus ? "Torus" : ""),
                        cost(n, m) { return m >= 0 ? m : null }
                    }, {
                        order:"xy",
                        torus:param.torus,
                        diagonals:param.diagonals,
                        cutting:param.cutting,
                        heuristic:param.heuristic+(param.torus ? "Torus" : ""),
                        cost(n, m) { return m < 0 ? -m : null }
                    }, {
                        order:"xy",
                        torus:param.torus,
                        diagonals:param.diagonals,
                        cutting:param.cutting,
                        heuristic:param.heuristic+(param.torus ? "Torus" : ""),
                        cost(n, m) { return Math.abs(m) }
                    })

                //Sync with code example
                    $(".code-torus").find("*").text(param.torus ? "true" : "false")
                    $(".code-diagonals").find("*").text(param.diagonals ? "true" : "false")
                    $(".code-cutting").find("*").text(param.cutting ? "true" : "false")
                    $(".code-heuristic").find("*").text(`"${param.heuristic+(param.torus ? "Torus" : "")}"`)
                    $(".code-profil").find("*").text(param.profil)
                    $(".code-profil-name").find("*").text(["Terrestrial", "Aquatic", "Amphibian"][param.profil])
                    $(".code-jps").find("*").text(param.jps ? "true" : "false")
                    $(".code-X").find("*").text(X)
                    $(".code-Y").find("*").text(Y)
            }

        //Interactivity
            $('[name="generate"]').click(function () { demo(true) })
            $('[name="torus"]').val(param.torus).on("change", function () { param.torus = $(this).val() === "1"; demo() })
            $('[name="diagonals"]').val(param.diagonals).on("change", function () { param.diagonals = $(this).val() === "1"; demo() })
            $('[name="cutting"]').val(param.cutting).on("change", function () { param.cutting = $(this).val() === "1"; demo() })
            $('[name="heuristic"]').val(param.heuristic).on("change", function () { param.heuristic = $(this).val(); demo() })
            $('[name="scores"]').val(param.scores).on("change", function () { param.scores = $(this).val() === "1"; demo() })
            $('[name="jps"]').val(param.jps).on("change", function () { param.jps = $(this).val() === "1"; demo() })
            $('[name="profil"]').val(param.profil).on("change", function () {
                param.profil = $(this).val()
                $(".code-profil").find("*").text(param.profil)
                $(".code-profil-name").find("*").text([$(".app .text-p1").text(), $(".app .text-p2").text(), $(".app .text-p3").text()][param.profil])
            })
            demo(true);
            interactions.interactive = true
        })
})


window.array = []
window.proxy = new Proxy(array, {
  get(object, prop) { console.log(object, prop) },
  set(object, prop) { console.log(object, prop) },
 })
