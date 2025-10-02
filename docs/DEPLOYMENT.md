# 🚀 部署指南

## Vercel 一键部署

### 快速部署

使用 README 中的一键部署按钮，或者访问：
```
https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFiftonb%2Fusmoon&project-name=usmoon-ai-translator&repository-name=usmoon
```

### 手动部署步骤

1. **Fork 或克隆仓库**
   ```bash
   git clone https://github.com/Fiftonb/usmoon.git
   cd usmoon
   ```

2. **推送到你的 GitHub 仓库**

3. **连接到 Vercel**
   - 访问 [Vercel](https://vercel.com)
   - 点击 "New Project"
   - 从 GitHub 导入你的仓库
   - Vercel 会自动检测到这是一个 Next.js 项目

4. **配置环境变量（可选）**
   
   在 Vercel 项目设置中添加以下环境变量：
   
   | 变量名 | 描述 | 是否必需 |
   |--------|------|----------|
   | `OPENAI_API_KEY` | OpenAI API 密钥 | 否* |
   | `OPENAI_BASE_URL` | API 基础 URL | 否 |
   | `OPENAI_MODEL` | 使用的模型 | 否 |
   
   *注：如果不设置，用户可以在应用设置中配置

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成

## 环境变量说明

### 服务端环境变量

这些变量在构建时使用，可以预设默认的 API 配置：

- `OPENAI_API_KEY`: 默认的 OpenAI API 密钥
- `OPENAI_BASE_URL`: 默认的 API 端点 (如 `https://api.openai.com/v1`)
- `OPENAI_MODEL`: 默认使用的模型 (如 `gpt-3.5-turbo`)

### 客户端环境变量

- `NEXT_PUBLIC_APP_NAME`: 应用名称（已在 vercel.json 中配置）

## 域名配置

### 使用 Vercel 提供的域名

部署成功后，你将获得一个形如 `your-project-name.vercel.app` 的域名。

### 绑定自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 根据提示配置 DNS 记录

## 自动部署

当你推送代码到 main 分支时，Vercel 会自动重新部署应用。

## 故障排除

### 构建失败

1. 检查 Node.js 版本是否兼容 (建议 18+)
2. 确保所有依赖都已正确安装
3. 检查环境变量是否正确设置

### API 调用失败

1. 确认 API 密钥是否有效
2. 检查 API 端点是否可访问
3. 验证模型名称是否正确

### 性能优化

- Vercel 会自动进行 CDN 分发
- 静态资源会被自动优化
- API 路由会在边缘节点运行

## 监控和分析

在 Vercel 控制台中，你可以查看：

- 部署历史
- 性能分析
- 错误日志
- 流量统计

---

如有问题，请查看 [Vercel 文档](https://vercel.com/docs) 或提交 Issue。 