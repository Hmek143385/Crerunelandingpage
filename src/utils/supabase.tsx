import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";

// Re-export for convenience
export { projectId, publicAnonKey } from "/utils/supabase/info";

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-07afcff5`;

// Helper to get access token
export const getAccessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || publicAnonKey;
};

// Helper to make authenticated requests
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAccessToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};