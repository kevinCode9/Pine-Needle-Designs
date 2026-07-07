const jsonHeaders = {
  'Content-Type': 'application/json',
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      ...jsonHeaders,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || data.message || 'Request failed.');
    error.status = response.status;
    throw error;
  }

  return data;
};

export const authApi = {
  getMe: () => request('/api/auth/me'),
  signInWithEmail: (email) => request('/api/auth/email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  logout: () => request('/api/auth/logout', {
    method: 'POST',
  }),
};
