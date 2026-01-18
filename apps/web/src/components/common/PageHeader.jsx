import { cn } from '@/lib/utils';

/**
 * 页面标题组件
 * @param {Object} props
 * @param {string} props.title - 页面标题
 * @param {string} [props.description] - 页面描述
 * @param {React.ReactNode} [props.actions] - 右侧操作区
 * @param {string} [props.className] - 自定义容器类名
 */
export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6', className)}>
      <div className='min-w-0'>
        <h1 className='text-xl md:text-2xl font-bold text-foreground'>
          {title}
        </h1>
        {description && (
          <p className='text-sm text-muted-foreground mt-1'>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className='flex items-center gap-2 shrink-0'>
          {actions}
        </div>
      )}
    </div>
  );
}
