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
import DicomTestPage from "./components/DicomViewer/DicomTestPage";
import RegisterView from "./pages/RegisterView/RegisterView";
import TablePage from "./pages/TablePage/TablePage";
import AppointmentsTable from "./pages/TablePage/AppointmentsTable";
import CasesTablePage from "./pages/TablePage/CasesTable";
import LabTable from "./pages/TablePage/LabTestsTable";
import ExamTable from "./pages/TablePage/ExamTable";
import PhysioProgressTable from "./pages/TablePage/PhysioProgressTable";
import TestTablePage from "./pages/TablePage/test";
import LoginView from "./pages/LoginView/LoginView";
import ManagerDashboard from "./pages/ManagerDashboardView/ManagerDashboardView";
import PatientPortalView from "./pages/PatientPortalView/PatientPortalView";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
// import ExternalConsultationView from "./pages/ExternalView/ExternalConsultationView";

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

type PortalSearch = {
  view?: 'internal' | 'external' | 'consulting';
};

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
  path: "dicom/$patientId", 
  // path: "dicom", 
  component: DicomViewPage,
});

const physicianAppointmentRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "physician/Appointment",
  component: AppointmentsTable,
});

// Define the Appointment Route for Physio
const physioAppointmentRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "physio/Appointment",
  component: AppointmentsTable,
});

// Define the Appointment Route for Athlete
const athleteAppointmentRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "athlete/Appointment",
  component: AppointmentsTable,
});

const physicianCasesRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "physician/cases",
  component: CasesTablePage,
});

// Physio Cases
const physioCasesRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "physio/cases",
  component: CasesTablePage,
});

const physicianLabsRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "physician/labs",
  component: LabTable,
});

const physicianExamsRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "physician/exams",
  component: ExamTable,
});

const physioLabsRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "physio/labs",
  component: LabTable, 
});

const physioExamsRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "physio/exams",
  component: ExamTable, 
});

const physioProgressRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: '/physio/progress',
  component: PhysioProgressTable,
});

export const DicomTestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "dicom-test",
  component: DicomTestPage,
});

const athletePortalRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "athlete/portal",
  component: PatientPortalView,
validateSearch: (): PortalSearch => ({ view: 'internal' }),
});

const physicianConsultRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "physician/consult",
  component: PatientPortalView,
  validateSearch: (): PortalSearch => ({ view: 'consulting' }),
});

const physioConsultRoute = createRoute({
  getParentRoute: () => sidebarLayoutRoute,
  path: "physio/consult/$athelteId",
  component: PatientPortalView,
  validateSearch: (): PortalSearch => ({ view: 'consulting' }),
});
const athletePortalExternalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "athlete/portal/external/$token",
  component: PatientPortalView,
  validateSearch: (): PortalSearch => ({ view: 'external' }),
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

// const ExternalConsultationRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: "external/view/$token",
//   component: ExternalConsultationView,
// });

const ProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "profile",
  component: ProfilePage,
});



// 5. Build Tree
const routeTree = rootRoute.addChildren([
  sidebarLayoutRoute.addChildren([
    physicianViewRoute,
    athleteViewRoute,
    PhysiotherapistViewRoute,
    physicianAppointmentRoute,
    physioAppointmentRoute,
    athleteAppointmentRoute,
    physicianCasesRoute,
    physioCasesRoute,
    physicianLabsRoute,
    physicianExamsRoute,
    physioProgressRoute,
    physioLabsRoute,     
    physioExamsRoute,
    athletePortalRoute,
    physicianConsultRoute,
    physioConsultRoute,

    cases,
    ProfileRoute
  ]),
  CaseRoute,
  DicomRoute,
  DicomTestRoute,
  registerRoute,
  LoginRoute,
  ManagerRoute,
  // ExternalConsultationRoute,
  athletePortalExternalRoute,
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