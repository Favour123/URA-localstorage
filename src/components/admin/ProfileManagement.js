import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";

export default function ProfileManagement() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: null,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    avatar_url: null,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Direct query to the profiles table - this works now that the RLS policies are fixed
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        // Set form data
        setFormData((prev) => ({
          ...prev,
          name: profileData?.name || user.user_metadata?.full_name || "",
          email: user.email || "",
          avatar_url: profileData?.avatar_url || null,
        }));

        // Set avatar URL if available
        if (profileData?.avatar_url) {
          setAvatarUrl(profileData.avatar_url);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setMessage({
          type: "error",
          text: "Failed to load profile data. Please try refreshing the page.",
        });
        // Set default values if profile load fails
        setFormData((prev) => ({
          ...prev,
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
          avatar_url: null,
        }));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage({
        type: "error",
        text: "You must be logged in to update your profile",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Validate password if changing
      if (
        formData.newPassword ||
        formData.confirmPassword ||
        formData.currentPassword
      ) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("New passwords don't match");
        }
        if (!formData.currentPassword) {
          throw new Error("Current password is required to change password");
        }
      }

      // Handle avatar upload first if there's a new avatar
      let avatarUrl = formData.avatar_url;
      if (formData.avatar) {
        try {
          const fileExt = formData.avatar.name.split(".").pop();
          const fileName = `${user.id}/avatar.${fileExt}`;

          // First, try to remove any existing avatar
          const { data: existingFiles } = await supabase.storage
            .from("avatars")
            .list(user.id);

          if (existingFiles && existingFiles.length > 0) {
            const filesToRemove = existingFiles.map(
              (file) => `${user.id}/${file.name}`
            );
            await supabase.storage.from("avatars").remove(filesToRemove);
          }

          // Upload new avatar
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, formData.avatar, {
              cacheControl: "3600",
              contentType: formData.avatar.type,
              upsert: true,
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw new Error("Failed to upload avatar");
          }

          // Get the public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(fileName);

          avatarUrl = publicUrl;
          setAvatarUrl(publicUrl);
        } catch (error) {
          console.error("Error uploading avatar:", error);
          throw error;
        }
      }

      // Update profile with the new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        throw new Error("Failed to update profile");
      }

      // If password change is requested
      if (formData.currentPassword && formData.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });

        if (passwordError) {
          console.error("Password update error:", passwordError);
          throw new Error("Failed to update password");
        }
      }

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        avatar: null, // Reset avatar after upload
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-medium text-gray-900">
              Profile Settings
            </h2>
          </div>

          {message.text && (
            <div
              className={`px-6 py-4 ${
                message.type === "success" ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <p
                className={`text-sm ${
                  message.type === "success" ? "text-green-700" : "text-red-700"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Avatar Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profile Photo
              </label>
              <div className="mt-2 flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      className="h-full w-full text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  Change
                  <input
                    id="avatar-upload"
                    name="avatar"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarChange}
                  />
                </label>
                {formData.avatar && (
                  <span className="text-sm text-gray-500">
                    {formData.avatar.name}
                  </span>
                )}
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Email Field (Readonly) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
              />
            </div>

            {/* Password Change Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Change Password
              </h3>

              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-5">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
