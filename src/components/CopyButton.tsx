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
