'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/forum/DataTable';
import { FormDialog } from '@/components/common/FormDialog';
import { Wallet, Plus } from 'lucide-react';
import { ledgerApi } from '../../api';
import { toast } from 'sonner';

export default function LedgerAdminPage() {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
    isActive: true
  });

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

  const handleSaveCurrency = async () => {
      setSubmitting(true);
      
      const data = {
          code: formData.code,
          name: formData.name,
          symbol: formData.symbol,
          isActive: formData.isActive
      };
      
      try {
          await ledgerApi.admin.upsertCurrency(data);
          toast.success('货币保存成功');
          setIsDialogOpen(false);
          fetchCurrencies();
      } catch (err) {
          console.error(err);
          toast.error('保存货币失败');
      } finally {
          setSubmitting(false);
      }
  };


  const handleCreateClick = () => {
      setEditingCurrency(null);
      setFormData({
        code: '',
        name: '',
        symbol: '',
        isActive: true
      });
      setIsDialogOpen(true);
  };

  const handleEditClick = (currency) => {
      setEditingCurrency(currency);
      setFormData({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        isActive: currency.isActive
      });
      setIsDialogOpen(true);
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
        <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4" />
            添加货币
        </Button>
      </div>

      <FormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        title={editingCurrency ? '编辑货币' : '添加货币'}
        description={editingCurrency ? `编辑 ${editingCurrency.name} (${editingCurrency.code}) 的信息` : '添加新的系统货币类型'}
        onSubmit={handleSaveCurrency}
        loading={submitting}
        maxWidth="sm:max-w-[500px]"
      >
        <div className="space-y-4 py-2">
            <div className="grid gap-2">
                <Label htmlFor="code">代码 (Code)</Label>
                <Input 
                    id="code" 
                    name="code" 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    required 
                    disabled={!!editingCurrency} 
                    placeholder="例如: gold" 
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="name">名称</Label>
                <Input 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                    placeholder="例如: 金币" 
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="symbol">符号</Label>
                <Input 
                    id="symbol" 
                    name="symbol" 
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                    required 
                    placeholder="例如: 💰" 
                />
            </div>

             <div className="flex items-center justify-between">
                <Label htmlFor="isActive">启用状态</Label>
                <Switch 
                    id="isActive" 
                    name="isActive" 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
            </div>
        </div>
      </FormDialog>

      <Card>
          <CardHeader>
              <CardTitle>货币列表</CardTitle>
          </CardHeader>
          <CardContent>
              <DataTable
                  columns={[
                      { key: 'code', label: '代码', render: (val) => <span className="font-mono">{val}</span> },
                      { key: 'name', label: '名称' },
                      { key: 'symbol', label: '符号' },
                      { 
                          key: 'isActive', 
                          label: '状态', 
                          render: (isActive) => isActive ? 
                              <span className="text-green-600">已启用</span> : 
                              <span className="text-muted-foreground">已禁用</span> 
                      },
                      {
                          key: 'actions',
                          label: '操作',
                          align: 'right',
                          render: (_, currency) => (
                              <Button variant="ghost" size="sm" onClick={() => handleEditClick(currency)}>编辑</Button>
                          )
                      }
                  ]}
                  data={currencies}
                  loading={loading}
              />
          </CardContent>
      </Card>
    </div>
  );
}
