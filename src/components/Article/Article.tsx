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
