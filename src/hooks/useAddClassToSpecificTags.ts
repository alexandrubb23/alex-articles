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
