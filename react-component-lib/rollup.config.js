import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default [
  {
    input: 'src/index.ts',
    external: Object.keys(pkg.peerDependencies || {}),
    plugins: [
      typescript({
        typescript: require('typescript'),
      }),
    ],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'esm' },
      { file: pkg.umd, format: 'umd', name: 'AlimeComponentEvaluate' },
      {
        file: 'example/src/reactComponentLib/index.js',
        format: 'es',
        banner: '/* eslint-disable */',
      },
    ],
  },
  {
    input: 'src/components/Comment/index.ts',
    external: Object.keys(pkg.peerDependencies || {}),
    plugins: [
      typescript({
        typescript: require('typescript'),
      }),
    ],
    output: [
      { file: pkg.main, format: 'cjs', file: 'dist/comment.cjs.js' },
      { file: pkg.module, format: 'esm', file: 'dist/comment.esm.js' },
      { file: pkg.umd, format: 'umd', name: 'AlimeComponentComment', file: 'dist/comment.umd.js' },
      {
        file: 'example/src/reactComponentLib/index.js',
        format: 'es',
        banner: '/* eslint-disable */',
      },
    ],
  },
  {
    input: 'src/components/Evaluate/index.ts',
    external: Object.keys(pkg.peerDependencies || {}),
    plugins: [
      typescript({
        typescript: require('typescript'),
      }),
    ],
    output: [
      { file: pkg.main, format: 'cjs', file: 'dist/evaluate.cjs.js' },
      { file: pkg.module, format: 'esm', file: 'dist/evaluate.esm.js' },
      { file: pkg.umd, format: 'umd', name: 'AlimeComponentEvaluate', file: 'dist/evaluate.umd.js' },
      {
        file: 'example/src/reactComponentLib/index.js',
        format: 'es',
        banner: '/* eslint-disable */',
      },
    ],
  },
];
