import { createUnplugin } from 'unplugin';
import HtmlWebpackPlugin from 'html-webpack-plugin'
import {Compiler} from 'webpack'
import fs from 'fs'
import path from 'path';
// import chalk from 'chalk'
import shelljs from 'shelljs';

const PLUGIN_NAME = 'hfex-auto-externals-plugin';
interface IExternalItem {
    version: Array<string>; // 版本列表
    name: string; // 依赖包名
    _id: string; // id
    type: string; // 包类型
    packageInfo: Array<{[name: string]: string}>; // 版本详细信息
    __v: number;
    packageLink: string; // 匹配完毕的版本链接
    styleLink: string; // 匹配完毕的样式链接
    exposedField: string; // 匹配完毕的暴露变量名
}
interface IPackageInfo{
    version: string;
    packageLink:string;
    exposedField:string;

}
function checkExternalConfiguration() {
    const modPath = path.join(process.cwd(),
        'node_modules/hfex-external-configuration');
    const pnpmLockPath = path.join(process.cwd(), 'pnpm-lock.yaml');
    const cliCommand = fs.existsSync(pnpmLockPath) ? 'npx pnpm add' : 'npm install';
    if (!fs.existsSync(modPath)) {
        console.info(
            `${(`${PLUGIN_NAME} ⬇️ 检测到未安装hfex-external-configuration，正在自动安装...`)}`
        );
        // shelljs.exec(`${cliCommand} hfex-external-configuration --save-dev`, {
        //     cwd: process.cwd(),
        //     silent: true
        // });
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
    const externalList: Array<IExternalItem> = [];
    const pkgDependencies: Array<[string, string]> = Object.entries(pkgInfo.dependencies)
    pkgDependencies.forEach(([name, ver]) => {
        const dependence = packageVerList.find((v:IExternalItem)=> {
            return name === v.name;
        });
        if (!dependence) {
            return;
        }
        const verItem = dependence.packageInfo.find((v:IPackageInfo) => ver === v.version);
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
export function HfexAutoExternalsPlugin() {
    checkExternalConfiguration();
    return createUnplugin(() => {
        return {
            name: PLUGIN_NAME,
            enforce: 'post',
            webpack(compiler:Compiler) {
                const envMode = compiler.options.mode
                if (envMode !== 'production') {
                    const autoExternals:any = {}
                    const externalsList = resolveExternalList()

                    let jsExternalsScript = ''
                    externalsList.forEach(pck => {
                        autoExternals[pck.name] = pck.exposedField
                        jsExternalsScript += `<script crossorigin="anonymous" src="${pck.packageLink}"></script>\n\r  `

                    })

                    compiler.options.externals = Object.assign({}, compiler.options.externals || {}, autoExternals)

                    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
console.log('PLUGIN_NAME-----------'+PLUGIN_NAME)
                        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(PLUGIN_NAME, (htmlPluginData, callback) => {
                            console.log('PLUGIN_NAMEeeeeeeeeeeeee-----------'+PLUGIN_NAME)

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
