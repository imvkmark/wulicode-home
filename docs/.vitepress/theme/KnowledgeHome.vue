<script setup>
import { withBase } from 'vitepress';

const topics = [
    { number: '01', title: '后端开发', description: '语言基础、框架用法与服务端开发笔记。', tags: 'Java / PHP / Python', link: '/back-end/java/', icon: 'M4 5h16v14H4z M4 9h16 M8 13l2 2-2 2 M13 17h3' },
    { number: '02', title: '前端与移动端', description: 'JavaScript、Web 框架与移动端开发。', tags: 'JavaScript / Web / App', link: '/front-end/web/', icon: 'M3 4h13v12H3z M7 20h5 M9 16v4 M18 9h3v11h-6v-2' },
    { number: '03', title: '数据库', description: '数据库使用、缓存机制与常见问题。', tags: 'MySQL / Redis / MongoDB', link: '/database/primer/', icon: 'M20 6c0 2-3.6 3-8 3S4 8 4 6s3.6-3 8-3 8 1 8 3z M4 6v12c0 2 3.6 3 8 3s8-1 8-3V6 M4 12c0 2 3.6 3 8 3s8-1 8-3' },
    { number: '04', title: '运维与工具', description: '系统配置、部署维护与开发工具。', tags: 'Linux / Docker / Git', link: '/ops/', icon: 'M4 5h16v14H4z M8 10l3 3-3 3 M13 16h3' },
    { number: '05', title: 'AI 实践', description: 'AI 编程工具的配置、用法与实践记录。', tags: 'Claude Code / OpenSpec', link: '/ai/primer/awesome', icon: 'M5 7h14v13H5z M9 12h.01 M15 12h.01 M9 16h6 M12 3v4 M2 11v5 M22 11v5' },
    { number: '06', title: '设计与体验', description: '界面设计、交互细节与体验分析。', tags: 'UI / 交互设计 / A/B 测试', link: '/design/ui/', icon: 'M4 4h16v16H4z M4 10h16 M10 10v10 M8 7h.01 M11 7h.01' },
];
const articles = [
    { tag: '工程实践', title: '为什么要在写代码前先写 Spec', description: 'OpenSpec 的核心理念与使用场景。', link: '/ai/openspec/1-core' },
    { tag: '开发工具', title: 'Git 常用命令速查', description: '日常版本管理中用到的 Git 命令。', link: '/development/git/cheat-sheet' },
    { tag: '交互设计', title: 'UI 中的 A/B 测试', description: 'A/B 测试在界面设计中的应用。', link: '/design/ui/ab-test-at-ui' },
];
</script>

<template>
    <main class="knowledge-home">
        <section class="home-intro" aria-labelledby="home-title">
            <div class="intro-copy">
                <h1 id="home-title">Wulicode</h1>
                <p class="intro-subtitle">相互关联，相互对比</p>
                <p class="intro-description">开发笔记、技术资料与实践记录。生命不息，学习不止。</p>
                <div class="intro-actions">
                    <a class="home-button primary" href="#knowledge-topics">浏览分类 <span aria-hidden="true">→</span></a>
                    <a class="home-button secondary" :href="withBase('/development/')">开发工具</a>
                </div>
            </div>
        </section>
        <section id="knowledge-topics" class="topics-section" aria-labelledby="topics-title">
            <div class="home-section-heading">
                <h2 id="topics-title">技术分类</h2>
            </div>
            <div class="topic-grid">
                <a v-for="topic in topics" :key="topic.number" class="topic-card" :href="withBase(topic.link)">
                    <div class="topic-card-top">
                        <span class="topic-icon"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="topic.icon" /></svg></span>
                        <span class="topic-arrow" aria-hidden="true">→</span>
                    </div>
                    <h3>{{ topic.title }}</h3>
                    <p class="topic-description">{{ topic.description }}</p>
                    <p class="topic-tags">{{ topic.tags }}</p>
                </a>
            </div>
        </section>
        <section class="reading-section" aria-labelledby="reading-title">
            <div class="home-section-heading">
                <h2 id="reading-title">精选笔记</h2>
            </div>
            <div class="reading-grid">
                <a v-for="article in articles" :key="article.link" class="reading-card" :href="withBase(article.link)">
                    <p class="reading-tag">{{ article.tag }}</p>
                    <h3>{{ article.title }}</h3>
                    <p>{{ article.description }}</p>
                    <span class="reading-link">阅读全文 <span aria-hidden="true">→</span></span>
                </a>
            </div>
        </section>
    </main>
</template>
