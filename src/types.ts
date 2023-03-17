import { scope } from '@zenweb/inject';
import { RawBodyParser, TextBodyParser } from './parse';

export interface BodyParserClass {
  new (): RawBodyParser | TextBodyParser;
}

/**
 * Body 解析配置
 */
export interface BodyOption {
  /**
   * 默认编码
   * @default 'utf-8'
   */
  encoding?: string;

  /**
   * 大小限制 bytes
   * @default 1024 * 1024
   */
  limit?: number;

  /**
   * 是否支持压缩内容
   * @default true
   */
  inflate?: boolean;

  /**
   * 支持解析为文本的类型
   * @default ['text/*', 'json', '+json', 'xml', '+xml', 'urlencoded']
   */
  textTypes?: string[];

  /**
   * 数据解析器
   * @default [JSONParser, URLEncodedParser]
   */
  parses?: BodyParserClass[];
}

/**
 * Body 解析配置
 */
@scope('singleton')
export class BodyOption implements BodyOption {
  // 影子类，注入识别使用
}
