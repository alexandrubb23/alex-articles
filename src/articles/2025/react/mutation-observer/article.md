---
title: '🧬 Inject Copy Button into Code Block Using MutationObserver in a React Application'
date: '2025-06-26'
topic: 'React'
---

![MutationObserver](https://alexandrub.s3.us-east-1.amazonaws.com/mutation-observer.png)

_Enhance code blocks in your blog using MutationObserver and React_

The [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) API can be very useful in a [React](https://react.dev/) application when you need to respond to DOM changes outside [React’s virtual DOM](https://legacy.reactjs.org/docs/faq-internals.html) lifecycle. This becomes especially handy when integrating with third-party libraries or dealing with dynamically rendered content such as Markdown.

## 📦 Common Use Cases for MutationObserver in React

1. Integrating with Third-party Libraries:

Libraries like [Markdown](https://www.markdownguide.org/) parsers, [PrismJS](https://prismjs.com/) syntax highlighters, or even ad services modify the DOM after [React](https://react.dev/) has rendered. [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) lets us monitor those changes and take action—such as injecting UI elements.

2. Parsing Markdown into HTML:

Suppose you're building a blog that transforms `.md` files like:

```md
---
title: How to filter an array efficiently
slug: how-to-filter-an-array-efficiently
---

<h1>How to filter an array efficiently</h1>
```

…into:

```json
{
  "content": "<h1>How to filter an array efficiently</h1>",
  "data": {
    "title": "How to filter an array efficiently",
    "slug": "how-to-filter-an-array-efficiently"
  }
}
```

To achieve this, you’ll likely use:

- [Gray Matter](https://github.com/jonschlinkert/gray-matter)
- [Remark](https://remark.js.org/)
- [Remark HTML](https://remark.js.org/)
- [PrismJS](https://github.com/PrismJS/prism#readme)
- [Chakra UI](https://chakra-ui.com/) fot styling

## ✂️ Create a CopyButtonToClipboard Component

To allow users to copy code easily, we’ll inject a copy button into each `<pre>` block:

```ts
const CopyButtonToClipboard = ({ value }: { value: string }) => {
  return (
    <Clipboard.Root value={value}>
      <Clipboard.Trigger asChild>
        <Button variant='surface' size='sm'>
          <Clipboard.Indicator />
          <Clipboard.CopyText />
        </Button>
      </Clipboard.Trigger>
    </Clipboard.Root>
  );
};
```

## 👀 Inject the Button Using MutationObserver

Create a `CopyButtonsInjector` component that watches for changes and adds the button dynamically:

```ts
const CopyButtonsInjector = () => {
  useEffect(() => {
    const targetNode = document.getElementById('post-content');
    if (!targetNode) return;

    // Add immediately for existing content
    injectCopyButtonsIntoCodeBlocks();

    const observer = new MutationObserver(injectCopyButtonsIntoCodeBlocks);
    observer.observe(targetNode, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
};
```

## 🧠 Function to Inject the Copy Button

This utility injects a React-copy button into every valid `<pre>` block:

```ts
const injectCopyButtonsIntoCodeBlocks = () => {
  const pres = document.querySelectorAll('pre');

  pres.forEach(pre => {
    if (pre.querySelector('[data-copy-btn]')) return;
    if (!pre.textContent?.trim()) return;

    const wrapper = document.createElement('div');
    wrapper.dataset.copyBtn = 'true';
    wrapper.style.position = 'absolute';
    wrapper.style.top = '10px';
    wrapper.style.right = '0.5rem';
    wrapper.style.zIndex = '10';

    pre.style.position = 'relative';
    pre.appendChild(wrapper);

    const root = createRoot(wrapper);
    root.render(
      <ChakraProvider value={defaultSystem}>
        <CopyButtonToClipboard value={pre.textContent} />
      </ChakraProvider>
    );
  });
};
```

## ✅ Pros of Using MutationObserver

- Works seamlessly with dynamic or third-party content.
- Great for injecting functionality post-render.
- Keeps your main app logic isolated from third-party chaos.

## ⚠️ Cons: Do You Really Need It?

In many cases, especially if your content is rendered once and not updated dynamically, MutationObserver may be overkill. Here's a simpler version:

```ts
const CopyButtonsInjector = () => {
  useEffect(() => {
    const pres = document.querySelectorAll('pre');

    pres.forEach(pre => {
      if (pre.querySelector('.copy-btn-wrapper')) return;
      if (!pre.textContent?.trim()) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'copy-btn-wrapper';
      wrapper.style.position = 'absolute';
      wrapper.style.top = '0.1rem';
      wrapper.style.right = '0.5rem';
      wrapper.style.zIndex = '10';

      pre.style.position = 'relative';
      pre.appendChild(wrapper);

      const root = createRoot(wrapper);
      root.render(
        <ChakraProvider value={defaultSystem}>
          <CopyButtonToClipboard value={pre.textContent} />
        </ChakraProvider>
      );
    });
  });

  return null;
};
```

## Let's Build a Working Example

We’ll create a full Vite-powered [React](https://react.dev/) app and simulate a real API using a custom Vite plugin.

TLDR:

## Step-by-Step Guide

1. Create a ViteJS App

```bash
npm create vite@latest
```

Name the project blog, select React with TypeScript.

```bash
cd blog && npm i && npm run dev
```

2. Add API Plugin

- Create: `src/constants/api.ts`

```ts
const date = new Date();

export const API_ENDPOINT = '/api/article';
export const ARTICLE_PATH = `src/articles/${date.getFullYear()}`;
```

- Install `gray-matter`:

```bash
npm i gray-matter
```

- Create: `src/plugins/api-plugin.ts`

```ts
// /src/plugin/api-plugin.ts
import { type Plugin } from 'vite';
import fs from 'fs';
import matter from 'gray-matter';
import { API_ENDPOINT, ARTICLE_PATH } from '../constants/api';

// Don't do/use this in production, it's just for development/demo purposes!!
const apiPlugin = (): Plugin => {
  return {
    name: 'article-api',
    configureServer(server) {
      server.middlewares.use(API_ENDPOINT, (req, res) => {
        const url = new URL(req.url || '', 'http://localhost');

        const slug = url.pathname.replace(/\//, '');
        const filePath = `${ARTICLE_PATH}/${slug}/article.md`;

        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'application/json');

          const content = fs.readFileSync(filePath, 'utf-8');

          const parsed = matter(content);
          const response = JSON.stringify({
            content: parsed.content,
            data: {
              title: parsed.data.title || 'Untitled',
              date: parsed.data.date || new Date().toISOString(),
              slug: slug,
            },
          });

          res.end(response);
        } else {
          res.statusCode = 404;
          res.end('Article not found');
        }
      });
    },
  };
};

export default apiPlugin;
```

- Edit `vite.config.ts`

```ts
// vite.config.js
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import api from './src/plugins/api-plugin';
import path from 'path';

export default defineConfig({
  plugins: [react(), api()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
});
```

3. Create Dummy Article File

```bash
mkdir -p src/articles/2025/react/mutation-observer/ && \
curl -o src/articles/2025/react/mutation-observer/article.md https://raw.githubusercontent.com/alexandrubb23/alex-articles/abc123/src/articles/2025/react/mutation-observer/article.md


```

Download `article.md` and place it inside the above folder.

4. Confirm It Works

Visit:

```
http://localhost:5173/api/article/react/mutation-observer
```

## Display the Article

We’ll use `remark`, `prismjs`, and `@tanstack/react-query`.

- Create hooks: `useAddClassToSpecificTags.ts`, `useProcessContentToHTML.ts`, `useGetArticle.ts`
- Install dependencies:

1. useAddClassToSpecificTags hook

```ts
// src/hooks/useAddClassToSpecificTags.ts
import type { JSX } from 'react';

type HTMLTags = keyof JSX.IntrinsicElements;

export type HTMLObject = {
  tags: HTMLTags[];
  className?: string;
};

const useAddClassToSpecificTags = ({ className, tags }: HTMLObject) => {
  const applyClass = (html: string) => {
    return html.replace(
      new RegExp(`<(\/?)(${tags.join('|')})\\b`, 'gi'),
      (_, closingSlash, tagName) => {
        if (closingSlash) {
          return `</${tagName}`;
        } else {
          return `<${tagName} class="${className}"`;
        }
      }
    );
  };

  return { applyClass };
};

export default useAddClassToSpecificTags;
```

2. useProcessContentToHTML hook

```ts
// src/hooks/useProcessContentToHTML.ts
import Prism from 'prismjs';
import { useEffect, useState } from 'react';

import { remark } from 'remark';
import html from 'remark-html';

const parse = async (content: string, onParse: (content: string) => void) => {
  const contentHTML = await remark().use(html).process(content);
  onParse(contentHTML.toString());
};

const useProcessContentToHTML = (content: string) => {
  const [parsedContent, setParsedContent] = useState<string>('');

  useEffect(() => {
    parse(content, setParsedContent);
  }, [content]);

  useEffect(() => {
    Prism.highlightAll();
  }, [parsedContent]);

  return parsedContent;
};

export default useProcessContentToHTML;
```

```bash
npm i prismjs remark remark-html @tanstack/react-query @types/prismjs
```

3. useGetArticle hook

```ts
// src/hooks/useGetArticle.ts
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINT } from '../constants/api';

export type ApiResponse = {
  content: string;
  data: {
    title: string;
    date: string;
    slug: string;
  };
};

const fetchArticle = async (slug: string) => {
  const response = await fetch(`${API_ENDPOINT}/${slug}`);
  if (!response.ok) throw new Error(`Article "${slug}" not found`);

  return response.json();
};

const useGetArticle = (slug: string) =>
  useQuery<ApiResponse>({
    queryKey: ['article', slug],
    queryFn: () => fetchArticle(slug),
    refetchOnWindowFocus: false,
  });

export default useGetArticle;
```

## Create the Article Component

- Create folder: `src/components/Article`
- Implement compound components to render title and body
- Use Chakra UI, and the hooks above

```ts
// src/components/Article/Article.tsx
import useGetArticle, { type ApiResponse } from '../../hooks/useGetArticle';

import { Box, Heading, Spinner } from '@chakra-ui/react';
import { createContext, useContext, type PropsWithChildren } from 'react';
import useAddClassToSpecificTags, {
  type HTMLObject,
} from '~/hooks/useAddClassToSpecificTags';
import useProcessContentToHTML from '~/hooks/useProcessContentToHTML';
import CopyButtonsInjector from '../CopyButton';

import styles from '~/post.module.css';
import '~/prism-themes.css';

const htmlObject: HTMLObject = {
  tags: ['pre', 'code'],
  className: 'language-js',
};

const ArticleContext = createContext<ApiResponse>({
  content: '',
  data: {
    title: '',
    date: '',
    slug: '',
  },
});

const useArticleContextProvider = () => useContext(ArticleContext);

const Article = ({ children }: PropsWithChildren) => {
  const { data: article, isLoading } = useGetArticle('react/mutation-observer');

  if (isLoading) return <Spinner size='xl' color='blue.500' />;

  if (!article) return <div>No article found</div>;

  return (
    <ArticleContext.Provider value={article}>
      {children}
    </ArticleContext.Provider>
  );
};

const Title = () => {
  const article = useArticleContextProvider();

  return (
    <Heading
      as='h1'
      fontSize='2rem'
      lineHeight='1.3'
      fontWeight='800'
      letterSpacing='-0.05rem'
    >
      {article.data.title}
    </Heading>
  );
};

const Body = () => {
  const article = useArticleContextProvider();

  const content = useProcessContentToHTML(article.content);
  const tagsClass = useAddClassToSpecificTags(htmlObject);

  const html = tagsClass.applyClass(content);

  return (
    <>
      <CopyButtonsInjector />
      <Box
        dangerouslySetInnerHTML={{
          __html: html,
        }}
        className={styles.post}
        id='post-content'
      />
    </>
  );
};

Article.Title = Title;
Article.Body = Body;

export default Article;
```

## Add the Copy Button (again)

Create `CopyButton.tsx` under components. Implement both the copy button and **MutationObserver** injector here.

```ts
'use client';

import {
  Button,
  ChakraProvider,
  Clipboard,
  defaultSystem,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const CopyButtonToClipboard = ({ value }: { value: string }) => {
  return (
    <Clipboard.Root value={value}>
      <Clipboard.Trigger asChild>
        <Button variant='surface' size='sm'>
          <Clipboard.Indicator />
          <Clipboard.CopyText />
        </Button>
      </Clipboard.Trigger>
    </Clipboard.Root>
  );
};

const injectCopyButtonsIntoCodeBlocks = () => {
  const pres = document.querySelectorAll('pre');

  pres.forEach(pre => {
    if (pre.querySelector('[data-copy-btn]')) return;

    if (!pre.textContent?.trim()) return;

    const wrapper = document.createElement('div');
    wrapper.dataset.copyBtn = 'true';
    wrapper.style.position = 'absolute';
    wrapper.style.top = '10px';
    wrapper.style.right = '0.5rem';
    wrapper.style.zIndex = '10';

    pre.style.position = 'relative';
    pre.appendChild(wrapper);

    const root = createRoot(wrapper);
    root.render(
      <ChakraProvider value={defaultSystem}>
        <CopyButtonToClipboard value={pre.textContent} />
      </ChakraProvider>
    );
  });
};

const CopyButtonsInjector = () => {
  useEffect(() => {
    const targetNode = document.getElementById('post-content');
    if (!targetNode) {
      return;
    }

    // Add immediately for existing content
    injectCopyButtonsIntoCodeBlocks();

    const observer = new MutationObserver(injectCopyButtonsIntoCodeBlocks);
    observer.observe(targetNode, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
};

export default CopyButtonsInjector;
```

Install Chakra UI:

```bash
npm i @chakra-ui/react
```

## Style the Page

Replace `index.css`, add `post.module.css`, `prism-themes.css`.

1. `index.css`

```css
body {
  padding: 20px;
  max-width: 1024px;
  margin: 0 auto;
}
a {
  color: #1970f1 !important;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

form {
  width: 100%;
}

p {
  line-height: 1.75rem;
}

ol {
  padding-left: 20px;
  margin: 0;
  list-style-type: decimal;
}

ol li {
  font-weight: 900;
}

pre {
  font-size: 14px;
}

em {
  border-left: 7px solid dodgerblue;
  border-radius: 5px;
  display: block;
  line-height: inherit;
  padding: 5px;
}

blockquote {
  margin: 0;
  padding: 20px;
  border-left: 4px solid #333;
  background-color: #f5f5f5;
  color: #333;
  font-style: italic;
}

blockquote p {
  margin: 0;
}

blockquote:before {
  content: '\201C';
  font-size: 30px;
  margin-right: 10px;
  vertical-align: middle;
}

blockquote:after {
  content: '';
}

.chakra-ui-light em {
  background-color: ghostwhite;
  color: black;
}

.chakra-ui-dark em {
  border-left: 7px solid dodgerblue;
  border-radius: 5px;
  display: inline-block;
  line-height: inherit;
  padding: 5px;
  background-color: #222;
  color: #fff;
}

```

2. `post.module.css`

```css
.post ul {
  display: block;
  list-style-type: disc;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  padding-inline-start: 40px;
}

.post h2 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.5;
  margin: 1rem 0 1rem 0;
}

.post p {
  margin: 1rem 0 1rem 0;
}

.post p:first-child {
  margin-top: 0;
}

.post img {
  margin-bottom: 15px;
}
```

3. `prism-themes.css`

```css
code[class*='language-'],
pre[class*='language-'] {
  color: #393a34;
  background: none;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
  white-space: pre-wrap; /* Preserve line breaks */
  word-break: break-word; /* Wrap long words */
  max-width: 100%;
}

pre > code[class*='language-'] {
  font-size: 1em;
}

pre[class*='language-']::-moz-selection,
pre[class*='language-'] ::-moz-selection,
code[class*='language-']::-moz-selection,
code[class*='language-'] ::-moz-selection {
  background: #b3d4fc;
}

pre[class*='language-']::selection,
pre[class*='language-'] ::selection,
code[class*='language-']::selection,
code[class*='language-'] ::selection {
  background: #b3d4fc;
}

/* Code blocks */
pre[class*='language-'] {
  padding: 1em;
  margin: 0.5em 0;
  overflow: auto;
  border: 1px solid #dddddd;
  background-color: white;
}

/* Inline code */
:not(pre) > code[class*='language-'] {
  padding: 0.2em;
  padding-top: 1px;
  padding-bottom: 1px;
  background: #f8f8f8;
  border: 1px solid #dddddd;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #999988;
  font-style: italic;
}

.token.namespace {
  opacity: 0.7;
}

.token.string,
.token.attr-value {
  color: #e3116c;
}

.token.punctuation,
.token.operator {
  color: #393a34; /* no highlight */
}

.token.entity,
.token.url,
.token.symbol,
.token.number,
.token.boolean,
.token.variable,
.token.constant,
.token.property,
.token.regex,
.token.inserted {
  color: #36acaa;
}

.token.atrule,
.token.keyword,
.token.attr-name,
.language-autohotkey .token.selector {
  color: #00a4db;
}

.token.function,
.token.deleted,
.language-autohotkey .token.tag {
  color: #9a050f;
}

.token.tag,
.token.selector,
.chakra-ui-light.language-autohotkey .token.keyword {
  color: #00009f;
}

.token.important,
.token.function,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}
```

4. Open `main.tsx` and paste:

```ts
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';

import './index.css';
import App from './App.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    </QueryClientProvider>
  </StrictMode>
);
```

## Final Step – Use in App.tsx

```ts
import Article from './components/Article/Article';

const App = () => (
  <Article>
    <Article.Title />
    <Article.Body />
  </Article>
);

export default App;
```

## Get Rid of TypeScript Errors

1. Open `tsconfig.app.json` and add the following:

```json
{
  "compilerOptions": {
    ...
    "paths": {
      "~/*": ["./src/*"]
    }
  },
}
```

2. Install Node.js types:

```bash
npm i --save-dev @types/node  
```

3. Run the App

```bash
npm run dev
```

4. And visit

```bash
http://localhost:5173/
```

## 🎉 The Result

You should see a page exactly like the one you’re reading right now — with a smile on your face 😊

## 🧩 Final Thoughts

The [MutationObserver API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) can be a powerful tool—but like any tool, it’s best used when the need truly arises. For static or idempotent content, a one-time scan is usually enough. But for dynamic content, this approach gives you flexibility and power with minimal coupling to external rendering cycles.

