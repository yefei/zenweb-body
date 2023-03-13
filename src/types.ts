import { scope } from '@zenweb/inject';

/**
 * 内容类型
 */
export type BodyType = 'json' | 'form' | 'text' | 'unknown';

/**
 * 基础配置 - 子项配置的默认配置
 */
export interface BaseOption {
  /**
   * 编码
   * @default 'utf-8'
   */
  encoding?: string;

  /**
   * 大小限制
   * @default '1mb'
   */
  limit?: string;
}

/**
 * 解析 JSON 配置
 */
export interface JsonOption extends BaseOption {
  /**
   * 严格模式, 根必须为 {} 或 []
   * @default true
   */
  strict?: boolean;
}

/**
 * 解析表单配置
 */
export interface FormOption extends BaseOption {}

/**
 * 解析文本配置
 */
export interface TextOption extends BaseOption {}

/**
 * Body 解析配置
 */
export interface BodyOption extends BaseOption {
  /**
   * 解析 json 请求
   * @default true
   */
  json?: JsonOption | boolean;

  /**
   * 解析表单请求
   * @default true
   */
  form?: FormOption | boolean;

  /**
   * 解析文本请求
   * @default true
   */
  text?: TextOption | boolean;

  /**
   * 解析错误时输出错误代码
   * - 默认无
   */
  errorCode?: number;

  /**
   * 解析错误时 HTTP Code
   * @default 412
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
