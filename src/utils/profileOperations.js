import { supabase } from "./supabaseClient";

export const updateProfile = async (userId, updates) => {
  try {
    // Update profile in database
    const { error } = await supabase
      .from("profiles")
      .update({
        name: updates.name,
        avatar_url: updates.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Profile update error:", error);
      throw new Error("Failed to update profile");
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const getProfile = async (userId) => {
  try {
    // First check if profile exists
    let { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // If profile doesn't exist, create it
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        // Create a default profile
        const defaultProfile = {
          id: userId,
          email: userData.user.email,
          name: userData.user.user_metadata?.full_name || userData.user.email,
          role: "admin",
          avatar_url: null,
          updated_at: new Date().toISOString(),
        };

        // Try to insert the profile
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([defaultProfile])
          .select()
          .single();

        if (createError) {
          console.warn("Profile creation error:", createError);
          // Return the default profile even if creation fails
          return defaultProfile;
        }
        return newProfile;
      }
      // If we can't get user data, return a minimal profile
      return {
        id: userId,
        email: "",
        name: "",
        role: "admin",
        avatar_url: null,
        updated_at: new Date().toISOString(),
      };
    }

    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    // Return a minimal profile on error
    return {
      id: userId,
      email: "",
      name: "",
      role: "admin",
      avatar_url: null,
      updated_at: new Date().toISOString(),
    };
  }
};
