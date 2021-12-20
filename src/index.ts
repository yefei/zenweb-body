import { Core } from '@zenweb/core';
import * as koaBody from 'koa-body';
export { IKoaBodyOptions as BodyOption } from 'koa-body';

export function setup(core: Core, options?: koaBody.IKoaBodyOptions) {
  core.use(koaBody(options));
}
