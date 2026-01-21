import { apiClient } from './apiClient';

// ---- Auth ----
export const login = (email, password) =>
  apiClient.post('/api/auth/login', { email, password });

export const getMe = () => apiClient.get('/api/auth/me');

// ---- WorkOrders ----
export const getWorkOrders = (params) => apiClient.get('/api/workorders', { params });
export const getWorkOrderById = (id) => apiClient.get(`/api/workorders/${id}`);
export const createWorkOrder = (data) => apiClient.post('/api/workorders', data);

export const getOpenWorkOrders = (take = 200) =>
  apiClient.get('/api/workorders/open', { params: { take } });

export const getOpenQaRequests = (take = 10) =>
  apiClient.get('/api/workorders/qa-requests', { params: { take } });

export function claimWorkOrder(id, engineerUserId) {
  return apiClient.post(`/api/workorders/${id}/claim`, null, { params: { engineerUserId } });
}

export const getDashboardWorkOrders = (engineerUserId, take = 10) =>
  apiClient.get('/api/workorders/dashboard', { params: { engineerUserId, take } });

export const getDashboard = (take = 10) =>
  apiClient.get('/api/dashboard', { params: { take } });

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

export const assignEngineer = (id, data) =>
  apiClient.post(`/api/workorders/${id}/assign`, data);

// ---- ShiftTasks ----
export const getShiftTasks = () => apiClient.get('/api/shifttasks');
export const getShiftTaskById = (id) => apiClient.get(`/api/shifttasks/${id}`);

// ---- PPM ----
// NOTE: Your backend routes look like /api/ppms/... (not /api/ppm/...).
// Keep these only if your backend actually has /api/ppm. Otherwise rename.
export const getPpmPlans = () => apiClient.get('/api/ppms/plans');
export const getPpmPlanById = (id) => apiClient.get(`/api/ppms/plans/${id}`);






// import { apiClient } from './apiClient';

// // ---- Auth ----
// export const getMe = () => apiClient.get('/api/auth/me');

// // ---- Dashboard (role-based) ----
// export const getDashboard = (take = 10) =>
//   apiClient.get('/api/dashboard', { params: { take } });

// // ---- WorkOrders ----
// export const getWorkOrders = (params) => apiClient.get('/api/workorders', { params });
// export const getWorkOrderById = (id) => apiClient.get(`/api/workorders/${id}`);
// export const createWorkOrder = (data) => apiClient.post('/api/workorders', data);

// export const getOpenWorkOrders = (take = 200) =>
//   apiClient.get('/api/workorders/open', { params: { take } });

// export const getOpenQaRequests = (take = 10) =>
//   apiClient.get('/api/workorders/qa-requests', { params: { take } });

// export function claimWorkOrder(id, engineerUserId) {
//   // POST /api/workorders/{id}/claim?engineerUserId=2
//   return apiClient.post(`/api/workorders/${id}/claim`, null, {
//     params: { engineerUserId }
//   });
// }

// export function setWorkOrderStatus(id, data) {
//   // POST /api/workorders/{id}/status
//   return apiClient.post(`/api/workorders/${id}/status`, data);
// }

// export function requestQaTest(id, data) {
//   // POST /api/workorders/{id}/qa-test
//   return apiClient.post(`/api/workorders/${id}/qa-test`, data);
// }

// export const approveQaTest = (workOrderId, data) =>
//   apiClient.post(`/api/workorders/${workOrderId}/qa-test/approve`, data);

// export const rejectQaTest = (workOrderId, data) =>
//   apiClient.post(`/api/workorders/${workOrderId}/qa-test/reject`, data);

// export const assignEngineer = (id, data) =>
//   apiClient.post(`/api/workorders/${id}/assign`, data);

// // ---- ShiftTasks ----
// export const getShiftTasks = () => apiClient.get('/api/shifttasks');
// export const getShiftTaskById = (id) => apiClient.get(`/api/shifttasks/${id}`);

// // ---- PPM ----
// // IMPORTANT: backend routes are /api/ppms/... (not /api/ppm/...)
// export const getPpmPlans = () => apiClient.get('/api/ppms/plans');
// export const getPpmPlanById = (id) => apiClient.get(`/api/ppms/plans/${id}`);
