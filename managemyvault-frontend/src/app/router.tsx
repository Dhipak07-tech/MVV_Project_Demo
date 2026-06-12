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

// Sprint 3 Pages
import PasswordsPage from '../features/organizations/components/workspace/docs/PasswordsPage';
import DocumentsPage from '../features/organizations/components/workspace/docs/DocumentsPage';
import ExceptionsLog from '../features/organizations/components/workspace/docs/ExceptionsLog';
import TrackersPage from '../features/organizations/components/workspace/docs/TrackersPage';
import NetworksAndMfaPage from '../features/organizations/components/workspace/docs/NetworksAndMfaPage';

// Sprint 4 Pages
import AssetsPage from '../features/organizations/components/workspace/assets/AssetsPage';
import NetworkingPage from '../features/organizations/components/workspace/networking/NetworkingPage';

// Sprint 5 Pages
import AppsPage from '../features/organizations/components/workspace/apps/AppsPage';
import BackupsPage from '../features/organizations/components/workspace/backups/BackupsPage';

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
          
          // Core Documentation (Sprint 3)
          { path: 'passwords', element: <PasswordsPage /> },
          { path: 'docs/documents', element: <DocumentsPage /> },
          { path: 'docs/configurations', element: <DocumentsPage /> },
          { path: 'docs/standards-exceptions', element: <ExceptionsLog mode="standards" /> },
          { path: 'docs/contract-exceptions', element: <ExceptionsLog mode="contract" /> },
          { path: 'docs/rfc', element: <ExceptionsLog mode="rfc" /> },
          { path: 'docs/change-log', element: <ExceptionsLog mode="change" /> },
          { path: 'docs/ssl-tracker', element: <TrackersPage mode="ssl" /> },
          { path: 'docs/domain-tracker', element: <TrackersPage mode="domain" /> },
          { path: 'docs/networks', element: <NetworksAndMfaPage mode="networks" /> },
          { path: 'docs/mfa', element: <NetworksAndMfaPage mode="mfa" /> },
          { path: 'docs/known-issues', element: <NetworksAndMfaPage mode="known-issues" /> },
          { path: 'docs/maintenance-windows', element: <NetworksAndMfaPage mode="maintenance" /> },
          
          // Hardware Assets (Sprint 4)
          { path: 'assets/:assetType', element: <AssetsPage /> },

          // Networking Assets (Sprint 4)
          { path: 'networking/:netType', element: <NetworkingPage /> },

          // Apps & Services (Sprint 5)
          { path: 'apps/:appType', element: <AppsPage /> },

          // Backup Solutions (Sprint 5)
          { path: 'backups/:backupType', element: <BackupsPage /> },

          { path: '*', element: <ComingSoon /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
