'use client';

import { Wallet, List as ListIcon, Coins } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LedgerOverview } from '../../components/admin/LedgerOverview';
import { LedgerTransactions } from '../../components/admin/LedgerTransactions';
import { LedgerCurrencies } from '../../components/admin/LedgerCurrencies';

export default function LedgerAdminPage() {
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
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
            <TabsTrigger value="overview" className="gap-2">
                <Wallet className="h-4 w-4" />
                概览
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
                <ListIcon className="h-4 w-4" />
                交易记录
            </TabsTrigger>
            <TabsTrigger value="currencies" className="gap-2">
                <Coins className="h-4 w-4" />
                货币管理
            </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
            <LedgerOverview />
        </TabsContent>

        <TabsContent value="transactions">
            <LedgerTransactions />
        </TabsContent>

        <TabsContent value="currencies">
            <LedgerCurrencies />
        </TabsContent>
      </Tabs>
    </div>
  );
}
