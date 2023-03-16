import { SetupFunction } from '@zenweb/core';
import { BodyOption } from './types';
export * from './types';
export * from './body';

const defaultOption: BodyOption = {
  encoding: 'utf-8',
  limit: 1024 * 1024,
  inflate: true,
  text: ['text/*', 'json', 'application/xml', 'urlencoded'],
  json: true,
  form: true,
  errorStatus: 415,
};

export default function setup(opt?: BodyOption): SetupFunction {
  opt = Object.assign({}, defaultOption, opt);
  return function body(setup) {
    setup.debug('option: %o', opt);
    setup.assertModuleExists('inject');
    setup.assertModuleExists('result');
    setup.assertModuleExists('helper');
    setup.core.messageCodeResolver.assign(require('../message-codes.json'));
    setup.core.injector.define(BodyOption, opt);
  }
}
