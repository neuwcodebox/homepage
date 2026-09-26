import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';
import remarkYouTube from './src/remark/youtube.mjs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'neuwappbox',
  tagline: '개발 기록과 일상 이야기',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: 'https://neuwappbox.com',
  baseUrl: '/',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          beforeDefaultRemarkPlugins: [remarkYouTube],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/neuwcodebox/homepage/blob/main/',
        },
        blog: {
          beforeDefaultRemarkPlugins: [remarkYouTube],
          blogTitle: '블로그',
          blogDescription: '개발, 기술, 취미와 일상에 관한 neuwappbox의 글입니다.',
          showReadingTime: true,
          truncateMarker: /^\{\/\*\s*truncate\s*\*\/\}$|^\[\/\/\]:\s*#\s*\(truncate\)\s*$/m,
          feedOptions: {
            type: ['rss', 'atom'],
            description: 'neuwappbox의 개발 기록과 일상 이야기',
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/neuwcodebox/homepage/blob/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        pages: {
          beforeDefaultRemarkPlugins: [remarkYouTube],
        },
        sitemap: {
          changefreq: null,
          priority: null,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    metadata: [{ name: 'twitter:card', content: 'summary' }],
    navbar: {
      title: 'neuwappbox',
      logo: {
        alt: 'Logo',
        src: 'img/logo.svg',
        width: 24,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docSidebar',
          position: 'left',
          label: 'Docs',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/license', label: 'License', position: 'right' },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
