import * as httpError from 'http-errors';
import * as querystring from 'querystring';

/**
 * 请求数据解析器基类
 */
export abstract class BodyParser {
  /**
   * 是否为对象化的数据，可以被转换为 `ObjectBody`
   */
  abstract objected: boolean;

  /**
   * 支持的 mimetype 类型，使用 `ctx.is` 判断
   */
  abstract types: string[];

  /**
   * 解析处理方法
   */
  abstract parse(data: Buffer | string): unknown | Promise<unknown>;

  /**
   * 处理失败调用异常
   */
  fail(...args: httpError.UnknownError[]): never {
    throw httpError(...args);
  }
}

/**
 * 原始数据解析
 */
export abstract class RawBodyParser extends BodyParser {
  /**
   * 解析处理方法
   * @param data 原始数据
   */
  abstract parse(data: Buffer): unknown | Promise<unknown>;
}

/**
 * 文本数据解析 - 经过编码转换后的文本数据
 */
export abstract class TextBodyParser extends BodyParser {
  /**
   * 解析处理方法
   * @param text 编码转换后的文本数据
   */
  abstract parse(text: string): unknown | Promise<unknown>;
}

// Allowed whitespace is defined in RFC 7159
// http://www.rfc-editor.org/rfc/rfc7159.txt
const strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/;

/**
 * JSON 解析处理
 */
export class JSONParser extends TextBodyParser {
  objected = true;
  types = ['json', '+json'];

  parse(text: string) {
    if (!strictJSONReg.test(text)) {
      this.fail(415, 'invalid JSON, only supports object or array', {
        type: 'json.strict',
      });
    }
    try {
      return JSON.parse(text);
    } catch (err: any) {
      this.fail(400, err.message, {
        type: 'json.parse-error',
      });
    }
  }
}

/**
 * form-urlencoded 表单解析
 */
export class URLEncodedParser extends TextBodyParser {
  objected = true;
  types = ['urlencoded'];

  parse(text: string) {
    return querystring.parse(text);
  }
}
