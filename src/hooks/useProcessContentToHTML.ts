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
