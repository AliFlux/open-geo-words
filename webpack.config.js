const path = require('path');

module.exports = {
    entry: './src/index.js',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'open-geo-words.js',
        globalObject: 'this',
        library: {
            name: 'open-geo-words',
            type: 'umd',
        },
    },
};