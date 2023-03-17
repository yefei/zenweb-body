import { SetupFunction } from '@zenweb/core';
import { JSONParser, RawBodyParser, TextBodyParser, URLEncodedParser } from './parse';
import { BodyOption, LOADED_PARSES } from './types';
export * from './types';
export * from './body';
export * from './parse';

const defaultOption: BodyOption = {
  encoding: 'utf-8',
  limit: 1024 * 1024,
  inflate: true,
  textTypes: ['text/*', 'xml', '+xml'],
  parses: [JSONParser, URLEncodedParser],
};

export default function setup(opt?: BodyOption): SetupFunction {
  opt = Object.assign({}, defaultOption, opt);
  return function body(setup) {
    setup.debug('option: %o', opt);
    setup.assertModuleExists('inject');
    setup.assertModuleExists('result');
    setup.assertModuleExists('helper');
    setup.core.injector.define(BodyOption, opt);
    // 在初始化后期执行解析器载入工作，方便其他模块添加解析器
    setup.after(() => {
      // 载入解析器
      if (opt?.parses) {
        if (!opt.textTypes) opt.textTypes = [];
        opt[LOADED_PARSES] = [];
        for (const parserClass of opt.parses) {
          setup.debug('init parser: %o', parserClass);
          const parser = new parserClass(opt);
          if (parser instanceof TextBodyParser) {
            setup.debug('add textTypes: %o', parser.types);
            for (const type of parser.types) {
              if (!opt.textTypes.includes(type)) {
                opt.textTypes.push(type);
              }
            }
          } else if (parser instanceof RawBodyParser) {
          } else {
            throw new Error('unknonw parser type: ' + parser);
          }
          opt[LOADED_PARSES].push(parser);
        }
        setup.debug('all textTypes: %o', opt.textTypes);
      }
    });
  }
}
