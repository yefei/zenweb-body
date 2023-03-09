/// <reference types="@zenweb/result" />
import { Context } from '@zenweb/core';
import { init, scope } from '@zenweb/inject';
import * as coBody from 'co-body';
import { BodyOption, BodyType } from './types';

/**
 * 请求 Body 数据解析
 */
@scope('request')
export class Body {
  /**
   * 数据
   */
  data: any;

  /**
   * 数据类型
   */
  type: BodyType;

  @init
  private async parse(option: BodyOption, ctx: Context) {
    try {
      const result = await parseBody(option, ctx);
      this.data = result.data;
      this.type = result.type;
    } catch (err) {
      ctx.fail({
        code: option.errorCode,
        status: option.errorStatus,
        message: option.errorMessage,
      });
    }
  }
}

/**
 * 解析 body
 */
export async function parseBody(opt: BodyOption, ctx: Context): Promise<{ data: any, type: BodyType }> {
  if (typeof opt.json === 'object' && ctx.is('json')) {
    return {
      data: await coBody.json(ctx, opt.json),
      type: 'json',
    };
  }
  if (typeof opt.form === 'object' && ctx.is('urlencoded')) {
    return {
      data: await coBody.form(ctx, opt.form),
      type: 'form',
    };
  }
  if (typeof opt.text === 'object' && ctx.is('text/*')) {
    return {
      data: await coBody.text(ctx, opt.text),
      type: 'text',
    };
  }
  return { data: {}, type: 'unknown' };
}
