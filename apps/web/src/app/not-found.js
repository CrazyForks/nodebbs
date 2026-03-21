'use client';

import Link from '@/components/common/Link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='flex-1 flex items-center justify-center px-4 py-16'>
      <div className='max-w-sm w-full text-center'>
        {/* 404 数字 */}
        <div className='relative mb-8'>
          <div className='text-[8rem] font-black leading-none tracking-tighter text-muted-foreground/10 select-none'>
            404
          </div>
          <div className='absolute inset-0 flex items-center justify-center'>
            <Search className='h-16 w-16 text-muted-foreground/40 stroke-[1.5]' />
          </div>
        </div>

        {/* 文案 */}
        <h1 className='text-xl font-semibold text-foreground mb-2'>
          页面未找到
        </h1>
        <p className='text-sm text-muted-foreground mb-8'>
          抱歉，您访问的页面不存在或已被删除。
        </p>

        {/* 操作按钮 */}
        <div className='flex items-center justify-center gap-3'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => window.history.back()}
          >
            <ArrowLeft className='h-4 w-4' />
            返回上一页
          </Button>
          <Button size='sm' asChild>
            <Link href='/'>
              <Home className='h-4 w-4' />
              返回首页
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
