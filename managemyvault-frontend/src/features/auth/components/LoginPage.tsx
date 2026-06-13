import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Eye, EyeOff, Lock, Mail, AlertCircle,
  Zap, Crown, ShieldCheck, Wrench, BookOpen, UserCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../organizations/store/organizationStore';
import type { UserInfo } from '../../organizations/types/organization.types';
import ThemeToggle from '../../../shared/components/ThemeToggle';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ============================================
// Demo Users — Quick Access Login
// ============================================

interface DemoUser {
  email: string;
  password: string;
  fullName: string;
  role: string;
  label: string;
  description: string;
  icon: typeof Crown;
  color: string;
  bgColor: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    email: 'ultra@managemyvault.com',
    password: 'Admin@123',
    fullName: 'Ultra Admin',
    role: 'ULTRA_SUPER_ADMIN',
    label: 'Ultra Super Admin',
    description: 'Full control — grant/revoke all access',
    icon: Crown,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10 border-amber-400/30 hover:border-amber-400/60',
  },
  {
    email: 'super@managemyvault.com',
    password: 'Admin@123',
    fullName: 'Super Admin',
    role: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Manage organizations & system config',
    icon: ShieldCheck,
    color: 'text-brand-primary',
    bgColor: 'bg-brand-primary/10 border-brand-primary/30 hover:border-brand-primary/60',
  },
  {
    email: 'orgadmin@acme.com',
    password: 'Admin@123',
    fullName: 'Org Administrator',
    role: 'ORG_ADMIN',
    label: 'Org Admin',
    description: 'Manage a single organization',
    icon: Shield,
    color: 'text-brand-accent',
    bgColor: 'bg-brand-accent/10 border-brand-accent/30 hover:border-brand-accent/60',
  },
  {
    email: 'tech@acme.com',
    password: 'Admin@123',
    fullName: 'Tech User',
    role: 'TECHNICIAN',
    label: 'Technician',
    description: 'Manage assets, passwords & docs',
    icon: Wrench,
    color: 'text-status-success',
    bgColor: 'bg-status-success/10 border-status-success/30 hover:border-status-success/60',
  },
  {
    email: 'auditor@acme.com',
    password: 'Admin@123',
    fullName: 'Auditor',
    role: 'AUDITOR',
    label: 'Auditor',
    description: 'Read-only audit & compliance view',
    icon: BookOpen,
    color: 'text-brand-secondary',
    bgColor: 'bg-brand-secondary/10 border-brand-secondary/30 hover:border-brand-secondary/60',
  },
  {
    email: 'viewer@acme.com',
    password: 'Admin@123',
    fullName: 'Read-Only User',
    role: 'READ_ONLY',
    label: 'Read Only',
    description: 'View-only access to assigned orgs',
    icon: UserCircle,
    color: 'text-text-secondary',
    bgColor: 'bg-vault-elevated border-border-default hover:border-border-accent',
  },
];

/**
 * Perform a demo login without hitting the backend.
 * Generates a mock JWT-like token and user info.
 */
