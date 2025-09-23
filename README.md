# 🌙 USMoon AI Translator

一个基于 AI 的现代化翻译应用，提供美观的界面设计和强大的翻译功能。

## ✨ 功能特性

- 🤖 **AI 驱动翻译** - 支持 OpenAI 及兼容 API 的智能翻译
- 🌍 **多语言支持** - 支持中英文界面，可翻译多种语言
- 🎨 **现代化 UI** - 基于 Tailwind CSS 的精美界面设计
- 🌓 **主题切换** - 支持明暗主题自由切换
- ⚙️ **灵活配置** - 可自定义 API 密钥、服务端点和模型
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🔄 **智能语言检测** - 自动检测用户首选语言
- 💾 **本地存储** - 配置信息本地保存，使用更便捷

## 🛠️ 技术栈

- **框架**: Next.js 14 (React 18)
- **语言**: TypeScript
- **样式**: Tailwind CSS + Radix UI
- **状态管理**: React Hooks
- **国际化**: 自定义 i18n 方案
- **AI 服务**: OpenAI API (及兼容接口)
- **包管理**: pnpm

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- pnpm (推荐) 或 npm

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/Fiftonb/usmoon.git
cd usmoon

# 安装依赖
pnpm install
# 或
npm install
```

### 运行项目

```bash
# 开发模式
pnpm dev
# 或
npm run dev

# 构建项目
pnpm build
# 或
npm run build

# 生产环境运行
pnpm start
# 或
npm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🚀 一键部署

### 部署到 Vercel

点击下面的按钮即可一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFiftonb%2Fusmoon&project-name=usmoon-ai-translator&repository-name=usmoon)

**部署步骤：**

1. 点击上方的 "Deploy with Vercel" 按钮
2. 使用 GitHub、GitLab 或 Bitbucket 账号登录 Vercel
3. 授权 Vercel 访问你的 GitHub 仓库
4. 项目将自动开始构建和部署
5. 部署完成后，你将获得一个 `.vercel.app` 域名

**可选环境变量配置：**

虽然应用可以在不设置环境变量的情况下正常运行（用户可以在应用内配置 API），但你也可以在 Vercel 中预设置以下环境变量：

- `OPENAI_API_KEY` - OpenAI API 密钥
- `OPENAI_BASE_URL` - API 服务端点 (默认: https://api.openai.com/v1)
- `OPENAI_MODEL` - 使用的模型 (默认: gpt-3.5-turbo)

### 自定义域名

部署完成后，你可以在 Vercel 控制台中绑定自定义域名。

> 📖 **详细部署指南**: 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 获取更详细的部署说明和故障排除指南。

## ⚙️ 配置说明

### API 配置

在应用的设置面板中配置以下信息：

- **API Key**: OpenAI API 密钥或兼容服务的密钥
- **Base URL**: API 服务端点 (默认: `https://api.openai.com/v1`)
- **Model**: 使用的模型 (默认: `gpt-3.5-turbo`)

### 支持的语言

- 界面语言：英文 (en)、中文 (zh)
- 翻译语言：支持 OpenAI 模型支持的所有语言

## 📁 项目结构

```
src/
├── components/          # UI 组件
│   ├── ui/             # 基础 UI 组件
│   ├── language-switcher.tsx
│   ├── settings-dialog.tsx
│   └── theme-toggle.tsx
├── hooks/              # 自定义 Hooks
│   └── use-translate.ts
├── lib/                # 工具库
│   └── i18n.ts         # 国际化工具
├── pages/              # 页面和 API 路由
│   ├── api/
│   │   └── translate.ts
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx
├── styles/             # 样式文件
└── middleware.ts       # 中间件 (语言检测)

locales/                # 国际化文件
├── en.json
└── zh.json
```

## 🔧 开发说明

### 添加新语言

1. 在 `locales/` 目录下添加新的语言文件 (如 `fr.json`)
2. 在 `src/middleware.ts` 中的 `locales` 数组添加新语言代码
3. 更新 `languageMap` 配置相应的语言映射

### 自定义主题

在 `tailwind.config.ts` 中修改主题配置，或在 `src/styles/globals.css` 中添加自定义 CSS 变量。

## 📄 许可证

[MIT](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

---

如有问题或建议，请随时联系！ 