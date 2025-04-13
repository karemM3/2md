interface ApiRequestOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  headers?: Record<string, string>;
}

// Generic API request function
export async function apiRequest<T>({
  url,
  method,
  data,
  headers = {},
}: ApiRequestOptions): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // Include cookies for authentication
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  // For GET requests with data, convert to query params
  let endpoint = url;
  if (method === 'GET' && data) {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    endpoint += `?${params.toString()}`;
  }

  const response = await fetch(endpoint, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'An unknown error occurred',
    }));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return {} as T;
}
