'use client';

import Link from '@/components/common/Link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, MessageSquareOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='flex-1 flex items-center justify-center px-4 py-16'>
      <div className='max-w-sm w-full text-center'>
        <div className='flex justify-center mb-6'>
          <div className='rounded-full bg-muted/50 p-5'>
            <MessageSquareOff className='h-10 w-10 text-muted-foreground/50 stroke-[1.5]' />
          </div>
        </div>

        <h1 className='text-xl font-semibold text-foreground mb-2'>
          话题不存在
        </h1>
        <p className='text-sm text-muted-foreground mb-8'>
          该话题可能已被删除或从未发布过。
        </p>

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
