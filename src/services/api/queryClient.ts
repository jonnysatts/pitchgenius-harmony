import { QueryClient } from "@tanstack/react-query";
import { API_CONFIG } from "./config";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: API_CONFIG.cache.ttl, // Use the centralized cache TTL from config
      retry: API_CONFIG.retry.maxRetries, // Match our retry configuration
      retryDelay: (attemptIndex) => Math.min(
        1000 * Math.pow(2, attemptIndex), // Exponential backoff
        30000 // Max 30 seconds
      ),
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true, // Fetch when reconnecting after being offline
      refetchOnMount: true, // Fetch when component mounts
    },
    mutations: {
      retry: 1, // Only retry mutations once
      retryDelay: 1000, // 1 second delay between mutation retries
    },
  },
});
