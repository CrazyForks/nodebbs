'use client';

import NotFoundView from '@/components/common/NotFoundView';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <NotFoundView
      icon={<Search className='h-10 w-10 text-muted-foreground/50 stroke-[1.5]' />}
      title='页面未找到'
      description='抱歉，您访问的页面不存在或已被删除。'
    />
  );
}
