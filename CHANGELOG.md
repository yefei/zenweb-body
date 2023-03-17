# Changelog

## [3.4.0] - 2023-3-17
- 可扩展的内容解析器

## [3.3.1] - 2023-3-16
- fix: 空内容体支持
- update: JSON 解析错误捕获

## [3.3.0] - 2023-3-16
- 重写内容解析逻辑
- 新增: TextBody 和 RawBody 注入类型
- 修改: 配置项简化，不再使用 ctx.fail 输出错误，而是使用标准 httpError

## [3.2.2] - 2023-3-15
- update: application/xml to text

## [3.2.1] - 2023-3-14
- 修改: ObjectBody, Body.data 对象项目类型为 unknown

## [3.2.0] - 2023-3-13
- 新增: ObjectBody 对象
- 改进: 错误消息使用 messagecode 管理

## 3.1.1
- null 检查

## 3.1.0
- 新增 BodyHelper 数据类型转换&校验

## 3.0.0
使用依赖注入重构，去除 xml 和 文件上传表单支持，取消的这两个作为独立模块分离。
