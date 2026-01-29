import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { ClerkProvider, SignIn, SignUp, SignedIn, SignedOut } from '@clerk/clerk-react';
import { AuthProvider } from '@/lib/AuthContext';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : () => <div>No pages configured</div>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Auth pages without layout
const AuthPage = ({ mode }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
    {mode === 'sign-in' ? (
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    ) : (
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    )}
  </div>
);

const AuthenticatedApp = () => {
  return (
    <>
      <SignedOut>
        <Routes>
          <Route path="/sign-in/*" element={<AuthPage mode="sign-in" />} />
          <Route path="/sign-up/*" element={<AuthPage mode="sign-up" />} />
          <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </Routes>
      </SignedOut>
      
      <SignedIn>
        <AuthProvider>
          <Routes>
            <Route path="/sign-in/*" element={<Navigate to="/" replace />} />
            <Route path="/sign-up/*" element={<Navigate to="/" replace />} />
            <Route path="/" element={
              <LayoutWrapper currentPageName={mainPageKey}>
                <MainPage />
              </LayoutWrapper>
            } />
            {Object.entries(Pages).map(([path, Page]) => (
              <Route
                key={path}
                path={`/${path}`}
                element={
                  <LayoutWrapper currentPageName={path}>
                    <Page />
                  </LayoutWrapper>
                }
              />
            ))}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </AuthProvider>
      </SignedIn>
    </>
  );
};


function App() {
  if (!clerkPubKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Required</h1>
          <p className="text-gray-600 mb-4">
            Please set the <code className="bg-gray-200 px-2 py-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> environment variable.
          </p>
          <p className="text-sm text-gray-500">
            Get your key from the Clerk Dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  )
}

export default App
