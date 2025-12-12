'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, Plus, Settings } from 'lucide-react';
import { ledgerApi } from '../../api';
import { toast } from 'sonner';

export default function LedgerAdminPage() {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const data = await ledgerApi.admin.getCurrencies();
      setCurrencies(data);
    } catch (err) {
      console.error('Failed to load currencies:', err);
      toast.error('加载货币列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrency = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
          code: formData.get('code') || editingCurrency?.code,
          name: formData.get('name'),
          symbol: formData.get('symbol'),
          isActive: formData.get('isActive') === 'on'
      };
      
      try {
          await ledgerApi.admin.upsertCurrency(data);
          toast.success('货币保存成功');
          setIsDialogOpen(false);
          fetchCurrencies();
      } catch (err) {
          console.error(err);
          toast.error('保存货币失败');
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground mb-2 flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            货币管理
          </h1>
          <p className="text-muted-foreground">管理系统货币类型及相关金融设置</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setEditingCurrency(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加货币
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingCurrency ? '编辑货币' : '添加货币'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveCurrency} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code">代码 (Code)</Label>
                        <Input id="code" name="code" defaultValue={editingCurrency?.code} required disabled={!!editingCurrency} placeholder="例如: gold" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">名称</Label>
                        <Input id="name" name="name" defaultValue={editingCurrency?.name} required placeholder="例如: 金币" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="symbol">符号</Label>
                        <Input id="symbol" name="symbol" defaultValue={editingCurrency?.symbol} required placeholder="例如: 💰" />
                    </div>

                     <div className="flex items-center justify-between">
                        <Label htmlFor="isActive">启用状态</Label>
                        <Switch id="isActive" name="isActive" defaultChecked={editingCurrency?.isActive ?? true} />
                    </div>
                    <Button type="submit" className="w-full">保存</Button>
                </form>
            </DialogContent>
        </Dialog>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>货币列表</CardTitle>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>代码</TableHead>
                          <TableHead>名称</TableHead>
                          <TableHead>符号</TableHead>

                          <TableHead>状态</TableHead>
                          <TableHead>操作</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {currencies.map(c => (
                          <TableRow key={c.code}>
                                <TableCell className="font-mono">{c.code}</TableCell>
                                <TableCell>{c.name}</TableCell>
                                <TableCell>{c.symbol}</TableCell>

                                <TableCell>{c.isActive ? <span className="text-green-600">已启用</span> : <span className="text-muted-foreground">已禁用</span>}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setEditingCurrency(c);
                                        setIsDialogOpen(true);
                                    }}>编辑</Button>
                                </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
    </div>
  );
}
