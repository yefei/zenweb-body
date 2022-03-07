import { Options as FormidableOptions } from 'formidable';
import { X2jOptionsOptional } from 'fast-xml-parser';

export type Method = string | 'POST' | 'PUT' | 'PATCH' | 'GET' | 'HEAD' | 'DELETE';

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

export interface JsonOption extends BaseOption {
  /**
   * 严格模式, 根必须为 {} 或 []
   * @default true
   */
  strict?: boolean;
}

export interface FormOption extends BaseOption {}

export interface TextOption extends BaseOption {}

export interface MultipartOption extends FormidableOptions {
  /**
   * 表单字段大小限制，除去文件部分
   * @default BaseOption.limit
   */
  maxFieldsSize: number;
}

export interface XMLOption extends BaseOption, X2jOptionsOptional {}

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
   * 解析 XML 格式为 JS 对象
   */
  xml?: XMLOption | boolean;

  /**
   * 解析文本请求
   * @default true
   */
  text?: TextOption | boolean;

  /**
   * 支持上传文件
   * @default true
   */
  multipart?: MultipartOption | boolean;

  /**
   * 处理请求类型
   * @default ['POST', 'PUT', 'PATCH']
   */
  methods?: Method[];
}
