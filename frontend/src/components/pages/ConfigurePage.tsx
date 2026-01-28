import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { UserManagement, RoleManagement, CustomerManagement } from '@/components/organisms';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
type TabType = 'users' | 'roles' | 'customers';

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
                    {isSuperAdmin && <TabsTrigger value="customers">Customers</TabsTrigger>}
                </TabsList>

                {/* Tab Content */}
                <TabsContent value="users">
                    
                            <UserManagement />
                </TabsContent>

                <TabsContent value="roles">
                   
                            <RoleManagement />
                </TabsContent>

                {isSuperAdmin && (
                    <TabsContent value="customers">
                                <CustomerManagement />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};
