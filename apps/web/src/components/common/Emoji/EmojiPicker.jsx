'use client';

import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { useEmoji } from './EmojiProvider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, X, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmojiPicker({ onSelect, className }) {
  const { groups, loading } = useEmoji();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(null);
  const [hoveredEmoji, setHoveredEmoji] = useState(null);

  // 初始化默认激活分组
  useEffect(() => {
    if (groups.length > 0 && !activeTab) {
      setActiveTab(groups[0].slug);
    }
  }, [groups, activeTab]);

  // 根据搜索关键词过滤表情
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;

    const lowerSearch = search.toLowerCase();

    return groups.map(group => ({
      ...group,
      emojis: group.emojis?.filter(emoji =>
        emoji.code.toLowerCase().includes(lowerSearch)
      ) || []
    })).filter(group => group.emojis.length > 0);
  }, [groups, search]);

  // 当前显示的分组
  const currentGroup = useMemo(() => {
    if (search) return null;
    return groups.find(g => g.slug === activeTab);
  }, [groups, activeTab, search]);

  // 处理表情选择
  const handleSelect = useCallback((groupSlug, code) => {
    onSelect(`${groupSlug}/${code}`);
  }, [onSelect]);

  // 清空搜索
  const clearSearch = useCallback(() => {
    setSearch('');
  }, []);

  if (loading) {
    return (
      <div className={cn("flex flex-col h-[360px] w-[340px] items-center justify-center", className)}>
        <Smile className="h-8 w-8 text-muted-foreground/50 animate-pulse" />
        <span className="text-sm text-muted-foreground mt-2">加载表情...</span>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className={cn("flex flex-col h-[360px] w-[340px] items-center justify-center", className)}>
        <Smile className="h-8 w-8 text-muted-foreground/30" />
        <span className="text-sm text-muted-foreground mt-2">暂无表情包</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-[360px] w-[340px] bg-popover rounded-lg overflow-hidden", className)}>
      {/* 搜索栏 */}
      <div className="p-3 border-b bg-muted/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="搜索表情..."
            className="pl-9 pr-8 h-9 bg-background/80 border-0 focus-visible:ring-1 focus-visible:ring-ring"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* 分组标签栏 */}
      {!search && (
        <div className="flex border-b bg-muted/20 overflow-x-auto scrollbar-none">
          {groups.map(group => (
            <button
              key={group.slug}
              onClick={() => setActiveTab(group.slug)}
              className={cn(
                "flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-all relative",
                "hover:bg-muted/50",
                activeTab === group.slug
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {group.name}
              {/* 激活指示器 */}
              {activeTab === group.slug && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* 表情网格区域 */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {search ? (
            filteredGroups.length > 0 ? (
              <div className="space-y-4">
                {filteredGroups.map(group => (
                  <div key={group.id}>
                    <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
                      {group.name}
                      <span className="ml-1 text-muted-foreground/60">({group.emojis.length})</span>
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {group.emojis.map(emoji => (
                        <EmojiButton
                          key={emoji.id}
                          emoji={emoji}
                          groupSlug={group.slug}
                          onSelect={handleSelect}
                          onHover={setHoveredEmoji}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-30" />
                <span className="text-sm">未找到相关表情</span>
                <span className="text-xs mt-1 opacity-60">试试其他关键词</span>
              </div>
            )
          ) : (
            currentGroup && (
              <div className="grid grid-cols-8 gap-1">
                {currentGroup.emojis?.map(emoji => (
                  <EmojiButton
                    key={emoji.id}
                    emoji={emoji}
                    groupSlug={currentGroup.slug}
                    onSelect={handleSelect}
                    onHover={setHoveredEmoji}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </ScrollArea>

      {/* 底部预览栏 */}
      <div className="h-10 border-t bg-muted/20 px-3 flex items-center">
        {hoveredEmoji ? (
          <div className="flex items-center gap-2 text-sm">
            <img
              src={hoveredEmoji.url}
              alt={hoveredEmoji.code}
              className="inline-block"
              style={{ width: 20, height: 20 }}
              draggable={false}
            />
            <span className="text-muted-foreground font-mono text-xs truncate">
              :emoji[{hoveredEmoji.groupSlug}/{hoveredEmoji.code}]
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/60">
            {currentGroup ? `${currentGroup.name} · ${currentGroup.emojis?.length || 0} 个表情` : '选择表情'}
          </span>
        )}
      </div>
    </div>
  );
}

// 表情按钮组件（memo 避免 hoveredEmoji 变化时全量重渲染）
const EmojiButton = memo(function EmojiButton({ emoji, groupSlug, onSelect, onHover }) {
  return (
    <button
      className={cn(
        "aspect-square rounded-lg flex items-center justify-center",
        "hover:bg-accent hover:scale-110 active:scale-95",
        "transition-all duration-150 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      )}
      onClick={() => onSelect(groupSlug, emoji.code)}
      onMouseEnter={() => onHover({ ...emoji, groupSlug })}
      onMouseLeave={() => onHover(null)}
    >
      <img
        src={emoji.url}
        alt={emoji.code}
        className="inline-block select-none"
        style={{ width: 28, height: 28 }}
        draggable={false}
      />
    </button>
  );
});
