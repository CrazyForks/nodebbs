import { TopicList } from '@/components/topic/TopicList';
import { TopicSortTabs } from '@/components/topic/TopicSortTabs';
import { getTemplate } from '@/templates';
import { LAYOUTS } from '@/templates/constants';
import JatraTopicList from '../components/JatraTopicList';

/**
 * Jatra 分类详情页
 */
export default function CategoryView({ category, sort, data, page, totalPages, limit }) {
  const SidebarLayout = getTemplate(LAYOUTS.SidebarLayout);

  return (
    <SidebarLayout>
      <div>
        <div className='flex flex-col gap-2 mb-4 lg:flex-row lg:items-end lg:justify-between lg:gap-4'>
          <div>
            <div className='flex items-center gap-2'>
              <div
                className='w-3 h-3 rounded-sm shrink-0'
                style={{ backgroundColor: category.color }}
              />
              <h1 className='text-2xl font-bold text-foreground'>{category.name}</h1>
            </div>
            {category.description && (
              <p className='text-sm text-muted-foreground mt-1'>{category.description}</p>
            )}
          </div>
          <TopicSortTabs defaultValue={sort} className='w-auto' />
        </div>

        <TopicList
          initialData={data.items}
          total={data.total}
          currentPage={page}
          totalPages={totalPages}
          limit={limit}
          showPagination={true}
          useUrlPagination={true}
          component={JatraTopicList}
        />
      </div>
    </SidebarLayout>
  );
}
