
const path = require('path');

module.exports = {
    entry: "./frontend/index.js",
    output: {
        path: path.resolve(__dirname , 'frontend'),
        filename: 'index_bundle.js'
    },
    module: {
        rules: []  // TODO
    },
    plugins: [],  // TODO
    // mode: 'production'
    mode: 'development'
}

// module.exports = {
//     entry: "./debug/debug.js",
//     output: {
//         path: path.resolve(__dirname , 'debug'),
//         filename: 'debug_bundle.js'
//     },
//     module: {
//         rules: []  // TODO
//     },
//     plugins: [],  // TODO
//     // mode: 'production'
//     mode: 'development'
// }
