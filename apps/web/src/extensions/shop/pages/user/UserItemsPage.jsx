'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import { useUserItems } from '@/extensions/shop/hooks/useUserItems';
import { useItemActions } from '@/extensions/shop/hooks/useItemActions';
import { ItemTypeSelector } from '@/extensions/shop/components/shared/ItemTypeSelector';
import { ItemInventoryGrid } from '../../components/user/ItemInventoryGrid';
import { useAuth } from '@/contexts/AuthContext';

export default function UserItemsPage() {
  const [itemType, setItemType] = useState('all');
  const { updateUser } = useAuth();
  
  const { items, loading, setItemEquipped, setItemEquippedWithUnequipSameType } = useUserItems({ type: itemType });
  
  // Show all items including badges
  const displayedItems = items;

  const { equip, unequip, actioningItemId } = useItemActions();

  const handleEquip = async (userItemId) => {
    // 获取当前物品信息用于判断类型
    const item = items.find(i => i.id === userItemId);
    
    await equip(userItemId, (response) => {
      // 直接将物品标记为已装备（处理同类型互斥）
      setItemEquippedWithUnequipSameType(userItemId, item?.itemType);
      // 更新用户头像框
      if (response.avatarFrame !== undefined) {
        updateUser({ avatarFrame: response.avatarFrame });
      }
    });
  };

  const handleUnequip = async (userItemId) => {
    await unequip(userItemId, (response) => {
      // 直接将物品标记为未装备
      setItemEquipped(userItemId, false);
      // 更新用户头像框（卸下后可能为 null）
      if (response.avatarFrame !== undefined) {
        updateUser({ avatarFrame: response.avatarFrame });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Header - Compact & Theme Consistent */}
      <div className="relative overflow-hidden rounded-2xl bg-muted/30 border border-border/50 p-6">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start text-center md:text-left justify-between gap-6">
          
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center justify-center md:justify-start gap-3">
              <span className="p-2 rounded-lg bg-primary/10 text-primary">
                 <Package className="h-5 w-5" />
              </span>
              我的道具
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg">
               管理您的专属装扮与收藏，自由搭配个人风格。
            </p>
          </div>
        </div>
      </div>

      {/* Item Type Selector & Grid */}
      <ItemTypeSelector value={itemType} onChange={setItemType} excludedTypes={[]}>
        <ItemInventoryGrid
          items={displayedItems}
          onEquip={handleEquip}
          onUnequip={handleUnequip}
          actioningItemId={actioningItemId}
          loading={loading}
          itemType={itemType}
        />
      </ItemTypeSelector>
    </div>
  );
}