function createDemoAuth(demoUser: DemoUser): { accessToken: string; refreshToken: string; user: UserInfo } {
  // Create a mock base64 token (not a real JWT, just for demo purposes)
  const header = btoa(JSON.stringify({ alg: 'HS512', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: crypto.randomUUID(),
    email: demoUser.email,
    name: demoUser.fullName,
    role: demoUser.role,
    iss: 'managemyvault-demo',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
  }));
  const signature = btoa('demo-signature');
  const mockToken = `${header}.${payload}.${signature}`;

  return {
    accessToken: mockToken,
    refreshToken: `refresh-${mockToken}`,
    user: {
      id: crypto.randomUUID(),
      email: demoUser.email,
      fullName: demoUser.fullName,
      role: demoUser.role,
      organizationId: demoUser.role.startsWith('ORG_') || ['TECHNICIAN', 'AUDITOR', 'READ_ONLY'].includes(demoUser.role)
        ? 'b0000000-0000-0000-0000-000000000001'
        : undefined,
    },
  };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Standard form login — tries the backend first, falls back to demo.
   */
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    // Check if the entered credentials match a demo user
    const demoUser = DEMO_USERS.find(u => u.email === data.email && u.password === data.password);

    if (demoUser) {
      // Demo login — no backend required
      await new Promise(resolve => setTimeout(resolve, 600)); // simulate delay
      const auth = createDemoAuth(demoUser);
      localStorage.setItem('demoMode', 'true');
      setAuth(auth.accessToken, auth.refreshToken, auth.user);
      navigate('/dashboard');
      setIsLoading(false);
      return;
    }

    // Try real backend
    try {
      const { authApi } = await import('../../organizations/api/organizationApi');
      const response = await authApi.login(data);
      localStorage.removeItem('demoMode');
      setAuth(response.accessToken, response.refreshToken, response.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string }; status?: number } };
        if (axiosErr.response?.status === 401) {
          setError('Invalid email or password');
        } else {
          setError(axiosErr.response?.data?.detail || 'Authentication failed');
        }
      } else {
        // Backend unreachable — try demo login with any matching email
        const fallbackUser = DEMO_USERS.find(u => u.email === data.email);
        if (fallbackUser) {
          const auth = createDemoAuth(fallbackUser);
          localStorage.setItem('demoMode', 'true');
          setAuth(auth.accessToken, auth.refreshToken, auth.user);
          navigate('/dashboard');
          return;
        }
        setError('Backend unavailable. Use a Quick Access role to demo the application.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Quick access — instant demo login by clicking a role card.
   */
  const handleQuickLogin = async (demoUser: DemoUser) => {
    setQuickLoginLoading(demoUser.role);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    const auth = createDemoAuth(demoUser);
    localStorage.setItem('demoMode', 'true');
    setAuth(auth.accessToken, auth.refreshToken, auth.user);
    navigate('/dashboard');
  };

  /**
   * Fill form with demo credentials on click.
   */
  const fillCredentials = (demoUser: DemoUser) => {
    setValue('email', demoUser.email);
    setValue('password', demoUser.password);
  };

  return (
    <div className="min-h-screen bg-vault-base flex items-center justify-center p-4">
      {/* Floating Theme Toggle */}
      <div className="fixed top-4 right-4 z-50 bg-vault-card/80 backdrop-blur border border-border-subtle rounded-xl p-1 shadow-lg">
        <ThemeToggle />
      </div>

      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[900px] relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary mb-4 shadow-glow-blue"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-text-primary">ManageMyVault</h1>
          <p className="text-text-secondary mt-1">
            Enterprise Vault Management Platform
          </p>
        </div>

        {/* Main Content: Login + Quick Access side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Login Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-8"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-6">Sign in to your account</h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-status-danger/10 border border-status-danger/30 text-status-danger text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className="input-field pl-10"
                    placeholder="admin@managemyvault.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-status-danger">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password')}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-status-danger">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
                id="sign-in-btn"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-border-subtle text-center">
              <p className="text-xs text-text-muted">
                Click any <span className="text-brand-accent">Quick Access</span> role to demo instantly
              </p>
            </div>
          </motion.div>

          {/* Right: Quick Access Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-8"
          >
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-accent/10 mb-3">
                <Zap className="w-5 h-5 text-brand-accent" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">Quick Access</h2>
              <p className="text-xs text-text-secondary mt-1">
                Select a role to sign in instantly
              </p>
            </div>

            <div className="space-y-2.5">
              {DEMO_USERS.map((user, index) => (
                <motion.button
                  key={user.role}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.07 }}
                  onClick={() => handleQuickLogin(user)}
                  onDoubleClick={() => fillCredentials(user)}
                  disabled={quickLoginLoading !== null}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left group ${user.bgColor} ${
                    quickLoginLoading === user.role ? 'opacity-70' : ''
                  }`}
                  id={`quick-access-${user.role.toLowerCase().replace('_', '-')}`}
                >
                  <div className={`flex-shrink-0 ${user.color}`}>
                    <user.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${user.color}`}>
                      {user.label}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {user.description}
                    </p>
                  </div>
                  {quickLoginLoading === user.role ? (
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin flex-shrink-0" />
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted">
                      →
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            <p className="text-[11px] text-text-muted text-center mt-4">
              Quick access validates through your secure demo credentials.
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          © {new Date().getFullYear()} ManageMyVault. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
