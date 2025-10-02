# 环境变量配置说明

## 内置 API 配置

如果您想为所有用户提供内置的 API 配置（不需要用户自己配置 API 密钥），可以通过环境变量的方式来实现。

### 配置步骤

1. **创建环境变量文件**

在项目根目录创建 `.env.local` 文件（该文件不会被 Git 追踪）：

```bash
# 内置 API 配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo
```

2. **配置说明**

| 环境变量 | 说明 | 必填 | 默认值 |
|---------|------|------|--------|
| `OPENAI_API_KEY` | OpenAI API 密钥 | 是 | 无 |
| `OPENAI_BASE_URL` | API 基础 URL | 否 | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | 默认使用的模型 | 否 | `gpt-3.5-turbo` |

3. **使用方式**

配置完成后：
- ✅ **自动启用**：如果配置了环境变量，系统会自动检测并启用内置 API
- 🔧 **手动切换**：用户可以在设置中切换使用内置 API 或自定义 API 配置
- 🔐 **安全优先**：API 密钥存储在服务器端，不会暴露在前端

### 安全说明

✅ **优点**：
- API 密钥存储在服务器端，不会暴露在前端代码中
- 用户无需自己配置 API 密钥即可使用翻译功能
- 适合为团队或组织提供统一的 API 配置

⚠️ **注意事项**：
- `.env.local` 文件不会被 Git 追踪，需要在部署时单独配置
- 使用内置 API 时，所有请求都会使用同一个 API 密钥，注意 API 配额限制
- 建议同时开启自定义 API 配置选项，让用户可以使用自己的 API 密钥

### 部署配置

#### Vercel 部署

在 Vercel 项目设置中添加环境变量：

1. 进入项目 Settings → Environment Variables
2. 添加以下变量：
   - `OPENAI_API_KEY` = 您的 API 密钥
   - `OPENAI_BASE_URL` = `https://api.openai.com/v1`（可选）
   - `OPENAI_MODEL` = `gpt-3.5-turbo`（可选）

#### Docker 部署

在 `docker-compose.yml` 中配置：

```yaml
services:
  app:
    environment:
      - OPENAI_API_KEY=your_api_key_here
      - OPENAI_BASE_URL=https://api.openai.com/v1
      - OPENAI_MODEL=gpt-3.5-turbo
```

或使用 `.env` 文件：

```bash
docker run -d \
  --env-file .env.local \
  -p 3000:3000 \
  your-image-name
```

#### 传统服务器部署

在服务器上创建 `.env.local` 文件，然后：

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 启动服务
npm start
```

### 示例配置

#### OpenAI 官方 API
```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo
```

#### Azure OpenAI
```bash
OPENAI_API_KEY=your_azure_api_key
OPENAI_BASE_URL=https://your-resource.openai.azure.com
OPENAI_MODEL=gpt-35-turbo
```

#### 本地 Ollama
```bash
OPENAI_API_KEY=dummy_key
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama2
```

### 测试配置

配置完成后，重启应用：

1. 系统会自动检测到内置 API 配置
2. "使用内置 API"开关会自动开启
3. 打开设置对话框，会看到绿色的"✓ 内置 API 已启用"提示
4. 点击"刷新"按钮可以加载模型列表
5. 选择模型后即可开始使用翻译功能

**自动启用逻辑：**
- ✅ 如果配置了环境变量，首次访问时自动启用内置 API
- 🔄 用户可以手动切换到自定义 API，选择会被记住
- 📌 如果环境变量被移除，自动禁用内置 API 选项

### 故障排查

**问题：无法加载模型列表**
- 检查 API 密钥是否正确
- 检查 Base URL 是否可访问
- 查看服务器日志了解详细错误信息

**问题：翻译失败**
- 确认选择的模型存在且可用
- 检查 API 配额是否已用完
- 验证 API 密钥是否有正确的权限

---

## 相关文档

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南
- [README.md](./README.md) - 项目说明

