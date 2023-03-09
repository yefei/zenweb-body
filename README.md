# ZenWeb Body module

[ZenWeb](https://www.npmjs.com/package/zenweb)

支持 JSON、Form 表单解析

## 演示
```ts
import { Context, mapping, Body, BodyHelper } from 'zenweb';

export class Controller {
  @mapping({ path: '/', method: 'POST' })
  post(body: Body) {
    console.log(body.type); // POST body 内容类型
    console.log(body.data); // POST Body 内容解析完成后的对象
  }

  @mapping({ path: '/', method: 'POST' })
  post(body: BodyHelper) {
    console.log(body.get({ age: '!int' })); // 类型转换&校验
  }
}
```

## 支持的内容格式
通过客户端提交的 Content-Type 头信息判断内容格式

- json: json
- x-www-form-urlencoded: form
- text/*: text

## 配置项

### 主配置 BodyOption
| 项 | 类型 | 默认值 | 说明 |
|----|-----|-------|-----|
| json | JsonOption \| boolean | true | 解析 json 格式 |
| form | FormOption \| boolean | true | 解析表单请求 |
| text | TextOption \| boolean | true | 解析纯文本 |

#### BaseOption
| 项 | 类型 | 默认值 | 说明 |
|----|-----|-------|-----|
| encoding | string | 'utf-8' | 内容编码 |
| limit | string | '1mb' | 内容大小限制 |

#### JsonOption extends BaseOption
| 项 | 类型 | 默认值 | 说明 |
|----|-----|-------|-----|
| strict | boolean | true | 严格模式, 提交的内容必须为 {} 或 [] 开头 |

## Changelog

### 3.1.0
- 新增 BodyHelper 数据类型转换&校验

### 3.0.0
使用依赖注入重构，去除 xml 和 文件上传表单支持，取消的这两个作为独立模块分离。
