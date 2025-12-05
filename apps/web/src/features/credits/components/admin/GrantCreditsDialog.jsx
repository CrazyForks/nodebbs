import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import { UserSearchInput } from './UserSearchInput';

/**
 * Dialog for granting credits to users
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onOpenChange - Callback when open state changes
 * @param {Function} props.onSubmit - Callback when form submitted
 * @param {boolean} props.submitting - Submission in progress
 */
export function GrantCreditsDialog({ open, onOpenChange, onSubmit, submitting }) {
  const [formData, setFormData] = useState({
    user: null,
    amount: 0,
    description: '',
  });

  const handleSubmit = () => {
    if (!formData.user || formData.amount <= 0) {
      return;
    }
    onSubmit(formData.user.id, formData.amount, formData.description);
  };

  const handleClose = () => {
    setFormData({ user: null, amount: 0, description: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>发放积分</DialogTitle>
          <DialogDescription>向指定用户发放积分</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <UserSearchInput
            selectedUser={formData.user}
            onSelectUser={(user) => setFormData((prev) => ({ ...prev, user }))}
          />

          <div className="space-y-2">
            <Label htmlFor="grant-amount">积分数量</Label>
            <Input
              id="grant-amount"
              type="number"
              min="1"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
              placeholder="输入发放的积分数量"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grant-description">操作原因</Label>
            <Textarea
              id="grant-description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="输入发放原因（可选）"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !formData.user || formData.amount <= 0}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                发放中...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                确认发放
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
