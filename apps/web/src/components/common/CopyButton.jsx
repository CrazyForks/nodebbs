import React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';

const CopyButton = ({
  value,
  className,
  variant = 'ghost',
  size = 'icon',
  children,
  onCopy,
  timeout = 2000,
  iconSize = 'h-4 w-4',
  ...props
}) => {
  const { copy, copied } = useClipboard({ timeout });

  const handleCopy = async (e) => {
    e.stopPropagation();
     // preventDefault might interfere if inside a form, but for a button type='button' it's fine.
     // Safer to just stopPropagation.
    const success = await copy(value);
    if (success && onCopy) {
      onCopy();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleCopy}
      type="button" // Explicitly set type to avoid form submission
      {...props}
    >
      {typeof children === 'function' ? (
        children({ copied })
      ) : children ? (
        children
      ) : (
        copied ? <Check className={cn(iconSize, "text-green-500")} /> : <Copy className={iconSize} />
      )}
    </Button>
  );
};

export default CopyButton;
