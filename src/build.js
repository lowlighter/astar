/**
 * This file allow to quickly build project from sources files.
 */

//Dependancies
    const fs = require("fs")
    const path = require("path")
    const spawn = require("child_process").spawnSync
    const src = path.join(__dirname, process.env.npm_package_config_source)
    const out = path.join(__dirname, process.env.npm_package_config_output)
    let exit = 0

//Title
    console.log("\033[2J")
    console.log("+-------------------------------+")
    console.log("| A* Pathfinding                |")
    console.log("+-------------------------------+")

//Building project
    let content = ""
    try {
        //Retrieving project skeleton
            console.log("Retrieving project skeleton :")
            content = fs.readFileSync(src).toString()
            console.log("    \x1b[32m%s\x1b[0m", "Success")
        //Include files
            console.log("Including files :")
            if (!(content.match(/\/\*\s*#include\s+<[a-zA-Z0-9.\/\\ ]+>\s*\*\//g)||[]).map((include, i, a) => {
                //File name
                    let file = `./src/${include.match(/\/\*\s*#include\s+<([a-zA-Z0-9.\/\\ ]+)>\s*\*\//)[1]}`
                    let msg = `${("00"+(i+1)).substr(-2)}/${("00"+a.length).substr(-2)} : ${file}`
                    let fcontent = ""
                    try { fcontent = fs.readFileSync(file).toString(), console.log("    \x1b[32m%s\x1b[0m", msg) } catch (e) { console.log("\x1b[31m%s\x1b[0m", `    ${msg} (failed)`) }
                //Adding to skeleton
                    content = content.replace(include, `\n${fcontent}`)
            }).length) { console.log("    \x1b[32m%s\x1b[0m", "(None)") }
    } catch (e) { console.log("    \x1b[31m%s\x1b[0m", e) ; exit++ }

//Writing all content in concatened file
    console.log(`Saving project :`)
    try { fs.writeFileSync(out, content), console.log("    \x1b[32m%s\x1b[0m", out) } catch (e) { console.log("    \x1b[31m%s\x1b[0m", `${out} (failed)`) ; exit++ }

//Scripts
    console.log("Scripts minification :")
    exit += execute("Babili", "../node_modules/.bin/babili", [out, "-o", out.replace(/js$/, "min.js")])

//Generating documentation
    console.log("Generating documentation :")
    let c = spawn("node", ["./docs/.spotlight/src/build.js"])
    if (!c.status) { console.log("    \x1b[32m%s\x1b[0m", "Success") } else { console.log("    \x1b[31m%s\x1b[0m", `Error : ${c.status} error${c.status > 1 ? "s" : ""} occured`); exit += c.status }

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
