import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadUser } from '@/store/slices/authSlice';
import { ToastProvider, ThemeProvider } from '@/components/atoms';
import {
    LoginPage,
    DashboardHome,
    ConfigurePage,
    DashboardLayout,
    PrSrPage,
    RfqRfpPage,
    QuotationsPage,
    PurchaseOrdersPage,
    InvoicesPage,
    VendorsPage,
    PaymentsPage,
    QueriesPage,
    ReportsPage,
    InvitationsPage,
    PreRegistrationPage,
    VendorRegistrationsPage,
    VendorRegistrationDetailsPage,
    ProfilePage,
} from '@/components';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};


function App() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(loadUser());
    }, [dispatch]);

    return (
        <ThemeProvider defaultTheme="light" storageKey="proccura-ui-theme">
            <ToastProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

                        {/* Public route — vendor pre-registration (no auth needed) */}
                        <Route path="/register/:token" element={<PreRegistrationPage />} />

                        {/* Protected routes with layout */}
                        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                            <Route path="/dashboard" element={<DashboardHome />} />
                            <Route path="/pr-sr" element={<PrSrPage />} />
                            <Route path="/rfq-rfp" element={<RfqRfpPage />} />
                            <Route path="/quotations" element={<QuotationsPage />} />
                            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                            <Route path="/invoices" element={<InvoicesPage />} />
                            <Route path="/vendors" element={<VendorsPage />} />
                            <Route path="/payments" element={<PaymentsPage />} />
                            <Route path="/queries" element={<QueriesPage />} />
                            <Route path="/reports" element={<ReportsPage />} />
                            <Route path="/configure" element={<ConfigurePage />} />

                            <Route path="/invitations" element={<InvitationsPage />} />
                            <Route path="/pre-registrations" element={<VendorRegistrationsPage />} />
                            <Route path="/pre-registrations/:id" element={<VendorRegistrationDetailsPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                        </Route>

                        <Route path="/" element={<Navigate to="/login" replace />} />
                    </Routes>
                </BrowserRouter>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;
