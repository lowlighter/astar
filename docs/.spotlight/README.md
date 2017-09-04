# Spotlight
This is a template for [JSDoc 3](https://github.com/jsdoc3/jsdoc).

* [Live demo](https://lowlighter.github.io/jsdoc-spotlight/demo)
* [About](https://lowlight.fr/en/blog/documentation-template/)

## Getting Started
You'll need to run the following command the first time to install dependencies.
```shell
npm install
```

Configure options for documentation generation in your `conf.json` file :
```json
{
  "name": "<Project name>",
  "plugins": ["templates/spotlight/plugins/categories"],
  "categoryfile" : "path/to/categories.json"
}
```

As this template uses the [**@category**](https://github.com/ErnstHaagsman/jsdoc-plugins/blob/master/categories.md) tag, you'll need to
create a `categories.json` file :
```json
{
  "category_1" : {"displayName" : "<Category 1>"},
  "category_2" : {"displayName" : "<Category 2>"},
  "category_3" : {"displayName" : "<Category 3>"},
}
```

Note that you don't have to use them, but ensure that `categories.json` still exists.

Then generate your documentation with the usual command *(change path if needed)* :
```shell
jsdoc src.js -a all -c conf.json -t spotlight -R readme.md
```

## Rebuild project and expanding the library
To rebuild project, just run the following command :
```shell
npm run build
```

This will minify both `src/static/js/scripts.js` and `src/static/css/styles.less`.
`demo/docs` will be also be updated so you can have a preview of your changes.

* Less processing is performed with [Less](https://github.com/less/less-docs).
* File minification is performed with [Babel minify](https://github.com/babel/minify).
* Documentation is generated with [JSDoc 3](https://github.com/jsdoc3/jsdoc).
* Syntaxic coloration for `JavaScript`, `JSON` and `HTML` is rendered with [Highlight.js](https://highlightjs.org/download/)


The template is designed to support mobile devices, but is optimized for desktop.

## License
This project is licensed under the MIT License.

See [LICENSE.md](https://github.com/lowlighter/file-system/blob/master/LICENSE.md) file for details.
