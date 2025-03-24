import React, { createContext, useContext, useState, useEffect } from 'react';
import { initGoogleAuth, getGoogleAuth } from '../utils/googleAuth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initGoogleAuth()
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to initialize Google Auth:', error);
        setLoading(false);
      });
  }, []);

  // Mock user data
  const mockUsers = [
    {
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    }
  ];

  async function login(email, password) {
    setLoading(true);
    try {
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (user) {
        setCurrentUser({
          email: user.email,
          name: user.name,
          role: user.role
        });
        return true;
      }
      throw new Error('Invalid credentials');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle() {
    setLoading(true);
    try {
      const auth2 = getGoogleAuth();
      if (!auth2) {
        throw new Error('Google Auth not initialized');
      }

      const googleUser = await auth2.signIn();
      const profile = googleUser.getBasicProfile();
      
      setCurrentUser({
        email: profile.getEmail(),
        name: profile.getName(),
        role: 'admin', // You can set default role for Google users
        photoUrl: profile.getImageUrl()
      });
      
      return true;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    const auth2 = getGoogleAuth();
    if (auth2 && auth2.isSignedIn.get()) {
      auth2.signOut();
    }
    setCurrentUser(null);
  }

  const value = {
    currentUser,
    login,
    logout,
    loginWithGoogle,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 