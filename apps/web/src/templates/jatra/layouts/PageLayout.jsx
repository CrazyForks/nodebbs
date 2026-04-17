import { Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import DesktopNavAside from '../components/DesktopNavAside';
import { getCategoriesData } from '@/lib/server/topics';

/**
 * Jatra PageLayout（服务端组件）
 * 所有页面共享的框架：面包屑 + 左侧导航 + 内容容器
 * 右侧栏由各 View 通过 SidebarLayout 自行决定
 */
export default async function PageLayout({ children }) {
  const categories = await getCategoriesData({ isFeatured: true });

  return (
    <>
      {/* 面包屑导航条 */}
      {/* <div className='w-full bg-muted/50 dark:bg-muted/30 border-b border-border'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 py-2.5 text-sm text-muted-foreground'>
          <Link href='/' className='hover:text-primary transition-colors flex items-center'>
            <Home className='w-4 h-4' />
          </Link>
          <ChevronRight className='w-3 h-3 text-muted-foreground/50' />
          <span className='font-medium'>Feed</span>
        </div>
      </div> */}

      {/* 三栏容器：左侧导航始终显示，右侧由 children 自行决定 */}
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex gap-8 items-start pt-6 pb-12'>
        <DesktopNavAside categories={categories} />

        <div className='flex-1 min-w-0'>
          {children}
        </div>
      </div>
    </>
  );
}
