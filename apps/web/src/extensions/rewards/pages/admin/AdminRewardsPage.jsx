'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Coins, Plus, Minus, Settings, List } from 'lucide-react';
import { rewardsApi } from '@/lib/api';
import { toast } from 'sonner';
import { RewardStats } from '../../components/admin/RewardStats';
import { TransactionTable } from '../../components/admin/TransactionTable';
import { RewardOperationDialog } from '../../components/admin/RewardOperationDialog';
import { RewardSystemSettings } from '../../components/admin/RewardSystemSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminRewardsPage() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('grant'); // 'grant' or 'deduct'
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, [pagination.page]);

  const fetchStats = async () => {
    try {
      const data = await rewardsApi.admin.getStats();
      // API now returns an array. Find 'credits' or default to first.
      const creditsStats = Array.isArray(data) 
        ? data.find(s => s.currency === 'credits') || data[0] 
        : data;
      setStats(creditsStats);
    } catch (error) {
      console.error('获取统计失败:', error);
      toast.error('获取统计失败');
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (searchQuery) {
        params.username = searchQuery;
      }
      const data = await rewardsApi.admin.getTransactions(params);
      setTransactions(data.items || []);
      setPagination((prev) => ({
        ...prev,
        total: data.total || 0,
      }));
    } catch (error) {
      console.error('获取交易记录失败:', error);
      toast.error('获取交易记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreditsOperation = async (userId, amount, description) => {
    setSubmitting(true);
    try {
      if (dialogMode === 'grant') {
        await rewardsApi.admin.grant(userId, amount, description);
        toast.success('积分发放成功');
      } else {
        await rewardsApi.admin.deduct(userId, amount, description);
        toast.success('积分扣除成功');
      }
      setShowDialog(false);
      fetchStats();
      fetchTransactions();
    } catch (error) {
      console.error('操作失败:', error);
      toast.error(error.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground mb-2 flex items-center gap-2">
            <Coins className="h-6 w-6" />
            积分账户
          </h1>
          <p className="text-muted-foreground">查看积分账户统计、管理用户积分及配置奖励规则</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <List className="h-4 w-4" />
            账户概览
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            规则配置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button onClick={() => { setDialogMode('grant'); setShowDialog(true); }}>
              <Plus className="h-4 w-4" />
              发放积分
            </Button>
            <Button variant="destructive" onClick={() => { setDialogMode('deduct'); setShowDialog(true); }}>
              <Minus className="h-4 w-4" />
              扣除积分
            </Button>
          </div>

          {/* Statistics */}
          <RewardStats stats={stats} loading={!stats} />

          {/* Transactions */}
          <TransactionTable
            transactions={transactions}
            loading={loading}
            pagination={{
              page: pagination.page,
              total: pagination.total,
              limit: pagination.limit,
              onPageChange: (newPage) => {
                setPagination((prev) => ({
                  ...prev,
                  page: newPage,
                }));
              },
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={fetchTransactions}
          />
        </TabsContent>

        <TabsContent value="settings">
          <RewardSystemSettings />
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <RewardOperationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSubmit={handleCreditsOperation}
        submitting={submitting}
        mode={dialogMode}
      />
    </div>
  );
}
