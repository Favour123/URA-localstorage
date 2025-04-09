import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      // Query profiles table for users with role='admin'
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "admin");

      if (error) throw error;
      setAdmins(data || []);
    } catch (err) {
      console.error("Error fetching admins:", err);
      setError("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    try {
      setAddingAdmin(true);

      // First check if the profile already exists
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newAdminEmail)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" - this is expected if user doesn't exist yet
        throw profileError;
      }

      if (existingProfile) {
        // If profile exists, update the role to admin
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ role: "admin" })
          .eq("email", newAdminEmail);

        if (updateError) throw updateError;
      } else {
        // If user doesn't exist in profiles, show an error
        throw new Error(
          "User not found. They must sign up first before being made an admin."
        );
      }

      setNewAdminEmail("");
      fetchAdmins();
    } catch (err) {
      console.error("Error adding admin:", err);
      setError(err.message || "Failed to add admin");
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (email) => {
    if (!window.confirm("Are you sure you want to remove this admin?")) return;

    try {
      // Update profile to change role from 'admin' to 'user'
      const { error } = await supabase
        .from("profiles")
        .update({ role: "user" })
        .eq("email", email);

      if (error) throw error;

      fetchAdmins();
    } catch (err) {
      console.error("Error removing admin:", err);
      setError("Failed to remove admin");
    }
  };

  if (loading && admins.length === 0) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Manage Admins
          </h1>
          <div className="mt-4">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Admins</h1>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Add New Admin</h2>
            <form onSubmit={handleAddAdmin} className="mt-4 flex">
              <input
                type="email"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Admin Email Address"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={addingAdmin}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {addingAdmin ? "Adding..." : "Add Admin"}
              </button>
            </form>
          </div>

          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tag Number
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.name || admin.full_name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.tag_number || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveAdmin(admin.email)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No admins found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
