// Server-side Supabase client for API routes
import { createClient } from "@supabase/supabase-js";

// Create a Supabase client with service role key for server-side operations
// This bypasses RLS but we'll implement our own security checks in API routes
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // This should be added to your .env.local
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper function to verify user authentication from request headers
export const getAuthenticatedUser = async (request) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null, error: "No authorization header" };
    }

    const token = authHeader.split(" ")[1];

    // Verify the JWT token using the client-side supabase instance
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { user: null, error: error?.message || "Invalid token" };
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};