
import { handleRequest } from './handlers/mainHandler.ts';

// Main Deno serve function 
Deno.serve(async (req) => {
  return await handleRequest(req);
});
