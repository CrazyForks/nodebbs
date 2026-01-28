'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/common/PageHeader';
import { RolesTab } from './components/RolesTab';
import { PermissionsTab } from './components/PermissionsTab';

export default function RolesManagementPage() {
  const [activeTab, setActiveTab] = useState('roles');

  return (
    <div className="space-y-6">
      <PageHeader
        title="角色与权限"
        description="管理用户角色和系统权限配置"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">角色管理</TabsTrigger>
          <TabsTrigger value="permissions">权限管理</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {activeTab === 'roles' ? <RolesTab /> : <PermissionsTab />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
