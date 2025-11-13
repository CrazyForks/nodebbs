'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock } from 'lucide-react';
import { ModerationLogs } from './components/ModerationLogs';
import { PendingContent } from './components/PendingContent';
import { moderationApi } from '@/lib/api';
import { toast } from 'sonner';

export default function ContentModerationPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({ totalTopics: 0, totalPosts: 0 });

  // 加载统计数据
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await moderationApi.getStat();
      setStats({
        totalTopics: data.totalTopics || 0,
        totalPosts: data.totalPosts || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast.error('加载统计数据失败');
    }
  };

  // 当审核操作完成后，刷新统计数据
  const handleModerationComplete = () => {
    loadStats();
  };

  return (
    <div className='space-y-6'>
      {/* Page header */}
      <div>
        <h2 className='text-2xl font-semibold mb-2'>内容审核</h2>
        <p className='text-sm text-muted-foreground'>审核待发布的话题和回复</p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='border border-border rounded-lg p-4 bg-card'>
          <div className='flex items-center gap-3'>
            <Clock className='h-5 w-5 text-yellow-500' />
            <div>
              <p className='text-sm text-muted-foreground'>待审核话题</p>
              <p className='text-2xl font-semibold'>{stats.totalTopics}</p>
            </div>
          </div>
        </div>
        <div className='border border-border rounded-lg p-4 bg-card'>
          <div className='flex items-center gap-3'>
            <Clock className='h-5 w-5 text-yellow-500' />
            <div>
              <p className='text-sm text-muted-foreground'>待审核回复</p>
              <p className='text-2xl font-semibold'>{stats.totalPosts}</p>
            </div>
          </div>
        </div>
        <div className='border border-border rounded-lg p-4 bg-card'>
          <div className='flex items-center gap-3'>
            <Clock className='h-5 w-5 text-yellow-500' />
            <div>
              <p className='text-sm text-muted-foreground'>总计</p>
              <p className='text-2xl font-semibold'>
                {stats.totalTopics + stats.totalPosts}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='all'>全部待审核</TabsTrigger>
          <TabsTrigger value='topic'>话题</TabsTrigger>
          <TabsTrigger value='post'>回复</TabsTrigger>
          <TabsTrigger value='logs'>审核日志</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className='space-y-4 mt-6'>
          {activeTab === 'logs' ? (
            <ModerationLogs />
          ) : (
            <PendingContent
              type={activeTab}
              onModerationComplete={handleModerationComplete}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
