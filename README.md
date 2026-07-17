# 二战音乐 AI 学习地图

这是一个关于二战时期音乐的高中研究项目。项目使用 AI 辅助整理历史事件、歌曲、艺术家、音频片段和来源链接，再经过人工校对，最终做成可交互的 Vue 3 静态网站。

## 项目形态

- 技术栈：Vue 3、Vite、Vue Router、Three.js / globe.gl。
- 部署形态：Vue 静态前端加一个 `/api/music` Serverless 代理；音乐生成页需要连接自托管 ACE-Step 服务。
- 运行依赖：地图页面不依赖后端；音乐生成页需要 XL-SFT、项目 LoRA 和 ACE-Step 5Hz LM GPU 服务。
- 路由模式：HTML5 history 模式，服务器需要配置 SPA 回退，否则刷新 `/events`、`/countries` 等页面会出现 404。

## 环境要求

构建机器需要安装：

- Node.js `^20.19.0`、`^22.12.0` 或更高兼容版本。
- npm，建议使用随 Node.js 安装的版本。

客户服务器如果只是托管构建产物，则不需要安装 Node.js。

## 本地开发

```sh
npm install
npm run dev
```

如需测试音乐生成页，复制 `.env.example` 为 `.env.local`，填写：

```text
ACESTEP_API_BASE=https://你的-ACE-Step-服务地址
ACESTEP_API_KEY=服务端密钥
```

浏览器不会接触该密钥；`/api/music` 只在服务器端读取它。网站支持三种生成方式：

- 自动写词并演唱：ACE-Step 5Hz LM 自动生成歌词和歌曲结构。
- 使用自己的歌词：直接把用户歌词交给 XL-SFT。
- 纯音乐：显式传入 `[Instrumental]`。

三个模式都使用 `acestep-v15-xl-sft` 和本项目训练的 LoRA，不调用外部付费歌词 API。

开发服务器默认由 Vite 启动，终端会输出本地访问地址。

## 构建前检查

交付或上线前建议执行：

```sh
npm test
npm run build
```

如需本地预览构建结果：

```sh
npm run preview
```

打开预览地址后，至少检查首页、`/events`、`/countries`、`/sources`、`/training-data`，并确认图片、音频和地球视图可以正常加载。

## 部署流程

### 1. 确认最终访问路径

构建前必须先确定网站最终部署在哪个 URL 路径下：

- 如果部署在域名根路径，例如 `https://example.com/`，使用根路径构建。
- 如果部署在子目录，例如 `https://example.com/heatmap/`，必须使用 `/heatmap/` 作为 `BASE_PATH` 构建。

`BASE_PATH` 必须和线上访问路径完全一致，且建议以 `/` 开头和结尾。路径不一致时，页面可能能打开，但 JS、CSS、图片、音频或动态分包会 404。

### 2. 构建根路径版本

适用于部署到 `https://example.com/`：

```sh
npm run build
```

构建产物会输出到 `dist/`。

### 3. 构建子目录版本

适用于部署到 `https://example.com/heatmap/` 这类路径。

PowerShell：

```powershell
$env:BASE_PATH = "/heatmap/"
npm run build
```

macOS / Linux：

```sh
BASE_PATH=/heatmap/ npm run build
```

如果客户使用其他子目录，把 `/heatmap/` 替换成实际路径。

### 4. 上传构建产物

将 `dist/` 目录中的全部内容上传到客户网站对应目录：

- 根路径部署：把 `dist/` 内的文件放到网站根目录。
- 子目录部署：把 `dist/` 内的文件放到对应子目录，例如网站的 `/heatmap/` 目录。

不要只上传 `index.html`，`assets/`、图片、音频和其他静态文件也必须一起上传，并保持目录结构不变。

### 5. 配置 SPA 回退

本项目使用前端路由。客户服务器需要把不存在的前端路径回退到 `index.html`。

Nginx 根路径示例：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

Nginx 子目录示例：

```nginx
location /heatmap/ {
  try_files $uri $uri/ /heatmap/index.html;
}
```

Apache `.htaccess` 子目录示例：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /heatmap/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /heatmap/index.html [L]
</IfModule>
```

如果使用对象存储、CDN、Netlify、Vercel、Cloudflare Pages 或客户 CMS，也需要配置等价的 fallback / rewrite 规则：所有非真实文件请求都返回 `index.html`。

## GitHub Pages

仓库包含 GitHub Pages 构建脚本：

```sh
npm run build:pages
```

该脚本会：

- 按 GitHub Pages 项目路径设置默认 `BASE_PATH`。
- 生成 `dist/404.html`，用于 GitHub Pages 的 SPA 回退。
- 生成 `dist/.nojekyll`，避免 GitHub Pages 忽略以下划线开头的资源。

如果 GitHub Pages 部署路径不是默认仓库名，可以手动指定：

```sh
BASE_PATH=/custom-path/ npm run build:pages
```

PowerShell 下写法：

```powershell
$env:BASE_PATH = "/custom-path/"
npm run build:pages
```

## 上线后验收清单

- 首页可以正常打开。
- 直接访问或刷新 `/events`、`/countries`、`/sources`、`/training-data` 不出现 404。
- 浏览器开发者工具 Network 面板没有 JS、CSS、图片、音频资源 404。
- 地球视图可以显示和交互。
- 音频资源可以播放。浏览器通常会限制自动播放，用户首次点击后播放属于正常行为。
- 移动端和桌面端主要页面布局正常。

## 注意事项

- 地图主体仍可作为静态网站运行；`/generate` 的 Serverless 代理会在运行时读取 `ACESTEP_API_BASE` 和 `ACESTEP_API_KEY`。`BASE_PATH` 只在构建时生效。
- 每次修改部署路径后，都需要使用新的 `BASE_PATH` 重新构建。
- 建议对 `index.html` 使用较短缓存或不缓存，对带 hash 的 `assets/` 文件使用长期缓存。
- 服务器或 CDN 需要正确返回常见 MIME 类型，例如 `.js`、`.css`、`.webp`、`.svg`、`.ogg`、`.mp3`。
- 地球视图依赖 WebGL，极旧浏览器或禁用硬件加速的环境可能无法正常显示。
- 音频和图片资源位于 `public/`，相关授权说明见各资源目录中的 `LICENSES.md`。客户正式商用或公开发布前，应按其使用场景再次确认素材授权和署名要求。

## 常用命令

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
npm run build:pages
```
