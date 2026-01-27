import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadUser } from '@/store/slices/authSlice';
import LoginPage from '@/features/auth/pages/LoginPage';
import { DashboardHome } from './features/auth/pages/DashboardHome';
import DashboardLayout from './components/layout/DashboardLayout';


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
    <BrowserRouter>
       <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        
        {/* Protected routes with layout */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout/></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          {/* Add more nested routes here */}
          {/* <Route path="profile" element={<ProfilePage />} /> */}
          {/* <Route path="settings" element={<SettingsPage />} /> */}
        </Route>
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
