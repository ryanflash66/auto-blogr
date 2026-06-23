import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
} from "@clerk/clerk-react";
import Layout from "../Layout.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Ideas from "../pages/Ideas.jsx";
import Posts from "../pages/Posts.jsx";
import WordPress from "../pages/WordPress.jsx";
import Profile from "../pages/Profile.jsx";
import LLMTest from "../pages/LLMTest.jsx";
import SimpleAIStatus from "@/components/testComponents/SimpleAIStatus";
import AIServiceStatus from "@/components/testComponents/AIServiceStatus";
import OpenRouterTest from "../pages/OpenRouterTest.jsx";
import DatabaseIntegrationTest from "../pages/DatabaseIntegrationTest.jsx";
import SupabaseDebug from "../pages/SupabaseDebug.jsx";
import SignIn from "../pages/SignIn.jsx";
import SignUp from "../pages/SignUp.jsx";

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 */
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

/**
 * PublicRoute Component
 * For auth pages that should redirect if already signed in
 */
const PublicRoute = ({ children }) => {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    window.location.href = "/dashboard";
    return null;
  }

  return children;
};

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public routes */}
        <Route
          path="/sign-in"
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />
        <Route
          path="/sign-up"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/ideas" element={<Ideas />} />
                  <Route path="/posts" element={<Posts />} />
                  <Route path="/wordpress" element={<WordPress />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route
                    path="/ai-service-status"
                    element={<AIServiceStatus />}
                  />
                  <Route path="/llm-test" element={<LLMTest />} />
                  <Route path="/openrouter-test" element={<OpenRouterTest />} />
                  <Route
                    path="/db-integration-test"
                    element={<DatabaseIntegrationTest />}
                  />
                  <Route path="/supabase-debug" element={<SupabaseDebug />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
