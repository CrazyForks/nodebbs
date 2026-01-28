'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { X, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 多选 Combobox 组件
 * 使用 Popover + Command 实现，支持搜索和多选
 *
 * @param {Array} value - 选中的值数组
 * @param {Function} onChange - 值变化回调
 * @param {Array} options - 选项列表 [{ value, label }]
 * @param {string} placeholder - 占位文本
 * @param {boolean} disabled - 是否禁用
 */
export function MultiSelectCombobox({
  value = [],
  onChange,
  options = [],
  placeholder = '请选择...',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  const selectedSet = new Set(value);

  const handleSelect = (selectedValue) => {
    if (selectedSet.has(selectedValue)) {
      onChange(value.filter(v => v !== selectedValue));
    } else {
      onChange([...value, selectedValue]);
    }
  };

  const handleRemove = (removedValue) => {
    onChange(value.filter(v => v !== removedValue));
  };

  const getLabel = useCallback((val) => {
    const opt = options.find(o => o.value === val);
    return opt?.label || String(val);
  }, [options]);

  return (
    <div className="space-y-2">
      {/* 选中项显示区域 */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((v) => (
            <Badge
              key={v}
              variant="secondary"
              className="text-xs px-1.5 py-0.5 h-6 gap-1"
            >
              {getLabel(v)}
              <button
                type="button"
                className="ml-0.5 rounded-full hover:bg-muted-foreground/20"
                onClick={() => handleRemove(v)}
                disabled={disabled}
              >
                <X className="h-3 w-3 hover:text-destructive" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Popover 选择器 */}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-9 font-normal"
          >
            <span className="text-muted-foreground">
              {value.length > 0 ? `已选择 ${value.length} 项` : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="搜索..." />
            <CommandList>
              <CommandEmpty>无匹配选项</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => handleSelect(opt.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedSet.has(opt.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
