import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import RequireAuth from './auth/RequireAuth';
import RequireRole from './auth/RequireRole';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkOrders from './pages/WorkOrders';
import ShiftTasks from './pages/ShiftTasks';
import PpmPlans from './pages/PpmPlans';
import NotFound from './pages/NotFound';
import WorkOrderDetails from './pages/WorkOrderDetails';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Dashboard />} />

          {/* ✅ List page: only Engineer / EngineeringManager / ProductionManager */}
          <Route
            path="/workorders"
            element={
              <RequireRole allow={['Engineer', 'EngineeringManager', 'ProductionManager']}>
                <WorkOrders />
              </RequireRole>
            }
          />

          {/* ✅ Details page: allowed for all MVP roles */}
          <Route path="/workorders/:id" element={<WorkOrderDetails />} />

          {/* ✅ ShiftTasks: only Engineer / EngineeringManager */}
          <Route
            path="/shifttasks"
            element={
              <RequireRole allow={['Engineer', 'EngineeringManager']}>
                <ShiftTasks />
              </RequireRole>
            }
          />

          {/* ✅ PPM: only Engineer / EngineeringManager */}
          <Route
            path="/ppm"
            element={
              <RequireRole allow={['Engineer', 'EngineeringManager']}>
                <PpmPlans />
              </RequireRole>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
