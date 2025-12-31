'use client';

import React, { useState, useEffect } from 'react';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight, X } from 'lucide-react';

// 自定义 useMediaQuery hook，安全处理 SSR
function useMediaQuery(query) {
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export default function StickySidebar({ children, className, enabled = true }) {
  const [open, setOpen] = useState(false);
  // 使用自定义 useMediaQuery 检测屏幕尺寸，SSR 时返回 null
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // SSR 或初次渲染时（isDesktop 为 null），默认渲染桌面版本避免 hydration 不匹配
  if (isDesktop === null || isDesktop || !enabled) {
    return <aside className={className}>{children}</aside>;
  }

  return (
    <Drawer direction='left' open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant='outline' size='icon' className='w-11 h-11 fixed z-10 top-1/2 -left-2 -translate-y-1/2 rounded-none rounded-tr-full rounded-br-full opacity-65'>
          <ChevronRight className='h-6 w-6' />
        </Button>
      </DrawerTrigger>
      <DrawerContent className='right-2 top-2 bottom-2 outline-none w-[310px]'>
        <DrawerHeader>
          <DrawerTitle className='text-right'>
            <DrawerClose>
              <X className='h-6 w-6' />
            </DrawerClose>
          </DrawerTitle>
        </DrawerHeader>
        {/* 移动端覆盖样式 */}
        <div
          className={cn(className, 'p-4 static overflow-y-auto')}
          onClick={(e) => {
            const link = e.target.closest('a');
            if (link) {
              setOpen(false);
            }
          }}
        >
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
