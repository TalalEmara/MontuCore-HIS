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
import CaseView from "./pages/CaseView/CaseView";
import AthleteView from "./pages/AthleteView/AthleteView";
import Sidebar from "./components/level-1/Sidebar/Sidebar";

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

const athleteViewRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "athlete",
  component: AthleteView,
});

// 4. Case Route (No Sidebar, Direct child of Root)
// Added $caseId parameter
export const CaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "case/$caseId", 
  component: CaseView,
});

// 5. Build Tree
const routeTree = rootRoute.addChildren([
  sidebarLayoutRoute.addChildren([
    physicianViewRoute, 
    athleteViewRoute
  ]),
  CaseRoute,
]);

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