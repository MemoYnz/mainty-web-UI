import { apiClient } from './apiClient';

// ---- Auth ----
export const getMe = () => apiClient.get('/api/auth/me');

// ---- WorkOrders ----
export const getWorkOrders = () => apiClient.get('/api/workorders');
export const getWorkOrderById = (id) => apiClient.get(`/api/workorders/${id}`);
export const createWorkOrder = (data) => apiClient.post('/api/workorders', data);

// export const setWorkOrderStatus = (id, data) =>
//   apiClient.post(`/api/workorders/${id}/status`, data); //

export function claimWorkOrder(id, engineerUserId) {
  // POST /api/workorders/{id}/claim?engineerUserId=2
  return apiClient.post(`/api/workorders/${id}/claim`, null, {
    params: { engineerUserId }
  });
}
// dashboard
export const getDashboardWorkOrders = (engineerUserId, take = 10) =>
  apiClient.get('/api/workorders/dashboard', { params: { engineerUserId, take } });


            // QA request
// export const requestQaTest = (id, data) =>
//   apiClient.post(`/api/workorders/${id}/qa-test`, data);

export function requestQaTest(id, data) {
  return apiClient.post(`/api/workorders/${id}/qa-test`, data);
}

export function setWorkOrderStatus(id, data) {
  return apiClient.post(`/api/workorders/${id}/status`, data);
}

export const approveQaTest = (workOrderId, data) =>
  apiClient.post(`/api/workorders/${workOrderId}/qa-test/approve`, data);

export const rejectQaTest = (workOrderId, data) =>
  apiClient.post(`/api/workorders/${workOrderId}/qa-test/reject`, data);



            //Assign Engineer
export const assignEngineer = (id, data) =>
  apiClient.post(`/api/workorders/${id}/assign`, data);

// ---- ShiftTasks ----
export const getShiftTasks = () => apiClient.get('/api/shifttasks');
export const getShiftTaskById = (id) => apiClient.get(`/api/shifttasks/${id}`);

// ---- PPM ----
export const getPpmPlans = () => apiClient.get('/api/ppm/plans');
export const getPpmPlanById = (id) => apiClient.get(`/api/ppm/plans/${id}`);
