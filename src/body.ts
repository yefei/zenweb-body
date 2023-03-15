/// <reference types="@zenweb/result" />
import { Context } from '@zenweb/core';
import { init, inject, scope } from '@zenweb/inject';
import { TypeCastHelper } from '@zenweb/helper';
import * as coBody from 'co-body';
import { BodyOption, BodyType } from './types';
import { TypeCastPickOption } from 'typecasts';

/**
 * 请求 Body 数据解析
 * - 解析异常则会抛出: `body.parse-error`
 */
@scope('request')
export class Body {
  /**
   * 数据
   */
  data!: unknown;

  /**
   * 数据类型
   */
  type!: BodyType;

  @init
  private async [Symbol()](option: BodyOption, ctx: Context) {
    try {
      const result = await parseBody(option, ctx);
      this.data = result.data;
      this.type = result.type;
    } catch (err) {
      ctx.fail({
        code: option.errorCode,
        status: option.errorStatus,
        message: ctx.core.messageCodeResolver.format('body.parse-error', { err }),
      });
    }
  }
}

/**
 * 请求 Body 数据解析为对象本身，请求内容必须为 json 或 form-urlencoded
 * - 注意：数据的解析并不要求客户端传递有效的头信息，如果客户端传递了有效的头信息但是内容没有被正确解析才会抛出异常，
 * 也就是说，客户端可以不传值，对象本身就是一个空对象
 * - 如果客户端传递了 text 类型，因为无法解析也会抛出异常: `body.type-not-object`
 */
@scope('request')
export class ObjectBody {
  [key: string]: unknown;

  @init
  private async [Symbol()](body: Body, ctx: Context, option: BodyOption) {
    if (body.type === 'text') {
      ctx.fail({
        code: option.errorCode,
        status: option.errorStatus,
        message: ctx.core.messageCodeResolver.format('body.type-not-object', { type: body.type }),
      });
    }
    if (body.type !== 'unknown') {
      Object.assign(this, body.data);
    }
  }
}

/**
 * ObjectBody 数据类型转换与校验
 */
@scope('request')
export class BodyHelper {
  @inject typeCastHelper!: TypeCastHelper;
  @inject data!: ObjectBody;

  get<O extends TypeCastPickOption>(fields: O) {
    return this.typeCastHelper.pick(this.data, fields);
  }
}

/**
 * 解析 body
 */
export async function parseBody(opt: BodyOption, ctx: Context): Promise<{ data: object | string, type: BodyType }> {
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
  if (typeof opt.text === 'object' && ctx.is('text/*', 'application/xml')) {
    return {
      data: await coBody.text(ctx, opt.text),
      type: 'text',
    };
  }
  return { data: {}, type: 'unknown' };
}
