import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

// Add here external dependencies that actually you use.
const globals = {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    'rxjs/Observable': 'Rx',
    'rxjs/Observer': 'Rx',
    'rxjs/add/operator/map': 'Rx'
};

export default {
    entry: './dist/modules/seguranca.es5.js',
    dest: './dist/bundles/seguranca.umd.js',
    format: 'umd',
    exports: 'named',
    moduleName: 'ng.segucanra',
    plugins: [resolve(), commonjs()],
    external: Object.keys(globals),
    globals: globals,
    onwarn: () => { return }
}