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
import { Loader2, Minus } from 'lucide-react';
import { UserSearchInput } from './UserSearchInput';

/**
 * Dialog for deducting credits from users
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onOpenChange - Callback when open state changes
 * @param {Function} props.onSubmit - Callback when form submitted
 * @param {boolean} props.submitting - Submission in progress
 */
export function DeductCreditsDialog({ open, onOpenChange, onSubmit, submitting }) {
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
          <DialogTitle>扣除积分</DialogTitle>
          <DialogDescription>从指定用户扣除积分</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <UserSearchInput
            selectedUser={formData.user}
            onSelectUser={(user) => setFormData((prev) => ({ ...prev, user }))}
          />

          <div className="space-y-2">
            <Label htmlFor="deduct-amount">积分数量</Label>
            <Input
              id="deduct-amount"
              type="number"
              min="1"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
              placeholder="输入扣除的积分数量"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deduct-description">操作原因</Label>
            <Textarea
              id="deduct-description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="输入扣除原因（可选）"
              rows={3}
            />
          </div>

          <div className="p-3 border border-yellow-500/20 bg-yellow-500/5 rounded-lg">
            <p className="text-sm text-yellow-600">
              ⚠️ 注意：如果用户余额不足，扣除操作将失败
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={submitting || !formData.user || formData.amount <= 0}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                扣除中...
              </>
            ) : (
              <>
                <Minus className="mr-2 h-4 w-4" />
                确认扣除
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
