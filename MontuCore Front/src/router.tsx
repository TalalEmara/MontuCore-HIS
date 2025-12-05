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

const rootRoute = createRootRoute({
  component: RootLayout,
});

// eslint-disable-next-line react-refresh/only-export-components
function RootLayout() {
  return (
    <div>
      <h1>My App</h1>

      {/* nav bar should be here */}
      <nav style={{ display: "flex", gap: 8 }}>
        <Link to="/">Home</Link>
        <Link to="/physician">physician</Link>
        <Link to="/case">Case</Link>
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

const routeTree = rootRoute.addChildren([
  physicianViewRoute,
  CaseRoute,
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
