'use client';

import NotFoundView from '@/components/common/NotFoundView';
import { MessageSquareOff } from 'lucide-react';

export default function NotFound() {
  return (
    <NotFoundView
      icon={<MessageSquareOff className='h-10 w-10 text-muted-foreground/50 stroke-[1.5]' />}
      title='话题不存在'
      description='该话题可能已被删除或从未发布过。'
    />
  );
}
