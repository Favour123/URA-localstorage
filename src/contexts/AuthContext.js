import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
        setLoading(false);
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Auth error:", error);
        throw error;
      }

      // Since all accounts are created as admins, we don't need to check the role
      // Just verify the user exists and return the data
      if (!data?.user) {
        throw new Error("Invalid login credentials");
      }

      // Set the user in the context
      setUser(data.user);

      return data;
    } catch (error) {
      console.error("SignIn error:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin/profile`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signOut = () => supabase.auth.signOut();

  const signUpAdmin = async (email, password, fullName, tagNumber) => {
    try {
      // First create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            tag_number: tagNumber,
            role: "admin", // Set role directly in user metadata
          },
          emailRedirectTo: null, // Disable email verification
        },
      });

      if (error) throw error;

      // Create profile using the auth user's ID
      if (data?.user) {
        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: data.user.id,
                email: email,
                full_name: fullName,
                tag_number: tagNumber,
                avatar_url: null,
                role: "admin",
              },
            ]);

          if (profileError) {
            console.warn("Profile creation warning:", profileError);
          }
        } catch (profileError) {
          console.warn("Profile creation warning:", profileError);
        }
      }

      return { success: true, data };
    } catch (error) {
      console.error("SignUp error:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signOut,
    signInWithEmail,
    signInWithGoogle,
    signUpAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 

export function useAuth() {
  return useContext(AuthContext);
}
