import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { ITEM_TYPES, getItemTypeLabel } from '../../utils/itemTypes';

/**
 * Form dialog for creating/editing shop items
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onOpenChange - Callback when open state changes
 * @param {'create'|'edit'} props.mode - Form mode
 * @param {Object} props.initialData - Initial form data for edit mode
 * @param {Function} props.onSubmit - Callback when form submitted
 * @param {boolean} props.submitting - Submission in progress
 */
export function ShopItemFormDialog({ open, onOpenChange, mode, initialData, onSubmit, submitting }) {
  const [formData, setFormData] = useState({
    type: ITEM_TYPES.AVATAR_FRAME,
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    stock: null,
    displayOrder: 0,
    isActive: true,
    metadata: '',
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        type: initialData.type,
        name: initialData.name,
        description: initialData.description || '',
        price: initialData.price,
        imageUrl: initialData.imageUrl || '',
        stock: initialData.stock,
        displayOrder: initialData.displayOrder || 0,
        isActive: initialData.isActive,
        metadata: initialData.metadata || '',
      });
    } else if (mode === 'create') {
      setFormData({
        type: ITEM_TYPES.AVATAR_FRAME,
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        stock: null,
        displayOrder: 0,
        isActive: true,
        metadata: '',
      });
    }
  }, [mode, initialData, open]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '新建商品' : '编辑商品'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? '创建一个新的商城商品' : '修改商品信息'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Item Type */}
          <div className="space-y-2">
            <Label htmlFor="type">商品类型 *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择商品类型" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ITEM_TYPES).map((type) => (
                  <SelectItem key={type} value={type}>
                    {getItemTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">商品名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="输入商品名称"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">商品描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="输入商品描述"
              rows={3}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">价格（积分）*</Label>
            <Input
              id="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: e.target.value }))
              }
              placeholder="0"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">图片URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
              }
              placeholder="https://..."
            />
            {formData.imageUrl && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={formData.imageUrl}
                  alt="预览"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="space-y-2">
            <Label htmlFor="stock">库存（留空表示不限）</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock === null ? '' : formData.stock}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  stock: e.target.value === '' ? null : e.target.value,
                }))
              }
              placeholder="不限"
            />
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="displayOrder">显示排序</Label>
            <Input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  displayOrder: e.target.value,
                }))
              }
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              数字越大越靠前，相同排序按创建时间倒序
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-2">
            <Label htmlFor="metadata">元数据（JSON格式）</Label>
            <Textarea
              id="metadata"
              value={formData.metadata}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, metadata: e.target.value }))
              }
              placeholder='{"key": "value"}'
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              用于存储头像框样式、勋章图标等自定义配置
            </p>
          </div>

          {/* Is Active */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">是否上架</Label>
              <p className="text-xs text-muted-foreground">
                下架后用户将无法看到和购买此商品
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !formData.name.trim()}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? '创建中...' : '更新中...'}
              </>
            ) : mode === 'create' ? (
              '创建'
            ) : (
              '更新'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
