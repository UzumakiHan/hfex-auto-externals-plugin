/**
 * hfex-auto-externals-plugin
 * @author UzumakiHan
 */
import { createUnplugin } from 'unplugin';
import { Compiler } from 'webpack'
import { Plugin } from 'vite'

import fs from 'fs'
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { viteExternalsPlugin } from 'vite-plugin-externals'
const PLUGIN_NAME = 'hfex-auto-externals-plugin';
interface IPlugin {
    html: string;
    outputName: string;
    plugin: HtmlWebpackPlugin
}
interface IExternalItem {
    version: Array<string>; // 版本列表
    name: string; // 依赖包名
    _id: string; // id
    type: string; // 包类型
    packageInfo: Array<{ [name: string]: string }>; // 版本详细信息
    __v: number;
    packageLink: string; // 匹配完毕的版本链接
    styleLink: string; // 匹配完毕的样式链接
    exposedField: string; // 匹配完毕的暴露变量名
}
interface IPackageInfo {
    version: string;
    packageLink: string;
    exposedField: string;

}
interface IExternalsConfig {
    name: string;
    exposedField: string;
    packageLink: string;
}

interface IPluginOptions {
    externalsConfig?: Array<IExternalsConfig>;
    engineeringFlag?: Boolean;
}
const getPackageJsonInfo = (pkgName: string, cwd = process.cwd()) => {
    let pkgDir, packageJsonPath;
    try {
        pkgDir = require.resolve(pkgName, {
            paths: [cwd]
        });
    } catch (err) {
        console.error(err);
    }
    if (!pkgDir) {
        return null;
    }
    pkgDir = path.dirname(pkgDir);
    let oldPkgDir = pkgDir;
    while (true) {
        packageJsonPath = path.join(pkgDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            break;
        }
        oldPkgDir = pkgDir;
        pkgDir = path.dirname(pkgDir);
        if (pkgDir === oldPkgDir) {
            packageJsonPath = undefined;
            break;
        }
    }
    if (!packageJsonPath) {
        return null;
    }
    return path.dirname(packageJsonPath);
};
function checkExternalConfiguration() {
    const modPath = path.join(process.cwd(),
        'node_modules/hfex-external-configuration');
    const pnpmLockPath = path.join(process.cwd(), 'pnpm-lock.yaml');
    const cliCommand = fs.existsSync(pnpmLockPath) ? 'npx pnpm add' : 'npm install';
    if (!fs.existsSync(modPath)) {
        console.info(
            `[externals-plugin] ⬇️ 检测到未安装hfex-external-configuration，正在自动安装...`
        );
        require('shelljs').exec(`${cliCommand} hfex-external-configuration --save-dev`, {
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
    const externalList: Array<IExternalsConfig> = [];
    const pkgDependencies: Array<[string, string]> = Object.entries(pkgInfo.dependencies)
    pkgDependencies.forEach(([name, ver]) => {
        const dependence = packageVerList.find((v: IExternalItem) => {
            return name === v.name;
        });
        if (!dependence) {
            return;
        }
        const verItem = dependence.packageInfo.find((v: IPackageInfo) => ver === v.version);
        if (verItem && verItem.packageLink && verItem.exposedField) {
            
            externalList.push({
                name,
                packageLink: verItem.packageLink,
                exposedField: verItem.exposedField
            });
        }
    });
    return externalList
}

 function handleJudgeViteOrWebpack(){
    // const packageJsonPath = await findUp('package.json');
    const packageJsonPath =path.join(process.cwd(), 'package.json')
    
    
    if (!packageJsonPath) {
        return false
    }
    const devDependencies = require(packageJsonPath).devDependencies;
    return devDependencies.vite
}
export function HfexAutoExternalsPlugin() {
    return createUnplugin((options = {}) => {
        const configOption = options as IPluginOptions
        let viteExternalsPluginConfig={} as any;
        let viteJsExternalsScript=''
        let viteExternalsPluginFn  = {} as Plugin
        const isVite = handleJudgeViteOrWebpack();
        if(isVite){
            configOption.externalsConfig?.forEach((pck: IExternalsConfig)=>{
                viteExternalsPluginConfig[pck.name] = pck.exposedField
                viteJsExternalsScript += `<script crossorigin="anonymous" src="${pck.packageLink}"></script>\n\r  `
            })
            viteExternalsPluginFn = viteExternalsPlugin({...viteExternalsPluginConfig})
        }
      
      
        if (configOption?.engineeringFlag) {
            checkExternalConfiguration()
        }
        return {
            name: PLUGIN_NAME,
            enforce: 'post',
            apply: 'build',
            webpack(compiler: Compiler) {

                const envMode = compiler.options.mode
                if (envMode === 'production') {
                    const autoExternals: any = {}
                    const externalsList = configOption?.engineeringFlag ? resolveExternalList() : configOption?.externalsConfig || []
                    let jsExternalsScript = ''
                    externalsList.forEach((pck: IExternalsConfig) => {
                        autoExternals[pck.name] = pck.exposedField
                        jsExternalsScript += `<script crossorigin="anonymous" src="${pck.packageLink}"></script>\n\r  `
                    })
                    compiler.options.externals = Object.assign({}, compiler.options.externals || {}, autoExternals)
                    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
                        require('html-webpack-plugin').getHooks(compilation).beforeEmit.tapAsync(PLUGIN_NAME, (htmlPluginData: IPlugin, callback: Function) => {
                            htmlPluginData.html = htmlPluginData.html.replace(/<body>([.\n\r\s\S]*?)(<script|<\/body)/g, `<body>$1${jsExternalsScript}$2`)
                            callback();
                        })
                    })
                }
            },
            vite:{
                config: viteExternalsPluginFn.config,
                transform: viteExternalsPluginFn.transform,
                transformIndexHtml: {
                    enforce: 'post',
                    transform(html) {
                      return html.replace(/<body>([.\n\r\s\S]*?)(<script|<\/body)/g, `<body>$1${viteJsExternalsScript}$2`)
                    }
                  }
            }
        }
    })
}
