$(function () {
    //Create PIXI View
        let app = new PIXI.Application(400, 400, {transparent:true})
        $(".pixi-view").append(app.view)
    //Create texture
        let size = 10
        let texture = ((new PIXI.Graphics()).beginFill(0xFFFFFF, 1).drawRect(0, 0, size, size).endFill()).generateTexture()

    //Biome generation
    //See http://www.redblobgames.com/maps/terrain-from-noise/ for more informations
        function biome(x, y) {
            //Eleveation
                x /= X ; y /= Y
                let e = Math.pow(0.5*(1 + 1*noise.simplex2(1 * x, 1 * y) + 0.5*noise.simplex2(2 * x, 2 * y) + 0.25*noise.simplex2(4 * x, 4 * y)), 2)
            //Biomes
                if (e < 0.1) { return biome.config.SEA }
                else if (e < 0.2) { return biome.config.BEACH }
                else if (e < 0.4) { return biome.config.PLAINS }
                else if (e < 0.5) { return biome.config.FOREST }
                else if (e < 0.7) { return biome.config.HILLS }
                else if (e < 0.9) { return biome.config.MOUNTAINS }
                else { return biome.config.SNOW }
        }
    //Biome config
        biome.config = {
            SEA:{color:0x4060C0, cost:-1},
            BEACH:{color:0xD2B98B, cost:1.1},
            PLAINS:{color:0x74A963, cost:1},
            FOREST:{color:0x417E62, cost:1.2},
            HILLS:{color:0xA4BD7D, cost:1.4},
            MOUNTAINS:{color:0xBED2AF, cost:1.6},
            SNOW:{color:0xD2D2D7, cost:2},
        }

    //Layers
        let fields = app.stage.addChild(new PIXI.Container())
        let results = app.stage.addChild(new PIXI.Container())

    //Declarations
        let map = [], X = 40, Y = 40, taps = 0;
        let astar, start = {x:0, y:0}
        let param = {torus:false, diagonals:true, heuristic:"euclidian", profil:0, scores:false, cutting:false}

    //Demo function
        function demo(regenerate) {
            //Build map
                if (regenerate) {
                    noise.seed(Math.random())
                    for (let x = 0; x < X; x++) { map[x] = []; for (let y = 0; y < Y; y++) {
                        //Biome
                            let b = biome(x, y)
                            map[x][y] = b.cost
                        //Sprite
                            let s = fields.addChild(new PIXI.Sprite(texture))
                            s.position.set(x*size, y*size)
                            s.interactive = true ;
                            s.tint = b.color
                        //Interactivity
                            s.interactive = true
                            s.click = function () {
                                start = {x, y}
                                $(".code-start-x").find("*").text(x)
                                $(".code-start-y").find("*").text(y)
                                results.removeChildren()
                                let st = results.addChild(new PIXI.Sprite(texture))
                                st.position.set(start.x*size, start.y*size) ; st.tint = 0
                            }
                            s.touchstart = function () {
                                if (taps%2) { s.mouseover() } else { s.click() }
                                taps++
                            }
                            s.mouseover = function () {
                                //Code update
                                    $(".code-goal-x").find("*").text(x)
                                    $(".code-goal-y").find("*").text(y)
                                //Path computation
                                    astar.path(start, {x, y}, {layer:param.profil, callback(path, scores) {
                                        //Display path
                                            results.removeChildren()
                                            path.map((n, i) => {
                                                let ss = results.addChild(new PIXI.Sprite(texture))
                                                ss.position.set(n.x*size, n.y*size)
                                                ss.tint = 0xFF0000
                                                ss.alpha = 0.4
                                            })
                                        //Display scores
                                            if (param.scores) {
                                                scores.forEach((a, node) => {
                                                    let t = results.addChild(new PIXI.Text((a.score).toFixed(1).toString(), {fontSize:8}))
                                                    t.position.set(node.x*size, node.y*size)
                                                })
                                            }
                                        //No path found
                                            if (!path.length) {
                                                let bg = results.addChild(new PIXI.Sprite(texture))
                                                bg.width = app.view.width ; bg.height = app.view.height ;
                                                bg.tint = 0; bg.alpha = 0.5
                                                let t = results.addChild(new PIXI.Text("No path found :(", {fontSize:20, fill:"white", fontWeight:400}))
                                                t.position.set((app.view.width-t.width)/2, (app.view.height-t.height)/2)
                                            }
                                        //Start and goal node
                                            let st = results.addChild(new PIXI.Sprite(texture))
                                            st.position.set(start.x*size, start.y*size) ; st.tint = 0
                                            let en = results.addChild(new PIXI.Sprite(texture))
                                            en.position.set(x*size, y*size) ; en.tint = 0
                                    } })
                            }
                    } }
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

                $(".code-torus").find("*").text(param.torus ? "true" : "false")
                $(".code-diagonals").find("*").text(param.diagonals ? "true" : "false")
                $(".code-cutting").find("*").text(param.cutting ? "true" : "false")
                $(".code-heuristic").find("*").text(`"${param.heuristic+(param.torus ? "Torus" : "")}"`)
                $(".code-profil").find("*").text(param.profil)
                $(".code-profil-name").find("*").text(["Terrestrial", "Aquatic", "Amphibian"][param.profil])
        }

    //Interactivity
        $('[name="generate"]').click(function () { demo(true) })
        $('[name="torus"]').on("change", function () { param.torus = $(this).val() === "1"; demo() })
        $('[name="diagonals"]').on("change", function () { param.diagonals = $(this).val() === "1"; demo() })
        $('[name="cutting"]').on("change", function () { param.cutting = $(this).val() === "1"; demo() })
        $('[name="heuristic"]').on("change", function () { param.heuristic = $(this).val(); demo() })
        $('[name="scores"]').on("change", function () { param.scores = $(this).val() === "1"; demo() })
        $('[name="profil"]').on("change", function () {
            param.profil = $(this).val()
            $(".code-profil").find("*").text(param.profil)
            $(".code-profil-name").find("*").text(["Terrestrial", "Aquatic", "Amphibian"][param.profil])
        })
        demo(true);
})
