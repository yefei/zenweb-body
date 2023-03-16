import { Context } from '@zenweb/core';
import { init, inject, scope } from '@zenweb/inject';
import { TypeCastHelper } from '@zenweb/helper';
import * as querystring from 'querystring';
import * as iconv from 'iconv-lite';
import * as httpError from 'http-errors';
import { BodyOption, BodyType } from './types';
import { TypeCastPickOption } from 'typecasts';
import { streamReader } from './read';

// Allowed whitespace is defined in RFC 7159
// http://www.rfc-editor.org/rfc/rfc7159.txt
const strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/;

/**
 * 原始请求内容-经过解压，未经过文字编码转换
 */
@scope('request')
export class RawBody {
  data?: Buffer;

  @init
  private async [Symbol()](option: BodyOption, ctx: Context) {
    if (ctx.request.length === 0) {
      return;
    }
    this.data = await streamReader(ctx, option.limit, option.inflate);
  }
}

/**
 *  文本内容，经过文字编码转换
 */
@scope('request')
export class TextBody {
  data?: string;

  // 先检查类型
  @init
  private [Symbol()](option: BodyOption, ctx: Context) {
    if (option.textTypes && !ctx.is(...option.textTypes)) {
      throw httpError(415, 'unsupported type "' + ctx.request.type + '"', {
        type: 'type.unsupported',
      });
    }
  }

  // 再解析数据
  @init
  private async [Symbol()](option: BodyOption, ctx: Context, raw: RawBody) {
    if (!raw.data) {
      return;
    }
    const encoding = ctx.request.charset || option.encoding || 'utf-8';
    if (!iconv.encodingExists(encoding)) {
      throw httpError(415, 'unsupported charset "' + encoding.toUpperCase() + '"', {
        charset: encoding.toLowerCase(),
        type: 'charset.unsupported',
      });
    }
    try {
      this.data = iconv.decode(raw.data, encoding);
    } catch {
      throw httpError(400, 'decode charset failed', {
        charset: encoding.toLowerCase(),
        type: 'decode.failed',
      });
    }
  }
}

/**
 * 请求 Body 数据解析
 * - 解析异常则会抛出: `body.parse-error`
 */
@scope('request')
export class Body {
  /**
   * 解析出的数据
   */
  data?: unknown;

  /**
   * 数据类型
   */
  type!: BodyType;

  @init
  private async [Symbol()](opt: BodyOption, ctx: Context, text: TextBody) {
    if (!text.data) {
      this.type = 'none';
      return;
    }
    if (opt.json && ctx.is('json')) {
      if (!strictJSONReg.test(text.data)) {
        throw httpError(415, 'invalid JSON, only supports object and array', {
          type: 'json.strict',
        });
      }
      this.data = JSON.parse(text.data);
      this.type = 'json';
    } else if (opt.form && ctx.is('urlencoded')) {
      this.data = querystring.parse(text.data);
      this.type = 'form';
    } else {
      this.data = text.data;
      this.type = 'text';
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
  private async [Symbol()](body: Body) {
    if (body.type === 'text') {
      throw httpError(400, 'only supports JSON or form-urlencoded', {
        type: 'object.only',
      });
    }
    if (body.data) {
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
