// Clerk-Supabase Context Provider
import React, { createContext, useContext, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { supabaseService } from "../services/supabaseService.js";

const ClerkSupabaseContext = createContext();

/**
 * Provider component that manages Clerk-Supabase integration
 */
export function ClerkSupabaseProvider({ children }) {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const syncClerkWithSupabase = async () => {
      if (isSignedIn && user) {
        try {
          // Get Clerk JWT token
          const token = await getToken({ template: "supabase" });

          if (token) {
            // Set token in supabaseService for RLS
            supabaseService.setClerkToken(token);
            console.log("✅ Clerk token synced with Supabase");
          }
        } catch (error) {
          console.error("❌ Error syncing Clerk with Supabase:", error);
        }
      } else {
        // Clear token when user signs out
        supabaseService.clearClerkToken();
        console.log("🔄 Cleared Supabase authentication");
      }
    };

    syncClerkWithSupabase();
  }, [isSignedIn, user, getToken]);

  return (
    <ClerkSupabaseContext.Provider value={{ user, isSignedIn }}>
      {children}
    </ClerkSupabaseContext.Provider>
  );
}

/**
 * Hook to use Clerk-Supabase context
 */
export function useClerkSupabaseContext() {
  const context = useContext(ClerkSupabaseContext);
  if (!context) {
    throw new Error(
      "useClerkSupabaseContext must be used within ClerkSupabaseProvider"
    );
  }
  return context;
}

export default ClerkSupabaseProvider;
