export default {
    input: 'index.js',
    output: {
        file: 'build/index.js',
        name: 'ModulePlugin',
        format: 'umd',
        sourcemap: true,
        globals: { 'rete': 'Rete' }
    },
    external: ['rete'],
    plugins: []
}