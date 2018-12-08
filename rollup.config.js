import excludePeerDeps from 'rollup-plugin-peer-deps-external';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' }
  ],
  plugins: [
    excludePeerDeps(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
