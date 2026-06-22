// Replaced localhost with your machine's Wi-Fi IP address so the phone can connect
export const API_URL = 'http://192.168.1.22:3000/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error: ${response.status} ${errorBody}`);
  }

  // Handle empty responses (like 204 No Content for deletes)
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
