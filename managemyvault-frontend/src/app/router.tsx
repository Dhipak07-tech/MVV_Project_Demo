import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from '../shared/components/layout/AppShell';
import LoginPage from '../features/auth/components/LoginPage';
import OrganizationsPage from '../features/organizations/components/OrganizationsPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <RequireAuth><AppShell /></RequireAuth>,
    children: [
      { index: true, element: <Navigate to="/organizations" replace /> },
      { path: 'organizations', element: <OrganizationsPage /> },
      { path: 'organizations/:orgId', element: <div className="p-8 text-text-primary">Organization Workspace — Coming in Phase 2</div> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
