'use client';

import React from 'react';
import { Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { EmojiPicker } from '@/components/common/Emoji/EmojiPicker';
import { useEmoji } from '@/components/common/Emoji/EmojiProvider';

export const EmojiTool = ({ editor, disabled }) => {
  const { groups, loading } = useEmoji();
  
  const handleSelect = (code) => {
    // 在光标位置插入表情
    editor.insertText(`:emoji[${code}]`);
  };

  // 加载中或没有可用表情时不显示按钮
  if (loading || groups.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="插入表情"
          disabled={disabled}
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="start">
        <EmojiPicker onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
};
