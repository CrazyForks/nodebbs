'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FormDialog } from '@/components/common/FormDialog';
import { Shield, ShieldOff, Loader2 } from 'lucide-react';
import { blockedUsersApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function BlockUserButton({ userId, username, variant = 'outline', size, className }) {
  const { isAuthenticated, user } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showUnblockDialog, setShowUnblockDialog] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkBlockStatus();
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, user, userId]);

  const checkBlockStatus = async () => {
    try {
      const result = await blockedUsersApi.check(userId);
      setIsBlocked(result.blockedByMe || false);
    } catch (err) {
      console.error('检查拉黑状态失败:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleBlock = async () => {
    setLoading(true);
    try {
      await blockedUsersApi.block(userId);
      setIsBlocked(true);
      toast.success(`已拉黑 ${username}`);
      setShowBlockDialog(false);
    } catch (err) {
      console.error('拉黑失败:', err);
      toast.error(err.message || '拉黑失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    try {
      await blockedUsersApi.unblock(userId);
      setIsBlocked(false);
      toast.success(`已取消拉黑 ${username}`);
      setShowUnblockDialog(false);
    } catch (err) {
      console.error('取消拉黑失败:', err);
      toast.error(err.message || '取消拉黑失败');
    } finally {
      setLoading(false);
    }
  };

  if (user && user.id === userId) return null;
  if (!isAuthenticated) return null;

  if (checking) {
    return (
      <Button variant={variant} className={className} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        检查中...
      </Button>
    );
  }

  return (
    <>
      {isBlocked ? (
        <Button variant={variant} size={size} className={className} onClick={() => setShowUnblockDialog(true)}>
          <ShieldOff className="h-4 w-4" />
          已拉黑
        </Button>
      ) : (
        <Button variant={variant} size={size} className={className} onClick={() => setShowBlockDialog(true)}>
          <Shield className="h-4 w-4" />
          拉黑用户
        </Button>
      )}

      <FormDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        title="确认拉黑用户？"
        description={`拉黑 ${username} 后，你们将无法互相发送站内信，对方将无法查看你的动态。你可以随时取消拉黑。`}
        submitText="确认拉黑"
        submitClassName="bg-destructive hover:bg-destructive/90"
        onSubmit={handleBlock}
        loading={loading}
      />

      <FormDialog
        open={showUnblockDialog}
        onOpenChange={setShowUnblockDialog}
        title="取消拉黑？"
        description={`取消拉黑 ${username} 后，你们将可以正常互动。`}
        submitText="确认取消"
        onSubmit={handleUnblock}
        loading={loading}
      />
    </>
  );
}
