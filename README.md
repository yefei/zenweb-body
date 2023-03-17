# ZenWeb Body module

[ZenWeb](https://www.npmjs.com/package/zenweb)

支持 JSON、Form 等内容格式的基础解析模块

## 演示
```ts
import { Context, mapping, Body, BodyHelper } from 'zenweb';

export class Controller {
  @mapping({ path: '/', method: 'POST' })
  post(body: Body) {
    console.log(body.type); // POST body 内容类型
    console.log(body.data); // POST Body 内容解析完成后的数据
  }

  @mapping({ path: '/', method: 'POST' })
  post(body: BodyHelper) {
    console.log(body.get({ age: '!int' })); // 类型转换&校验
  }
}
```

## 内置的对象内容解析器

- json
- x-www-form-urlencoded

## 配置项

| 项 | 类型 | 默认值 | 说明 |
|----|-----|-------|-----|
| encoding | string | 'utf-8' | 在未能匹配到 header 信息时，默认text内容编码格式 |
| limit | number | 1MB | 内容大小限制 |
| inflate | boolean | true | 是否支持压缩内容解压 |
| textTypes | string[] | ['text/*', 'json', '+json', 'xml', '+xml', 'urlencoded'] | 支持解析为文本的类型 |
| parses | BodyParserClass[] | [JSONParser, URLEncodedParser] | 对象解析器 |

## 其他扩展格式解析

[xml](https://www.npmjs.com/package/@zenweb/xml-body)
