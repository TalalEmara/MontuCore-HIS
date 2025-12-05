import { createRootRoute, createRoute, createRouter, Link, Outlet, RouterProvider } from "@tanstack/react-router";
import PhysicianView from "./pages/PhysicianView";
import CaseView from "./pages/CaseView";
const rootRoute = createRootRoute({
  component: RootLayout,
});

// eslint-disable-next-line react-refresh/only-export-components
function RootLayout() {
  return (
    <div>
      <h1>My App</h1>
      
        {/* nav bar should be here  */}
      <nav style={{ display: 'flex', gap: 8 }}>
        <Link to="/">Home</Link>
        <Link to="/physician">physicain</Link>
        <Link to="/case">Case</Link>
      </nav>

      {/* Child routes render here */}
      <Outlet />
    </div>
  );
}
// top-level user Views
const physicianViewRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'physician',
    component: PhysicianView,
})
const CaseRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'Case',
    component: CaseView,
})


const routeTree = rootRoute.addChildren([
 physicianViewRoute,
    CaseRoute,
]);

// 4) Create router instance
export const router = createRouter({ routeTree });

// 5) Export a top-level App component using the router
export function AppRouter() {
  return <RouterProvider router={router} />;
}