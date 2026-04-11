import { createContext, useContext, useEffect, useState } from 'react';
import { userStorage } from './storage';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await userStorage.get();
      setUser(userData);
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const value = {
    user,
    clerkUser: user, // For compatibility
    isAuthenticated: true, // Always authenticated in local mode
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
