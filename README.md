# ZenWeb Body module

[ZenWeb](https://www.npmjs.com/package/zenweb)

支持 Form 表单解析，和文件上传处理。

## 演示
```ts
import { Context, mapping } from 'zenweb';

export class Controller {
  @mapping({ path: '/', method: 'POST' })
  post(ctx: Context) {
    console.log(ctx.bodyType); // POST body 内容类型
    console.log(ctx.body); // POST Body 内容解析完成后的对象
  }

  @mapping({ path: '/file', method: 'POST' })
  fileUpload(ctx: Context) {
    console.log(ctx.files); // 上传文件列表
  }
}
```

## 支持的内容格式
通过客户端提交的 Content-Type 头信息判断内容格式

- json: json
- x-www-form-urlencoded: form
- text/xml: xml
- text/*: text
- form-data: multipart

## 配置项

### 主配置 BodyOption
| 项 | 类型 | 默认值 | 说明 |
|----|-----|-------|-----|
| json | JsonOption \| boolean | true | 解析 json 格式 |
| form | FormOption \| boolean | true | 解析表单请求 |
| xml | XMLOption \| boolean | false | 解析 xml 格式 |
| text | TextOption \| boolean | true | 解析纯文本 |
| multipart | MultipartOption \| boolean | true | 支持上传文件 |
| methods | string | ['POST', 'PUT', 'PATCH'] | 哪些请求需要被处理 |

#### BaseOption
| 项 | 类型 | 默认值 | 说明 |
|----|-----|-------|-----|
| encoding | string | 'utf-8' | 内容编码 |
| limit | string | '1mb' | 内容大小限制 |

#### JsonOption extends BaseOption
| 项 | 类型 | 默认值 | 说明 |
|----|-----|-------|-----|
| strict | boolean | true | 严格模式, 提交的内容必须为 {} 或 [] 开头 |

#### MultipartOption extends FormidableOptions
| 项 | 类型 | 默认值 | 说明 |
|----|-----|-------|-----|
| maxFieldsSize | number | BaseOption.limit | 表单字段大小限制，除去文件部分 |

#### FormOption extends BaseOption
无其他配置项
#### TextOption extends BaseOption
无其他配置项
