import { Context } from '@zenweb/core';
import { init, inject, scope } from '@zenweb/inject';
import { TypeCastHelper } from '@zenweb/helper';
import * as iconv from 'iconv-lite';
import * as httpError from 'http-errors';
import { BodyOption } from './types';
import { TypeCastPickOption } from 'typecasts';
import { streamReader } from './read';
import { BodyParser, RawBodyParser, TextBodyParser } from './parse';

/**
 * 原始请求内容-经过解压，未经过文字编码转换
 */
@scope('request')
export class RawBody {
  data?: Buffer;

  @init
  private async [Symbol()](option: BodyOption, ctx: Context) {
    if (!ctx.request.length) {
      return;
    }
    this.data = await streamReader(ctx, option.limit, option.inflate);
  }
}

/**
 * 文本内容，经过文字编码转换
 */
@scope('request')
export class TextBody {
  data?: string;

  // 再解析数据
  @init
  private async [Symbol()](option: BodyOption, ctx: Context) {
    // 是否是支持的类型
    if (!option.textTypes?.length || !ctx.is(option.textTypes)) {
      // throw httpError(415, 'unsupported type "' + ctx.request.type + '"', {
      //   type: 'type.unsupported',
      // });
      return;
    }
    // 是否满足编码转换
    const encoding = ctx.request.charset || option.encoding || 'utf-8';
    if (!iconv.encodingExists(encoding)) {
      throw httpError(415, 'unsupported charset "' + encoding.toUpperCase() + '"', {
        charset: encoding.toLowerCase(),
        type: 'charset.unsupported',
      });
    }
    // 读取数据
    const raw = await ctx.injector.getInstance(RawBody);
    if (!raw.data) {
      return;
    }
    // 编码转换
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
 * 请求 Body 数据解析 - 混合解析器
 */
@scope('request')
export class Body {
  /**
   * 解析出的数据
   */
  data?: unknown;

  /**
   * 数据类型
   * - 如果匹配解析器中支持的类型则返回匹配的类型
   * - 如果没有匹配的解析器，但是匹配了 `textTypes` 则统一为 `text` 类型
   * - 最后尝试解析为 `raw` 类型
   */
  type?: 'raw' | 'text' | string;

  /**
   * 匹配的解析器
   */
  parser?: BodyParser;

  @init
  private async [Symbol()](opt: BodyOption, ctx: Context) {
    // 匹配内容解析器
    if (opt.parses) {
      for (const parserClass of opt.parses) {
        const parser = await ctx.injector.getInstance(parserClass);
        const type = ctx.is(parser.types);
        if (type) {
          this.type = type;
          this.parser = parser;
          if (parser instanceof TextBodyParser) {
            const textBody = await ctx.injector.getInstance(TextBody);
            if (textBody.data) {
              this.data = await parser.parse(textBody.data);
            }
          } else if (parser instanceof RawBodyParser) {
            const rawBody = await ctx.injector.getInstance(RawBody);
            if (rawBody.data) {
              this.data = await parser.parse(rawBody.data);
            }
          }
          return;
        }
      }
    }

    // 没有匹配的解析器则尝试解析文本类型
    if (opt.textTypes && ctx.is(opt.textTypes)) {
      this.data = (await ctx.injector.getInstance(TextBody)).data;
      this.type = 'text';
      return;
    }

    // 否则解析为 Raw
    const raw = await ctx.injector.getInstance(RawBody);
    if (raw.data) {
      this.data = raw.data;
      this.type = 'raw';
    }
  }
}

/**
 * 请求 Body 数据解析为对象本身，请求内容必须为 json 或 form-urlencoded
 * - 注意：数据不是必须的，但是如果传递的数据是不能被正确解析为对象化的将会抛出异常
 */
@scope('request')
export class ObjectBody {
  [key: string]: unknown;

  @init
  private async [Symbol()](body: Body) {
    if (!body.data) return;
    if (!body.parser?.objected) {
      throw httpError(400, 'only supports objected format: JSON or urlencoded', {
        type: 'objected.only',
      });
    }
    Object.assign(this, body.data);
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
