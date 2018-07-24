module.exports = (config) => {
    config.set({
        basePath:  __dirname,
        frameworks: ['jasmine'],
        preprocessors: {
            "src/**/*.spec.ts": ["webpack", "sourcemap"]
        },
        mime: {
            'text/x-typescript': ['ts', 'tsx']
        },
        files: [
            { pattern: 'src/**/*.spec.ts', watched: false },
            'node_modules/reflect-metadata/Reflect.js',
        ],
        webpack: {
            resolve: {
                extensions: [".ts", ".js", "*"]
            },
            module: {
                rules: [
                    { test: /\.tsx?$/,
                      exclude: /node_modules/,
                      loader: "ts-loader"
                    }
                ]
            }
        },
        webpackMiddleware: {
            stats: 'errors-only'
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ["Chrome"],
        singleRun: false,
        concurrency: Infinity
    })
}