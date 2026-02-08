'use client';

import React from 'react';
import { useEmoji } from './EmojiProvider';
import { cn } from '@/lib/utils';

// 默认尺寸（像素）
const DEFAULT_SIZE = 24;

/**
 * Emoji 组件
 * 根据 code 渲染自定义表情图片，未找到时回退为文本
 *
 * @param {string} code - 表情标识符（group/code 或 code）
 * @param {number|string} size - 尺寸（像素），默认 24
 * @param {string} className - 额外样式类
 */
export const Emoji = ({ code, size, className, ...props }) => {
  const { getEmoji, loading } = useEmoji();
  const emoji = getEmoji(code);

  // 尺寸优先级：传入 size > 分组默认尺寸 > 全局默认尺寸
  const pixelSize = parseInt(size || emoji?.groupSize || DEFAULT_SIZE, 10);

  const sizeStyle = {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };

  // 加载中占位符
  if (loading) {
    return <span className="inline-block align-text-bottom opacity-50" style={sizeStyle}>...</span>;
  }

  // 渲染表情图片
  if (emoji) {
    return (
      <img
        src={emoji.url}
        alt={`:emoji[${code}]`}
        title={`:emoji[${code}]`}
        className={cn("inline-block align-text-bottom select-none not-prose", className)}
        style={sizeStyle}
        draggable={false}
        {...props}
      />
    );
  }

  // 未找到表情，回退显示原始文本
  return <span className="text-muted-foreground opacity-80 select-none">:emoji[{code}]</span>;
};
