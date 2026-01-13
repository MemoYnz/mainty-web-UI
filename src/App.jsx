import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import RequireAuth from './auth/RequireAuth';

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
          <Route path="/workorders" element={<WorkOrders />} />
          <Route path="/workorders/:id" element={<WorkOrderDetails />} />
          <Route path="/shifttasks" element={<ShiftTasks />} />
          <Route path="/ppm" element={<PpmPlans />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
