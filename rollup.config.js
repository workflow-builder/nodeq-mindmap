import typescript from '@rollup/plugin-typescript';

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
      typescript({
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src'
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
    external: ['commander', 'fs', 'd3', '@tensorflow/tfjs'],
    plugins: [
      typescript({
        declaration: false
      })
    ]
  }
];