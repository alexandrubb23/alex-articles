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
