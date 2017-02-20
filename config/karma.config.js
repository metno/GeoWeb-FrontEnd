const argv = require('yargs').argv;
const project = require('./project.config');
const webpackConfig = require('./webpack.config');
const debug = require('debug')('app:config:karma');

debug('Creating configuration.');
const karmaConfig = {
  basePath : '../', // project root in relation to bin/karma.js

  // only use PhantomJS for our 'test' browser
  browsers: ['jsdom'],

  // just run once by default unless --watch flag is passed
  singleRun: !argv.watch,

  // which karma frameworks do we want integrated
  frameworks: ['mocha', 'chai'],

  // displays tests in a nice readable format
  reporters: ['spec', 'coverage'],

  // include some polyfills
  files: [
    'node_modules/babel-polyfill/dist/polyfill.js',
    './node_modules/phantomjs-polyfill/bind-polyfill.js',
    // './src/test/*.js',
    './src/**/*.spec.js' // specify files to watch for tests
  ],
  preprocessors : {

    // these files we want to be precompiled with webpack
    // also run tests through sourcemap for easier debugging
    './src/**/*.spec.js': ['webpack'],
    './src/test/*.js': ['webpack'],
    './src/**/*.js': ['webpack', 'sourcemap', 'coverage']
  },
  webpack  : {
    devtool: 'inline-source-map',

    resolve: Object.assign({}, webpackConfig.resolve, {

      // required for enzyme to work properly
      alias: {
        'sinon': 'sinon/pkg/sinon'
      }
    }),
    module: Object.assign({}, webpackConfig.module, {

      // don't run babel-loader through the sinon module
      noParse: [
        /node_modules\/sinon\//
      ]
    }),

    // required for enzyme to work properly
    externals: Object.assign({}, webpackConfig.externals, {
      'jsdom': 'window',
      'cheerio': 'window',
      'react/lib/ExecutionEnvironment': true,
      'react/lib/ReactContext': 'window'
    })
  },
  webpackMiddleware : {
    noInfo : true
  },

  plugins: Object.assign([], webpackConfig.plugins, [
    'karma-mocha',
    'karma-chai',
    'karma-webpack',
    'karma-coverage',
    'karma-phantomjs-launcher',
    'karma-jsdom-launcher',
    'karma-chrome-launcher',
    'karma-spec-reporter',
    'karma-sourcemap-loader',
    'karma-babel-preprocessor'
  ]),

  coverageReporter : {
    dir: 'coverage',
    reporters : project.coverage_reporters
  }
};
module.exports = (cfg) => cfg.set(karmaConfig);
