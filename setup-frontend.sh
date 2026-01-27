#!/bin/bash

set -e

echo "🚀 Setting up Proccura React Frontend (TypeScript + shadcn/ui + Redux)..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   brew install node"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if frontend already exists
if [ -d "frontend" ]; then
    echo "⚠️  frontend directory already exists!"
    read -p "Do you want to delete it and start fresh? (y/N): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        rm -rf frontend
        echo "✅ Cleaned up existing frontend directory"
    else
        echo "❌ Setup cancelled"
        exit 0
    fi
fi

# Create React app with Vite TypeScript template
echo "📦 Creating React app with Vite + TypeScript..."
npm create vite@latest frontend -- --template react-ts <<< $'n\nn\n'

cd frontend

# Install base dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --silent

# Install Redux Toolkit and React-Redux
echo ""
echo "📦 Installing Redux Toolkit..."
npm install --silent @reduxjs/toolkit react-redux

# Install additional packages
echo ""
echo "📦 Installing React Router and Axios..."
npm install --silent react-router-dom axios

echo ""
echo "📦 Installing form libraries..."
npm install --silent react-hook-form zod @hookform/resolvers

# Create directory structure first
echo ""
echo "📁 Creating directory structure..."
mkdir -p src/{api,assets/images,components/{common,layout},features/auth/{components,pages,hooks},hooks,routes,store/{slices},styles,types}

# Create .env file
echo ""
echo "📝 Creating .env file..."
cat > .env << 'EOF'
# API Gateway URL
VITE_API_BASE_URL=http://localhost:8000

# App Configuration
VITE_APP_NAME=Proccura
VITE_APP_ENV=development
EOF

# Create .env.example
cp .env .env.example

# Update tsconfig.json BEFORE shadcn init
echo ""
echo "📝 Configuring TypeScript..."
cat > tsconfig.json << 'EOF'
{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
EOF

cat > tsconfig.app.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
EOF

# Update vite.config.ts to support path aliases
cat > vite.config.ts << 'EOF'
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
EOF

# Install Tailwind CSS v3
echo ""
echo "📦 Installing Tailwind CSS..."
echo "Current directory: $(pwd)"
npm install --silent -D tailwindcss@^3.4.0 postcss autoprefixer

# Initialize Tailwind (this creates tailwind.config.js and postcss.config.js)
echo "Initializing Tailwind in: $(pwd)"
npx tailwindcss@^3.4.0 init -p

# Verify Tailwind config was created
if [ ! -f "tailwind.config.js" ]; then
  echo "❌ ERROR: tailwind.config.js was not created!"
  echo "Current directory contents:"
  ls -la
  exit 1
fi

echo "✅ Tailwind config created at: $(pwd)/tailwind.config.js"

# Now update tailwind.config.js for shadcn compatibility
echo "📝 Updating Tailwind config for shadcn..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {}
    }
  },
  plugins: [],
}
EOF

# Initialize shadcn/ui (now Tailwind config exists)
echo ""
echo "📦 Initializing shadcn/ui..."
echo "Current directory for shadcn: $(pwd)"
echo "Checking for tailwind.config.js: $(ls -la tailwind.config.js 2>&1)"

# Try shadcn init with explicit paths
npx shadcn@latest init --yes --defaults --cwd . || {
  echo "⚠️  shadcn init failed, installing dependencies manually..."
  npm install --silent class-variance-authority clsx tailwind-merge lucide-react
  npm install --silent @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-icons
  
  # Create components.json manually
  cat > components.json << 'COMPEOF'
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@@/lib/utils",
    "hooks": "@/hooks"
  }
}
COMPEOF

  # Create lib/utils.ts
  mkdir -p src@/lib/utils
  cat > src@/lib/utils/utils.ts << 'LIBEOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
LIBEOF

  # Create components/ui directory
  mkdir -p src/components/ui
  
  echo "✅ Manual shadcn setup completed"
}

# Install shadcn/ui components
echo ""
echo "📦 Installing shadcn/ui components..."
npx shadcn@latest add button input label card alert --yes --overwrite --cwd . || echo "⚠️  Some components may need manual installation"

# Update vite-env.d.ts
cat > src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
EOF

# Update main.tsx
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
EOF

# Create types
echo "📝 Creating TypeScript types..."
cat > src/types/auth.ts << 'EOF'
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
EOF

# Create API client - axios.ts
echo "📝 Creating API client..."
cat > src/api/axios.ts << 'EOF'
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
EOF

# Create auth API
cat > src/api/auth.ts << 'EOF'
import apiClient from './axios';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/types/auth';

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', userData);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout');
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/v1/auth/me');
    return response.data;
  },
};
EOF

# Create Redux store
echo "📝 Creating Redux store..."
mkdir -p src/store/slices

cat > src/store/index.ts << 'EOF'
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
EOF

# Create Redux hooks
cat > src/store/hooks.ts << 'EOF'
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
EOF

# Create auth slice
cat > src/store/slices/authSlice.ts << 'EOF'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@/api/auth';
import type { AuthState } from '@/types/auth';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      localStorage.clear();
    } catch (error: any) {
      localStorage.clear();
      return rejectWithValue('Logout failed');
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return rejectWithValue('No token found');
    }
    try {
      const data = await authAPI.getCurrentUser();
      return data;
    } catch (error: any) {
      localStorage.clear();
      return rejectWithValue('Failed to load user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // Load User
    builder.addCase(loadUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(loadUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    });
    builder.addCase(loadUser.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
EOF

# Create LoginPage with shadcn/ui
echo "📝 Creating Login Page with shadcn/ui..."
cat > src/features/auth/pages/LoginPage.tsx << 'EOF'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, Lock, AlertCircle, Loader2, Zap } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(loginUser({ email: data.email, password: data.password }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <span className="text-2xl font-bold text-primary">P</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to your Proccura account</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`pl-10 pr-20 ${errors.password ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" size="lg" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="w-64 h-64 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="w-24 h-24 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Welcome to Proccura</h2>
          <p className="text-lg text-primary-foreground/90">Your procurement management platform</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
EOF

# Create App.tsx
echo "📝 Creating App component..."
cat > src/App.tsx << 'EOF'
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadUser, logoutUser } from '@/store/slices/authSlice';
import LoginPage from '@/features/auth/pages/LoginPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const handleLogout = () => {
    dispatch(logoutUser());
  };
  
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">Proccura Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.name || user?.email}
              </span>
              <Button onClick={handleLogout} variant="destructive" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Proccura! 🎉</CardTitle>
            <CardDescription>You've successfully logged in.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Start managing your procurement processes efficiently.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
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
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
EOF

echo ""
echo "✅ Frontend setup complete!"
echo ""
echo "🎉 Next steps:"
echo ""
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "🌐 App: http://localhost:5173"
echo "🔗 API: http://localhost:8000"
echo ""
echo "📦 TypeScript + shadcn/ui + Redux Toolkit configured!"
echo ""