import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { UserManagement, RoleManagement, TenantManagement } from '@/components/organisms';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/atoms';
type TabType = 'users' | 'roles' | 'tenants';

export const ConfigurePage = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState<TabType>('users');

    const isSuperAdmin = user?.is_super_admin === true;

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
                <TabsList>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    {isSuperAdmin && <TabsTrigger value="tenants">Tenants</TabsTrigger>}
                </TabsList>

                {/* Tab Content */}
                <TabsContent value="users">

                    <UserManagement />
                </TabsContent>

                <TabsContent value="roles">

                    <RoleManagement />
                </TabsContent>

                {isSuperAdmin && (
                    <TabsContent value="tenants">
                        <TenantManagement />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};
