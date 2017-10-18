/**
 * This file allow to quickly build project from sources files.
 */

//Dependancies
    const fs = require("fs")
    const path = require("path")
    const spawn = require("child_process").spawnSync
    const hash = require("crypto").createHash("sha256")
    const src = path.join(__dirname, process.env.npm_package_config_source)
    const out = path.join(__dirname, process.env.npm_package_config_output)
    let exit = 0

//Title
    console.log("\033[2J")
    console.log("+-------------------------------+")
    console.log(`| ${(process.env.npm_package_config_project_name+" ".repeat(29)).substr(0, 29)} |`)
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
    try { hash.update(content), console.log("    \x1b[32m%s\x1b[0m", `Sha-256 : ${hash.digest("hex")}`) } catch (e) {  }

//Scripts
    console.log("Scripts minification :")
    let min = out.replace(/js$/, "min.js")
    exit += execute("Babel-minify", "../node_modules/.bin/babel-minify", [out, "-o", min])
    try {
        let mcontent = fs.readFileSync(min).toString()
        let license = fs.readFileSync("./LICENSE.md").toString()
        fs.writeFileSync(min, `/**\n${license}\n*/\n`+mcontent)
        console.log("    \x1b[32m%s\x1b[0m", "LICENSE.md has been added")
    } catch (e) { console.log("    \x1b[31m%s\x1b[0m", `Failed to add license. Please add it manually, don't be a jerk !`) ; exit++ }

//Generating documentation
    console.log("Generating documentation :")
    let c = spawn("node", ["./docs/.spotlight/src/build.js"])
    if (!c.status) { console.log("    \x1b[32m%s\x1b[0m", "Success") } else { console.log("    \x1b[31m%s\x1b[0m", `Error : ${c.status} error${c.status > 1 ? "s" : ""} occured`); exit += c.status }

//Generating demo
    console.log("Generating demo :")
    try {
        let template = process.env.npm_package_config_demo_template, demo_out = process.env.npm_package_config_demo_output
        let demo = fs.readFileSync(template).toString()
            .replace(/\{{2}\s*TITLE\s*\}{2}/g, process.env.npm_package_config_project_name)
            .replace(/\{{2}\s*REPO\s*\}{2}/g, process.env.npm_package_config_project_repo)
            .replace(/\{{2}\s*DOCS\s*\}{2}/g, process.env.npm_package_config_project_docs)
            .replace(/\{{2}\s*PAGE\s*\}{2}/g, process.env.npm_package_config_project_page)
        fs.writeFileSync(demo_out, demo)
        console.log("    \x1b[32m%s\x1b[0m", `${demo_out} was generated from ${template}`)
    } catch (e) { console.log("    \x1b[31m%s\x1b[0m", e) ; exit++ }

//Command execution
    function execute(name, bin, args) {
        try {
            //Check installation
                bin = bin.split("/"), bin.unshift(__dirname)
                let pckg = path.join.apply(null, bin)
                if (!fs.existsSync(pckg)) { throw new Error(`${name} isn't installed`) }
            //Execute command
                let c = spawn(pckg, args, {shell:true, stdio:["inherit", "pipe", "pipe"]})
            //Output
                if (c.stderr.length) { throw new Error(c.stderr.toString().replace(/\n*$/, "")) }
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
