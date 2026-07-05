const jsonHeaders = {
  'Content-Type': 'application/json',
};

const request = async (url, options = {}) => {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: isFormData
      ? { ...options.headers }
      : {
        ...jsonHeaders,
        ...options.headers,
      },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed.');
  }

  return data;
};

export const dashboardApi = {
  getStats: () => request('/api/dashboard/stats'),
  getOrders: (status = 'all') => request(`/api/orders${status && status !== 'all' ? `?status=${status}` : ''}`),
  getOrder: (id) => request(`/api/orders/${id}`),
  updateOrderStatus: (id, status) => request(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  getGroupedProducts: () => request('/api/products/grouped'),
  getCollections: () => request('/api/collections'),
  createCollection: (name) => request('/api/collections', {
    method: 'POST',
    body: JSON.stringify({ name }),
  }),
  updateCollection: (id, name) => request(`/api/collections/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  }),
  deleteCollection: (id) => request(`/api/collections/${id}`, {
    method: 'DELETE',
  }),
  reorderCollections: (orderedIds) => request('/api/collections/reorder', {
    method: 'PUT',
    body: JSON.stringify({ orderedIds }),
  }),
  createProduct: (formData) => request('/api/products', {
    method: 'POST',
    body: formData,
  }),
  updateProduct: (id, payload) => request(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  deleteProduct: (id) => request(`/api/products/${id}`, {
    method: 'DELETE',
  }),
  reorderProducts: (collectionId, orderedIds) => request('/api/products/reorder', {
    method: 'PUT',
    body: JSON.stringify({ collectionId, orderedIds }),
  }),
  getSubcollections: (collectionId) => request(`/api/collections/${collectionId}/subcollections`),
  createSubcollection: (collectionId, name) => request(`/api/collections/${collectionId}/subcollections`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  }),
  updateSubcollection: (collectionId, subcollectionId, name) => request(
    `/api/collections/${collectionId}/subcollections/${subcollectionId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ name }),
    },
  ),
  deleteSubcollection: (collectionId, subcollectionId) => request(
    `/api/collections/${collectionId}/subcollections/${subcollectionId}`,
    {
      method: 'DELETE',
    },
  ),
  reorderSubcollections: (collectionId, orderedIds) => request(
    `/api/collections/${collectionId}/subcollections/reorder`,
    {
      method: 'PUT',
      body: JSON.stringify({ orderedIds }),
    },
  ),
};
