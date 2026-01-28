'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MultiSelectCombobox } from './MultiSelectCombobox';

/**
 * 条件编辑器组件
 * 根据条件类型渲染对应的输入控件
 *
 * @param {Object} conditions - 当前条件值
 * @param {Object} permission - 权限对象 { name, slug }
 * @param {Function} onChange - 条件变化回调
 * @param {boolean} disabled - 是否禁用
 * @param {boolean} hasConfig - 是否已有配置
 * @param {Array} conditionTypes - 条件类型定义列表
 * @param {Object} dynamicDataSources - 动态数据源 { categories: [...] }
 */
export function ConditionEditor({
  conditions,
  permission,
  onChange,
  disabled,
  hasConfig,
  conditionTypes = [],
  dynamicDataSources = {},
}) {
  const [open, setOpen] = useState(false);
  const [localConditions, setLocalConditions] = useState(conditions || {});

  // 当外部 conditions 变化时同步
  useEffect(() => {
    setLocalConditions(conditions || {});
  }, [conditions]);

  const handleSave = () => {
    // 清理空值
    const cleaned = Object.entries(localConditions).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== false) {
        if (Array.isArray(value) && value.length === 0) return acc;
        if (key === 'rateLimit') {
          if (value.count && value.period) {
            acc[key] = value;
          }
          return acc;
        }
        if (key === 'timeRange') {
          if (value.start && value.end) {
            acc[key] = value;
          }
          return acc;
        }
        acc[key] = value;
      }
      return acc;
    }, {});

    onChange(Object.keys(cleaned).length > 0 ? cleaned : null);
    setOpen(false);
  };

  const updateCondition = (key, value) => {
    setLocalConditions(prev => ({ ...prev, [key]: value }));
  };

  // 渲染条件输入控件
  const renderConditionInput = (conditionType) => {
    const { key, label, component, description, options, dataSource, placeholder, min, schema } = conditionType;

    // 布尔开关
    if (component === 'switch') {
      return (
        <div key={key} className="flex items-center justify-between py-3 border-b last:border-b-0">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">{label}</Label>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <Switch
            checked={localConditions[key] === true}
            onCheckedChange={(checked) => updateCondition(key, checked || undefined)}
          />
        </div>
      );
    }

    // 数字输入
    if (component === 'number') {
      return (
        <div key={key} className="space-y-2 py-3 border-b last:border-b-0">
          <Label className="text-sm font-medium">{label}</Label>
          <Input
            type="number"
            min={min ?? 0}
            placeholder={placeholder || '不限制'}
            value={localConditions[key] ?? ''}
            onChange={(e) => updateCondition(key, e.target.value ? parseInt(e.target.value) : undefined)}
          />
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      );
    }

    // 多选下拉框
    if (component === 'multiSelect') {
      // 获取选项：优先使用动态数据源，否则使用静态 options
      const selectOptions = dataSource && dynamicDataSources[dataSource]
        ? dynamicDataSources[dataSource]
        : options || [];

      return (
        <div key={key} className="space-y-2 py-3 border-b last:border-b-0">
          <Label className="text-sm font-medium">{label}</Label>
          <MultiSelectCombobox
            value={localConditions[key] || []}
            onChange={(val) => updateCondition(key, val.length > 0 ? val : undefined)}
            options={selectOptions}
            placeholder="选择..."
          />
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      );
    }

    // 频率限制
    if (component === 'rateLimit') {
      const rateLimit = localConditions[key] || { count: '', period: 'hour' };
      const periodOptions = schema?.period?.options || [
        { value: 'minute', label: '每分钟' },
        { value: 'hour', label: '每小时' },
        { value: 'day', label: '每天' },
      ];

      return (
        <div key={key} className="space-y-2 py-3 border-b last:border-b-0">
          <Label className="text-sm font-medium">{label}</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              placeholder="次数"
              value={rateLimit.count || ''}
              onChange={(e) => updateCondition(key, {
                ...rateLimit,
                count: e.target.value ? parseInt(e.target.value) : ''
              })}
              className="w-24"
            />
            <Select
              value={rateLimit.period || 'hour'}
              onValueChange={(value) => updateCondition(key, { ...rateLimit, period: value })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      );
    }

    // 时间范围
    if (component === 'timeRange') {
      const timeRange = localConditions[key] || { start: '', end: '' };
      return (
        <div key={key} className="space-y-2 py-3 border-b last:border-b-0">
          <Label className="text-sm font-medium">{label}</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="time"
              value={timeRange.start || ''}
              onChange={(e) => updateCondition(key, { ...timeRange, start: e.target.value })}
            />
            <span className="text-muted-foreground text-sm">至</span>
            <Input
              type="time"
              value={timeRange.end || ''}
              onChange={(e) => updateCondition(key, { ...timeRange, end: e.target.value })}
            />
          </div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      );
    }

    // 文本列表（逗号分隔）
    if (component === 'textList') {
      return (
        <div key={key} className="space-y-2 py-3 border-b last:border-b-0">
          <Label className="text-sm font-medium">{label}</Label>
          <Input
            placeholder={placeholder || '多个值用逗号分隔'}
            defaultValue={localConditions[key]?.join(', ') || ''}
            onBlur={(e) => {
              const val = e.target.value;
              if (!val) {
                updateCondition(key, undefined);
              } else {
                const items = val.split(',').map(s => s.trim()).filter(Boolean);
                updateCondition(key, items.length > 0 ? items : undefined);
              }
            }}
          />
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      );
    }

    return null;
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('w-7 h-7', hasConfig ? 'text-primary' : 'text-muted-foreground/30')}
          disabled={disabled}
        >
          <Settings2 className="h-3.5 w-3.5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>条件配置</DrawerTitle>
            <DrawerDescription>
              为 &quot;{permission.name}&quot; 设置生效条件
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {conditionTypes.map(renderConditionInput)}
          </div>
          <DrawerFooter>
            <Button onClick={handleSave}>确定</Button>
            <DrawerClose asChild>
              <Button variant="outline">取消</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
