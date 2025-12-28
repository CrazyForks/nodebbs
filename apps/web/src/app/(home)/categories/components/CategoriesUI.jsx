import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tag, MessageSquare, Eye } from 'lucide-react';
import Time from '@/components/common/Time';
import { Loading } from '@/components/common/Loading';

/**
 * 分类列表 UI 组件
 * 纯展示组件，接收分类数据进行渲染
 */
export function CategoriesUI({ categories, loading, error }) {
  // 错误状态
  if (error) {
    return (
      <div className='flex-1 flex items-center justify-center text-red-500'>
        加载失败: {error.message}
      </div>
    );
  }

  return (
    <>
      {/* 页面标题和操作 */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4'>
        <div>
          <h1 className='text-2xl font-semibold text-foreground mb-2'>
            所有分类
          </h1>
          <p className='text-sm text-muted-foreground'>
            {!loading && categories.length > 0 && (
              <>共 {categories.length} 个分类，浏览所有讨论主题</>
            )}
            {!loading && categories.length === 0 && <>还没有创建任何分类</>}
          </p>
        </div>
      </div>

      {/* 加载状态 */}
      {loading ? (
        <Loading text='加载中...' className='flex-row py-16' />
      ) : categories.length === 0 ? (
        // 空状态
        <div className='text-center py-16 bg-card border border-border rounded-lg'>
          <Tag className='h-16 w-16 text-muted-foreground/50 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-foreground mb-2'>
            暂无分类
          </h3>
          <p className='text-sm text-muted-foreground'>还没有创建任何分类</p>
        </div>
      ) : (
        // 分类列表
        <div className='bg-card border border-border rounded-lg overflow-hidden'>
          {/* 列表头部 */}
          <div className='px-4 py-2.5 bg-muted/30 border-b border-border'>
            <div className='grid grid-cols-12 gap-4 text-xs font-semibold text-muted-foreground'>
              <div className='col-span-5'>分类</div>
              <div className='col-span-4 hidden md:block'>最新话题</div>
              <div className='col-span-3 text-center'>统计</div>
            </div>
          </div>

          {/* 分类项目 */}
          <div className='divide-y divide-border'>
            {categories.map((category) => (
              <CategoryItem key={category.id} category={category} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * 单个分类项组件
 */
function CategoryItem({ category }) {
  return (
    <div className='px-4 py-4 hover:bg-accent/50 transition-colors group'>
      <div className='grid grid-cols-12 gap-4 items-center'>
        {/* 左侧：分类信息 */}
        <div className='col-span-5'>
          <div className='flex items-center gap-2 mb-2'>
            <div
              className='w-3 h-3 rounded-sm shrink-0'
              style={{ backgroundColor: category.color }}
            />
            <Link
              href={`/categories/${category.slug}`}
              className='font-semibold text-foreground hover:text-primary transition-colors'
            >
              {category.name}
            </Link>
          </div>
          {category.description && (
            <p className='text-sm text-muted-foreground line-clamp-2 ml-5'>
              {category.description}
            </p>
          )}
          {/* 子分类 */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div className='flex items-center gap-2 flex-wrap mt-2 ml-5'>
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${sub.slug}`}
                  className='inline-block'
                >
                  <Badge
                    variant='outline'
                    className='text-xs cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors'
                  >
                    {sub.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 中间：最新话题 */}
        <div className='col-span-4 hidden md:block'>
          {category.latestTopic ? (
            <Link
              href={`/topic/${category.latestTopic.id}`}
              className='block'
            >
              <p className='text-sm text-foreground line-clamp-1 hover:text-primary transition-colors mb-1'>
                {category.latestTopic.title}
              </p>
              <p className='text-xs text-muted-foreground'>
                <Time date={category.latestTopic.updatedAt} fromNow />
              </p>
            </Link>
          ) : (
            <p className='text-sm text-muted-foreground'>暂无话题</p>
          )}
        </div>

        {/* 右侧：统计信息 */}
        <div className='col-span-3'>
          <div className='flex flex-col gap-1.5 text-xs text-muted-foreground'>
            <div className='flex items-center justify-center gap-1.5'>
              <MessageSquare className='h-3.5 w-3.5' />
              <span className='font-medium'>{category.topicCount || 0}</span>
              <span className='hidden sm:inline'>话题</span>
            </div>
            <div className='flex items-center justify-center gap-1.5'>
              <Eye className='h-3.5 w-3.5' />
              <span className='font-medium'>{category.viewCount || 0}</span>
              <span className='hidden sm:inline'>浏览</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
