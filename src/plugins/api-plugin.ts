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
// http://localhost:5174/api/article/2025/react/mutation-observer
export default apiPlugin;
