# docs website

the docs website project renders a website from metadata stored the repo.

## usage:

in your projects webpack-config:

create an entry for metadata files:


```js
const metaFiles = require('glob').sync("./**/*.meta.ts?(x)");

exports.entry = {
    meta: metaFiles
}

```

in your plugin section, add a call to generateSite with the name of your entry

```js
const generateSite = require('auto-tools').generateSite;

exports.plugins = [
    generateSite('meta')
]

```


## implementation

generateSite calls HTMLwebpack plugin.
passing it options for:
- no injection of user code
- template url from node_modules/auto-tools.


the templates loads the website bundle from node modules. passing it the url for the meta entry.


the website loads the url in an iframe, gets the metadata from there. and then renders