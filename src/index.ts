import { SetupFunction } from '@zenweb/core';
import { BaseOption, BodyOption } from './types';
export * from './types';
export * from './body';

const defaultOption: BodyOption = {
  encoding: 'utf-8',
  limit: '1mb',
  json: true,
  form: true,
  text: true,
  errorStatus: 412,
  errorMessage: 'request body error',
};

export default function setup(opt?: BodyOption): SetupFunction {
  opt = Object.assign({}, defaultOption, opt);
  const defaultBaseOption: BaseOption = {
    encoding: opt.encoding,
    limit: opt.limit,
  };
  if (opt.json) opt.json = Object.assign({ strict: true }, defaultBaseOption, opt.json);
  if (opt.form) opt.form = Object.assign({}, defaultBaseOption, opt.form);
  if (opt.text) opt.text = Object.assign({}, defaultBaseOption, opt.text);
  return function body(setup) {
    setup.debug('option: %o', opt);
    setup.assertModuleExists('inject');
    setup.assertModuleExists('result');
    setup.core.injector.define(BodyOption, opt);
  }
}
