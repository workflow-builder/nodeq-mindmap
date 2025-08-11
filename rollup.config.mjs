
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { builtinModules } from 'module';

const externalDeps = [
  ...builtinModules,
  ...builtinModules.map(m => `node:${m}`), // node: specifiers
  'd3', '@tensorflow/tfjs', 'jsdom', 'commander', // npm dependencies
];

export default [
  // Main library build
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named'
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm'
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'NodeQMindMap',
        globals: {
          'd3': 'd3'
        }
      }
    ],
    external: ['d3'],
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs(),
      typescript({
        declaration: true,
        declarationDir: 'dist'
      })
    ]
  },
  // CLI build
  {
    input: 'src/cli.ts',
    output: {
      file: 'dist/cli.js',
      format: 'cjs',
      banner: '#!/usr/bin/env node'
    },
    external: externalDeps,
    plugins: [
      nodeResolve({
        preferBuiltins: true,
        browser: false
      }),
      commonjs(),
      typescript()
    ]
  }
];
