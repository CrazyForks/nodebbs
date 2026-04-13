import { getCategoriesTree } from '@/lib/server/topics';
import { CategoriesUI } from './components/CategoriesUI';

export const metadata = {
  title: '分类',
  description: '浏览所有话题分类，发现感兴趣的内容。',
};

export default async function CategoriesPage() {
  const categories = await getCategoriesTree();

  return (
    <div className='py-3 sm:py-6 lg:px-4'>
      <CategoriesUI categories={categories} />
    </div>
  );
}
