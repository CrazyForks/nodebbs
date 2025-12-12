'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown, Clock, Loader2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { ledgerApi } from '../../api';
import { rewardsApi } from '@/lib/api';
import { CheckInStatus } from '../../../rewards/components/user/CheckInStatus';
import { Pager } from '@/components/common/Pagination';
import { toast } from 'sonner';
import Time from '@/components/forum/Time';
import { useAuth } from '@/contexts/AuthContext';

export default function UserWalletPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [page, user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accountsData, txData, checkInResult] = await Promise.all([
        ledgerApi.getAccounts(),
        ledgerApi.getTransactions({ page, limit, userId: user?.id }),
        rewardsApi.getCheckInStatus().catch(() => null) // Fault tolerance for rewards status
      ]);
      setAccounts(accountsData);
      setTransactions(txData.items || []);
      setTotal(txData.total || 0);
      if (checkInResult) {
        setCheckInStatus({
            checkInStreak: checkInResult.checkInStreak,
            lastCheckInDate: checkInResult.lastCheckInDate
        });
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
      toast.error('获取钱包数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (code) => {
    switch (code) {
      case 'credits': return '🪙';
      case 'gold': return '💰';
      default: return '$';
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground mb-2 flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            我的钱包
          </h1>
          <p className="text-muted-foreground">查看您的资产余额及交易明细</p>
        </div>
        <Link href="/rank">
          <Button variant="outline" className="gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            查看排行榜
          </Button>
        </Link>
      </div>

      {checkInStatus && (
        <CheckInStatus
          checkInStreak={checkInStatus.checkInStreak}
          lastCheckInDate={checkInStatus.lastCheckInDate}
        />
      )}

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading && accounts.length === 0 ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          accounts.map(account => (
            <Card key={account.currency.code} className="relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Wallet className="h-24 w-24" />
               </div>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                   {account.currency.name}
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold flex items-center gap-2">
                   <span>{account.balance}</span>
                   <span className="text-xl opacity-50">{account.currency.symbol}</span>
                 </div>
                 <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                   <div className="flex items-center gap-1">
                     <TrendingUp className="h-3 w-3 text-green-500" />
                     累计获得: {account.totalEarned}
                   </div>
                   {account.isFrozen && (
                     <Badge variant="destructive" className="h-5 px-1.5">已冻结</Badge>
                   )}
                 </div>
               </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            最近交易记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {loading && transactions.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground">加载中...</div>
             ) : transactions.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground">暂无交易记录</div>
             ) : (
               transactions.map(tx => (
                 <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${tx.amount >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                        {tx.amount >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{tx.description || tx.type}</div>
                        <div className="text-xs text-muted-foreground">
                          <Time date={tx.createdAt} fromNow />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount} <span className="text-xs text-muted-foreground">{tx.currencyCode}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        余额: {tx.balance}
                      </div>
                    </div>
                 </div>
               ))
             )}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="mt-6 border-t pt-4">
              <Pager
                page={page}
                pageSize={limit}
                total={total}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
