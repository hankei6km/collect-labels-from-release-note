import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'

const extensions = ['.ts', '.js']

export default {
  input: './src/index.ts',
  output: {
    file: './dist/index.js',
    format: 'iife',
    name: '_entry_point_'
    //exports: 'default'
  },
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json'
    }),
    nodeResolve({ extensions }),
    commonjs({})
  ]
}
