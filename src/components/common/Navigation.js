import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                URA Learning
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-500 hover:border-primary-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Resources
              </Link>
              <Link
                to="/forum"
                className="border-transparent text-gray-500 hover:border-primary-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Forum
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/admin/profile"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profile
                </Link>
                <Link
                  to="/admin/upload"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Upload
                </Link>
                <Link
                  to="/admin/chats"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Manage Chats
                </Link>
                <Link
                  to="/admin/logs"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Access Logs
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin Login
              </Link>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className={`${isMobileMenuOpen ? "block" : "hidden"} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-500 hover:bg-gray-50 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
          >
            Resources
          </Link>
          <Link
            to="/forum"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-500 hover:bg-gray-50 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
          >
            Forum
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {user ? (
            <div className="space-y-1">
              <Link
                to="/admin/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:bg-gray-50 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              >
                Profile
              </Link>
              <Link
                to="/admin/upload"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:bg-gray-50 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              >
                Upload
              </Link>
              <Link
                to="/admin/chats"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:bg-gray-50 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              >
                Manage Chats
              </Link>
              <Link
                to="/admin/logs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:bg-gray-50 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              >
                Access Logs
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left text-gray-500 hover:bg-gray-50 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-500 hover:bg-gray-50 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
