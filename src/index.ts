import '@zenweb/log';
import { Context, SetupFunction } from '@zenweb/core';
import * as coBody from 'co-body';
import * as formidable from 'formidable';
import { parse as bytesParse } from 'bytes';
import { BaseOption, BodyOption, MultipartOption } from './types';
import { XMLParser } from 'fast-xml-parser';
export * from './types';

const defaultOption: BodyOption = {
  encoding: 'utf-8',
  limit: '1mb',
  json: true,
  form: true,
  text: true,
  xml: false,
  multipart: true,
  methods: ['POST', 'PUT', 'PATCH'],
};

type formidableResult = { fields: formidable.Fields, files: formidable.Files };

function formidableParse(ctx: Context, opt: MultipartOption): Promise<formidableResult> {
  const form = formidable(opt);
  return new Promise((resolve, reject) => {
    form.parse(ctx.req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
}

export default function setup(opt?: BodyOption): SetupFunction {
  opt = Object.assign({}, defaultOption, opt);
  const defaultBaseOption: BaseOption = {
    encoding: opt.encoding,
    limit: opt.limit,
  };
  if (opt.json) opt.json = Object.assign({ strict: true }, defaultBaseOption, opt.json);
  if (opt.form) opt.form = Object.assign({}, defaultBaseOption, opt.form);
  if (opt.text) opt.text = Object.assign({}, defaultBaseOption, opt.text);
  if (opt.multipart) {
    opt.multipart = Object.assign({
      encoding: opt.encoding,
      maxFieldsSize: bytesParse(opt.limit),
    }, opt.multipart);
  }
  if (opt.xml) {
    var xmlparser = new XMLParser(typeof opt.xml === 'object' ? opt.xml : undefined);
    var xmlBaseOption = Object.assign({}, defaultBaseOption, opt.xml);
  }
  return function body(setup) {
    setup.debug('option: %o', opt);
    setup.checkContextProperty('log');
    setup.middleware(async function body(ctx, next) {
      if (opt.methods.includes(ctx.method.toUpperCase())) {
        try {
          if (typeof opt.json === 'object' && ctx.is('json')) {
            ctx.request.body = await coBody.json(ctx, opt.json);
            ctx.request.bodyType = 'json';
          }
          else if (typeof opt.form === 'object' && ctx.is('urlencoded')) {
            ctx.request.body = await coBody.form(ctx, opt.form);
            ctx.request.bodyType = 'form';
          }
          else if (xmlparser && ctx.is('xml', 'text/xml')) {
            ctx.request.body = xmlparser.parse(await coBody.text(ctx, xmlBaseOption));
            ctx.request.bodyType = 'xml';
          }
          else if (typeof opt.text === 'object' && ctx.is('text/*')) {
            ctx.request.body = await coBody.text(ctx, opt.text);
            ctx.request.bodyType = 'text';
          }
          else if (typeof opt.multipart === 'object' && ctx.is('multipart')) {
            const { fields, files } = await formidableParse(ctx, opt.multipart);
            ctx.request.body = fields;
            ctx.request.files = files;
            ctx.request.bodyType = 'multipart';
          } else {
            ctx.request.body = {};
            ctx.request.bodyType = 'none';
          }
        } catch (err) {
          ctx.log.child({ err }).error('request body error');
          ctx.status = 415;
          ctx.body = 'request body error';
          return;
        }
      }
      return next();
    });
  }
}

declare module 'koa' {
  interface Request {
    body: any;
    bodyType: 'json' | 'form' | 'xml' | 'text' | 'multipart' | 'none';
    files: formidable.Files;
  }
}
