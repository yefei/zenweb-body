import { Core } from '@zenweb/core';
import * as koaBody from 'koa-body';
import { Files } from 'formidable';
export { IKoaBodyOptions as BodyOption } from 'koa-body';

export function setup(core: Core, options?: koaBody.IKoaBodyOptions) {
  core.use(koaBody(options));
}

declare module 'koa' {
  interface Request {
    // 不知为何 typescript 找不到 koa-body 中的 ts 定义，这里重复添加一下
    body?: any;
    files?: Files;
  }
}
