# 内置 API 功能实现说明

## 功能概述

已成功实现**内置 API 配置**功能，允许管理员在服务器端配置 API 密钥，用户可以选择使用内置 API 或自定义 API 配置。

## 主要特性

### 🔐 安全性
- ✅ API 密钥存储在服务器端环境变量中
- ✅ 密钥不会暴露在前端代码或网络请求中
- ✅ 用户无需看到或配置敏感信息

### ⚙️ 灵活性
- ✅ 支持使用内置 API（服务器配置）
- ✅ 支持使用自定义 API（用户自己配置）
- ✅ 用户可以在设置中自由切换

### 🎯 用户体验
- ✅ 简单的开关即可启用内置 API
- ✅ 清晰的状态提示
- ✅ 无缝切换，无需重新加载页面

## 实现细节

### 1. 环境变量配置

创建了 `.env.example` 文件作为配置模板：

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo
```

### 2. API 路由修改

**文件：`src/pages/api/translate.ts` 和 `src/pages/api/models.ts`**

- 修改为优先使用前端传递的 API 配置
- 如果前端未传递配置，则回退到环境变量
- 添加日志记录使用内置 API 的情况

```typescript
const finalApiKey = apiKey || process.env.OPENAI_API_KEY;
const finalBaseURL = baseURL || process.env.OPENAI_BASE_URL;
const finalModel = model || process.env.OPENAI_MODEL;
```

### 3. 设置对话框更新

**文件：`src/components/settings-dialog.tsx`**

新增功能：
- ✅ 添加"使用内置 API"开关
- ✅ 当开启内置 API 时，隐藏自定义 API 配置表单
- ✅ 显示状态提示（已启用/未配置）
- ✅ 支持使用内置 API 时刷新模型列表

### 4. 前端逻辑更新

**文件：`src/pages/index.tsx`**

- ✅ 添加 `useBuiltinApi` 状态管理
- ✅ 保存用户的选择到 localStorage
- ✅ 翻译时根据选择传递或不传递 API 配置
- ✅ 更新 API 测试组件的调用

### 5. 国际化支持

**文件：`locales/zh.json` 和 `locales/en.json`**

添加了以下翻译键：
- `settings.use_builtin_api` - 使用内置 API
- `settings.use_builtin_api_desc` - 功能说明
- `settings.builtin_api_enabled` - 启用状态
- `settings.builtin_api_disabled` - 未配置状态
- `settings.builtin_api_note` - 使用提示
- `settings.custom_api_config` - 自定义配置标题

## 使用流程

### 管理员配置（服务器端）

1. **创建环境变量文件**
   ```bash
   cp .env.example .env.local
   ```

2. **编辑配置**
   ```bash
   OPENAI_API_KEY=sk-your-real-api-key
   OPENAI_BASE_URL=https://api.openai.com/v1
   OPENAI_MODEL=gpt-3.5-turbo
   ```

3. **重启应用**
   ```bash
   npm run dev  # 开发环境
   # 或
   npm run build && npm start  # 生产环境
   ```

### 用户使用（前端）

1. **打开设置对话框**
   - 点击右上角的设置图标

2. **启用内置 API**
   - 打开"使用内置 API"开关
   - 看到"✓ 内置 API 已启用"提示

3. **选择模型**
   - 点击"刷新"按钮加载可用模型
   - 从下拉列表选择模型

4. **保存设置**
   - 点击"保存"按钮
   - 开始使用翻译功能

## 部署配置

### Vercel 部署

在 Vercel 项目设置中：
1. Settings → Environment Variables
2. 添加变量：
   - `OPENAI_API_KEY`
   - `OPENAI_BASE_URL`（可选）
   - `OPENAI_MODEL`（可选）

### Docker 部署

在 `docker-compose.yml` 中：
```yaml
environment:
  - OPENAI_API_KEY=sk-xxxxx
  - OPENAI_BASE_URL=https://api.openai.com/v1
  - OPENAI_MODEL=gpt-3.5-turbo
```

### 传统服务器

创建 `.env.local` 文件后直接运行：
```bash
npm install
npm run build
npm start
```

## 安全建议

1. **保护环境变量文件**
   - `.env.local` 已在 `.gitignore` 中
   - 不要将密钥提交到版本控制

2. **监控 API 使用**
   - 定期检查 API 使用量
   - 设置使用量警报

3. **权限控制**
   - 考虑添加用户认证
   - 限制请求频率

4. **混合模式**
   - 同时支持内置和自定义 API
   - 允许高级用户使用自己的密钥

## 测试清单

- [x] 环境变量配置正确加载
- [x] 使用内置 API 可以正常翻译
- [x] 使用自定义 API 可以正常翻译
- [x] 切换 API 模式正常工作
- [x] 模型列表刷新功能正常
- [x] 设置保存到 localStorage
- [x] 页面刷新后设置保持
- [x] 国际化文本显示正确
- [x] 无 TypeScript/Linter 错误

## 相关文档

- [ENV_CONFIG.md](./ENV_CONFIG.md) - 详细的环境变量配置说明
- [README.md](./README.md) - 项目说明和快速开始
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南

## 更新日志

### 2024-10-02
- ✅ 实现内置 API 功能
- ✅ 添加设置界面开关
- ✅ 更新 API 路由支持环境变量
- ✅ 添加国际化支持
- ✅ 创建配置文档

