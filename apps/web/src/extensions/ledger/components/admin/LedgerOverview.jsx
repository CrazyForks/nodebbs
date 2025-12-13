'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { CurrencyStats } from './CurrencyStats';
import { CurrencyOperationDialog } from './CurrencyOperationDialog';
import { ledgerApi } from '../../api';
import { toast } from 'sonner';

export function LedgerOverview() {
    const [stats, setStats] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [operationOpen, setOperationOpen] = useState(false);
    const [operationMode, setOperationMode] = useState('grant');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            const [statsData, currenciesData] = await Promise.all([
                ledgerApi.getStats(),
                ledgerApi.admin.getCurrencies()
            ]);
            setStats(Array.isArray(statsData) ? statsData : (statsData.items || [statsData]));
            setCurrencies(currenciesData);
        } catch (error) {
            console.error(error);
            toast.error('获取概览数据失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOperationSubmit = async (data) => {
        setSubmitting(true);
        try {
            await ledgerApi.admin.operation(data);
            toast.success(data.type === 'grant' ? '发放成功' : '扣除成功');
            setOperationOpen(false);
            fetchData(); // Refresh stats
        } catch (error) {
            console.error(error);
            toast.error(error.message || '操作失败');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-8">
                {currencies.filter(c => c.isActive).map(currency => {
                    const currencyStats = stats.find(s => s.currency === currency.code);
                    if (!currencyStats) return null;
                    
                    return (
                        <div key={currency.code} className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span className="text-2xl">{currency.symbol}</span>
                                {currency.name} ({currency.code})
                            </h3>
                            <CurrencyStats 
                                stats={currencyStats} 
                                loading={loading} 
                                currency={currency} 
                            />
                            <div className="border-b my-4 opacity-50"></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
