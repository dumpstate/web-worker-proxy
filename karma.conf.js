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
            { pattern: 'src/**/*.ts' },
            { pattern: 'node_modules/expect.js/index.js' },
            { pattern: 'test/**/*.test.ts' },
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
            'test/**/*.test.ts': [
                'karma-typescript',
            ],
        },
        singleRun: true,
    })
}
