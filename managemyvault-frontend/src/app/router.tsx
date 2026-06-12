import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import AppShell from '../shared/components/layout/AppShell';
import LoginPage from '../features/auth/components/LoginPage';
import OrganizationsPage from '../features/organizations/components/OrganizationsPage';
import WorkspaceLayout from '../features/organizations/components/WorkspaceLayout';
import WorkspaceHome from '../features/organizations/components/WorkspaceHome';
import ComingSoon from '../features/organizations/components/ComingSoon';

// Sprint 2 Pages
import ContactsPage from '../features/organizations/components/workspace/ContactsPage';
import LocationsPage from '../features/organizations/components/workspace/LocationsPage';
import SiteSummary from '../features/organizations/components/workspace/SiteSummary';
import SiteSummaryLegacy from '../features/organizations/components/workspace/SiteSummaryLegacy';
import AfterHours from '../features/organizations/components/workspace/AfterHours';
import OnsiteInfo from '../features/organizations/components/workspace/OnsiteInfo';
import SiteSummaryV2 from '../features/organizations/components/workspace/SiteSummaryV2';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RedirectToWorkspace() {
  const { orgId } = useParams();
  return <Navigate to={`/org/${orgId}/home`} replace />;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <RequireAuth><AppShell /></RequireAuth>,
    children: [
      { index: true, element: <Navigate to="/organizations" replace /> },
      { path: 'organizations', element: <OrganizationsPage /> },
      { path: 'organizations/:orgId', element: <RedirectToWorkspace /> },
      {
        path: 'org/:orgId',
        element: <WorkspaceLayout />,
        children: [
          { index: true, element: <Navigate to="home" replace /> },
          { path: 'home', element: <WorkspaceHome /> },
          { path: 'contacts', element: <ContactsPage /> },
          { path: 'locations', element: <LocationsPage /> },
          { path: 'site-summary', element: <SiteSummary /> },
          { path: 'site-summary-legacy', element: <SiteSummaryLegacy /> },
          { path: 'after-hours', element: <AfterHours /> },
          { path: 'onsite-information', element: <OnsiteInfo /> },
          { path: 'testing/site-summary-v2', element: <SiteSummaryV2 /> },
          { path: '*', element: <ComingSoon /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
