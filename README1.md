# hfex-auto-externals-plugin

[英文文档](README)

<a href="https://www.npmjs.com/package/hfex-auto-externals-plugin"><img src="https://img.shields.io/npm/v/hfex-auto-externals-plugin" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/hfex-auto-externals-plugin"><img src="https://img.shields.io/npm/dt/hfex-auto-externals-plugin" alt="NPM download"></a>

自动注入插件,使用 [unplugin](https://github.com/unjs/unplugin) 和 [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)进行封装

html-webpack-plugin从4.0版本开始引入了getHooks方法，因此项目中使用的html-webpack-plugin版本必须至少为4.0

目前支持:
- [Webpack](https://webpack.js.org/)
- [Vite](https://github.com/vitejs/vite)


# install
```bash
npm install hfex-auto-externals-plugin -D

or

npx pnpm install hfex-auto-externals-plugin -D

or

npx yarn add hfex-auto-externals-plugin -D

```

# usage

在Vue项目中使用:

我的项目中使用的vue版本是3.3.0


我的项目中使用的vue-router版本是4.1.3


您可以在本网站上搜索有关相应NPM的信息 [unpkg](https://unpkg.com/)

<details>
<summary>Vue in Webpack</summary><br>


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
# effect

项目打包

```bash
npm run build
```

未使用 hfex-auto-externals-plugin

该项目的包装体积效果图如下

![before build bundle](https://raw.githubusercontent.com/UzumakiHan/static-files/master/images/auto-externals/before-bundle.png)


使用 hfex-auto-externals-plugin

该项目的包装体积效果图如下

![after build bundle](https://raw.githubusercontent.com/UzumakiHan/static-files/master/images/auto-externals/after-bundle.png)

![after build net](https://raw.githubusercontent.com/UzumakiHan/static-files/master/images/auto-externals/after-net.png)

![after build sourse](https://raw.githubusercontent.com/UzumakiHan/static-files/master/images/auto-externals/after-sourse.png)


显然，打包项目的体积已经大幅下降

</details>

<details>
<summary>Vue in vite</summary><br>


```js
// vite.config.ts
import { defineConfig } from 'vite'

import HfexAutoExternalsPlugin from 'hfex-auto-externals-plugin/vite'
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

export default defineConfig({
    plugins:[
             HfexAutoExternalsPlugin({
                externalsConfig:externalsConfig
            })
    ]
})
```
# ts issue

![ts issue](https://raw.githubusercontent.com/UzumakiHan/static-files/master/images/auto-externals/vite-issue.png)

可以使用`//@ ts ignore` 忽略

![ts issue](https://raw.githubusercontent.com/UzumakiHan/static-files/master/images/auto-externals/vite-issue-fixed.png)



# effect

build your project

```bash
npm run build
```

未使用 before use hfex-auto-externals-plugin

该项目的包装体积效果图如下

![before build bundle](https://raw.githubusercontent.com/UzumakiHan/static-files/master/images/auto-externals/vite-before-bundle.png)


使用 after use hfex-auto-externals-plugin

该项目的包装体积效果图如下

![after build bundle](https://raw.githubusercontent.com/UzumakiHan/static-files/master/images/auto-externals/vite-after-bundle.png)

![after build net](https://raw.githubusercontent.com/UzumakiHan/static-files/master/images/auto-externals/vite-after-net.png)

![after build sourse](https://raw.githubusercontent.com/UzumakiHan/static-files/master/images/auto-externals/vite-after-sourse.png)


显然，打包项目的体积已经大幅下降


</details>




# parameter

|   Prop    |   Type    |   Default  |   description    |   required    |
|  ----  | ----  |  ----  | ----  |  ----  | 
|   externalsConfig |   Array<{name:string;exposedField:string;packageLink:string}>  |   []   |  externalsConfig    |   true   |

## License

[MIT](LICENSE).