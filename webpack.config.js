const currentTask = process.env.npm_lifecycle_event;
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fse = require('fs-extra');

const postCSSPlugins = [
    require('postcss-import'),
    require('postcss-mixins'),
    require('postcss-simple-vars')({ silent: true }),
    require('postcss-nested'),
    require('autoprefixer'),
];

//copy images from app directory and paste it to the build folder called 'docs'
class RunAfterCompile {
    apply(compiler) {
        compiler.hooks.done.tap('Copy images', function () {
            fse.copySync('./app/assets/images', './docs/assets/images');
        });
    }
}

//save css configuration in a variable
let cssConfig = {
    test: /\.css$/i,
    use: [
        'css-loader',
        {
            loader: 'postcss-loader',
            options: {
                postcssOptions: { plugins: postCSSPlugins },
            },
        },
    ],
};

//check app folder, filter it and find html pages only then map thru those html pages and use HtmlWebpackPlugin on each page
let pages = fse
    .readdirSync('./app')
    .filter(function (file) {
        return file.endsWith('.html');
    })
    .map(function (page) {
        return new HtmlWebpackPlugin({
            filename: page,
            template: `./app/${page}`,
        });
    });

//shared config object
let config = {
    entry: './app/assets/scripts/App.js',
    plugins: pages,
    module: {
        rules: [
            cssConfig,
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react', '@babel/preset-env'],
                    },
                },
            },
        ],
    },
};

if (currentTask == 'dev') {
    cssConfig.use.unshift('style-loader');
    (config.output = {
        filename: 'bundled.js',
        path: path.resolve(__dirname, 'app'),
    }),
        (config.devServer = {
            watchFiles: ['./app/**/*.html'],
            static: {
                directory: path.join(__dirname, 'app'),
            },
            hot: true,
            port: 3000,
            host: '0.0.0.0',
        }),
        (config.mode = 'development');
}

if (currentTask == 'build') {
    cssConfig.use.unshift(MiniCssExtractPlugin.loader);
    (config.output = {
        filename: '[name].[chunkhash].js',
        chunkFilename: '[name].[chunkhash].js',
        path: path.resolve(__dirname, 'docs'),
    }),
        (config.mode = 'production'),
        (config.optimization = {
            splitChunks: { chunks: 'all' },
            minimize: true,
            minimizer: [`...`, new CssMinimizerPlugin()],
        }),
        config.plugins.push(new CleanWebpackPlugin(), new MiniCssExtractPlugin({ filename: 'styles.[chunkhash].css' }), new RunAfterCompile());
}

module.exports = config;
