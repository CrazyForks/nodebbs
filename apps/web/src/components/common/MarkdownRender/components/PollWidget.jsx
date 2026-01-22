'use client';

import { useState, useEffect } from 'react';

/**
 * 投票组件
 * 根据 pollId 从服务端获取投票数据并渲染
 * 
 * @param {Object} props
 * @param {string} props.pollId - 投票 ID
 */
export default function PollWidget({ pollId }) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!pollId) return;
    
    // TODO: 实现真实的 API 调用
    // fetchPollData();
    
    // 模拟加载
    setLoading(false);
  }, [pollId]);

  // TODO: 实现投票 API 调用
  const handleVote = async () => {
    if (selectedOptions.length === 0) return;
    
    // TODO: 调用投票 API
    // await pollApi.vote(pollId, selectedOptions);
    
    setHasVoted(true);
  };

  // 加载中状态
  if (loading) {
    return (
      <div className="my-4 p-4 border border-border rounded-lg bg-card animate-pulse">
        <div className="h-5 bg-muted rounded w-1/3 mb-3"></div>
        <div className="space-y-2">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="my-4 p-4 border border-destructive/30 rounded-lg bg-destructive/5 text-destructive text-sm">
        投票加载失败：{error}
      </div>
    );
  }

  // 占位 UI（等待后端 API 实现）
  return (
    <div className="my-4 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <span>📊</span>
        <span>投票组件</span>
        <span className="text-xs font-mono opacity-60">ID: {pollId}</span>
      </div>
      
      {/* 占位：投票标题 */}
      <div className="font-medium mb-3 text-foreground">
        [投票标题将从服务端加载]
      </div>
      
      {/* 占位：投票选项 */}
      <div className="space-y-2 mb-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
          >
            <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-full" />
            <span className="text-muted-foreground">选项 {i}</span>
          </div>
        ))}
      </div>
      
      {/* 占位：投票按钮 */}
      <button
        disabled
        className="w-full py-2 px-4 bg-primary/50 text-primary-foreground rounded-lg cursor-not-allowed opacity-50"
      >
        投票（等待后端实现）
      </button>
      
      {/* 占位：投票统计 */}
      <div className="mt-3 text-xs text-muted-foreground text-center">
        0 人已投票
      </div>
    </div>
  );
}
