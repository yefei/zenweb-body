import * as Koa from 'koa';
import { Core } from '@zenweb/core';
import { Files } from 'formidable';

interface BaseOption {
  /** 编码，默认: 'utf8' */
  encoding?: string;

  /** 大小限制，默认: 1mb */
  limit?: string;
}

interface JsonOption extends BaseOption {
  /** 严格模式, 根必须为 {} 或 []，默认: true */
  strict?: boolean;
}

interface FormOption extends BaseOption {}
interface TextOption extends BaseOption {}

interface MultipartOption {

}

type Method = string | 'POST' | 'PUT' | 'PATCH' | 'GET' | 'HEAD' | 'DELETE';

export interface BodyOption {
  /** 解析 json 请求，默认 true */
  json?: JsonOption | boolean;

  /** 解析表单请求，默认 true */
  form?: FormOption | boolean;

  /** 解析文本请求，默认 true */
  text?: TextOption | boolean;

  /** 支持上传文件，默认 true */
  multipart?: MultipartOption | boolean;

  /** 处理请求类型，默认 ['POST', 'PUT', 'PATCH'] */
  methods?: Method[];
}

const defaultOption: BodyOption = {
  json: true,
  form: true,
  text: true,
  multipart: true,
  methods: ['POST', 'PUT', 'PATCH'],
};

const defaultBaseOption: BaseOption = {
  encoding: 'utf8',
  limit: '1mb',
};

function body(opt?: BodyOption) {
  opt = Object.assign({}, defaultOption, opt);
  const disabled = !opt.form && !opt.json && !opt.text && !opt.multipart;
  return function body(ctx: Koa.Context, next: Koa.Next) {
    if (disabled) {
      return next();
    }
    if (opt.methods.includes(ctx.method.toUpperCase())) {
      if (opt.json && ctx.is('json')) {
        
      }
    }
  }
}

export function setup(core: Core, option?: BodyOption) {
  core.use(body(option));
}

declare module 'koa' {
  interface Request {
    body: any;
    files: Files;
  }
}
