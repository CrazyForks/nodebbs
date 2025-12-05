import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { DataTable } from '@/components/forum/DataTable';
import { Loading } from '@/components/common/Loading';
import TimeAgo from '@/components/forum/TimeAgo';
import { TransactionTypeBadge } from '../shared/TransactionTypeBadge';
import { formatCreditsWithSign, getCreditsColorClass } from '../../utils/formatters';

/**
 * Transaction history table for admin with search
 * @param {Object} props
 * @param {Array} props.transactions - Array of transactions
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.pagination - { page, total, limit, onPageChange }
 * @param {string} props.searchQuery - Search query
 * @param {Function} props.onSearchChange - Callback when search query changes
 * @param {Function} props.onSearch - Callback when search button clicked
 */
export function TransactionTable({ transactions, loading, pagination, searchQuery, onSearchChange, onSearch }) {
  const columns = [
    {
      label: 'ID',
      key: 'id',
      render: (value) => <span className="text-muted-foreground">#{value}</span>,
    },
    {
      label: '用户',
      key: 'username',
      render: (value, row) => (
        <a
          href={`/users/${row.username}`}
          className="hover:underline text-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.username}
        </a>
      ),
    },
    {
      label: '类型',
      key: 'type',
      render: (value) => <TransactionTypeBadge type={value} />,
    },
    {
      label: '金额',
      key: 'amount',
      render: (value) => (
        <span className={`font-semibold ${getCreditsColorClass(value)}`}>
          {formatCreditsWithSign(value)}
        </span>
      ),
    },
    {
      label: '余额',
      key: 'balance',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      label: '描述',
      key: 'description',
      render: (value) => (
        <span className="text-sm text-muted-foreground line-clamp-1">{value || '-'}</span>
      ),
    },
    {
      label: '时间',
      key: 'createdAt',
      render: (value) => <TimeAgo date={value} />,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>最近交易记录</CardTitle>
          <CardDescription>查看系统中所有用户的积分交易记录</CardDescription>
        </div>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="搜索用户名..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
          <Button size="icon" onClick={onSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loading text="加载中..." className="py-12" />
        ) : (
          <DataTable
            columns={columns}
            data={transactions}
            pagination={pagination}
          />
        )}
      </CardContent>
    </Card>
  );
}
