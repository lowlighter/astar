//Dependancies
    const fs = require("fs")
    const path = require("path")
    const spawn = require("child_process").spawnSync
    const src = path.join(__dirname, process.env.npm_package_config_jsdoc_source)
    const out = path.join(__dirname, process.env.npm_package_config_jsdoc_output)
    const config = path.join(__dirname, process.env.npm_package_config_jsdoc_config)
    const readme = path.join(__dirname, process.env.npm_package_config_jsdoc_readme)
    let exit = 0

//Title
    console.log("\033[2J")
    console.log("+-------------------------------+")
    console.log("| JSDoc 3 - Spotlight theme     |")
    console.log("+-------------------------------+")

//Scripts
    console.log("Scripts minification :")
    exit += execute("Babili", "../../../node_modules/.bin/babili", [path.join(__dirname, "static/js/scripts.js"), "-o", path.join(__dirname, "static/js/scripts.min.js")])

//Style
    console.log("Styles minification :")
    exit += execute("Less pre-processor", "../../../node_modules/.bin/lessc", [path.join(__dirname, "static/css/styles.less"), path.join(__dirname, "static/css/styles.min.css")])

//Generating documentation
    console.log("Generating documentation :")
    exit += execute("JSDoc 3", "../../../node_modules/.bin/jsdoc", [src, "-c", config, "-d", out, "-R", readme, "-t", path.join(__dirname), "-a", "all"])

//Command execution
    function execute(name, bin, args) {
        try {
            //Check installation
                if ((process.platform === "win32")&&(/node_modules\/\.bin\/[^/\\]*$/.test(bin))) { bin += ".cmd" }
                bin = bin.split("/"), bin.unshift(__dirname)
                let pckg = path.join.apply(null, bin)
                if (!fs.existsSync(pckg)) { throw new Error(`${name} isn't installed`) }
            //Execute command
                let c = spawn(pckg, args)
            //Output
                if (c.stderr.length) { throw new Error(c.stderr) }
                console.log("    \x1b[32m%s\x1b[0m", "Success")
                return 0
        } catch (e) {
            console.log("    \x1b[31m%s\x1b[0m", e)
            return 1
        }
    }

//Return
    console.log("General status :")
    if (exit) { console.log("    \x1b[31m%s\x1b[0m", `${exit} error${exit > 1 ? "s" : ""} occured :(`) } else { console.log("    \x1b[32m%s\x1b[0m", "Success :)") }
    process.exit(exit)
