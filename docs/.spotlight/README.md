# Spotlight
This is a template for [JSDoc 3](https://github.com/jsdoc3/jsdoc).

* [Live demo](https://lowlighter.github.io/jsdoc-spotlight/demo)

# Usage
Start by installing dependencies with the following command :
```
npm install
```

You may configure options for documentation generation in your **conf.json** file :
```json
{
  "name": "<Project name>",
  "plugins": ["templates/spotlight/plugins/categories"],
  "categoryfile" : "path/to/categories.json"
}
```

This template use the [**@category**](https://github.com/ErnstHaagsman/jsdoc-plugins/blob/master/categories.md) tag,
you may create some create a **categories.json** file and add some categories in it :
```json
{
  "category_1" : {"displayName" : "<Category 1>"},
  "category_2" : {"displayName" : "<Category 2>"},
  "category_3" : {"displayName" : "<Category 3>"},
}
```

Then generate your documentation with the usual command (change path if needed) :
```
jsdoc src.js -a all -c conf.json -t spotlight -R readme.md
```

## Rebuild project

If you need to rebuild project, just run the following command :
```
npm run build
# src/static/js/scripts.js will be minified
# src/static/css/styles.less will be processed and minified
# demo/docs will be updated so you can have a preview of your changes
```

## Notes
This template has been edited from the default theme to suit my needs.
It may lacks some functionnalities that I removed because I didn't use them.

The version of [Highlight.js](https://highlightjs.org/download/) included only contains **JavaScript**, **JSON** and **HTML** color syntaxing.
You may download a more complete pack if needed.

The template is designed to be responsive, but it's still optimized for desktop users.

## License
This project is licensed under the MIT License. See [LICENSE.md](https://github.com/lowlighter/jsdoc-spotlight/blob/master/LICENSE.md) file for details.
