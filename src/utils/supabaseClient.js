import { createClient } from "@supabase/supabase-js";

console.log("Environment Variables:", {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
});

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add this for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

export const resetAdminPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    "arowolovisuals@gmail.com",
    {
      redirectTo: `${window.location.origin}/admin/update-password`,
    }
  );

  if (error) throw error;
  return data;
};
