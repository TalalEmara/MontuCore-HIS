//
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { useState } from "react";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import PhysicianView from "./pages/PhysicianView/PhysicianView";
import PhysiotherapistView from "./pages/PhysiotherapistView/PhysiotherapistView";
import CaseView from "./pages/CaseView/CaseView";
import AthleteView from "./pages/AthleteView/AthleteView";
import Sidebar from "./components/level-1/Sidebar/Sidebar";
import DicomViewPage from "./pages/DicomViewPage/DicomViewPage";
import RegisterView from "./pages/RegisterView/RegisterView";
import TablePage from "./pages/TablePage/TablePage";
import TestTablePage from "./pages/TablePage/test";
import LoginView from "./pages/LoginView/LoginView";
import ManagerDashboard from "./pages/ManagerDashboardView/ManagerDashboardView";
import ExternalConsultationView from "./pages/ExternalView/ExternalConsultationView";
// 1. The absolute root (No UI, just providers/outlet)
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// 2. The Layout for Dashboard pages (Contains Sidebar)
const sidebarLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'dashboard', // Logical grouping
  component: SidebarLayout,
});

// Moved the old RootLayout logic here
function SidebarLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="layout-container">
      <Sidebar onToggle={setIsSidebarOpen} />
      <div
        className={`main-content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
}

// 3. Child Routes for the Sidebar Layout
const physicianViewRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "physician",
  component: PhysicianView,
});
const PhysiotherapistViewRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "physio",
  component: PhysiotherapistView,
});

const athleteViewRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "athlete",
  component: AthleteView,
});
const cases = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "cases",
  component: TestTablePage,
});

// 4. Case Route (No Sidebar, Direct child of Root)
// Added $caseId parameter
export const CaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "cases/$caseId", 
  component: CaseView,
});

export const DicomRoute = createRoute({
  getParentRoute: () => rootRoute,
  // path: "dicom/$dicomId", 
  path: "dicom", 
  component: DicomViewPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "register",
  component: RegisterView,
});

const LoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  component: LoginView,
});

const ManagerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "manager",
  component: ManagerDashboard,
});

const ExternalConsultationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "external/view/$token",
  component: ExternalConsultationView,
});

// 5. Build Tree
const routeTree = rootRoute.addChildren([
  sidebarLayoutRoute.addChildren([
    physicianViewRoute,
    athleteViewRoute,
    PhysiotherapistViewRoute,
    cases,
  ]),
  CaseRoute,
  DicomRoute,
  registerRoute,
  LoginRoute,
  ManagerRoute,
  ExternalConsultationRoute,
]);


// eslint-disable-next-line react-refresh/only-export-components
export const router = createRouter({ routeTree });
const queryClient = new QueryClient();

export function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}/>
      <TanStackRouterDevtools router={router}/>
    </QueryClientProvider>
  );
}