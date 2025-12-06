import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider
} from "@tanstack/react-router";

import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import PhysicianView from "./pages/PhysicianView/PhysicianView";
import CaseView from "./pages/CaseView/CaseView";
import AthleteView from "./pages/AthleteView/AthleteView";

const rootRoute = createRootRoute({
  component: RootLayout,
});

// eslint-disable-next-line react-refresh/only-export-components
function RootLayout() {
  return (
    <div>
   

      {/* nav bar should be here */}
      <nav style={{ display: "flex", gap: 8 }}>
        <Link to="/">Home</Link>
        <Link to="/physician">physician</Link>
        <Link to="/case">Case</Link>
        <Link to="/athlete-viewer">Athlete Viewer</Link>
      </nav>

      <Outlet />
    </div>
  );
}

const physicianViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "physician",
  component: PhysicianView,
});

const CaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "case",
  component: CaseView,
});

const athleteViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/athlete-viewer",
  component: AthleteView,
});

const routeTree = rootRoute.addChildren([
  physicianViewRoute,
  CaseRoute,
  athleteViewRoute
]);

// eslint-disable-next-line react-refresh/only-export-components
export const router = createRouter({ routeTree });

export function AppRouter() {
  return (
    <>
      <RouterProvider router={router}/>
      <TanStackRouterDevtools router={router}/>
    </>
  );
}
