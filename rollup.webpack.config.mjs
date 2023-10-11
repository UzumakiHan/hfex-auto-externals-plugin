import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import tsPlugin from "rollup-plugin-typescript2";
import json from '@rollup/plugin-json';
export default{
    input: 'src/webpack.ts',
    output: [
        {
            file:'dist/webpack/index.cjs',
            format: "cjs",
        },
        {
            file:'dist/webpack/index.mjs',
            format: "es",
        }
    ],
    plugins:[
        resolve(),
        babel({
            exclude: "**/node_modules/**"
        }),
        commonjs({
            ignoreDynamicRequires: true
            // dynamicRequireTargets: ['./src/cat']
        }),
        json(),
        tsPlugin(),
        terser(),
    ]
}