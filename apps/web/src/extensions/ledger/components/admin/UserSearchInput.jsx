import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Loader2, Search } from 'lucide-react';
import { userApi } from '@/lib/api';
import { toast } from 'sonner';

/**
 * 带自动完成的用户搜索输入框
 * @param {Object} props
 * @param {Function} props.onSelectUser - 选择用户时的回调
 * @param {Object} props.selectedUser - 当前选择的用户对象
 */
export function UserSearchInput({ onSelectUser, selectedUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setOpen(false);
      return;
    }

    setSearching(true);
    try {
      const data = await userApi.getList({ search: searchQuery, limit: 10 });
      const results = data.items || [];
      setSearchResults(results);
      // 有结果时自动打开 Popover
      setOpen(results.length > 0);
    } catch (error) {
      console.error('搜索用户失败:', error);
      toast.error('搜索用户失败');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    onSelectUser(user);
    setSearchResults([]);
    setSearchQuery('');
    setOpen(false);
  };

  const handleClearUser = () => {
    onSelectUser(null);
  };

  return (
    <div className="space-y-2">
      <Label>选择用户</Label>
      {selectedUser ? (
        <div className="flex items-center justify-between h-9 px-3 border rounded-md bg-muted">
          <span className="text-sm font-medium truncate">{selectedUser.username}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleClearUser}
          >
            更换
          </Button>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <div className="flex gap-2">
              <Input
                placeholder="搜索用户名或邮箱"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </PopoverAnchor>
          <PopoverContent 
            className="p-0 w-72" 
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="divide-y max-h-48 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  className="w-full p-3 text-left hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
