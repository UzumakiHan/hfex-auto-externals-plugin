


const path = require('path')
const fs = require('fs')
// const {chalk} = require('chalk')
const shelljs = require('shelljs')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const { createUnplugin } = require('unplugin')
const PLUGIN_NAME = 'auto-externals-plugin';

function checkExternalConfiguration() {
    const modPath = path.join(process.cwd(),
        'node_modules/hfex-external-configuration');
    const pnpmLockPath = path.join(process.cwd(), 'pnpm-lock.yaml');
    const cliCommand = fs.existsSync(pnpmLockPath) ? 'npx pnpm add' : 'npm install';
    if (!fs.existsSync(modPath)) {
        console.info(
            `${'[externals-plugin] ⬇️ 检测到未安装hfex-external-configuration，正在自动安装...'}`
        );
        shelljs.exec(`${cliCommand} hfex-external-configuration --save-dev`, {
            cwd: process.cwd(),
            silent: true
        });
    }
}
function resolveExternalList() {
    const packageVerList = require(path.join(
        process.cwd(),
        'node_modules/hfex-external-configuration'
    ));
    const pkgInfo = require(path.join(
        process.cwd(),
        'package.json'
    ));
    if (!packageVerList || packageVerList.length <= 0) {
        return [];
    }
    const externalList = []
    const pkgDependencies = Object.entries(pkgInfo.dependencies)
    pkgDependencies.forEach(([name, ver]) => {
        const dependence = packageVerList.find(v => {
            return name === v.name;
        });
        if (!dependence) {
            return;
        }
        const verItem = dependence.packageInfo.find(v => ver === v.version);
        if (verItem && verItem.packageLink && verItem.exposedField) {
            externalList.push({
                ...dependence,
                packageLink: verItem.packageLink,
                exposedField: verItem.exposedField
            });
        }
    });
    return externalList
}

function HfexAutoExternalsPlugin() {
    // checkExternalConfiguration();
    return createUnplugin(() => {
        return {
            name: PLUGIN_NAME,
            enforce: 'pre',
            webpack(compiler) {
                const envMode = compiler.options.mode
                if (envMode !== 'production') {
                    const autoExternals = {}
                    const externalsList = resolveExternalList()

                    let jsExternalsScript = ''
                    externalsList.forEach(pck => {
                        autoExternals[pck.name] = pck.exposedField
                        jsExternalsScript += `<script crossorigin="anonymous" src="${pck.packageLink}"></script>\n\r  `

                    })

                    compiler.options.externals = Object.assign({}, compiler.options.externals || {}, autoExternals)

                    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
                        console.log(`HtmlWebpackPlugin`)
                        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(PLUGIN_NAME, (htmlPluginData, callback) => {
                           

                            htmlPluginData.html = htmlPluginData.html.replace(/<body>([.\n\r\s\S]*?)(<script|<\/body)/g, `<body>$1${jsExternalsScript}$2`)
                            console.log(htmlPluginData.html)
                            callback();
                        })
                    })
                }



            }
        }
    })
}
const webpack = HfexAutoExternalsPlugin().webpack;

module.exports = webpack;


