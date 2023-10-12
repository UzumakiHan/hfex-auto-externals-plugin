# hfex-auto-externals-plugin

<a href="https://www.npmjs.com/package/hfex-auto-externals-plugin"><img src="https://img.shields.io/npm/v/hfex-auto-externals-plugin" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/hfex-auto-externals-plugin"><img src="https://img.shields.io/npm/dt/hfex-auto-externals-plugin" alt="NPM download"></a>

auto externals plugin,Plugins encapsulated using [unplugin](https://github.com/unjs/unplugin) and [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)

html-webpack-plugin has introduced the getHooks method since version 4.0, so the HTML webpack plugin version used in your project must be at least 4.0

Currently supports:
- [Webpack](https://webpack.js.org/)

# install
```bash
npm install hfex-auto-externals-plugin -D

or

npx pnpm install hfex-auto-externals-plugin -D

or

npx yarn add hfex-auto-externals-plugin -D

```

# usage


<details>
<summary>Vue in Webpack</summary><br>


For example in Vue:

The vue version used in my project is 3.3.0

The vue-router version used in my project is 4.1.3


You can search for information about the corresponding NPM package on this website https://unpkg.com/

```js
// vue.config.js
const HfexAutoExternalsPlugin = require('hfex-auto-externals-plugin')
const externalsConfig = [
    {
        name:'vue',
        exposedField:'Vue',
        packageLink:'https://unpkg.com/vue@3.3.0/dist/vue.runtime.global.prod.js'
    },
    {
        name:'vue-router',
        exposedField:'VueRouter',
        packageLink:'https://unpkg.com/vue-router@4.1.3/dist/vue-router.global.prod.js'
    }
]

module.exports = {
    configureWebpack:{
        plugins:[
             HfexAutoExternalsPlugin({
                externalsConfig:externalsConfig
             })
        ]
    }
}
```

</details>

# effect

build your project

```bash
npm run build
```

before use hfex-auto-externals-plugin

The packaging volume rendering of the project is as follows

![before build bundle](https://raw.githubusercontent.com/UzumakiHan/static-files/master/images/auto-externals/before-bundle.png)


after use hfex-auto-externals-plugin

The packaging volume rendering of the project is as follows

![after build bundle](https://raw.githubusercontent.com/UzumakiHan/static-files/master/images/auto-externals/after-bundle.png)

![after build net](https://raw.githubusercontent.com/UzumakiHan/static-files/master/images/auto-externals/after-net.png)

![after build sourse](https://raw.githubusercontent.com/UzumakiHan/static-files/master/images/auto-externals/after-sourse.png)


Obviously, the volume of the packaged project has decreased significantly


# parameter

|   Prop    |   Type    |   Default  |   description    |   required    |
|  ----  | ----  |  ----  | ----  |  ----  | 
|   externalsConfig |   Array<{name:string;exposedField:string;packageLink:string}>  |   []   |  externalsConfig    |   true   |