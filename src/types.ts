import { scope } from '@zenweb/inject';

/**
 * 内容类型
 */
export type BodyType = 'json' | 'form' | 'text' | 'unknown' | 'none';

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
   * 如果需要使用 json form 等对象解析必须要设置
   * @default ['text/*', 'json', 'application/xml', 'urlencoded']
   */
  text?: string[];

  /**
   * 解析 json 请求
   * @default true
   */
  json?: boolean;

  /**
   * 解析表单请求
   * @default true
   */
  form?: boolean;

  /**
   * 解析错误时输出错误代码
   * - 默认无
   */
  errorCode?: number;

  /**
   * 解析错误时 HTTP Code
   * @default 415
   */
  errorStatus?: number;
}

/**
 * Body 解析配置
 */
@scope('singleton')
export abstract class BodyOption implements BodyOption {
  // 影子类，注入识别使用
}
