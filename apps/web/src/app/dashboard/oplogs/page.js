import { PageHeader } from '@/components/common/PageHeader';
import { OperationLogs } from './components/OperationLogs';

export const metadata = {
  title: '操作日志',
};

export default function OperationLogsPage() {
  return (
    <div className='space-y-6'>
      <PageHeader
        title='操作日志'
        description='查看系统内所有操作记录，包括内容审核、用户管理、资料变更等'
      />
      <OperationLogs />
    </div>
  );
}
