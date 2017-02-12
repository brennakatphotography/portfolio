const babelify = require('babelify');
const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const del = require('del');
const exec = require('child_process').exec;
const gulp = require('gulp');
const gulpBabel = require('gulp-babel');
const minifyCSS = require('gulp-clean-css');
const minifyJS = require('gulp-uglify');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const streamify = require('gulp-streamify');
const { babelifyConfig, browserifyConfig, browserSyncConfig } = require('./configs');
const { buildOnly, errorReporter, getArg, logIf } = require('./utils');
const subProcess = require('./process');

const SERVER_PORT = 8080;
const SIM_PORT = 3000;

const SIM_DIR = getArg('simulator');
const server = subProcess({ cwd: '.', port: SERVER_PORT, cmd: 'node', args: ['ui-server/server/build/server.js'] });
const simulator = subProcess({ cwd: SIM_DIR, port: SIM_PORT, cmd: 'rackup', args: ['-p', SIM_PORT] });

const browserInit = () => {
  if (SIM_DIR) {
    return [['transpile', 'server:run', 'simulator:watch'], browserSyncInit];
  }
  return [['transpile', 'server:run'], browserSyncInit];
};

const browserSyncInit = () => {
  exec(`open http://localhost:${SERVER_PORT}`);
  browserSync.init(browserSyncConfig)
};

const jsTranspileClient = (config = {}) => () => {
  return browserify(browserifyConfig)
    .transform(babelify.configure(babelifyConfig))
    .bundle()
    .on('error', errorReporter(config))
    .pipe(source('app.js'))
    .pipe(buildOnly(config.build, streamify, minifyJS()))
    .pipe(gulp.dest('client/build/js'));
};

const sassTranspile = (config = {}) => () => {
  return gulp.src('client/src/scss/main.scss')
    .pipe(sass().on('error', errorReporter(config)))
    .pipe(buildOnly(config.build, minifyCSS))
    .pipe(gulp.dest('client/build/css'));
};

const refreshBrowser = () => {
  return gulp.watch(['server/src/**/*.*'], [browserSync.reload]);
};

const run = ({ cb, name, port, proc }) => done => {
  proc.run(done)
    .on('exit', status => {
      if (status) {
        console.error(`${name} failed to come up on port ${port}`);
        if (cb) cb(status);
      }
    }).on('stdout', message => logIf(name, message))
    .on('error', console.error);
};

const runServer = run({ name: 'SERVER', port: SERVER_PORT, proc: server });

const runSimulator = run({ name: 'SIMULATOR', port: SIM_PORT, proc: simulator, cb: process.abort });

const watchSimulator = () => {
  return gulp.watch(`${SIM_DIR}/**/*.*`, ['simulator:run', browserSync.reload]);
};

module.exports = {
  'browser:init': browserInit(),
  'build': [['clean'], () => gulp.start(['js:buildClient', 'sass:build'])],
  'clean': [['js:clean', 'css:clean']],
  'css:clean': [() => del('client/build/css')],
  'dev': [['server'], () => gulp.start(['js:watchClient', 'sass:watch'])],
  'js:clean': [() => del('client/build/js')],
  'js:buildClient': [jsTranspileClient({ build: true })],
  'js:transpileClient': [jsTranspileClient()],
  'js:watchClient': [() => gulp.watch('client/src/js/**/*.js', ['js:transpileClient'])],
  'sass:build': [sassTranspile({ build: true })],
  'sass:transpile': [sassTranspile()],
  'sass:watch': [() => gulp.watch('client/src/scss/**/*.scss', ['sass:transpile'])],
  'server': [['browser:init'], refreshBrowser],
  'server:run': [runServer],
  'simulator:run': SIM_DIR && [runSimulator],
  'simulator:watch': SIM_DIR && [['simulator:run'], watchSimulator],
  'transpile': [['js:transpileClient','sass:transpile', 'js:watchClient', 'sass:watch']]
};
