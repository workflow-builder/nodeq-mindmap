import typescript from '@rollup/plugin-typescript';

// Library build (browser + Node)
const libConfig = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      exports: 'named'
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'NodeQMindMap',
      exports: 'named',
      globals: { 'd3': 'd3' }
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
};

// CLI build — standalone Node.js executable
const cliConfig = {
  input: 'src/cli.ts',
  output: {
    file: 'dist/cli.js',
    format: 'cjs',
    exports: 'none'
  },
  external: ['d3', 'fs', 'path', 'commander', 'jsdom'],
  plugins: [
    typescript({
      declaration: false,
      declarationMap: false,
      rootDir: 'src'
    })
  ]
};

export default [libConfig, cliConfig];
