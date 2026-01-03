import { useState, useCallback } from 'react';
import { shopApi } from '@/lib/api';
import { toast } from 'sonner';

/**
 * 处理物品装备/卸下操作的 Hook
 * @returns {Object} { equip, unequip, actioning, actioningItemId }
 */
export function useItemActions() {
  const [actioningItemId, setActioningItemId] = useState(null);

  const equip = useCallback(async (userItemId, onSuccess) => {
    setActioningItemId(userItemId);
    try {
      const response = await shopApi.equipItem(userItemId);
      toast.success('装备成功');
      // 将响应传递给回调，支持局部更新
      if (onSuccess) await onSuccess(response);
    } catch (err) {
      console.error('装备失败:', err);
      toast.error(err.message || '装备失败');
    } finally {
      setActioningItemId(null);
    }
  }, []);

  const unequip = useCallback(async (userItemId, onSuccess) => {
    setActioningItemId(userItemId);
    try {
      const response = await shopApi.unequipItem(userItemId);
      toast.success('卸下成功');
      // 将响应传递给回调，支持局部更新
      if (onSuccess) await onSuccess(response);
    } catch (err) {
      console.error('卸下失败:', err);
      toast.error(err.message || '卸下失败');
    } finally {
      setActioningItemId(null);
    }
  }, []);

  return {
    equip,
    unequip,
    actioning: actioningItemId !== null,
    actioningItemId,
  };
}
