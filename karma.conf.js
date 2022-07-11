module.exports = function (config) {
    config.set({
        browsers: ['ChromeHeadless'],
        browserify: {
            debug: true,
        },
        frameworks: [
            'mocha',
            'karma-typescript',
        ],
        files: [
            { pattern: 'node_modules/expect.js/index.js' },
            { pattern: 'src/**/*.ts' },
            { pattern: 'test/**/*.ts' },
            {
                pattern: 'build/foo.worker.js',
                included: false,
                served: true,
            },
        ],
        preprocessors: {
            'src/**/*.ts': [
                'karma-typescript',
            ],
            'test/**/*.ts': [
                'karma-typescript',
            ],
        },
        singleRun: true,
    })
}
