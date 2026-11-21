/** @typedef {{ text?: string, link?: string, items?: NavItem[], activeMatch?: string }} NavItem */
/** @type {NavItem[]} */
export const nav = [
  {
    text: 'AI',
    activeMatch: `^/ai/`,
    items: [
      { text: '入门', link: '/ai/primer/awesome' },
      { text: 'OpenSpec', link: '/ai/openspec/1-core' },
      { text: 'Claude Code', link: '/ai/claude-code/01-can' },
      { text: 'Gstack 学习路线图', link: '/ai/extend-reading/gstack' },
    ],
  },
  {
    text: '后端',
    activeMatch: `^/back-end/`,
    items: [
      { text: 'Java', link: '/back-end/java/' },
      { text: 'Php', link: '/back-end/php/' },
      { text: 'Python', link: '/back-end/python/' },
      { text: 'Ruby', link: '/back-end/ruby/' },
    ],
  },
  {
    text: '数据库',
    activeMatch: `^/database/`,
    items: [
      { text: '入门', link: '/database/primer/' },
      { text: 'MySQL', link: '/database/mysql/' },
      { text: 'Redis', link: '/database/redis/' },
      { text: 'Mongo', link: '/database/mongo/' },
      {
        items: [{ text: '📚 Redis Document', link: '/database/redis/docs' }],
      },
    ],
  },
  {
    text: '开发',
    activeMatch: `^/development/`,
    link: '/development/',
  },
  {
    text: '前端',
    activeMatch: `^/front-end/`,
    items: [
      { text: 'RoadMap', link: '/front-end/roadmap/index' },
      { text: 'App', link: '/front-end/app/' },
      { text: 'Javascript', link: '/front-end/javascript/index' },
      { text: 'Web', link: '/front-end/web/' },
    ],
  },
  {
    text: 'Ops',
    activeMatch: `^/ops/`,
    items: [
      { text: '运维', link: '/ops/index' },
      { text: 'Mac', link: '/ops/mac/index' },
      { text: 'Linux', link: '/ops/linux/index' },
      { text: 'Nginx', link: '/ops/nginx/index' },
      { text: 'Man', link: '/ops/man/index' },
      { text: 'Bash', link: '/ops/bash/index' },
    ],
  },
];
export const topics = [
  {
    number: '01',
    title: '后端开发',
    description: '语言基础、框架用法与服务端开发笔记。',
    tags: 'Java / PHP / Python',
    link: '/back-end/java/',
    icon: 'M4 5h16v14H4z M4 9h16 M8 13l2 2-2 2 M13 17h3',
  },
  {
    number: '02',
    title: '前端与移动端',
    description: 'JavaScript、Web 框架与移动端开发。',
    tags: 'JavaScript / Web / App',
    link: '/front-end/web/',
    icon: 'M3 4h13v12H3z M7 20h5 M9 16v4 M18 9h3v11h-6v-2',
  },
  {
    number: '03',
    title: '数据库',
    description: '数据库使用、缓存机制与常见问题。',
    tags: 'MySQL / Redis / MongoDB',
    link: '/database/primer/',
    icon: 'M20 6c0 2-3.6 3-8 3S4 8 4 6s3.6-3 8-3 8 1 8 3z M4 6v12c0 2 3.6 3 8 3s8-1 8-3V6 M4 12c0 2 3.6 3 8 3s8-1 8-3',
  },
  {
    number: '04',
    title: '运维与工具',
    description: '系统配置、部署维护与开发工具。',
    tags: 'Linux / Docker / Git',
    link: '/ops/',
    icon: 'M4 5h16v14H4z M8 10l3 3-3 3 M13 16h3',
  },
  {
    number: '05',
    title: 'AI 实践',
    description: 'AI 编程工具的配置、用法与实践记录。',
    tags: 'Claude Code / OpenSpec',
    link: '/ai/primer/awesome',
    icon: 'M5 7h14v13H5z M9 12h.01 M15 12h.01 M9 16h6 M12 3v4 M2 11v5 M22 11v5',
  },
  {
    number: '06',
    title: '设计与体验',
    description: '界面设计、交互细节与体验分析。',
    tags: 'UI / 交互设计 / A/B 测试',
    link: '/design/ui/',
    icon: 'M4 4h16v16H4z M4 10h16 M10 10v10 M8 7h.01 M11 7h.01',
  },
];
export const featuredArticles = [
  {
    tag: '工程实践',
    title: '为什么要在写代码前先写 Spec',
    description: 'OpenSpec 的核心理念与使用场景。',
    link: '/ai/openspec/1-core',
  },
  {
    tag: '开发工具',
    title: 'Git 常用命令速查',
    description: '日常版本管理中用到的 Git 命令。',
    link: '/development/git/cheat-sheet',
  },
  {
    tag: '交互设计',
    title: 'UI 中的 A/B 测试',
    description: 'A/B 测试在界面设计中的应用。',
    link: '/design/ui/ab-test-at-ui',
  },
];
export const relatedSiteGroups = [
  {
    id: 'main-domains',
    title: '项目',
    sites: [
      { text: '码小兮', link: 'https://maxiaoxi.com' },
      { text: 'UniStory·优映', link: 'https://unistory.cn/' },
      { text: '产品大牛', link: 'https://pmdaniu.com' },
      { text: 'Wulihub', link: 'https://wulihub.com.cn' },
    ],
  },
  {
    id: 'subdomains',
    title: '框架',
    sites: [
      { text: 'Weiran', link: 'https://weiran.wulicode.com' },
      { text: 'Wuli3', link: 'https://wuli3.wulicode.com' },
    ],
  },
  {
    id: 'demos',
    title: 'Demo',
    sites: [
      { text: 'Vant Demo', link: 'https://vant-demo.wulicode.com' },
      {
        text: 'Element Plus Demo',
        link: 'https://element-plus-demo.wulicode.com',
      },
      {
        text: 'Html Get Started',
        link: 'https://html-get-started.wulicode.com',
      },
    ],
  },
];

export const site = {
  title: 'Wulicode',
  description: '开发笔记、技术资料与实践记录。生命不息，学习不止。',
  url: 'https://www.wulicode.com',
  logo: '/brand/wulicode-mark.png',
};
/** @type {Record<string, string>} */
export const categoryNames = {
  ai: 'AI 实践',
  'back-end': '后端开发',
  'front-end': '前端与移动端',
  database: '数据库',
  development: '开发工具',
  ops: '运维与工具',
  design: '设计与体验',
  about: '关于',
  java: 'Java',
  php: 'PHP',
  python: 'Python',
  ruby: 'Ruby',
  web: 'Web',
  app: 'App',
  javascript: 'JavaScript',
  mysql: 'MySQL',
  redis: 'Redis',
  mongo: 'MongoDB',
  primer: '入门',
  'extend-reading': '扩展阅读',
  'claude-code': 'Claude Code',
  openspec: 'OpenSpec',
  mac: 'Mac',
  linux: 'Linux',
  nginx: 'Nginx',
  bash: 'Bash',
  man: '命令手册',
};
