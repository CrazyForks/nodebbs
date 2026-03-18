// apps/web/src/components/common/SettingLayout.jsx
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * 带有白底和圆角的配置卡片区块。
 * @param {string} title - 区块大标题
 * @param {string} description - 区块附加说明
 * @param {React.ReactNode} children - 内部的 SettingItem 列表
 */
export function SettingSection({ title, description, children, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      {(title || description) && (
        <div>
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
        {children}
      </div>
    </div>
  );
}

const containerStyles = {
  horizontal: 'flex items-center justify-between gap-4',
  vertical: 'flex flex-col gap-3',
  responsive: 'flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between',
};

const controlStyles = {
  horizontal: 'flex items-center shrink-0',
  vertical: 'w-full',
  responsive: 'w-full sm:w-auto shrink-0',
};

/**
 * 区块内部的单独配置项。
 * layout: horizontal (默认，左标题右控件) | vertical (上标题下控件) | responsive (移动端纵向、桌面端横向)
 */
export function SettingItem({ title, description, children, className, layout = 'horizontal' }) {
  const hasLabel = title || description;

  return (
    <div className={cn('px-4 py-3 sm:px-5 sm:py-3.5', containerStyles[layout], className)}>
      {hasLabel && (
        <div className={cn('flex flex-col space-y-0.5', layout === 'horizontal' && 'pr-4')}>
          {title && <span className='text-sm font-semibold'>{title}</span>}
          {description && (
            <span className='text-xs text-muted-foreground leading-snug'>
              {description}
            </span>
          )}
        </div>
      )}
      <div className={controlStyles[layout]}>
        {children}
      </div>
    </div>
  );
}
