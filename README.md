# Wulicode

基于 Astro 的 Markdown 技术文章站，https://www.wulicode.com。

需要 Node.js 24+、pnpm 12.21.0。

```sh
pnpm install
pnpm dev          # http://localhost:9900
pnpm build       # 生成 dist/
pnpm preview     # 预览生产构建
pnpm test:content
pnpm verify:build # 构建后核对所有文章路由、导航和站点地图
```

在 `docs/` 中新增或编辑 Markdown 即可，保留原有目录结构。文章 `/a/post.md` 对应 `/a/post.html`，目录 `index.md` 对应 `/a/`；没有 index.md 的目录自动生成文章列表。已有 frontmatter 标题、摘要、更新时间和评论开关继续生效。标题锚点保持 VitePress 的格式，支持提示块、代码高亮、复制、图片查看和 Giscus 评论。

- `src/pages/`：首页、文章归档、文章与目录动态静态路由、RSS。
- `src/layouts/`：全站导航及文章阅读布局。
- `src/lib/site.mjs`：导航、首页分类、精选文章、底部项目 / 框架 / Demo 链接。
- `src/lib/content.mjs`：Markdown 读取、旧路径与语法兼容、目录生成。
- `src/styles/`：浅色、深色和响应式样式。

搜索继续使用原有 Algolia 索引，首次打开搜索时加载组件。评论继续使用原 GitHub Discussions 仓库与页面标题映射。文章内容里的脚本示例不会作为页面脚本执行。

Vercel 使用仓库内 `vercel.json` 的 Astro 配置构建，输出目录为 `dist`。`mono` 中的 `packages/home` 软链及 Turbo 启动方式保持有效；迁移后重启原来的 `pnpm dev` 进程即可。

## 图片可访问性检查

需要 Node.js 24（与 `.nvmrc` 一致）。安装依赖后执行：

```sh
pnpm images:check
```

扫描 `docs` 中所有 Markdown 文章，提取正文图片、引用式图片、HTML `img` / `source` 的静态 `src` / `srcset`，以及 frontmatter 中的图片和 `og:image`；同时检查 `src/lib/site.mjs` 配置中的静态 `logo` / `image` 和带图片扩展名的 `src`。代码块、行内代码中的图片示例不参与检查。同一地址只请求一次，失败时列出引用该地址的每篇文章。

成功的远程图片默认缓存 **24 小时**，期间重复运行会跳过请求；失败图片每次运行都会重查。本地图片每次检查文件是否存在且非空，根路径 `/foo.png` 对应 `docs/public/foo.png`，相对路径以文章目录为准。HTTP 请求使用 GET、跟随重定向，拒绝错误状态、HTML/JSON 页面和明确的空响应；这是可访问性检查，不进行完整图片解码。

```sh
# 自定义成功缓存有效期（支持 ms / s / m / h / d）
pnpm images:check --interval 12h

# 忽略缓存，立即全量复查
pnpm images:check --force

# 立即检查一次，然后每 24 小时继续巡检，需要保持进程运行
pnpm images:watch

# 自定义巡检周期、超时及并发
pnpm images:watch --interval 6h --timeout 20s --concurrency 8

# 检查指定文章目录，并指定报告目录
pnpm images:check --docs docs/ai --output .image-check/ai

# 查看参数 / 运行自动化验证
pnpm images:check --help
pnpm test:images
```

默认生成以下文件（已通过 `.gitignore` 忽略）：

- `.image-check/report.md`：失败图片的文章名字、源文件行号、图片地址、失败原因，以及图片前后两行上下文。
- `.image-check/report.json`：同样的结构化结果，便于后续处理。
- `.image-check/cache.json`：成功图片的最后检查时间，删除即可清空缓存。

`--interval` 同时控制成功缓存有效期和持续巡检的等待时间，默认 `24h`。单次命令本身不会注册系统定时任务；持续运行使用 `images:watch`，或在系统调度器中周期性调用 `images:check`。退出码：`0` 表示没有失败，`1` 表示存在失败图片，`2` 表示脚本执行错误。

检查范围是仓库中的 Markdown 图片引用；运行时由 Vue/JavaScript 拼接的图片、CSS 背景图及主题配置中的动态表达式不在扫描范围内。检查结果反映当前机器的网络环境，超时、访问控制或防盗链也会作为失败原因报告。
