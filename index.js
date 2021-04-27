'use strict';

const koaBody = require('koa-body');

/**
 * @param {import('@zenweb/core').Core} core 
 * @param {*} [options]
 */
function setup(core, options) {
  core.koa.use(koaBody(options));
}

module.exports = {
  setup,
};
