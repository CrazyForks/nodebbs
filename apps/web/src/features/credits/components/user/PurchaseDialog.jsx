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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Check, Search, X, Gift } from 'lucide-react';
import { CreditsBadge } from '../shared/CreditsBadge';
import { getItemTypeLabel } from '@/features/shop/utils/itemTypes';
import UserAvatar from '@/components/forum/UserAvatar';
import { searchApi } from '@/lib/api';

/**
 * Purchase confirmation dialog
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Object} props.item - Shop item to purchase
 * @param {number} props.userBalance - User's current balance
 * @param {Function} props.onConfirm - Callback when confirmed. Receives { isGift, receiverId, message } for gifts.
 * @param {Function} props.onCancel - Callback when cancelled
 * @param {boolean} props.purchasing - Purchase in progress
 */
export function PurchaseDialog({ open, item, userBalance, onConfirm, onCancel, purchasing }) {
  const [mode, setMode] = useState('buy'); // 'buy' | 'gift'
  const [receiver, setReceiver] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setMode('buy');
      setReceiver(null);
      setMessage('');
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [open]);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      
      setSearching(true);
      try {
        // Use searchApi to find users. Assuming it returns { users: [] } or just [] 
        // Based on api.js: searchApi.search(query, type, page, limit)
        // Backend expects 'users' (plural), and returns { users: { items: [] } }
        const res = await searchApi.search(searchQuery, 'users', 1, 5);
        if (res && res.users && Array.isArray(res.users.items)) {
           setSearchResults(res.users.items);
        } else if (res && Array.isArray(res.users)) {
            // Fallback in case API changes
           setSearchResults(res.users);
        } else {
           setSearchResults([]);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!item) return null;

  const balanceAfterPurchase = userBalance !== null ? userBalance - item.price : 0;
  const canAfford = userBalance !== null && userBalance >= item.price;
  
  const handleConfirm = () => {
    if (mode === 'gift') {
      if (!receiver) return;
      onConfirm({ isGift: true, receiverId: receiver.id, message });
    } else {
      onConfirm({}); // Normal purchase
    }
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>购买商品</DialogTitle>
          <DialogDescription>
             {item.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={setMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">自用购买</TabsTrigger>
            <TabsTrigger value="gift">赠送好友</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 space-y-4">
             {/* Item Info */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              {item.imageUrl && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  {getItemTypeLabel(item.type)}
                </div>
              </div>
              <CreditsBadge amount={item.price} />
            </div>

            <TabsContent value="buy" className="mt-0 space-y-4">
              <div className="text-sm text-muted-foreground">
                购买后将直接发放到您的背包中。
              </div>
            </TabsContent>

            <TabsContent value="gift" className="mt-0 space-y-4">
              {!receiver ? (
                <div className="space-y-2">
                  <Label>搜索用户</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="输入用户名搜索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  {/* Search Results */}
                  {searchQuery && (
                    <div className="border rounded-md mt-2 max-h-[200px] overflow-y-auto">
                      {searching ? (
                        <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          搜索中...
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="divide-y">
                          {searchResults.map(user => (
                            <div 
                              key={user.id}
                              className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => {
                                setReceiver(user);
                                setSearchQuery('');
                                setSearchResults([]);
                              }}
                            >
                              <UserAvatar user={user} size="sm" />
                              <div className="text-sm font-medium">{user.username || user.name}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          未找到相关用户
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                     <Label>接收者</Label>
                     <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                       <div className="flex items-center gap-3">
                         <UserAvatar user={receiver} size="sm" />
                         <span className="font-medium text-sm">{receiver.username || receiver.name}</span>
                       </div>
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setReceiver(null)}>
                         <X className="h-4 w-4" />
                       </Button>
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>赠言 (可选)</Label>
                    <Textarea 
                      placeholder="写点什么..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={200}
                      className="resize-none"
                    />
                    <div className="text-xs text-right text-muted-foreground">{message.length}/200</div>
                  </div>
                </div>
              )}
            </TabsContent>

             {/* Balance Info */}
            {userBalance !== null && (
              <div className="flex items-center justify-between py-2 text-sm border-t">
                <span className="text-muted-foreground">当前余额</span>
                <div className="flex flex-col items-end">
                  <span className={canAfford ? 'font-medium' : 'font-medium text-destructive'}>
                    {userBalance} 积分
                  </span>
                  {!canAfford && <span className="text-xs text-destructive">积分不足</span>}
                </div>
              </div>
            )}
            
          </div>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={purchasing}
          >
            取消
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={purchasing || !canAfford || (mode === 'gift' && !receiver)}
          >
            {purchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                处理中...
              </>
            ) : (
              <>
                {mode === 'gift' ? <Gift className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                {mode === 'gift' ? '确认赠送' : '确认购买'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
