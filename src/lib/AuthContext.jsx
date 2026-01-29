import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { supabase } from './supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Sync Clerk user with Supabase
  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded) return;
      
      if (!isSignedIn || !clerkUser) {
        setUser(null);
        setIsLoadingUser(false);
        return;
      }

      try {
        // Check if user exists in Supabase
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', clerkUser.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching user:', fetchError);
        }

        if (existingUser) {
          setUser(existingUser);
        } else {
          // Create new user in Supabase
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              clerk_id: clerkUser.id,
              email: clerkUser.primaryEmailAddress?.emailAddress,
              full_name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating user:', createError);
          } else {
            setUser(newUser);
          }
        }
      } catch (error) {
        console.error('Error syncing user:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, clerkUser]);

  const value = {
    user,
    clerkUser,
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded || isLoadingUser,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
