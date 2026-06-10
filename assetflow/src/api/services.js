import api from './client'

export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
}

export const assetAPI = {
  getAll:  (params) => api.get('/assets', { params }),
  getById: (id)     => api.get(`/assets/${id}`),
  create:  (data)   => api.post('/assets', data),
  update:  (id, d)  => api.put(`/assets/${id}`, d),
  delete:  (id)     => api.delete(`/assets/${id}`),
}

export const bookingAPI = {
  getAll:  (params) => api.get('/bookings', { params }),
  getMine: ()       => api.get('/bookings/mine'),
  create:  (data)   => api.post('/bookings', data),
  approve: (id)     => api.patch(`/bookings/${id}/approve`),
  reject:  (id, d)  => api.patch(`/bookings/${id}/reject`, d),
  issue:   (id)     => api.patch(`/bookings/${id}/issue`),
  return:  (id)     => api.patch(`/bookings/${id}/return`),
}