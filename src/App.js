import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/routes/PrivateRoute";
import LocationRestriction from "./components/common/LocationRestriction";
import LandingPage from "./components/user/LandingPage";
import ResourceDetail from "./components/user/ResourceDetail";
import ResourceCategory from "./components/user/ResourceCategory";
import Forum from "./components/user/Forum";
import ResourceUpload from "./components/admin/ResourceUpload";
import ManageChats from "./components/admin/ManageChats";
import ProfileManagement from "./components/admin/ProfileManagement";
import AccessLogs from "./components/admin/AccessLogs";
import Navigation from "./components/common/Navigation";
import Login from "./components/auth/Login";
import AdminSignup from "./components/auth/AdminSignup";
import AskQuestion from "./components/user/AskQuestion";
import QuestionDetail from "./components/user/QuestionDetail";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            {/* Public Routes - Location Restricted */}
            <Route
              path="/"
              element={
                <LocationRestriction>
                  <LandingPage />
                </LocationRestriction>
              }
            />
            <Route
              path="/resource/:id"
              element={
                <LocationRestriction>
                  <ResourceDetail />
                </LocationRestriction>
              }
            />
            <Route
              path="/resources/:categoryId"
              element={
                <LocationRestriction>
                  <ResourceCategory />
                </LocationRestriction>
              }
            />
            <Route
              path="/forum"
              element={
                <LocationRestriction>
                  <Forum />
                </LocationRestriction>
              }
            />
            <Route path="/forum/ask" element={<AskQuestion />} />
            <Route path="/forum/question/:id" element={<QuestionDetail />} />

            {/* Admin Routes - Not Location Restricted */}
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin/upload"
              element={
                <PrivateRoute>
                  <ResourceUpload />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/chats"
              element={
                <PrivateRoute>
                  <ManageChats />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <PrivateRoute>
                  <ProfileManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <PrivateRoute>
                  <AccessLogs />
                </PrivateRoute>
              }
            />
            <Route path="/admin/signup" element={<AdminSignup />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
